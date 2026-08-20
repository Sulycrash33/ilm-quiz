-- DESTRUCTIVE. Read docs/RUNBOOK.md before running.
-- Deletes all existing questions and replaces the 25 categories with the 29.
-- The owner must approve this run. Re-verify the guard below immediately first.

-- GUARD: all three must be 0. If any is not, STOP and ask the owner.
select 'attempts' as t, count(*) from public.attempts
union all select 'quiz_room_questions', count(*) from public.quiz_room_questions
union all select 'user_question_schedule', count(*) from public.user_question_schedule;

begin;

delete from public.questions;

-- Retire the 8 categories whose content is absorbed elsewhere.
delete from public.categories where slug in (
  'salah','zakat_charity','hajj_umrah','ramadan_fasting',
  'angels_unseen','muslim_scholars','islam_world','islamic_calendar'
);

-- Upsert the 29. Reused slugs keep their id, so nothing else needs repointing.
insert into public.categories (slug, name, description, icon, sort_order) values
  ('aqeedah','Creed (Aqeedah)','Core beliefs and theological foundations','🕌',1),
  ('allah_names','Allah''s Names & Attributes','The beautiful names, anchored in the Qur''an','✨',2),
  ('five_pillars','Five Pillars','The fundamental obligations in practice','🕋',3),
  ('quran','Holy Quran','Surahs, verses, themes and understanding','📖',4),
  ('prophetic_biography','Prophetic Biography','The life of the Prophet (PBUH)','🌟',5),
  ('hadith','Hadith Sciences','Narrations, authenticity and classification','📜',6),
  ('tafsir','Quran Commentary','Tafsir studies and interpretation','🔍',7),
  ('quran_sciences','Preservation of the Qur''an','Compilation, the ahruf and the qira''at','🖋️',8),
  ('tajwid','Tajwid','Rules of recitation and pronunciation','🎵',9),
  ('arabic_language','Arabic Language','Quranic Arabic and classical grammar','🔤',10),
  ('usul_fiqh','Usul al-Fiqh','How rulings are derived','⚖️',11),
  ('fiqh','Islamic Law (Fiqh)','Practical rulings and daily application','📋',12),
  ('ethics','Islamic Ethics (Akhlaq)','Character and moral conduct','💛',13),
  ('dua_dhikr','Du''a & Dhikr','Supplication and remembrance','🤲',14),
  ('tazkiyah','Sufism & Spirituality','Inner purification and spiritual practice','🌱',15),
  ('akhirah','Afterlife (Akhirah)','Death, judgment and the eternal life','🌅',16),
  ('companions','Companions (Sahaba)','The Prophet''s companions and their sacrifices','🤝',17),
  ('ahl_al_bayt','Ahl al-Bayt','The family of the Prophet','🏛️',18),
  ('stories_of_prophets','Other Prophets','The messengers and their lessons','📿',19),
  ('miracles_signs','Miracles & Signs','Prophetic miracles and divine signs','🌙',20),
  ('women_in_islam','Women in Islam','Rights, roles and contributions','🌸',21),
  ('islamic_history','Islamic History','Civilization, dynasties and events','🏰',22),
  ('sacred_places','Sacred Geography','Holy sites and pilgrimage routes','🗺️',23),
  ('arts_culture','Islamic Arts & Culture','Calligraphy, architecture and poetry','🎨',24),
  ('science_in_islam','Science in Islam','Contributions to science and medicine','🔬',25),
  ('islamic_finance','Islamic Finance','Halal banking and economic principles','💰',26),
  ('family_life','Marriage & Family Life','Marriage, rights and family etiquette','👨‍👩‍👧',27),
  ('interfaith','Interfaith Relations','Dialogue with other faith communities','🕊️',28),
  ('contemporary_issues','Contemporary Issues','Modern challenges and Islamic perspectives','🌍',29)
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      icon = excluded.icon,
      sort_order = excluded.sort_order;

-- Expect 29.
select count(*) as categories_after from public.categories;

-- commit;   <- uncomment deliberately, after checking the count above
