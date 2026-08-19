/**
 * Outbound alert to whoever moderates.
 *
 * Deliberately dependency-free: a POST to Resend's REST API rather than an SDK,
 * so wiring this up is two environment variables and no package to keep
 * updated. Unset, `notifyModeratorsOfReport` returns without doing anything, and
 * the in-app badge from migration 0015 carries the whole feature on its own.
 *
 *   RESEND_API_KEY          enables the channel
 *   MODERATION_ALERT_EMAIL  where alerts go (comma-separate for several)
 *   MODERATION_ALERT_FROM   optional; defaults to Resend's shared sender
 *   NEXT_PUBLIC_SITE_URL    optional; makes the queue link absolute
 *
 * Only imported from a "use server" module. There is no `server-only` guard
 * because adding one would mean adding a package; the key is safe regardless,
 * since Next.js only inlines env vars prefixed NEXT_PUBLIC_ into client
 * bundles and RESEND_API_KEY is not one of those.
 *
 * TWO RULES THIS FILE KEEPS
 *
 * 1. A failed send never fails the report. The reporter's action is done the
 *    moment the row is written; email is a courtesy on top. Everything here is
 *    wrapped and swallowed, and the caller does not await the result.
 *
 * 2. The reported text is not in the email. Someone reports a post because it
 *    is abusive or wrong — forwarding it to an inbox spreads it further and
 *    puts it somewhere with no moderation controls at all. The alert carries
 *    what kind of thing it is, why it was flagged, and a link. The content is
 *    read in the queue, behind the role check.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails"

export type ReportKind = "forum_topic" | "forum_reply" | "mentor_question" | "mentor_answer"

const KIND_LABEL: Record<ReportKind, string> = {
  forum_topic: "forum thread",
  forum_reply: "forum reply",
  mentor_question: "mentorship question",
  mentor_answer: "mentorship answer",
}

function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (explicit) return explicit
  // Vercel sets VERCEL_URL without a scheme, and only on deployments.
  const vercel = process.env.VERCEL_URL
  return vercel ? `https://${vercel}` : ""
}

/** Whether the email channel is configured. Exported so a health check or an
 * admin page can say "email alerts are off" rather than implying they work. */
export function moderationEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.MODERATION_ALERT_EMAIL)
}

export async function notifyModeratorsOfReport(input: {
  kind: ReportKind
  reason: string
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.MODERATION_ALERT_EMAIL

  if (!apiKey || !to) return

  const label = KIND_LABEL[input.kind] ?? "post"
  const reason = input.reason.replace(/_/g, " ")
  const queue = `${siteUrl()}/admin/moderation`

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MODERATION_ALERT_FROM || "ILM Hunt <onboarding@resend.dev>",
        to: to.split(",").map((address) => address.trim()).filter(Boolean),
        subject: `A ${label} was reported (${reason})`,
        text: [
          `Someone reported a ${label}.`,
          ``,
          `Reason given: ${reason}`,
          ``,
          `This is the first report on that item — later reports on the same one`,
          `will not send another email, but they will still show in the queue.`,
          ``,
          queue ? `Review it: ${queue}` : `Review it in the admin area, under Moderation.`,
        ].join("\n"),
      }),
      // Never let a hanging request hold the reporter's action open.
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      console.error("[moderation-notify] Resend rejected the alert:", response.status)
    }
  } catch (error) {
    // Swallowed on purpose — see rule 1.
    console.error("[moderation-notify] Could not send the alert:", error)
  }
}
