/**
 * QashqAI Voice — Classroom phrase data
 *
 * Each Phrase has:
 *   latin    — Qashqai written in Latin script (Azerbaijani-based orthography)
 *   arabic   — Qashqai written in Persian/Arabic script (traditional)
 *   phonetic — simplified pronunciation guide (optional; omitted for numbers
 *              since the Latin form already serves as a phonetic guide)
 *   en       — English translation
 *   de       — German translation
 *   fa       — Persian (Farsi) translation
 */

export interface Phrase {
  latin:     string
  arabic:    string
  phonetic?: string
  en:        string
  de:        string
  fa:        string
}

export interface Category {
  id:      string
  label:   string
  icon:    string
  phrases: Phrase[]
}

// ─── Greetings ─────────────────────────────────────────────────────────────

const greetings: Phrase[] = [
  {
    latin:    'Salam',
    arabic:   'سلام',
    phonetic: 'sa·lam',
    en: 'Hello',
    de: 'Hallo',
    fa: 'سلام',
  },
  {
    latin:    'Necəsən?',
    arabic:   'نئجه‌سین؟',
    phonetic: 'ne·cə·sən',
    en: 'How are you?',
    de: 'Wie geht es dir?',
    fa: 'حال شما چطور است؟',
  },
  {
    latin:    'Yaxşıyam',
    arabic:   'یاخشیام',
    phonetic: 'yax·şı·yam',
    en: 'I am fine',
    de: 'Mir geht es gut',
    fa: 'خوبم',
  },
  {
    latin:    'Sabahın xeyir',
    arabic:   'صباحین خئیر',
    phonetic: 'sa·ba·hın xeyr',
    en: 'Good morning',
    de: 'Guten Morgen',
    fa: 'صبح بخیر',
  },
  {
    latin:    'Axşamın xeyir',
    arabic:   'آخشامین خئیر',
    phonetic: 'ax·şa·mın xeyr',
    en: 'Good evening',
    de: 'Guten Abend',
    fa: 'شب بخیر',
  },
  {
    latin:    'Xudahafiz',
    arabic:   'خداحافظ',
    phonetic: 'xu·da·ha·fiz',
    en: 'Goodbye',
    de: 'Auf Wiedersehen',
    fa: 'خداحافظ',
  },
  {
    latin:    'Məmnun',
    arabic:   'ممنون',
    phonetic: 'məm·nun',
    en: 'Thank you',
    de: 'Danke',
    fa: 'ممنون',
  },
  {
    latin:    'Buyurun',
    arabic:   'بویورون',
    phonetic: 'bu·yu·run',
    en: "You're welcome",
    de: 'Bitte sehr',
    fa: 'خواهش می‌کنم',
  },
  {
    latin:    'Bəle',
    arabic:   'بئله',
    phonetic: 'bə·le',
    en: 'Yes',
    de: 'Ja',
    fa: 'بله',
  },
  {
    latin:    'Xeyr',
    arabic:   'خئیر',
    phonetic: 'xeyr',
    en: 'No',
    de: 'Nein',
    fa: 'نه',
  },
  {
    latin:    'Xahiş edirəm',
    arabic:   'خاهیش ائدیریم',
    phonetic: 'xa·hiş e·di·rəm',
    en: 'Please',
    de: 'Bitte',
    fa: 'لطفاً',
  },
  {
    latin:    'Xoş gəldin!',
    arabic:   'خوش گلدین!',
    phonetic: 'xoş gəl·din',
    en: 'Welcome!',
    de: 'Willkommen!',
    fa: 'خوش آمدی!',
  },
]

// ─── Numbers 1–20 ──────────────────────────────────────────────────────────

