import type { SeedQuestion } from './types';

/** Belief, the unseen, the prophets, the inner life, and remembrance. */
export const BELIEF_QUESTIONS: SeedQuestion[] = [
  // ==================== aqeedah ====================
  { category: 'aqeedah', difficulty: 'easy', q: 'Which name of Allah means "The Most Merciful"?',
    choices: ['Ar-Rahman', 'Al-Jabbar', 'Al-Muntaqim', 'Al-Qahhar'],
    why: 'Ar-Rahman denotes Allah’s all-encompassing mercy toward the whole of creation.',
    cite: 'Surah Al-Fatihah 1:1' },

  { category: 'aqeedah', difficulty: 'easy', q: 'Which name of Allah means "The Creator"?',
    choices: ['Al-Khaliq', 'Ar-Razzaq', 'Al-Ghafur', 'As-Sami'],
    why: 'Al-Khaliq means the Creator. Ar-Razzaq, by contrast, means the Provider.',
    cite: 'Surah Al-Hashr 59:24' },

  { category: 'aqeedah', difficulty: 'easy', q: 'Which name of Allah means "The Provider"?',
    choices: ['Ar-Razzaq', 'Al-Khaliq', 'Al-Hakim', 'Al-Alim'],
    why: 'Ar-Razzaq is the One who provides sustenance for all creation.',
    cite: 'Surah Adh-Dhariyat 51:58' },

  { category: 'aqeedah', difficulty: 'easy', q: 'Which surah is devoted entirely to describing the oneness of Allah?',
    choices: ['Al-Ikhlas', 'Al-Falaq', 'An-Nas', 'Al-Kawthar'],
    why: 'Surah Al-Ikhlas states Allah’s absolute oneness and that nothing is comparable to Him.',
    cite: 'Surah Al-Ikhlas 112:1-4' },

  { category: 'aqeedah', difficulty: 'medium', q: 'How many of Allah’s names are mentioned in the well-known narration about them?',
    choices: ['Ninety-nine', 'Seventy', 'One hundred and one', 'Forty'],
    why: 'The narration mentions ninety-nine names, and that whoever takes them to heart enters Paradise.',
    cite: 'Sahih al-Bukhari 2736; Sahih Muslim 2677' },

  { category: 'aqeedah', difficulty: 'medium', q: 'Which name of Allah means "The All-Hearing"?',
    choices: ['As-Sami', 'Al-Basir', 'Al-Alim', 'Al-Hakim'],
    why: 'As-Sami means the All-Hearing; Al-Basir means the All-Seeing.',
    cite: 'Surah Ash-Shura 42:11' },

  { category: 'aqeedah', difficulty: 'medium', q: 'Which name of Allah means "The All-Knowing"?',
    choices: ['Al-Alim', 'Al-Halim', 'Al-Karim', 'Al-Wadud'],
    why: 'Al-Alim denotes complete and perfect knowledge of all things.',
    cite: 'Surah Al-Baqarah 2:29' },

  { category: 'aqeedah', difficulty: 'medium', q: 'What does "tawhid" refer to?',
    choices: ['Affirming the absolute oneness of Allah', 'The five daily prayers', 'The compilation of the Quran', 'The rites of pilgrimage'],
    why: 'Tawhid is the affirmation of Allah’s oneness in His lordship, His worship, and His names and attributes.',
    cite: 'Surah Al-Ikhlas 112:1' },

  { category: 'aqeedah', difficulty: 'hard', q: 'What is the opposite of tawhid, the association of partners with Allah, called?',
    choices: ['Shirk', 'Kufr', 'Nifaq', 'Bidah'],
    why: 'Shirk is associating partners with Allah, described in the Quran as the gravest wrong.',
    cite: 'Surah Luqman 31:13' },

  { category: 'aqeedah', difficulty: 'hard', q: 'What does belief in "qadar" mean?',
    choices: ['Belief in Allah’s decree and predestination', 'Belief in the angels', 'Belief in the revealed books', 'Belief in the resurrection'],
    why: 'Qadar is the sixth article of faith: that Allah knows and has decreed all that occurs.',
    cite: 'Sahih Muslim 8' },

  { category: 'aqeedah', difficulty: 'hard', q: 'Which name of Allah means "The Ever-Living"?',
    choices: ['Al-Hayy', 'Al-Qayyum', 'Al-Wahid', 'Al-Ahad'],
    why: 'Al-Hayy means the Ever-Living; Al-Qayyum, paired with it in Ayat al-Kursi, means the Sustainer of all.',
    cite: 'Surah Al-Baqarah 2:255' },

  // ================= angels_unseen =================
  { category: 'angels_unseen', difficulty: 'easy', q: 'From what are the angels created, according to a narration of the Prophet ﷺ?',
    choices: ['Light', 'Clay', 'Smokeless fire', 'Water'],
    why: 'The Prophet ﷺ said the angels were created from light, the jinn from smokeless fire, and Adam from what was described to us.',
    cite: 'Sahih Muslim 2996' },

  { category: 'angels_unseen', difficulty: 'easy', q: 'Which angel is charged with conveying revelation to the prophets?',
    choices: ['Jibril', 'Mikail', 'Israfil', 'Ridwan'],
    why: 'Jibril is the angel of revelation, described in the Quran as the trustworthy spirit.',
    cite: 'Surah Ash-Shuara 26:193' },

  { category: 'angels_unseen', difficulty: 'medium', q: 'Which angel will blow the trumpet at the end of time?',
    choices: ['Israfil', 'Jibril', 'Mikail', 'Munkar'],
    why: 'Israfil is identified in the tradition as the angel who sounds the trumpet.',
    cite: 'Standard accounts of the angels in Islamic belief' },

  { category: 'angels_unseen', difficulty: 'medium', q: 'What are the jinn described as being created from?',
    choices: ['Smokeless fire', 'Light', 'Clay', 'Iron'],
    why: 'The Quran describes the jinn as created from a smokeless flame of fire.',
    cite: 'Surah Ar-Rahman 55:15' },

  { category: 'angels_unseen', difficulty: 'medium', q: 'What does the Quran call the Day of Judgement, among other names?',
    choices: ['Yawm al-Qiyamah', 'Laylat al-Qadr', 'Yawm al-Jumuah', 'Yawm Arafah'],
    why: 'Yawm al-Qiyamah, the Day of Resurrection, is among the many names the Quran gives that day.',
    cite: 'Surah Al-Qiyamah 75:1' },

  { category: 'angels_unseen', difficulty: 'hard', q: 'What is "al-ghayb"?',
    choices: ['The unseen, which only Allah fully knows', 'The recorded deeds of a person', 'The night journey', 'The intermediate life after death'],
    why: 'Al-ghayb is the realm beyond human perception; the Quran opens by describing the righteous as those who believe in it.',
    cite: 'Surah Al-Baqarah 2:3' },

  { category: 'angels_unseen', difficulty: 'hard', q: 'What is the "barzakh"?',
    choices: ['The state between death and the resurrection', 'The bridge over the Fire', 'The scale of deeds', 'The gate of Paradise'],
    why: 'The barzakh is the barrier or interval between a person’s death and the Day of Resurrection.',
    cite: 'Surah Al-Muminun 23:100' },

  { category: 'angels_unseen', difficulty: 'hard', q: 'What does the Quran say about the angels recording a person’s deeds?',
    choices: ['That noble scribes record what a person does', 'That deeds are not recorded until death', 'That only good deeds are recorded', 'That people record their own deeds'],
    why: 'The Quran describes honourable recording angels who write down what each person does.',
    cite: 'Surah Al-Infitar 82:10-12' },

  // ============== stories_of_prophets ==============
  { category: 'stories_of_prophets', difficulty: 'easy', q: 'Who was the first human being and the first prophet?',
    choices: ['Adam', 'Nuh', 'Ibrahim', 'Idris'],
    why: 'Adam was the first man and the first of the prophets.',
    cite: 'Surah Al-Baqarah 2:30-33' },

  { category: 'stories_of_prophets', difficulty: 'easy', q: 'Which prophet built an ark at Allah’s command?',
    choices: ['Nuh', 'Hud', 'Salih', 'Lut'],
    why: 'Nuh built the ark and was saved with the believers from the flood.',
    cite: 'Surah Hud 11:37-38' },

  { category: 'stories_of_prophets', difficulty: 'easy', q: 'Which prophet was swallowed by a great fish?',
    choices: ['Yunus', 'Yusuf', 'Ayyub', 'Zakariyya'],
    why: 'Yunus was swallowed by the fish and called upon Allah from within the darkness.',
    cite: 'Surah Al-Anbiya 21:87-88' },

  { category: 'stories_of_prophets', difficulty: 'easy', q: 'Who was the mother of Prophet Isa?',
    choices: ['Maryam', 'Asiyah', 'Hajar', 'Sarah'],
    why: 'Maryam, after whom Surah Maryam is named, is the mother of Isa.',
    cite: 'Surah Maryam 19:16-34' },

  { category: 'stories_of_prophets', difficulty: 'medium', q: 'Which prophet is described in the Quran as the one to whom Allah spoke directly?',
    choices: ['Musa', 'Isa', 'Yunus', 'Dawud'],
    why: 'The Quran states that Allah spoke to Musa directly, which is why he is called Kalimullah.',
    cite: 'Surah An-Nisa 4:164' },

  { category: 'stories_of_prophets', difficulty: 'medium', q: 'Which prophet was given the Zabur?',
    choices: ['Dawud', 'Musa', 'Isa', 'Ibrahim'],
    why: 'The Quran states that the Zabur was given to Dawud.',
    cite: 'Surah An-Nisa 4:163' },

  { category: 'stories_of_prophets', difficulty: 'medium', q: 'Which prophet is known in the Quran for his patience through severe affliction?',
    choices: ['Ayyub', 'Yaqub', 'Idris', 'Ilyas'],
    why: 'Ayyub is presented as the model of patience, and the Quran records his supplication and relief.',
    cite: 'Surah Al-Anbiya 21:83-84' },

  { category: 'stories_of_prophets', difficulty: 'medium', q: 'Which prophet was given authority over the wind and understood the speech of birds and ants?',
    choices: ['Sulayman', 'Dawud', 'Yusuf', 'Harun'],
    why: 'The Quran describes Sulayman’s command over the wind and his understanding of the speech of creatures.',
    cite: 'Surah An-Naml 27:16-19' },

  { category: 'stories_of_prophets', difficulty: 'medium', q: 'Which prophet confronted Firawn with clear signs?',
    choices: ['Musa', 'Harun alone', 'Yusuf', 'Shuayb'],
    why: 'Musa, supported by his brother Harun, was sent to Firawn with signs.',
    cite: 'Surah Ta-Ha 20:42-48' },

  { category: 'stories_of_prophets', difficulty: 'hard', q: 'Which prophet is called "Khalilullah", the close friend of Allah?',
    choices: ['Ibrahim', 'Musa', 'Nuh', 'Isa'],
    why: 'The Quran states that Allah took Ibrahim as an intimate friend.',
    cite: 'Surah An-Nisa 4:125' },

  { category: 'stories_of_prophets', difficulty: 'hard', q: 'How many prophets are mentioned by name in the Quran?',
    choices: ['Twenty-five', 'Ten', 'Forty', 'Ninety-nine'],
    why: 'Twenty-five prophets are named in the Quran, though it states that many more were sent whose accounts were not related.',
    cite: 'Surah Ghafir 40:78' },

  { category: 'stories_of_prophets', difficulty: 'hard', q: 'Which prophet was sent to the people of Thamud?',
    choices: ['Salih', 'Hud', 'Lut', 'Shuayb'],
    why: 'Salih was sent to Thamud, and the she-camel was given to them as a sign.',
    cite: 'Surah Al-Araf 7:73' },

  { category: 'stories_of_prophets', difficulty: 'hard', q: 'Which prophet was sent to the people of Ad?',
    choices: ['Hud', 'Salih', 'Nuh', 'Yunus'],
    why: 'Hud was sent to the people of Ad, and Surah Hud is named after him.',
    cite: 'Surah Al-Araf 7:65' },

  // ==================== tazkiyah ====================
  { category: 'tazkiyah', difficulty: 'easy', q: 'What does "ikhlas" mean in the context of worship?',
    choices: ['Sincerity, doing an act purely for Allah', 'Performing an act in public', 'Repeating an act many times', 'Doing an act quickly'],
    why: 'Ikhlas is purity of intention: that the deed is done for Allah alone.',
    cite: 'Surah Al-Bayyinah 98:5' },

  { category: 'tazkiyah', difficulty: 'easy', q: 'What is "taqwa" usually translated as?',
    choices: ['God-consciousness and mindfulness of Allah', 'Physical strength', 'Wealth', 'Eloquence'],
    why: 'Taqwa is awareness of Allah that leads a person to guard against wrongdoing.',
    cite: 'Surah Al-Hujurat 49:13' },

  { category: 'tazkiyah', difficulty: 'medium', q: 'What is "riya"?',
    choices: ['Performing acts of worship to be seen by others', 'Forgetting a portion of the Quran', 'Delaying a prayer', 'Giving charity openly'],
    why: 'Riya is showing off in worship, which the Prophet ﷺ warned against as a subtle danger to sincerity.',
    cite: 'Sunan Ibn Majah 4204' },

  { category: 'tazkiyah', difficulty: 'medium', q: 'What is "tawbah"?',
    choices: ['Turning back to Allah in repentance', 'Fasting outside Ramadan', 'Reciting the Quran aloud', 'Making the pilgrimage'],
    why: 'Tawbah is sincere repentance: leaving the wrong, regretting it, and resolving not to return to it.',
    cite: 'Surah At-Tahrim 66:8' },

  { category: 'tazkiyah', difficulty: 'medium', q: 'What is "sabr"?',
    choices: ['Patience and steadfastness', 'Gratitude', 'Generosity', 'Courage in battle'],
    why: 'Sabr is patient perseverance, which the Quran repeatedly pairs with prayer as a source of help.',
    cite: 'Surah Al-Baqarah 2:153' },

  { category: 'tazkiyah', difficulty: 'medium', q: 'What is "shukr"?',
    choices: ['Gratitude to Allah', 'Patience in hardship', 'Fear of punishment', 'Hope for reward'],
    why: 'Shukr is thankfulness; the Quran promises increase to those who are grateful.',
    cite: 'Surah Ibrahim 14:7' },

  { category: 'tazkiyah', difficulty: 'hard', q: 'What is "ihsan", as defined in the hadith of Jibril?',
    choices: ['To worship Allah as though you see Him, knowing that He sees you', 'To give charity in secret', 'To fast every other day', 'To memorise the whole Quran'],
    why: 'The Prophet ﷺ defined ihsan as worshipping Allah as though you see Him, for though you do not see Him, He sees you.',
    cite: 'Sahih Muslim 8' },

  { category: 'tazkiyah', difficulty: 'hard', q: 'What is "tawakkul"?',
    choices: ['Reliance on Allah while still taking the means', 'Abandoning all effort', 'Giving away all wealth', 'Withdrawing from society'],
    why: 'Tawakkul is trust in Allah combined with taking appropriate action — the Prophet ﷺ told a man to tie his camel and then trust.',
    cite: 'Sunan at-Tirmidhi 2517' },

  // ==================== dua_dhikr ====================
  { category: 'dua_dhikr', difficulty: 'easy', q: 'What does "Alhamdulillah" mean?',
    choices: ['All praise is for Allah', 'Allah is the Greatest', 'There is no god but Allah', 'Glory be to Allah'],
    why: '"Alhamdulillah" means all praise belongs to Allah.',
    cite: 'Surah Al-Fatihah 1:2' },

  { category: 'dua_dhikr', difficulty: 'easy', q: 'What does "Allahu akbar" mean?',
    choices: ['Allah is the Greatest', 'All praise is for Allah', 'Glory be to Allah', 'In the name of Allah'],
    why: '"Allahu akbar", the takbir, means Allah is the Greatest, and opens every unit of the prayer.',
    cite: 'Standard usage in the prayer' },

  { category: 'dua_dhikr', difficulty: 'easy', q: 'What does "SubhanAllah" mean?',
    choices: ['Glory be to Allah', 'All praise is for Allah', 'Allah is the Greatest', 'I seek forgiveness from Allah'],
    why: '"SubhanAllah" declares Allah free of any imperfection.',
    cite: 'Surah Al-Isra 17:44' },

  { category: 'dua_dhikr', difficulty: 'medium', q: 'What does "istighfar" refer to?',
    choices: ['Seeking Allah’s forgiveness', 'Praising Allah', 'Asking for provision', 'Sending blessings on the Prophet ﷺ'],
    why: 'Istighfar is asking Allah for forgiveness, typically with the words "Astaghfirullah".',
    cite: 'Surah Nuh 71:10' },

  { category: 'dua_dhikr', difficulty: 'medium', q: 'What is "dhikr"?',
    choices: ['The remembrance of Allah', 'The recitation of poetry', 'The call to prayer', 'The Friday sermon'],
    why: 'Dhikr is remembrance of Allah, which the Quran says brings tranquillity to hearts.',
    cite: 'Surah Ar-Rad 13:28' },

  { category: 'dua_dhikr', difficulty: 'medium', q: 'Which phrase is said when mentioning something that will happen in the future?',
    choices: ['In sha Allah', 'Ma sha Allah', 'Jazak Allahu khayran', 'Barak Allahu fik'],
    why: 'The Quran instructs saying "in sha Allah" — if Allah wills — when speaking of doing something tomorrow.',
    cite: 'Surah Al-Kahf 18:23-24' },

  { category: 'dua_dhikr', difficulty: 'hard', q: 'What is said upon hearing news of a death or a calamity?',
    choices: ['Inna lillahi wa inna ilayhi rajiun', 'Alhamdulillah ala kulli hal', 'La hawla wa la quwwata illa billah', 'Astaghfirullah al-Azim'],
    why: 'The Quran teaches this response for those struck by affliction: indeed we belong to Allah and to Him we return.',
    cite: 'Surah Al-Baqarah 2:156' },

  { category: 'dua_dhikr', difficulty: 'hard', q: 'Which two short surahs are known as "al-Muawwidhatayn", recited for seeking refuge?',
    choices: ['Al-Falaq and An-Nas', 'Al-Ikhlas and Al-Kawthar', 'Al-Asr and Al-Humazah', 'Ad-Duha and Ash-Sharh'],
    why: 'Al-Falaq and An-Nas, the last two surahs, are together called al-Muawwidhatayn, the two of seeking refuge.',
    cite: 'Sahih al-Bukhari 5017' },
];
