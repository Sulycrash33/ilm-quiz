-- Seed: knowledge categories + a starter question bank for the Hunt.
--
-- WHY THIS FILE EXISTS
-- The app had zero published questions, so every category rendered "Coming
-- Soon" and no run could start. The engine, the ladder and the whole run loop
-- are content-shaped: they need a pool per category to build anything from.
--
-- WHAT REVIEW STATUS THESE GET, AND WHY IT IS NOT 'published'
-- This project takes an explicit position, stated in src/ai/flows/draft-questions.ts
-- and enforced by the RLS in migration 0001: no machine-generated Islamic
-- content reaches users without a qualified human scholar approving it. These
-- questions were written by an AI assistant, so that position applies to them
-- in full. They are inserted as 'ai_drafted' and land in the existing
-- /admin/review queue.
--
-- Nothing here is visible in the app until a reviewer approves it. That is the
-- intended behaviour, not an oversight — see the note at the end of this file
-- for how to publish a batch once it has been checked.
--
-- Every question below is drawn from mainstream, well-established sources and
-- carries a specific citation for the reviewer to verify. Fiqh items are
-- limited to rulings agreed across the four Sunni schools and tagged 'agreed';
-- everything non-fiqh is tagged 'na'.
--
-- Safe to run more than once: categories are matched on slug and questions are
-- matched on question_text, so a re-run inserts nothing new.

-- ---------------------------------------------------------------------------
-- 1. Categories
-- ---------------------------------------------------------------------------
-- Slugs match the ids the app already uses in src/lib/constants.ts, so existing
-- links and any category rows already present keep working.

insert into public.categories (slug, name, description, icon)
select v.slug, v.name, v.description, v.icon
from (values
  ('holy-quran',           'Quran',               'Surahs, verses, themes and revelation',        '📖'),
  ('hadith-sciences',      'Hadith',              'Prophetic narrations and how they are graded', '📜'),
  ('prophetic-biography',  'Seerah & Prophets',   'The life of the Prophet ﷺ and the prophets before him', '⭐'),
  ('five-pillars',         'Five Pillars',        'Shahada, Salah, Zakat, Sawm and Hajj',         '🕌'),
  ('allahs-names',         'Aqeedah',             'Belief, and the names and attributes of Allah', '💎'),
  ('islamic-history',      'History',             'The caliphates and the golden age',            '🏛️'),
  ('arabic-language',      'Arabic',              'The language of the Quran',                    '🔤'),
  ('islamic-ethics',       'Ethics',              'Character, manners and how to treat people',   '❤️')
) as v(slug, name, description, icon)
where not exists (
  select 1 from public.categories c where c.slug = v.slug
);

-- ---------------------------------------------------------------------------
-- 2. Question bank
-- ---------------------------------------------------------------------------

