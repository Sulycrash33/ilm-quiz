import type { SeedQuestion } from './types';

/** Hadith sciences, the Seerah, and the Companions. */
export const HADITH_SEERAH_QUESTIONS: SeedQuestion[] = [
  // ===================== hadith =====================
  { category: 'hadith', difficulty: 'easy', q: 'What is a hadith?',
    choices: ['A report of the sayings, actions or approvals of the Prophet ﷺ', 'A chapter of the Quran', 'A daily prayer', 'A pilgrimage rite'],
    why: 'A hadith is a transmitted report of what the Prophet ﷺ said, did, or tacitly approved.',
    cite: 'Standard definition in hadith sciences' },

  { category: 'hadith', difficulty: 'easy', q: 'Who compiled the collection known as Sahih al-Bukhari?',
    choices: ['Muhammad ibn Ismail al-Bukhari', 'Muslim ibn al-Hajjaj', 'Abu Dawud as-Sijistani', 'Malik ibn Anas'],
    why: 'Sahih al-Bukhari was compiled by Muhammad ibn Ismail al-Bukhari.',
    cite: "Sahih al-Bukhari, compiler's introduction" },

  { category: 'hadith', difficulty: 'easy', q: 'How many collections make up the Kutub as-Sittah, the six books?',
    choices: ['Six', 'Four', 'Eight', 'Ten'],
    why: 'The six books are Bukhari, Muslim, Abu Dawud, at-Tirmidhi, an-Nasai and Ibn Majah.',
    cite: 'Standard classification in hadith sciences' },

  { category: 'hadith', difficulty: 'easy', q: 'Who compiled Sahih Muslim?',
    choices: ['Muslim ibn al-Hajjaj', 'Muhammad ibn Ismail al-Bukhari', 'Ibn Majah', 'An-Nasai'],
    why: 'Sahih Muslim was compiled by Muslim ibn al-Hajjaj an-Naysaburi.',
    cite: 'Sahih Muslim, introduction' },

  { category: 'hadith', difficulty: 'medium', q: 'What does the term "isnad" refer to?',
    choices: ['The chain of narrators of a hadith', 'The text of a hadith', 'The grading of a hadith', 'The chapter heading'],
    why: 'The isnad is the chain of transmitters; the text itself is called the matn.',
    cite: 'Standard terminology in hadith sciences' },

  { category: 'hadith', difficulty: 'medium', q: 'What is the "matn" of a hadith?',
    choices: ['The actual text of the report', 'The chain of narrators', 'The book it appears in', 'Its legal ruling'],
    why: 'The matn is the wording of the narration itself, as distinct from the isnad that carries it.',
    cite: 'Standard terminology in hadith sciences' },

  { category: 'hadith', difficulty: 'medium', q: 'Which hadith, stating that deeds are judged by intentions, opens Sahih al-Bukhari?',
    choices: ['Actions are but by intentions', 'Religion is sincerity', 'The believer is the mirror of his brother', 'Whoever believes in Allah should speak good or stay silent'],
    why: 'Sahih al-Bukhari opens with the narration that actions are judged by their intentions.',
    cite: 'Sahih al-Bukhari 1' },

  { category: 'hadith', difficulty: 'medium', q: 'Which companion is known for narrating the largest number of hadith?',
    choices: ['Abu Hurairah', 'Anas ibn Malik', 'Abdullah ibn Umar', 'Jabir ibn Abdullah'],
    why: 'Abu Hurairah narrated more hadith than any other companion.',
    cite: 'Standard biographical accounts of the narrators' },

  { category: 'hadith', difficulty: 'medium', q: 'Which wife of the Prophet ﷺ is among the most prolific narrators of hadith?',
    choices: ['Aishah bint Abi Bakr', 'Sawdah bint Zamah', 'Maymunah bint al-Harith', 'Juwayriyah bint al-Harith'],
    why: 'Aishah narrated a very large number of hadith, particularly on matters of household life and worship.',
    cite: 'Standard biographical accounts of the narrators' },

  { category: 'hadith', difficulty: 'hard', q: 'What distinguishes a hadith qudsi from the Quran?',
    choices: ['Its meaning is attributed to Allah but its wording is not recited in prayer as revelation', 'It is always longer', 'It was revealed only in Madinah', 'It has no chain of narration'],
    why: 'A hadith qudsi conveys meaning attributed to Allah, but unlike the Quran its exact wording is not treated as revelation for recitation in prayer.',
    cite: 'Standard terminology in hadith sciences' },

  { category: 'hadith', difficulty: 'hard', q: 'In hadith grading, which term describes a narration whose chain is broken or whose narrators are criticised?',
    choices: ['Daif', 'Sahih', 'Hasan', 'Mutawatir'],
    why: 'A daif (weak) hadith fails one of the conditions of authenticity, such as an unbroken chain of reliable narrators.',
    cite: 'Standard grading terminology in hadith sciences' },

  { category: 'hadith', difficulty: 'hard', q: 'What does "mutawatir" mean in hadith classification?',
    choices: ['Narrated by so many at every stage that collusion on a lie is inconceivable', 'Narrated by a single reliable person', 'Reported only in Sahih al-Bukhari', 'A narration with a broken chain'],
    why: 'A mutawatir report is transmitted by a large number of narrators at each level, giving it the highest degree of certainty.',
    cite: 'Standard grading terminology in hadith sciences' },

  { category: 'hadith', difficulty: 'hard', q: 'What is the science of "al-jarh wa at-tadil" concerned with?',
    choices: ['Critically assessing the reliability of narrators', 'Interpreting difficult Quranic verses', 'Determining prayer times', 'Calculating zakat'],
    why: 'It is the discipline of evaluating narrators, declaring them impugned or trustworthy, which underpins hadith grading.',
    cite: 'Standard terminology in hadith sciences' },

  // ================ prophetic_biography ================
  { category: 'prophetic_biography', difficulty: 'easy', q: 'In which city was the Prophet Muhammad ﷺ born?',
    choices: ['Makkah', 'Madinah', 'Taif', 'Jerusalem'],
    why: 'The Prophet ﷺ was born in Makkah in the Year of the Elephant.',
    cite: 'Standard seerah accounts' },

  { category: 'prophetic_biography', difficulty: 'easy', q: 'Who was the first wife of the Prophet Muhammad ﷺ?',
    choices: ['Khadijah bint Khuwaylid', 'Aishah bint Abi Bakr', 'Hafsah bint Umar', 'Zaynab bint Jahsh'],
    why: 'Khadijah bint Khuwaylid was his first wife and the first person to accept his message.',
    cite: 'Standard seerah accounts' },

  { category: 'prophetic_biography', difficulty: 'easy', q: 'Which angel brought the revelation to the Prophet Muhammad ﷺ?',
    choices: ['Jibril', 'Mikail', 'Israfil', 'Malik'],
    why: 'The angel Jibril conveyed the revelation.',
    cite: 'Surah Al-Baqarah 2:97' },

  { category: 'prophetic_biography', difficulty: 'easy', q: 'To which city did the Prophet ﷺ and his companions make the Hijrah?',
    choices: ['Madinah', 'Taif', 'Abyssinia', 'Damascus'],
    why: 'The Hijrah was the migration from Makkah to Yathrib, which then became known as Madinah.',
    cite: 'Standard seerah accounts' },

  { category: 'prophetic_biography', difficulty: 'easy', q: 'What was the name of the Prophet’s ﷺ mother?',
    choices: ['Aminah bint Wahb', 'Halimah as-Sadiyyah', 'Fatimah bint Asad', 'Barakah'],
    why: 'His mother was Aminah bint Wahb, who died when he was still a young child.',
    cite: 'Standard seerah accounts' },

  { category: 'prophetic_biography', difficulty: 'medium', q: 'In which cave did the Prophet ﷺ receive the first revelation?',
    choices: ['Hira', 'Thawr', 'Al-Kahf', 'Uhud'],
    why: 'The first revelation came in the cave of Hira on the mountain of An-Nur near Makkah.',
    cite: 'Sahih al-Bukhari 3' },

  { category: 'prophetic_biography', difficulty: 'medium', q: 'Which uncle raised the Prophet ﷺ after the death of his grandfather?',
    choices: ['Abu Talib', 'Hamzah', 'Al-Abbas', 'Abu Lahab'],
    why: 'After Abdul-Muttalib died, his uncle Abu Talib took him into his care and protected him for many years.',
    cite: 'Standard seerah accounts' },

  { category: 'prophetic_biography', difficulty: 'medium', q: 'Which battle was the first major battle fought by the Muslims of Madinah?',
    choices: ['Badr', 'Uhud', 'Khandaq', 'Hunayn'],
    why: 'The Battle of Badr took place in the second year after the Hijrah.',
    cite: 'Surah Al-Imran 3:123' },

  { category: 'prophetic_biography', difficulty: 'medium', q: 'What was the defensive strategy used by the Muslims at the Battle of the Trench?',
    choices: ['Digging a trench around the exposed side of Madinah', 'Retreating into the mountains', 'Attacking at night', 'Flooding the valley'],
    why: 'On the advice of Salman al-Farisi, a trench was dug to defend the approach to Madinah, giving the battle its name.',
    cite: 'Standard seerah accounts of the Battle of al-Khandaq' },

  { category: 'prophetic_biography', difficulty: 'medium', q: 'Which treaty was concluded between the Muslims and the Quraysh six years after the Hijrah?',
    choices: ['The Treaty of Hudaybiyyah', 'The Constitution of Madinah', 'The Pledge of Aqabah', 'The Pact of Umar'],
    why: 'The Treaty of Hudaybiyyah established a truce with the Quraysh and is described in the Quran as a clear victory.',
    cite: 'Surah Al-Fath 48:1' },

  { category: 'prophetic_biography', difficulty: 'hard', q: 'Which companion accompanied the Prophet ﷺ in the cave during the Hijrah?',
    choices: ['Abu Bakr as-Siddiq', 'Umar ibn al-Khattab', 'Uthman ibn Affan', 'Ali ibn Abi Talib'],
    why: 'The Quran refers to the two of them in the cave; the companion was Abu Bakr as-Siddiq.',
    cite: 'Surah At-Tawbah 9:40' },

  { category: 'prophetic_biography', difficulty: 'hard', q: 'What is the Isra and Miraj?',
    choices: ['The night journey to Jerusalem and the ascension through the heavens', 'The migration to Madinah', 'The first pilgrimage', 'The conquest of Makkah'],
    why: 'The Isra was the night journey to Al-Aqsa and the Miraj the ascension, during which the five daily prayers were prescribed.',
    cite: 'Surah Al-Isra 17:1' },

  { category: 'prophetic_biography', difficulty: 'hard', q: 'To which country did some early Muslims migrate to escape persecution before the Hijrah to Madinah?',
    choices: ['Abyssinia', 'Egypt', 'Yemen', 'Persia'],
    why: 'A group migrated to Abyssinia, where the Negus gave them refuge.',
    cite: 'Standard seerah accounts of the Abyssinian migration' },

  { category: 'prophetic_biography', difficulty: 'hard', q: 'In which year after the Hijrah did the Muslims enter Makkah peacefully?',
    choices: ['The eighth year', 'The second year', 'The fifth year', 'The tenth year'],
    why: 'The conquest of Makkah took place in 8 AH, and the city was entered with almost no bloodshed.',
    cite: 'Standard seerah accounts of the Fath' },

  // ==================== companions ====================
  { category: 'companions', difficulty: 'easy', q: 'Who was the first caliph after the Prophet Muhammad ﷺ?',
    choices: ['Abu Bakr as-Siddiq', 'Umar ibn al-Khattab', 'Uthman ibn Affan', 'Ali ibn Abi Talib'],
    why: 'Abu Bakr as-Siddiq was the first of the four Rightly Guided Caliphs.',
    cite: 'Standard historical accounts of the Rashidun' },

  { category: 'companions', difficulty: 'easy', q: 'Which companion was known by the title "As-Siddiq", the Truthful?',
    choices: ['Abu Bakr', 'Umar', 'Uthman', 'Ali'],
    why: 'Abu Bakr earned the title As-Siddiq for immediately affirming the Prophet’s ﷺ account of the night journey.',
    cite: 'Standard biographical accounts of the companions' },

  { category: 'companions', difficulty: 'easy', q: 'Which companion was known as "Al-Faruq", the one who distinguishes right from wrong?',
    choices: ['Umar ibn al-Khattab', 'Abu Bakr as-Siddiq', 'Uthman ibn Affan', 'Khalid ibn al-Walid'],
    why: 'Umar ibn al-Khattab was given the title Al-Faruq.',
    cite: 'Standard biographical accounts of the companions' },

  { category: 'companions', difficulty: 'medium', q: 'Which companion was the first muezzin, calling the adhan in Madinah?',
    choices: ['Bilal ibn Rabah', 'Salman al-Farisi', 'Zayd ibn Thabit', 'Abu Dharr al-Ghifari'],
    why: 'Bilal ibn Rabah, freed from slavery by Abu Bakr, became the first to call the adhan.',
    cite: 'Standard seerah accounts' },

  { category: 'companions', difficulty: 'medium', q: 'Which companion suggested digging the trench at the Battle of al-Khandaq?',
    choices: ['Salman al-Farisi', 'Bilal ibn Rabah', 'Abu Ubaydah ibn al-Jarrah', 'Saad ibn Muadh'],
    why: 'Salman al-Farisi, originally from Persia, proposed the strategy of digging a defensive trench.',
    cite: 'Standard seerah accounts of the Battle of al-Khandaq' },

  { category: 'companions', difficulty: 'medium', q: 'Which companion was entrusted with writing down the revelation and later with compiling the Quran?',
    choices: ['Zayd ibn Thabit', 'Abu Hurairah', 'Anas ibn Malik', 'Muadh ibn Jabal'],
    why: 'Zayd ibn Thabit was among the scribes of revelation and led the compilation under Abu Bakr and later Uthman.',
    cite: 'Sahih al-Bukhari 4986' },

  { category: 'companions', difficulty: 'medium', q: 'Which commander was given the title "Sayf Allah", the Sword of Allah?',
    choices: ['Khalid ibn al-Walid', 'Amr ibn al-As', 'Saad ibn Abi Waqqas', 'Abu Ubaydah ibn al-Jarrah'],
    why: 'Khalid ibn al-Walid was described as a sword among the swords of Allah.',
    cite: 'Standard biographical accounts of the companions' },

  { category: 'companions', difficulty: 'hard', q: 'Who was the first martyr in Islam?',
    choices: ['Sumayyah bint Khayyat', 'Hamzah ibn Abd al-Muttalib', 'Musab ibn Umayr', 'Yasir ibn Amir'],
    why: 'Sumayyah bint Khayyat was killed for her faith during the persecution in Makkah, the first to die as a martyr.',
    cite: 'Standard seerah accounts of the Makkan persecution' },

  { category: 'companions', difficulty: 'hard', q: 'Which companion was sent to Madinah before the Hijrah to teach its people Islam?',
    choices: ['Musab ibn Umayr', 'Bilal ibn Rabah', 'Talhah ibn Ubaydullah', 'Abu Dharr al-Ghifari'],
    why: 'Musab ibn Umayr was sent as the first teacher to Yathrib after the pledges at Aqabah.',
    cite: 'Standard seerah accounts of the pledges of Aqabah' },

  { category: 'companions', difficulty: 'hard', q: 'What were the Muslims of Madinah who hosted the migrants called?',
    choices: ['The Ansar', 'The Muhajirun', 'The Sahabah', 'The Tabiun'],
    why: 'The Ansar, the Helpers, were the Muslims of Madinah; the Muhajirun were those who migrated from Makkah.',
    cite: 'Surah At-Tawbah 9:100' },
];