const numbers: Phrase[] = [
  { latin: 'Bir',       arabic: 'بیر',        en: 'One (1)',       de: 'Eins',      fa: 'یک' },
  { latin: 'İki',       arabic: 'ایکی',        en: 'Two (2)',       de: 'Zwei',      fa: 'دو' },
  { latin: 'Üç',        arabic: 'اوچ',         en: 'Three (3)',     de: 'Drei',      fa: 'سه' },
  { latin: 'Dörd',      arabic: 'دؤرد',        en: 'Four (4)',      de: 'Vier',      fa: 'چهار' },
  { latin: 'Beş',       arabic: 'بئش',         en: 'Five (5)',      de: 'Fünf',      fa: 'پنج' },
  { latin: 'Altı',      arabic: 'آلتی',        en: 'Six (6)',       de: 'Sechs',     fa: 'شش' },
  { latin: 'Yeddi',     arabic: 'یئدّی',       en: 'Seven (7)',     de: 'Sieben',    fa: 'هفت' },
  { latin: 'Səkkiz',    arabic: 'سکّیز',       en: 'Eight (8)',     de: 'Acht',      fa: 'هشت' },
  { latin: 'Doqquz',    arabic: 'دوقّوز',      en: 'Nine (9)',      de: 'Neun',      fa: 'نه' },
  { latin: 'On',        arabic: 'اون',         en: 'Ten (10)',      de: 'Zehn',      fa: 'ده' },
  { latin: 'On bir',    arabic: 'اون بیر',     en: 'Eleven (11)',   de: 'Elf',       fa: 'یازده' },
  { latin: 'On iki',    arabic: 'اون ایکی',    en: 'Twelve (12)',   de: 'Zwölf',     fa: 'دوازده' },
  { latin: 'On üç',     arabic: 'اون اوچ',     en: 'Thirteen (13)', de: 'Dreizehn', fa: 'سیزده' },
  { latin: 'On dörd',   arabic: 'اون دؤرد',    en: 'Fourteen (14)', de: 'Vierzehn', fa: 'چهارده' },
  { latin: 'On beş',    arabic: 'اون بئش',     en: 'Fifteen (15)', de: 'Fünfzehn',  fa: 'پانزده' },
  { latin: 'On altı',   arabic: 'اون آلتی',    en: 'Sixteen (16)', de: 'Sechzehn',  fa: 'شانزده' },
  { latin: 'On yeddi',  arabic: 'اون یئدّی',   en: 'Seventeen (17)', de: 'Siebzehn', fa: 'هفده' },
  { latin: 'On səkkiz', arabic: 'اون سکّیز',   en: 'Eighteen (18)', de: 'Achtzehn', fa: 'هجده' },
  { latin: 'On doqquz', arabic: 'اون دوقّوز',  en: 'Nineteen (19)', de: 'Neunzehn', fa: 'نوزده' },
  { latin: 'İyirmi',    arabic: 'ایگیرمی',     en: 'Twenty (20)',  de: 'Zwanzig',   fa: 'بیست' },
]

// ─── Animals ───────────────────────────────────────────────────────────────

const animals: Phrase[] = [
  {
    latin: 'At',      arabic: 'آت',     phonetic: 'at',
    en: 'Horse',   de: 'Pferd',    fa: 'اسب',
  },
  {
    latin: 'Qoyun',   arabic: 'قویون',  phonetic: 'qo·yun',
    en: 'Sheep',   de: 'Schaf',    fa: 'گوسفند',
  },
  {
    latin: 'İt',      arabic: 'ایت',    phonetic: 'it',
    en: 'Dog',     de: 'Hund',     fa: 'سگ',
  },
  {
    latin: 'Keçi',    arabic: 'گئچی',   phonetic: 'ke·çi',
    en: 'Goat',    de: 'Ziege',    fa: 'بز',
  },
  {
    latin: 'Qurd',    arabic: 'قورد',   phonetic: 'qurd',
    en: 'Wolf',    de: 'Wolf',     fa: 'گرگ',
  },
  {
    latin: 'Quş',     arabic: 'قوش',    phonetic: 'quş',
    en: 'Bird',    de: 'Vogel',    fa: 'پرنده',
  },
  {
    latin: 'Balıq',   arabic: 'بالیق',  phonetic: 'ba·lıq',
    en: 'Fish',    de: 'Fisch',    fa: 'ماهی',
  },
  {
    latin: 'Pişik',   arabic: 'پیشیک',  phonetic: 'pi·şik',
    en: 'Cat',     de: 'Katze',    fa: 'گربه',
  },
  {
    latin: 'İnək',    arabic: 'اینک',   phonetic: 'i·nək',
    en: 'Cow',     de: 'Kuh',      fa: 'گاو',
  },
  {
    latin: 'Eşşek',   arabic: 'ائشّک',  phonetic: 'eş·şek',
    en: 'Donkey',  de: 'Esel',     fa: 'الاغ',
  },
  {
    latin: 'Tülkü',   arabic: 'تولکو',  phonetic: 'tül·kü',
    en: 'Fox',     de: 'Fuchs',    fa: 'روباه',
  },
  {
    latin: 'Ayı',     arabic: 'آیی',    phonetic: 'a·yı',
    en: 'Bear',    de: 'Bär',      fa: 'خرس',
  },
]

