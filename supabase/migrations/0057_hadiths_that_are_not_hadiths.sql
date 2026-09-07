-- 0057 — Narrations that carry no narration
--
-- The daily hadith served `bukhari:127` on 2026-09-07 and it read, in full:
--
--     Narrated Abu at-Tufail: The above mentioned Statement of `Ali
--
-- That is not a hadith. It is a cross-reference: the entry exists in Bukhari
-- to say "this chain reports the statement printed just above", and printed
-- alone on the front door of an Islamic education app it says nothing at all.
--
-- ── Where it came from, since the answer matters more than this one row ────
-- 0050 fetched the English from fawazahmed0/hadith-api, a mirror of published
-- translations, and spot-checked Bukhari 1 before trusting the rest. Bukhari 1
-- is fine. Measured across the whole eng-bukhari edition afterwards: **7,458
-- of its 7,589 entries (98.3%) end without sentence-final punctuation**, and
-- of the 391 narrations imported here, 384 do. The mirror systematically drops
-- the closing punctuation, and in a minority of entries it drops real content
-- with it. This was not introduced by our import — the same fragments are in
-- the upstream JSON — and re-running the importer would reproduce it exactly.
--
-- ── Why this migration does not try to fix all 384 ─────────────────────────
-- Because most of them are not broken. A missing full stop is a typographic
-- wart; the narration is complete and correct. The first attempt at a detector
-- here compared English length against the Arabic already imported for all
-- 391, on the theory that a badly-cut English would be far shorter than its
-- Arabic. That flagged 43 rows, and reading them showed the signal was wrong:
-- the low ratios are mostly the Arabic carrying a full isnad that the English
-- edition omits. `bukhari:15` ("None of you will have faith till he loves me
-- more than his father, his children and all mankind") scores 0.33 and is
-- complete. Deactivating on that measure would have removed dozens of sound
-- narrations. Measuring beat reasoning, and then reading beat measuring.
--
-- So this deactivates only what can be shown, by reading it, to carry no
-- reportable content standing alone. Five rows, named individually rather than
-- matched by pattern, because five rows of Bukhari deserve to be named:
--
--   bukhari:127   "The above mentioned Statement of `Ali" — a pointer, no matn
--   bukhari:102   "as above (the sub narrators are different)…" — same
--   bukhari:6432  "We migrated with the Prophet..(This narration is related
--                  in the chapter of migration)" — a pointer to another chapter
--   bukhari:6572  cut after the question, so the Prophet's ﷺ answer — the
--                 entire point of the narration — is missing
--   bukhari:6575  cut mid-sentence inside an unclosed quotation
--
-- They are deactivated, not deleted. `hadiths.is_active` exists for exactly
-- this, `daily_hadith()` already filters on it, and a future session with a
-- complete published edition should restore the text and switch them back on
-- rather than re-import them blind.
--
-- The rotation is `(current_date - epoch) % count(active)`, so the day each
-- remaining narration falls on shifts. That is not a loss: the rotation was
-- never anchored to a calendar, only to a count.

begin;

update public.hadiths
   set is_active = false,
       updated_at = now()
 where reference in (
   'bukhari:127',
   'bukhari:102',
   'bukhari:6432',
   'bukhari:6572',
   'bukhari:6575'
 );

-- ── The editor's dangling cross-references ────────────────────────────────
-- Eight English rows end with a bracketed pointer to another hadith, and in
-- seven of the eight the mirror truncated the pointer itself, leaving text
-- that ends "(See Hadith No)" or "(See Hadith No. 208, Vol)". These are
-- editorial apparatus from the printed edition, not part of the narration, and
-- a truncated one is worse than none: it looks like the narration ran out.
--
-- The narrations themselves are complete, so they stay in the rotation and
-- only the trailing pointer goes. Anchored to the end of the string, so a
-- cross-reference occurring mid-narration (there are none today, but a future
-- import may add one) is left alone.
update public.hadith_translations
   set text = btrim(regexp_replace(text, '\s*\(See Hadith No[^)]*\)\s*$', '')),
       updated_at = now()
 where text ~ '\(See Hadith No[^)]*\)\s*$';

commit;

comment on column public.hadiths.is_active is
  'Whether this narration is in the daily rotation. 0057 switched off five '
  'entries whose English text carries no reportable content standing alone — '
  'cross-references and truncations from the upstream mirror, not from our '
  'import. Set false rather than deleting, so a complete published text can '
  'restore them later.';
