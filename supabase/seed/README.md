# The tiered question bank (`tiers_v1`)

880 questions covering every one of the 225 (category × rank tier) buckets,
loaded into the live database under `seed_batch = 'tiers_v1'`.

## What this fixed

Migration `0019` gave questions a rank tier — Mubtadi through Mujaddid — so
difficulty and rank use the same nine names. At that point:

| | before | after |
| --- | --- | --- |
| buckets with no questions | 150 of 225 | **0** |
| smallest bucket | 0 | **4** |
| questions with an authored tier | 0 | 880 |
| total published questions | 273 | 1,169 |

Every tier assignment before this batch was a guess backfilled from the old
easy/medium/hard band. The 880 new rows carry `tier_is_estimated = false`,
meaning the tier was chosen deliberately.

## The Sunni condition

Everything here is written from a Sunni frame, and that shaped two rules:

- **Where the four schools agree**, `madhab_tag` is `agreed` and the question is
  asked as settled. This is the large majority of the set.
- **Where they differ**, the question either avoids the disputed point or names
  the school it is asking about, and carries that school's tag. A question
  never presents one school's position as though it were consensus.

Questions tagged to a specific school: `hanafi`, `maliki`, `shafii`,
`hanbali`. These sit mostly at tiers 7–9, where school-level distinctions are
the natural subject matter.

## What "increasing difficulty" means here

The gradient is by depth of study rather than obscurity. Taking Fiqh:

- **Tier 1 (Mubtadi)** — "What does halal mean?"
- **Tier 4 (Faqih)** — "What are the five objectives of the Shariah?"
- **Tier 9 (Mujaddid)** — "What is the meaning of al-hukm al-wad'i as
  distinguished from al-hukm at-taklifi?"

## On citations

Qur'anic references are given as surah:ayah. Hadith are cited by collection,
and by number only where that number is well established. Where a number was
not certain the collection and chapter are given instead — a vague citation is
recoverable, an invented one is not.

**This is the part most in need of checking.** Hadith numbering varies between
printings, and a citation being plausible is not the same as it being correct.

## Provenance — read before publishing

These are **AI-drafted and have not been through scholarly review**. They are
`review_status = 'published'` so the app is playable during development, which
is a development convenience, not a judgement that they are fit to ship.

The schema's intended pipeline is `ai_drafted` → `scholar_approved` →
`published`. Before any public launch this content should go through it, with a
qualified scholar checking rulings, attributions and citations.

## Reviewing

In the app: `/admin/questions` lists and searches every question.

In SQL, by bucket:

```sql
select c.name, q.tier, q.question_text, q.explanation, q.citation_reference
  from public.questions q
  join public.categories c on c.id = q.category_id
 where q.seed_batch = 'tiers_v1' and c.slug = 'fiqh'
 order by q.tier;
```

Coverage across the whole grid:

```sql
select * from public.get_tier_coverage();
```

## Wiping

The whole batch, and nothing else:

```sql
delete from public.questions where seed_batch = 'tiers_v1';
```

The 273 pre-existing rows have `seed_batch is null` and are untouched by that.
To clear those too, `delete from public.questions where seed_batch is null` —
but note they are the ones with estimated tiers, so removing them leaves the
grid entirely authored.

## Known limitations

1. **Semantic near-duplicates.** The loader deduplicates on exact question
   text, which cannot catch the same question asked in different words. Some
   overlap with the pre-existing 273 remains — for example "How many major
   schools of law are recognised in Sunni Islam?" alongside "How many major
   schools of Sunni jurisprudence are commonly recognised?".
2. **English only.** All 880 are `language = 'en'`, though the app supports six
   locales. The other five have no tiered content.
3. **Citations need verification**, as above.

## Re-loading

`seed_tiered_questions(slug, items)` (migration `0021`) takes a category slug
and a JSON array. It derives `difficulty` from the tier so the two cannot
drift, and skips any question whose exact text already exists, so re-running is
safe.
