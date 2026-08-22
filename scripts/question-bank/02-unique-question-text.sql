-- Applied as migration `unique_question_text_per_category`.
--
-- Three insert batches each landed twice while authoring Hadith Sciences tier 5,
-- leaving 35 rows for 20 questions. Nothing errored and nothing warned. This makes
-- a repeated batch fail loudly instead of silently doubling a tier.
--
-- It catches exact repeats only. Still check the tier count after every batch.
create unique index if not exists questions_category_text_unique
  on public.questions (category_id, question_text);
