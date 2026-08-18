import type { SeedQuestion } from './types';

/** Quran, and the sciences around it. Correct answer is always written first. */
export const QURAN_QUESTIONS: SeedQuestion[] = [
  // ===================== quran =====================
  { category: 'quran', difficulty: 'easy', q: 'How many surahs are in the Quran?',
    choices: ['114', '110', '120', '99'],
    why: 'The Quran is made up of 114 surahs, varying from 3 verses to 286.',
    cite: 'Standard mushaf arrangement' },

  { category: 'quran', difficulty: 'easy', q: 'Which surah is the longest in the Quran?',
    choices: ['Al-Baqarah', 'Al-Fatihah', 'Yasin', 'An-Nas'],
    why: 'Surah Al-Baqarah is the longest chapter, with 286 verses.',
    cite: 'Surah Al-Baqarah 2' },

  { category: 'quran', difficulty: 'easy', q: 'How many verses are in Surah Al-Fatihah?',
    choices: ['Seven', 'Five', 'Ten', 'Three'],
    why: 'Al-Fatihah has seven verses, which is why it is called As-Sab‘ al-Mathani, the seven oft-repeated.',
    cite: 'Surah Al-Hijr 15:87' },

  { category: 'quran', difficulty: 'easy', q: 'Into how many juz is the Quran divided?',
    choices: ['30', '20', '40', '12'],
    why: 'The Quran is divided into 30 juz, a division that lets a reader complete it across a month.',
    cite: 'Standard mushaf division' },

  { category: 'quran', difficulty: 'easy', q: 'Which surah is known as the opening of the Quran?',
    choices: ['Al-Fatihah', 'Al-Baqarah', 'Al-Ikhlas', 'An-Nas'],
    why: 'Al-Fatihah means "the Opening" and is the first surah of the mushaf, recited in every unit of prayer.',
    cite: 'Surah Al-Fatihah 1' },

  { category: 'quran', difficulty: 'easy', q: 'Which surah closes the Quran?',
    choices: ['An-Nas', 'Al-Falaq', 'Al-Ikhlas', 'Al-Kawthar'],
    why: 'Surah An-Nas is the 114th and final surah of the mushaf.',
    cite: 'Surah An-Nas 114' },

  { category: 'quran', difficulty: 'medium', q: 'Which verses were the first revealed to the Prophet Muhammad ﷺ?',
    choices: ['The opening verses of Surah Al-Alaq', 'The opening of Surah Al-Fatihah', 'Ayat al-Kursi', 'The opening of Surah Al-Baqarah'],
    why: 'The first revelation was the beginning of Surah Al-Alaq, starting with the command "Iqra" — Read.',
    cite: 'Surah Al-Alaq 96:1-5' },

  { category: 'quran', difficulty: 'medium', q: 'In which surah does Ayat al-Kursi appear?',
    choices: ['Al-Baqarah', 'Al-Imran', 'An-Nisa', 'Al-Maidah'],
    why: 'Ayat al-Kursi is verse 255 of Surah Al-Baqarah.',
    cite: 'Surah Al-Baqarah 2:255' },

  { category: 'quran', difficulty: 'medium', q: 'Which surah is the only one that does not begin with the Bismillah?',
    choices: ['At-Tawbah', 'Al-Kawthar', 'An-Nas', 'Al-Ikhlas'],
    why: 'Surah At-Tawbah is the only surah that does not open with the Bismillah.',
    cite: 'Surah At-Tawbah 9' },

  { category: 'quran', difficulty: 'medium', q: 'Which surah does the Quran itself describe as containing "the best of stories"?',
    choices: ['Yusuf', 'Maryam', 'Al-Kahf', 'Nuh'],
    why: 'Surah Yusuf opens by describing its own account as the best of narrations.',
    cite: 'Surah Yusuf 12:3' },

  { category: 'quran', difficulty: 'medium', q: 'Which surah is named after a family mentioned in it, the family of Imran?',
    choices: ['Al-Imran', 'An-Nisa', 'Al-Anfal', 'At-Tawbah'],
    why: 'Surah Al-Imran, the third surah, is named for the family of Imran.',
    cite: 'Surah Al-Imran 3' },

  { category: 'quran', difficulty: 'medium', q: 'Which surah contains the account of the People of the Cave?',
    choices: ['Al-Kahf', 'Al-Qasas', 'Ar-Rum', 'Al-Anbiya'],
    why: 'Surah Al-Kahf, meaning "the Cave", relates the story of the young men who took refuge in it.',
    cite: 'Surah Al-Kahf 18:9-26' },

  { category: 'quran', difficulty: 'hard', q: 'Which is the shortest surah in the Quran by number of verses?',
    choices: ['Al-Kawthar', 'Al-Ikhlas', 'An-Nasr', 'Al-Asr'],
    why: 'Surah Al-Kawthar has three verses, the fewest of any surah.',
    cite: 'Surah Al-Kawthar 108' },

  { category: 'quran', difficulty: 'hard', q: 'Over approximately how many years was the Quran revealed?',
    choices: ['23 years', '10 years', '40 years', '3 years'],
    why: 'Revelation began when the Prophet ﷺ was about forty and continued until shortly before his death, roughly twenty-three years.',
    cite: 'Standard seerah accounts' },

  { category: 'quran', difficulty: 'hard', q: 'Which surah is described in a narration as equal to a third of the Quran?',
    choices: ['Al-Ikhlas', 'Al-Fatihah', 'Yasin', 'Al-Mulk'],
    why: 'Because Surah Al-Ikhlas is devoted entirely to the oneness of Allah, it is described as equalling a third of the Quran.',
    cite: 'Sahih al-Bukhari 5013' },

  { category: 'quran', difficulty: 'hard', q: 'What is the longest single verse in the Quran?',
    choices: ['The verse of debt in Surah Al-Baqarah', 'Ayat al-Kursi', 'The opening verse of Surah Al-Imran', 'The final verse of Surah At-Tawbah'],
    why: 'Verse 282 of Surah Al-Baqarah, which sets out the recording of debts, is the longest verse in the Quran.',
    cite: 'Surah Al-Baqarah 2:282' },

  // ================= quran_sciences =================
  { category: 'quran_sciences', difficulty: 'easy', q: 'What does the word "tajweed" refer to?',
    choices: ['The rules for reciting the Quran correctly', 'The translation of the Quran', 'The order of the surahs', 'The compilation of the Quran'],
    why: 'Tajweed is the science of pronouncing each letter properly and observing the rules of recitation.',
    cite: 'Standard terminology in Quranic sciences' },

  { category: 'quran_sciences', difficulty: 'easy', q: 'What is "tafsir"?',
    choices: ['Explanation and interpretation of the Quran', 'Memorisation of the Quran', 'Melodic recitation', 'Copying the Quran by hand'],
    why: 'Tafsir is the scholarly discipline of explaining the meanings of the Quran.',
    cite: 'Standard terminology in Quranic sciences' },

  { category: 'quran_sciences', difficulty: 'easy', q: 'What is a person who has memorised the entire Quran called?',
    choices: ['A hafiz', 'A qadi', 'A mufti', 'A muezzin'],
    why: 'A hafiz (feminine: hafizah) is someone who has committed the whole Quran to memory.',
    cite: 'Standard usage' },

  { category: 'quran_sciences', difficulty: 'medium', q: 'What distinguishes a Makkan surah from a Madinan one?',
    choices: ['Whether it was revealed before or after the Hijrah', 'Its length', 'Its position in the mushaf', 'Whether it opens with the Bismillah'],
    why: 'The classification is by timing relative to the Hijrah, not by geography: what was revealed before the migration is Makkan, after it Madinan.',
    cite: 'Standard classification in Quranic sciences' },

  { category: 'quran_sciences', difficulty: 'medium', q: 'What does "asbab an-nuzul" mean?',
    choices: ['The occasions of revelation', 'The rules of recitation', 'The order of compilation', 'The names of the surahs'],
    why: 'Asbab an-nuzul are the circumstances in which particular verses were revealed, which help explain their meaning.',
    cite: 'Standard terminology in Quranic sciences' },

  { category: 'quran_sciences', difficulty: 'medium', q: 'Which caliph is known for standardising the written text of the Quran into official copies?',
    choices: ['Uthman ibn Affan', 'Abu Bakr as-Siddiq', 'Umar ibn al-Khattab', 'Ali ibn Abi Talib'],
    why: 'Uthman ibn Affan commissioned standard copies which were sent to the major centres of the Muslim world.',
    cite: 'Sahih al-Bukhari 4987' },

  { category: 'quran_sciences', difficulty: 'medium', q: 'Under which caliph was the Quran first gathered into a single written collection?',
    choices: ['Abu Bakr as-Siddiq', 'Uthman ibn Affan', 'Umar ibn al-Khattab', 'Ali ibn Abi Talib'],
    why: 'The first collection into one volume was made during the caliphate of Abu Bakr, on the urging of Umar after many memorisers died at Yamamah.',
    cite: 'Sahih al-Bukhari 4986' },

  { category: 'quran_sciences', difficulty: 'hard', q: 'What is a "muhkam" verse, as contrasted with a "mutashabih" one?',
    choices: ['A verse whose meaning is clear and precise', 'A verse revealed in Makkah', 'A verse containing a legal ruling', 'The longest verse of a surah'],
    why: 'The Quran distinguishes muhkam verses, clear in meaning, from mutashabih verses, whose meaning is not fully determinate.',
    cite: 'Surah Al-Imran 3:7' },

  { category: 'quran_sciences', difficulty: 'hard', q: 'What are the "huruf muqatta‘at"?',
    choices: ['The disconnected letters that open certain surahs', 'The rules of stopping and pausing', 'The names given to long vowels', 'The markings for prostration verses'],
    why: 'These are the isolated letters, such as Alif-Lam-Mim, which begin twenty-nine surahs and whose full meaning is not definitively known.',
    cite: 'Surah Al-Baqarah 2:1' },

  { category: 'quran_sciences', difficulty: 'hard', q: 'What does "naskh" refer to in the study of the Quran?',
    choices: ['Abrogation, where a later ruling supersedes an earlier one', 'The copying of manuscripts', 'The division into juz', 'The science of recitation'],
    why: 'Naskh is the principle that a later revealed ruling can supersede an earlier one, a subject discussed at length by scholars of usul.',
    cite: 'Surah Al-Baqarah 2:106' },
];
