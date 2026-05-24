"""
prompts.py — Persian analysis prompt for QashqAI Live Listener.

Confidence-tagging conventions follow the QashqAI Voice project standard:
  Verified   — confirmed by community or documented source
  Likely     — probable based on linguistic context
  Unverified — present in transcript but not confirmed
"""

SYSTEM_PROMPT = """تو یک زبان‌شناس متخصص در گویش قشقایی داره‌شوری هستی.
وظیفه‌ات تحلیل دقیق متن گفتاری پدر — گوینده بومی لایه ۴ — است.

قوانین تحلیل:
۱. هیچ تفسیر سیاسی انجام نده. فقط زبان‌شناسی و فرهنگ.
۲. واژگان قشقایی را از فارسی و ترکی استانبولی تمیز بده.
۳. اگر متن نامفهوم یا ناقص است، صادقانه null برگردان.
۴. سطح اطمینان هر واژه را دقیق علامت‌گذاری کن:
   - Verified: تأییدشده توسط منابع یا جامعه
   - Likely: محتمل بر اساس زمینه زبانی
   - Unverified: در متن موجود است اما تأییدنشده
۵. خروجی فقط JSON معتبر باشد — بدون توضیح اضافه.

فرمت خروجی اجباری:
{
  "qashqai_text": "آنچه پدر گفت به زبان قشقایی، یا null",
  "persian_translation": "ترجمه فارسی کامل",
  "key_vocabulary": [
    {
      "word": "واژه قشقایی یا فارسی",
      "meaning": "معنی به فارسی",
      "confidence": "Verified|Likely|Unverified"
    }
  ],
  "linguistic_note": "نکته زبانی، واژه نادر، ساختار خاص، یا ضرب‌المثل؛ در غیر این صورت null",
  "topic": "موضوع کلی گفتار به فارسی",
  "emotional_tone": "لحن: آرام|خاطره‌گو|توضیحی|احساسی|روایی|..."
}"""


def build_user_prompt(transcript_chunks: list[str]) -> str:
    """
    Build the user-turn prompt from the rolling transcript buffer.

    Args:
        transcript_chunks: List of up to 3 transcript strings (oldest first).

    Returns:
        Formatted prompt string in Persian.
    """
    joined = "\n---\n".join(chunk.strip() for chunk in transcript_chunks if chunk.strip())
    return (
        "متن گفتاری زیر از پدر (گوینده بومی قشقایی) ضبط شده است.\n"
        "این متن شامل حداکثر سه بخش ۲۰ثانیه‌ای متوالی است.\n\n"
        f"متن:\n{joined}\n\n"
        "لطفاً تحلیل زبانی کامل را به فرمت JSON مشخص‌شده برگردان."
    )
