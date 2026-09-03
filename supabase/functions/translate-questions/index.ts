/**
 * Translates queued questions into the app's five non-English locales.
 *
 * Invoked by `cron_run_translations` every five minutes, and only when the
 * queue has something in it. One batch per invocation; the cron tick is the
 * loop, so a run that dies takes one batch with it rather than a whole
 * backfill.
 *
 * ── Why this lives here and not on Vercel ─────────────────────────────────
 * A worker needs a privileged, non-interactive credential. Supabase injects
 * SUPABASE_SERVICE_ROLE_KEY into an edge function's environment; putting the
 * worker on Vercel would have meant copying that key into a second place, and
 * a service-role key in a web app's environment is a much larger blast radius
 * than one in the function that already runs as the database's owner.
 *
 * ── The prompt is the safety mechanism, and it is not the only one ────────
 * Translations publish without human review — the owner's decision, made
 * knowing the trade. So the model is told, in the strongest terms the format
 * allows, the two things that would make a question mis-grade: changing the
 * number of options, and rendering two distinct rulings with the same word.
 * `complete_translation` then checks both again in the database and refuses
 * the write if either happened. The prompt is a request; the check is the
 * guarantee.
 *
 * The choices array is translated *positionally*. `correct_choice_index`
 * points at a slot, not at a string, so option 3 must still be option 3 in
 * Hausa or a correct answer is graded wrong.
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const LOCALE_NAMES: Record<string, string> = {
  ha: "Hausa",
  fr: "French",
  ar: "Arabic",
  id: "Indonesian (Bahasa Indonesia)",
  ms: "Malay (Bahasa Melayu)",
};

interface QueueRow {
  o_question_id: string;
  o_locale: string;
  o_text: string;
  o_choices: string[];
  o_explanation: string | null;
}

function buildPrompt(row: QueueRow, languageName: string): string {
  return [
    `You are translating one multiple-choice question for an Islamic knowledge`,
    `quiz from English into ${languageName}.`,
    ``,
    `RULES, in order of importance:`,
    ``,
    `1. Return EXACTLY ${row.o_choices.length} choices, in the SAME ORDER as`,
    `   the English. The correct answer is identified by its position, so`,
    `   reordering or dropping one marks a correct answer as wrong.`,
    `2. No two choices may mean the same thing in ${languageName}. Where the`,
    `   English distinguishes two rulings or two categories — fard and sunnah,`,
    `   for instance — the translation must keep them distinguishable, even if`,
    `   that needs a longer phrase. Two identical-sounding options leave the`,
    `   player no correct answer to choose.`,
    `3. Keep established Islamic terms in their usual ${languageName} form.`,
    `   Do not translate proper nouns, the names of Allah, Qur'anic surah`,
    `   names, or the names of narrators and scholars. Transliterate rather`,
    `   than invent.`,
    `4. Do not add, remove or "correct" any religious content. You are`,
    `   translating, not teaching. If the English says something you would`,
    `   phrase differently, translate what it says.`,
    `5. Keep the register plain and readable for a learner, matching the`,
    `   English.`,
    ``,
    `Return ONLY minified JSON, no markdown fence, of the shape:`,
    `{"question":"...","choices":["...", "..."],"explanation":"..."}`,
    row.o_explanation ? `` : `Omit "explanation"; the English has none.`,
    ``,
    `ENGLISH QUESTION:`,
    row.o_text,
    ``,
    `ENGLISH CHOICES (keep this order):`,
    ...row.o_choices.map((c, i) => `${i + 1}. ${c}`),
    row.o_explanation ? `\nENGLISH EXPLANATION:\n${row.o_explanation}` : ``,
  ].join("\n");
}

/** Strips a ```json fence if the model adds one despite being asked not to. */
function parseModelJson(raw: string): { question: string; choices: string[]; explanation?: string } {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

/**
 * The model, overridable without a redeploy.
 *
 * Hardcoding it cost a batch: `gemini-2.0-flash` was retired, and every call
 * came back `404 ... is no longer available`. The queue handled that correctly
 * — five rows went back to `queued` with the reason recorded rather than being
 * lost — but fixing it still meant shipping code. Reading the name from the
 * environment means the next retirement is a dashboard edit.
 */
const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.6-flash";

async function translate(row: QueueRow, apiKey: string) {
  const languageName = LOCALE_NAMES[row.o_locale] ?? row.o_locale;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(row, languageName) }] }],
        generationConfig: {
          // Deterministic-ish. A translation that changes between runs would
          // make a player's review history disagree with what they answered.
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`model returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }

  const body = await res.json();
  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") throw new Error("model returned no text");

  const parsed = parseModelJson(text);
  if (!parsed || typeof parsed.question !== "string" || !Array.isArray(parsed.choices)) {
    throw new Error("model returned an unexpected shape");
  }
  return parsed;
}

Deno.serve(async (req) => {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const apiKey = Deno.env.get("GEMINI_API_KEY");

  if (!url || !serviceKey) {
    return new Response(JSON.stringify({ error: "supabase env missing" }), { status: 500 });
  }
  if (!apiKey) {
    // Named plainly so the admin page can say what is wrong rather than
    // showing a queue that mysteriously never drains.
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY is not set on this function" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  let limit = 20;
  try {
    const body = await req.json();
    if (typeof body?.limit === "number") limit = body.limit;
  } catch {
    /* an empty body is fine; the default stands */
  }

  const supabase = createClient(url, serviceKey);

  const { data: batch, error: claimError } = await supabase.rpc("claim_translation_batch", {
    p_limit: limit,
  });
  if (claimError) {
    return new Response(JSON.stringify({ error: claimError.message }), { status: 500 });
  }

  const rows = (batch ?? []) as QueueRow[];
  let written = 0;
  let refused = 0;
  let failed = 0;
  let released = 0;

  /**
   * Stop before the runtime stops us.
   *
   * An edge function has a wall clock, and one translation measured at roughly
   * forty seconds — so the first real batch of five was killed partway through
   * its fifth item. The HTTP response never arrived, and that row sat `claimed`
   * until the ten-minute reclaim swept it up.
   *
   * Finishing early and handing the rest back is strictly better: the work is
   * queued again immediately, and `release_translation_claim` gives back the
   * attempt that claiming spent, so a row the model never actually saw cannot
   * be marked failed for it.
   */
  const deadline = Date.now() + 110_000;

  // Sequential on purpose. Firing twenty concurrent model calls is the fastest
  // way to hit a rate limit and turn a whole batch into retries; the cron tick
  // supplies the throughput instead.
  for (const row of rows) {
    if (Date.now() > deadline) {
      await supabase.rpc("release_translation_claim", {
        p_question_id: row.o_question_id,
        p_locale: row.o_locale,
      });
      released += 1;
      continue;
    }
    try {
      const out = await translate(row, apiKey);
      const { data, error } = await supabase.rpc("complete_translation", {
        p_question_id: row.o_question_id,
        p_locale: row.o_locale,
        p_text: out.question,
        p_choices: out.choices,
        p_explanation: out.explanation ?? null,
      });
      if (error) throw new Error(error.message);
      const result = Array.isArray(data) ? data[0] : data;
      if (result?.o_success) written += 1;
      else refused += 1;
    } catch (e) {
      failed += 1;
      await supabase.rpc("complete_translation", {
        p_question_id: row.o_question_id,
        p_locale: row.o_locale,
        p_text: null,
        p_choices: null,
        p_error: String((e as Error).message ?? e).slice(0, 500),
      });
    }
  }

  return new Response(
    JSON.stringify({ claimed: rows.length, written, refused, failed, released }),
    { headers: { "Content-Type": "application/json" } },
  );
});
