import type { SeedCategory } from './types';

/**
 * The knowledge categories.
 *
 * The first ten are the ones ALREADY IN THE LIVE DATABASE — slugs and
 * sort_order copied from it exactly, so the seed updates them in place rather
 * than creating a parallel set. Their slugs use underscores; the hyphenated ids
 * in the legacy `CATEGORIES` array in src/lib/constants.ts do not match the
 * database and should not be used for new work.
 *
 * The remainder take the app toward the 25 categories named in
 * docs/blueprint.md. They are additive: nothing existing is renamed or
 * re-ordered, so no existing question loses its category.
 */
export const CATEGORIES: SeedCategory[] = [
  // ---- Already live. Do not change slug or sortOrder. ----
  { slug: 'quran',               name: 'Quran',                  description: 'Surahs, verses, revelation and themes',                icon: '📖', sortOrder: 1 },
  { slug: 'hadith',              name: 'Hadith',                 description: 'Prophetic narrations and how they are graded',         icon: '📜', sortOrder: 2 },
  { slug: 'prophetic_biography', name: 'Prophetic Biography',    description: 'The life of the Prophet ﷺ',                            icon: '⭐', sortOrder: 3 },
  { slug: 'fiqh',                name: 'Fiqh',                   description: 'Practical rulings and how scholars derive them',       icon: '⚖️', sortOrder: 4 },
  { slug: 'islamic_history',     name: 'Islamic History',        description: 'The caliphates, dynasties and the golden age',         icon: '🏛️', sortOrder: 5 },
  { slug: 'aqeedah',             name: "Aqeedah (Allah's Names)", description: 'Belief, and the names and attributes of Allah',       icon: '💎', sortOrder: 6 },
  { slug: 'ethics',              name: 'Islamic Ethics',         description: 'Character, manners and how to treat people',           icon: '❤️', sortOrder: 7 },
  { slug: 'arabic_language',     name: 'Arabic Language',        description: 'The language of the Quran',                            icon: '🔤', sortOrder: 8 },
  { slug: 'five_pillars',        name: 'Five Pillars',           description: 'Shahada, Salah, Zakat, Sawm and Hajj',                 icon: '🕌', sortOrder: 9 },
  { slug: 'contemporary_issues', name: 'Contemporary Issues',    description: 'Modern questions and Islamic perspectives',            icon: '🌍', sortOrder: 10 },

  // ---- New. Additive only. ----
  { slug: 'stories_of_prophets', name: 'Stories of the Prophets', description: 'From Adam to Isa, as the Quran tells them',           icon: '🌅', sortOrder: 11 },
  { slug: 'companions',          name: 'The Companions',          description: 'The Sahabah who carried the message',                 icon: '🤝', sortOrder: 12 },
  { slug: 'salah',               name: 'Prayer in Depth',         description: 'The prayer, its times, forms and meaning',            icon: '🤲', sortOrder: 13 },
  { slug: 'ramadan_fasting',     name: 'Ramadan & Fasting',       description: 'The month of fasting and its rulings',                icon: '🌙', sortOrder: 14 },
  { slug: 'hajj_umrah',          name: 'Hajj & Umrah',            description: 'The pilgrimage, its rites and their origins',         icon: '🕋', sortOrder: 15 },
  { slug: 'zakat_charity',       name: 'Zakat & Charity',         description: 'Obligatory and voluntary giving',                     icon: '💰', sortOrder: 16 },
  { slug: 'quran_sciences',      name: 'Sciences of the Quran',   description: 'Revelation, recitation, tajweed and tafsir',          icon: '🔍', sortOrder: 17 },
  { slug: 'dua_dhikr',           name: 'Dua & Dhikr',             description: 'Supplication and the remembrance of Allah',           icon: '📿', sortOrder: 18 },
  { slug: 'angels_unseen',       name: 'Angels & the Unseen',     description: 'Angels, the soul, and the world beyond sight',        icon: '👼', sortOrder: 19 },
  { slug: 'tazkiyah',            name: 'Purification of the Soul', description: 'Sincerity, humility and the inner life',             icon: '✨', sortOrder: 20 },
  { slug: 'family_life',         name: 'Family & Community',      description: 'Parents, marriage, neighbours and rights',            icon: '🏡', sortOrder: 21 },
  { slug: 'sacred_places',       name: 'Sacred Places',           description: 'Makkah, Madinah, Al-Aqsa and the great mosques',      icon: '🕌', sortOrder: 22 },
  { slug: 'islamic_calendar',    name: 'Islamic Calendar',        description: 'The months, and the days that matter in them',        icon: '📅', sortOrder: 23 },
  { slug: 'muslim_scholars',     name: 'Scholars & Scientists',   description: 'The thinkers of the Islamic intellectual tradition',  icon: '🔭', sortOrder: 24 },
  { slug: 'islam_world',         name: 'Islam Around the World',  description: 'Muslim communities, cultures and geography',          icon: '🧭', sortOrder: 25 },
];
