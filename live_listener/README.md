# QashqAI Live Listener

**زبان‌شناسی میدانی با حفظ کامل حریم خصوصی**
**Privacy-first live speech analysis for Qashqai language fieldwork**

---

## درباره این ابزار / About

این ابزار برای جلسات میدانی با پدر — گوینده بومی لایه ۴ گویش داره‌شوری قشقایی — طراحی شده است.

This tool is designed for fieldwork sessions with the primary native speaker (Layer 4 cultural validator) of the Darreh-Shuri Qashqai dialect.

**چه می‌کند / What it does:**

- صدای پدر را از میکروفون دریافت می‌کند (بخش‌های ۲۰ ثانیه‌ای)
- رونویسی زنده از طریق OpenAI Whisper (فقط در حافظه)
- تحلیل زبانی فارسی از طریق Claude
- خروجی JSON در ترمینال چاپ می‌کند

- Captures speech in 20-second chunks from the microphone
- Live transcription via OpenAI Whisper (in-memory only)
- Persian linguistic analysis via Claude
- Prints JSON output to terminal

---

## ⚠️ اعلامیه رضایت / Consent Notice

> **این ابزار بدون رضایت صریح پدر نباید استفاده شود.**
>
> قبل از هر جلسه، مراحل کامل پروتکل رضایت را دنبال کنید:
> [`docs/CONSENT_PROTOCOL.md`](docs/CONSENT_PROTOCOL.md)

> **This tool must not be used without the speaker's explicit consent.**
>
> Follow the full consent protocol before every session:
> [`docs/CONSENT_PROTOCOL.md`](docs/CONSENT_PROTOCOL.md)

این ابزار پروتکل رضایت اجتماعی QashqAI Voice نسخه ۱.۰ را اجرا می‌کند.
This tool implements the QashqAI Voice Community Consent Framework v1.0.

---

## تضمین‌های حریم خصوصی / Privacy Guarantees

| تضمین | جزئیات |
|---|---|
| هیچ فایل صوتی ذخیره نمی‌شود | هرگز — نه موقت، نه دائم |
| صدا فقط در حافظه موجود است | فقط برای مدت کوتاهی که برای رونویسی لازم است |
| بافر متن حداکثر ۳ بخش | ~۶۰ ثانیه، در حافظه |
| پاک‌سازی در خروج | بافر متن در Ctrl+C یا خطا پاک می‌شود |

| Guarantee | Detail |
|---|---|
| No audio file ever saved | Not temporary, not permanent |
| Audio exists in memory only | For the minimum time required for transcription |
| Rolling transcript buffer | Max 3 chunks (~60 seconds), in memory |
| Buffer cleared on exit | Wiped on Ctrl+C or any error |

---

## موارد استفاده / Use Case

**کار میدانی با پدر — گوینده بومی لایه ۴**

پدر به عنوان اعتبارسنج فرهنگی لایه ۴ در پروژه QashqAI Voice نقش اصلی را دارد.
این ابزار امکان ثبت و تحلیل گفتار طبیعی او را در محیط راحت — بدون نگرانی از ذخیره صدا — فراهم می‌کند.

**Fieldwork with father — Layer 4 cultural validator**

As the primary Layer 4 cultural validator for the QashqAI Voice project, the speaker's natural speech is the source of truth for Darreh-Shuri Qashqai. This tool enables real-time linguistic documentation in a comfortable environment, with the explicit assurance that no audio is ever recorded to disk.

---

## نصب / Installation

```bash
# 1. Clone the repo (if not already)
git clone https://github.com/sifollahaslani/qashqai-voice-platform.git
cd qashqai-voice-platform/live_listener

# 2. Create and activate a virtual environment (recommended)
python -m venv .venv
.venv\Scripts\activate          # Windows PowerShell

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
copy .env.example .env
# Open .env and fill in OPENAI_API_KEY and ANTHROPIC_API_KEY
```

---

## پیکربندی / Configuration

فایل `.env.example` را به `.env` کپی کرده و مقادیر را پر کنید:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-opus-4-7
```

---

## اجرا / Running

```bash
# From the live_listener/ directory
python src/live_listener.py
```

The tool will:
1. Validate environment variables
2. Display the consent gate (Persian)
3. Ask for explicit confirmation before any audio is captured
4. Begin recording in 20-second chunks
5. Print JSON analysis after each chunk

**توقف / Stop:** `Ctrl+C` — buffer is cleared, no data persisted.

---

## نمونه خروجی / Example Output

```json
{
  "qashqai_text": "بیزیم ائلیمیز قشلاقدا قالاردی",
  "persian_translation": "ایل ما در قشلاق می‌ماند",
  "key_vocabulary": [
    {
      "word": "ائل",
      "meaning": "ایل، قبیله",
      "confidence": "Verified"
    },
    {
      "word": "قشلاق",
      "meaning": "زمستان‌گاه، محل زمستانی",
      "confidence": "Verified"
    }
  ],
  "linguistic_note": "ساختار فعلی «قالاردی» صیغه گذشته استمراری قشقایی — معادل «می‌ماند» در فارسی",
  "topic": "کوچ فصلی و زندگی عشایری",
  "emotional_tone": "خاطره‌گو"
}
```

---

## وابستگی‌ها / Dependencies

| Package | Purpose |
|---|---|
| `sounddevice` | Microphone capture (Windows-compatible) |
| `numpy` | Audio frame handling |
| `openai` | Whisper STT via in-memory BytesIO |
| `anthropic` | Claude linguistic analysis |
| `python-dotenv` | Environment variable loading |

Python 3.11+ required.

---

## معماری / Architecture

```
[sounddevice — mic]
  └─ 20-second numpy array (memory only)
       └─ stdlib wave → io.BytesIO (memory only)
            └─ OpenAI Whisper API (in-memory POST)
                 └─ transcript text
                      └─ deque(maxlen=3) rolling buffer
                           └─ Claude API → JSON analysis
                                └─ terminal output
                                     └─ [audio del'd, buffer cleared on exit]
```

---

## پروژه / Project

**QashqAI Voice** — حفظ گویش قشقایی داره‌شوری از طریق هوش مصنوعی اخلاق‌محور

Preserving the endangered Darreh-Shuri Qashqai dialect through ethical, community-centred AI.

- 1,500,000 Qashqai people
- Zero digital NLP resources before this project
- Language disappearing within 2 generations

Founded by Siefollah Aslani — Bremen, Germany
