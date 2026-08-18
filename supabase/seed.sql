-- Seed: knowledge categories and the question bank.
--
-- GENERATED FILE — do not edit by hand.
-- Source: scripts/seed-content/*.ts    Rebuild: npm run seed:build
--
-- 269 questions across 25 categories.
--
-- REVIEW STATUS
-- Everything here is inserted as 'ai_drafted', never 'published'. This project
-- takes an explicit position, stated in src/ai/flows/draft-questions.ts and
-- enforced by the RLS in migration 0001: no machine-generated Islamic content
-- reaches users without a qualified human scholar approving it. This bank was
-- written by an AI assistant, so that position applies to it in full. The rows
-- land in the existing /admin/review queue and are invisible in the app until
-- a reviewer approves them. That is the gate working, not a bug.
--
-- Every question carries a citation for the reviewer to check. Fiqh entries are
-- limited to rulings agreed across the four Sunni schools and tagged 'agreed';
-- non-fiqh entries are tagged 'na'.
--
-- SCHEMA NOTES
-- Category slugs use underscores, matching the live database. The hyphenated
-- ids in the legacy CATEGORIES array in src/lib/constants.ts do not match and
-- must not be used for seeding — doing so creates a duplicate category set.
-- difficulty / language / madhab_tag / review_status are enum types and are
-- cast explicitly. categories.sort_order is NOT NULL with no default.
--
-- Safe to run repeatedly: categories match on slug, questions on question_text.

-- ---------------------------------------------------------------------------
-- 1. Categories
-- ---------------------------------------------------------------------------

insert into public.categories (slug, name, description, icon, sort_order)
select v.slug, v.name, v.description, v.icon, v.sort_order
from (values
  ('quran', 'Quran', 'Surahs, verses, revelation and themes', '📖', 1::smallint),
  ('hadith', 'Hadith', 'Prophetic narrations and how they are graded', '📜', 2::smallint),
  ('prophetic_biography', 'Prophetic Biography', 'The life of the Prophet ﷺ', '⭐', 3::smallint),
  ('fiqh', 'Fiqh', 'Practical rulings and how scholars derive them', '⚖️', 4::smallint),
  ('islamic_history', 'Islamic History', 'The caliphates, dynasties and the golden age', '🏛️', 5::smallint),
  ('aqeedah', 'Aqeedah (Allah''s Names)', 'Belief, and the names and attributes of Allah', '💎', 6::smallint),
  ('ethics', 'Islamic Ethics', 'Character, manners and how to treat people', '❤️', 7::smallint),
  ('arabic_language', 'Arabic Language', 'The language of the Quran', '🔤', 8::smallint),
  ('five_pillars', 'Five Pillars', 'Shahada, Salah, Zakat, Sawm and Hajj', '🕌', 9::smallint),
  ('contemporary_issues', 'Contemporary Issues', 'Modern questions and Islamic perspectives', '🌍', 10::smallint),
  ('stories_of_prophets', 'Stories of the Prophets', 'From Adam to Isa, as the Quran tells them', '🌅', 11::smallint),
  ('companions', 'The Companions', 'The Sahabah who carried the message', '🤝', 12::smallint),
  ('salah', 'Prayer in Depth', 'The prayer, its times, forms and meaning', '🤲', 13::smallint),
  ('ramadan_fasting', 'Ramadan & Fasting', 'The month of fasting and its rulings', '🌙', 14::smallint),
  ('hajj_umrah', 'Hajj & Umrah', 'The pilgrimage, its rites and their origins', '🕋', 15::smallint),
  ('zakat_charity', 'Zakat & Charity', 'Obligatory and voluntary giving', '💰', 16::smallint),
  ('quran_sciences', 'Sciences of the Quran', 'Revelation, recitation, tajweed and tafsir', '🔍', 17::smallint),
  ('dua_dhikr', 'Dua & Dhikr', 'Supplication and the remembrance of Allah', '📿', 18::smallint),
  ('angels_unseen', 'Angels & the Unseen', 'Angels, the soul, and the world beyond sight', '👼', 19::smallint),
  ('tazkiyah', 'Purification of the Soul', 'Sincerity, humility and the inner life', '✨', 20::smallint),
  ('family_life', 'Family & Community', 'Parents, marriage, neighbours and rights', '🏡', 21::smallint),
  ('sacred_places', 'Sacred Places', 'Makkah, Madinah, Al-Aqsa and the great mosques', '🕌', 22::smallint),
  ('islamic_calendar', 'Islamic Calendar', 'The months, and the days that matter in them', '📅', 23::smallint),
  ('muslim_scholars', 'Scholars & Scientists', 'The thinkers of the Islamic intellectual tradition', '🔭', 24::smallint),
  ('islam_world', 'Islam Around the World', 'Muslim communities, cultures and geography', '🧭', 25::smallint)
) as v(slug, name, description, icon, sort_order)
where not exists (select 1 from public.categories c where c.slug = v.slug);

-- Refresh the descriptions and icons of categories that already existed, so the
-- ten live ones pick up copy without being duplicated or re-ordered.
update public.categories c
   set description = v.description,
       icon        = v.icon
from (values
  ('quran', 'Surahs, verses, revelation and themes', '📖'),
  ('hadith', 'Prophetic narrations and how they are graded', '📜'),
  ('prophetic_biography', 'The life of the Prophet ﷺ', '⭐'),
  ('fiqh', 'Practical rulings and how scholars derive them', '⚖️'),
  ('islamic_history', 'The caliphates, dynasties and the golden age', '🏛️'),
  ('aqeedah', 'Belief, and the names and attributes of Allah', '💎'),
  ('ethics', 'Character, manners and how to treat people', '❤️'),
  ('arabic_language', 'The language of the Quran', '🔤'),
  ('five_pillars', 'Shahada, Salah, Zakat, Sawm and Hajj', '🕌'),
  ('contemporary_issues', 'Modern questions and Islamic perspectives', '🌍'),
  ('stories_of_prophets', 'From Adam to Isa, as the Quran tells them', '🌅'),
  ('companions', 'The Sahabah who carried the message', '🤝'),
  ('salah', 'The prayer, its times, forms and meaning', '🤲'),
  ('ramadan_fasting', 'The month of fasting and its rulings', '🌙'),
  ('hajj_umrah', 'The pilgrimage, its rites and their origins', '🕋'),
  ('zakat_charity', 'Obligatory and voluntary giving', '💰'),
  ('quran_sciences', 'Revelation, recitation, tajweed and tafsir', '🔍'),
  ('dua_dhikr', 'Supplication and the remembrance of Allah', '📿'),
  ('angels_unseen', 'Angels, the soul, and the world beyond sight', '👼'),
  ('tazkiyah', 'Sincerity, humility and the inner life', '✨'),
  ('family_life', 'Parents, marriage, neighbours and rights', '🏡'),
  ('sacred_places', 'Makkah, Madinah, Al-Aqsa and the great mosques', '🕌'),
  ('islamic_calendar', 'The months, and the days that matter in them', '📅'),
  ('muslim_scholars', 'The thinkers of the Islamic intellectual tradition', '🔭'),
  ('islam_world', 'Muslim communities, cultures and geography', '🧭')
) as v(slug, description, icon)
where c.slug = v.slug
  and (c.description is distinct from v.description or c.icon is distinct from v.icon);

-- ---------------------------------------------------------------------------
-- 2. Questions
-- ---------------------------------------------------------------------------

with seed(cat_slug, difficulty, question_text, choices, correct_choice_index, explanation, citation_reference, madhab_tag) as (
  values
  ('quran', 'easy', 'How many surahs are in the Quran?',
   '["110","120","114","99"]', 2,
   'The Quran is made up of 114 surahs, varying from 3 verses to 286.',
   'Standard mushaf arrangement', 'na'),

  ('quran', 'easy', 'Which surah is the longest in the Quran?',
   '["Al-Fatihah","Yasin","Al-Baqarah","An-Nas"]', 2,
   'Surah Al-Baqarah is the longest chapter, with 286 verses.',
   'Surah Al-Baqarah 2', 'na'),

  ('quran', 'easy', 'How many verses are in Surah Al-Fatihah?',
   '["Seven","Five","Ten","Three"]', 0,
   'Al-Fatihah has seven verses, which is why it is called As-Sab‘ al-Mathani, the seven oft-repeated.',
   'Surah Al-Hijr 15:87', 'na'),

  ('quran', 'easy', 'Into how many juz is the Quran divided?',
   '["20","30","40","12"]', 1,
   'The Quran is divided into 30 juz, a division that lets a reader complete it across a month.',
   'Standard mushaf division', 'na'),

  ('quran', 'easy', 'Which surah is known as the opening of the Quran?',
   '["Al-Baqarah","Al-Fatihah","Al-Ikhlas","An-Nas"]', 1,
   'Al-Fatihah means "the Opening" and is the first surah of the mushaf, recited in every unit of prayer.',
   'Surah Al-Fatihah 1', 'na'),

  ('quran', 'easy', 'Which surah closes the Quran?',
   '["Al-Falaq","Al-Ikhlas","Al-Kawthar","An-Nas"]', 3,
   'Surah An-Nas is the 114th and final surah of the mushaf.',
   'Surah An-Nas 114', 'na'),

  ('quran', 'medium', 'Which verses were the first revealed to the Prophet Muhammad ﷺ?',
   '["The opening of Surah Al-Fatihah","The opening verses of Surah Al-Alaq","Ayat al-Kursi","The opening of Surah Al-Baqarah"]', 1,
   'The first revelation was the beginning of Surah Al-Alaq, starting with the command "Iqra" — Read.',
   'Surah Al-Alaq 96:1-5', 'na'),

  ('quran', 'medium', 'In which surah does Ayat al-Kursi appear?',
   '["Al-Baqarah","Al-Imran","An-Nisa","Al-Maidah"]', 0,
   'Ayat al-Kursi is verse 255 of Surah Al-Baqarah.',
   'Surah Al-Baqarah 2:255', 'na'),

  ('quran', 'medium', 'Which surah is the only one that does not begin with the Bismillah?',
   '["Al-Kawthar","An-Nas","Al-Ikhlas","At-Tawbah"]', 3,
   'Surah At-Tawbah is the only surah that does not open with the Bismillah.',
   'Surah At-Tawbah 9', 'na'),

  ('quran', 'medium', 'Which surah does the Quran itself describe as containing "the best of stories"?',
   '["Maryam","Al-Kahf","Yusuf","Nuh"]', 2,
   'Surah Yusuf opens by describing its own account as the best of narrations.',
   'Surah Yusuf 12:3', 'na'),

  ('quran', 'medium', 'Which surah is named after a family mentioned in it, the family of Imran?',
   '["Al-Imran","An-Nisa","Al-Anfal","At-Tawbah"]', 0,
   'Surah Al-Imran, the third surah, is named for the family of Imran.',
   'Surah Al-Imran 3', 'na'),

  ('quran', 'medium', 'Which surah contains the account of the People of the Cave?',
   '["Al-Qasas","Al-Kahf","Ar-Rum","Al-Anbiya"]', 1,
   'Surah Al-Kahf, meaning "the Cave", relates the story of the young men who took refuge in it.',
   'Surah Al-Kahf 18:9-26', 'na'),

  ('quran', 'hard', 'Which is the shortest surah in the Quran by number of verses?',
   '["Al-Ikhlas","An-Nasr","Al-Asr","Al-Kawthar"]', 3,
   'Surah Al-Kawthar has three verses, the fewest of any surah.',
   'Surah Al-Kawthar 108', 'na'),

  ('quran', 'hard', 'Over approximately how many years was the Quran revealed?',
   '["10 years","23 years","40 years","3 years"]', 1,
   'Revelation began when the Prophet ﷺ was about forty and continued until shortly before his death, roughly twenty-three years.',
   'Standard seerah accounts', 'na'),

  ('quran', 'hard', 'Which surah is described in a narration as equal to a third of the Quran?',
   '["Al-Fatihah","Yasin","Al-Mulk","Al-Ikhlas"]', 3,
   'Because Surah Al-Ikhlas is devoted entirely to the oneness of Allah, it is described as equalling a third of the Quran.',
   'Sahih al-Bukhari 5013', 'na'),

  ('quran', 'hard', 'What is the longest single verse in the Quran?',
   '["Ayat al-Kursi","The verse of debt in Surah Al-Baqarah","The opening verse of Surah Al-Imran","The final verse of Surah At-Tawbah"]', 1,
   'Verse 282 of Surah Al-Baqarah, which sets out the recording of debts, is the longest verse in the Quran.',
   'Surah Al-Baqarah 2:282', 'na'),

  ('quran_sciences', 'easy', 'What does the word "tajweed" refer to?',
   '["The translation of the Quran","The order of the surahs","The compilation of the Quran","The rules for reciting the Quran correctly"]', 3,
   'Tajweed is the science of pronouncing each letter properly and observing the rules of recitation.',
   'Standard terminology in Quranic sciences', 'na'),

  ('quran_sciences', 'easy', 'What is "tafsir"?',
   '["Memorisation of the Quran","Melodic recitation","Copying the Quran by hand","Explanation and interpretation of the Quran"]', 3,
   'Tafsir is the scholarly discipline of explaining the meanings of the Quran.',
   'Standard terminology in Quranic sciences', 'na'),

  ('quran_sciences', 'easy', 'What is a person who has memorised the entire Quran called?',
   '["A qadi","A mufti","A muezzin","A hafiz"]', 3,
   'A hafiz (feminine: hafizah) is someone who has committed the whole Quran to memory.',
   'Standard usage', 'na'),

  ('quran_sciences', 'medium', 'What distinguishes a Makkan surah from a Madinan one?',
   '["Its length","Whether it was revealed before or after the Hijrah","Its position in the mushaf","Whether it opens with the Bismillah"]', 1,
   'The classification is by timing relative to the Hijrah, not by geography: what was revealed before the migration is Makkan, after it Madinan.',
   'Standard classification in Quranic sciences', 'na'),

  ('quran_sciences', 'medium', 'What does "asbab an-nuzul" mean?',
   '["The rules of recitation","The occasions of revelation","The order of compilation","The names of the surahs"]', 1,
   'Asbab an-nuzul are the circumstances in which particular verses were revealed, which help explain their meaning.',
   'Standard terminology in Quranic sciences', 'na'),

  ('quran_sciences', 'medium', 'Which caliph is known for standardising the written text of the Quran into official copies?',
   '["Abu Bakr as-Siddiq","Uthman ibn Affan","Umar ibn al-Khattab","Ali ibn Abi Talib"]', 1,
   'Uthman ibn Affan commissioned standard copies which were sent to the major centres of the Muslim world.',
   'Sahih al-Bukhari 4987', 'na'),

  ('quran_sciences', 'medium', 'Under which caliph was the Quran first gathered into a single written collection?',
   '["Uthman ibn Affan","Umar ibn al-Khattab","Ali ibn Abi Talib","Abu Bakr as-Siddiq"]', 3,
   'The first collection into one volume was made during the caliphate of Abu Bakr, on the urging of Umar after many memorisers died at Yamamah.',
   'Sahih al-Bukhari 4986', 'na'),

  ('quran_sciences', 'hard', 'What is a "muhkam" verse, as contrasted with a "mutashabih" one?',
   '["A verse revealed in Makkah","A verse containing a legal ruling","The longest verse of a surah","A verse whose meaning is clear and precise"]', 3,
   'The Quran distinguishes muhkam verses, clear in meaning, from mutashabih verses, whose meaning is not fully determinate.',
   'Surah Al-Imran 3:7', 'na'),

  ('quran_sciences', 'hard', 'What are the "huruf muqatta‘at"?',
   '["The rules of stopping and pausing","The names given to long vowels","The markings for prostration verses","The disconnected letters that open certain surahs"]', 3,
   'These are the isolated letters, such as Alif-Lam-Mim, which begin twenty-nine surahs and whose full meaning is not definitively known.',
   'Surah Al-Baqarah 2:1', 'na'),

  ('quran_sciences', 'hard', 'What does "naskh" refer to in the study of the Quran?',
   '["The copying of manuscripts","Abrogation, where a later ruling supersedes an earlier one","The division into juz","The science of recitation"]', 1,
   'Naskh is the principle that a later revealed ruling can supersede an earlier one, a subject discussed at length by scholars of usul.',
   'Surah Al-Baqarah 2:106', 'na'),

  ('hadith', 'easy', 'What is a hadith?',
   '["A chapter of the Quran","A daily prayer","A pilgrimage rite","A report of the sayings, actions or approvals of the Prophet ﷺ"]', 3,
   'A hadith is a transmitted report of what the Prophet ﷺ said, did, or tacitly approved.',
   'Standard definition in hadith sciences', 'na'),

  ('hadith', 'easy', 'Who compiled the collection known as Sahih al-Bukhari?',
   '["Muhammad ibn Ismail al-Bukhari","Muslim ibn al-Hajjaj","Abu Dawud as-Sijistani","Malik ibn Anas"]', 0,
   'Sahih al-Bukhari was compiled by Muhammad ibn Ismail al-Bukhari.',
   'Sahih al-Bukhari, compiler''s introduction', 'na'),

  ('hadith', 'easy', 'How many collections make up the Kutub as-Sittah, the six books?',
   '["Four","Eight","Six","Ten"]', 2,
   'The six books are Bukhari, Muslim, Abu Dawud, at-Tirmidhi, an-Nasai and Ibn Majah.',
   'Standard classification in hadith sciences', 'na'),

  ('hadith', 'easy', 'Who compiled Sahih Muslim?',
   '["Muhammad ibn Ismail al-Bukhari","Ibn Majah","An-Nasai","Muslim ibn al-Hajjaj"]', 3,
   'Sahih Muslim was compiled by Muslim ibn al-Hajjaj an-Naysaburi.',
   'Sahih Muslim, introduction', 'na'),

  ('hadith', 'medium', 'What does the term "isnad" refer to?',
   '["The text of a hadith","The grading of a hadith","The chain of narrators of a hadith","The chapter heading"]', 2,
   'The isnad is the chain of transmitters; the text itself is called the matn.',
   'Standard terminology in hadith sciences', 'na'),

  ('hadith', 'medium', 'What is the "matn" of a hadith?',
   '["The chain of narrators","The actual text of the report","The book it appears in","Its legal ruling"]', 1,
   'The matn is the wording of the narration itself, as distinct from the isnad that carries it.',
   'Standard terminology in hadith sciences', 'na'),

  ('hadith', 'medium', 'Which hadith, stating that deeds are judged by intentions, opens Sahih al-Bukhari?',
   '["Actions are but by intentions","Religion is sincerity","The believer is the mirror of his brother","Whoever believes in Allah should speak good or stay silent"]', 0,
   'Sahih al-Bukhari opens with the narration that actions are judged by their intentions.',
   'Sahih al-Bukhari 1', 'na'),

  ('hadith', 'medium', 'Which companion is known for narrating the largest number of hadith?',
   '["Abu Hurairah","Anas ibn Malik","Abdullah ibn Umar","Jabir ibn Abdullah"]', 0,
   'Abu Hurairah narrated more hadith than any other companion.',
   'Standard biographical accounts of the narrators', 'na'),

  ('hadith', 'medium', 'Which wife of the Prophet ﷺ is among the most prolific narrators of hadith?',
   '["Sawdah bint Zamah","Aishah bint Abi Bakr","Maymunah bint al-Harith","Juwayriyah bint al-Harith"]', 1,
   'Aishah narrated a very large number of hadith, particularly on matters of household life and worship.',
   'Standard biographical accounts of the narrators', 'na'),

  ('hadith', 'hard', 'What distinguishes a hadith qudsi from the Quran?',
   '["Its meaning is attributed to Allah but its wording is not recited in prayer as revelation","It is always longer","It was revealed only in Madinah","It has no chain of narration"]', 0,
   'A hadith qudsi conveys meaning attributed to Allah, but unlike the Quran its exact wording is not treated as revelation for recitation in prayer.',
   'Standard terminology in hadith sciences', 'na'),

  ('hadith', 'hard', 'In hadith grading, which term describes a narration whose chain is broken or whose narrators are criticised?',
   '["Sahih","Hasan","Mutawatir","Daif"]', 3,
   'A daif (weak) hadith fails one of the conditions of authenticity, such as an unbroken chain of reliable narrators.',
   'Standard grading terminology in hadith sciences', 'na'),

  ('hadith', 'hard', 'What does "mutawatir" mean in hadith classification?',
   '["Narrated by a single reliable person","Narrated by so many at every stage that collusion on a lie is inconceivable","Reported only in Sahih al-Bukhari","A narration with a broken chain"]', 1,
   'A mutawatir report is transmitted by a large number of narrators at each level, giving it the highest degree of certainty.',
   'Standard grading terminology in hadith sciences', 'na'),

  ('hadith', 'hard', 'What is the science of "al-jarh wa at-tadil" concerned with?',
   '["Critically assessing the reliability of narrators","Interpreting difficult Quranic verses","Determining prayer times","Calculating zakat"]', 0,
   'It is the discipline of evaluating narrators, declaring them impugned or trustworthy, which underpins hadith grading.',
   'Standard terminology in hadith sciences', 'na'),

  ('prophetic_biography', 'easy', 'In which city was the Prophet Muhammad ﷺ born?',
   '["Madinah","Taif","Makkah","Jerusalem"]', 2,
   'The Prophet ﷺ was born in Makkah in the Year of the Elephant.',
   'Standard seerah accounts', 'na'),

  ('prophetic_biography', 'easy', 'Who was the first wife of the Prophet Muhammad ﷺ?',
   '["Aishah bint Abi Bakr","Khadijah bint Khuwaylid","Hafsah bint Umar","Zaynab bint Jahsh"]', 1,
   'Khadijah bint Khuwaylid was his first wife and the first person to accept his message.',
   'Standard seerah accounts', 'na'),

  ('prophetic_biography', 'easy', 'Which angel brought the revelation to the Prophet Muhammad ﷺ?',
   '["Mikail","Israfil","Malik","Jibril"]', 3,
   'The angel Jibril conveyed the revelation.',
   'Surah Al-Baqarah 2:97', 'na'),

  ('prophetic_biography', 'easy', 'To which city did the Prophet ﷺ and his companions make the Hijrah?',
   '["Madinah","Taif","Abyssinia","Damascus"]', 0,
   'The Hijrah was the migration from Makkah to Yathrib, which then became known as Madinah.',
   'Standard seerah accounts', 'na'),

  ('prophetic_biography', 'easy', 'What was the name of the Prophet’s ﷺ mother?',
   '["Halimah as-Sadiyyah","Fatimah bint Asad","Aminah bint Wahb","Barakah"]', 2,
   'His mother was Aminah bint Wahb, who died when he was still a young child.',
   'Standard seerah accounts', 'na'),

  ('prophetic_biography', 'medium', 'In which cave did the Prophet ﷺ receive the first revelation?',
   '["Hira","Thawr","Al-Kahf","Uhud"]', 0,
   'The first revelation came in the cave of Hira on the mountain of An-Nur near Makkah.',
   'Sahih al-Bukhari 3', 'na'),

  ('prophetic_biography', 'medium', 'Which uncle raised the Prophet ﷺ after the death of his grandfather?',
   '["Hamzah","Abu Talib","Al-Abbas","Abu Lahab"]', 1,
   'After Abdul-Muttalib died, his uncle Abu Talib took him into his care and protected him for many years.',
   'Standard seerah accounts', 'na'),

  ('prophetic_biography', 'medium', 'Which battle was the first major battle fought by the Muslims of Madinah?',
   '["Badr","Uhud","Khandaq","Hunayn"]', 0,
   'The Battle of Badr took place in the second year after the Hijrah.',
   'Surah Al-Imran 3:123', 'na'),

  ('prophetic_biography', 'medium', 'What was the defensive strategy used by the Muslims at the Battle of the Trench?',
   '["Retreating into the mountains","Digging a trench around the exposed side of Madinah","Attacking at night","Flooding the valley"]', 1,
   'On the advice of Salman al-Farisi, a trench was dug to defend the approach to Madinah, giving the battle its name.',
   'Standard seerah accounts of the Battle of al-Khandaq', 'na'),

  ('prophetic_biography', 'medium', 'Which treaty was concluded between the Muslims and the Quraysh six years after the Hijrah?',
   '["The Constitution of Madinah","The Pledge of Aqabah","The Pact of Umar","The Treaty of Hudaybiyyah"]', 3,
   'The Treaty of Hudaybiyyah established a truce with the Quraysh and is described in the Quran as a clear victory.',
   'Surah Al-Fath 48:1', 'na'),

  ('prophetic_biography', 'hard', 'Which companion accompanied the Prophet ﷺ in the cave during the Hijrah?',
   '["Umar ibn al-Khattab","Abu Bakr as-Siddiq","Uthman ibn Affan","Ali ibn Abi Talib"]', 1,
   'The Quran refers to the two of them in the cave; the companion was Abu Bakr as-Siddiq.',
   'Surah At-Tawbah 9:40', 'na'),

  ('prophetic_biography', 'hard', 'What is the Isra and Miraj?',
   '["The migration to Madinah","The first pilgrimage","The night journey to Jerusalem and the ascension through the heavens","The conquest of Makkah"]', 2,
   'The Isra was the night journey to Al-Aqsa and the Miraj the ascension, during which the five daily prayers were prescribed.',
   'Surah Al-Isra 17:1', 'na'),

  ('prophetic_biography', 'hard', 'To which country did some early Muslims migrate to escape persecution before the Hijrah to Madinah?',
   '["Egypt","Abyssinia","Yemen","Persia"]', 1,
   'A group migrated to Abyssinia, where the Negus gave them refuge.',
   'Standard seerah accounts of the Abyssinian migration', 'na'),

  ('prophetic_biography', 'hard', 'In which year after the Hijrah did the Muslims enter Makkah peacefully?',
   '["The second year","The eighth year","The fifth year","The tenth year"]', 1,
   'The conquest of Makkah took place in 8 AH, and the city was entered with almost no bloodshed.',
   'Standard seerah accounts of the Fath', 'na'),

  ('companions', 'easy', 'Who was the first caliph after the Prophet Muhammad ﷺ?',
   '["Abu Bakr as-Siddiq","Umar ibn al-Khattab","Uthman ibn Affan","Ali ibn Abi Talib"]', 0,
   'Abu Bakr as-Siddiq was the first of the four Rightly Guided Caliphs.',
   'Standard historical accounts of the Rashidun', 'na'),

  ('companions', 'easy', 'Which companion was known by the title "As-Siddiq", the Truthful?',
   '["Umar","Abu Bakr","Uthman","Ali"]', 1,
   'Abu Bakr earned the title As-Siddiq for immediately affirming the Prophet’s ﷺ account of the night journey.',
   'Standard biographical accounts of the companions', 'na'),

  ('companions', 'easy', 'Which companion was known as "Al-Faruq", the one who distinguishes right from wrong?',
   '["Abu Bakr as-Siddiq","Uthman ibn Affan","Khalid ibn al-Walid","Umar ibn al-Khattab"]', 3,
   'Umar ibn al-Khattab was given the title Al-Faruq.',
   'Standard biographical accounts of the companions', 'na'),

  ('companions', 'medium', 'Which companion was the first muezzin, calling the adhan in Madinah?',
   '["Salman al-Farisi","Bilal ibn Rabah","Zayd ibn Thabit","Abu Dharr al-Ghifari"]', 1,
   'Bilal ibn Rabah, freed from slavery by Abu Bakr, became the first to call the adhan.',
   'Standard seerah accounts', 'na'),

  ('companions', 'medium', 'Which companion suggested digging the trench at the Battle of al-Khandaq?',
   '["Bilal ibn Rabah","Abu Ubaydah ibn al-Jarrah","Saad ibn Muadh","Salman al-Farisi"]', 3,
   'Salman al-Farisi, originally from Persia, proposed the strategy of digging a defensive trench.',
   'Standard seerah accounts of the Battle of al-Khandaq', 'na'),

  ('companions', 'medium', 'Which companion was entrusted with writing down the revelation and later with compiling the Quran?',
   '["Abu Hurairah","Zayd ibn Thabit","Anas ibn Malik","Muadh ibn Jabal"]', 1,
   'Zayd ibn Thabit was among the scribes of revelation and led the compilation under Abu Bakr and later Uthman.',
   'Sahih al-Bukhari 4986', 'na'),

  ('companions', 'medium', 'Which commander was given the title "Sayf Allah", the Sword of Allah?',
   '["Amr ibn al-As","Saad ibn Abi Waqqas","Khalid ibn al-Walid","Abu Ubaydah ibn al-Jarrah"]', 2,
   'Khalid ibn al-Walid was described as a sword among the swords of Allah.',
   'Standard biographical accounts of the companions', 'na'),

  ('companions', 'hard', 'Who was the first martyr in Islam?',
   '["Sumayyah bint Khayyat","Hamzah ibn Abd al-Muttalib","Musab ibn Umayr","Yasir ibn Amir"]', 0,
   'Sumayyah bint Khayyat was killed for her faith during the persecution in Makkah, the first to die as a martyr.',
   'Standard seerah accounts of the Makkan persecution', 'na'),

  ('companions', 'hard', 'Which companion was sent to Madinah before the Hijrah to teach its people Islam?',
   '["Musab ibn Umayr","Bilal ibn Rabah","Talhah ibn Ubaydullah","Abu Dharr al-Ghifari"]', 0,
   'Musab ibn Umayr was sent as the first teacher to Yathrib after the pledges at Aqabah.',
   'Standard seerah accounts of the pledges of Aqabah', 'na'),

  ('companions', 'hard', 'What were the Muslims of Madinah who hosted the migrants called?',
   '["The Muhajirun","The Sahabah","The Tabiun","The Ansar"]', 3,
   'The Ansar, the Helpers, were the Muslims of Madinah; the Muhajirun were those who migrated from Makkah.',
   'Surah At-Tawbah 9:100', 'na'),

  ('five_pillars', 'easy', 'How many pillars of Islam are there?',
   '["Three","Five","Six","Seven"]', 1,
   'Islam is built on five pillars: the testimony of faith, prayer, zakat, fasting Ramadan, and Hajj for those able.',
   'Sahih al-Bukhari 8; Sahih Muslim 16', 'agreed'),

  ('five_pillars', 'easy', 'What is the first pillar of Islam?',
   '["The declaration of faith","Prayer","Fasting","Pilgrimage"]', 0,
   'The Shahada — testifying that there is no god but Allah and that Muhammad is His Messenger — is the first pillar.',
   'Sahih al-Bukhari 8; Sahih Muslim 16', 'agreed'),

  ('five_pillars', 'easy', 'How many obligatory prayers does a Muslim perform each day?',
   '["Three","Seven","Five","Two"]', 2,
   'There are five daily obligatory prayers: Fajr, Dhuhr, Asr, Maghrib and Isha.',
   'Sahih al-Bukhari 349', 'agreed'),

  ('five_pillars', 'easy', 'In which month of the Islamic calendar do Muslims fast?',
   '["Shawwal","Muharram","Rajab","Ramadan"]', 3,
   'Fasting is obligatory during Ramadan, the ninth month of the Islamic calendar.',
   'Surah Al-Baqarah 2:185', 'agreed'),

  ('five_pillars', 'medium', 'What is the Arabic term for the obligatory annual charity?',
   '["Sadaqah","Waqf","Zakat","Hibah"]', 2,
   'Zakat is the obligatory annual due on qualifying wealth; sadaqah is voluntary giving.',
   'Surah At-Tawbah 9:60', 'agreed'),

  ('five_pillars', 'medium', 'Which pillar is obligatory only once in a lifetime, and only for those who are able?',
   '["Hajj","Salah","Zakat","Sawm"]', 0,
   'Hajj is obligatory once in a lifetime upon those with the physical and financial means to perform it.',
   'Surah Al-Imran 3:97', 'agreed'),

  ('five_pillars', 'hard', 'How many articles of faith are listed in the hadith of Jibril?',
   '["Five","Six","Three","Seven"]', 1,
   'Belief in Allah, His angels, His books, His messengers, the Last Day, and divine decree.',
   'Sahih Muslim 8', 'na'),

  ('salah', 'easy', 'Which prayer is performed just before sunrise?',
   '["Maghrib","Isha","Fajr","Asr"]', 2,
   'Fajr is prayed in the period between the true dawn and sunrise.',
   'Sahih Muslim 612', 'agreed'),

  ('salah', 'easy', 'Which prayer is performed immediately after sunset?',
   '["Maghrib","Isha","Asr","Fajr"]', 0,
   'Maghrib begins once the sun has set.',
   'Sahih Muslim 612', 'agreed'),

  ('salah', 'easy', 'What is the call to prayer called?',
   '["The adhan","The khutbah","The talbiyah","The takbir"]', 0,
   'The adhan is the call announcing that the time for a prayer has entered.',
   'Sahih al-Bukhari 604', 'agreed'),

  ('salah', 'easy', 'In which direction do Muslims face during prayer?',
   '["Toward Jerusalem","Toward the Kabah in Makkah","Toward the rising sun","Toward Madinah"]', 1,
   'The qiblah is the Kabah in Makkah; the Quran records the change of direction toward it.',
   'Surah Al-Baqarah 2:144', 'agreed'),

  ('salah', 'medium', 'How many obligatory rakah does the Maghrib prayer have?',
   '["Two","Three","Four","One"]', 1,
   'Maghrib consists of three obligatory rakah, the only one of the five with an odd number.',
   'Sahih al-Bukhari 1090', 'agreed'),

  ('salah', 'medium', 'How many obligatory rakah does the Fajr prayer have?',
   '["Three","Four","Two","One"]', 2,
   'Fajr consists of two obligatory rakah.',
   'Sahih al-Bukhari 1099', 'agreed'),

  ('salah', 'medium', 'What is the ritual washing performed before prayer called?',
   '["Wudu","Ghusl","Tayammum","Istinja"]', 0,
   'Wudu is the ablution required before prayer; ghusl is the full bath, and tayammum the dry substitute.',
   'Surah Al-Maidah 5:6', 'agreed'),

  ('salah', 'medium', 'What may a person use for purification when no water is available?',
   '["Nothing; the prayer is delayed","Sand only, and only when travelling","Any liquid at hand","Clean earth, by performing tayammum"]', 3,
   'The Quran permits tayammum with clean earth when water cannot be found or used.',
   'Surah Al-Maidah 5:6', 'agreed'),

  ('salah', 'medium', 'Which surah must be recited in every unit of the obligatory prayer?',
   '["Al-Ikhlas","An-Nas","Al-Asr","Al-Fatihah"]', 3,
   'The Prophet ﷺ said there is no prayer for one who does not recite the Opening of the Book.',
   'Sahih al-Bukhari 756', 'agreed'),

  ('salah', 'hard', 'What is the position of prostration in prayer called?',
   '["Ruku","Sujud","Qiyam","Julus"]', 1,
   'Sujud is prostration; ruku is bowing, qiyam standing, and julus sitting.',
   'Standard terminology of the prayer', 'agreed'),

  ('salah', 'hard', 'What is the Friday congregational prayer called?',
   '["Tarawih","Jumuah","Witr","Eid"]', 1,
   'Salat al-Jumuah is the Friday congregational prayer, preceded by a sermon.',
   'Surah Al-Jumuah 62:9', 'agreed'),

  ('salah', 'hard', 'What concession is granted to a traveller regarding the four-rakah prayers?',
   '["They may be shortened to two rakah","They may be skipped entirely","They must be doubled","They may be prayed silently only"]', 0,
   'Shortening the four-rakah prayers while travelling is established in the Quran and the practice of the Prophet ﷺ.',
   'Surah An-Nisa 4:101', 'agreed'),

  ('ramadan_fasting', 'easy', 'What is the pre-dawn meal before a fast called?',
   '["Iftar","Tarawih","Itikaf","Suhur"]', 3,
   'Suhur is the meal taken before dawn; iftar is the meal breaking the fast at sunset.',
   'Sahih al-Bukhari 1923', 'agreed'),

  ('ramadan_fasting', 'easy', 'At what time does a fasting person break the fast?',
   '["At midnight","At sunset","At sunrise","At noon"]', 1,
   'The fast is completed at sunset, when Maghrib enters.',
   'Surah Al-Baqarah 2:187', 'agreed'),

  ('ramadan_fasting', 'easy', 'Which festival marks the end of Ramadan?',
   '["Eid al-Adha","Ashura","Eid al-Fitr","Mawlid"]', 2,
   'Eid al-Fitr is celebrated on the first day of Shawwal, following the month of fasting.',
   'Sahih al-Bukhari 952', 'agreed'),

  ('ramadan_fasting', 'medium', 'In which part of Ramadan is Laylat al-Qadr sought?',
   '["The first ten nights","The middle ten nights","The first night only","The last ten nights"]', 3,
   'The Prophet ﷺ urged seeking the Night of Decree in the last ten nights, particularly the odd-numbered ones.',
   'Sahih al-Bukhari 2017', 'agreed'),

  ('ramadan_fasting', 'medium', 'Which surah describes the Night of Decree as better than a thousand months?',
   '["Ad-Duha","Al-Qadr","Al-Asr","Al-Falaq"]', 1,
   'Surah Al-Qadr states that the Night of Decree is better than a thousand months.',
   'Surah Al-Qadr 97:3', 'na'),

  ('ramadan_fasting', 'medium', 'Who is excused from fasting Ramadan according to the Quran?',
   '["The sick and the traveller, who make up the days later","Only children","Only the elderly","Nobody is excused"]', 0,
   'The Quran excuses the ill and the traveller, requiring them to make up an equal number of days afterwards.',
   'Surah Al-Baqarah 2:184-185', 'agreed'),

  ('ramadan_fasting', 'medium', 'What is the night prayer performed in congregation during Ramadan commonly called?',
   '["Tahajjud","Tarawih","Witr","Duha"]', 1,
   'Tarawih is the extended voluntary night prayer widely performed in congregation during Ramadan.',
   'Sahih al-Bukhari 2010', 'na'),

  ('ramadan_fasting', 'hard', 'What is "itikaf"?',
   '["Fasting on alternate days","Reciting the whole Quran in a night","Secluding oneself in the mosque for worship","Giving charity in secret"]', 2,
   'Itikaf is a period of retreat in the mosque devoted to worship, commonly observed in the last ten days of Ramadan.',
   'Sahih al-Bukhari 2026', 'na'),

  ('ramadan_fasting', 'hard', 'What is the charity that must be given before the Eid al-Fitr prayer called?',
   '["Zakat al-Mal","Kaffarah","Zakat al-Fitr","Fidyah"]', 2,
   'Zakat al-Fitr is given on behalf of each member of the household before the Eid prayer.',
   'Sahih al-Bukhari 1503', 'agreed'),

  ('hajj_umrah', 'easy', 'During which month is the Hajj pilgrimage performed?',
   '["Ramadan","Muharram","Shaban","Dhul-Hijjah"]', 3,
   'Hajj is performed in Dhul-Hijjah, the twelfth month of the Islamic calendar.',
   'Surah Al-Baqarah 2:197', 'agreed'),

  ('hajj_umrah', 'easy', 'What is the state of ritual consecration a pilgrim enters called?',
   '["Tawaf","Sai","Wuquf","Ihram"]', 3,
   'Ihram is the sanctified state, marked by specific garments and restrictions, entered before performing the rites.',
   'Surah Al-Baqarah 2:197', 'agreed'),

  ('hajj_umrah', 'medium', 'How many circuits make up the tawaf around the Kabah?',
   '["Three","Seven","Five","Ten"]', 1,
   'Tawaf consists of seven circuits of the Kabah, beginning and ending at the Black Stone.',
   'Sahih Muslim 1218', 'agreed'),

  ('hajj_umrah', 'medium', 'Between which two places do pilgrims perform the sai?',
   '["Mina and Arafat","Muzdalifah and Mina","Safa and Marwah","Hira and Thawr"]', 2,
   'The sai is walking seven times between the hills of Safa and Marwah, commemorating Hajar’s search for water.',
   'Surah Al-Baqarah 2:158', 'agreed'),

  ('hajj_umrah', 'medium', 'Standing at which plain is the essential rite without which the Hajj is not valid?',
   '["Mina","Arafat","Muzdalifah","Safa"]', 1,
   'The Prophet ﷺ said that Hajj is Arafah; standing there on the ninth of Dhul-Hijjah is its indispensable pillar.',
   'Sunan an-Nasai 3016', 'agreed'),

  ('hajj_umrah', 'medium', 'Which well near the Kabah is associated with Hajar and the infant Ismail?',
   '["Zamzam","Badr","Hudaybiyyah","Tuwa"]', 0,
   'The well of Zamzam is traditionally associated with the water found for Hajar and her son Ismail.',
   'Sahih al-Bukhari 3364', 'na'),

  ('hajj_umrah', 'hard', 'What is the chant repeated by pilgrims, beginning "Labbayk Allahumma labbayk"?',
   '["The adhan","The takbir","The talbiyah","The tahlil"]', 2,
   'The talbiyah is the pilgrim’s response of answering the call, recited on entering ihram and throughout the rites.',
   'Sahih al-Bukhari 1549', 'agreed'),

  ('hajj_umrah', 'hard', 'How does Umrah differ from Hajj?',
   '["It is obligatory every year","It requires no ihram","It is performed only in Ramadan","It can be performed at any time of year and omits the standing at Arafat"]', 3,
   'Umrah may be performed at any time and consists of ihram, tawaf and sai, without the Arafat and Mina rites of Hajj.',
   'Standard fiqh of the pilgrimage', 'agreed'),

  ('hajj_umrah', 'hard', 'Which prophet is associated in the Quran with raising the foundations of the Kabah?',
   '["Nuh","Musa","Dawud","Ibrahim, with his son Ismail"]', 3,
   'The Quran describes Ibrahim and Ismail raising the foundations of the House.',
   'Surah Al-Baqarah 2:127', 'na'),

  ('zakat_charity', 'easy', 'What is "sadaqah"?',
   '["The obligatory annual zakat","Voluntary charity","The fast of Ramadan","The pilgrimage"]', 1,
   'Sadaqah is voluntary giving, distinct from zakat, which is an obligatory annual due.',
   'Surah Al-Baqarah 2:271', 'na'),

  ('zakat_charity', 'medium', 'What is the standard rate of zakat on accumulated monetary wealth held for a lunar year?',
   '["5%","10%","1%","2.5%"]', 3,
   'Zakat on cash, gold and silver held above the nisab for a full lunar year is one fortieth, that is 2.5%.',
   'Sunan Abi Dawud 1572', 'agreed'),

  ('zakat_charity', 'medium', 'What is the term for the minimum threshold of wealth at which zakat becomes due?',
   '["Hawl","Nisab","Khums","Ushr"]', 1,
   'The nisab is the threshold; the hawl is the lunar year that must pass over the wealth.',
   'Standard fiqh of zakat', 'agreed'),

  ('zakat_charity', 'medium', 'How many categories of recipients of zakat does the Quran name?',
   '["Eight","Four","Six","Ten"]', 0,
   'The Quran lists eight categories, including the poor, the needy, and those employed to collect it.',
   'Surah At-Tawbah 9:60', 'agreed'),

  ('zakat_charity', 'hard', 'What is a "waqf"?',
   '["An endowment whose asset is held permanently and its benefit given in charity","A one-off cash donation","An interest-free loan","A charitable will"]', 0,
   'A waqf is a perpetual endowment: the property itself is retained while its yield or use is devoted to charitable ends.',
   'Sahih al-Bukhari 2737', 'na'),

  ('zakat_charity', 'hard', 'According to a hadith, what is "sadaqah jariyah"?',
   '["Charity given in secret","Charity given only in Ramadan","Charity given to relatives","Ongoing charity whose reward continues after death"]', 3,
   'The Prophet ﷺ described ongoing charity, beneficial knowledge, and a righteous child praying for a person as deeds whose benefit continues after death.',
   'Sahih Muslim 1631', 'na'),

  ('fiqh', 'easy', 'What does the term "halal" mean?',
   '["Forbidden","Permitted","Disliked","Obligatory"]', 1,
   'Halal means permitted; its opposite, haram, means forbidden.',
   'Standard fiqh terminology', 'agreed'),

  ('fiqh', 'easy', 'How many major schools of Sunni jurisprudence are commonly recognised?',
   '["Two","Four","Six","Nine"]', 1,
   'The four widely followed Sunni schools are the Hanafi, Maliki, Shafii and Hanbali.',
   'Standard classification of the madhabs', 'na'),

  ('fiqh', 'medium', 'What is "fiqh"?',
   '["The scholarly understanding of Islamic rulings derived from the sources","The text of the Quran","The biography of the Prophet ﷺ","The science of hadith grading"]', 0,
   'Fiqh is the human scholarly effort to understand and derive practical rulings from the revealed sources.',
   'Standard fiqh terminology', 'na'),

  ('fiqh', 'medium', 'What are the two primary sources of Islamic law that all Sunni schools agree upon?',
   '["The Quran and the Sunnah","Consensus and analogy","Custom and public interest","The rulings of the caliphs"]', 0,
   'The Quran and the Sunnah are the two agreed primary sources; ijma and qiyas are widely accepted secondary ones.',
   'Standard usul al-fiqh', 'agreed'),

  ('fiqh', 'medium', 'What does "ijma" refer to in Islamic legal theory?',
   '["The consensus of qualified scholars","Reasoning by analogy","Personal opinion","Local custom"]', 0,
   'Ijma is scholarly consensus; qiyas is analogical reasoning from an established ruling to a new case.',
   'Standard usul al-fiqh', 'na'),

  ('fiqh', 'medium', 'What is "qiyas"?',
   '["The consensus of scholars","A narration from the Prophet ﷺ","A verse containing a legal ruling","Reasoning by analogy from an established ruling to a new case"]', 3,
   'Qiyas extends a known ruling to a new situation that shares its effective cause.',
   'Standard usul al-fiqh', 'na'),

  ('fiqh', 'hard', 'Which of the five rulings describes an act that is rewarded if done but not sinful if left?',
   '["Wajib (obligatory)","Makruh (disliked)","Haram (forbidden)","Mustahabb (recommended)"]', 3,
   'The five categories are obligatory, recommended, permissible, disliked and forbidden; the recommended is rewarded but not required.',
   'Standard usul al-fiqh', 'agreed'),

  ('fiqh', 'hard', 'After whom is the Maliki school named?',
   '["Abu Hanifah","Muhammad ibn Idris ash-Shafii","Malik ibn Anas","Ahmad ibn Hanbal"]', 2,
   'The Maliki school takes its name from Malik ibn Anas of Madinah, author of the Muwatta.',
   'Standard accounts of the madhabs', 'na'),

  ('fiqh', 'hard', 'Which scholar is credited with systematising the principles of jurisprudence in his Risalah?',
   '["Abu Hanifah","Malik ibn Anas","Muhammad ibn Idris ash-Shafii","Al-Ghazali"]', 2,
   'Ash-Shafii’s Risalah is regarded as the foundational systematic treatment of usul al-fiqh.',
   'Ash-Shafii, Ar-Risalah', 'na'),

  ('aqeedah', 'easy', 'Which name of Allah means "The Most Merciful"?',
   '["Al-Jabbar","Al-Muntaqim","Ar-Rahman","Al-Qahhar"]', 2,
   'Ar-Rahman denotes Allah’s all-encompassing mercy toward the whole of creation.',
   'Surah Al-Fatihah 1:1', 'na'),

  ('aqeedah', 'easy', 'Which name of Allah means "The Creator"?',
   '["Al-Khaliq","Ar-Razzaq","Al-Ghafur","As-Sami"]', 0,
   'Al-Khaliq means the Creator. Ar-Razzaq, by contrast, means the Provider.',
   'Surah Al-Hashr 59:24', 'na'),

  ('aqeedah', 'easy', 'Which name of Allah means "The Provider"?',
   '["Al-Khaliq","Al-Hakim","Al-Alim","Ar-Razzaq"]', 3,
   'Ar-Razzaq is the One who provides sustenance for all creation.',
   'Surah Adh-Dhariyat 51:58', 'na'),

  ('aqeedah', 'easy', 'Which surah is devoted entirely to describing the oneness of Allah?',
   '["Al-Falaq","Al-Ikhlas","An-Nas","Al-Kawthar"]', 1,
   'Surah Al-Ikhlas states Allah’s absolute oneness and that nothing is comparable to Him.',
   'Surah Al-Ikhlas 112:1-4', 'na'),

  ('aqeedah', 'medium', 'How many of Allah’s names are mentioned in the well-known narration about them?',
   '["Ninety-nine","Seventy","One hundred and one","Forty"]', 0,
   'The narration mentions ninety-nine names, and that whoever takes them to heart enters Paradise.',
   'Sahih al-Bukhari 2736; Sahih Muslim 2677', 'na'),

  ('aqeedah', 'medium', 'Which name of Allah means "The All-Hearing"?',
   '["Al-Basir","Al-Alim","As-Sami","Al-Hakim"]', 2,
   'As-Sami means the All-Hearing; Al-Basir means the All-Seeing.',
   'Surah Ash-Shura 42:11', 'na'),

  ('aqeedah', 'medium', 'Which name of Allah means "The All-Knowing"?',
   '["Al-Halim","Al-Karim","Al-Wadud","Al-Alim"]', 3,
   'Al-Alim denotes complete and perfect knowledge of all things.',
   'Surah Al-Baqarah 2:29', 'na'),

  ('aqeedah', 'medium', 'What does "tawhid" refer to?',
   '["The five daily prayers","The compilation of the Quran","The rites of pilgrimage","Affirming the absolute oneness of Allah"]', 3,
   'Tawhid is the affirmation of Allah’s oneness in His lordship, His worship, and His names and attributes.',
   'Surah Al-Ikhlas 112:1', 'na'),

  ('aqeedah', 'hard', 'What is the opposite of tawhid, the association of partners with Allah, called?',
   '["Kufr","Nifaq","Bidah","Shirk"]', 3,
   'Shirk is associating partners with Allah, described in the Quran as the gravest wrong.',
   'Surah Luqman 31:13', 'na'),

  ('aqeedah', 'hard', 'What does belief in "qadar" mean?',
   '["Belief in the angels","Belief in Allah’s decree and predestination","Belief in the revealed books","Belief in the resurrection"]', 1,
   'Qadar is the sixth article of faith: that Allah knows and has decreed all that occurs.',
   'Sahih Muslim 8', 'na'),

  ('aqeedah', 'hard', 'Which name of Allah means "The Ever-Living"?',
   '["Al-Qayyum","Al-Wahid","Al-Hayy","Al-Ahad"]', 2,
   'Al-Hayy means the Ever-Living; Al-Qayyum, paired with it in Ayat al-Kursi, means the Sustainer of all.',
   'Surah Al-Baqarah 2:255', 'na'),

  ('angels_unseen', 'easy', 'From what are the angels created, according to a narration of the Prophet ﷺ?',
   '["Clay","Light","Smokeless fire","Water"]', 1,
   'The Prophet ﷺ said the angels were created from light, the jinn from smokeless fire, and Adam from what was described to us.',
   'Sahih Muslim 2996', 'na'),

  ('angels_unseen', 'easy', 'Which angel is charged with conveying revelation to the prophets?',
   '["Mikail","Israfil","Jibril","Ridwan"]', 2,
   'Jibril is the angel of revelation, described in the Quran as the trustworthy spirit.',
   'Surah Ash-Shuara 26:193', 'na'),

  ('angels_unseen', 'medium', 'Which angel will blow the trumpet at the end of time?',
   '["Jibril","Mikail","Munkar","Israfil"]', 3,
   'Israfil is identified in the tradition as the angel who sounds the trumpet.',
   'Standard accounts of the angels in Islamic belief', 'na'),

  ('angels_unseen', 'medium', 'What are the jinn described as being created from?',
   '["Light","Clay","Smokeless fire","Iron"]', 2,
   'The Quran describes the jinn as created from a smokeless flame of fire.',
   'Surah Ar-Rahman 55:15', 'na'),

  ('angels_unseen', 'medium', 'What does the Quran call the Day of Judgement, among other names?',
   '["Laylat al-Qadr","Yawm al-Jumuah","Yawm al-Qiyamah","Yawm Arafah"]', 2,
   'Yawm al-Qiyamah, the Day of Resurrection, is among the many names the Quran gives that day.',
   'Surah Al-Qiyamah 75:1', 'na'),

  ('angels_unseen', 'hard', 'What is "al-ghayb"?',
   '["The recorded deeds of a person","The unseen, which only Allah fully knows","The night journey","The intermediate life after death"]', 1,
   'Al-ghayb is the realm beyond human perception; the Quran opens by describing the righteous as those who believe in it.',
   'Surah Al-Baqarah 2:3', 'na'),

  ('angels_unseen', 'hard', 'What is the "barzakh"?',
   '["The state between death and the resurrection","The bridge over the Fire","The scale of deeds","The gate of Paradise"]', 0,
   'The barzakh is the barrier or interval between a person’s death and the Day of Resurrection.',
   'Surah Al-Muminun 23:100', 'na'),

  ('angels_unseen', 'hard', 'What does the Quran say about the angels recording a person’s deeds?',
   '["That deeds are not recorded until death","That only good deeds are recorded","That noble scribes record what a person does","That people record their own deeds"]', 2,
   'The Quran describes honourable recording angels who write down what each person does.',
   'Surah Al-Infitar 82:10-12', 'na'),

  ('stories_of_prophets', 'easy', 'Who was the first human being and the first prophet?',
   '["Adam","Nuh","Ibrahim","Idris"]', 0,
   'Adam was the first man and the first of the prophets.',
   'Surah Al-Baqarah 2:30-33', 'na'),

  ('stories_of_prophets', 'easy', 'Which prophet built an ark at Allah’s command?',
   '["Nuh","Hud","Salih","Lut"]', 0,
   'Nuh built the ark and was saved with the believers from the flood.',
   'Surah Hud 11:37-38', 'na'),

  ('stories_of_prophets', 'easy', 'Which prophet was swallowed by a great fish?',
   '["Yusuf","Yunus","Ayyub","Zakariyya"]', 1,
   'Yunus was swallowed by the fish and called upon Allah from within the darkness.',
   'Surah Al-Anbiya 21:87-88', 'na'),

  ('stories_of_prophets', 'easy', 'Who was the mother of Prophet Isa?',
   '["Asiyah","Maryam","Hajar","Sarah"]', 1,
   'Maryam, after whom Surah Maryam is named, is the mother of Isa.',
   'Surah Maryam 19:16-34', 'na'),

  ('stories_of_prophets', 'medium', 'Which prophet is described in the Quran as the one to whom Allah spoke directly?',
   '["Musa","Isa","Yunus","Dawud"]', 0,
   'The Quran states that Allah spoke to Musa directly, which is why he is called Kalimullah.',
   'Surah An-Nisa 4:164', 'na'),

  ('stories_of_prophets', 'medium', 'Which prophet was given the Zabur?',
   '["Musa","Isa","Dawud","Ibrahim"]', 2,
   'The Quran states that the Zabur was given to Dawud.',
   'Surah An-Nisa 4:163', 'na'),

  ('stories_of_prophets', 'medium', 'Which prophet is known in the Quran for his patience through severe affliction?',
   '["Yaqub","Idris","Ilyas","Ayyub"]', 3,
   'Ayyub is presented as the model of patience, and the Quran records his supplication and relief.',
   'Surah Al-Anbiya 21:83-84', 'na'),

  ('stories_of_prophets', 'medium', 'Which prophet was given authority over the wind and understood the speech of birds and ants?',
   '["Sulayman","Dawud","Yusuf","Harun"]', 0,
   'The Quran describes Sulayman’s command over the wind and his understanding of the speech of creatures.',
   'Surah An-Naml 27:16-19', 'na'),

  ('stories_of_prophets', 'medium', 'Which prophet confronted Firawn with clear signs?',
   '["Harun alone","Yusuf","Shuayb","Musa"]', 3,
   'Musa, supported by his brother Harun, was sent to Firawn with signs.',
   'Surah Ta-Ha 20:42-48', 'na'),

  ('stories_of_prophets', 'hard', 'Which prophet is called "Khalilullah", the close friend of Allah?',
   '["Musa","Ibrahim","Nuh","Isa"]', 1,
   'The Quran states that Allah took Ibrahim as an intimate friend.',
   'Surah An-Nisa 4:125', 'na'),

  ('stories_of_prophets', 'hard', 'How many prophets are mentioned by name in the Quran?',
   '["Ten","Forty","Twenty-five","Ninety-nine"]', 2,
   'Twenty-five prophets are named in the Quran, though it states that many more were sent whose accounts were not related.',
   'Surah Ghafir 40:78', 'na'),

  ('stories_of_prophets', 'hard', 'Which prophet was sent to the people of Thamud?',
   '["Hud","Salih","Lut","Shuayb"]', 1,
   'Salih was sent to Thamud, and the she-camel was given to them as a sign.',
   'Surah Al-Araf 7:73', 'na'),

  ('stories_of_prophets', 'hard', 'Which prophet was sent to the people of Ad?',
   '["Salih","Nuh","Yunus","Hud"]', 3,
   'Hud was sent to the people of Ad, and Surah Hud is named after him.',
   'Surah Al-Araf 7:65', 'na'),

  ('tazkiyah', 'easy', 'What does "ikhlas" mean in the context of worship?',
   '["Sincerity, doing an act purely for Allah","Performing an act in public","Repeating an act many times","Doing an act quickly"]', 0,
   'Ikhlas is purity of intention: that the deed is done for Allah alone.',
   'Surah Al-Bayyinah 98:5', 'na'),

  ('tazkiyah', 'easy', 'What is "taqwa" usually translated as?',
   '["Physical strength","God-consciousness and mindfulness of Allah","Wealth","Eloquence"]', 1,
   'Taqwa is awareness of Allah that leads a person to guard against wrongdoing.',
   'Surah Al-Hujurat 49:13', 'na'),

  ('tazkiyah', 'medium', 'What is "riya"?',
   '["Forgetting a portion of the Quran","Delaying a prayer","Giving charity openly","Performing acts of worship to be seen by others"]', 3,
   'Riya is showing off in worship, which the Prophet ﷺ warned against as a subtle danger to sincerity.',
   'Sunan Ibn Majah 4204', 'na'),

  ('tazkiyah', 'medium', 'What is "tawbah"?',
   '["Fasting outside Ramadan","Reciting the Quran aloud","Making the pilgrimage","Turning back to Allah in repentance"]', 3,
   'Tawbah is sincere repentance: leaving the wrong, regretting it, and resolving not to return to it.',
   'Surah At-Tahrim 66:8', 'na'),

  ('tazkiyah', 'medium', 'What is "sabr"?',
   '["Patience and steadfastness","Gratitude","Generosity","Courage in battle"]', 0,
   'Sabr is patient perseverance, which the Quran repeatedly pairs with prayer as a source of help.',
   'Surah Al-Baqarah 2:153', 'na'),

  ('tazkiyah', 'medium', 'What is "shukr"?',
   '["Patience in hardship","Gratitude to Allah","Fear of punishment","Hope for reward"]', 1,
   'Shukr is thankfulness; the Quran promises increase to those who are grateful.',
   'Surah Ibrahim 14:7', 'na'),

  ('tazkiyah', 'hard', 'What is "ihsan", as defined in the hadith of Jibril?',
   '["To give charity in secret","To worship Allah as though you see Him, knowing that He sees you","To fast every other day","To memorise the whole Quran"]', 1,
   'The Prophet ﷺ defined ihsan as worshipping Allah as though you see Him, for though you do not see Him, He sees you.',
   'Sahih Muslim 8', 'na'),

  ('tazkiyah', 'hard', 'What is "tawakkul"?',
   '["Reliance on Allah while still taking the means","Abandoning all effort","Giving away all wealth","Withdrawing from society"]', 0,
   'Tawakkul is trust in Allah combined with taking appropriate action — the Prophet ﷺ told a man to tie his camel and then trust.',
   'Sunan at-Tirmidhi 2517', 'na'),

  ('dua_dhikr', 'easy', 'What does "Alhamdulillah" mean?',
   '["Allah is the Greatest","There is no god but Allah","All praise is for Allah","Glory be to Allah"]', 2,
   '"Alhamdulillah" means all praise belongs to Allah.',
   'Surah Al-Fatihah 1:2', 'na'),

  ('dua_dhikr', 'easy', 'What does "Allahu akbar" mean?',
   '["All praise is for Allah","Glory be to Allah","Allah is the Greatest","In the name of Allah"]', 2,
   '"Allahu akbar", the takbir, means Allah is the Greatest, and opens every unit of the prayer.',
   'Standard usage in the prayer', 'na'),

  ('dua_dhikr', 'easy', 'What does "SubhanAllah" mean?',
   '["All praise is for Allah","Glory be to Allah","Allah is the Greatest","I seek forgiveness from Allah"]', 1,
   '"SubhanAllah" declares Allah free of any imperfection.',
   'Surah Al-Isra 17:44', 'na'),

  ('dua_dhikr', 'medium', 'What does "istighfar" refer to?',
   '["Praising Allah","Asking for provision","Sending blessings on the Prophet ﷺ","Seeking Allah’s forgiveness"]', 3,
   'Istighfar is asking Allah for forgiveness, typically with the words "Astaghfirullah".',
   'Surah Nuh 71:10', 'na'),

  ('dua_dhikr', 'medium', 'What is "dhikr"?',
   '["The remembrance of Allah","The recitation of poetry","The call to prayer","The Friday sermon"]', 0,
   'Dhikr is remembrance of Allah, which the Quran says brings tranquillity to hearts.',
   'Surah Ar-Rad 13:28', 'na'),

  ('dua_dhikr', 'medium', 'Which phrase is said when mentioning something that will happen in the future?',
   '["Ma sha Allah","Jazak Allahu khayran","Barak Allahu fik","In sha Allah"]', 3,
   'The Quran instructs saying "in sha Allah" — if Allah wills — when speaking of doing something tomorrow.',
   'Surah Al-Kahf 18:23-24', 'na'),

  ('dua_dhikr', 'hard', 'What is said upon hearing news of a death or a calamity?',
   '["Inna lillahi wa inna ilayhi rajiun","Alhamdulillah ala kulli hal","La hawla wa la quwwata illa billah","Astaghfirullah al-Azim"]', 0,
   'The Quran teaches this response for those struck by affliction: indeed we belong to Allah and to Him we return.',
   'Surah Al-Baqarah 2:156', 'na'),

  ('dua_dhikr', 'hard', 'Which two short surahs are known as "al-Muawwidhatayn", recited for seeking refuge?',
   '["Al-Falaq and An-Nas","Al-Ikhlas and Al-Kawthar","Al-Asr and Al-Humazah","Ad-Duha and Ash-Sharh"]', 0,
   'Al-Falaq and An-Nas, the last two surahs, are together called al-Muawwidhatayn, the two of seeking refuge.',
   'Sahih al-Bukhari 5017', 'na'),

  ('islamic_history', 'easy', 'What event marks the start of the Islamic calendar?',
   '["The birth of the Prophet ﷺ","The Hijrah from Makkah to Madinah","The first revelation","The conquest of Makkah"]', 1,
   'The Hijri calendar counts from the year of the migration to Madinah.',
   'Established under the caliphate of Umar ibn al-Khattab', 'na'),

  ('islamic_history', 'easy', 'How many Rightly Guided caliphs were there?',
   '["Two","Six","Twelve","Four"]', 3,
   'Abu Bakr, Umar, Uthman and Ali are together known as the Rashidun caliphs.',
   'Standard historical accounts of the Rashidun', 'na'),

  ('islamic_history', 'medium', 'Which city was the capital of the Umayyad caliphate?',
   '["Baghdad","Damascus","Cairo","Cordoba"]', 1,
   'The Umayyads ruled from Damascus; the Abbasids later founded and ruled from Baghdad.',
   'Standard historical accounts of the Umayyad period', 'na'),

  ('islamic_history', 'medium', 'Which city was the capital of the Abbasid caliphate at its height?',
   '["Damascus","Cairo","Samarkand","Baghdad"]', 3,
   'The Abbasids founded Baghdad, which became the centre of learning of its age.',
   'Standard historical accounts of the Abbasid period', 'na'),

  ('islamic_history', 'medium', 'What was the "Bayt al-Hikmah"?',
   '["A mosque in Madinah","A fortress in Andalusia","A centre of learning and translation in Baghdad","A market in Damascus"]', 2,
   'The House of Wisdom in Baghdad was a hub of scholarship and translation under the Abbasids.',
   'Standard historical accounts of the Abbasid period', 'na'),

  ('islamic_history', 'medium', 'Which mosque did the Prophet ﷺ establish on arriving in the area of Madinah?',
   '["Masjid an-Nabawi","Masjid Quba","Masjid al-Haram","Masjid al-Aqsa"]', 1,
   'Masjid Quba was founded on the outskirts of Madinah as the Prophet ﷺ arrived.',
   'Surah At-Tawbah 9:108', 'na'),

  ('islamic_history', 'hard', 'What was Muslim Spain commonly known as?',
   '["Al-Andalus","Al-Maghrib","Ash-Sham","Khurasan"]', 0,
   'Al-Andalus was the name for the Iberian territories under Muslim rule.',
   'Standard historical accounts of Al-Andalus', 'na'),

  ('islamic_history', 'hard', 'Which dynasty ruled Egypt and built the city of Cairo?',
   '["The Umayyads","The Seljuks","The Fatimids","The Ghaznavids"]', 2,
   'The Fatimids founded Cairo in the tenth century as their capital.',
   'Standard historical accounts of the Fatimid period', 'na'),

  ('islamic_history', 'hard', 'Which empire, centred on Istanbul, endured until the early twentieth century?',
   '["The Safavid Empire","The Mughal Empire","The Ottoman Empire","The Abbasid Caliphate"]', 2,
   'The Ottoman Empire ruled from Istanbul and lasted until its dissolution after the First World War.',
   'Standard historical accounts of the Ottoman period', 'na'),

  ('muslim_scholars', 'easy', 'Which scholar’s work gave its name to the mathematical field of algebra?',
   '["Ibn Sina","Al-Biruni","Ibn Khaldun","Al-Khwarizmi"]', 3,
   'The term algebra derives from "al-jabr" in the title of al-Khwarizmi’s treatise, and the word algorithm from his name.',
   'Al-Khwarizmi, Kitab al-Jabr wa-l-Muqabala', 'na'),

  ('muslim_scholars', 'medium', 'Which scholar wrote the Canon of Medicine, used for centuries in Europe and the Muslim world?',
   '["Ibn Rushd","Ibn Sina","Al-Ghazali","Ar-Razi"]', 1,
   'Ibn Sina’s Al-Qanun fi at-Tibb was a standard medical reference for centuries.',
   'Ibn Sina, Al-Qanun fi at-Tibb', 'na'),

  ('muslim_scholars', 'medium', 'Who founded the mosque and teaching institution of al-Qarawiyyin in Fez?',
   '["Zubaydah bint Jafar","Aishah bint Abi Bakr","Rabia al-Adawiyya","Fatima al-Fihri"]', 3,
   'Fatima al-Fihri founded al-Qarawiyyin in the ninth century; it is among the oldest continuously operating institutions of learning.',
   'Standard historical accounts of Fez', 'na'),

  ('muslim_scholars', 'medium', 'Which scholar is best known for the Muqaddimah and for pioneering the study of society and history?',
   '["Ibn Battuta","Ibn Khaldun","Al-Masudi","At-Tabari"]', 1,
   'Ibn Khaldun’s Muqaddimah set out a theory of social organisation and historical change.',
   'Ibn Khaldun, Al-Muqaddimah', 'na'),

  ('muslim_scholars', 'medium', 'Which traveller is famous for journeys across Africa, Asia and Europe recorded in the Rihlah?',
   '["Ibn Jubayr","Ibn Battuta","Al-Idrisi","Ibn Fadlan"]', 1,
   'Ibn Battuta of Tangier travelled for around thirty years, and his account is known as the Rihlah.',
   'Ibn Battuta, Rihlah', 'na'),

  ('muslim_scholars', 'hard', 'Which scholar wrote Ihya Ulum ad-Din, the Revival of the Religious Sciences?',
   '["Ibn Taymiyyah","An-Nawawi","Al-Qurtubi","Al-Ghazali"]', 3,
   'Abu Hamid al-Ghazali’s Ihya is among the most widely read works on the inner dimensions of practice.',
   'Al-Ghazali, Ihya Ulum ad-Din', 'na'),

  ('muslim_scholars', 'hard', 'Which scholar compiled the widely studied collection known as the Forty Hadith?',
   '["Al-Bukhari","Ibn Hajar","As-Suyuti","An-Nawawi"]', 3,
   'Imam an-Nawawi’s collection of forty-two hadith on the foundations of the religion is studied worldwide.',
   'An-Nawawi, Al-Arbain an-Nawawiyyah', 'na'),

  ('muslim_scholars', 'hard', 'Which astronomer and polymath measured the Earth’s radius with remarkable accuracy for his era?',
   '["Al-Kindi","Ibn al-Haytham","Al-Farabi","Al-Biruni"]', 3,
   'Al-Biruni devised a method using the angle of the horizon from a mountain to estimate the Earth’s radius.',
   'Standard histories of Islamic science', 'na'),

  ('muslim_scholars', 'hard', 'Which scholar’s Book of Optics laid foundations for the scientific study of vision and light?',
   '["Ibn Sina","Al-Khwarizmi","Ar-Razi","Ibn al-Haytham"]', 3,
   'Ibn al-Haytham’s Kitab al-Manazir argued that vision results from light entering the eye, and stressed experiment.',
   'Ibn al-Haytham, Kitab al-Manazir', 'na'),

  ('arabic_language', 'easy', 'How many letters are in the Arabic alphabet?',
   '["26","30","24","28"]', 3,
   'The Arabic alphabet has twenty-eight letters.',
   'Standard Arabic grammar', 'na'),

  ('arabic_language', 'easy', 'In which direction is Arabic written?',
   '["Left to right","Top to bottom","Right to left","Bottom to top"]', 2,
   'Arabic script runs from right to left.',
   'Standard Arabic orthography', 'na'),

  ('arabic_language', 'easy', 'What does the Arabic word "kitab" mean?',
   '["Book","House","Water","Road"]', 0,
   '"Kitab" means book, from the root k-t-b relating to writing.',
   'Standard Arabic vocabulary', 'na'),

  ('arabic_language', 'medium', 'What does the word "Iqra", the first word revealed, mean?',
   '["Write","Listen","Stand","Read or recite"]', 3,
   '"Iqra" is a command meaning read or recite, the opening word of the first revelation.',
   'Surah Al-Alaq 96:1', 'na'),

  ('arabic_language', 'medium', 'What does the Arabic word "ilm" mean?',
   '["Patience","Knowledge","Charity","Prayer"]', 1,
   '"Ilm" means knowledge, and gives this app its name.',
   'Surah Ta-Ha 20:114', 'na'),

  ('arabic_language', 'medium', 'What is the typical structure of most Arabic words built from?',
   '["A fixed prefix","A root of three consonants","A single vowel","A compound of two nouns"]', 1,
   'Most Arabic vocabulary derives from triliteral roots, from which patterns generate related meanings.',
   'Standard Arabic morphology', 'na'),

  ('arabic_language', 'hard', 'What does the Quran say about the language of its own revelation?',
   '["That it was sent down in Hebrew","That it has no fixed language","That it was sent down as an Arabic Quran","That it was sent down in Syriac"]', 2,
   'The Quran repeatedly describes itself as revealed as an Arabic recitation.',
   'Surah Yusuf 12:2', 'na'),

  ('arabic_language', 'hard', 'What is "balaghah" the study of?',
   '["Grammar and case endings","Handwriting","Poetry metre only","Eloquence and rhetoric"]', 3,
   'Balaghah is the science of eloquence, covering imagery, style and effective expression.',
   'Standard Arabic rhetorical sciences', 'na'),

  ('ethics', 'easy', 'According to a well-known hadith, what completes a person’s faith regarding their brother?',
   '["Giving him money","Praying beside him","Travelling with him","Loving for him what one loves for oneself"]', 3,
   'The Prophet ﷺ said none of you truly believes until he loves for his brother what he loves for himself.',
   'Sahih al-Bukhari 13; Sahih Muslim 45', 'na'),

  ('ethics', 'easy', 'According to a hadith, what is described as an act of charity that costs nothing?',
   '["Fasting a whole month","Smiling at your brother","Building a mosque","Freeing a slave"]', 1,
   'The Prophet ﷺ said that smiling in the face of your brother is a charity.',
   'Sunan at-Tirmidhi 1956', 'na'),

  ('ethics', 'medium', 'What does the Quran compare backbiting to?',
   '["Carrying a heavy stone","Eating the flesh of one’s dead brother","Walking in darkness","Losing one’s way at sea"]', 1,
   'The Quran uses this striking comparison to convey the gravity of speaking ill of someone absent.',
   'Surah Al-Hujurat 49:12', 'na'),

  ('ethics', 'medium', 'According to a hadith, who is described as truly strong?',
   '["The one who controls himself when angry","The one who wins in wrestling","The one who fasts the longest","The one who gives the most charity"]', 0,
   'The Prophet ﷺ said the strong person is not the one who overcomes others, but the one who controls himself when angry.',
   'Sahih al-Bukhari 6114', 'na'),

  ('ethics', 'medium', 'According to a hadith, truthfulness guides a person toward what?',
   '["Wealth in this life","Long life","Recognition among people","Righteousness, which guides to Paradise"]', 3,
   'The Prophet ﷺ said truthfulness leads to righteousness, and righteousness leads to Paradise.',
   'Sahih al-Bukhari 6094; Sahih Muslim 2607', 'na'),

  ('ethics', 'medium', 'What does the Quran instruct regarding acting on news brought by an unreliable source?',
   '["To repeat it widely","To ignore all news","To act on it immediately","To verify it before acting"]', 3,
   'The Quran commands verification when a report arrives, lest harm be done to people out of ignorance.',
   'Surah Al-Hujurat 49:6', 'na'),

  ('ethics', 'hard', 'According to a hadith, what did the Prophet ﷺ say about a person whose neighbour is not safe from his harm?',
   '["That he must give charity","That he must move house","That he must fast three days","That such a person does not truly believe"]', 3,
   'The Prophet ﷺ swore that one whose neighbour is not safe from his harm does not believe, repeating it for emphasis.',
   'Sahih al-Bukhari 6016', 'na'),

  ('ethics', 'hard', 'What is "amanah"?',
   '["Trustworthiness, and the discharge of what is entrusted to you","Generosity to guests","Courage in adversity","Modesty in dress"]', 0,
   'Amanah covers trusts of every kind, and the Quran commands that trusts be rendered to those they belong to.',
   'Surah An-Nisa 4:58', 'na'),

  ('family_life', 'easy', 'How does the Quran instruct a person to speak to their parents in old age?',
   '["To speak only when spoken to","To remain silent","To speak firmly","Never to say a word of contempt, and to speak to them graciously"]', 3,
   'The Quran commands kindness to parents, forbidding even a word of irritation.',
   'Surah Al-Isra 17:23', 'na'),

  ('family_life', 'easy', 'According to a hadith, who is most deserving of a person’s good companionship?',
   '["Their mother","Their eldest brother","Their employer","Their neighbour"]', 0,
   'A man asked who most deserved his good company; the Prophet ﷺ said his mother, three times, then his father.',
   'Sahih al-Bukhari 5971', 'na'),

  ('family_life', 'medium', 'According to a hadith, the best of people are best in what respect?',
   '["To their families","In wealth","In physical strength","In public speaking"]', 0,
   'The Prophet ﷺ said the best of you are those best to their families, and that he was the best to his.',
   'Sunan at-Tirmidhi 3895', 'na'),

  ('family_life', 'medium', 'What is the marriage gift given by the husband to the wife called?',
   '["Zakat","Sadaqah","Waqf","Mahr"]', 3,
   'The mahr is the wife’s right, given to her and belonging to her alone.',
   'Surah An-Nisa 4:4', 'agreed'),

  ('family_life', 'medium', 'What is "silat ar-rahim"?',
   '["Maintaining ties with relatives","Giving charity anonymously","Praying at night","Fasting on Mondays"]', 0,
   'Silat ar-rahim is upholding kinship ties, strongly emphasised in the Quran and Sunnah.',
   'Sahih al-Bukhari 5985', 'na'),

  ('family_life', 'hard', 'According to a hadith, what is the reward described for a person who raises daughters well?',
   '["Closeness to the Prophet ﷺ on the Day of Resurrection","Wealth in this world","Exemption from fasting","A longer lifespan"]', 0,
   'The Prophet ﷺ said that one who cares well for two daughters until they come of age will be with him on that Day.',
   'Sahih Muslim 2631', 'na'),

  ('sacred_places', 'easy', 'In which city is the Kabah located?',
   '["Madinah","Makkah","Jerusalem","Damascus"]', 1,
   'The Kabah stands within Masjid al-Haram in Makkah.',
   'Surah Al-Imran 3:96', 'na'),

  ('sacred_places', 'easy', 'In which city is Masjid an-Nabawi, the Prophet’s Mosque?',
   '["Madinah","Makkah","Taif","Jeddah"]', 0,
   'Masjid an-Nabawi was built in Madinah after the Hijrah and is where the Prophet ﷺ is buried.',
   'Standard seerah accounts', 'na'),

  ('sacred_places', 'medium', 'In which city is Masjid al-Aqsa?',
   '["Damascus","Cairo","Hebron","Jerusalem"]', 3,
   'Masjid al-Aqsa is in Jerusalem, and was the destination of the night journey.',
   'Surah Al-Isra 17:1', 'na'),

  ('sacred_places', 'medium', 'Which three mosques are singled out in a hadith as destinations worth setting out to visit?',
   '["Al-Haram, Quba and Al-Aqsa","Al-Haram, An-Nabawi and Al-Aqsa","An-Nabawi, Quba and Al-Aqsa","Al-Haram, An-Nabawi and Quba"]', 1,
   'The Prophet ﷺ named Masjid al-Haram, his own mosque, and Masjid al-Aqsa.',
   'Sahih al-Bukhari 1189', 'na'),

  ('sacred_places', 'medium', 'What was the first qiblah, the direction Muslims faced before it changed to the Kabah?',
   '["Madinah","Taif","Mount Sinai","Jerusalem"]', 3,
   'The early Muslims prayed toward Jerusalem until the direction was changed to the Kabah.',
   'Surah Al-Baqarah 2:144', 'na'),

  ('sacred_places', 'hard', 'What is the "Rawdah" in Masjid an-Nabawi?',
   '["The main courtyard","The northern minaret","The library","The area between the Prophet’s ﷺ house and his pulpit"]', 3,
   'The Prophet ﷺ described the space between his house and his pulpit as a garden from the gardens of Paradise.',
   'Sahih al-Bukhari 1195', 'na'),

  ('islamic_calendar', 'easy', 'How many months are in the Islamic calendar?',
   '["Ten","Thirteen","Twelve","Fourteen"]', 2,
   'The Quran states that the number of months with Allah is twelve.',
   'Surah At-Tawbah 9:36', 'na'),

  ('islamic_calendar', 'easy', 'What is the first month of the Islamic calendar?',
   '["Ramadan","Muharram","Shawwal","Rajab"]', 1,
   'Muharram is the first month of the Hijri year.',
   'Standard Islamic calendar', 'na'),

  ('islamic_calendar', 'medium', 'The Islamic calendar is based on the cycles of what?',
   '["The moon","The sun","The stars","The seasons"]', 0,
   'It is a lunar calendar, which is why its months move through the solar year.',
   'Surah Al-Baqarah 2:189', 'na'),

  ('islamic_calendar', 'medium', 'On which day of Muharram is the fast of Ashura observed?',
   '["The tenth","The first","The fifteenth","The twenty-seventh"]', 0,
   'Ashura falls on the tenth of Muharram, and the Prophet ﷺ fasted it and encouraged fasting it.',
   'Sahih al-Bukhari 2004', 'na'),

  ('islamic_calendar', 'medium', 'Which festival falls during the month of Dhul-Hijjah?',
   '["Eid al-Adha","Eid al-Fitr","Ashura","Laylat al-Qadr"]', 0,
   'Eid al-Adha falls on the tenth of Dhul-Hijjah, during the days of Hajj.',
   'Standard Islamic calendar', 'na'),

  ('islamic_calendar', 'hard', 'How many of the twelve months are described in the Quran as sacred?',
   '["Two","Six","One","Four"]', 3,
   'The Quran states that of the twelve months, four are sacred.',
   'Surah At-Tawbah 9:36', 'na'),

  ('islam_world', 'easy', 'Which country has the largest Muslim population in the world?',
   '["Indonesia","Saudi Arabia","Egypt","Turkey"]', 0,
   'Indonesia has the largest Muslim population of any country.',
   'Standard population statistics', 'na'),

  ('islam_world', 'medium', 'In which modern country is the ancient city of Timbuktu, a historic centre of Islamic learning?',
   '["Morocco","Sudan","Niger","Mali"]', 3,
   'Timbuktu, in present-day Mali, was a renowned centre of manuscripts and scholarship.',
   'Standard historical accounts of West African learning', 'na'),

  ('islam_world', 'medium', 'Which empire in the Indian subcontinent built the Taj Mahal?',
   '["The Ottoman Empire","The Safavid Empire","The Delhi Sultanate","The Mughal Empire"]', 3,
   'The Taj Mahal was built under the Mughal emperor Shah Jahan.',
   'Standard historical accounts of the Mughal period', 'na'),

  ('islam_world', 'hard', 'Which West African scholar and leader founded the Sokoto Caliphate in the early nineteenth century?',
   '["Mansa Musa","Ahmad Baba","Al-Hajj Umar Tall","Usman dan Fodio"]', 3,
   'Usman dan Fodio led a reform movement that established the Sokoto Caliphate in what is now northern Nigeria.',
   'Standard historical accounts of the Sokoto Caliphate', 'na'),

  ('islam_world', 'hard', 'Which ruler of Mali became renowned across the medieval world for his pilgrimage to Makkah?',
   '["Sundiata Keita","Mansa Musa","Askia Muhammad","Sunni Ali"]', 1,
   'Mansa Musa’s fourteenth-century pilgrimage was recorded widely for its scale and generosity.',
   'Standard historical accounts of the Mali Empire', 'na'),

  ('contemporary_issues', 'easy', 'What does the term "halal certification" generally refer to?',
   '["A tax on imported goods","A charity registration","Verification that a product meets Islamic dietary or ethical requirements","A form of insurance"]', 2,
   'Halal certification is third-party verification that a product complies with Islamic requirements.',
   'Standard contemporary usage', 'na'),

  ('contemporary_issues', 'medium', 'What is the Arabic term for the interest that Islamic finance seeks to avoid?',
   '["Zakat","Khums","Gharar","Riba"]', 3,
   'Riba is prohibited in the Quran; gharar refers separately to excessive uncertainty in contracts.',
   'Surah Al-Baqarah 2:275', 'agreed'),

  ('contemporary_issues', 'medium', 'What does "gharar" refer to in Islamic commercial ethics?',
   '["Excessive uncertainty or ambiguity in a contract","Charging interest","Trading in food","Selling on credit"]', 0,
   'Gharar is avoidable uncertainty in the subject matter or terms of a contract, which scholars hold invalidates it.',
   'Sahih Muslim 1513', 'na'),

  ('contemporary_issues', 'medium', 'What principle does the Quran state regarding compulsion in matters of religion?',
   '["Compulsion is permitted in wartime","There is no compulsion in religion","Compulsion applies only to adults","Compulsion is required of rulers"]', 1,
   'The Quran states plainly that there is no compulsion in religion.',
   'Surah Al-Baqarah 2:256', 'na'),

  ('contemporary_issues', 'hard', 'What does the Quran say about taking a single innocent life?',
   '["That it is as though one had killed all of humanity","That it is a minor offence","That it can be excused by charity","That it applies only within one community"]', 0,
   'The Quran states that whoever kills a soul, other than for a soul or corruption in the land, it is as if he killed all mankind.',
   'Surah Al-Maidah 5:32', 'na'),

  ('contemporary_issues', 'hard', 'What does the Quran give as the reason for creating people as nations and tribes?',
   '["That they may come to know one another","That they may compete for wealth","That they may remain separate","That they may rank one another"]', 0,
   'The Quran states that people were made into peoples and tribes so that they might know one another, and that the most honoured is the most mindful of Allah.',
   'Surah Al-Hujurat 49:13', 'na'),

  ('fiqh', 'medium', 'What does the term "haram" mean?',
   '["Permitted","Recommended","Forbidden","Obligatory"]', 2,
   'Haram denotes what is prohibited; its opposite, halal, is what is permitted.',
   'Standard fiqh terminology', 'agreed'),

  ('islamic_history', 'medium', 'Who was the second of the Rightly Guided caliphs?',
   '["Uthman ibn Affan","Ali ibn Abi Talib","Muawiyah ibn Abi Sufyan","Umar ibn al-Khattab"]', 3,
   'Umar ibn al-Khattab succeeded Abu Bakr as the second caliph.',
   'Standard historical accounts of the Rashidun', 'na'),

  ('ethics', 'easy', 'What does the Quran command regarding fulfilling promises and contracts?',
   '["That they may be broken if inconvenient","That only written ones bind","That they expire after a year","That they must be fulfilled"]', 3,
   'The Quran opens Surah Al-Maidah by commanding believers to fulfil their contracts.',
   'Surah Al-Maidah 5:1', 'na'),

  ('ethics', 'hard', 'According to a hadith, what did the Prophet ﷺ identify as signs of a hypocrite?',
   '["Sleeping through Fajr","Travelling frequently","Eating alone","Lying when speaking, breaking a promise, and betraying a trust"]', 3,
   'The Prophet ﷺ named three signs: speaking falsely, breaking promises, and betraying what is entrusted.',
   'Sahih al-Bukhari 33', 'na'),

  ('arabic_language', 'easy', 'What does the greeting "As-salamu alaykum" mean?',
   '["Peace be upon you","Welcome to my home","Thank you very much","May you be forgiven"]', 0,
   'It is a greeting of peace, answered with "wa alaykum as-salam".',
   'Surah An-Nur 24:61', 'na'),

  ('arabic_language', 'hard', 'What are the three grammatical cases of the Arabic noun?',
   '["Past, present and future","Masculine, feminine and neuter","Raf, nasb and jarr","Singular, dual and plural"]', 2,
   'Arabic nouns take three cases: raf (nominative), nasb (accusative) and jarr (genitive).',
   'Standard Arabic grammar', 'na'),

  ('five_pillars', 'medium', 'What does the word "Islam" itself mean?',
   '["Submission to Allah","Struggle","Community","Guidance"]', 0,
   'Islam means submission or surrender to Allah, from the same root as salam, peace.',
   'Standard Arabic and theological usage', 'na'),

  ('five_pillars', 'medium', 'What is the Arabic term for fasting, the fourth pillar?',
   '["Salah","Sawm","Zakat","Hajj"]', 1,
   'Sawm is fasting, obligatory during the month of Ramadan.',
   'Surah Al-Baqarah 2:183', 'agreed'),

  ('five_pillars', 'hard', 'What are the two testimonies contained in the Shahada?',
   '["That there is no god but Allah, and that Muhammad is His Messenger","That Allah is one, and that the Quran is true","That prayer is obligatory, and that charity is due","That the angels exist, and that judgement will come"]', 0,
   'The Shahada affirms the oneness of Allah and the messengership of Muhammad ﷺ.',
   'Sahih Muslim 16', 'agreed'),

  ('contemporary_issues', 'easy', 'What does the Quran instruct regarding the environment and causing corruption in the land?',
   '["That the land has no protection","That corruption on the earth is forbidden","That only farmland is protected","That it applies only to rulers"]', 1,
   'The Quran repeatedly forbids spreading corruption in the land after it has been set right.',
   'Surah Al-Araf 7:56', 'na'),

  ('contemporary_issues', 'medium', 'What is "takaful" in contemporary Islamic finance?',
   '["A form of interest-bearing loan","A tax on trade","A cooperative model of mutual risk-sharing used as an alternative to conventional insurance","An investment in commodities only"]', 2,
   'Takaful is built on mutual contribution and shared responsibility rather than the transfer of risk for a premium.',
   'Standard contemporary Islamic finance usage', 'na'),

  ('contemporary_issues', 'medium', 'What does the Quran say about the treatment of orphans’ property?',
   '["That it belongs to the guardian","That it may be used freely","That it must not be consumed unjustly","That it must be given away"]', 2,
   'The Quran warns severely against consuming the property of orphans wrongfully.',
   'Surah An-Nisa 4:10', 'na'),

  ('contemporary_issues', 'hard', 'What does the Quran say about standing witness, even against oneself or close relatives?',
   '["That family may never be testified against","That believers must stand firmly for justice as witnesses to Allah","That witnessing is optional","That only two men may witness"]', 1,
   'The Quran commands standing firmly for justice, even if the testimony is against oneself, parents or relatives.',
   'Surah An-Nisa 4:135', 'na'),

  ('ramadan_fasting', 'easy', 'What is the meal taken to break the fast at sunset called?',
   '["Iftar","Suhur","Tarawih","Sahur"]', 0,
   'Iftar is the meal that breaks the fast once Maghrib enters.',
   'Sahih al-Bukhari 1957', 'agreed'),

  ('hajj_umrah', 'easy', 'What is the cube-shaped structure at the centre of Masjid al-Haram called?',
   '["The Maqam","The Hijr","The Mizab","The Kabah"]', 3,
   'The Kabah is the House toward which Muslims face in prayer.',
   'Surah Al-Baqarah 2:125', 'na'),

  ('zakat_charity', 'easy', 'Is zakat obligatory or voluntary?',
   '["Entirely voluntary","Obligatory only in Ramadan","Obligatory on qualifying wealth","Obligatory only on traders"]', 2,
   'Zakat is one of the five pillars and is obligatory on wealth meeting the threshold and conditions.',
   'Surah Al-Baqarah 2:110', 'agreed'),

  ('zakat_charity', 'easy', 'Which pillar of Islam is zakat?',
   '["The first","The third","The fourth","The fifth"]', 1,
   'In the well-known ordering, zakat is the third pillar, after the Shahada and prayer.',
   'Sahih al-Bukhari 8; Sahih Muslim 16', 'agreed'),

  ('zakat_charity', 'medium', 'What does the Quran say about giving charity openly versus secretly?',
   '["That charity must always be public","That secret charity is not accepted","That the manner makes no difference","That giving secretly to the poor is better for the giver"]', 3,
   'The Quran states that concealing charity and giving it to the poor is better for the one who gives.',
   'Surah Al-Baqarah 2:271', 'na'),

  ('zakat_charity', 'hard', 'What does the Quran warn against doing after giving charity?',
   '["Recording the amount","Nullifying it with reminders of generosity and injury","Giving again to the same person","Giving in public"]', 1,
   'The Quran warns believers not to invalidate their charity by reproach and injury.',
   'Surah Al-Baqarah 2:264', 'na'),

  ('dua_dhikr', 'medium', 'What does the Quran say when describing Allah’s response to those who call upon Him?',
   '["That He answers only in Ramadan","That He is near and answers the call of the caller","That He answers only prophets","That supplication has no effect"]', 1,
   'The Quran states that Allah is near, responding to the supplication of the one who calls upon Him.',
   'Surah Al-Baqarah 2:186', 'na'),

  ('dua_dhikr', 'hard', 'What phrase means "there is no power nor strength except with Allah"?',
   '["Subhan Allah wa bihamdih","Hasbuna Allah wa nima al-wakil","La hawla wa la quwwata illa billah","La ilaha illa Allah"]', 2,
   'This phrase, known as the hawqalah, expresses reliance on Allah in the face of difficulty.',
   'Sahih al-Bukhari 6384', 'na'),

  ('angels_unseen', 'medium', 'Belief in angels is which article of faith?',
   '["One of the six articles of faith","Not an article of faith","One of the five pillars","A recommended belief only"]', 0,
   'Belief in the angels is among the six articles of faith listed in the hadith of Jibril.',
   'Sahih Muslim 8', 'na'),

  ('angels_unseen', 'hard', 'What does the Quran say about whether angels disobey Allah?',
   '["That they sometimes err","That they have free will like humans","That they were created from clay","That they do not disobey what He commands them"]', 3,
   'The Quran describes the angels as not disobeying Allah in what He commands them, doing as they are ordered.',
   'Surah At-Tahrim 66:6', 'na'),

  ('tazkiyah', 'easy', 'What is "haya" often translated as?',
   '["Anger","Ambition","Curiosity","Modesty and a sense of shame that restrains from wrong"]', 3,
   'The Prophet ﷺ described haya as a branch of faith.',
   'Sahih al-Bukhari 9', 'na'),

  ('tazkiyah', 'hard', 'According to a hadith, what is the piece of flesh that, if sound, makes the whole body sound?',
   '["The tongue","The hand","The eye","The heart"]', 3,
   'The Prophet ﷺ said there is a piece of flesh in the body which, if sound, makes the whole body sound — and it is the heart.',
   'Sahih al-Bukhari 52', 'na'),

  ('family_life', 'easy', 'What does the Quran describe as placed between spouses?',
   '["Competition","Affection and mercy","Obligation only","Silence"]', 1,
   'The Quran describes spouses as a source of tranquillity, with affection and mercy placed between them.',
   'Surah Ar-Rum 30:21', 'na'),

  ('family_life', 'medium', 'What does the Quran command regarding orphans in one’s care?',
   '["That they be treated with kindness and not oppressed","That they be sent away","That their property be shared out","That they not be spoken to"]', 0,
   'The Quran instructs that the orphan not be treated harshly, alongside the command to kindness.',
   'Surah Ad-Duha 93:9', 'na'),

  ('family_life', 'medium', 'How many times did the Prophet ﷺ mention the mother before the father when asked about good companionship?',
   '["Once","Three times","Twice","Five times"]', 1,
   'In the well-known narration he answered "your mother" three times before saying "then your father".',
   'Sahih al-Bukhari 5971', 'na'),

  ('family_life', 'hard', 'What does a hadith say about a person who severs family ties?',
   '["That they must fast a month","That they lose their inheritance","That they must move away","That such a person will not enter Paradise"]', 3,
   'The Prophet ﷺ stated that the one who severs ties of kinship will not enter Paradise.',
   'Sahih al-Bukhari 5984', 'na'),

  ('sacred_places', 'easy', 'What is the sacred mosque surrounding the Kabah called?',
   '["Masjid al-Haram","Masjid an-Nabawi","Masjid al-Aqsa","Masjid Quba"]', 0,
   'Masjid al-Haram in Makkah encloses the Kabah.',
   'Surah Al-Isra 17:1', 'na'),

  ('sacred_places', 'medium', 'Which mosque does the Quran describe as founded on piety from the first day?',
   '["Masjid al-Aqsa","Masjid Quba","Masjid an-Nabawi","Masjid al-Haram"]', 1,
   'The Quran refers to a mosque founded on righteousness from its first day, understood as Masjid Quba.',
   'Surah At-Tawbah 9:108', 'na'),

  ('sacred_places', 'medium', 'Where is the plain of Arafat, where pilgrims stand during Hajj?',
   '["Outside Makkah","Outside Madinah","Near Jerusalem","Near Taif"]', 0,
   'Arafat lies to the east of Makkah, and standing there is the essential rite of Hajj.',
   'Surah Al-Baqarah 2:198', 'na'),

  ('sacred_places', 'hard', 'What is the "Maqam Ibrahim" near the Kabah?',
   '["The station associated with Ibrahim, marked near the Kabah","The door of the Kabah","The roof of the mosque","The well of Zamzam"]', 0,
   'The Quran instructs taking the station of Ibrahim as a place of prayer.',
   'Surah Al-Baqarah 2:125', 'na'),

  ('islamic_calendar', 'easy', 'Which month directly follows Ramadan?',
   '["Muharram","Rajab","Shaban","Shawwal"]', 3,
   'Shawwal follows Ramadan, and its first day is Eid al-Fitr.',
   'Standard Islamic calendar', 'na'),

  ('islamic_calendar', 'easy', 'Which month directly precedes Ramadan?',
   '["Shaban","Shawwal","Rajab","Jumada al-Akhirah"]', 0,
   'Shaban is the eighth month, immediately before Ramadan.',
   'Standard Islamic calendar', 'na'),

  ('islamic_calendar', 'medium', 'Roughly how many days shorter is the lunar year than the solar year?',
   '["About one day","About thirty days","About sixty days","About eleven days"]', 3,
   'The lunar year runs about 354 days, roughly eleven days shorter, so Islamic months shift through the seasons.',
   'Standard lunar calendar reckoning', 'na'),

  ('islamic_calendar', 'hard', 'In which month does the Hajj take place?',
   '["Dhul-Qadah","Dhul-Hijjah","Muharram","Safar"]', 1,
   'Dhul-Hijjah, the twelfth month, is the month of the pilgrimage, from which it takes its name.',
   'Surah Al-Baqarah 2:197', 'na'),

  ('muslim_scholars', 'easy', 'After whom is the Hanafi school of jurisprudence named?',
   '["Abu Hanifah","Malik ibn Anas","Ash-Shafii","Ahmad ibn Hanbal"]', 0,
   'The Hanafi school takes its name from Abu Hanifah an-Numan of Kufa.',
   'Standard accounts of the madhabs', 'na'),

  ('islam_world', 'easy', 'In which country are the cities of Makkah and Madinah located?',
   '["Jordan","Yemen","Egypt","Saudi Arabia"]', 3,
   'Both cities are in present-day Saudi Arabia, in the Hijaz region.',
   'Standard geography', 'na'),

  ('islam_world', 'medium', 'Which North African university-mosque in Cairo has been a centre of Islamic learning for over a thousand years?',
   '["Al-Qarawiyyin","Al-Azhar","Az-Zaytuna","Al-Mustansiriyya"]', 1,
   'Al-Azhar in Cairo, founded in the tenth century, remains a leading centre of Islamic scholarship.',
   'Standard historical accounts of Cairo', 'na'),

  ('islam_world', 'medium', 'Which Tunisian mosque-university is among the oldest centres of learning in the Muslim world?',
   '["Al-Azhar","Al-Qarawiyyin","Deoband","Az-Zaytuna"]', 3,
   'Az-Zaytuna in Tunis has been a centre of teaching for well over a millennium.',
   'Standard historical accounts of Tunis', 'na'),

  ('islam_world', 'hard', 'Through which routes did Islam primarily spread to South East Asia?',
   '["Large-scale military conquest","Forced migration","Maritime trade routes","Colonial administration"]', 2,
   'Islam reached the Malay archipelago largely through merchants and scholars travelling the Indian Ocean trade networks.',
   'Standard historical accounts of Islam in South East Asia', 'na'),

  ('islam_world', 'hard', 'What is the Arabic term for the global Muslim community?',
   '["The Ummah","The Madhab","The Khilafah","The Millah"]', 0,
   'The Ummah refers to the worldwide community of believers.',
   'Surah Al-Anbiya 21:92', 'na')

)
insert into public.questions (
  category_id, difficulty, language, madhab_tag,
  question_text, choices, correct_choice_index,
  explanation, citation_reference, source_type, review_status
)
select
  c.id,
  s.difficulty::difficulty_level,
  'en'::app_language,
  s.madhab_tag::madhab_tag,
  s.question_text,
  s.choices::jsonb,
  s.correct_choice_index::smallint,
  s.explanation,
  s.citation_reference,
  'ai_drafted',
  'ai_drafted'::review_status
from seed s
join public.categories c on c.slug = s.cat_slug
where not exists (
  select 1 from public.questions q where q.question_text = s.question_text
);

-- ---------------------------------------------------------------------------
-- Publishing, once reviewed
-- ---------------------------------------------------------------------------
-- The intended route is the app: sign in as a reviewer or admin, open
-- /admin/review, and approve questions there. That records who reviewed each
-- one and when, which is the point of the workflow.
--
-- To publish a batch that a reviewer has already checked offline, this is the
-- statement — deliberately commented out so running this file cannot publish
-- anything by accident:
--
--   update public.questions
--      set review_status = 'published'::review_status,
--          reviewed_at   = now()
--    where review_status = 'ai_drafted'::review_status
--      and language = 'en'::app_language;
