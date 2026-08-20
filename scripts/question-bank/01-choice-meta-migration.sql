-- For the da'if format. NOT YET APPLIED.
-- Apply before authoring Hadith Sciences tier 5.
--
-- Why a new column and not a reshape of `choices`:
-- `choices` is typed `string[]` in six places across the app, including
-- multiplayer's LiveQuiz. Turning it into an array of objects breaks all of
-- them. This column is aligned by index, nullable, and ignored by every
-- existing reader, so nothing changes for the 28 categories that never use it.

alter table public.questions
  add column if not exists choice_meta jsonb;

comment on column public.questions.choice_meta is
  'Per-choice metadata aligned by index with `choices`. Used by the da''if '
  'format, where all four choices are real narrations. Each element: '
  '{"grading": "sahih|hasan|da''if|mawdu''", "reference": "Sunan Abu Dawud 1", '
  '"graders": [{"name": "Al-Albani", "grade": "Da''if"}]}. Null for ordinary '
  'questions. Only use narrations where every grader agrees - 2,621 qualify; '
  'the 2,535 contested ones make broken questions.';

-- Either every choice has metadata or none does.
alter table public.questions
  add constraint choice_meta_length_matches check (
    choice_meta is null
    or jsonb_array_length(choice_meta) = jsonb_array_length(choices)
  );
