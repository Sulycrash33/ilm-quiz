import type { SeedQuestion } from './types';

/**
 * Top-up questions.
 *
 * A full hunt is ten questions (HUNT_RULES.runLength), and `buildLadder` caps
 * the run at the size of the category pool — so a category with six questions
 * can only ever offer a six-stage run, and replaying it repeats everything.
 * These entries bring every category to at least ten so each one can fill a
 * complete run.
 */
export const TOPUP_QUESTIONS: SeedQuestion[] = [
  // ---------------- fiqh ----------------
  { category: 'fiqh', difficulty: 'medium', q: 'What does the term "haram" mean?',
    choices: ['Forbidden', 'Permitted', 'Recommended', 'Obligatory'],
    why: 'Haram denotes what is prohibited; its opposite, halal, is what is permitted.',
    cite: 'Standard fiqh terminology', madhab: 'agreed' },

  // ---------------- islamic_history ----------------
  { category: 'islamic_history', difficulty: 'medium', q: 'Who was the second of the Rightly Guided caliphs?',
    choices: ['Umar ibn al-Khattab', 'Uthman ibn Affan', 'Ali ibn Abi Talib', 'Muawiyah ibn Abi Sufyan'],
    why: 'Umar ibn al-Khattab succeeded Abu Bakr as the second caliph.',
    cite: 'Standard historical accounts of the Rashidun' },

  // ---------------- ethics ----------------
  { category: 'ethics', difficulty: 'easy', q: 'What does the Quran command regarding fulfilling promises and contracts?',
    choices: ['That they must be fulfilled', 'That they may be broken if inconvenient', 'That only written ones bind', 'That they expire after a year'],
    why: 'The Quran opens Surah Al-Maidah by commanding believers to fulfil their contracts.',
    cite: 'Surah Al-Maidah 5:1' },

  { category: 'ethics', difficulty: 'hard', q: 'According to a hadith, what did the Prophet ﷺ identify as signs of a hypocrite?',
    choices: ['Lying when speaking, breaking a promise, and betraying a trust', 'Sleeping through Fajr', 'Travelling frequently', 'Eating alone'],
    why: 'The Prophet ﷺ named three signs: speaking falsely, breaking promises, and betraying what is entrusted.',
    cite: 'Sahih al-Bukhari 33' },

  // ---------------- arabic_language ----------------
  { category: 'arabic_language', difficulty: 'easy', q: 'What does the greeting "As-salamu alaykum" mean?',
    choices: ['Peace be upon you', 'Welcome to my home', 'Thank you very much', 'May you be forgiven'],
    why: 'It is a greeting of peace, answered with "wa alaykum as-salam".',
    cite: 'Surah An-Nur 24:61' },

  { category: 'arabic_language', difficulty: 'hard', q: 'What are the three grammatical cases of the Arabic noun?',
    choices: ['Raf, nasb and jarr', 'Past, present and future', 'Masculine, feminine and neuter', 'Singular, dual and plural'],
    why: 'Arabic nouns take three cases: raf (nominative), nasb (accusative) and jarr (genitive).',
    cite: 'Standard Arabic grammar' },

  // ---------------- five_pillars ----------------
  { category: 'five_pillars', difficulty: 'medium', q: 'What does the word "Islam" itself mean?',
    choices: ['Submission to Allah', 'Struggle', 'Community', 'Guidance'],
    why: 'Islam means submission or surrender to Allah, from the same root as salam, peace.',
    cite: 'Standard Arabic and theological usage' },

  { category: 'five_pillars', difficulty: 'medium', q: 'What is the Arabic term for fasting, the fourth pillar?',
    choices: ['Sawm', 'Salah', 'Zakat', 'Hajj'],
    why: 'Sawm is fasting, obligatory during the month of Ramadan.',
    cite: 'Surah Al-Baqarah 2:183', madhab: 'agreed' },

  { category: 'five_pillars', difficulty: 'hard', q: 'What are the two testimonies contained in the Shahada?',
    choices: ['That there is no god but Allah, and that Muhammad is His Messenger', 'That Allah is one, and that the Quran is true', 'That prayer is obligatory, and that charity is due', 'That the angels exist, and that judgement will come'],
    why: 'The Shahada affirms the oneness of Allah and the messengership of Muhammad ﷺ.',
    cite: 'Sahih Muslim 16', madhab: 'agreed' },

  // ---------------- contemporary_issues ----------------
  { category: 'contemporary_issues', difficulty: 'easy', q: 'What does the Quran instruct regarding the environment and causing corruption in the land?',
    choices: ['That corruption on the earth is forbidden', 'That the land has no protection', 'That only farmland is protected', 'That it applies only to rulers'],
    why: 'The Quran repeatedly forbids spreading corruption in the land after it has been set right.',
    cite: 'Surah Al-Araf 7:56' },

  { category: 'contemporary_issues', difficulty: 'medium', q: 'What is "takaful" in contemporary Islamic finance?',
    choices: ['A cooperative model of mutual risk-sharing used as an alternative to conventional insurance', 'A form of interest-bearing loan', 'A tax on trade', 'An investment in commodities only'],
    why: 'Takaful is built on mutual contribution and shared responsibility rather than the transfer of risk for a premium.',
    cite: 'Standard contemporary Islamic finance usage' },

  { category: 'contemporary_issues', difficulty: 'medium', q: 'What does the Quran say about the treatment of orphans’ property?',
    choices: ['That it must not be consumed unjustly', 'That it belongs to the guardian', 'That it may be used freely', 'That it must be given away'],
    why: 'The Quran warns severely against consuming the property of orphans wrongfully.',
    cite: 'Surah An-Nisa 4:10' },

  { category: 'contemporary_issues', difficulty: 'hard', q: 'What does the Quran say about standing witness, even against oneself or close relatives?',
    choices: ['That believers must stand firmly for justice as witnesses to Allah', 'That family may never be testified against', 'That witnessing is optional', 'That only two men may witness'],
    why: 'The Quran commands standing firmly for justice, even if the testimony is against oneself, parents or relatives.',
    cite: 'Surah An-Nisa 4:135' },

  // ---------------- ramadan_fasting ----------------
  { category: 'ramadan_fasting', difficulty: 'easy', q: 'What is the meal taken to break the fast at sunset called?',
    choices: ['Iftar', 'Suhur', 'Tarawih', 'Sahur'],
    why: 'Iftar is the meal that breaks the fast once Maghrib enters.',
    cite: 'Sahih al-Bukhari 1957', madhab: 'agreed' },

  // ---------------- hajj_umrah ----------------
  { category: 'hajj_umrah', difficulty: 'easy', q: 'What is the cube-shaped structure at the centre of Masjid al-Haram called?',
    choices: ['The Kabah', 'The Maqam', 'The Hijr', 'The Mizab'],
    why: 'The Kabah is the House toward which Muslims face in prayer.',
    cite: 'Surah Al-Baqarah 2:125' },

  // ---------------- zakat_charity ----------------
  { category: 'zakat_charity', difficulty: 'easy', q: 'Is zakat obligatory or voluntary?',
    choices: ['Obligatory on qualifying wealth', 'Entirely voluntary', 'Obligatory only in Ramadan', 'Obligatory only on traders'],
    why: 'Zakat is one of the five pillars and is obligatory on wealth meeting the threshold and conditions.',
    cite: 'Surah Al-Baqarah 2:110', madhab: 'agreed' },

  { category: 'zakat_charity', difficulty: 'easy', q: 'Which pillar of Islam is zakat?',
    choices: ['The third', 'The first', 'The fourth', 'The fifth'],
    why: 'In the well-known ordering, zakat is the third pillar, after the Shahada and prayer.',
    cite: 'Sahih al-Bukhari 8; Sahih Muslim 16', madhab: 'agreed' },

  { category: 'zakat_charity', difficulty: 'medium', q: 'What does the Quran say about giving charity openly versus secretly?',
    choices: ['That giving secretly to the poor is better for the giver', 'That charity must always be public', 'That secret charity is not accepted', 'That the manner makes no difference'],
    why: 'The Quran states that concealing charity and giving it to the poor is better for the one who gives.',
    cite: 'Surah Al-Baqarah 2:271' },

  { category: 'zakat_charity', difficulty: 'hard', q: 'What does the Quran warn against doing after giving charity?',
    choices: ['Nullifying it with reminders of generosity and injury', 'Recording the amount', 'Giving again to the same person', 'Giving in public'],
    why: 'The Quran warns believers not to invalidate their charity by reproach and injury.',
    cite: 'Surah Al-Baqarah 2:264' },

  // ---------------- dua_dhikr ----------------
  { category: 'dua_dhikr', difficulty: 'medium', q: 'What does the Quran say when describing Allah’s response to those who call upon Him?',
    choices: ['That He is near and answers the call of the caller', 'That He answers only in Ramadan', 'That He answers only prophets', 'That supplication has no effect'],
    why: 'The Quran states that Allah is near, responding to the supplication of the one who calls upon Him.',
    cite: 'Surah Al-Baqarah 2:186' },

  { category: 'dua_dhikr', difficulty: 'hard', q: 'What phrase means "there is no power nor strength except with Allah"?',
    choices: ['La hawla wa la quwwata illa billah', 'Subhan Allah wa bihamdih', 'Hasbuna Allah wa nima al-wakil', 'La ilaha illa Allah'],
    why: 'This phrase, known as the hawqalah, expresses reliance on Allah in the face of difficulty.',
    cite: 'Sahih al-Bukhari 6384' },

  // ---------------- angels_unseen ----------------
  { category: 'angels_unseen', difficulty: 'medium', q: 'Belief in angels is which article of faith?',
    choices: ['One of the six articles of faith', 'Not an article of faith', 'One of the five pillars', 'A recommended belief only'],
    why: 'Belief in the angels is among the six articles of faith listed in the hadith of Jibril.',
    cite: 'Sahih Muslim 8' },

  { category: 'angels_unseen', difficulty: 'hard', q: 'What does the Quran say about whether angels disobey Allah?',
    choices: ['That they do not disobey what He commands them', 'That they sometimes err', 'That they have free will like humans', 'That they were created from clay'],
    why: 'The Quran describes the angels as not disobeying Allah in what He commands them, doing as they are ordered.',
    cite: 'Surah At-Tahrim 66:6' },

  // ---------------- tazkiyah ----------------
  { category: 'tazkiyah', difficulty: 'easy', q: 'What is "haya" often translated as?',
    choices: ['Modesty and a sense of shame that restrains from wrong', 'Anger', 'Ambition', 'Curiosity'],
    why: 'The Prophet ﷺ described haya as a branch of faith.',
    cite: 'Sahih al-Bukhari 9' },

  { category: 'tazkiyah', difficulty: 'hard', q: 'According to a hadith, what is the piece of flesh that, if sound, makes the whole body sound?',
    choices: ['The heart', 'The tongue', 'The hand', 'The eye'],
    why: 'The Prophet ﷺ said there is a piece of flesh in the body which, if sound, makes the whole body sound — and it is the heart.',
    cite: 'Sahih al-Bukhari 52' },

  // ---------------- family_life ----------------
  { category: 'family_life', difficulty: 'easy', q: 'What does the Quran describe as placed between spouses?',
    choices: ['Affection and mercy', 'Competition', 'Obligation only', 'Silence'],
    why: 'The Quran describes spouses as a source of tranquillity, with affection and mercy placed between them.',
    cite: 'Surah Ar-Rum 30:21' },

  { category: 'family_life', difficulty: 'medium', q: 'What does the Quran command regarding orphans in one’s care?',
    choices: ['That they be treated with kindness and not oppressed', 'That they be sent away', 'That their property be shared out', 'That they not be spoken to'],
    why: 'The Quran instructs that the orphan not be treated harshly, alongside the command to kindness.',
    cite: 'Surah Ad-Duha 93:9' },

  { category: 'family_life', difficulty: 'medium', q: 'How many times did the Prophet ﷺ mention the mother before the father when asked about good companionship?',
    choices: ['Three times', 'Once', 'Twice', 'Five times'],
    why: 'In the well-known narration he answered "your mother" three times before saying "then your father".',
    cite: 'Sahih al-Bukhari 5971' },

  { category: 'family_life', difficulty: 'hard', q: 'What does a hadith say about a person who severs family ties?',
    choices: ['That such a person will not enter Paradise', 'That they must fast a month', 'That they lose their inheritance', 'That they must move away'],
    why: 'The Prophet ﷺ stated that the one who severs ties of kinship will not enter Paradise.',
    cite: 'Sahih al-Bukhari 5984' },

  // ---------------- sacred_places ----------------
  { category: 'sacred_places', difficulty: 'easy', q: 'What is the sacred mosque surrounding the Kabah called?',
    choices: ['Masjid al-Haram', 'Masjid an-Nabawi', 'Masjid al-Aqsa', 'Masjid Quba'],
    why: 'Masjid al-Haram in Makkah encloses the Kabah.',
    cite: 'Surah Al-Isra 17:1' },

  { category: 'sacred_places', difficulty: 'medium', q: 'Which mosque does the Quran describe as founded on piety from the first day?',
    choices: ['Masjid Quba', 'Masjid al-Aqsa', 'Masjid an-Nabawi', 'Masjid al-Haram'],
    why: 'The Quran refers to a mosque founded on righteousness from its first day, understood as Masjid Quba.',
    cite: 'Surah At-Tawbah 9:108' },

  { category: 'sacred_places', difficulty: 'medium', q: 'Where is the plain of Arafat, where pilgrims stand during Hajj?',
    choices: ['Outside Makkah', 'Outside Madinah', 'Near Jerusalem', 'Near Taif'],
    why: 'Arafat lies to the east of Makkah, and standing there is the essential rite of Hajj.',
    cite: 'Surah Al-Baqarah 2:198' },

  { category: 'sacred_places', difficulty: 'hard', q: 'What is the "Maqam Ibrahim" near the Kabah?',
    choices: ['The station associated with Ibrahim, marked near the Kabah', 'The door of the Kabah', 'The roof of the mosque', 'The well of Zamzam'],
    why: 'The Quran instructs taking the station of Ibrahim as a place of prayer.',
    cite: 'Surah Al-Baqarah 2:125' },

  // ---------------- islamic_calendar ----------------
  { category: 'islamic_calendar', difficulty: 'easy', q: 'Which month directly follows Ramadan?',
    choices: ['Shawwal', 'Muharram', 'Rajab', 'Shaban'],
    why: 'Shawwal follows Ramadan, and its first day is Eid al-Fitr.',
    cite: 'Standard Islamic calendar' },

  { category: 'islamic_calendar', difficulty: 'easy', q: 'Which month directly precedes Ramadan?',
    choices: ['Shaban', 'Shawwal', 'Rajab', 'Jumada al-Akhirah'],
    why: 'Shaban is the eighth month, immediately before Ramadan.',
    cite: 'Standard Islamic calendar' },

  { category: 'islamic_calendar', difficulty: 'medium', q: 'Roughly how many days shorter is the lunar year than the solar year?',
    choices: ['About eleven days', 'About one day', 'About thirty days', 'About sixty days'],
    why: 'The lunar year runs about 354 days, roughly eleven days shorter, so Islamic months shift through the seasons.',
    cite: 'Standard lunar calendar reckoning' },

  { category: 'islamic_calendar', difficulty: 'hard', q: 'In which month does the Hajj take place?',
    choices: ['Dhul-Hijjah', 'Dhul-Qadah', 'Muharram', 'Safar'],
    why: 'Dhul-Hijjah, the twelfth month, is the month of the pilgrimage, from which it takes its name.',
    cite: 'Surah Al-Baqarah 2:197' },

  // ---------------- muslim_scholars ----------------
  { category: 'muslim_scholars', difficulty: 'easy', q: 'After whom is the Hanafi school of jurisprudence named?',
    choices: ['Abu Hanifah', 'Malik ibn Anas', 'Ash-Shafii', 'Ahmad ibn Hanbal'],
    why: 'The Hanafi school takes its name from Abu Hanifah an-Numan of Kufa.',
    cite: 'Standard accounts of the madhabs' },

  // ---------------- islam_world ----------------
  { category: 'islam_world', difficulty: 'easy', q: 'In which country are the cities of Makkah and Madinah located?',
    choices: ['Saudi Arabia', 'Jordan', 'Yemen', 'Egypt'],
    why: 'Both cities are in present-day Saudi Arabia, in the Hijaz region.',
    cite: 'Standard geography' },

  { category: 'islam_world', difficulty: 'medium', q: 'Which North African university-mosque in Cairo has been a centre of Islamic learning for over a thousand years?',
    choices: ['Al-Azhar', 'Al-Qarawiyyin', 'Az-Zaytuna', 'Al-Mustansiriyya'],
    why: 'Al-Azhar in Cairo, founded in the tenth century, remains a leading centre of Islamic scholarship.',
    cite: 'Standard historical accounts of Cairo' },

  { category: 'islam_world', difficulty: 'medium', q: 'Which Tunisian mosque-university is among the oldest centres of learning in the Muslim world?',
    choices: ['Az-Zaytuna', 'Al-Azhar', 'Al-Qarawiyyin', 'Deoband'],
    why: 'Az-Zaytuna in Tunis has been a centre of teaching for well over a millennium.',
    cite: 'Standard historical accounts of Tunis' },

  { category: 'islam_world', difficulty: 'hard', q: 'Through which routes did Islam primarily spread to South East Asia?',
    choices: ['Maritime trade routes', 'Large-scale military conquest', 'Forced migration', 'Colonial administration'],
    why: 'Islam reached the Malay archipelago largely through merchants and scholars travelling the Indian Ocean trade networks.',
    cite: 'Standard historical accounts of Islam in South East Asia' },

  { category: 'islam_world', difficulty: 'hard', q: 'What is the Arabic term for the global Muslim community?',
    choices: ['The Ummah', 'The Madhab', 'The Khilafah', 'The Millah'],
    why: 'The Ummah refers to the worldwide community of believers.',
    cite: 'Surah Al-Anbiya 21:92' },
];
