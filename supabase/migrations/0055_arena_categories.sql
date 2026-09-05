-- ---------------------------------------------------------------------------
-- 0055 — Thirteen categories nobody browses.
-- ---------------------------------------------------------------------------
--
-- `questions.category_id` is NOT NULL, so an arena question still needs a
-- category. These are those categories: the thirteen the owner's bank is
-- organised into. They carry `pool = 'arena'`, which does two things at once —
-- 0054's trigger stamps every question filed under them as arena, and the
-- category grid, pinned to `pool = 'category'`, never shows them.
--
-- So they are organisational rather than navigational. A player will never see
-- one; an administrator looking at a question can still tell whether it is a
-- fiqh question or a seerah question, which matters the first time somebody
-- has to fix one.
--
-- `sort_order` starts at 101 so these sit after the twenty-nine browsable
-- categories in any admin listing that orders by it, rather than interleaving
-- with a curriculum sequence that was deliberately arranged.
--
-- Slugs are prefixed `arena_`. A slug is unique across the table and several
-- of these names are near-twins of browsable ones — Hadith and Its Sciences
-- beside Hadith Sciences, Seerah beside Prophetic Biography — so an unprefixed
-- slug would either collide outright or, worse, read as the same thing in a
-- URL. The prefix makes the two banks impossible to confuse by eye.

insert into public.categories (slug, name, description, icon, color_theme, sort_order, pool)
values
  ('arena_aqeedah',    'Aqeedah and the Articles of Faith', 'Arena bank: creed and the articles of faith.', 'BookOpen', null, 101, 'arena'),
  ('arena_duas',       'Duas and Remembrance of Allah',     'Arena bank: supplication and dhikr.',          'BookOpen', null, 102, 'arena'),
  ('arena_akhlaq',     'Ethics and Character (Akhlaq)',     'Arena bank: character and conduct.',           'BookOpen', null, 103, 'arena'),
  ('arena_fiqh',       'Fiqh and Acts of Worship',          'Arena bank: law and the acts of worship.',     'BookOpen', null, 104, 'arena'),
  ('arena_hadith',     'Hadith and Its Sciences',           'Arena bank: hadith and its sciences.',         'BookOpen', null, 105, 'arena'),
  ('arena_halal',      'Halal and Haram in Daily Life',     'Arena bank: the lawful and unlawful.',         'BookOpen', null, 106, 'arena'),
  ('arena_calendar',   'Islamic Calendar and Special Days', 'Arena bank: the calendar and its days.',       'BookOpen', null, 107, 'arena'),
  ('arena_history',    'Islamic History and the Caliphates','Arena bank: history and the caliphates.',      'BookOpen', null, 108, 'arena'),
  ('arena_vocabulary', 'Islamic Vocabulary and Phrases',    'Arena bank: terms and phrases.',               'BookOpen', null, 109, 'arena'),
  ('arena_masajid',    'Masajid and Sacred Places',         'Arena bank: mosques and sacred places.',       'BookOpen', null, 110, 'arena'),
  ('arena_prophets',   'Prophets and Earlier Nations',      'Arena bank: the prophets and earlier nations.','BookOpen', null, 111, 'arena'),
  ('arena_seerah',     'Seerah of the Prophet Muhammad',    'Arena bank: the life of the Prophet.',         'BookOpen', null, 112, 'arena'),
  ('arena_quran',      'The Holy Quran',                    'Arena bank: the Qur''an.',                     'BookOpen', null, 113, 'arena')
on conflict (slug) do nothing;
