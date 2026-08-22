# Question bank build log

One entry per category as it is authored. Numbers come from the database, not from memory.

---

## Five Pillars — 180 of 180 · complete, validator clean

Authored 2026-08-20. First category of the rebuild. **All nine tiers at 20.**

Validator clean on every check: no near-duplicate pair above 0.5 similarity, no correct
answer appearing more than twice, no opening stem appearing more than four times.

### Tier 8 was short at 10, then closed

Worth recording, because the recovery is the reusable part. Tier 8 asks where the schools
differ *and why*, and misattributing a position breaches the one hard condition in the
handoff. A first pass sourced only ten differences to a citable standard — a wrong fatwa
page on islamweb, then Wikimedia rate limiting — so the bucket was reported short at 10
rather than padded from memory.

It was then closed properly. **al-Jaziri's *al-Fiqh ala al-Madhahib al-Arbaa* is available
as plain text on archive.org**, 3.8 MB, Volume I being *Modes of Islamic Worship* — exactly
the volume covering the pillars:

```
https://archive.org/download/IslamicJurisprudenceAccordingToTheFourSunniSchoolsAlFiqhalaAlMadhahibAlArbaah/IslamicJurisprudenceAccordingToTheFourSunniSchoolsAlFiqhalaAlMadhahibAlArbaah_djvu.txt
```

Follow redirects, or resolve the host from `archive.org/metadata/<item>` first; a plain
request returns zero bytes. Scanning it for windows naming three or more schools yields 464
comparative passages. Eleven questions came out of it directly.

**It also corrected work already written.** A tier-8 question sourced from Wikipedia said the
intention in wudu is "a formal obligation" in Maliki, Shafii and Hanbali. al-Jaziri is
sharper: for the Hanbalis it is a *condition of validity*, for the Malikis and Shafiis a
*pillar*, and for the Hanafis an emulation of the Sunnah that is neither. That question was
deleted and replaced by two carrying the real distinction. **Prefer al-Jaziri over Wikipedia
for any school attribution.**

### Citations

Every citation checked against real source text before use, not recalled:

- 24 Qur'an verses through the quran.com API
- hadith through the fawazahmed0 corpus, with gradings where carried: Bukhari 8, 1405, 1447,
  1503, 1623, 1936; Muslim 874, 1570, 1572; Abu Dawud 59, 61, 171, 175, 408, 415, 494, 594;
  Nasai 2333; Tirmidhi 787
- Tafsir Ibn Kathir on 2:158 through the quran.com tafsir endpoint
- eleven tier-8 positions from al-Jaziri; four earlier ones remain Wikipedia-sourced and
  should be re-checked against al-Jaziri when convenient

Tier 8 remains the highest scholar-review priority in this category.

### Notes for review

- Tier 5 deliberately includes narrations graded **Daif** (Abu Dawud 408, 415, 594). Each is
  asked *about the grading*, never as the basis of a ruling, per the handoff.
- Abu Dawud 415 is used to teach that **Maqtu** marks a Successor's statement rather than a
  hadith of the Prophet.
- Tier 9 answers are framed as *the reasoning to apply*, not as settled rulings, because
  these are cases on which qualified scholars genuinely differ.
- All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## Creed (Aqeedah) — 180 of 180 · complete, validator clean

Authored 2026-08-20. Second category. **All nine tiers at 20, clean on every check** — no
near-duplicate pair above 0.5, no correct answer more than twice, no opening stem more than
four times.

### Sourcing

- Qur'an: 30 verses through the quran.com API, each read before use — 112:1–4, 2:3, 2:177,
  2:255, 2:285, 3:7, 3:31, 4:48, 4:65, 4:136, 5:72, 6:59, 7:180, 16:36, 18:50, 21:25, 23:100,
  30:30, 33:36, 35:1, 41:30, 42:11, 47:19, 49:14, 51:56, 55:15, 59:23
- Hadith through the fawazahmed0 corpus: Bukhari 50 (hadith of Jibril), Bukhari 1359
  (fitrah), Muslim 97, Muslim 7216, Nasa'i 5005 (seventy-odd branches, Sahih), Tirmidhi 2027
  (Sahih), Tirmidhi 2640 (Hasan Sahih), Tirmidhi 2641, Tirmidhi 172 (Mawdu), Abu Dawud 4623,
  Abu Dawud 4695
- Tier 8's three schools sourced from the Ash'arism, Maturidism and Athari articles

### Tier 8 without a comparative-fiqh source

al-Jaziri is a work of *fiqh* and carries nothing on kalam, so the Five Pillars method did
not transfer. The three Sunni theological orientations were sourced separately, and the
questions turn on **method** rather than on slogans:

- Ash'ari as a middle path between Athari and Mu'tazila, permitting both **tafwid** and
  **ta'wil** for the ambiguous verses
- Athari emerging from Ahl al-Hadith, holding the *zahir* the sole authority in creed,
  opposing ta'wil, and accepting the text **bila kayfa**
- Maturidi grounded in Abu Hanifa, holding ethics objectively knowable by reason, and
  treating reports as unreliable where they conflict with reason

One question asks what the three have in **common** — that all are orientations within Sunni
theology, differing over method rather than over the framework. That is deliberate: the
category must not read as though one orientation were Sunni Islam and the others deviations.

