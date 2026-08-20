-- Shape for one tier's batch of 20. Insert a tier at a time.
-- source_type='ai' and review_status='ai_drafted' are not optional:
-- nothing reaches players without passing a scholar first.

insert into public.questions (
  category_id, tier, tier_is_estimated, difficulty, language,
  madhab_tag, question_text, choices, correct_choice_index,
  explanation, citation_reference, source_type, review_status, seed_batch
)
select
  (select id from public.categories where slug = 'aqeedah'),
  1,            -- tier
  false,        -- authored for this tier, not estimated
  'easy',       -- tiers 1-3 easy, 4-6 medium, 7-9 hard
  'en',
  'agreed',     -- or the specific school where they differ; 'na' if not a fiqh question
  v.q, v.c, v.i, v.e, v.cite,
  'ai', 'ai_drafted',
  'rebuild-2026-08'   -- keeps this pass identifiable
from (values
  ('Question text?',
   '["Choice A","Choice B","Choice C","Choice D"]'::jsonb, 1::smallint,
   'Why the answer is what it is.',
   'Qur''an 2:255')
) as v(q, c, i, e, cite);
