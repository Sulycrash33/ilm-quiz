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

## Running total

| category | status |
|---|---|
| Five Pillars | 180 / 180 |
| Creed (Aqeedah) | 180 / 180 |
| Allah's Names & Attributes | 180 / 180 |
| Holy Quran | 180 / 180 |
| **total** | **720 of 5,220** |
