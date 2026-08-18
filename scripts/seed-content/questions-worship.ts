import type { SeedQuestion } from './types';

/**
 * Worship and practice: the pillars, prayer, fasting, pilgrimage, giving, fiqh.
 *
 * Fiqh entries are restricted to rulings agreed across the four Sunni schools
 * and tagged 'agreed'. Where schools genuinely differ, the question either says
 * which school it is asking about or is left out entirely — presenting one
 * school's position as universal is exactly what draft-questions.ts forbids.
 */
export const WORSHIP_QUESTIONS: SeedQuestion[] = [
  // ================== five_pillars ==================
  { category: 'five_pillars', difficulty: 'easy', q: 'How many pillars of Islam are there?',
    choices: ['Five', 'Three', 'Six', 'Seven'],
    why: 'Islam is built on five pillars: the testimony of faith, prayer, zakat, fasting Ramadan, and Hajj for those able.',
    cite: 'Sahih al-Bukhari 8; Sahih Muslim 16', madhab: 'agreed' },

  { category: 'five_pillars', difficulty: 'easy', q: 'What is the first pillar of Islam?',
    choices: ['The declaration of faith', 'Prayer', 'Fasting', 'Pilgrimage'],
    why: 'The Shahada — testifying that there is no god but Allah and that Muhammad is His Messenger — is the first pillar.',
    cite: 'Sahih al-Bukhari 8; Sahih Muslim 16', madhab: 'agreed' },

  { category: 'five_pillars', difficulty: 'easy', q: 'How many obligatory prayers does a Muslim perform each day?',
    choices: ['Five', 'Three', 'Seven', 'Two'],
    why: 'There are five daily obligatory prayers: Fajr, Dhuhr, Asr, Maghrib and Isha.',
    cite: 'Sahih al-Bukhari 349', madhab: 'agreed' },

  { category: 'five_pillars', difficulty: 'easy', q: 'In which month of the Islamic calendar do Muslims fast?',
    choices: ['Ramadan', 'Shawwal', 'Muharram', 'Rajab'],
    why: 'Fasting is obligatory during Ramadan, the ninth month of the Islamic calendar.',
    cite: 'Surah Al-Baqarah 2:185', madhab: 'agreed' },

  { category: 'five_pillars', difficulty: 'medium', q: 'What is the Arabic term for the obligatory annual charity?',
    choices: ['Zakat', 'Sadaqah', 'Waqf', 'Hibah'],
    why: 'Zakat is the obligatory annual due on qualifying wealth; sadaqah is voluntary giving.',
    cite: 'Surah At-Tawbah 9:60', madhab: 'agreed' },

  { category: 'five_pillars', difficulty: 'medium', q: 'Which pillar is obligatory only once in a lifetime, and only for those who are able?',
    choices: ['Hajj', 'Salah', 'Zakat', 'Sawm'],
    why: 'Hajj is obligatory once in a lifetime upon those with the physical and financial means to perform it.',
    cite: 'Surah Al-Imran 3:97', madhab: 'agreed' },

  { category: 'five_pillars', difficulty: 'hard', q: 'How many articles of faith are listed in the hadith of Jibril?',
    choices: ['Six', 'Five', 'Three', 'Seven'],
    why: 'Belief in Allah, His angels, His books, His messengers, the Last Day, and divine decree.',
    cite: 'Sahih Muslim 8' },

  // ===================== salah =====================
  { category: 'salah', difficulty: 'easy', q: 'Which prayer is performed just before sunrise?',
    choices: ['Fajr', 'Maghrib', 'Isha', 'Asr'],
    why: 'Fajr is prayed in the period between the true dawn and sunrise.',
    cite: 'Sahih Muslim 612', madhab: 'agreed' },

  { category: 'salah', difficulty: 'easy', q: 'Which prayer is performed immediately after sunset?',
    choices: ['Maghrib', 'Isha', 'Asr', 'Fajr'],
    why: 'Maghrib begins once the sun has set.',
    cite: 'Sahih Muslim 612', madhab: 'agreed' },

  { category: 'salah', difficulty: 'easy', q: 'What is the call to prayer called?',
    choices: ['The adhan', 'The khutbah', 'The talbiyah', 'The takbir'],
    why: 'The adhan is the call announcing that the time for a prayer has entered.',
    cite: 'Sahih al-Bukhari 604', madhab: 'agreed' },

  { category: 'salah', difficulty: 'easy', q: 'In which direction do Muslims face during prayer?',
    choices: ['Toward the Kabah in Makkah', 'Toward Jerusalem', 'Toward the rising sun', 'Toward Madinah'],
    why: 'The qiblah is the Kabah in Makkah; the Quran records the change of direction toward it.',
    cite: 'Surah Al-Baqarah 2:144', madhab: 'agreed' },

  { category: 'salah', difficulty: 'medium', q: 'How many obligatory rakah does the Maghrib prayer have?',
    choices: ['Three', 'Two', 'Four', 'One'],
    why: 'Maghrib consists of three obligatory rakah, the only one of the five with an odd number.',
    cite: 'Sahih al-Bukhari 1090', madhab: 'agreed' },

  { category: 'salah', difficulty: 'medium', q: 'How many obligatory rakah does the Fajr prayer have?',
    choices: ['Two', 'Three', 'Four', 'One'],
    why: 'Fajr consists of two obligatory rakah.',
    cite: 'Sahih al-Bukhari 1099', madhab: 'agreed' },

  { category: 'salah', difficulty: 'medium', q: 'What is the ritual washing performed before prayer called?',
    choices: ['Wudu', 'Ghusl', 'Tayammum', 'Istinja'],
    why: 'Wudu is the ablution required before prayer; ghusl is the full bath, and tayammum the dry substitute.',
    cite: 'Surah Al-Maidah 5:6', madhab: 'agreed' },

  { category: 'salah', difficulty: 'medium', q: 'What may a person use for purification when no water is available?',
    choices: ['Clean earth, by performing tayammum', 'Nothing; the prayer is delayed', 'Sand only, and only when travelling', 'Any liquid at hand'],
    why: 'The Quran permits tayammum with clean earth when water cannot be found or used.',
    cite: 'Surah Al-Maidah 5:6', madhab: 'agreed' },

  { category: 'salah', difficulty: 'medium', q: 'Which surah must be recited in every unit of the obligatory prayer?',
    choices: ['Al-Fatihah', 'Al-Ikhlas', 'An-Nas', 'Al-Asr'],
    why: 'The Prophet ﷺ said there is no prayer for one who does not recite the Opening of the Book.',
    cite: 'Sahih al-Bukhari 756', madhab: 'agreed' },

  { category: 'salah', difficulty: 'hard', q: 'What is the position of prostration in prayer called?',
    choices: ['Sujud', 'Ruku', 'Qiyam', 'Julus'],
    why: 'Sujud is prostration; ruku is bowing, qiyam standing, and julus sitting.',
    cite: 'Standard terminology of the prayer', madhab: 'agreed' },

  { category: 'salah', difficulty: 'hard', q: 'What is the Friday congregational prayer called?',
    choices: ['Jumuah', 'Tarawih', 'Witr', 'Eid'],
    why: 'Salat al-Jumuah is the Friday congregational prayer, preceded by a sermon.',
    cite: 'Surah Al-Jumuah 62:9', madhab: 'agreed' },

  { category: 'salah', difficulty: 'hard', q: 'What concession is granted to a traveller regarding the four-rakah prayers?',
    choices: ['They may be shortened to two rakah', 'They may be skipped entirely', 'They must be doubled', 'They may be prayed silently only'],
    why: 'Shortening the four-rakah prayers while travelling is established in the Quran and the practice of the Prophet ﷺ.',
    cite: 'Surah An-Nisa 4:101', madhab: 'agreed' },

  // ================= ramadan_fasting =================
  { category: 'ramadan_fasting', difficulty: 'easy', q: 'What is the pre-dawn meal before a fast called?',
    choices: ['Suhur', 'Iftar', 'Tarawih', 'Itikaf'],
    why: 'Suhur is the meal taken before dawn; iftar is the meal breaking the fast at sunset.',
    cite: 'Sahih al-Bukhari 1923', madhab: 'agreed' },

  { category: 'ramadan_fasting', difficulty: 'easy', q: 'At what time does a fasting person break the fast?',
    choices: ['At sunset', 'At midnight', 'At sunrise', 'At noon'],
    why: 'The fast is completed at sunset, when Maghrib enters.',
    cite: 'Surah Al-Baqarah 2:187', madhab: 'agreed' },

  { category: 'ramadan_fasting', difficulty: 'easy', q: 'Which festival marks the end of Ramadan?',
    choices: ['Eid al-Fitr', 'Eid al-Adha', 'Ashura', 'Mawlid'],
    why: 'Eid al-Fitr is celebrated on the first day of Shawwal, following the month of fasting.',
    cite: 'Sahih al-Bukhari 952', madhab: 'agreed' },

  { category: 'ramadan_fasting', difficulty: 'medium', q: 'In which part of Ramadan is Laylat al-Qadr sought?',
    choices: ['The last ten nights', 'The first ten nights', 'The middle ten nights', 'The first night only'],
    why: 'The Prophet ﷺ urged seeking the Night of Decree in the last ten nights, particularly the odd-numbered ones.',
    cite: 'Sahih al-Bukhari 2017', madhab: 'agreed' },

  { category: 'ramadan_fasting', difficulty: 'medium', q: 'Which surah describes the Night of Decree as better than a thousand months?',
    choices: ['Al-Qadr', 'Ad-Duha', 'Al-Asr', 'Al-Falaq'],
    why: 'Surah Al-Qadr states that the Night of Decree is better than a thousand months.',
    cite: 'Surah Al-Qadr 97:3' },

  { category: 'ramadan_fasting', difficulty: 'medium', q: 'Who is excused from fasting Ramadan according to the Quran?',
    choices: ['The sick and the traveller, who make up the days later', 'Only children', 'Only the elderly', 'Nobody is excused'],
    why: 'The Quran excuses the ill and the traveller, requiring them to make up an equal number of days afterwards.',
    cite: 'Surah Al-Baqarah 2:184-185', madhab: 'agreed' },

  { category: 'ramadan_fasting', difficulty: 'medium', q: 'What is the night prayer performed in congregation during Ramadan commonly called?',
    choices: ['Tarawih', 'Tahajjud', 'Witr', 'Duha'],
    why: 'Tarawih is the extended voluntary night prayer widely performed in congregation during Ramadan.',
    cite: 'Sahih al-Bukhari 2010' },

  { category: 'ramadan_fasting', difficulty: 'hard', q: 'What is "itikaf"?',
    choices: ['Secluding oneself in the mosque for worship', 'Fasting on alternate days', 'Reciting the whole Quran in a night', 'Giving charity in secret'],
    why: 'Itikaf is a period of retreat in the mosque devoted to worship, commonly observed in the last ten days of Ramadan.',
    cite: 'Sahih al-Bukhari 2026' },

  { category: 'ramadan_fasting', difficulty: 'hard', q: 'What is the charity that must be given before the Eid al-Fitr prayer called?',
    choices: ['Zakat al-Fitr', 'Zakat al-Mal', 'Kaffarah', 'Fidyah'],
    why: 'Zakat al-Fitr is given on behalf of each member of the household before the Eid prayer.',
    cite: 'Sahih al-Bukhari 1503', madhab: 'agreed' },

  // ================== hajj_umrah ==================
  { category: 'hajj_umrah', difficulty: 'easy', q: 'During which month is the Hajj pilgrimage performed?',
    choices: ['Dhul-Hijjah', 'Ramadan', 'Muharram', 'Shaban'],
    why: 'Hajj is performed in Dhul-Hijjah, the twelfth month of the Islamic calendar.',
    cite: 'Surah Al-Baqarah 2:197', madhab: 'agreed' },

  { category: 'hajj_umrah', difficulty: 'easy', q: 'What is the state of ritual consecration a pilgrim enters called?',
    choices: ['Ihram', 'Tawaf', 'Sai', 'Wuquf'],
    why: 'Ihram is the sanctified state, marked by specific garments and restrictions, entered before performing the rites.',
    cite: 'Surah Al-Baqarah 2:197', madhab: 'agreed' },

  { category: 'hajj_umrah', difficulty: 'medium', q: 'How many circuits make up the tawaf around the Kabah?',
    choices: ['Seven', 'Three', 'Five', 'Ten'],
    why: 'Tawaf consists of seven circuits of the Kabah, beginning and ending at the Black Stone.',
    cite: 'Sahih Muslim 1218', madhab: 'agreed' },

  { category: 'hajj_umrah', difficulty: 'medium', q: 'Between which two places do pilgrims perform the sai?',
    choices: ['Safa and Marwah', 'Mina and Arafat', 'Muzdalifah and Mina', 'Hira and Thawr'],
    why: 'The sai is walking seven times between the hills of Safa and Marwah, commemorating Hajar’s search for water.',
    cite: 'Surah Al-Baqarah 2:158', madhab: 'agreed' },

  { category: 'hajj_umrah', difficulty: 'medium', q: 'Standing at which plain is the essential rite without which the Hajj is not valid?',
    choices: ['Arafat', 'Mina', 'Muzdalifah', 'Safa'],
    why: 'The Prophet ﷺ said that Hajj is Arafah; standing there on the ninth of Dhul-Hijjah is its indispensable pillar.',
    cite: 'Sunan an-Nasai 3016', madhab: 'agreed' },

  { category: 'hajj_umrah', difficulty: 'medium', q: 'Which well near the Kabah is associated with Hajar and the infant Ismail?',
    choices: ['Zamzam', 'Badr', 'Hudaybiyyah', 'Tuwa'],
    why: 'The well of Zamzam is traditionally associated with the water found for Hajar and her son Ismail.',
    cite: 'Sahih al-Bukhari 3364' },

  { category: 'hajj_umrah', difficulty: 'hard', q: 'What is the chant repeated by pilgrims, beginning "Labbayk Allahumma labbayk"?',
    choices: ['The talbiyah', 'The adhan', 'The takbir', 'The tahlil'],
    why: 'The talbiyah is the pilgrim’s response of answering the call, recited on entering ihram and throughout the rites.',
    cite: 'Sahih al-Bukhari 1549', madhab: 'agreed' },

  { category: 'hajj_umrah', difficulty: 'hard', q: 'How does Umrah differ from Hajj?',
    choices: ['It can be performed at any time of year and omits the standing at Arafat', 'It is obligatory every year', 'It requires no ihram', 'It is performed only in Ramadan'],
    why: 'Umrah may be performed at any time and consists of ihram, tawaf and sai, without the Arafat and Mina rites of Hajj.',
    cite: 'Standard fiqh of the pilgrimage', madhab: 'agreed' },

  { category: 'hajj_umrah', difficulty: 'hard', q: 'Which prophet is associated in the Quran with raising the foundations of the Kabah?',
    choices: ['Ibrahim, with his son Ismail', 'Nuh', 'Musa', 'Dawud'],
    why: 'The Quran describes Ibrahim and Ismail raising the foundations of the House.',
    cite: 'Surah Al-Baqarah 2:127' },

  // ================= zakat_charity =================
  { category: 'zakat_charity', difficulty: 'easy', q: 'What is "sadaqah"?',
    choices: ['Voluntary charity', 'The obligatory annual zakat', 'The fast of Ramadan', 'The pilgrimage'],
    why: 'Sadaqah is voluntary giving, distinct from zakat, which is an obligatory annual due.',
    cite: 'Surah Al-Baqarah 2:271' },

  { category: 'zakat_charity', difficulty: 'medium', q: 'What is the standard rate of zakat on accumulated monetary wealth held for a lunar year?',
    choices: ['2.5%', '5%', '10%', '1%'],
    why: 'Zakat on cash, gold and silver held above the nisab for a full lunar year is one fortieth, that is 2.5%.',
    cite: 'Sunan Abi Dawud 1572', madhab: 'agreed' },

  { category: 'zakat_charity', difficulty: 'medium', q: 'What is the term for the minimum threshold of wealth at which zakat becomes due?',
    choices: ['Nisab', 'Hawl', 'Khums', 'Ushr'],
    why: 'The nisab is the threshold; the hawl is the lunar year that must pass over the wealth.',
    cite: 'Standard fiqh of zakat', madhab: 'agreed' },

  { category: 'zakat_charity', difficulty: 'medium', q: 'How many categories of recipients of zakat does the Quran name?',
    choices: ['Eight', 'Four', 'Six', 'Ten'],
    why: 'The Quran lists eight categories, including the poor, the needy, and those employed to collect it.',
    cite: 'Surah At-Tawbah 9:60', madhab: 'agreed' },

  { category: 'zakat_charity', difficulty: 'hard', q: 'What is a "waqf"?',
    choices: ['An endowment whose asset is held permanently and its benefit given in charity', 'A one-off cash donation', 'An interest-free loan', 'A charitable will'],
    why: 'A waqf is a perpetual endowment: the property itself is retained while its yield or use is devoted to charitable ends.',
    cite: 'Sahih al-Bukhari 2737' },

  { category: 'zakat_charity', difficulty: 'hard', q: 'According to a hadith, what is "sadaqah jariyah"?',
    choices: ['Ongoing charity whose reward continues after death', 'Charity given in secret', 'Charity given only in Ramadan', 'Charity given to relatives'],
    why: 'The Prophet ﷺ described ongoing charity, beneficial knowledge, and a righteous child praying for a person as deeds whose benefit continues after death.',
    cite: 'Sahih Muslim 1631' },

  // ====================== fiqh ======================
  { category: 'fiqh', difficulty: 'easy', q: 'What does the term "halal" mean?',
    choices: ['Permitted', 'Forbidden', 'Disliked', 'Obligatory'],
    why: 'Halal means permitted; its opposite, haram, means forbidden.',
    cite: 'Standard fiqh terminology', madhab: 'agreed' },

  { category: 'fiqh', difficulty: 'easy', q: 'How many major schools of Sunni jurisprudence are commonly recognised?',
    choices: ['Four', 'Two', 'Six', 'Nine'],
    why: 'The four widely followed Sunni schools are the Hanafi, Maliki, Shafii and Hanbali.',
    cite: 'Standard classification of the madhabs' },

  { category: 'fiqh', difficulty: 'medium', q: 'What is "fiqh"?',
    choices: ['The scholarly understanding of Islamic rulings derived from the sources', 'The text of the Quran', 'The biography of the Prophet ﷺ', 'The science of hadith grading'],
    why: 'Fiqh is the human scholarly effort to understand and derive practical rulings from the revealed sources.',
    cite: 'Standard fiqh terminology' },

  { category: 'fiqh', difficulty: 'medium', q: 'What are the two primary sources of Islamic law that all Sunni schools agree upon?',
    choices: ['The Quran and the Sunnah', 'Consensus and analogy', 'Custom and public interest', 'The rulings of the caliphs'],
    why: 'The Quran and the Sunnah are the two agreed primary sources; ijma and qiyas are widely accepted secondary ones.',
    cite: 'Standard usul al-fiqh', madhab: 'agreed' },

  { category: 'fiqh', difficulty: 'medium', q: 'What does "ijma" refer to in Islamic legal theory?',
    choices: ['The consensus of qualified scholars', 'Reasoning by analogy', 'Personal opinion', 'Local custom'],
    why: 'Ijma is scholarly consensus; qiyas is analogical reasoning from an established ruling to a new case.',
    cite: 'Standard usul al-fiqh' },

  { category: 'fiqh', difficulty: 'medium', q: 'What is "qiyas"?',
    choices: ['Reasoning by analogy from an established ruling to a new case', 'The consensus of scholars', 'A narration from the Prophet ﷺ', 'A verse containing a legal ruling'],
    why: 'Qiyas extends a known ruling to a new situation that shares its effective cause.',
    cite: 'Standard usul al-fiqh' },

  { category: 'fiqh', difficulty: 'hard', q: 'Which of the five rulings describes an act that is rewarded if done but not sinful if left?',
    choices: ['Mustahabb (recommended)', 'Wajib (obligatory)', 'Makruh (disliked)', 'Haram (forbidden)'],
    why: 'The five categories are obligatory, recommended, permissible, disliked and forbidden; the recommended is rewarded but not required.',
    cite: 'Standard usul al-fiqh', madhab: 'agreed' },

  { category: 'fiqh', difficulty: 'hard', q: 'After whom is the Maliki school named?',
    choices: ['Malik ibn Anas', 'Abu Hanifah', 'Muhammad ibn Idris ash-Shafii', 'Ahmad ibn Hanbal'],
    why: 'The Maliki school takes its name from Malik ibn Anas of Madinah, author of the Muwatta.',
    cite: 'Standard accounts of the madhabs' },

  { category: 'fiqh', difficulty: 'hard', q: 'Which scholar is credited with systematising the principles of jurisprudence in his Risalah?',
    choices: ['Muhammad ibn Idris ash-Shafii', 'Abu Hanifah', 'Malik ibn Anas', 'Al-Ghazali'],
    why: 'Ash-Shafii’s Risalah is regarded as the foundational systematic treatment of usul al-fiqh.',
    cite: 'Ash-Shafii, Ar-Risalah' },
];