with seed(cat_slug, difficulty, question_text, choices, correct_choice_index, explanation, citation_reference, madhab_tag) as (
  values

  -- ===== Quran =====
  ('holy-quran', 'easy', 'How many surahs are in the Quran?',
   '["114","110","120","99"]', 0,
   'The Quran is made up of 114 surahs, ranging from 3 verses to 286.',
   'Standard mushaf arrangement', 'na'),

  ('holy-quran', 'easy', 'Which surah is the longest in the Quran?',
   '["Al-Baqarah","Al-Fatihah","Yasin","An-Nas"]', 0,
   'Surah Al-Baqarah is the longest chapter, with 286 verses.',
   'Surah Al-Baqarah 2', 'na'),

  ('holy-quran', 'easy', 'How many verses are in Surah Al-Fatihah?',
   '["7","5","10","3"]', 0,
   'Al-Fatihah has seven verses, which is why it is also called As-Sab'' al-Mathani (the seven oft-repeated).',
   'Surah Al-Fatihah 1; Surah Al-Hijr 15:87', 'na'),

  ('holy-quran', 'easy', 'Into how many juz (parts) is the Quran divided?',
   '["30","20","40","12"]', 0,
   'The Quran is divided into 30 juz, a division used to structure recitation across a month.',
   'Standard mushaf division', 'na'),

  ('holy-quran', 'medium', 'Which verses were the first revealed to the Prophet Muhammad ﷺ?',
   '["The opening verses of Surah Al-Alaq","The opening of Surah Al-Fatihah","Ayat al-Kursi","The opening of Surah Al-Baqarah"]', 0,
   'The first revelation was the beginning of Surah Al-Alaq, starting with the command "Iqra" (Read), received in the cave of Hira.',
   'Surah Al-Alaq 96:1-5', 'na'),

  ('holy-quran', 'medium', 'Which surah does Ayat al-Kursi appear in?',
   '["Al-Baqarah","Al-Imran","An-Nisa","Al-Maidah"]', 0,
   'Ayat al-Kursi is verse 255 of Surah Al-Baqarah.',
   'Surah Al-Baqarah 2:255', 'na'),

  ('holy-quran', 'medium', 'Which surah is the only one that does not begin with the Bismillah?',
   '["At-Tawbah","Al-Kawthar","An-Nas","Al-Ikhlas"]', 0,
   'Surah At-Tawbah is the only surah in the Quran that does not open with the Bismillah.',
   'Surah At-Tawbah 9', 'na'),

  ('holy-quran', 'medium', 'Which surah is described in the Quran as containing "the best of stories"?',
   '["Yusuf","Maryam","Al-Kahf","Nuh"]', 0,
   'Surah Yusuf opens by describing its own account as the best of narrations.',
   'Surah Yusuf 12:3', 'na'),

  ('holy-quran', 'hard', 'Which is the shortest surah in the Quran by number of verses?',
   '["Al-Kawthar","Al-Ikhlas","An-Nasr","Al-Asr"]', 0,
   'Surah Al-Kawthar has three verses, the fewest of any surah.',
   'Surah Al-Kawthar 108', 'na'),

  ('holy-quran', 'hard', 'Over approximately how many years was the Quran revealed?',
   '["23 years","10 years","40 years","3 years"]', 0,
   'Revelation began when the Prophet ﷺ was about forty and continued until shortly before his death, roughly twenty-three years in total.',
   'Seerah, agreed across the standard biographies', 'na'),

  -- ===== Five Pillars =====
  ('five-pillars', 'easy', 'How many pillars of Islam are there?',
   '["Five","Three","Six","Seven"]', 0,
   'Islam is built on five pillars: the testimony of faith, prayer, zakat, fasting Ramadan, and Hajj for those able.',
   'Sahih al-Bukhari 8; Sahih Muslim 16', 'agreed'),

  ('five-pillars', 'easy', 'How many obligatory prayers does a Muslim perform each day?',
   '["Five","Three","Seven","Two"]', 0,
   'There are five daily obligatory prayers: Fajr, Dhuhr, Asr, Maghrib and Isha.',
   'Sahih al-Bukhari 349', 'agreed'),

  ('five-pillars', 'easy', 'In which month of the Islamic calendar do Muslims fast?',
   '["Ramadan","Shawwal","Muharram","Rajab"]', 0,
   'Fasting is obligatory during Ramadan, the ninth month of the Islamic calendar.',
   'Surah Al-Baqarah 2:185', 'agreed'),

  ('five-pillars', 'easy', 'What is the first pillar of Islam?',
   '["The declaration of faith (Shahada)","Prayer","Fasting","Pilgrimage"]', 0,
   'The Shahada — testifying that there is no god but Allah and that Muhammad is His Messenger — is the first pillar.',
   'Sahih al-Bukhari 8; Sahih Muslim 16', 'agreed'),

  ('five-pillars', 'medium', 'How many obligatory rak''ah does the Maghrib prayer have?',
   '["Three","Two","Four","One"]', 0,
   'Maghrib consists of three obligatory rak''ah, the only one of the five with an odd number.',
   'Sahih al-Bukhari 1090', 'agreed'),

  ('five-pillars', 'medium', 'What is the standard rate of zakat on accumulated monetary wealth held for a lunar year?',
   '["2.5%","5%","10%","1%"]', 0,
   'Zakat on cash, gold and silver held above the nisab for a full lunar year is one fortieth, that is 2.5%.',
   'Sunan Abi Dawud 1572', 'agreed'),

  ('five-pillars', 'medium', 'During which month is the Hajj pilgrimage performed?',
   '["Dhul-Hijjah","Ramadan","Muharram","Shaban"]', 0,
   'Hajj is performed in Dhul-Hijjah, the twelfth month of the Islamic calendar.',
   'Surah Al-Baqarah 2:197', 'agreed'),

  ('five-pillars', 'hard', 'How many circuits make up the tawaf around the Ka''bah?',
   '["Seven","Three","Five","Ten"]', 0,
   'Tawaf consists of seven circuits of the Ka''bah, beginning and ending at the Black Stone.',
   'Sahih Muslim 1218', 'agreed'),

  ('five-pillars', 'hard', 'Between which two places do pilgrims perform the sa''i?',
   '["Safa and Marwah","Mina and Arafat","Muzdalifah and Mina","Hira and Thawr"]', 0,
   'The sa''i is walking seven times between the hills of Safa and Marwah, commemorating Hajar''s search for water.',
   'Surah Al-Baqarah 2:158', 'agreed'),

  -- ===== Seerah & Prophets =====
  ('prophetic-biography', 'easy', 'In which city was the Prophet Muhammad ﷺ born?',
   '["Makkah","Madinah","Taif","Jerusalem"]', 0,
   'The Prophet ﷺ was born in Makkah in the Year of the Elephant.',
   'Standard seerah accounts', 'na'),

  ('prophetic-biography', 'easy', 'Who was the first wife of the Prophet Muhammad ﷺ?',
   '["Khadijah bint Khuwaylid","Aishah bint Abi Bakr","Hafsah bint Umar","Zaynab bint Jahsh"]', 0,
   'Khadijah bint Khuwaylid was his first wife and the first person to accept his message.',
   'Standard seerah accounts', 'na'),

  ('prophetic-biography', 'easy', 'Which angel brought revelation to the Prophet Muhammad ﷺ?',
   '["Jibril","Mikail","Israfil","Malik"]', 0,
   'The angel Jibril (Gabriel) conveyed the revelation.',
   'Surah Al-Baqarah 2:97', 'na'),

  ('prophetic-biography', 'easy', 'To which city did the Prophet ﷺ and his companions make the Hijrah?',
   '["Madinah","Taif","Abyssinia","Damascus"]', 0,
   'The Hijrah was the migration from Makkah to Yathrib, which then became known as Madinah.',
   'Standard seerah accounts', 'na'),

  ('prophetic-biography', 'medium', 'In which cave did the Prophet ﷺ receive the first revelation?',
   '["Hira","Thawr","Al-Kahf","Uhud"]', 0,
   'The first revelation came in the cave of Hira on the mountain of An-Nur near Makkah.',
   'Sahih al-Bukhari 3', 'na'),

  ('prophetic-biography', 'medium', 'Which prophet, together with his son Isma''il, raised the foundations of the Ka''bah?',
   '["Ibrahim","Nuh","Musa","Adam"]', 0,
   'The Quran describes Ibrahim and Isma''il raising the foundations of the House.',
   'Surah Al-Baqarah 2:127', 'na'),

  ('prophetic-biography', 'medium', 'Which battle was the first major battle fought by the Muslims of Madinah?',
   '["Badr","Uhud","Khandaq","Hunayn"]', 0,
   'The Battle of Badr took place in the second year after the Hijrah.',
   'Surah Al-Imran 3:123', 'na'),

  ('prophetic-biography', 'medium', 'Which prophet is described in the Quran as the one to whom Allah spoke directly?',
   '["Musa","Isa","Yunus","Dawud"]', 0,
   'The Quran states that Allah spoke to Musa directly, which is why he is called Kalimullah.',
   'Surah An-Nisa 4:164', 'na'),

  ('prophetic-biography', 'hard', 'Which companion accompanied the Prophet ﷺ in the cave during the Hijrah?',
   '["Abu Bakr as-Siddiq","Umar ibn al-Khattab","Uthman ibn Affan","Ali ibn Abi Talib"]', 0,
   'The Quran refers to the two of them in the cave; the companion was Abu Bakr as-Siddiq.',
   'Surah At-Tawbah 9:40', 'na'),

  -- ===== Hadith =====
  ('hadith-sciences', 'easy', 'What is a hadith?',
   '["A report of the sayings, actions or approvals of the Prophet ﷺ","A chapter of the Quran","A daily prayer","A pilgrimage rite"]', 0,
   'A hadith is a transmitted report of what the Prophet ﷺ said, did, or tacitly approved.',
   'Standard definition in hadith sciences', 'na'),

  ('hadith-sciences', 'easy', 'Who compiled the collection known as Sahih al-Bukhari?',
   '["Muhammad ibn Isma''il al-Bukhari","Muslim ibn al-Hajjaj","Abu Dawud as-Sijistani","Malik ibn Anas"]', 0,
   'Sahih al-Bukhari was compiled by Muhammad ibn Isma''il al-Bukhari.',
   'Sahih al-Bukhari, compiler''s introduction', 'na'),

  ('hadith-sciences', 'easy', 'How many collections make up the Kutub as-Sittah, the six books?',
   '["Six","Four","Eight","Ten"]', 0,
   'The six books are Bukhari, Muslim, Abu Dawud, at-Tirmidhi, an-Nasa''i and Ibn Majah.',
   'Standard classification in hadith sciences', 'na'),

  ('hadith-sciences', 'medium', 'What does the term "isnad" refer to?',
   '["The chain of narrators of a hadith","The text of a hadith","The grading of a hadith","The subject heading of a chapter"]', 0,
   'The isnad is the chain of transmitters; the text itself is called the matn.',
   'Standard terminology in hadith sciences', 'na'),

  ('hadith-sciences', 'medium', 'Which hadith, famous for stating that deeds are judged by intentions, opens Sahih al-Bukhari?',
   '["Actions are but by intentions","Whoever believes in Allah and the Last Day should speak good or stay silent","Religion is sincerity","None of you believes until he loves for his brother what he loves for himself"]', 0,
   'Sahih al-Bukhari opens with the narration that actions are judged by their intentions.',
   'Sahih al-Bukhari 1', 'na'),

  ('hadith-sciences', 'medium', 'Which companion is known for narrating the largest number of hadith?',
   '["Abu Hurairah","Anas ibn Malik","Abdullah ibn Umar","Jabir ibn Abdullah"]', 0,
   'Abu Hurairah narrated more hadith than any other companion.',
   'Standard biographical accounts of the narrators', 'na'),

  ('hadith-sciences', 'hard', 'What distinguishes a hadith qudsi from the Quran?',
   '["Its meaning is attributed to Allah but its wording is the Prophet''s ﷺ, and it is not recited in prayer","It is longer than a Quranic verse","It was revealed in Madinah only","It has no chain of narration"]', 0,
   'A hadith qudsi conveys meaning attributed to Allah, but unlike the Quran its exact wording is not considered revelation for recitation in prayer.',
   'Standard terminology in hadith sciences', 'na'),

  ('hadith-sciences', 'hard', 'In hadith grading, which term describes a narration whose chain is broken or whose narrators are criticised?',
   '["Da''if","Sahih","Hasan","Mutawatir"]', 0,
   'A da''if (weak) hadith fails one of the conditions of authenticity, such as an unbroken chain of reliable narrators.',
   'Standard grading terminology in hadith sciences', 'na'),

  -- ===== Aqeedah =====
  ('allahs-names', 'easy', 'Which name of Allah means "The Most Merciful"?',
   '["Ar-Rahman","Al-Jabbar","Al-Muntaqim","Al-Qahhar"]', 0,
   'Ar-Rahman denotes Allah''s all-encompassing mercy toward the whole of creation.',
   'Surah Al-Fatihah 1:1', 'na'),

  ('allahs-names', 'easy', 'Which name of Allah means "The Creator"?',
   '["Al-Khaliq","Ar-Razzaq","Al-Ghafur","As-Sami"]', 0,
   'Al-Khaliq means the Creator. Ar-Razzaq, by contrast, means the Provider.',
   'Surah Al-Hashr 59:24', 'na'),

  ('allahs-names', 'easy', 'Which surah is devoted entirely to describing the oneness of Allah?',
   '["Al-Ikhlas","Al-Falaq","An-Nas","Al-Kawthar"]', 0,
   'Surah Al-Ikhlas states Allah''s absolute oneness and that nothing is comparable to Him.',
   'Surah Al-Ikhlas 112:1-4', 'na'),

  ('allahs-names', 'medium', 'How many of Allah''s names are mentioned in the well-known narration about them?',
   '["Ninety-nine","Seventy","One hundred and one","Forty"]', 0,
   'The narration mentions ninety-nine names, and that whoever takes them to heart enters Paradise.',
   'Sahih al-Bukhari 2736; Sahih Muslim 2677', 'na'),

  ('allahs-names', 'medium', 'How many articles of faith are listed in the hadith of Jibril?',
   '["Six","Five","Three","Seven"]', 0,
   'Belief in Allah, His angels, His books, His messengers, the Last Day, and divine decree.',
   'Sahih Muslim 8', 'na'),

  ('allahs-names', 'medium', 'Which name of Allah means "The All-Hearing"?',
   '["As-Sami","Al-Basir","Al-Alim","Al-Hakim"]', 0,
   'As-Sami means the All-Hearing; Al-Basir means the All-Seeing.',
   'Surah Ash-Shura 42:11', 'na'),

  ('allahs-names', 'hard', 'What does the term "tawhid" refer to?',
   '["Affirming the absolute oneness of Allah","The five daily prayers","The compilation of the Quran","The pilgrimage rites"]', 0,
   'Tawhid is the affirmation of Allah''s oneness in His lordship, His worship, and His names and attributes.',
   'Surah Al-Ikhlas 112:1', 'na'),

  -- ===== History =====
  ('islamic-history', 'easy', 'What event marks the start of the Islamic (Hijri) calendar?',
   '["The Hijrah from Makkah to Madinah","The birth of the Prophet ﷺ","The first revelation","The conquest of Makkah"]', 0,
   'The Hijri calendar counts from the year of the migration to Madinah.',
   'Established under the caliphate of Umar ibn al-Khattab', 'na'),

  ('islamic-history', 'easy', 'Who was the first caliph after the Prophet Muhammad ﷺ?',
   '["Abu Bakr as-Siddiq","Umar ibn al-Khattab","Uthman ibn Affan","Ali ibn Abi Talib"]', 0,
   'Abu Bakr as-Siddiq was the first of the four Rightly Guided Caliphs.',
   'Standard historical accounts of the Rashidun', 'na'),

  ('islamic-history', 'easy', 'How many Rightly Guided (Rashidun) caliphs were there?',
   '["Four","Two","Six","Twelve"]', 0,
   'Abu Bakr, Umar, Uthman and Ali are together known as the Rashidun caliphs.',
   'Standard historical accounts of the Rashidun', 'na'),

  ('islamic-history', 'medium', 'Which caliph is known for standardising the written text of the Quran into a single official mushaf?',
   '["Uthman ibn Affan","Abu Bakr as-Siddiq","Umar ibn al-Khattab","Ali ibn Abi Talib"]', 0,
   'Uthman ibn Affan commissioned the standard copies that were distributed to the major centres.',
   'Sahih al-Bukhari 4987', 'na'),

  ('islamic-history', 'medium', 'Which city was the capital of the Abbasid caliphate at its height?',
   '["Baghdad","Damascus","Cairo","Cordoba"]', 0,
   'The Abbasids founded Baghdad and ruled from it; the earlier Umayyads had ruled from Damascus.',
   'Standard historical accounts of the Abbasid period', 'na'),

  ('islamic-history', 'medium', 'Which mosque was the first built by the Prophet ﷺ after leaving Makkah?',
   '["Masjid Quba","Masjid an-Nabawi","Masjid al-Haram","Masjid al-Aqsa"]', 0,
   'Masjid Quba was established on the outskirts of Madinah as the Prophet ﷺ arrived.',
   'Surah At-Tawbah 9:108', 'na'),

  ('islamic-history', 'hard', 'Which scholar''s work gave its name to the mathematical field of algebra?',
   '["Al-Khwarizmi","Ibn Sina","Al-Biruni","Ibn Khaldun"]', 0,
   'The term algebra derives from "al-jabr" in the title of al-Khwarizmi''s treatise; the word algorithm derives from his name.',
   'Al-Khwarizmi, Kitab al-Jabr wa-l-Muqabala', 'na'),

  ('islamic-history', 'hard', 'Who founded the mosque and teaching institution of al-Qarawiyyin in Fez?',
   '["Fatima al-Fihri","Zubaydah bint Ja''far","Aishah bint Abi Bakr","Rabia al-Adawiyya"]', 0,
   'Fatima al-Fihri founded al-Qarawiyyin in the ninth century; it is among the oldest continuously operating institutions of learning.',
   'Standard historical accounts of Fez', 'na'),

  -- ===== Arabic =====
  ('arabic-language', 'easy', 'How many letters are in the Arabic alphabet?',
   '["28","26","30","24"]', 0,
   'The Arabic alphabet has twenty-eight letters.',
   'Standard Arabic grammar', 'na'),

  ('arabic-language', 'easy', 'In which direction is Arabic written?',
   '["Right to left","Left to right","Top to bottom","Bottom to top"]', 0,
   'Arabic script runs from right to left.',
   'Standard Arabic orthography', 'na'),

  ('arabic-language', 'easy', 'What does "Alhamdulillah" mean?',
   '["All praise is for Allah","Allah is the Greatest","There is no god but Allah","In the name of Allah"]', 0,
   '"Alhamdulillah" means all praise belongs to Allah. "Allahu akbar" means Allah is the Greatest.',
   'Surah Al-Fatihah 1:2', 'na'),

  ('arabic-language', 'medium', 'What does the word "Iqra", the first word revealed, mean?',
   '["Read or recite","Write","Listen","Stand"]', 0,
   '"Iqra" is a command meaning read or recite, the opening word of the first revelation.',
   'Surah Al-Alaq 96:1', 'na'),

  ('arabic-language', 'medium', 'What does the Arabic word "ilm" mean?',
   '["Knowledge","Patience","Charity","Prayer"]', 0,
   '"Ilm" means knowledge, and gives this app its name.',
   'Surah Ta-Ha 20:114', 'na'),

  ('arabic-language', 'hard', 'What does the Quran say about the language of its own revelation?',
   '["That it was sent down as an Arabic Quran","That it was sent down in Hebrew","That it has no fixed language","That it was sent down in Syriac"]', 0,
   'The Quran repeatedly describes itself as revealed as an Arabic recitation.',
   'Surah Yusuf 12:2', 'na'),

  -- ===== Ethics =====
  ('islamic-ethics', 'easy', 'What is "sadaqah"?',
   '["Voluntary charity","Obligatory annual zakat","The fast of Ramadan","The pilgrimage"]', 0,
   'Sadaqah is voluntary giving, distinct from zakat, which is an obligatory annual due.',
   'Surah Al-Baqarah 2:271', 'na'),

  ('islamic-ethics', 'easy', 'According to a well-known hadith, what completes a person''s faith regarding their brother?',
   '["Loving for him what one loves for oneself","Giving him money","Praying beside him","Travelling with him"]', 0,
   'The Prophet ﷺ said none of you truly believes until he loves for his brother what he loves for himself.',
   'Sahih al-Bukhari 13; Sahih Muslim 45', 'na'),

  ('islamic-ethics', 'medium', 'What does the Quran compare backbiting (ghibah) to?',
   '["Eating the flesh of one''s dead brother","Carrying a heavy stone","Walking in darkness","Losing one''s way at sea"]', 0,
   'The Quran uses this striking comparison to convey the gravity of speaking ill of someone absent.',
   'Surah Al-Hujurat 49:12', 'na'),

  ('islamic-ethics', 'medium', 'According to a hadith, who is described as truly strong?',
   '["The one who controls himself when angry","The one who wins in wrestling","The one who fasts the longest","The one who gives the most charity"]', 0,
   'The Prophet ﷺ said the strong person is not the one who overcomes others, but the one who controls himself when angry.',
   'Sahih al-Bukhari 6114', 'na'),

  ('islamic-ethics', 'medium', 'How does the Quran instruct a person to speak to their parents in old age?',
   '["Never to say a word of contempt, and to speak to them graciously","To speak only when spoken to","To remain silent","To speak firmly"]', 0,
   'The Quran commands kindness to parents, forbidding even a word of irritation.',
   'Surah Al-Isra 17:23', 'na'),

  ('islamic-ethics', 'hard', 'According to a hadith, truthfulness guides a person toward what?',
   '["Righteousness, which guides to Paradise","Wealth in this life","Long life","Recognition among people"]', 0,
   'The Prophet ﷺ said truthfulness leads to righteousness, and righteousness leads to Paradise.',
   'Sahih al-Bukhari 6094; Sahih Muslim 2607', 'na')

)
insert into public.questions (
  category_id, difficulty, language, madhab_tag,
  question_text, choices, correct_choice_index,
  explanation, citation_reference, review_status
)
select
  c.id,
  s.difficulty,
  'en',
  s.madhab_tag,
  s.question_text,
  s.choices::jsonb,
  s.correct_choice_index,
  s.explanation,
  s.citation_reference,
  -- Deliberately NOT 'published'. See the header of this file.
  'ai_drafted'
from seed s
join public.categories c on c.slug = s.cat_slug
where not exists (
  select 1 from public.questions q where q.question_text = s.question_text
);

-- ---------------------------------------------------------------------------
-- Publishing a batch, once reviewed
-- ---------------------------------------------------------------------------
-- The intended route is the app itself: sign in as a reviewer or admin, open
-- /admin/review, and approve questions one at a time. Approving there records
-- who reviewed each question and when, which is the point of the workflow.
--
-- If a reviewer has checked a whole batch offline and wants to publish it in
-- one go, this is the statement to run — deliberately left commented out so it
-- cannot be executed by simply running this file:
--
--   update public.questions
--      set review_status = 'published',
--          reviewed_by   = '<the reviewing account''s auth uid>',
--          reviewed_at   = now()
--    where review_status = 'ai_drafted'
--      and language = 'en';
--
-- Until that happens, the categories seeded above will still show as empty in
-- the app. That is the review gate working as designed.
