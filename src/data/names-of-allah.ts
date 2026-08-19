/**
 * The 99 names, as narrated in the list transmitted by at-Tirmidhi (Hadith
 * 3507) — the enumeration most commonly reproduced, and the one most readers
 * will recognise.
 *
 * A note on why this file is careful rather than convenient: these are names
 * of Allah. They are rendered here with full diacritics, never abbreviated,
 * never truncated by the layout, and never split across a line — see
 * `NamesOfAllahBackdrop`, which sizes itself around the longest entry instead
 * of clipping. If a name cannot be shown whole it is not shown at all.
 *
 * Scholars differ on the exact list: the names themselves are established, but
 * the specific enumeration of ninety-nine is a transmitted compilation rather
 * than something the hadith itself fixes. Nothing in the app depends on the
 * count, so this is presented as remembrance, not as doctrine.
 */

export interface DivineName {
  /** Arabic, with diacritics. */
  arabic: string
  /** Latin transliteration. */
  transliteration: string
}

export const NAMES_OF_ALLAH: DivineName[] = [
  { arabic: "ٱلرَّحْمَٰنُ", transliteration: "Ar-Rahmān" },
  { arabic: "ٱلرَّحِيمُ", transliteration: "Ar-Rahīm" },
  { arabic: "ٱلْمَلِكُ", transliteration: "Al-Malik" },
  { arabic: "ٱلْقُدُّوسُ", transliteration: "Al-Quddūs" },
  { arabic: "ٱلسَّلَامُ", transliteration: "As-Salām" },
  { arabic: "ٱلْمُؤْمِنُ", transliteration: "Al-Mu'min" },
  { arabic: "ٱلْمُهَيْمِنُ", transliteration: "Al-Muhaymin" },
  { arabic: "ٱلْعَزِيزُ", transliteration: "Al-'Azīz" },
  { arabic: "ٱلْجَبَّارُ", transliteration: "Al-Jabbār" },
  { arabic: "ٱلْمُتَكَبِّرُ", transliteration: "Al-Mutakabbir" },
  { arabic: "ٱلْخَالِقُ", transliteration: "Al-Khāliq" },
  { arabic: "ٱلْبَارِئُ", transliteration: "Al-Bāri'" },
  { arabic: "ٱلْمُصَوِّرُ", transliteration: "Al-Musawwir" },
  { arabic: "ٱلْغَفَّارُ", transliteration: "Al-Ghaffār" },
  { arabic: "ٱلْقَهَّارُ", transliteration: "Al-Qahhār" },
  { arabic: "ٱلْوَهَّابُ", transliteration: "Al-Wahhāb" },
  { arabic: "ٱلرَّزَّاقُ", transliteration: "Ar-Razzāq" },
  { arabic: "ٱلْفَتَّاحُ", transliteration: "Al-Fattāh" },
  { arabic: "ٱلْعَلِيمُ", transliteration: "Al-'Alīm" },
  { arabic: "ٱلْقَابِضُ", transliteration: "Al-Qābid" },
  { arabic: "ٱلْبَاسِطُ", transliteration: "Al-Bāsit" },
  { arabic: "ٱلْخَافِضُ", transliteration: "Al-Khāfid" },
  { arabic: "ٱلرَّافِعُ", transliteration: "Ar-Rāfi'" },
  { arabic: "ٱلْمُعِزُّ", transliteration: "Al-Mu'izz" },
  { arabic: "ٱلْمُذِلُّ", transliteration: "Al-Mudhill" },
  { arabic: "ٱلسَّمِيعُ", transliteration: "As-Samī'" },
  { arabic: "ٱلْبَصِيرُ", transliteration: "Al-Basīr" },
  { arabic: "ٱلْحَكَمُ", transliteration: "Al-Hakam" },
  { arabic: "ٱلْعَدْلُ", transliteration: "Al-'Adl" },
  { arabic: "ٱللَّطِيفُ", transliteration: "Al-Latīf" },
  { arabic: "ٱلْخَبِيرُ", transliteration: "Al-Khabīr" },
  { arabic: "ٱلْحَلِيمُ", transliteration: "Al-Halīm" },
  { arabic: "ٱلْعَظِيمُ", transliteration: "Al-'Azīm" },
  { arabic: "ٱلْغَفُورُ", transliteration: "Al-Ghafūr" },
  { arabic: "ٱلشَّكُورُ", transliteration: "Ash-Shakūr" },
  { arabic: "ٱلْعَلِيُّ", transliteration: "Al-'Aliyy" },
  { arabic: "ٱلْكَبِيرُ", transliteration: "Al-Kabīr" },
  { arabic: "ٱلْحَفِيظُ", transliteration: "Al-Hafīz" },
  { arabic: "ٱلْمُقِيتُ", transliteration: "Al-Muqīt" },
  { arabic: "ٱلْحَسِيبُ", transliteration: "Al-Hasīb" },
  { arabic: "ٱلْجَلِيلُ", transliteration: "Al-Jalīl" },
  { arabic: "ٱلْكَرِيمُ", transliteration: "Al-Karīm" },
  { arabic: "ٱلرَّقِيبُ", transliteration: "Ar-Raqīb" },
  { arabic: "ٱلْمُجِيبُ", transliteration: "Al-Mujīb" },
  { arabic: "ٱلْوَاسِعُ", transliteration: "Al-Wāsi'" },
  { arabic: "ٱلْحَكِيمُ", transliteration: "Al-Hakīm" },
  { arabic: "ٱلْوَدُودُ", transliteration: "Al-Wadūd" },
  { arabic: "ٱلْمَجِيدُ", transliteration: "Al-Majīd" },
  { arabic: "ٱلْبَاعِثُ", transliteration: "Al-Bā'ith" },
  { arabic: "ٱلشَّهِيدُ", transliteration: "Ash-Shahīd" },
  { arabic: "ٱلْحَقُّ", transliteration: "Al-Haqq" },
  { arabic: "ٱلْوَكِيلُ", transliteration: "Al-Wakīl" },
  { arabic: "ٱلْقَوِيُّ", transliteration: "Al-Qawiyy" },
  { arabic: "ٱلْمَتِينُ", transliteration: "Al-Matīn" },
  { arabic: "ٱلْوَلِيُّ", transliteration: "Al-Waliyy" },
  { arabic: "ٱلْحَمِيدُ", transliteration: "Al-Hamīd" },
  { arabic: "ٱلْمُحْصِي", transliteration: "Al-Muhsī" },
  { arabic: "ٱلْمُبْدِئُ", transliteration: "Al-Mubdi'" },
  { arabic: "ٱلْمُعِيدُ", transliteration: "Al-Mu'īd" },
  { arabic: "ٱلْمُحْيِي", transliteration: "Al-Muhyī" },
  { arabic: "ٱلْمُمِيتُ", transliteration: "Al-Mumīt" },
  { arabic: "ٱلْحَيُّ", transliteration: "Al-Hayy" },
  { arabic: "ٱلْقَيُّومُ", transliteration: "Al-Qayyūm" },
  { arabic: "ٱلْوَاجِدُ", transliteration: "Al-Wājid" },
  { arabic: "ٱلْمَاجِدُ", transliteration: "Al-Mājid" },
  { arabic: "ٱلْوَاحِدُ", transliteration: "Al-Wāhid" },
  { arabic: "ٱلْأَحَدُ", transliteration: "Al-Ahad" },
  { arabic: "ٱلصَّمَدُ", transliteration: "As-Samad" },
  { arabic: "ٱلْقَادِرُ", transliteration: "Al-Qādir" },
  { arabic: "ٱلْمُقْتَدِرُ", transliteration: "Al-Muqtadir" },
  { arabic: "ٱلْمُقَدِّمُ", transliteration: "Al-Muqaddim" },
  { arabic: "ٱلْمُؤَخِّرُ", transliteration: "Al-Mu'akhkhir" },
  { arabic: "ٱلْأَوَّلُ", transliteration: "Al-Awwal" },
  { arabic: "ٱلْآخِرُ", transliteration: "Al-Ākhir" },
  { arabic: "ٱلظَّاهِرُ", transliteration: "Az-Zāhir" },
  { arabic: "ٱلْبَاطِنُ", transliteration: "Al-Bātin" },
  { arabic: "ٱلْوَالِي", transliteration: "Al-Wālī" },
  { arabic: "ٱلْمُتَعَالِي", transliteration: "Al-Muta'ālī" },
  { arabic: "ٱلْبَرُّ", transliteration: "Al-Barr" },
  { arabic: "ٱلتَّوَّابُ", transliteration: "At-Tawwāb" },
  { arabic: "ٱلْمُنْتَقِمُ", transliteration: "Al-Muntaqim" },
  { arabic: "ٱلْعَفُوُّ", transliteration: "Al-'Afuww" },
  { arabic: "ٱلرَّءُوفُ", transliteration: "Ar-Ra'ūf" },
  { arabic: "مَالِكُ ٱلْمُلْكِ", transliteration: "Mālik-ul-Mulk" },
  { arabic: "ذُو ٱلْجَلَالِ وَٱلْإِكْرَامِ", transliteration: "Dhul-Jalāli wal-Ikrām" },
  { arabic: "ٱلْمُقْسِطُ", transliteration: "Al-Muqsit" },
  { arabic: "ٱلْجَامِعُ", transliteration: "Al-Jāmi'" },
  { arabic: "ٱلْغَنِيُّ", transliteration: "Al-Ghaniyy" },
  { arabic: "ٱلْمُغْنِي", transliteration: "Al-Mughnī" },
  { arabic: "ٱلْمَانِعُ", transliteration: "Al-Māni'" },
  { arabic: "ٱلضَّارُّ", transliteration: "Ad-Dārr" },
  { arabic: "ٱلنَّافِعُ", transliteration: "An-Nāfi'" },
  { arabic: "ٱلنُّورُ", transliteration: "An-Nūr" },
  { arabic: "ٱلْهَادِي", transliteration: "Al-Hādī" },
  { arabic: "ٱلْبَدِيعُ", transliteration: "Al-Badī'" },
  { arabic: "ٱلْبَاقِي", transliteration: "Al-Bāqī" },
  { arabic: "ٱلْوَارِثُ", transliteration: "Al-Wārith" },
  { arabic: "ٱلرَّشِيدُ", transliteration: "Ar-Rashīd" },
  { arabic: "ٱلصَّبُورُ", transliteration: "As-Sabūr" },
]
