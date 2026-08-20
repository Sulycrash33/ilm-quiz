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
| **total** | **1,260 of 5,220** |
