import type { SeedQuestion } from './types';

/** History, scholarship, language, ethics, family, places, calendar, world. */
export const CULTURE_QUESTIONS: SeedQuestion[] = [
  // ================= islamic_history =================
  { category: 'islamic_history', difficulty: 'easy', q: 'What event marks the start of the Islamic calendar?',
    choices: ['The Hijrah from Makkah to Madinah', 'The birth of the Prophet ﷺ', 'The first revelation', 'The conquest of Makkah'],
    why: 'The Hijri calendar counts from the year of the migration to Madinah.',
    cite: 'Established under the caliphate of Umar ibn al-Khattab' },

  { category: 'islamic_history', difficulty: 'easy', q: 'How many Rightly Guided caliphs were there?',
    choices: ['Four', 'Two', 'Six', 'Twelve'],
    why: 'Abu Bakr, Umar, Uthman and Ali are together known as the Rashidun caliphs.',
    cite: 'Standard historical accounts of the Rashidun' },

  { category: 'islamic_history', difficulty: 'medium', q: 'Which city was the capital of the Umayyad caliphate?',
    choices: ['Damascus', 'Baghdad', 'Cairo', 'Cordoba'],
    why: 'The Umayyads ruled from Damascus; the Abbasids later founded and ruled from Baghdad.',
    cite: 'Standard historical accounts of the Umayyad period' },

  { category: 'islamic_history', difficulty: 'medium', q: 'Which city was the capital of the Abbasid caliphate at its height?',
    choices: ['Baghdad', 'Damascus', 'Cairo', 'Samarkand'],
    why: 'The Abbasids founded Baghdad, which became the centre of learning of its age.',
    cite: 'Standard historical accounts of the Abbasid period' },

  { category: 'islamic_history', difficulty: 'medium', q: 'What was the "Bayt al-Hikmah"?',
    choices: ['A centre of learning and translation in Baghdad', 'A mosque in Madinah', 'A fortress in Andalusia', 'A market in Damascus'],
    why: 'The House of Wisdom in Baghdad was a hub of scholarship and translation under the Abbasids.',
    cite: 'Standard historical accounts of the Abbasid period' },

  { category: 'islamic_history', difficulty: 'medium', q: 'Which mosque did the Prophet ﷺ establish on arriving in the area of Madinah?',
    choices: ['Masjid Quba', 'Masjid an-Nabawi', 'Masjid al-Haram', 'Masjid al-Aqsa'],
    why: 'Masjid Quba was founded on the outskirts of Madinah as the Prophet ﷺ arrived.',
    cite: 'Surah At-Tawbah 9:108' },

  { category: 'islamic_history', difficulty: 'hard', q: 'What was Muslim Spain commonly known as?',
    choices: ['Al-Andalus', 'Al-Maghrib', 'Ash-Sham', 'Khurasan'],
    why: 'Al-Andalus was the name for the Iberian territories under Muslim rule.',
    cite: 'Standard historical accounts of Al-Andalus' },

  { category: 'islamic_history', difficulty: 'hard', q: 'Which dynasty ruled Egypt and built the city of Cairo?',
    choices: ['The Fatimids', 'The Umayyads', 'The Seljuks', 'The Ghaznavids'],
    why: 'The Fatimids founded Cairo in the tenth century as their capital.',
    cite: 'Standard historical accounts of the Fatimid period' },

  { category: 'islamic_history', difficulty: 'hard', q: 'Which empire, centred on Istanbul, endured until the early twentieth century?',
    choices: ['The Ottoman Empire', 'The Safavid Empire', 'The Mughal Empire', 'The Abbasid Caliphate'],
    why: 'The Ottoman Empire ruled from Istanbul and lasted until its dissolution after the First World War.',
    cite: 'Standard historical accounts of the Ottoman period' },

  // ================= muslim_scholars =================
  { category: 'muslim_scholars', difficulty: 'easy', q: 'Which scholar’s work gave its name to the mathematical field of algebra?',
    choices: ['Al-Khwarizmi', 'Ibn Sina', 'Al-Biruni', 'Ibn Khaldun'],
    why: 'The term algebra derives from "al-jabr" in the title of al-Khwarizmi’s treatise, and the word algorithm from his name.',
    cite: 'Al-Khwarizmi, Kitab al-Jabr wa-l-Muqabala' },

  { category: 'muslim_scholars', difficulty: 'medium', q: 'Which scholar wrote the Canon of Medicine, used for centuries in Europe and the Muslim world?',
    choices: ['Ibn Sina', 'Ibn Rushd', 'Al-Ghazali', 'Ar-Razi'],
    why: 'Ibn Sina’s Al-Qanun fi at-Tibb was a standard medical reference for centuries.',
    cite: 'Ibn Sina, Al-Qanun fi at-Tibb' },

  { category: 'muslim_scholars', difficulty: 'medium', q: 'Who founded the mosque and teaching institution of al-Qarawiyyin in Fez?',
    choices: ['Fatima al-Fihri', 'Zubaydah bint Jafar', 'Aishah bint Abi Bakr', 'Rabia al-Adawiyya'],
    why: 'Fatima al-Fihri founded al-Qarawiyyin in the ninth century; it is among the oldest continuously operating institutions of learning.',
    cite: 'Standard historical accounts of Fez' },

  { category: 'muslim_scholars', difficulty: 'medium', q: 'Which scholar is best known for the Muqaddimah and for pioneering the study of society and history?',
    choices: ['Ibn Khaldun', 'Ibn Battuta', 'Al-Masudi', 'At-Tabari'],
    why: 'Ibn Khaldun’s Muqaddimah set out a theory of social organisation and historical change.',
    cite: 'Ibn Khaldun, Al-Muqaddimah' },

  { category: 'muslim_scholars', difficulty: 'medium', q: 'Which traveller is famous for journeys across Africa, Asia and Europe recorded in the Rihlah?',
    choices: ['Ibn Battuta', 'Ibn Jubayr', 'Al-Idrisi', 'Ibn Fadlan'],
    why: 'Ibn Battuta of Tangier travelled for around thirty years, and his account is known as the Rihlah.',
    cite: 'Ibn Battuta, Rihlah' },

  { category: 'muslim_scholars', difficulty: 'hard', q: 'Which scholar wrote Ihya Ulum ad-Din, the Revival of the Religious Sciences?',
    choices: ['Al-Ghazali', 'Ibn Taymiyyah', 'An-Nawawi', 'Al-Qurtubi'],
    why: 'Abu Hamid al-Ghazali’s Ihya is among the most widely read works on the inner dimensions of practice.',
    cite: 'Al-Ghazali, Ihya Ulum ad-Din' },

  { category: 'muslim_scholars', difficulty: 'hard', q: 'Which scholar compiled the widely studied collection known as the Forty Hadith?',
    choices: ['An-Nawawi', 'Al-Bukhari', 'Ibn Hajar', 'As-Suyuti'],
    why: 'Imam an-Nawawi’s collection of forty-two hadith on the foundations of the religion is studied worldwide.',
    cite: 'An-Nawawi, Al-Arbain an-Nawawiyyah' },

  { category: 'muslim_scholars', difficulty: 'hard', q: 'Which astronomer and polymath measured the Earth’s radius with remarkable accuracy for his era?',
    choices: ['Al-Biruni', 'Al-Kindi', 'Ibn al-Haytham', 'Al-Farabi'],
    why: 'Al-Biruni devised a method using the angle of the horizon from a mountain to estimate the Earth’s radius.',
    cite: 'Standard histories of Islamic science' },

  { category: 'muslim_scholars', difficulty: 'hard', q: 'Which scholar’s Book of Optics laid foundations for the scientific study of vision and light?',
    choices: ['Ibn al-Haytham', 'Ibn Sina', 'Al-Khwarizmi', 'Ar-Razi'],
    why: 'Ibn al-Haytham’s Kitab al-Manazir argued that vision results from light entering the eye, and stressed experiment.',
    cite: 'Ibn al-Haytham, Kitab al-Manazir' },

  // ================= arabic_language =================
  { category: 'arabic_language', difficulty: 'easy', q: 'How many letters are in the Arabic alphabet?',
    choices: ['28', '26', '30', '24'],
    why: 'The Arabic alphabet has twenty-eight letters.',
    cite: 'Standard Arabic grammar' },

  { category: 'arabic_language', difficulty: 'easy', q: 'In which direction is Arabic written?',
    choices: ['Right to left', 'Left to right', 'Top to bottom', 'Bottom to top'],
    why: 'Arabic script runs from right to left.',
    cite: 'Standard Arabic orthography' },

  { category: 'arabic_language', difficulty: 'easy', q: 'What does the Arabic word "kitab" mean?',
    choices: ['Book', 'House', 'Water', 'Road'],
    why: '"Kitab" means book, from the root k-t-b relating to writing.',
    cite: 'Standard Arabic vocabulary' },

  { category: 'arabic_language', difficulty: 'medium', q: 'What does the word "Iqra", the first word revealed, mean?',
    choices: ['Read or recite', 'Write', 'Listen', 'Stand'],
    why: '"Iqra" is a command meaning read or recite, the opening word of the first revelation.',
    cite: 'Surah Al-Alaq 96:1' },

  { category: 'arabic_language', difficulty: 'medium', q: 'What does the Arabic word "ilm" mean?',
    choices: ['Knowledge', 'Patience', 'Charity', 'Prayer'],
    why: '"Ilm" means knowledge, and gives this app its name.',
    cite: 'Surah Ta-Ha 20:114' },

  { category: 'arabic_language', difficulty: 'medium', q: 'What is the typical structure of most Arabic words built from?',
    choices: ['A root of three consonants', 'A fixed prefix', 'A single vowel', 'A compound of two nouns'],
    why: 'Most Arabic vocabulary derives from triliteral roots, from which patterns generate related meanings.',
    cite: 'Standard Arabic morphology' },

  { category: 'arabic_language', difficulty: 'hard', q: 'What does the Quran say about the language of its own revelation?',
    choices: ['That it was sent down as an Arabic Quran', 'That it was sent down in Hebrew', 'That it has no fixed language', 'That it was sent down in Syriac'],
    why: 'The Quran repeatedly describes itself as revealed as an Arabic recitation.',
    cite: 'Surah Yusuf 12:2' },

  { category: 'arabic_language', difficulty: 'hard', q: 'What is "balaghah" the study of?',
    choices: ['Eloquence and rhetoric', 'Grammar and case endings', 'Handwriting', 'Poetry metre only'],
    why: 'Balaghah is the science of eloquence, covering imagery, style and effective expression.',
    cite: 'Standard Arabic rhetorical sciences' },

  // ===================== ethics =====================
  { category: 'ethics', difficulty: 'easy', q: 'According to a well-known hadith, what completes a person’s faith regarding their brother?',
    choices: ['Loving for him what one loves for oneself', 'Giving him money', 'Praying beside him', 'Travelling with him'],
    why: 'The Prophet ﷺ said none of you truly believes until he loves for his brother what he loves for himself.',
    cite: 'Sahih al-Bukhari 13; Sahih Muslim 45' },

  { category: 'ethics', difficulty: 'easy', q: 'According to a hadith, what is described as an act of charity that costs nothing?',
    choices: ['Smiling at your brother', 'Fasting a whole month', 'Building a mosque', 'Freeing a slave'],
    why: 'The Prophet ﷺ said that smiling in the face of your brother is a charity.',
    cite: 'Sunan at-Tirmidhi 1956' },

  { category: 'ethics', difficulty: 'medium', q: 'What does the Quran compare backbiting to?',
    choices: ['Eating the flesh of one’s dead brother', 'Carrying a heavy stone', 'Walking in darkness', 'Losing one’s way at sea'],
    why: 'The Quran uses this striking comparison to convey the gravity of speaking ill of someone absent.',
    cite: 'Surah Al-Hujurat 49:12' },

  { category: 'ethics', difficulty: 'medium', q: 'According to a hadith, who is described as truly strong?',
    choices: ['The one who controls himself when angry', 'The one who wins in wrestling', 'The one who fasts the longest', 'The one who gives the most charity'],
    why: 'The Prophet ﷺ said the strong person is not the one who overcomes others, but the one who controls himself when angry.',
    cite: 'Sahih al-Bukhari 6114' },

  { category: 'ethics', difficulty: 'medium', q: 'According to a hadith, truthfulness guides a person toward what?',
    choices: ['Righteousness, which guides to Paradise', 'Wealth in this life', 'Long life', 'Recognition among people'],
    why: 'The Prophet ﷺ said truthfulness leads to righteousness, and righteousness leads to Paradise.',
    cite: 'Sahih al-Bukhari 6094; Sahih Muslim 2607' },

  { category: 'ethics', difficulty: 'medium', q: 'What does the Quran instruct regarding acting on news brought by an unreliable source?',
    choices: ['To verify it before acting', 'To repeat it widely', 'To ignore all news', 'To act on it immediately'],
    why: 'The Quran commands verification when a report arrives, lest harm be done to people out of ignorance.',
    cite: 'Surah Al-Hujurat 49:6' },

  { category: 'ethics', difficulty: 'hard', q: 'According to a hadith, what did the Prophet ﷺ say about a person whose neighbour is not safe from his harm?',
    choices: ['That such a person does not truly believe', 'That he must give charity', 'That he must move house', 'That he must fast three days'],
    why: 'The Prophet ﷺ swore that one whose neighbour is not safe from his harm does not believe, repeating it for emphasis.',
    cite: 'Sahih al-Bukhari 6016' },

  { category: 'ethics', difficulty: 'hard', q: 'What is "amanah"?',
    choices: ['Trustworthiness, and the discharge of what is entrusted to you', 'Generosity to guests', 'Courage in adversity', 'Modesty in dress'],
    why: 'Amanah covers trusts of every kind, and the Quran commands that trusts be rendered to those they belong to.',
    cite: 'Surah An-Nisa 4:58' },

  // ================== family_life ==================
  { category: 'family_life', difficulty: 'easy', q: 'How does the Quran instruct a person to speak to their parents in old age?',
    choices: ['Never to say a word of contempt, and to speak to them graciously', 'To speak only when spoken to', 'To remain silent', 'To speak firmly'],
    why: 'The Quran commands kindness to parents, forbidding even a word of irritation.',
    cite: 'Surah Al-Isra 17:23' },

  { category: 'family_life', difficulty: 'easy', q: 'According to a hadith, who is most deserving of a person’s good companionship?',
    choices: ['Their mother', 'Their eldest brother', 'Their employer', 'Their neighbour'],
    why: 'A man asked who most deserved his good company; the Prophet ﷺ said his mother, three times, then his father.',
    cite: 'Sahih al-Bukhari 5971' },

  { category: 'family_life', difficulty: 'medium', q: 'According to a hadith, the best of people are best in what respect?',
    choices: ['To their families', 'In wealth', 'In physical strength', 'In public speaking'],
    why: 'The Prophet ﷺ said the best of you are those best to their families, and that he was the best to his.',
    cite: 'Sunan at-Tirmidhi 3895' },

  { category: 'family_life', difficulty: 'medium', q: 'What is the marriage gift given by the husband to the wife called?',
    choices: ['Mahr', 'Zakat', 'Sadaqah', 'Waqf'],
    why: 'The mahr is the wife’s right, given to her and belonging to her alone.',
    cite: 'Surah An-Nisa 4:4', madhab: 'agreed' },

  { category: 'family_life', difficulty: 'medium', q: 'What is "silat ar-rahim"?',
    choices: ['Maintaining ties with relatives', 'Giving charity anonymously', 'Praying at night', 'Fasting on Mondays'],
    why: 'Silat ar-rahim is upholding kinship ties, strongly emphasised in the Quran and Sunnah.',
    cite: 'Sahih al-Bukhari 5985' },

  { category: 'family_life', difficulty: 'hard', q: 'According to a hadith, what is the reward described for a person who raises daughters well?',
    choices: ['Closeness to the Prophet ﷺ on the Day of Resurrection', 'Wealth in this world', 'Exemption from fasting', 'A longer lifespan'],
    why: 'The Prophet ﷺ said that one who cares well for two daughters until they come of age will be with him on that Day.',
    cite: 'Sahih Muslim 2631' },

  // ================= sacred_places =================
  { category: 'sacred_places', difficulty: 'easy', q: 'In which city is the Kabah located?',
    choices: ['Makkah', 'Madinah', 'Jerusalem', 'Damascus'],
    why: 'The Kabah stands within Masjid al-Haram in Makkah.',
    cite: 'Surah Al-Imran 3:96' },

  { category: 'sacred_places', difficulty: 'easy', q: 'In which city is Masjid an-Nabawi, the Prophet’s Mosque?',
    choices: ['Madinah', 'Makkah', 'Taif', 'Jeddah'],
    why: 'Masjid an-Nabawi was built in Madinah after the Hijrah and is where the Prophet ﷺ is buried.',
    cite: 'Standard seerah accounts' },

  { category: 'sacred_places', difficulty: 'medium', q: 'In which city is Masjid al-Aqsa?',
    choices: ['Jerusalem', 'Damascus', 'Cairo', 'Hebron'],
    why: 'Masjid al-Aqsa is in Jerusalem, and was the destination of the night journey.',
    cite: 'Surah Al-Isra 17:1' },

  { category: 'sacred_places', difficulty: 'medium', q: 'Which three mosques are singled out in a hadith as destinations worth setting out to visit?',
    choices: ['Al-Haram, An-Nabawi and Al-Aqsa', 'Al-Haram, Quba and Al-Aqsa', 'An-Nabawi, Quba and Al-Aqsa', 'Al-Haram, An-Nabawi and Quba'],
    why: 'The Prophet ﷺ named Masjid al-Haram, his own mosque, and Masjid al-Aqsa.',
    cite: 'Sahih al-Bukhari 1189' },

  { category: 'sacred_places', difficulty: 'medium', q: 'What was the first qiblah, the direction Muslims faced before it changed to the Kabah?',
    choices: ['Jerusalem', 'Madinah', 'Taif', 'Mount Sinai'],
    why: 'The early Muslims prayed toward Jerusalem until the direction was changed to the Kabah.',
    cite: 'Surah Al-Baqarah 2:144' },

  { category: 'sacred_places', difficulty: 'hard', q: 'What is the "Rawdah" in Masjid an-Nabawi?',
    choices: ['The area between the Prophet’s ﷺ house and his pulpit', 'The main courtyard', 'The northern minaret', 'The library'],
    why: 'The Prophet ﷺ described the space between his house and his pulpit as a garden from the gardens of Paradise.',
    cite: 'Sahih al-Bukhari 1195' },

  // ================ islamic_calendar ================
  { category: 'islamic_calendar', difficulty: 'easy', q: 'How many months are in the Islamic calendar?',
    choices: ['Twelve', 'Ten', 'Thirteen', 'Fourteen'],
    why: 'The Quran states that the number of months with Allah is twelve.',
    cite: 'Surah At-Tawbah 9:36' },

  { category: 'islamic_calendar', difficulty: 'easy', q: 'What is the first month of the Islamic calendar?',
    choices: ['Muharram', 'Ramadan', 'Shawwal', 'Rajab'],
    why: 'Muharram is the first month of the Hijri year.',
    cite: 'Standard Islamic calendar' },

  { category: 'islamic_calendar', difficulty: 'medium', q: 'The Islamic calendar is based on the cycles of what?',
    choices: ['The moon', 'The sun', 'The stars', 'The seasons'],
    why: 'It is a lunar calendar, which is why its months move through the solar year.',
    cite: 'Surah Al-Baqarah 2:189' },

  { category: 'islamic_calendar', difficulty: 'medium', q: 'On which day of Muharram is the fast of Ashura observed?',
    choices: ['The tenth', 'The first', 'The fifteenth', 'The twenty-seventh'],
    why: 'Ashura falls on the tenth of Muharram, and the Prophet ﷺ fasted it and encouraged fasting it.',
    cite: 'Sahih al-Bukhari 2004' },

  { category: 'islamic_calendar', difficulty: 'medium', q: 'Which festival falls during the month of Dhul-Hijjah?',
    choices: ['Eid al-Adha', 'Eid al-Fitr', 'Ashura', 'Laylat al-Qadr'],
    why: 'Eid al-Adha falls on the tenth of Dhul-Hijjah, during the days of Hajj.',
    cite: 'Standard Islamic calendar' },

  { category: 'islamic_calendar', difficulty: 'hard', q: 'How many of the twelve months are described in the Quran as sacred?',
    choices: ['Four', 'Two', 'Six', 'One'],
    why: 'The Quran states that of the twelve months, four are sacred.',
    cite: 'Surah At-Tawbah 9:36' },

  // ================== islam_world ==================
  { category: 'islam_world', difficulty: 'easy', q: 'Which country has the largest Muslim population in the world?',
    choices: ['Indonesia', 'Saudi Arabia', 'Egypt', 'Turkey'],
    why: 'Indonesia has the largest Muslim population of any country.',
    cite: 'Standard population statistics' },

  { category: 'islam_world', difficulty: 'medium', q: 'In which modern country is the ancient city of Timbuktu, a historic centre of Islamic learning?',
    choices: ['Mali', 'Morocco', 'Sudan', 'Niger'],
    why: 'Timbuktu, in present-day Mali, was a renowned centre of manuscripts and scholarship.',
    cite: 'Standard historical accounts of West African learning' },

  { category: 'islam_world', difficulty: 'medium', q: 'Which empire in the Indian subcontinent built the Taj Mahal?',
    choices: ['The Mughal Empire', 'The Ottoman Empire', 'The Safavid Empire', 'The Delhi Sultanate'],
    why: 'The Taj Mahal was built under the Mughal emperor Shah Jahan.',
    cite: 'Standard historical accounts of the Mughal period' },

  { category: 'islam_world', difficulty: 'hard', q: 'Which West African scholar and leader founded the Sokoto Caliphate in the early nineteenth century?',
    choices: ['Usman dan Fodio', 'Mansa Musa', 'Ahmad Baba', 'Al-Hajj Umar Tall'],
    why: 'Usman dan Fodio led a reform movement that established the Sokoto Caliphate in what is now northern Nigeria.',
    cite: 'Standard historical accounts of the Sokoto Caliphate' },

  { category: 'islam_world', difficulty: 'hard', q: 'Which ruler of Mali became renowned across the medieval world for his pilgrimage to Makkah?',
    choices: ['Mansa Musa', 'Sundiata Keita', 'Askia Muhammad', 'Sunni Ali'],
    why: 'Mansa Musa’s fourteenth-century pilgrimage was recorded widely for its scale and generosity.',
    cite: 'Standard historical accounts of the Mali Empire' },

  // ============== contemporary_issues ==============
  { category: 'contemporary_issues', difficulty: 'easy', q: 'What does the term "halal certification" generally refer to?',
    choices: ['Verification that a product meets Islamic dietary or ethical requirements', 'A tax on imported goods', 'A charity registration', 'A form of insurance'],
    why: 'Halal certification is third-party verification that a product complies with Islamic requirements.',
    cite: 'Standard contemporary usage' },

  { category: 'contemporary_issues', difficulty: 'medium', q: 'What is the Arabic term for the interest that Islamic finance seeks to avoid?',
    choices: ['Riba', 'Zakat', 'Khums', 'Gharar'],
    why: 'Riba is prohibited in the Quran; gharar refers separately to excessive uncertainty in contracts.',
    cite: 'Surah Al-Baqarah 2:275', madhab: 'agreed' },

  { category: 'contemporary_issues', difficulty: 'medium', q: 'What does "gharar" refer to in Islamic commercial ethics?',
    choices: ['Excessive uncertainty or ambiguity in a contract', 'Charging interest', 'Trading in food', 'Selling on credit'],
    why: 'Gharar is avoidable uncertainty in the subject matter or terms of a contract, which scholars hold invalidates it.',
    cite: 'Sahih Muslim 1513' },

  { category: 'contemporary_issues', difficulty: 'medium', q: 'What principle does the Quran state regarding compulsion in matters of religion?',
    choices: ['There is no compulsion in religion', 'Compulsion is permitted in wartime', 'Compulsion applies only to adults', 'Compulsion is required of rulers'],
    why: 'The Quran states plainly that there is no compulsion in religion.',
    cite: 'Surah Al-Baqarah 2:256' },

  { category: 'contemporary_issues', difficulty: 'hard', q: 'What does the Quran say about taking a single innocent life?',
    choices: ['That it is as though one had killed all of humanity', 'That it is a minor offence', 'That it can be excused by charity', 'That it applies only within one community'],
    why: 'The Quran states that whoever kills a soul, other than for a soul or corruption in the land, it is as if he killed all mankind.',
    cite: 'Surah Al-Maidah 5:32' },

  { category: 'contemporary_issues', difficulty: 'hard', q: 'What does the Quran give as the reason for creating people as nations and tribes?',
    choices: ['That they may come to know one another', 'That they may compete for wealth', 'That they may remain separate', 'That they may rank one another'],
    why: 'The Quran states that people were made into peoples and tribes so that they might know one another, and that the most honoured is the most mindful of Allah.',
    cite: 'Surah Al-Hujurat 49:13' },
];
