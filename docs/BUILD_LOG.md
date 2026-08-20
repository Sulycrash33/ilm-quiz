# Question bank build log

One entry per category as it is authored. Numbers come from the database, not from memory.

---

## Five Pillars — 170 of 180 · tier 8 short

Authored 2026-08-20. First category of the rebuild.

| tier | target | actual | verdict |
|---|---:|---:|---|
| 1 Mubtadi | 20 | 20 | ok |
| 2 Talib | 20 | 20 | ok |
| 3 Hafiz | 20 | 20 | ok |
| 4 Faqih | 20 | 20 | ok |
| 5 Muhaddith | 20 | 20 | ok |
| 6 Mufassir | 20 | 20 | ok |
| 7 Shaykh | 20 | 20 | ok |
| **8 Imam** | 20 | **10** | **SHORT** |
| 9 Mujaddid | 20 | 20 | ok |

Validator clean otherwise: no near-duplicate pairs above 0.5, no correct answer appearing
more than twice, no opening stem appearing more than four times across all 170.

### Why tier 8 is short, precisely

**This is not a claim that the bucket cannot hold twenty.** Comparative fiqh on the pillars
is vast — al-Jaziri devotes volumes to exactly this. The shortfall is in **sourcing**, not
in the material.

Tier 8 asks where the schools differ *and why*. Getting that wrong means attributing a
position to a school that does not hold it, which breaches the one hard condition in the
handoff. Ten differences were sourced to something citable:

- zakat al-Fitr paid as cash — Hanafi permits, the other three do not
- intention as an obligation of wudu — Maliki, Shafii, Hanbali
- muwalat in wudu — Maliki and Hanbali
- zakat extended to horses — Hanafi alone, at one mithqal with no nisab
- zakat on agricultural produce — Abu Yusuf and Muhammad against Abu Hanifa
- tayammum when water would consume the prayer's time — Maliki
- turning a small stone in tayammum — Hanafi and Maliki
- fard distinguished from wajib, and what Hanafi usage requires to establish fard

The remaining ten were **not** written, because the only way to reach twenty in this session
would have been to assert attributions from memory. **`islamweb.net`, `dar-alifta.org` and
al-Jaziri's *al-Fiqh ala al-Madhahib al-Arbaa* on archive.org are all reachable** (see
`docs/SOURCES.md`) and none was mined properly — the attempt that was made hit a wrong
fatwa page and Wikimedia rate limiting. **A dedicated sourcing pass against al-Jaziri should
close this bucket.**

### Citations

Every citation was checked against real source text before use, not recalled:

- 24 Qur'an verses through the quran.com API
- hadith numbers through the fawazahmed0 corpus, with gradings where the corpus carries
  them: Bukhari 8, 1405, 1447, 1503, 1623, 1936; Muslim 874, 1570, 1572; Abu Dawud 59, 61,
  171, 175, 408, 415, 494, 594; Nasai 2333; Tirmidhi 787
- Tafsir Ibn Kathir on 2:158 through the quran.com tafsir endpoint
- the ten tier-8 comparative positions are cited to their source and marked as such

Tier 8's school attributions are **the highest scholar-review priority in this category**.

### Notes for review

- Tier 5 deliberately includes narrations graded **Daif** (Abu Dawud 408, 415, 594). Each is
  asked *about the grading*, never as the basis of a ruling, per the handoff.
- Abu Dawud 415 is used to teach that **Maqtu** marks a Successor's statement rather than a
  hadith of the Prophet.
- Tier 9 answers are framed as *the reasoning to apply*, not as settled rulings, because
  these are cases on which qualified scholars genuinely differ.
- All 170 rows are `review_status = 'ai_drafted'`. None is published.