// ─── Family ────────────────────────────────────────────────────────────────

const family: Phrase[] = [
  {
    latin: 'Ana',     arabic: 'آنا',     phonetic: 'a·na',
    en: 'Mother',    de: 'Mutter',       fa: 'مادر',
  },
  {
    latin: 'Ata',     arabic: 'آتا',     phonetic: 'a·ta',
    en: 'Father',    de: 'Vater',        fa: 'پدر',
  },
  {
    latin: 'Qardaş',  arabic: 'قاردیاش', phonetic: 'qar·daş',
    en: 'Brother',   de: 'Bruder',       fa: 'برادر',
  },
  {
    latin: 'Bacı',    arabic: 'باجی',    phonetic: 'ba·cı',
    en: 'Sister',    de: 'Schwester',    fa: 'خواهر',
  },
  {
    latin: 'Oğul',    arabic: 'اوغول',   phonetic: 'oğ·ul',
    en: 'Son',       de: 'Sohn',         fa: 'پسر',
  },
  {
    latin: 'Qız',     arabic: 'قیز',     phonetic: 'qız',
    en: 'Daughter',  de: 'Tochter',      fa: 'دختر',
  },
  {
    latin: 'Baba',    arabic: 'بابا',    phonetic: 'ba·ba',
    en: 'Grandfather', de: 'Großvater',  fa: 'پدربزرگ',
  },
  {
    latin: 'Nənə',    arabic: 'نئنه',    phonetic: 'nə·nə',
    en: 'Grandmother', de: 'Großmutter', fa: 'مادربزرگ',
  },
  {
    latin: 'Əmi',     arabic: 'عمی',     phonetic: 'ə·mi',
    en: 'Uncle (paternal)', de: 'Onkel', fa: 'عمو',
  },
  {
    latin: 'Xala',    arabic: 'خاله',    phonetic: 'xa·la',
    en: 'Aunt (maternal)',  de: 'Tante', fa: 'خاله',
  },
  {
    latin: 'Uşaq',    arabic: 'اوشاق',   phonetic: 'u·şaq',
    en: 'Child',     de: 'Kind',         fa: 'کودک',
  },
  {
    latin: 'Dost',    arabic: 'دوست',    phonetic: 'dost',
    en: 'Friend',    de: 'Freund',       fa: 'دوست',
  },
]

// ─── Colors ────────────────────────────────────────────────────────────────

const colors: Phrase[] = [
  {
    latin: 'Qırmızı',    arabic: 'قیرمیزی',   phonetic: 'qır·mı·zı',
    en: 'Red',       de: 'Rot',       fa: 'قرمز',
  },
  {
    latin: 'Mavi',       arabic: 'ماوی',       phonetic: 'ma·vi',
    en: 'Blue',      de: 'Blau',      fa: 'آبی',
  },
  {
    latin: 'Yaşıl',      arabic: 'یاشیل',      phonetic: 'ya·şıl',
    en: 'Green',     de: 'Grün',      fa: 'سبز',
  },
  {
    latin: 'Sarı',       arabic: 'ساری',       phonetic: 'sa·rı',
    en: 'Yellow',    de: 'Gelb',      fa: 'زرد',
  },
  {
    latin: 'Qara',       arabic: 'قارا',       phonetic: 'qa·ra',
    en: 'Black',     de: 'Schwarz',   fa: 'سیاه',
  },
  {
    latin: 'Ağ',         arabic: 'آغ',         phonetic: 'ağ',
    en: 'White',     de: 'Weiß',      fa: 'سفید',
  },
  {
    latin: 'Qəhvəyi',    arabic: 'قهوه‌ای',    phonetic: 'qəh·və·yi',
    en: 'Brown',     de: 'Braun',     fa: 'قهوه‌ای',
  },
  {
    latin: 'Narıncı',    arabic: 'نارینجی',    phonetic: 'na·rın·cı',
    en: 'Orange',    de: 'Orange',    fa: 'نارنجی',
  },
  {
    latin: 'Bənövşəyi',  arabic: 'بنفشه‌ای',   phonetic: 'bə·növ·şə·yi',
    en: 'Purple',    de: 'Lila',      fa: 'بنفش',
  },
  {
    latin: 'Çəhrayı',    arabic: 'چهرایی',     phonetic: 'çəh·ra·yı',
    en: 'Pink',      de: 'Rosa',      fa: 'صورتی',
  },
]

