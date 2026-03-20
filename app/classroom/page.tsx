'use client'

import { useState, useMemo, useCallback } from 'react'
import ChatDemo, { SamplePhrase } from '../../components/ChatDemo'

interface ClassroomPhrase {
  qashqai: string
  en: string
  fa: string
  tr: string
  latin?: string
  category: Category
}

type Category = 'greetings' | 'family' | 'nature' | 'daily' | 'numbers'
type QuizMode = 'flashcard' | 'multiple-choice'

interface QuizState {
  active: boolean
  mode: QuizMode
  currentIndex: number
  score: number
  total: number
  showAnswer: boolean
  selectedAnswer: string | null
  options: string[]
  finished: boolean
}

const CATEGORY_META: Record<Category, { label: string; labelFa: string; icon: string }> = {
  greetings: { label: 'Greetings',       labelFa: 'سلام و احوالپرسی',  icon: '👋' },
  family:    { label: 'Family',           labelFa: 'خانواده',           icon: '👨‍👩‍👧‍👦' },
  nature:    { label: 'Nature & Animals', labelFa: 'طبیعت و حیوانات',   icon: '🌿' },
  daily:     { label: 'Daily Life',       labelFa: 'زندگی روزمره',     icon: '☀️' },
  numbers:   { label: 'Numbers',          labelFa: 'اعداد',            icon: '🔢' },
}

const ALL_CATEGORIES: Category[] = ['greetings', 'family', 'nature', 'daily', 'numbers']