**These attributions are Wikipedia-sourced and are the highest scholar-review priority in
this category.** A primary-source pass (al-Ash'ari's *al-Ibanah*, al-Maturidi's *Kitab
al-Tawhid*, al-Tahawi's *Aqeedah*) would put them on the footing al-Jaziri gave Five Pillars.

### Tier 7 and the handling of takfir

Tier 7 covers exceptions to general creedal rules, which in this category means the ground
around declaring a person a disbeliever. Every question there is framed as **a distinction
the scholars draw**, never as a ruling on any person or group:

- judging a statement is a general ruling; judging a named individual requires conditions met
  and impediments absent
- ignorance and the non-arrival of the proof operate as recognised impediments
- a major sin does not by itself expel a person from Islam, against the Kharijite position
- the bedouins of 49:14 were told faith had not entered their hearts and were still not
  called disbelievers — falling short of complete faith is not disbelief

The final question asks *why* scholars are cautious here, and answers that the severity of
the consequence is itself the reason for restraint.

### Notes for review

- Tier 5 uses **Tirmidhi 2641**, where Shakir and Al-Albani grade Hasan while Zubair Ali Zai
  grades Da'if, to teach that a contested report cannot settle a creedal question.
- **Tirmidhi 172**, graded Mawdu, is used to teach that fabrication is graver than weakness
  because the report does not trace to the Prophet at all.
- Tier 9 frames answers as *the reasoning to apply*, not settled rulings.
- All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## Allah's Names & Attributes — 180 of 180 · complete, validator clean

Authored 2026-08-20. Third category. **All nine tiers at 20, clean on every check.**

### The constraint this category was built around

`docs/CATEGORY_TIER_MAPS.md` set the rule before authoring began, and tier 5 now teaches it
directly rather than working around it. Verified again against the corpus:

| narration | content | grading |
|---|---|---|
| Tirmidhi 3506 | the *statement* that Allah has 99 names | **Sahih** (Shakir, Al-Albani) |
| Tirmidhi 3508 | the same statement | **Sahih** (Shakir); Sahih Bukhari (Zubair Ali Zai) |
| **Tirmidhi 3507** | the **enumeration** of the 99 | **Da'if** — Shakir, Al-Albani *and* Zubair Ali Zai alike |
| Ibn Majah 3861 | related enumeration | **contested** — Sahih (Al-Albani), Da'if (Zubair Ali Zai) |

Both Sahihs carry the statement (Bukhari 2736, 6410, 7392; Muslim 6809, 6810). Neither
carries the enumeration.

So the category is built as the tier map required:

- **every name is anchored to its Qur'anic occurrence**, never to the Tirmidhi list;
- **no question asks "is X one of the 99?"** as a question of fact, because the list that
  would settle it is graded weak;
- tier 5 makes the discrepancy itself the subject — including that wide reproduction on
  posters and apps establishes nothing, since authenticity is a property of transmission.

### Sourcing

Around 40 Qur'anic verses read through the API before use, including the name-dense passages
59:22–24, 57:3, 40:3, 3:26, 2:255, 112:1–4, 7:180, 6:103, 67:14, 24:35, 22:6, 51:58, 55:27,
30:54, 2:107, 2:186, 65:3, 11:73, 85:14, 19:96, 9:128.

Tier 8 reuses the Ash'ari / Maturidi / Athari sourcing from Creed but applies it to the
attributes specifically — tafwid, ta'wil, ithbat, and the terms *ta'til* and *tashbih* for
the two errors the schools jointly rule out. **Wikipedia-sourced; same review priority as in
Creed.**

### What the validator caught here

The recurring failure in this category was **parallel construction**: writing a matched pair
of questions and having them come back as near-duplicates of each other.

- "Which scripture was given to Musa / Isa / Dawud" — three at once (in Creed, same pattern)
- "Tawhid ar-rububiyyah concerns... / Tawhid al-uluhiyyah concerns..."
- "What follows from dwelling on forgiveness... / on severity..."
- "Al-Awwal and al-Akhir affirmed together... / Az-Zahir and al-Batin affirmed together..."
- "Applied to a divine attribute, what does tafwid / ta'wil mean?"

Each was fixed by **recasting one side into a different question shape**, not by nudging
words until the checker fell silent. Worth knowing in advance: any tier that naturally
invites a matched pair will trip this, and it is cheaper to vary the shape at authoring time
than to repair it afterwards.

### Notes for review

- Tier 9 answers are framed as *the reasoning to apply*, and two questions ask explicitly
  what makes a derivation from a name sound rather than fanciful — including that a binding
  legal ruling cannot rest on a name alone.
- All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## Holy Quran — 180 of 180 · complete, validator clean

Authored 2026-08-20. Fourth category. **All nine tiers at 20, clean on every check.**

### Sourcing

Chapter facts come from the quran.com `chapters` endpoint rather than memory: 114 surahs,
6,236 verses, 86 Makkan against 28 Madinan, al-Baqarah longest at 286 verses, and **three**
surahs tied on the minimum of three (al-'Asr, al-Kawthar, an-Nasr) — a detail easy to get
wrong by naming al-Kawthar alone.

Around 45 verses read through the API before use. Hadith through the corpus, with gradings:
Bukhari 5015 (al-Ikhlas as a third of the Qur'an), Muslim 874, Abu Dawud 1400 and 1458,
Ibn Majah 1369, 3785, 3786, Tirmidhi 2886.

### Tier 5 — surah virtues, a genre where grading matters most

The tier is built on the fact that virtue narrations attract unsound material:

- **Abu Dawud 1400 / Ibn Majah 3786** (al-Mulk interceding): Hasan, Sahih, and *Hasan
  Lighairihi* from different graders — a spread entirely **within** acceptance, used to teach
  that such a spread is not a dispute.
- **Tirmidhi 2886** (protection from reciting the opening of al-Kahf): **Da'if** from
  Al-Albani and Zubair Ali Zai, **Shadh** from Ahmad Shakir. Widely repeated, and the tier
  teaches that it should be stated with its grading rather than asserted plainly. *Shadh* also
  earns its own question, as a defect distinct from a weak chain.

### Tier 8 — abrogation, contested to its foundations

Sourced from the Naskh literature rather than asserted. What the tier teaches:

- **there has never been consensus** on how many passages naskh affects; estimates run from
  **fewer than ten to over five hundred**
- az-Zuhri (d. 742) held 42; the count rose to a peak around the eleventh century, then fell
- whether the Sunnah may abrogate the Qur'an divides the **Shafi'i and Hanafi** schools —
  a question of usul, which is why it splits schools rather than individuals
- a **minority** hold that verses are not abrogated at all, favouring reinterpretation
- some argue that **2:106 and 16:101 do not refer to the concept at all**, so even the
  scriptural basis is disputed

Two questions turn that on the reader: why "how many verses are abrogated" cannot be asked
as a question of fact, and what is wrong with a teacher stating five hundred plainly.

**Wikipedia-sourced; same review priority as the theology tiers in Creed and Allah's Names.**

### What the validator caught

A **1.000 similarity** between two questions differing only in word order — *naskh al-hukm
duna al-tilawa* against *naskh al-tilawa duna al-hukm*. Trigram similarity is order-insensitive,
so mirror-image terminology needs genuinely different question shapes. Recorded in the runbook.

Frame budgeting, added to the runbook after the previous category, worked: tiers 4, 7 and 9
passed first time, against six collisions in tier 1 before the rule was applied.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## Prophetic Biography — 180 of 180 · complete, validator clean

Authored 2026-08-20. Fifth category. **All nine tiers at 20, clean on every check.**

### Tier 5 is the strongest tier in the bank so far

The tier map asked for *which sira author reports an incident, and how their reliability
differs*. Sourced properly, that turns out to be unusually rich:

**Ibn Ishaq** (b. Medina c. 704) survives only through **recensions**. Al-Bakka'i's perished;
**Ibn Hisham's** survived — and Ibn Hisham stated openly what he removed: *"things which it is
disgraceful to discuss; matters which would distress certain people; and such reports as
al-Bakka'i told me he could not accept as trustworthy."* His most discussed critic was
**Malik ibn Anas**, who rejected the reports about the Jews of Madinah on the ground that they
rested solely on accounts by sons of Jewish converts.

**Al-Waqidi** (b. c. 748, qadi for al-Ma'mun) was *"considered reliable by most early Islamic
scholars"* on the expeditions — and was savaged by the hadith critics: al-Shafi'i (*"All the
books of al-Waqidi are lies"*), Yahya ibn Ma'in (*"He is weak. He is nothing. Not reliable!"*),
Ahmad ibn Hanbal (*"He is a liar, makes alterations in the traditions"*), Ali ibn al-Madini,
Ishaq ibn Rahwayh, Abu Zur'a al-Razi.

**That tension is the tier's central lesson**: the two judgements answer different questions —
usefulness for recording history against reliability for establishing a binding report. A
source can be genuinely both.

Also recorded: **Guillaume's 1955 translation merged Ibn Hisham with al-Tabari's Ibn Ishaq
material**, so a passage cited as "Ibn Ishaq" from it may rest on either transmission.

### Where facts come from, stated honestly

**The Prophet's mother's name does not appear anywhere in the hadith collections used here.**
Searching the corpus for "Aminah" returns nothing. So tier 1 attributes it — and the father's
name, the birthplace, the ages, the Makkan and Madinan spans — to **the sira literature**,
while the first revelation, Hudaybiyyah, the battles and the Ashura change carry **Bukhari**
citations. One tier-5 question asks the learner why this category cites the two differently.

### Tier 6 — the Abu Jandal episode

Bukhari 2711 gives the tier its worked example: Suhayl ibn 'Amr's condition that anyone coming
from the Makkan side be returned **even if Muslim**; the Muslims *"did not like this condition
and got disgusted with it"*; Abu Jandal returned to his father; and then the exception for the
believing women, made not by preference but when revelation addressed their case.

Read without that context the term looks like an inexplicable concession — which is exactly
what tier 6 exists to teach.

### Sourcing note

`en.wikipedia.org` returned **429** partway through the sira-source research — the throttling
documented in `docs/SOURCES.md`. The work was reordered around it: tiers 1–4 were authored from
the hadith corpus, which has no rate limit, and the Wikipedia-dependent tiers were done once the
limit cleared. **Wikipedia-sourced attributions here carry the same review priority as the
theology tiers in Creed and Allah's Names.**

All 180 rows are `review_status = 'ai_drafted'`. None is published.

## 6. Hadith Sciences — 180 / 180

The flagship category: the one the **da'if format** was designed for, and the one that had to
be built before the format could ship anywhere else.

### The da'if format, tier 5

Twenty questions, each showing four real narrations with one weak among them. Built from a
filtered pool of the corpus — **150 unanimously-weak and 582 unanimously-sound** narrations
surviving these exclusions:

- gradings whose term maps to nothing in the sahih/hasan/da'if scale (`Shadh`, `Munkar`), which
  had been silently dropped and were making **non-unanimous narrations look unanimous**
- the **7,167 contested** narrations where critics disagree — those belong to tier 7, not here
- cross-reference fragments ("a similar tradition…", "the rest of the tradition to the same
  effect"), which are not standalone narrations
- texts carrying an embedded grade label such as `(Daif)`, which **give the answer away**
- mid-sentence truncations and corpus artifacts

Per-choice gradings ride in the new `choice_meta jsonb` column (migration
`add_choice_meta_for_daif_format`), each entry `{g, ref, by[]}` naming every scholar and the
exact grade string. A *hasan* choice is labelled hasan, never rounded up to sahih — that
rounding was a factual error about a scholar's grading, caught before it shipped.

### Two design faults the automated checks could not see

**Consecutive narrations as adjacent answers.** Tier 5 had Ibn Majah **921** and **922** — the
same companion, the same subject, consecutive numbers — as the weak answer in two adjacent
questions. A player who learned the first would guess the second. Replaced 922 with Ibn Majah
2668 ("There is no retaliation except with the sword"), a weak narration a fiqh-aware player
might well believe sound.

**A mis-tokenizing parser.** The regex `'((?:[^']|'')*)'` reads SQL literals ambiguously and
mis-aligns on rows containing escaped quotes, which produced a defect report naming the wrong
choices. Replaced with a real character scanner (`parse.py`). *Do not parse SQL literals with a
regex.*

### The tiers that the corpus made possible

Tier 7 asks about **real disagreements between named critics**, of which the corpus holds about
**2,530**. Three kinds are legible from the grade strings alone, and each became a question:

| pattern | what is in dispute | example |
|---|---|---|
| `Hasan Lighairihi` vs `Daif` | whether corroborating chains suffice to raise the report | Abu Dawud 26 |
| `Isnaad Hasan` vs `Daif` | the chain affirmed while the report is not | Abu Dawud 227 |
| `Daif` vs `Sahih Muslim (1963)` | **this chain** weak, **this report** sound elsewhere | Abu Dawud 2797 |

That third pattern is the most useful thing in the category: a weak grading attaches to a chain
in a given collection, not to the report wherever it appears.

Tier 6 rests on gradings that carry two verdicts at once — `Sahih Isnaad Mauquf`
(Abu Dawud 4330), `Sahih Maqtu` (Abu Dawud 102, 349), `Sahih Isnaad Mursal`
(an-Nasa'i 4142–4145). Each shows the same lesson from a different angle: **a sound chain does
not make a report prophetic.**

### Tier 8 sourcing

The comparative usul positions — Hanafi and Maliki acceptance of mursal, al-Shafi'i's
requirement of corroboration, Maliki `'amal ahl al-Madinah`, the Hanafi `'umum al-balwa`
condition, Ahmad's reported ordering — were checked against the usul literature via search.
**Same review priority as the theology tiers in Creed and Allah's Names.** Tier 8 also teaches
its own caveat: Ahmad's "da'if" predates the hardened terminology, so reading the later
technical sense back into him overstates the claim.

### Verified facts picked up along the way

- an-Nawawi's **Forty** Hadith contains **42**
- Bukhari 7,563 · Muslim 7,563 · an-Nasa'i 5,758 · Abu Dawud 5,274 · Ibn Majah 4,341 ·
  at-Tirmidhi 3,956 · Muwatta 1,858 numbered reports in the standard English editions

All 180 rows are `review_status = 'ai_drafted'`. None is published.

## 7. Quran Commentary (Tafsir) — 180 / 180

Sourced from **real commentary text**, not from memory. The quran.com API carries three English
tafsirs — **Ibn Kathir (169), Ma'arif al-Qur'an (168), Tazkirul Quran (817)** — and roughly 750KB
was pulled across 20 verses chosen because interpretation genuinely turns on them.

The working endpoint is `/api/v4/tafsirs/{id}/by_ayah/{verse_key}`. The one that looks right,
`/api/v4/quran/tafsirs/{id}?verse_key=…`, returns `{"tafsirs":[]}` with **HTTP 200** — an empty
success, not an error. Recorded in `docs/SOURCES.md`.

### Three tafsirs on one verse is the whole category

At **24:35** Ibn Kathir opens with 'Ali ibn Abi Talhah from Ibn 'Abbas, then Ibn Jurayj from
Mujahid, then as-Suddi, then a hadith in the Two Sahihs, then Ibn Mas'ud — every claim attributed.
Tazkirul Quran, on the same verse, reads the niche as the human heart and the lamp as faith,
citing **no earlier authority at all** and comparing human receptivity to petrol.

Neither is disqualified by the comparison. Tier 7 makes the contrast itself the lesson: know
which kind of claim you are being handed.

### Tier 8 got a disagreement with its reasoning attached

The pause dispute at **3:7** — stop at "except Allah", or carry on past "those firmly grounded in
knowledge" — is set out **by Ibn Kathir himself**, with both sides sourced and the reason each
rests on:

| if *ta'wil* means | then | because |
|---|---|---|
| the true reality of a thing (12:100, 7:53) | stop at the divine Name | only Allah knows realities |
| explanation, exposition (12:36) | carry on | "the Qur'an does not address the people with what they cannot understand" |

He names the first stop from 'A'ishah, 'Urwah, Abu ash-Sha'tha' and Abu Nahik, and cites Ibn
'Abbas — "I am among those who are firmly grounded in its ta'wil" — for the second. This is a
category where the classical commentary is *more* forthcoming about disagreement than most
modern presentations of it.

### Worked examples the corpus supplied

- **2:187** — Companions tied black and white threads to their legs until "of dawn" was revealed
  (al-Bukhari, from Sahl ibn Sa'd). The literal reading was the natural first reading, corrected
  by revelation. 'Adi ibn Hatim asked whether they were actual threads and was told: "Rather, they
  are the blackness of the night and the whiteness of the daylight."
- **2:219** — 'Umar's repeated "O Allah! Give us a clear ruling regarding al-Khamr", answered in
  three stages (2:219 → 4:43 → al-Ma'idah), ending with his "We did abstain, we did abstain."
  Tier 9 asks a student to refute someone citing stage one as the final ruling.
- **2:106** — Ibn Kathir states the rule with its condition: naskh governs commandments,
  prohibitions and permissions, and **"As for stories, they do not undergo Nasakh."**
- **2:115** — Ibn 'Abbas: the first abrogation concerned the qiblah. Ibn Kathir gives sixteen or
  seventeen months while the report he cites says some ten, and he **preserves both** rather than
  smoothing them. Tier 6 asks what that tells a reader.

### What the validator caught this time

Three near-duplicate pairs, all genuine redundancy rather than accident:

- the **same Ibn 'Abbas quotation** used as the subject of two different questions (tiers 5 and 8)
- "Which commentary is the most recent of those named here?" against "Which commentary named here
  was completed most recently?" — the same question twice, in two tiers
- the two *ta'wil*-sense questions in tier 8, mirror images of each other

All three were replaced or recast into a different shape. The mirrored pair became a citation
question: what 12:36 establishes, and what follows at 3:7.

The new cross-tier pre-flight (`emit.check(..., existing=…)`) **did earn its keep** — it caught
three category-wide stem overruns before insertion rather than after. It did not catch these
three, because a 4-gram Jaccard score and pg_trgm similarity measure different things. The
database check remains the authority.

Verified in passing: **Ibn Kathir al-Makki (d. 120 AH), one of the seven canonical reciters, is
not Isma'il ibn Kathir (d. 774 AH) the mufassir** — six and a half centuries apart, and now a
tier-3 question.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 8. Preservation of the Qur'an (`quran_sciences`) — 180 / 180

Built on **Sahih al-Bukhari Book 66, Virtues of the Qur'an**, read directly from the corpus
rather than from memory: 4986 (Zayd ibn Thabit on Abu Bakr's collection), 4987 (Anas ibn Malik
on 'Uthman's standardisation), 4991 (Ibn 'Abbas on the seven ahruf) and 4992 ('Umar and Hisham).

What the primary text gave that a summary would not:

- Abu Bakr **and** Zayd raised the *same* objection — "How can you do something which Allah's
  Messenger (ﷺ) did not do?" The narration records the hesitation twice before recording the
  decision. A story built to justify the collection would not open that way.
- 'Uthman's tie-break instruction was addressed to **"the three Quraishi men"** — which marks
  the fourth, Zayd, as the Ansari on the committee. That phrasing is a tier-3 question.
- The 'Umar/Hisham report sits at **4992 in Book 66 and again at 2419 in Book 44 (Disputes)**.
  One narration, two chapter headings — which is a concrete way to show how a chapter-arranged
  collection works, and why its numbered total exceeds its count of distinct reports.

**Tier 7 is the regional tier.** Warsh from Nafi' is the dominant transmission in Nigeria and
across West Africa, so the differences between Warsh and Hafs are worked through concretely —
3:146 (*qatala* / *qutila*) and 2:184 (singular / plural *miskin*) — with the undotted early
script explained as the reason both fit one rasm.

**Tier 8 states plainly that the ahruf question is unsettled**, sets out the three families of
position, and separates it from the standing of *shadhdh* readings, where scholars differ again.

### The pre-flight now matches the database exactly

The gap flagged in the Tafsir entry is closed. `scripts/question-bank/trgm.py` is a faithful
port of pg_trgm's `similarity()` — confirmed against `show_trgm()` on the live database:
lower-case, split on non-alphanumerics, pad each word with **two** leading spaces and one
trailing, collect trigrams into a **set**, then Jaccard. It reproduces Postgres to six decimal
places on real question text.

It earned its keep immediately, catching three collisions that the old 4-gram check would have
passed through to the database — including one tier-5 stem that simply repeated a tier-2
question, and a 0.638 match against a stored Tafsir stem.

Also fixed: `existing_stems.py` was reading stems with the regex `\('((?:[^']|'')*)'`, which is
ambiguous about where a doubled `''` ends a literal and can overrun into the next column. It now
uses the shared tokenizer. Verified identical output on all 180 rows before the swap.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 9. Tajwid (`tajwid`) — 180 / 180

The most technical category so far, and the one where a vague answer is most obviously wrong.
The five anchor verses were pulled from the quran.com API rather than quoted from memory —
**73:4** (*wa rattil al-Qur'ana tartila*), **16:98** (the isti'adhah), **17:106** and **25:32**
(revelation spaced out over time) and **75:16–18** (do not hasten; follow its recitation).

The rule content is stated with its conditions attached, because a rule without its condition is
simply false: qalqalah only when the letter bears a sukun, greater qalqalah only at a stop, madd
lazim invariant because its cause is inherent while madd 'arid varies because its cause is the
reciter's own choice to stop. Tier 4 turns on exactly that distinction and tier 7 uses it to
resolve apparent collisions between rules.

**Tier 8 is the regional tier again, and it is concrete.** Verified madd munfasil lengths:

| transmission | madd munfasil |
|---|---|
| Hafs from 'Asim | 4 or 5 counts |
| Warsh from Nafi' | 6 counts |
| Qalun from Nafi' | 2 or 4 counts |

Warsh and Qalun transmit the *same reader*, which makes the point that naming the reader is not
enough — the route must be named too. Madd badal sharpens it further: two counts everywhere
except Warsh by the route of al-Azraq, which transmits two, four and six. The practical question
for a Nigerian learner studying from an Egyptian recording is a tier-8 question.

### Two tooling failures found and fixed mid-category

**A failed pre-flight still wrote its file.** `emit.check()` printed `PROBLEMS:` and returned
`False`; every authoring script then called `emit.build()` regardless. Nothing enforced the check
— it had worked only because I re-ran after reading the output. A failing Tajwid run overwrote
Hadith Sciences' `t1.sql` before I noticed. `check()` now raises `SystemExit(1)`. The database
was verified intact (Hadith Sciences still 180/180); only a staging artifact was lost.

**Staging files were named by tier, so categories collided.** `t*.sql` meant Hadith Sciences'
tiers and Tajwid's alike, and the cross-tier duplicate loader globbed across both — reporting a
page of phantom collisions that were really another category's stems. Staging now lives in
`cat/<slug>/<tier>.sql`, and the loader is pointed at one category's directory with the file
being written passed as `exclude`.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 10. Arabic Language (`arabic_language`) — 180 / 180

Built on **corpus.quran.com's syntactic treebank**, queried live. Every grammatical claim about a
specific word is taken from its annotation rather than from memory, and the citations say so.

What the treebank gave that memory would not have:

- **2:255** — `sinatun` (slumber) is annotated **feminine**, `nawmun` (sleep) **masculine**, two
  near-synonyms side by side in one verse, and the verb `takhudhuhu` is feminine singular because
  it agrees with the first. Tier 2's gender questions rest on that rather than on a rule of thumb.
- **2:124** — `ibrāhīma` accusative, `rabbuhu` nominative. The object precedes the subject and only
  the endings say which is which.
- **9:3** — the same two words appear **twice in one verse** with different endings: `warasūlihi`
  genitive (governed by *min*), `warasūluhu` nominative. Reading the second as genitive would
  reverse the verse. This is tier 6's spine.
- **71:10** — `is'taghfirū` is a **Form X imperative**, the cleanest illustration of that measure's
  "seeking" sense, from a word every learner already knows.
- **73:4** — `l-qur'āna` accusative as object, `tartīlan` accusative as **absolute object**, and
  both `rattili` and `tartīlan` annotated **Form II**: the masdar matching its own verb's measure.
  The same verse anchors Tajwid tier 1.

**Tier 4** ("when a noun takes nasb") is therefore built from five verified governors rather than
a remembered list: object of a verb, absolute object, the *lā* of absolute negation (2:255), the
noun of *inna* (35:28), and the predicate of *kāna* (71:10).

**Tier 7 turns on a case the endings cannot settle.** At 3:7 `l-rāsikhūna` is nominative on *both*
parsings — as the subject of a resumed sentence, or coordinated with the nominative name of Allah.
So unlike 9:3, i'rab does not decide; what decides is how the *wāw* is read and which sense of
*ta'wīl* is meant. The corpus marks it resumptive (استئنافية), and the tier says plainly that this
is one editorial choice among two attested classical parsings, not a verdict.

**Tier 9** parses **49:13**, which exercises most of the category at once: a vocative, two *inna*
constructions, a preposition with genitive, two objects in nasb, an *iḍāfa*, an accusative adverb
of place (a nasb cause tier 4 had not covered), and `litaʿārafū` — **Form VI**, whose reciprocal
sense *is* the verse's argument.

Tier 5 and tier 8 are the attribution tiers: al-Khalil and Sibawayh for Basra, al-Kisa'i and
al-Farra' for Kufa, with **al-Anbari's *al-Insaf fi Masa'il al-Khilaf*** as the work that preserves
the disputes. Verified details worth keeping: al-Khalil is cited **608 times** in al-Kitab; the
schools take **opposite** positions on whether the masdar or the verb is the origin of derivation;
and al-Kisa'i heads a grammatical school *and* is one of the seven canonical readers — the same
name the Preservation and Tajwid categories already carry.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 11. Usul al-Fiqh (`usul_fiqh`) — 180 / 180

The hinge category. Every fiqh category from here on will present conclusions; this one teaches
the reasoning that produces them, which is why the handoff singled it out.

**Verified before writing, not asserted from memory:**

- The Hanafi fard/wajib distinction — fard requires proof definitive (qat'i) in both transmission
  and meaning; wajib rests on proof speculative (zanni) in one respect. The same split mirrors
  haram/makruh tahrimi. Tier 3's madhab_tag is split per row: 12 `agreed` (the five ahkam
  framework), 8 `hanafi` (the fard/wajib terminology) — caught and corrected after an initial
  blanket tag, which is now the standing caution for any tier that mixes agreed and school-specific
  content.
- The five universal maxims and their two recording works: **al-Suyuti's *al-Ashbah wa'l-Naza'ir***
  (Shafi'i) and the **Majalla** (Ottoman, Hanafi, drafted under Ahmad Cevdet Pasha 1869–76, its
  first hundred articles devoted to ninety-nine maxims).
- Al-mutlaq wal-muqayyad from real Qur'anic text: the bequest at **4:11** is unrestricted in
  amount (mutlaq); the stepdaughter prohibition at **4:23** is restricted to where the mother's
  marriage was consummated (muqayyad) — confirmed against the API, not recalled.
- **Tier 7's conflict case is real and checkable**: Abu Hurairah's prohibition on drinking
  standing (Sahih Muslim 5279) against the Prophet's (ﷺ) own recorded practice at Zamzam (Sahih
  al-Bukhari 5617), with **'Ali naming the tension himself** at Bukhari 5615 — "Some people dislike
  to drink while standing, but I saw the Prophet (ﷺ) doing [it]." The standard resolution is
  reconciliation (jam'), not abrogation: the prohibition reads as discouragement, not a ban.
- Tier 8's disputed sources — istihsan (Hanafi/Maliki, attacked explicitly by al-Shafi'i), masalih
  mursalah (Maliki), 'amal ahl al-Madinah (distinctively Maliki, rejected by name by al-Shafi'i).

**Tier 9 does not invent a novel fiqh ruling.** It walks a precedent-less medical case through
the full assembled method — source order, qiyas structure, maxim conditions, technical precision,
conflict resolution, awareness of disputed sources — and its explicit conclusion is that a
defensible answer names what it can be checked against, and says plainly where more than one
position remains defensible. That restraint is deliberate: this category's job is to teach the
method, not to issue a ruling beyond its brief.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 12. Islamic Law (Fiqh) (`fiqh`) — 180 / 180

The first category to put usul al-fiqh's method to work on ordinary rulings, rather than teach
the method itself. Every tier traces back to a verified anchor: five Qur'an verses (5:3, 5:90,
2:275, 6:145, 59:7) fetched live from the API, dated founders (Abu Hanifa 80-150 AH, Malik
93-179 AH, al-Shafi'i 150-204 AH, Ahmad ibn Hanbal 164-241 AH — with the genuine coincidence that
Abu Hanifa died the same year al-Shafi'i was born), a specific hadith with its number (Sahih
Muslim 639, 'Ali on the khuff-wiping durations), al-Ghazali's five maqasid, two named fiqh maxims
(al-darurat tubih al-mahzurat / al-darurat tuqaddar bi qadariha), and a real, still-live scholarly
dispute (the basmalah's status, Sahih Muslim 1110 on one side).

**Tier 4 mixes agreed and school-specific content honestly** rather than flattening it: the
qullatayn water threshold is tagged `madhab_tag='shafii'`, the ten-by-ten-cubits threshold
`'hanafi'`, and only the comparison between them is tagged `'agreed'`. Same for tier 2's wudu
nullifiers — wind, stool, deep sleep are agreed; touching one's own private parts and heavy
bleeding are stated as genuine, named cross-school splits.

**Tier 5 is the concrete demonstration of what tier 5 of the Hadith Sciences category promised.**
Rather than asserting a duration, it names the exact hadith (Muslim 639), the narrator ('Ali,
directed to by 'A'ishah specifically because he travelled with the Prophet ﷺ), and states plainly
what would follow if a weaker hadith were the only support.

**Tier 8 does not pick a winner.** All four schools' basmalah positions are stated with their
practice (aloud/silent, verse/not-verse), Sahih Muslim 1110 is named as the report cited by the
schools that recite quietly, and the tier states explicitly that citing one hadith does not mean
the other schools lack evidence — they read the same body of reports differently.

**Tier 9 is a real, live contemporary case, not an invented one:** pig-derived gelatin in
vaccines. It walks through istihalah (transformation) as the operative doctrine, names the actual
school split (Hanafi/Maliki and bodies like the European Council for Fatwa and Research generally
accepting the transformation; Shafi'i/Hanbali positions and Saudi Arabia's Permanent Committee
generally not), and then shows that even on the stricter reading the necessity exception from
tier 7 is a separate, independently-checked line of reasoning — not proof that istihalah occurred.
The tier is explicit that the two lines of reasoning must not be collapsed into one.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 13. Islamic Ethics (Akhlaq) (`ethics`) — 180 / 180

Character and conduct, held to the same sourcing standard as ritual law: every claim traces to a
verified verse or a named, numbered hadith rather than free-floating moral sentiment.

**Verified anchors:** Qur'an 17:23, 31:14, 4:36, 9:119, 33:70 and 49:12 (all fetched live from the
API); Sahih al-Bukhari 33 (the three signs of a hypocrite), 13 (Anas — "none of you truly believes
until he wishes for his brother what he wishes for himself"), 6014/6015 ('A'ishah and Ibn 'Umar,
independently, on the neighbour's right), 6018 (Abu Hurairah's threefold "whoever believes in
Allah and the Last Day"), 6055/6056 (namimah and the qattat), and 9 (haya' as a branch of faith);
Sahih Muslim 6593 (the Companions' own definition of ghibah, with buhtan as its counterpart for a
false accusation) and 6633 (Umm Kulthum bint 'Uqbah, the three named exceptions to the prohibition
on lying — battle, reconciliation between people, and words between spouses).

**Tier 4 built and then rebuilt al-Nawawi's six exceptions to ghibah** (from *Riyad al-Salihin*):
oppression brought to someone who can act on it, seeking help to change a wrong, a mufti asked for
a legal opinion, warning others of genuine harm, an openly committed sin, and identification with
no intent to demean. The first draft wrote six near-identical "which named exception is this"
questions that collided pairwise on `similarity()`; the fix recast each as a distinct scenario.

**Tier 6 tracks classical-versus-modern semantic drift** on three terms — hilm (al-Raghib
al-Isfahani's definition: restraint despite the real capacity to retaliate, not mere passivity),
muru'ah (a live standard of respectable conduct that varies by time and place, cited in classical
fiqh as one factor in a witness's 'adalah), and haya' (Bukhari 9's own translation glosses it as
self-respect and moral scruple generally, well beyond the narrowed modern sense of "modesty in
dress").

**Tier 8 states two genuinely contested scopes rather than picking a winner**: how far the
mujahir bi-l-fisq (open sinner) exception to ghibah extends beyond warning into ordinary
mention, and how far Muslim 6633's marital-reconciliation exception stretches into ambiguous
cases — each framed the same way Islamic Law (Fiqh)'s tier 8 framed the basmalah dispute: naming
the positions and what each rests on, not asserting one as final.

**Tier 9 is a precedent-less dilemma** (a friend embezzling from an orphans' charity fund) walked
through the assembled method: which of tier 4's six exceptions actually fits, which maqsad (mal,
tier 6 of Islamic Law/Fiqh) is at stake, proportional escalation from private correction under
tier 7 of Islamic Law (Fiqh)'s necessity framework, and haya' governing not just whether to
disclose but how.

**Data-integrity bug found and fixed during insertion** (see `docs/RUNBOOK.md` for the durable
lesson): after all 9 tiers were authored and validator-clean at the file level, the live
`answer_index_skew` check flagged index 1 used 116/180 times. Every authoring script had correctly
called `emit.rebalance()`, and every generated `.sql` file parsed to a clean 5/5/5/5 split — the
corruption was introduced by hand-retyping the INSERT text into the query call from memory/preview
rather than reading the file's exact content. Fixed by deleting the affected tiers (1, 2, 3, 5, 6,
7, 8, 9 — tier 4 had been pasted verbatim originally and was already correct) and re-inserting each
from a direct Read of its `.sql` file, verified individually and then re-confirmed with the full
category validator: all 9 tiers at 20/20, no near-duplicates, no repeated answers, no index skew,
no repeated stems.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 14. Du'a & Dhikr (`dua_dhikr`) — 180 / 180

Supplication and remembrance held to the same evidentiary standard as every prior category:
specific hadith numbers and narrators throughout, not paraphrased custom.

**Verified anchors:** Sahih Muslim 5269/5270 (Umar b. Abu Salama, naming Allah and eating from
what is nearest); Sahih al-Bukhari 5459 (Abu Umama's after-meal du'a), 6312/6324 (Hudhaifa's
sleeping/waking wording), 6384/6409 (Abu Musa al-Ash'ari — "la hawla wa la quwwata illa billah" as
"a treasure of Paradise"), 1012/1025 (istisqa — facing the qiblah, cloak reversed), 6403/6405/6406
(the post-prayer tasbih/tahmid/takbir counts and the "two phrases light on the tongue"), and 6408
(gatherings of dhikr sought out by angels); Sunan al-Tirmidhi 3426 (leaving-the-house du'a, graded
sahih), 3556 (Salman al-Farsi — Allah "too shy" to return raised hands empty, graded sahih), 3392
(Abu Bakr's morning/evening/bedtime wording); Sahih Muslim 2346 (the disheveled traveller whose
raised hands cannot overcome unlawful sustenance); Sunan Ibn Majah 927 (Abu Dharr, with the
narrator Sufyan's own admitted uncertainty over which phrase carries the 34th count).

**Tier 5 is this category's grading-territory tier**, the du'a counterpart to Islamic Law (Fiqh)'s
basmalah dispute: Sunan Abu Dawud 5081's "Allah sufficeth me" formula is graded mawdu' by al-Albani
and Muhammad Muhyi al-Din Abdul Hamid but "isnaad hasan" by Zubair Ali Zai — genuine grader
disagreement, not settled consensus — set against Tirmidhi 3386 (wiping the face after du'a) and
3552 ("whoever supplicates against his wronger has triumphed"), both da'if by every named grader.

**Tier 7 resolves a real three-way count discrepancy rather than only noting it.** Ibn Majah 927
shares tier 2's 33/33/34 post-prayer structure but its own narrator, Sufyan, admits he does not
know which phrase carries the extra count — making Sahih Muslim 1349's unambiguous naming of the
takbir the stronger report on that specific point, without discrediting Ibn Majah 927 overall
(hasan sahih / sahih lighairihi) or unsettling the underlying practice.

**Tier 8 states two genuinely contested scopes**, mirroring Islamic Law (Fiqh)'s and Islamic
Ethics' own tier 8s: how far Bukhari 6408's gathered-remembrance hadith extends to organised,
unison collective dhikr, and whether raising the hands has been established as a fixed, routine
practice specifically after every fard prayer, as opposed to the general adab tier 4 established.
Neither dispute is resolved in favour of one side.

**Tier 9 judges a precedent-less, fabricated-sounding claim** (a widely-circulated "recite 100
times after Fajr for guaranteed wealth" message citing no hadith number) through the assembled
method: tracing the citation, checking for grading, examining what the wording actually asserts,
comparing count variants, and separating the general adab from the specific unverified promise —
landing on calibrated caution rather than either blind acceptance or a claim of deliberate fraud.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 15. Sufism & Spirituality (`tazkiyah`) — 180 / 180

Flagged before authoring as the highest-risk category in the runbook (33 hadith matches in the
graded corpus, 28% weak — 1.61x the baseline). Anchored in classical texts and verified biography
rather than leaning on the thin hadith base, per that flag's own instruction.

**Verified anchors:** Qur'an 98:5, 39:2, 39:11 (sincere worship commanded), 87:14, 91:9-10
(purification of the soul), 49:13 (taqwa as the standard of nobility), 3:159, 65:3 (tawakkul),
2:153 (sabr), 12:53, 75:2, 89:27 (the three named stages of the nafs — ammara, lawwama,
mutma'inna); Sahih al-Bukhari 1 (intentions), 2697 (innovation rejected, paired with Sahih Muslim
4492); Sahih Muslim 93 (the hadith of Jibril defining ihsan), 6542 (Allah looks at hearts, not
bodies or faces).

**Tier 3 anchors two named classical works with live-researched biography**, not recollection:
al-Qushayri (376-465 AH, born Ustuwa, taught and died in Nishapur, imprisoned over a letter
defending Ash'arism) and his *Risala* (437 AH, addressed to the Sufi community, combining
biography with technical vocabulary); al-Ghazali (450-505 AH, Hujjat al-Islam, left the Nizamiyya
in 488 AH after a documented spiritual crisis) and the *Ihya' 'Ulum al-Din*'s four-quarter, forty-book
structure, plus *al-Munqidh min al-Dalal*'s survey of kalam, falsafa, Ta'limiyya and Sufism.

**Tier 5 grounds "where a teaching comes from" in al-Junayd al-Baghdadi's own dictum** — Sufi
knowledge is "bound by the Book and the Sunnah" — deliberately hedged as *widely attributed to and
recorded in* Abu Nu'aym's *Hilyat al-Awliya'* and al-Qushayri's *Risala*, rather than asserted as a
letter-perfect quotation, since the wording carries normal pre-modern transmission variance.

**Tier 7 states the sahw/sukr (sober/intoxicated) contrast between al-Junayd and Abu Yazid
al-Bistami with the same care**, hedging Abu Yazid's disputed death date (234-261 AH across
sources) and the non-canonical wording of his best-known ecstatic utterance, while noting the
dichotomy itself is partly a later systematised typology rather than a label either figure used of
himself.

**Tier 8 states the genuine three-way Sunni split on tasawwuf itself — accepted, qualified,
rejected — each in its own holders' terms**, per the runbook's explicit instruction that this tier
"must be handled without partisanship": the fully accepting position (ihsan/tazkiyat al-nafs as a
third dimension of religion, per al-Ghazali and al-Qushayri); Ibn Taymiyyah's qualified position
(praising named early Sufis and zuhd/tawbah by name in *Majmu' al-Fatawa*, while criticizing
specific doctrines like wahdat al-wujud and specific later practices, not the discipline itself);
and the milder modern rejecting position (islamqa/al-Fawzan style — the term and its institutional
apparatus post-date the Salaf, while the underlying sincerity and purification are already fully
covered). All three positions are shown converging on tier 9's capstone claim.

**Tier 9 tests a claim all three of tier 8's positions reject**: a self-styled teacher's assertion
of exemption from the five daily prayers, walked through tiers 4, 5, 7 and 8's assembled method to
a calibrated verdict that separates textual justification from the speaker's sincerity.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 16. Afterlife (Akhirah) (`akhirah`) — 180 / 180

**Verified anchors**: Qur'an 22:7, 64:7 (resurrection is certain), 2:24-25, 21:47 (the scale, no
soul wronged), 18:105 (deeds rendered weightless by disbelief), 15:43-44 (Hell's seven gates),
39:68 (two blowings of the Trumpet), 27:87 (a blowing causing terror), 11:107 (the conditional
clause used in the Hell-eternity debate), 4:169, 33:65, 72:23, 98:6 (*khalidina fiha abada*),
75:22-23 (radiant faces looking at their Lord), 83:15 (the veiled, used by al-Shafi'i as evidence
for seeing Allah), 47:15 (Paradise's rivers of milk, wine and honey), 81:5 (animals gathered);
Sahih al-Bukhari 4699 (the grave's testimony), 806 (As-Sirat and its hooks), 2440 (the second
bridge for interpersonal claims), 2790, 2809 (Paradise's hundred grades, Al-Firdaus), 6472, 5705
(the seventy thousand who enter without reckoning, 'Ukasha bin Muhsin's exchange), 218, 1378, 6055
(punishment in the grave for urine and gossip), 3803 (the Throne shaking at Sa'd bin Mu'adh's
death), 554, 573, 7434, 7435, 7436, 806, 4581, 6573, 7437, 7438 (seeing Allah compared to seeing
the moon and sun), 238, 876, 3486 (this Ummah last yet foremost), 4814, 4935 (the interval between
the two blowings, the surviving coccyx bone); Sahih Muslim 7045 (the physically large man weighing
nothing on the scale), 2868 (why the Prophet ﷺ will not ask to let people hear the grave's
punishment); Musnad Ahmad and Sunan an-Nasa'i 2055 (the grave-squeeze narration tied to Sa'd bin
Mu'adh); Jami' at-Tirmidhi 1071 (the grave widened seventy cubits); Sunan Abu Dawud 4753 (the
believer's and disbeliever's contrasting graves).

**Tier 5 is the category's grading-discipline tier**, built around a genuine surprise: the popularly
repeated claim that even Sa'd bin Mu'adh's grave was "squeezed" despite the Throne shaking at his
death turns out, on live research, to rest on a chain al-'Iraqi rated good, adh-Dhahabi called
reliable, and al-Albani accepted as authentic (Musnad Ahmad; Sunan an-Nasa'i 2055) — the opposite
of the "popular therefore weak" assumption the tier exists to correct. It is set beside Tirmidhi
1071 (graded only *hasan gharib*) and Abu Dawud 4753 (graded *sahih* by al-Albani in *Ahkam
al-Jana'iz*) to show that overlapping content does not merge two narrations' grades into one.

**Tier 6 works through the classical literal-versus-figurative question** for three cases — seeing
Allah (*ru'yatullah*), Paradise's rivers, and As-Sirat — naming the Sunni majority's literal
reading against the Mu'tazila's metaphorical one on vision specifically, without overstating either
side's numerical weight.

**Tier 7 reconciles two live tensions rather than asserting a false consensus**: Qur'an 27:87's
blowing of terror against 39:68's two blowings (Ibn Kathir, al-Tabari and al-Tha'labi's three-fold
*nafkhat al-faza'/al-sa'q/al-qiyam* framework, set candidly against al-Qurtubi's own two-blowing
count — live research found sources genuinely differ on which view is more widely held, so neither
is presented as "the" majority) and the "last yet foremost" tension of Bukhari 238.

**Tier 8, flagged in the tier map as contested-scope, states two live-researched internal-Sunni
debates non-partisanly**: the eternity of Hellfire (the overwhelming *khalidina fiha abada*
majority against Ibn al-Qayyim's well-documented *fana' al-nar* leaning in *Hadi al-Arwah* and
*Shifa' al-'Alil* — with Ibn Taymiyyah's own personal stance left explicitly unsettled, since later
Hanbali scholars disputed the attribution to him); and the mechanism of grave-punishment (majority
body-and-soul-together against Ibn Hazm's soul-only minority and Ibn al-Qayyim's *Kitab al-Ruh*
"ta'alluq" proposal) — deliberately declining to invent an al-Ghazali position on the latter that
could not be confirmed against a specific work.

**Tier 9's capstone reasons from tiers 1-8's own established principles into new, unaddressed
cases** (Paradise's unlisted fruits, a partial match to the seventy-thousand's named qualities, an
unfamiliar hadith found online, an unnamed Paradise grade, Qur'an 81:5's gathered animals) rather
than introducing fresh unverified claims, closing on the distinction between a text's silence and
its denial.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 17. Companions (Sahaba) (`companions`) — 180 / 180

**Verified anchors**: Sahih al-Bukhari 3656, 6738 (the Khalil hadith, Abu Bakr), 6280 ('Ali's
"Abu Turab" nickname, narrated by Sahl bin Sa'd), 466, 3654 (Abu Bakr weeping at the "choice"
sermon), 3294, 6085 (Satan avoiding 'Umar's path), 2778 ('Uthman's own account, under siege, of
the well of Ruma and equipping the army of Tabuk), 4416, 3706 (Hadith al-Manzila, 'Ali compared to
Aaron), 946, 4119 (the two groups' differing 'Asr-prayer readings at Banu Qurayza, and the
Prophet's ﷺ non-condemnation of either), 3667-3668 ('A'ishah's full account of 'Umar's shock,
Abu Bakr's address and Qur'an 39:30/3:144, and the Saqifah negotiation); Jami' at-Tirmidhi 3686
and Musnad Ahmad ('Umar's contested "prophet after me" saying, genuinely disputed between
al-Albani's endorsement and Ibn al-Jawzi's rejection); Sunan Abu Dawud 4607 and Jami' at-Tirmidhi
2676 (the Khulafa' ar-Rashidun hadith); Ibn Hajar al-'Asqalani's *al-Isaba fi Tamyiz as-Sahaba*
(the classical sahabi definition).

**Tiers 1-3 build identity from specific, traceable facts** — kunyas (As-Siddiq, Al-Farooq,
Dhun-Nurayn, Abu Turab, Abu Hurairah) each tied to a specific incident rather than an arbitrary
label; nisbas (Al-Ghifari, Al-Ansari, Al-Ash'ari) distinguished from kunyas; and the four
caliphs' successions, tenures, and causes of death individually verified rather than generalised.
This is also where the category's recurring bug pattern first appeared and was fixed: filling in
the same question template once per person (four "what was X's full name" questions, four "how
did X become caliph" questions) trips `emit.check()`'s trigram similarity even with no wording
literally repeated, since the check does not know the subject differs — logged in RUNBOOK.md.

**Tier 4 states Ibn Hajar's classical three-part sahabi definition** (meeting the Prophet ﷺ,
believing in him at that meeting, dying a Muslim) and works through its edge cases: no minimum
duration, no requirement to have narrated hadith, no social-status restriction, and an explicitly
flagged genuine dispute over very young children with no retained memory of the meeting.

**Tier 5 pairs each caliph's Bukhari-sourced virtue with a grading exercise**, then contrasts
'Umar's two virtue-sayings directly: the Satan-avoidance hadith (sahih, in Bukhari itself) against
the popularly repeated "if there were a prophet after me" saying (hasan gharib per at-Tirmidhi,
sahih per al-Albani, rejected by Ibn al-Jawzi — genuinely contested, not settled either way). This
tier's insert also surfaced a second bug: four different "how is this graded?" questions sharing
the identical correct-answer text ("Sahih, carrying the standing authenticity of material within
Sahih al-Bukhari itself"), which passed `emit.check()` clean but failed the database's
`answer_repeated` check after insertion — fixed by rephrasing three of the four and logged in
RUNBOOK.md alongside the template-collision lesson.

**Tiers 6-7 each work a single incident in full, primary-source depth**: 'Umar's shock at the
Prophet's ﷺ death, Abu Bakr's address and the Saqifah negotiation (Bukhari 3667-3668, including
the un-elaborated "Allah has killed him" exchange about Sa'd bin 'Ubadah, deliberately not
extended beyond what the hadith itself states); and the Banu Qurayza 'Asr-prayer disagreement
(Bukhari 946, 4119), read as validating sincere ijtihad without overclaiming that both readings
were equally the Prophet's ﷺ actual intent.

**Tier 8, flagged in the tier map as the hardest bucket, reports where historians differ on the
Fitna without adjudicating between Companions**: the Battle of the Camel and Siffin's parties
named without ranking blame; al-Tahawi's, al-Sabuni's, Ibn Taymiyyah's (*Minhaj al-Sunna*), and
al-Nawawi's own creedal instructions to withhold judgment, quoted directly; 'A'ishah's reported
regret hedged as widely repeated but not independently verified to a single isnad; and
'Abdullah ibn Saba's historicity presented as a live, unresolved dispute among modern historians
(skeptics including Wilferd Madelung and Bernard Lewis; affirming voices including Sean Anthony),
tracing the core issue to reliance on the weakly-graded narrator Sayf ibn 'Umar al-Tamimi.

**Tier 9's capstone reapplies each of tiers 1-8's specific principles to new, unaddressed cases**
(a modern ambiguous instruction, an unsourced viral virtue-saying, an overconfident historical
verdict, an isolated out-of-context quotation, a hypothetical near-miss sahabi case) rather than
merely repeating prior facts.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 18. Ahl al-Bayt (`ahl_al_bayt`) — 180 / 180

Verified anchors: Sahih al-Bukhari 3/3432/3815/3820/3896/3714/3767/3729/3753/5994/6194/1382/6195/1043/1060/1303;
Sahih Muslim 2424; Jami' at-Tirmidhi 3768/3205; Sunan Ibn Majah 118; Qur'an 33:28-34; Ibn Kathir's and
al-Wahidi's tafsir on 33:33; al-Tabari, al-Qurtubi, al-Razi, and al-Nasafi on the same verse's pronoun
grammar; Ibn Qudamah's *al-Mughni*, al-Nawawi's *al-Majmu'*, and al-Shawkani's *Nayl al-Awtar* on the
Banu Hashim/Banu al-Muttalib zakat boundary.

**Tiers 1-3** cover core identity (Khadijah, Fatimah, Hasan, Husayn; all eleven wives; three sons and
four daughters, with Ibrahim's death and the Dhun-Nurayn epithet cross-referenced to the Companions
category) and lineage/terminology (the blood-cousin tie through 'Abd al-Muttalib versus the tie through
Fatimah; Zayn al-'Abidin; Sayyid/Sharif usage hedged as regionally variable; Fatimah's birth year and
Hasan's poisoning both handled with explicit restraint — reported without inventing an unconfirmed
culprit or date). The per-person-template trigram-collision pattern first found in Companions recurred
here and was fixed the same way: varying sentence structure per person rather than swapping only a name.

**Tier 4, the scope-with-condition tier, is where the Sunni hard condition from the handoff binds
hardest in this category**: Qur'an 33:33 read in its 33:28-34 context; the mainstream Sunni inclusive
reading (Ibn Kathir, described as majority) set against al-Wahidi's minority wives-only reading; the
Hadith al-Kisa (Sahih Muslim 2424) noted as agreed-authentic across Sunni and Shi'a scholarship while
its scope-implication is not; the fiqh-based Banu Hashim definition (zakat-barred, khums-entitled); and
the Twelver Shi'a "Five of the Cloak" narrower reading described factually and without polemic, per the
tier map's explicit instruction never to present the Sunni reading as though no other reading existed.

**Tier 5, a grading tier, carries a deliberate lesson**: the "leaders of the youth of Paradise" hadith is
sourced to Jami' at-Tirmidhi 3768 and Sunan Ibn Majah 118 — not Bukhari or Muslim — graded hasan sahih by
at-Tirmidhi and authenticated by al-Albani, making the explicit point that absence from the two Sahihs
does not mean weak.

**Tier 6 recovers the Hadith al-Kisa's narrative context**: 'A'ishah's Sahih Muslim 2424 account (a
striped black camel's-hair cloak; the sequence Hasan, Husayn, Fatimah, 'Ali; no location given) set
beside the separate Umm Salamah account (Tirmidhi 3205; her exchange with the Prophet ﷺ hedged as
variably worded, not a harsh rejection); the event's date left unfixed, with the popular "632 CE" figure
flagged as ungrounded in the primary sources; and Qur'an 33:28-32's immediate literary context (the
Verse of Choice, doubled reward/punishment, the plain-speech instruction) laid out in detail.

**Tier 7 traces a genuine Sunni-internal grammatical dispute**: the feminine plural forms (-kunna) used
throughout 33:28-32 and 33:34 against 33:33's own shift to masculine plural (-kum); al-Razi and
al-Nasafi reading the shift as a deliberate signal supporting the inclusive reading; the taghlib
counter-argument (that "ahl" is itself a grammatically masculine noun, making -kum ordinary concord, not
evidence of a referent shift) associated by name with Ikrimah and Muqatil, who cite 33:34's return to
feminine forms as bracketing evidence for the restrictive reading; al-Qurtubi's inclusive-but-mediating
position noted as holding both textual observations together rather than settling the grammar in only
one direction.

**Tier 8, a fiqh scope-dispute tier, required a mid-draft correction**: the originally planned premise —
a genuine dispute over whether the Prophet's ﷺ wives are covered by the zakat-prohibition rule — was
checked against research and found false (Ibn Kathir affirms their inclusion as settled, not disputed).
The tier was rebuilt around the real, verified dispute instead: the Shafi'i school includes Banu
al-Muttalib alongside Banu Hashim in the zakat-ineligible/khums-entitled group (citing a hadith tying the
two clans together through the historical Quraysh boycott), against the Hanafi/Maliki/jumhur-majority
position restricting the boundary to Banu Hashim alone (Ibn Qudamah's *al-Mughni*, al-Nawawi's
*al-Majmu'*), with al-Shawkani's separate mawali-of-Banu-Hashim-versus-mawali-of-wives distinction noted
as a different question not to be conflated with the main dispute.

**Tier 9's capstone reapplies each of tiers 1-8's specific principles to new, unaddressed cases** (a new
unsourced virtue-claim, an isolated out-of-context quotation, a fresh pronoun-shift passage, three
distinct overgeneralization corrections drawn from tiers 4/8, and a closing comparison to the Companions
and Afterlife categories' own capstone tiers) rather than merely repeating prior facts.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 19. Other Prophets (`stories_of_prophets`) — 180 / 180

Verified anchors: Qur'an 2:31/2:34/2:258/3:33/3:59/3:93/4:125/4:163/4:164/6:74/6:83-86/7:65/7:73/7:85/7:106-108/9:12-15/11:27/11:44/11:69-76/12:3/12:4/14:10-11/14:37/14:39/16:36/17:90-93/18:22/18:25/18:50/18:74/18:80-81/19:12-15/19:29-33/19:56-57/20:9-36/20:115-123/21:25/21:51-70/21:78-79/21:83-84/21:85/21:87-88/26:111/26:153/26:161-186/27:16/27:22-44/28:4-6/28:29-35/28:78-79/29:14/34:34-35/37:83-98/37:99-113/37:139-148/38:48/43:22-24/51:24-34/54:1-2/68:48-50/71:7/71:21/71:26; Sahih al-Bukhari 1339/2262/3397/3407/3461/4485/7362; Sahih Muslim 1130; Ibn Kathir's and al-Tabari's tafsir on 37:99-113.

**Tiers 1-3** cover the five founding names and one fact each (Adam, Nuh, Ibrahim, Musa, 'Isa), the 25 named prophets with their scripture-recipients, and lineages/sequence — each tier explicit about which claims are the Qur'an's own wording versus later convention (the traditional "25" figure, the Ya'qub/Isra'il identification, "Kan'an" and "Namrud" as unnamed figures' popular names).

**Tier 4** traces the universal tawhid message (21:25, 16:36, the shared Al-A'raf formula) against a gallery of specific demands and excuses peoples raised — Pharaoh's demand for a sign, Quraysh's escalating list (17:90-93), "we found our fathers upon a religion" (43:22-24, shared by Ibrahim's own people), and Qarun's wealth-as-proof episode — closing on the tier's own point: the message stayed constant; only the objections varied.

**Tier 5, "the governing distinction of this category,"** sorts specific details into Qur'anic (Ibrahim's father Azar, 6:74; the Cave's number deliberately left unsettled, 18:22), sound-hadith-supplementing (Musa striking the Angel of Death, Bukhari 1339/3407; the Ashura/Musa hadith, Bukhari 3397/Muslim 1130), and isra'iliyyat (Talut/Jalut cross-identified with Saul/Goliath; the ram's forty-years-in-Paradise tradition; "Balqis," "Jaysur," and the traditional names for Nuh's and Lut's wives) — with an explicit note that even "hadith-sourced" material varies in strength (the 124,000-prophets hadith, outside the Sahihayn).

**Tier 6** reads four specific placements for their rhetorical purpose: Musa/Pharaoh in Surah Al-Qasas framed by 28:4-6's promise to the oppressed; Yusuf's story framed by 12:3 and traditionally tied to the Year of Sorrow; Ibrahim's idol-rejection inside Surah Al-Anbiya's tawhid refrain and again in Surah As-Saffat's sequence of vindicated prophets; and Surah Al-Kahf's four-trials structure (religion, wealth, knowledge, power) under 18:1-8's opening warning.

**Tier 7** compares parallel Qur'anic tellings of the same story for what each specifically adds: Musa's calling in Ta-Ha, An-Naml, and Al-Qasas; Adam and Iblis in Al-Baqarah, Al-A'raf, and Ta-Ha; Ibrahim's angelic guests in Hud, Adh-Dhariyat, and Al-Hijr — each telling shown as a genuine, complete account suited to its own surah, not a flawed repetition of a single "real" version.

**Tier 8** traces named mufassirun disagreement and isra'iliyyat-handling: al-Tabari's preference for Ishaq against Ibn Kathir's preference for Isma'il as Ibrahim's intended sacrifice (with Ibn Kathir explicitly tracing the Ishaq reports to Ka'b al-Ahbar); Ibn Kathir's citing-while-flagging treatment of the sacrificial ram's Paradise-grazing reports and al-Khidr's boy; and his three-part isra'iliyyat framework (accept if corroborated, reject if contradicted, narrate-but-don't-rely-on otherwise), rooted in Bukhari 3461 and 4485/7362.

**Tier 9's capstone reapplies each of tiers 1-8's specific principles to new, unaddressed cases** (Ayyub's episode applying tier 1's method; a false "124,000 prophets is Qur'anic" claim corrected via tiers 2 and 5; Salih's she-camel demand as a new instance of tier 4's pattern; Dhul-Qarnayn's disputed identity applying tier 8's method) rather than merely repeating prior facts.

One `answer_repeated` violation was caught post-insert (the correct-answer text "Isma'il" used identically in three separate questions across tiers 2, 3, and 8) and fixed via targeted `UPDATE` statements rewording two of the three instances; the category re-validated clean afterward.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 20. Miracles & Signs (`miracles_signs`) — 180 / 180

Verified anchors: Qur'an 2:23-24/10:38/11:13/17:88 (Qur'anic inimitability challenge); 13:38/40:78 (signs by Allah's permission only); 54:1-2 (moon-splitting) with Sahih al-Bukhari 3868/3869 and Sahih Muslim 2800a; 17:1 (Isra') with Sahih al-Bukhari 3887 and Sahih Muslim 162 (Mi'raj); Musa's signs (7:107-108/20:17-22/27:10/28:31/17:101); 'Isa (3:49/19:29-33), Salih (7:73/11:64/26:155), Ibrahim (21:69), Sulayman (21:81-82/27:16-19/27:38-40), Dawud (34:10/21:79-80), Yunus (37:142-144), Nuh (29:15); al-Baqillani's *at-Tamhid* on mu'jizah conditions; Sahih al-Bukhari 3583/3572/3579 (tree trunk, water from fingers) against Sunan Abi Dawud 2549/al-Hakim's *al-Mustadrak* (complaining camel) against al-Bayhaqi's *Dala'il al-Nubuwwah* (pebbles) against al-Albani's/Ibn 'Uthaymeen's grading of the spider-web story; Ibn Kathir's, al-Tabari's, al-Razi's, al-Qurtubi's, Rashid Rida's, al-Maraghi's, al-Shanqiti's, and Sayyid Qutb's readings of 54:1; classical Ash'ari-Maturidi-Hanbali consensus and Ibn Taymiyyah's writings on karamat al-awliya.

This is the category the tier map itself flags as carrying the highest risk of fabricated material in popular circulation, requiring "the tightest citation discipline of the 29" and the explicit rule that a weak narration may never ground a ruling question — only a question about the narration itself.

**Tiers 1-3** cover the general basis for prophetic signs (13:38, 40:78) and the Qur'an's own claimed inimitability (the four challenge verses, 2:23-24/10:38/11:13/17:88, argued as the Qur'an's own status as "the greatest sign" since its challenge stays open and testable rather than being a single historical event); the moon-splitting, Isra'/Mi'raj, and Musa's staff, each showing a Qur'anic core with hadith or repeated-telling supplying further detail; and prophet-by-prophet sign matching (nine prophets, each tied to an exact citation).

**Tier 4** lays the definitional groundwork this category needed before its hardest tier: the mu'jizah/karamah/istidraj kalam framework, al-Baqillani's five evidentiary conditions for a mu'jizah, and the direct consequence that prophethood's closure means no event today can function as a mu'jizah.

**Tier 5, "this category's whole discipline,"** grades four specific miracle-hadiths side by side — the tree-trunk and water-from-fingers narrations (Sahih al-Bukhari, the strongest tier), the complaining camel (sound but outside the Sahihayn, graded by al-Hakim with al-Dhahabi's concurrence), the pebbles-glorifying narration (a weaker, less certain chain), and the spider-web-at-Thawr story (no authentic basis at all, ruled da'if by al-Albani and called unauthenticated by Ibn 'Uthaymeen) — plus the shadowless-Prophet claim and the NASA-moon-photo myth as, respectively, a weak-chain example and a modern empirical misattribution distinct from any hadith-grading question.

**Tier 6** pairs a genuine classical mufassir divide (54:1's literal-past majority against a named minority reading it as a future eschatological sign, plus Sayyid Qutb's separate emphasis argument) against a case with no comparable genuine classical debate (34:12's wind-sign, essentially classical consensus as literal, with a figurative reading belonging only to modern commentary) — teaching that not every claimed "interpretive question" carries equal weight.

**Tier 7** compares the Mi'raj's dominant bodily-journey position (strong chains) against a minority vision-only position whose attribution to 'A'ishah rests on a weak, disconnected chain — a real position, weakly attributed — against the moon-splitting's several transmitted versions, which differ only in framing (Ibn Mas'ud's first-person wording versus Ibn 'Abbas's and Anas's demand-and-response framing) without any difference in grading.

**Tier 8** gives a careful, three-position account of karamat al-awliya: the Ash'ari-Maturidi-Hanbali consensus affirming karamat as real-but-non-prophetic; the Mu'tazilite historical rejection on a specific confusion-with-prophethood concern; and Ibn Taymiyyah's own position — affirming karamat's reality while subordinating them to mu'jizat and separately criticizing specific unverifiable, self-serving, or shirk-adjacent grave-centered invocations of them, without that criticism amounting to a blanket rejection.

**Tier 9's capstone reapplies each of tiers 1-8's specific principles to new, unfamiliar miracle claims** (a superiority-claim corrected via tier 4, an uncited tree-bowing story corrected via tier 5, a satellite-photo claim distinguished from a hadith-grading question, three overgeneralization corrections drawn from tiers 5/6/8, and closing comparisons to the Other Prophets and Companions categories' own capstone tiers) rather than merely repeating prior facts.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 21. Women in Islam (`women_in_islam`) — 180 / 180

Verified anchors: Sahih al-Bukhari 3/3815/3816 (Khadijah); Qur'an 19 and 3 (Maryam, 'Imran); Qur'an 4:4/4:7/4:11-12/4:19/4:24/4:32/4:176 (mahr and inheritance); Sahih al-Bukhari 5136; Sunan Ibn Majah 1873 (marital consent); Sahih al-Bukhari 304/3331/5186, Sahih Muslim 1468 (grading-discipline tier); Jami' at-Tirmidhi 1159 (prostration saying); Qur'an 24:6-9/33:53/33:59/58:1-4 (occasions of revelation); Sahih al-Bukhari 900/1088, Sahih Muslim 442 (travel and masjid attendance); Sunan Abi Dawud 2085, Jami' at-Tirmidhi 1101, Qur'an 2:229/2:282 (four-madhab differences on wali, khul', and testimony).

**Tiers 1-3** cover Khadijah, 'A'ishah, and Maryam's distinct, separately sourced bases of recognition (hadith-recorded status versus Maryam's unique Qur'anic naming and surah); inheritance, property, and marital-consent rights, each anchored to its own citation and pre-Islamic baseline; and named contributors — 'A'ishah's traditionally-cited 2,210-narration count (traced to Ibn Hazm, explicitly flagged as an estimate rather than an exact primary tally), Fatimah al-Fihri's founding of al-Qarawiyyin (859 CE, recognized by UNESCO and Guinness as the oldest continually operating degree-granting institution), and Umm al-Darda al-Sughra's documented teaching of a future caliph.

**Tier 4** pairs mahr's status as the wife's own exclusive, consent-only-waivable property with inheritance's genuine variance: the widely repeated "female gets half" ratio holds for full/paternal-sibling kalalah (4:176) but is corrected by 4:12's maternal-sibling kalalah, which gives equal shares regardless of sex — an exception frequently conflated with the wrong verse.

**Tier 5, where "weak material circulates from every direction,"** works through a graded cluster: Bukhari 304 ("deficient in intelligence and religion") and the "crooked rib" hadith are both genuinely sahih but widely decontextualized/misunderstood; the prostration saying (Tirmidhi 1159) is hasan gharib and read as rhetorical, not literal, permission; and "had it not been for women, Allah would truly have been worshipped," "consult women and then oppose them," and two related sayings are outright fabricated or rejected — each classified by its actual grading, never by how the wording sounds.

**Tier 6** traces four occasions of revelation (4:19's widow-inheritance correction, 24:6-9's li'an case, 33:53 versus 33:59's often-conflated curtain/jilbab incidents, and 58:1-4's zihar case), explicitly flagging the Khawlah "seventh heaven" quote's disputed 'A'ishah-versus-'Umar attribution as unresolved rather than asserting one version as settled.

**Tier 7** distinguishes genuine textual variation (the mahram-travel hadith's differing distance-thresholds across narrations, reflecting different questions rather than contradiction) from a still-open modern fiqh debate (safe contemporary travel), and separates the masjid-attendance hadith's own wording from 'A'ishah's own appended ijtihad in the same narration-cluster.

**Tier 8** gives a careful, evidenced account of three genuine four-madhab disputes: the wali requirement (Hanafi's conditional non-requirement, evidenced by 2:230/2:232 and qiyas, against the other three schools' "no marriage except with a wali" hadith); khul's procedural mechanism (mutual-agreement versus judicial compulsion) and its talaq-versus-faskh classification; and testimony's genuine context-specificity (2:282's ratio applies only to financial-debt documentation, while a single trustworthy woman's testimony alone is accepted in matters like childbirth and breastfeeding across all four schools).

**Tier 9's capstone reapplies each of tiers 1-8's specific principles to contemporary questions the classical texts never faced** (an uncited social-media hadith, a joint-account salary proposal, an online marriage contract, text-message khul', video-recorded childbirth testimony) rather than inventing new rulings or repeating prior facts.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 22. Islamic History (`islamic_history`) — 180 / 180

Verified anchors: the Prophet's ﷺ birth (~570 CE) and first revelation (~610 CE); the Hijrah (622 CE) and the Hijri calendar's later, retroactive institution under 'Umar; the conquest of Makkah (630 CE) and the Prophet's ﷺ death (632 CE); the Rashidun order (Abu Bakr, 'Umar, 'Uthman, 'Ali) and the Umayyad (661-750 CE, Damascus) and Abbasid (750 CE onward, Baghdad) dynasties, with the surviving Umayyad branch in al-Andalus; the Battle of Yarmouk (~636 CE, against Byzantium), al-Qadisiyyah (mid-630s CE, against Sassanid Persia, exact year not fixed across sources), the negotiated surrender of Jerusalem (~637-638 CE), and the Battle of Tours/Poitiers (commonly 732 CE, some dating disagreement); the Byzantine-Sassanid War's mutual exhaustion, Sassanid succession instability, provincial religious tension, and administrative continuity as the conquests' commonly cited contributing factors; al-Tabari's *Tarikh al-Rusul wa'l-Muluk*, al-Baladhuri's *Futuh al-Buldan*, and Ibn al-Athir's *al-Kamil fi'l-Tarikh*; the Ridda Wars, 'Umar's Sawad land policy, and 'Uthman's Qur'anic standardization; the Saqifah succession and 'Uthman's assassination; and Sayf ibn 'Umar as a widely-quoted but critically unreliable narrator.

This category is built on two distinct forms of caution the tier map called for: flagging genuinely disputed dates honestly instead of asserting false precision, and presenting a Sunni-Shia historical divergence (Saqifah) as a real, evidenced disagreement between two traditions rather than adjudicating a winner.

**Tiers 1-3** cover Islam's Makkah-to-Madinah origin and the Rashidun succession; the Rashidun-Umayyad-Abbasid dynastic sequence anchored to each dynasty's capital city (Damascus versus Baghdad), with the al-Andalus branch as a separate continuation; and the early conquests' battles and dates, with Qadisiyyah's exact year and Tours/Poitiers' commonly-cited-732-CE figure both explicitly flagged as not universally agreed rather than stated as settled.

**Tier 4** surveys the commonly cited combination of factors behind the conquests' rapid success — prior Byzantine-Sassanid exhaustion, Sassanid succession instability, provincial religious tension, administrative continuity, and disciplined mobility — explicitly rejecting any single-cause explanation (sheer numbers alone, pure chance) as an oversimplification.

**Tier 5** introduces the three chroniclers by their distinct scope and method: al-Tabari's universal history preserving multiple, sometimes contradictory transmitted reports side by side rather than settling on one; al-Baladhuri's narrower focus on the conquests and their administrative aftermath; and Ibn al-Athir's later synthesis condensing both into a more streamlined narrative — establishing that a chronicle's inclusion of a report is not itself a certification of that report's reliability, a point tier 8 builds directly on.

**Tier 6** works through three early administrative and religious decisions — the Ridda Wars (Abu Bakr's view that allegiance could not be selectively withdrawn), 'Umar's Sawad land policy (retaining conquered land under collective administration rather than distributing it as booty, against some soldiers' expectations), and 'Uthman's Qur'anic standardization (prompted by growing regional recitation variance) — as a common thread of holding a rapidly expanding community together.

**Tier 7** presents the Saqifah succession and 'Uthman's assassination side by side as the category's two-accounts-of-one-event tier: the Saqifah succession is given both the mainstream Sunni characterization (a legitimate consultative process) and the mainstream Shia characterization (bypassing the Prophet's ﷺ own explicit designation of 'Ali) without adjudicating between them, while 'Uthman's assassination is presented with its contested circumstantial detail (grievances, responsibility, organization) rather than as a settled morality tale.

**Tier 8** builds its entire content around Sayf ibn 'Umar as a single worked case in historical source criticism: a widely quoted 8th-century narrator whose isnad and content were found unreliable by later critics, whose material nonetheless appears extensively in al-Tabari because chronicle inclusion reflects compilation method rather than certification of reliability — teaching the same isnad-and-matn toolkit used for hadith grading, applied instead to historical reports (akhbar), and the distinction between judging a narrator unreliable and assuming every event he described never happened.

**Tier 9's capstone reapplies each of tiers 1-8's specific principles to new, unattributed claims** (a scrambled Rashidun order, reversed dynastic capitals, an overstated Tours/Poitiers date, a single-cause conquests claim, a misdescribed al-Tabari method, a false Sawad-distribution claim, an incomplete Saqifah presentation, an uncritical Sayf ibn 'Umar anecdote, a reversed First Fitna transition, and a misdescribed Jerusalem siege) rather than merely repeating prior facts.

A `stem_repeated` violation was caught in the full-category validator after all nine tiers were inserted (the 20-character opening "considering this tie[r]" used five times across tiers 1, 2, 4, 5, and 8) and fixed via two targeted `UPDATE` statements rewording the tier 1 and tier 2 instances; the category re-validated clean afterward on every check (tier counts, near-duplicates, answer-index balance, repeated answers, repeated stems).

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 23. Sacred Geography (`sacred_places`) — 180 / 180

Verified anchors: Makkah, Madinah, the Ka'bah, and Masjid al-Aqsa's basic identities; the qiblah change from Jerusalem to Makkah (Qur'an 2:144), with the al-Bara' ibn 'Azib narration's own hedged "sixteen or seventeen months" wording preserved rather than rounded to a single figure; the Hajj ritual site sequence (miqat/ihram, Arafat on 9 Dhul-Hijjah, Muzdalifah, Mina's Jamarat), Sa'i's genuinely variable timing across Hajj types, and historic city names (Yathrib for Madinah, Bakkah for Makkah, Iliya/Bayt al-Maqdis for Jerusalem); the haram sanctuary designation — corrected mid-research from an assumed "two or three mosques" premise to the actual three sanctuaries (Makkah unanimous, Madinah majority, Wajj near Ta'if minority-disputed), with Masjid al-Aqsa's "al-Haram al-Sharif" title identified as honorific rather than the same binding legal designation, plus the Makkah Haram's direction-varying boundary distances; the three-mosques hadith (Sahih al-Bukhari 1189/Sahih Muslim 1397, Muttafaqun 'alayh) and the prayer-multiplier hadith cluster graded by source (Bukhari 1190/Muslim 1394 for the thousand-prayers figure at Masjid an-Nabawi; Musnad Ahmad/Ibn Majah for the hundred-thousand figure at Masjid al-Haram; a separately weak/da'if fifty-thousand figure for Masjid al-Aqsa, corrected from an initially assumed "well-graded" premise); the Isra' and Mi'raj (Qur'an 17:1) with its genuinely disputed year and the customary, not textually established, "27 Rajab" date; Masjid Quba as the first mosque of Islam (Qur'an 9:108); the precise Masjid al-Aqsa/Dome of the Rock distinction, including the term's narrow-versus-loose usage; and the genuine classical debate over grave-visitation travel and the three-mosques hadith's scope (Ibn Taymiyyah's narrower restriction on dedicated travel-intention versus Qadi 'Iyad/al-Nawawi/al-Subki's broader affirming position), corrected from an initial oversimplified "Ibn Taymiyyah banned grave visitation" premise.

This category's research pass corrected four separate premises before any drafting began — the haram-designation count, two of the three prayer-multiplier gradings, the "27 Rajab" date's actual evidentiary status, and Ibn Taymiyyah's real position on grave-visitation travel — each flagged explicitly rather than drafted from initial assumption.

**Tiers 1-3** cover the four foundational sites, which city holds which named masjid alongside the one qiblah change, and the Hajj ritual sequence, approximate (explicitly flagged as approximate) inter-site distances, and historic city naming.

**Tier 4, the scope-with-condition tier,** corrects the "two or three mosques carry haram status" premise with the researched reality: Makkah unanimous, Madinah majority-with-minor-dissent, Wajj near Ta'if minority-disputed, and Masjid al-Aqsa's honorific "al-Haram al-Sharif" title explicitly distinguished from binding legal haram status — plus the Makkah Haram's boundary markers sitting at genuinely varying, not uniform, distances by direction.

**Tier 5, this category's grading-discipline tier,** grades three prayer-multiplier figures side by side: the thousand-prayers figure for Masjid an-Nabawi (Muttafaqun 'alayh, Bukhari 1190/Muslim 1394), the hundred-thousand figure for Masjid al-Haram (Ahmad/Ibn Majah via Jabir, judged authentic by later critics including al-Albani despite falling outside the two Sahihs), and the fifty-thousand figure for Masjid al-Aqsa specifically (da'if, an unidentified narrator in its chain) — the last corrected mid-research from an initially assumed "well-graded" premise to its actual weak grading.

**Tier 6** traces the specific event behind each site's significance — Masjid al-Aqsa's Isra' (Qur'an 17:1) and earlier status as the first qiblah, Madinah's Hijrah, and Masjid Quba's founding (Qur'an 9:108) — while explicitly flagging that the Isra'/Mi'raj's exact year is genuinely disputed among classical scholars and that the popular "27 Rajab" date is customary rather than textually established, a correction made after the research pass flagged the premise.

**Tier 7** distinguishes Masjid al-Aqsa (the mosque building, narrow sense) from the Dome of the Rock (a separate shrine over the foundation stone, built by 'Abd al-Malik ibn Marwan c. 691-692 CE), while also naming the term's common looser usage — "Al-Aqsa" referring to the entire compound — as a genuine, non-erroneous alternative usage rather than simply a mistake to correct.

**Tier 8** presents the genuine classical debate over grave-visitation travel and the three-mosques hadith's scope with full evidentiary care on both sides: Ibn Taymiyyah's actual, narrower position (restricting only travel undertaken specifically and solely for grave-visitation, while affirming the grave-visit itself once present) against Qadi 'Iyad's/al-Nawawi's/al-Subki's broader affirming position (grave-visitation travel is itself permissible and recommended), including that al-Subki's own rebuttal (*Shifa' al-Siqam*) has drawn internal critique of its own — research explicitly corrected an initial "Ibn Taymiyyah banned grave visitation" oversimplification before drafting began.

**Tier 9's capstone reapplies each of tiers 2-8's specific corrective principles to new, unattributed claims** (a shrine-travel misapplication of the three-mosques hadith, an unsourced fourth-haram claim, an uncorrected fifty-thousand-prayers claim, a false "27 Rajab consensus" claim, a Dome-of-the-Rock/mosque-building conflation, an overstated Ibn Taymiyyah characterization, an ihram-timing error, a uniform-boundary-distance error, and a Yathrib/Jerusalem and Bakkah/Yathrib naming confusion) rather than merely repeating prior facts.

A post-insert `answer_repeated` check flagged four short place-name answers ("Makkah" 4x, "Masjid al-Haram" 3x, "Madinah" 3x, "Masjid an-Nabawi" 3x) — an outcome largely inherent to a geography category's easy tiers, where the correct answer is often just the place name itself — fixed via five targeted `UPDATE` statements adding minor qualifying text to specific choice entries; a `stem_repeated` violation ("considering this tie[r]" at 6x) was also caught and fixed via two targeted rewordings. The category re-validated clean on every check afterward.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 24. Islamic Arts & Culture (`arts_culture`) — 180 / 180

Verified anchors: minaret/calligraphy/mihrab/minbar/muqarnas basic vocabulary; the Blue Qur'an, Baysunghur Qur'an, and Qur'an of Sultan Baybars al-Jashnagir as named illuminated manuscripts; five named calligraphy scripts (Kufic, Naskh, Thuluth, Diwani, Nasta'liq) and eight named mosques (Masjid al-Haram, Masjid an-Nabawi, the Umayyad Mosque of Damascus, the Great Mosque of Cordoba, the Blue Mosque, the Süleymaniye Mosque, the Badshahi Mosque, the Sheikh Zayed Grand Mosque); Mimar Sinan's career and the Süleymaniye/Selimiye Mosques; the Umayyad Mosque of Damascus (al-Walid I), the Great Mosque of Samarra's malwiya (Abbasid, al-Mutawakkil), the Alhambra (Nasrid), and the Dome of the Rock's own foundation inscription (AH 72/691-692 CE, 'Abd al-Malik) including its later al-Ma'mun name-substitution while preserving the original date; documented early qiblah-orientation deviation at the mosques of Kufa, Wasit, and Baghdad; the minbar's evolution and reported enlargement under Mu'awiya I; muqarnas's dual decorative/structural role; the Blue Qur'an's genuinely disputed dating and origin (Jonathan Bloom's Fatimid-Kairouan hypothesis, not settled consensus) and its dispersed surviving fragments; the popularly-but-not-provenly "Uthmanic" association carried by the Topkapı manuscript and the Samarkand Kufic Qur'an; the Verse of Light (Qur'an 24:35) on Mamluk mosque lamps and an Isfahan mihrab; Amanat Khan's signed Taj Mahal inscriptional program (Surahs Ya-Sin, al-Zumar, al-Fajr); Ottoman-versus-Mughal architectural comparison; the Ibn Muqla/Ibn al-Bawwab Kufic-to-Naskh transition (10th-11th centuries); and the genuine classical/art-historical debates on figural depiction (Bukhari hadith on image-makers, the courtly-miniature-painting exception, Oleg Grabar's scholarship) and on music (Ibn Taymiyyah, Ibn Hazm, Abu Hamid al-Ghazali, Ahmad Ghazali's *Bawariq al-Ilma'*).

This category's research pass corrected several premises before drafting began: the number of genuinely settled architect/inventor attributions (Badshahi's architect, the Taj Mahal's architect, and Nasta'liq's traditional inventor are each flagged as disputed rather than settled, contrasted with Amanat Khan's own signed, contemporaneous inscription); the Blue Qur'an's origin (a leading hypothesis, not a consensus); and the shape of the figural-depiction and music debates, which the research explicitly cautioned against flattening into "Islam bans/allows X."

**Tiers 1-3** cover basic architectural and artistic vocabulary, five named scripts and eight named mosques with their standout features, and script/architect/dynasty/period matching — the last explicitly distinguishing well-attested attributions (the Dome of the Rock's own foundation inscription, Amanat Khan's signed calligraphy) from popularly repeated but genuinely disputed ones (Badshahi's architect, the Taj Mahal's architect, Nasta'liq's traditional inventor).

**Tier 4** covers three design conventions each with a specific qualifying condition: the mihrab's qiblah orientation, including the real, academically documented phenomenon of measurable early-mosque qiblah deviation (Kufa, Wasit, Baghdad) tied to less precise pre-spherical-trigonometry orientation methods rather than any doctrinal disagreement; the minbar's ceremonial function and its reported historical enlargement under Mu'awiya I; and muqarnas's structural role specifically when bridging a square base to a round dome, distinct from its purely decorative use elsewhere.

**Tier 5** distinguishes well-attested manuscript/monument evidence from popular but less certain tradition: the Blue Qur'an's genuinely disputed dating and origin (with Bloom's own methodological caution that long presence in a location does not prove production there) against the Dome of the Rock's own foundation inscription as a textbook case of primary evidence settling a dating question, and the popularly-but-not-provenly "Uthmanic" association carried by more than one manuscript (the Topkapı manuscript, the Samarkand Kufic Qur'an in Tashkent).

**Tier 6** examines specific motifs in their original context: geometric pattern's common but explicitly hedged art-historical "infinite divine unity" reading (a scholarly interpretive convention, not settled theological doctrine); muqarnas's dual decorative/structural meaning revisited; and two specific, checkable verse-to-function pairings — the Verse of Light (24:35) on Mamluk mosque lamps and an Isfahan mihrab, and Amanat Khan's own signed selection of funerary-themed surahs (Ya-Sin, al-Zumar, al-Fajr) for the Taj Mahal.

**Tier 7** compares Ottoman and Mughal architecture (dome engineering, İznik tilework versus red-sandstone-and-marble, minaret form and function) and Kufic versus Naskh script, anchored to the real, named Ibn Muqla/Ibn al-Bawwab transition point (10th-11th centuries) rather than a vague, undated shift — with neither comparison framed as declaring one tradition superior.

**Tier 8, the category's most sensitive tier,** presents two genuine classical debates with full evidentiary care on both sides rather than a flattened verdict: figural depiction (the Bukhari hadith basis for caution in religious contexts, set against the real courtly miniature-painting tradition in Persianate/Ottoman/Mughal contexts and the several actively-discussed art-historical explanations for that exception, per Oleg Grabar's scholarship) and music/sama' (Ibn Taymiyyah's stricter position, Ibn Hazm's evidentiary-grounds permissive position, Abu Hamid al-Ghazali's conditional middle position, the daf-at-weddings hadith cited by the permissive side, and Sufi sama's own further internal controversy via Ahmad Ghazali's *Bawariq al-Ilma'*).

**Tier 9's capstone reapplies each of tiers 2-8's specific corrections to new, unattributed claims** (an Ottoman-vs-Mughal architectural identification, a Kufic-script identification, a false Blue-Qur'an-consensus claim, an unproven "Uthmanic" manuscript claim, a mismatched mihrab-verse claim, a false muqarnas-is-always-decorative claim, a false universal-mihrab-accuracy claim, a false Ibn-Taymiyyah/Ibn-Hazm-agreement claim, a false Badshahi-architect-certainty claim, a false figural-imagery-never-appeared claim, a false Nasta'liq-single-inventor claim, a false Kufic-Naskh-no-transition claim, and a false figural-depiction/music-unanimous-agreement claim) rather than merely repeating prior facts — including one item explicitly noting that the honorific-versus-binding-legal-designation distinction belongs to the Sacred Geography category rather than this one, modeling accurate cross-category boundaries rather than overreaching.

The full-category validator (tier counts, near-duplicates, answer-index balance, repeated answers, repeated stems) came back fully clean on first check — no post-insert fixes needed for this category.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 25. Science in Islam (`science_in_islam`) — 180 / 180

Verified anchors: Ibn Sina (c. 980-1037 CE, Hamadan and Isfahan), al-Khwarizmi (c. 780-850 CE, Baghdad under al-Ma'mun), and Ibn al-Haytham (c. 965-1040 CE, Basra and Cairo) as the category's three central scholars; al-Qanun fi al-Tibb's five-book structure and its use as a European medical textbook into the 17th century, transmitted via a Latin translation associated with Gerard of Cremona; al-Jabr wa'l-Muqabala's precise two-operation vocabulary (al-jabr as restoration, al-muqabala as balancing) and Zij al-Sindhind/Kitab Surat al-Ard as al-Khwarizmi's further named works; Kitab al-Manazir's correction of Ptolemaic extramission to intromission, transmitted via the Latin De Aspectibus; Ibn al-Haytham's Al-Shukuk 'ala Batlamyus (Doubts Concerning Ptolemy) and his specific method — i'tibar (controlled experiment), the camera obscura, the equant's physical-implausibility objection, and burhan (mathematical proof) required alongside experimental confirmation; al-Khwarizmi's arithmetic treatise surviving chiefly through the Latin Algoritmi de numero Indorum (source of "algorithm"); Ibn al-Shatir's and al-Tusi's Maragha-school critique of the Ptolemaic equant and the genuinely disputed, mathematically-parallel-but-undocumented relationship to Copernicus's later models; Fibonacci's Liber Abaci and his own account of learning Hindu-Arabic numerals from Arab teachers in North Africa; and the i'jaz 'ilmi genre (Maurice Bucaille's 1976 book, the academic term "Bucaillism," Qur'an 23:12-14/21:30/78:6-7 and 16:15 as specific popularly-cited verses) alongside Dr. Nidhal Guessoum's named internal methodological critique and George Saliba's associated originality-versus-transmission historiographical debate.

This category's research pass corrected several premises before drafting began: Bayt al-Hikma's popular "grand research university" image, corrected to its better-documented reality as a library and translation institution (per Dimitri Gutas's scholarship), with the broader translation movement understood as decentralized rather than centralized in one institution; the flat claim that Ibn al-Haytham "invented the scientific method," softened to a measured description of a well-documented early methodology rather than a single unified invention; the popular framing of Ibn al-Shatir's mathematical parallel with Copernicus as direct transmission, corrected to an acknowledged parallel with an undocumented, unproven transmission route; and i'jaz 'ilmi claims, reframed throughout as popular but internally contested among Muslim scholars themselves rather than settled fact.

**Tiers 1-3** cover the three scholars' basic fields (medicine, mathematics/astronomy, optics), their headline works and specific corrections (Ibn Sina's Canon, al-Khwarizmi's algebra and numerals, Ibn al-Haytham's intromission correction), and their specific dates, cities, and further named works, including the Bayt al-Hikma correction placed directly alongside the biographical material it qualifies.

**Tier 4** is built entirely around Ibn al-Haytham's method: Al-Shukuk 'ala Batlamyus's critique of the Almagest, Planetary Hypotheses, and Optics; the equant's physical-implausibility objection; i'tibar and the camera obscura; the bright-light-pain argument against extramission; and burhan as a required second condition alongside experiment — with two rows explicitly correcting the "invented the scientific method" overclaim rather than repeating it.

**Tier 5** traces manuscript and translation history for all three scholars: al-Khwarizmi's algebra treatise's Arabic-and-Latin textual history, his separately-surviving-only-via-Latin arithmetic treatise (Algoritmi de numero Indorum, source of "algorithm"), the Canon's Latin transmission via Gerard of Cremona, and the Book of Optics's Latin De Aspectibus and its documented-but-not-simple influence on Roger Bacon and Kepler, closing with the 12th-century Toledo-centered translation movement as the shared transmission route.

**Tier 6** gives precise, non-modernized definitions of three concepts in context: humoral medicine as Ibn Sina's actual four-humor framework (explicitly distinguished from being an early version of germ theory), al-jabr and al-muqabala as two distinct named operations (worked through with concrete equation examples), and the equant's specific physical-implausibility objection (distinguished from a claim about numerical inaccuracy).

**Tier 7** compares two scholars who directly engaged an earlier authority's claim: Ibn al-Haytham's resolved correction of Ptolemy on vision, set against the Maragha school's (Ibn al-Shatir, al-Tusi) equant objection and its genuinely open, mathematically-parallel-but-undocumented relationship to Copernicus — the tier's explicit point being that "scientifically resolved" and "historiographically open" are two different kinds of claim.

**Tier 8, the category's most sensitive tier,** treats i'jaz 'ilmi as a popular, named genre (Bucaille's 1976 book, the term "Bucaillism") with three specific popularly-cited verses (23:12-14, 21:30, 78:6-7/16:15) each explicitly framed as internally contested among Muslim scholars rather than settled, Dr. Nidhal Guessoum's named internal methodological critique, and George Saliba's separate originality-versus-transmission historiographical debate kept analytically distinct from the i'jaz 'ilmi debate.

**Tier 9's capstone draws together the whole category's corrections** (Bayt al-Hikma, the "invented the scientific method" softening, the Ibn al-Shatir/Copernicus caution, and the i'jaz 'ilmi honesty tier) alongside its verified contributions and named vocabulary (al-jabr, al-muqabala, i'tibar, burhan), closing with Fibonacci's Liber Abaci as a further worked transmission example and an explicit rejection of both "purely original" and "purely transmission" as the only two ways to characterize Islamic-world science.

Post-insert, the full-category validator flagged two `answer_repeated` violations at the threshold (the correct-answer text "Al-jabr" and "Ibn al-Haytham" each used three times) — fixed via two targeted `UPDATE` statements adding brief qualifying text to one repeated choice-array entry per term — and one `stem_repeated` violation ("considering this tie[r]" at 7x) fixed via three targeted rewordings. The category re-validated clean on every check afterward (tier counts, near-duplicates, answer-index balance, repeated answers, repeated stems).

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 26. Islamic Finance (`islamic_finance`) — 180 / 180

Verified anchors: Qur'an 2:275-280 (riba's most extensive treatment), 3:130, 30:39 on riba and giving; the hadith of 'Ubadah ibn al-Samit (Sahih Muslim 1587) establishing the six ribawi commodities and the riba al-fadl/riba al-nasi'ah distinction; the gold/silver zakat nisab (85g/595g as modern conversions of 20 mithqal/200 dirhams, not text-stated gram figures) and the genuine Hanafi-silver versus Maliki/Shafi'i/Hanbali-gold school split; precise definitions of murabaha, mudaraba, musharaka, ijara, and salam; the hadith of Hakim ibn Hizam ("do not sell what you do not possess") underlying murabaha's ownership/possession/risk conditions; seven confirmed AAOIFI Shari'ah Standard numbers (5, 8, 9, 10, 12, 13, 21, 26) fetched directly from AAOIFI's own site, plus the explicit finding that no standalone AAOIFI standard on gharar exists; the hadith of Abu Hurayrah (Sahih Muslim 1513) on gharar, with habal al-habala and bay' al-hasah/mulamasah/munabadha as directly hadith-attested examples distinct from the "fish in the water" classical jurists' illustrative gloss; the gharar fahish/yasir distinction; bay' al-'inah's majority-prohibited/Shafi'i-permitted cross-school split; IIFA Resolution No. 179 (5/19) (19th session, Sharjah, 2009) ruling against organized tawarruq; the majority riba/gharar/maysir critique of conventional insurance against takaful (AAOIFI SS26) and the named minority-permissive scholars (al-Zarqa, al-Khafif, Siddiqi); and the AAOIFI-30%-versus-index-33%/33.33% stock-screening divergence alongside the convergent ~5% impure-income threshold.

This category's research pass (conducted via live web search against AAOIFI's and IIFA's own official sites, S&P/MSCI/DJIM methodology PDFs, and sunnah.com) corrected several working assumptions before drafting began: "fish in the water"/"bird in the sky" were confirmed as classical jurists' teaching illustrations rather than the Prophet's own verbatim hadith wording; no standalone AAOIFI "gharar standard" exists, contrary to an initial assumption that one might; and the stock-screening threshold was corrected from an assumed fuzzy "30-33%" range to two distinct, attributable figures — AAOIFI's specific 30% (reasoned from the classical one-third bequest-limit principle) against the major indices' specific 33%/33.33% — with the ~5% impure-income threshold confirmed as the genuinely convergent figure across methodologies.

**Tiers 1-3** cover riba's basic Qur'anic prohibition alongside sadaqah's encouragement; the precise riba al-fadl/riba al-nasi'ah distinction, the zakat nisab's gold/silver conversion figures and genuine school split, and zakatable wealth categories; and precise, structurally distinguishing definitions of all five named contracts (murabaha, mudaraba, musharaka, ijara, salam), each via a description-to-name format to avoid the flat "what is X, defined?" template collision across five parallel items.

**Tier 4** works through murabaha's specific validity conditions — ownership prior to sale, actual/constructive possession with genuine risk-bearing, cost disclosure — and the hila critique of murabaha structures that skip these conditions, collapsing into a disguised interest-bearing loan.

**Tier 5** names seven specific AAOIFI Shari'ah Standard numbers against their exact contract types, verified directly from AAOIFI's own site, and explicitly corrects the assumption that a standalone "gharar standard" exists, redirecting gharar's citation to the hadith of Abu Hurayrah and classical fiqh manuals instead.

**Tier 6** gives gharar's precise classical definition, distinguishes the Prophet's actual hadith wording (Sahih Muslim 1513) from jurists' "fish in the water" illustrative gloss, names habal al-habala and bay' al-hasah/mulamasah/munabadha as directly hadith-attested worked examples, and introduces the gharar fahish/yasir severity distinction.

**Tier 7** compares three paired structures reaching similar practical ends — compliant murabaha against an interest loan, ijara wa iqtina against a conventional mortgage, and classical tawarruq against bay' al-'inah — each pairing distinguished by specific structural features (ownership, risk, independent economic purpose) rather than by practical resemblance alone.

**Tier 8, this category's most dispute-focused tier,** presents three genuinely still-live disputes with full evidentiary care: organized tawarruq (tawarruq munazzam), specifically ruled against by IIFA's Resolution No. 179 (5/19) yet still documented in practice at some institutions; conventional insurance's majority riba/gharar/maysir prohibition against takaful's tabarru'-based alternative, with named minority-permissive scholars (al-Zarqa, al-Khafif, Siddiqi) and their reasoning; and the genuine AAOIFI-versus-market-index divergence on stock-screening debt thresholds, alongside the convergent impure-income threshold.

**Tier 9's capstone applies each of tiers 1-8's specific structural conditions to new, unfamiliar financial products** (an app-based cash-advance product resembling a disguised loan, a takaful cooperative, a bank-arranged organized-tawarruq-style resale, a musharaka-structured crowdfunding platform, an insufficiently screened investment fund, a gharar fahish warehouse-contents sale, a compliant ijara wa iqtina lease, a false AAOIFI-gharar-standard inference, a valid salam, and a paired murabaha-versus-disguised-loan structure comparison) rather than merely repeating prior facts.

The full-category validator (tier counts, near-duplicates, answer-index balance, repeated answers, repeated stems) came back fully clean on first check — no post-insert fixes needed for this category, joining Islamic Arts & Culture as the only categories this segment to validate clean on the first pass.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## 27. Marriage & Family Life (`family_life`) — 180 / 180

Verified anchors: Qur'an 24:32, 30:21 (marriage encouraged, mawaddah/rahmah), 17:23-24, 31:14, 4:36, 29:8, 46:15 (honoring parents); Sahih al-Bukhari 5063 (marriage as sunnah); Sahih Muslim 1421 and Sunan Ibn Majah 1873 (marital consent); Qur'an 4:4, 4:20-21, 4:19, 2:228 (mahr and mutual kindness); the Hanafi ijab/qabul-only arkan versus 'Umdat al-Salik's five-integral Shafi'i enumeration (al-Hidayah; Radd al-Muhtar); Qur'an 4:22-23's mahram list with its conditional stepdaughter and biological-sons clauses; the 'iddah lengths of 2:228 (with the corrected Hanafi+Hanbali-versus-Shafi'i+Maliki quru' split), 2:234, and 65:4; nafaqah's wealth-independent obligation; the four schools' genuinely distinct hidana mechanisms (Hanafi fixed ages 7/9; Maliki puberty/consummation milestones; Shafi'i tamyiz-based choice for both sexes; Hanbali age-7 sex-differentiated choice); Sunan Abi Dawud 2578, Jami' at-Tirmidhi 3895, and Sahih Muslim 1469 (marital-etiquette hadith with gradings) alongside a popular but weak/fabricated "Ayyub-comparison" saying; al-Wahidi's Asbab al-Nuzul on Qur'an 4:34 (Sa'd ibn al-Rabi'), the occasion of revelation for Surat al-Mujadilah (Khawla bint Tha'laba and Aws ibn al-Samit's zihar, Qur'an 58:1-4), and Sahih al-Bukhari 5273/5276 (Thabit ibn Qays's wife's khul' case); Qur'an 2:229 (khul') and 4:35 (arbitration); and the four-school wali requirement (Sunan Abi Dawud 2085/Jami' at-Tirmidhi 1101, with its genuinely disputed hasan/sahih/munqati' grading) and the classical-majority-versus-Ibn-Taymiyyah/Ibn-al-Qayyim triple-talaq dispute.

This category's research pass corrected several premises before drafting began: the 2:228 quru' dispute was corrected from an assumed Hanafi-versus-Shafi'i split to the actual Hanafi+Hanbali-versus-Shafi'i+Maliki split; the "pillars of nikah" were corrected from a single cross-school enumeration to a genuine Hanafi/Shafi'i classification divergence over whether witnesses and wali count as arkan at all; hidana was corrected from a single "differs by age" framing to three genuinely distinct mechanism types (fixed age, milestone, and discernment-based choice), with an uncertain Maliki "18 years" figure explicitly dropped; the wali hadith was corrected from an assumed straightforward sahih citation to its actual disputed hasan/sahih/munqati' grading, and confirmed as absent from the Sahihayn; and the triple-talaq minority position was corrected to include its Zahiri and Shi'a precedent, rather than being presented as an Ibn Taymiyyah invention.

**Tiers 1-3** cover marriage's basic encouragement and parent-honoring duty; marital consent (distinguishing the previously-married and virgin standards) and mahr as the wife's own nihlah-gift right; and marriage's technical structure — the Hanafi/Shafi'i arkan classification divergence, the conditional mahram categories of 4:22-23, and the situationally-specific 'iddah lengths including the corrected four-school quru' split.

**Tier 4** pairs three named rights and roles with their specific conditions: nafaqah's wealth-independent obligation, hidana's three genuinely distinct school mechanisms (not merely three different ages), and the wali's basic guardianship role.

**Tier 5, flagged by the tier map as carrying real weight given how much matching popular material is weakly graded,** works through four marital-etiquette narrations side by side — two sahih, one hasan sahih, and one popular-but-weak/fabricated "Ayyub-comparison" saying — modeling the same grading-discipline this bank has applied to hadith elsewhere.

**Tier 6** traces three occasions of revelation with full source care: 4:34's reported Sa'd ibn al-Rabi' incident (with the disputed daraba term explicitly flagged rather than resolved), Surat al-Mujadilah's zihar case naming the very surah after Khawla bint Tha'laba, and the khul' case tied to Thabit ibn Qays's wife (with her name's genuine cross-narration variance flagged rather than settled).

**Tier 7** works through khul' versus talaq as a general-rule-and-exception pair (khul's compensation structure and its effect of forfeiting the husband's raj'ah) alongside Qur'an 4:35's arbitration instruction, carefully framed as recommended practice for shiqaq rather than a universal precondition on every talaq's validity.

**Tier 8, this category's most dispute-focused tier,** presents three genuine four-school disputes with full evidentiary care: the wali requirement (Hanafi self-contracting versus the Maliki/Shafi'i/Hanbali majority, grounded in a hadith whose grading is itself genuinely disputed across graders); triple talaq in one sitting (the classical four-school majority counting it as three, against Ibn Taymiyyah's and Ibn al-Qayyim's named one-talaq minority position with its Zahiri/Shi'a precedent, kept explicitly distinct from modern civil-code and criminalization layers); and a recap of tier 4's genuinely distinct hidana mechanisms.

**Tier 9's capstone applies each of tiers 1-8's specific facts and distinctions to new, unfamiliar family-law scenarios** (a remote video-call marriage, an independently wealthy wife's nafaqah question, a cross-school custody dispute, a contested-consent case, a single-sitting-triple-talaq-by-text scenario, a no-fault khul' request, a family-arbitration scenario, an uncited paradise-promise hadith claim, a wali dispute, and a closing validity checklist) rather than merely repeating prior facts.

The full-category validator (tier counts, near-duplicates, answer-index balance, repeated answers, repeated stems) came back fully clean on first check — no post-insert fixes needed for this category.

All 180 rows are `review_status = 'ai_drafted'`. None is published.

---

## Running total

| category | status |
|---|---|
| Five Pillars | 180 / 180 |
| Creed (Aqeedah) | 180 / 180 |
| Allah's Names & Attributes | 180 / 180 |
| Holy Quran | 180 / 180 |
| Prophetic Biography | 180 / 180 |
| Hadith Sciences | 180 / 180 |
| Quran Commentary (Tafsir) | 180 / 180 |
| Preservation of the Qur'an | 180 / 180 |
| Tajwid | 180 / 180 |
| Arabic Language | 180 / 180 |
| Usul al-Fiqh | 180 / 180 |
| Islamic Law (Fiqh) | 180 / 180 |
| Islamic Ethics (Akhlaq) | 180 / 180 |
| Du'a & Dhikr | 180 / 180 |
| Sufism & Spirituality | 180 / 180 |
| Afterlife (Akhirah) | 180 / 180 |
| Companions (Sahaba) | 180 / 180 |
| Ahl al-Bayt | 180 / 180 |
| Other Prophets | 180 / 180 |
| Miracles & Signs | 180 / 180 |
| Women in Islam | 180 / 180 |
| Islamic History | 180 / 180 |
| Sacred Geography | 180 / 180 |
| Islamic Arts & Culture | 180 / 180 |
| Science in Islam | 180 / 180 |
| Islamic Finance | 180 / 180 |
| Marriage & Family Life | 180 / 180 |
| **total** | **4,860 of 5,220** |