// ─── Daily Phrases ─────────────────────────────────────────────────────────

const daily: Phrase[] = [
  {
    latin: 'Haradadır?',      arabic: 'هارادادیر؟',   phonetic: 'ha·ra·da·dır',
    en: 'Where is it?',      de: 'Wo ist es?',        fa: 'کجاست؟',
  },
  {
    latin: 'Neçəyə?',         arabic: 'نئچه‌یه؟',      phonetic: 'ne·çə·yə',
    en: 'How much?',         de: 'Wie viel?',          fa: 'چقدر؟',
  },
  {
    latin: 'Başa düşmürəm',   arabic: 'باشا دوشمورم',  phonetic: 'ba·şa düş·mü·rəm',
    en: "I don't understand", de: 'Ich verstehe nicht', fa: 'نمی‌فهمم',
  },
  {
    latin: 'Su',              arabic: 'سو',             phonetic: 'su',
    en: 'Water',             de: 'Wasser',             fa: 'آب',
  },
  {
    latin: 'Yemək',           arabic: 'یئمک',           phonetic: 'ye·mək',
    en: 'Food',              de: 'Essen',              fa: 'غذا',
  },
  {
    latin: 'Kömək edin!',     arabic: 'کؤمک ائدین!',   phonetic: 'kö·mək e·din',
    en: 'Help!',             de: 'Hilfe!',             fa: 'کمک!',
  },
  {
    latin: 'Yaxşı',           arabic: 'یاخشی',          phonetic: 'yax·şı',
    en: 'Good',              de: 'Gut',                fa: 'خوب',
  },
  {
    latin: 'Pis',             arabic: 'پیس',            phonetic: 'pis',
    en: 'Bad',               de: 'Schlecht',           fa: 'بد',
  },
  {
    latin: 'Böyük',           arabic: 'بویوک',          phonetic: 'bö·yük',
    en: 'Big',               de: 'Groß',               fa: 'بزرگ',
  },
  {
    latin: 'Kiçik',           arabic: 'کیچیک',          phonetic: 'ki·çik',
    en: 'Small',             de: 'Klein',              fa: 'کوچک',
  },
  {
    latin: 'Bu gün',          arabic: 'بو گون',         phonetic: 'bu gün',
    en: 'Today',             de: 'Heute',              fa: 'امروز',
  },
  {
    latin: 'Sabah',           arabic: 'صاباح',          phonetic: 'sa·bah',
    en: 'Tomorrow',          de: 'Morgen',             fa: 'فردا',
  },
]

// ─── Exported categories ───────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  { id: 'greetings', label: 'Greetings',      icon: '👋', phrases: greetings },
  { id: 'numbers',   label: 'Numbers',        icon: '🔢', phrases: numbers   },
  { id: 'animals',   label: 'Animals',        icon: '🐑', phrases: animals   },
  { id: 'family',    label: 'Family',         icon: '👨‍👩‍👧', phrases: family    },
  { id: 'colors',    label: 'Colors',         icon: '🎨', phrases: colors    },
  { id: 'daily',     label: 'Daily Phrases',  icon: '💬', phrases: daily     },
]

/** Flat list of every phrase with its category label attached — used for search. */
export const ALL_PHRASES: (Phrase & { categoryId: string; categoryLabel: string })[] =
  CATEGORIES.flatMap((cat) =>
    cat.phrases.map((p) => ({ ...p, categoryId: cat.id, categoryLabel: cat.label }))
  )