const CLASSROOM_PHRASES: ClassroomPhrase[] = [
  { category: 'greetings', qashqai: 'سلام',                     en: 'Hello',                       fa: 'سلام',                    tr: 'Merhaba',           latin: 'Salam' },
  { category: 'greetings', qashqai: 'سن نئجه‌سین؟',              en: 'How are you?',                fa: 'حال شما چطور است؟',       tr: 'Nasılsın?',         latin: 'Sen nejesen?' },
  { category: 'greetings', qashqai: 'یاخشیام، ممنون',            en: 'I am fine, thank you',        fa: 'خوبم، ممنون',              tr: 'İyiyim, teşekkürler', latin: 'Yaxşıyam, memnun' },
  { category: 'greetings', qashqai: 'خوش گلدین!',               en: 'Welcome!',                    fa: 'خوش آمدی!',               tr: 'Hoş geldin!',       latin: 'Xoş geldin!' },
  { category: 'greetings', qashqai: 'ساغ اول!',                 en: 'Goodbye!',                    fa: 'خداحافظ!',                tr: 'Hoşça kal!',        latin: 'Sağ ol!' },
  { category: 'greetings', qashqai: 'ممنون',                     en: 'Thank you',                   fa: 'ممنون',                   tr: 'Teşekkürler',      latin: 'Memnun' },
  { category: 'family', qashqai: 'آتا',                         en: 'Father',                      fa: 'پدر',                     tr: 'Baba',              latin: 'Ata' },
  { category: 'family', qashqai: 'آنا',                         en: 'Mother',                      fa: 'مادر',                    tr: 'Anne',              latin: 'Ana' },
  { category: 'family', qashqai: 'قارداش',                      en: 'Brother',                     fa: 'برادر',                   tr: 'Kardeş',            latin: 'Qardaş' },
  { category: 'family', qashqai: 'باجی',                        en: 'Sister',                      fa: 'خواهر',                   tr: 'Kız kardeş',        latin: 'Bacı' },
  { category: 'family', qashqai: 'بالا',                        en: 'Child',                       fa: 'بچه',                     tr: 'Çocuk',             latin: 'Bala' },
  { category: 'family', qashqai: 'باباقالان',                    en: 'Grandfather',                 fa: 'پدربزرگ',                 tr: 'Dede',              latin: 'Babaqalan' },
  { category: 'nature', qashqai: 'قویون',                       en: 'Sheep',                       fa: 'گوسفند',                  tr: 'Koyun',             latin: 'Qoyun' },
  { category: 'nature', qashqai: 'آت',                          en: 'Horse',                       fa: 'اسب',                     tr: 'At',                latin: 'At' },
  { category: 'nature', qashqai: 'ایت',                         en: 'Dog',                         fa: 'سگ',                      tr: 'Köpek',             latin: 'İt' },
  { category: 'nature', qashqai: 'سو',                          en: 'Water',                       fa: 'آب',                      tr: 'Su',                latin: 'Su' },
  { category: 'nature', qashqai: 'داغ',                         en: 'Mountain',                    fa: 'کوه',                     tr: 'Dağ',               latin: 'Dağ' },
  { category: 'nature', qashqai: 'گون',                         en: 'Sun / Day',                   fa: 'خورشید / روز',            tr: 'Güneş / Gün',       latin: 'Gün' },
  { category: 'daily', qashqai: 'گئدیریم',                      en: 'I am going',                  fa: 'دارم می‌روم',              tr: 'Gidiyorum',         latin: 'Gedirim' },
  { category: 'daily', qashqai: 'بو نه‌دیر؟',                   en: 'What is this?',               fa: 'این چیست؟',               tr: 'Bu nedir?',         latin: 'Bu nedir?' },
  { category: 'daily', qashqai: 'من قاشقایام',                  en: 'I am Qashqai',                fa: 'من قشقایی هستم',          tr: 'Ben Kaşkayım',      latin: 'Men Qaşqayam' },
  { category: 'daily', qashqai: 'بو دیل بیزیم دیلیمیز',         en: 'This language is ours',       fa: 'این زبان، زبان ماست',     tr: 'Bu dil bizim dilimiz', latin: 'Bu dil bizim dilimiz' },
  { category: 'daily', qashqai: 'چۆرک',                         en: 'Bread',                       fa: 'نان',                     tr: 'Ekmek',             latin: 'Çörek' },
  { category: 'daily', qashqai: 'اِو',                          en: 'House / Home',                fa: 'خانه',                    tr: 'Ev',                latin: 'Ev' },
  { category: 'numbers', qashqai: 'بیر',                        en: 'One (1)',                     fa: 'یک',                      tr: 'Bir',               latin: 'Bir' },
  { category: 'numbers', qashqai: 'ایکی',                       en: 'Two (2)',                     fa: 'دو',                      tr: 'İki',               latin: 'İki' },
  { category: 'numbers', qashqai: 'اوچ',                        en: 'Three (3)',                   fa: 'سه',                      tr: 'Üç',                latin: 'Üç' },
  { category: 'numbers', qashqai: 'دؤرد',                       en: 'Four (4)',                    fa: 'چهار',                    tr: 'Dört',              latin: 'Dörd' },
  { category: 'numbers', qashqai: 'بئش',                        en: 'Five (5)',                    fa: 'پنج',                     tr: 'Beş',               latin: 'Beş' },
  { category: 'numbers', qashqai: 'اون',                        en: 'Ten (10)',                    fa: 'ده',                      tr: 'On',                latin: 'On' },
function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'tr-TR'
  utter.rate = 0.85
  utter.pitch = 1.0
  window.speechSynthesis.speak(utter)
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateOptions(correctPhrase: ClassroomPhrase, allPhrases: ClassroomPhrase[]): string[] {
  const others = allPhrases.filter(p => p.en !== correctPhrase.en)
  const distractors = shuffleArray(others).slice(0, 3).map(p => p.en)
  return shuffleArray([correctPhrase.en, ...distractors])
}

export default function ClassroomPage() {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [quiz, setQuiz] = useState<QuizState>({
    active: false,
    mode: 'flashcard',
    currentIndex: 0,
    score: 0,
    total: 0,
    showAnswer: false,
    selectedAnswer: null,
    options: [],
    finished: false,
  })

  const filteredPhrases = useMemo(() =>
    activeCategory === 'all'
      ? CLASSROOM_PHRASES
      : CLASSROOM_PHRASES.filter(p => p.category === activeCategory),
    [activeCategory]
  )

  const [quizPhrases, setQuizPhrases] = useState<ClassroomPhrase[]>([])

  const chatPhrases: SamplePhrase[] = useMemo(() =>
    filteredPhrases.map(p => ({
      language: 'qashqai' as const,
      text: p.qashqai,
      label: Qashqai: ${p.en},
    })),
    [filteredPhrases]
  )

  const startQuiz = useCallback((mode: QuizMode) => {
    const phrases = shuffleArray(filteredPhrases)
    setQuizPhrases(phrases)
    const firstOptions = mode === 'multiple-choice'
      ? generateOptions(phrases[0], CLASSROOM_PHRASES)
      : []
    setQuiz({
      active: true,
      mode,
      currentIndex: 0,
      score: 0,
      total: phrases.length,
      showAnswer: false,
      selectedAnswer: null,
      options: firstOptions,
      finished: false,
    })
  }, [filteredPhrases])

  const nextQuestion = useCallback(() => {
    const nextIdx = quiz.currentIndex + 1
    if (nextIdx >= quizPhrases.length) {
      setQuiz(prev => ({ ...prev, finished: true }))
      return
    }
    const nextOptions = quiz.mode === 'multiple-choice'
      ? generateOptions(quizPhrases[nextIdx], CLASSROOM_PHRASES)
      : []
    setQuiz(prev => ({
      ...prev,
      currentIndex: nextIdx,
      showAnswer: false,
      selectedAnswer: null,
      options: nextOptions,
    }))
  }, [quiz.currentIndex, quiz.mode, quizPhrases])

  const handleMCAnswer = useCallback((answer: string) => {
    if (quiz.selectedAnswer) return
    const correct = quizPhrases[quiz.currentIndex].en
    setQuiz(prev => ({
      ...prev,
      selectedAnswer: answer,
      showAnswer: true,
      score: answer === correct ? prev.score + 1 : prev.score,
    }))
  }, [quiz.selectedAnswer, quiz.currentIndex, quizPhrases])

  const exitQuiz = useCallback(() => {
    setQuiz(prev => ({ ...prev, active: false, finished: false }))
  }, [])return (
    <>
      <a href="#classroom-chat" className="skip-link">Skip to chat practice</a>

      <header className="site-header">
        <div className="container">
          <a href="/" className="site-logo" aria-label="QashqAI Voice home">Qashq<span>AI</span> Voice</a>
          <nav className="site-nav" aria-label="Main navigation">
            <a href="/classroom" className="site-nav__link" aria-current="page">Classroom</a>
          </nav>
          <span className="site-badge">v0.4.0 · prototype</span>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" aria-labelledby="classroom-heading">
          <div className="container">
            <a href="/" className="back-link" aria-label="Back to home">← Home</a>
            <h1 id="classroom-heading" style={{ marginTop: 'var(--space-4)' }}>
              Qashqai Classroom <em style={{ fontSize: '0.6em', verticalAlign: 'middle' }}>Beta</em>
            </h1>
          </div>
        </section>

        <section className="section" aria-labelledby="intro-heading">
          <div className="container">
            <p className="section-label">About this page</p>
            <h2 id="intro-heading" className="sr-only">Introduction</h2>
            <div role="note" className="beta-notice">
              <span className="beta-notice__icon" aria-hidden="true">ⓘ</span>
              <span>This is an early-stage demo. Phrase translations are illustrative and may not yet reflect community-validated Qashqai orthography.</span>
            </div>
            <div className="classroom-intro">
              <div className="classroom-intro__block">
                <p className="classroom-intro__lang">English</p>
                <p className="classroom-intro__text">Welcome to the QashqAI Classroom — an interactive space for exploring the Qashqai language. Browse phrases by category, listen to pronunciation, test yourself with quizzes, and practise with the AI chat pipeline.</p>
              </div>
              <div className="classroom-intro__block" dir="rtl" lang="fa">
                <p className="classroom-intro__lang" style={{ textAlign: 'right' }}>فارسی</p>
                <p className="classroom-intro__text" dir="rtl">به کلاس درس QashqAI خوش آمدید — فضایی تعاملی برای یادگیری زبان قشقایی. عبارات را بر اساس دسته‌بندی مرور کنید، به تلفظ گوش دهید، خودتان را با آزمون بسنجید و با هوش مصنوعی تمرین کنید.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="category-heading">
          <div className="container">
            <p className="section-label">Categories</p>
            <h2 id="category-heading">Browse by topic</h2>
            <div className="category-tabs" role="tablist" aria-label="Phrase categories">
              <button role="tab" className={category-tab${activeCategory === 'all' ? ' category-tab--active' : ''}} aria-selected={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>📚 All ({CLASSROOM_PHRASES.length})</button>
              {ALL_CATEGORIES.map(cat => {
                const meta = CATEGORY_META[cat]
                const count = CLASSROOM_PHRASES.filter(p => p.category === cat).length
                return (
                  <button key={cat} role="tab" className={category-tab${activeCategory === cat ? ' category-tab--active' : ''}} aria-selected={activeCategory === cat} onClick={() => setActiveCategory(cat)}>{meta.icon} {meta.label} ({count})</button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="phrases-heading">
          <div className="container">
            <p className="section-label">Vocabulary</p>
            <h2 id="phrases-heading">{activeCategory === 'all' ? All phrases (${filteredPhrases.length}) : ${CATEGORY_META[activeCategory].icon} ${CATEGORY_META[activeCategory].label} — ${CATEGORY_META[activeCategory].labelFa}}</h2>
            <div className="phrase-cards" role="list">
              {filteredPhrases.map((phrase) => (
                <article key={phrase.qashqai} className="phrase-card" role="listitem" aria-label={Qashqai phrase: ${phrase.en}}>
                  <div className="phrase-card__header">
                    <p className="phrase-card__qashqai" lang="az" dir="rtl">{phrase.qashqai}</p>
                    <button className="speak-btn" onClick={() => speak(phrase.latin || phrase.tr)} aria-label={Listen to: ${phrase.en}} title="Listen to pronunciation">🔊</button>
                  </div>
                  {phrase.latin && <p className="phrase-card__latin">{phrase.latin}</p>}
                  <div className="phrase-card__translations">
                    <div className="phrase-card_row"><span className="phrase-cardlang-tag" aria-label="English">EN</span><span className="phrase-card_translation" lang="en">{phrase.en}</span></div>
                    <div className="phrase-card_row"><span className="phrase-cardlang-tag" aria-label="Persian">FA</span><span className="phrase-card_translation" lang="fa" dir="rtl">{phrase.fa}</span></div>
                    <div className="phrase-card_row"><span className="phrase-cardlang-tag" aria-label="Turkish">TR</span><span className="phrase-card_translation" lang="tr">{phrase.tr}</span></div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="quiz-heading">
          <div className="container">
            <p className="section-label">Practice</p>
            <h2 id="quiz-heading">Test yourself</h2>
            {!quiz.active ? (
              <div className="quiz-start">
                <p className="quiz-start__desc">Test your knowledge of {activeCategory === 'all' ? 'all' : CATEGORY_META[activeCategory].label} phrases. Choose a mode:</p>
                <div className="quiz-start__buttons">
                  <button className="btn-quiz" onClick={() => startQuiz('flashcard')}>🃏 Flashcards</button>
                  <button className="btn-quiz" onClick={() => startQuiz('multiple-choice')}>✅ Multiple Choice</button>
                </div>
              </div>
            ) : quiz.finished ? (
              <div className="quiz-result">
                <p className="quiz-result__score">{quiz.mode === 'flashcard' ? '🃏' : '✅'} Quiz Complete!</p>
                {quiz.mode === 'multiple-choice' && (
                  <p className="quiz-result__detail">Score: {quiz.score} / {quiz.total}{quiz.score === quiz.total && ' — Perfect! 🎉'}{quiz.score >= quiz.total * 0.7 && quiz.score < quiz.total && ' — Great job! 👏'}{quiz.score < quiz.total * 0.7 && ' — Keep practising! 💪'}</p>
                )}
                <div className="quiz-start__buttons">
                  <button className="btn-quiz" onClick={() => startQuiz(quiz.mode)}>🔄 Try Again</button>
                  <button className="btn-quiz btn-quiz--secondary" onClick={exitQuiz}>← Back</button>
                </div>
              </div>
            ) : quiz.mode === 'flashcard' ? (
              <div className="quiz-card">
                <p className="quiz-progress">{quiz.currentIndex + 1} / {quiz.total}</p>
                <div className="flashcard" onClick={() => setQuiz(prev => ({ ...prev, showAnswer: !prev.showAnswer }))}>
                  {!quiz.showAnswer ? (
                    <>
                      <p className="flashcard__qashqai" dir="rtl" lang="az">{quizPhrases[quiz.currentIndex].qashqai}</p>
                      <button className="speak-btn speak-btn--lg" onClick={(e) => { e.stopPropagation(); speak(quizPhrases[quiz.currentIndex].latin || quizPhrases[quiz.currentIndex].tr) }} aria-label="Listen">🔊</button>
                      <p className="flashcard__hint">Tap to reveal answer</p>
                    </>
                  ) : (
                    <>
                      <p className="flashcard__answer">{quizPhrases[quiz.currentIndex].en}</p>
                      <p className="flashcard__answer-fa" dir="rtl" lang="fa">{quizPhrases[quiz.currentIndex].fa}</p>
                      <p className="flashcard__answer-tr" lang="tr">{quizPhrases[quiz.currentIndex].tr}</p>
                      {quizPhrases[quiz.currentIndex].latin && <p className="flashcard__latin">{quizPhrases[quiz.currentIndex].latin}</p>}
                    </>
                  )}
                </div>
                <div className="quiz-nav">
                  <button className="btn-quiz btn-quiz--secondary" onClick={exitQuiz}>✕ Exit</button>
                  <button className="btn-quiz" onClick={nextQuestion}>Next →</button>
                </div>
              </div>
            ) : (
              <div className="quiz-card">
                <p className="quiz-progress">{quiz.currentIndex + 1} / {quiz.total} · Score: {quiz.score}</p>
                <div className="mc-question">
                  <p className="mc-question__qashqai" dir="rtl" lang="az">{quizPhrases[quiz.currentIndex].qashqai}</p>
                  <button className="speak-btn speak-btn--lg" onClick={() => speak(quizPhrases[quiz.currentIndex].latin || quizPhrases[quiz.currentIndex].tr)} aria-label="Listen">🔊</button>
                  <p className="mc-question__prompt">What does this mean in English?</p>
                </div>
                <div className="mc-options">
                  {quiz.options.map(opt => {
                    const correct = quizPhrases[quiz.currentIndex].en
                    let cls