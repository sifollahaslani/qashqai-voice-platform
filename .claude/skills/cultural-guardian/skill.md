---
name: cultural-guardian
description: Apply Qashqai cultural sensitivity and authenticity checks to any text, transcription, or metadata in this project. Use this skill when reviewing content for cultural accuracy, assigning sensitivity tiers, or adding cultural annotations — even outside of a full pipeline run.
---

# Cultural Guardian Skill

When this skill is active, apply the following framework to all content you review or generate.

## The Qashqai cultural context

The Qashqai (قشقایی) are a Turkic-speaking nomadic confederation historically based in Fars Province, Iran. Their language is part of the Oghuz branch of the Turkic family, closely related to Azerbaijani but distinct in vocabulary, phonology, and oral tradition. It is an endangered language with an estimated 1–1.5 million speakers.

Key cultural domains to be aware of:
- **Ilāt system:** The tribal confederation structure (il, tāyefa, tire) shapes identity and naming
- **Kuch:** Seasonal migration is central to Qashqai life and features prominently in oral tradition
- **Oral literature:** Epic poetry, lullabies (laylay), proverbs (atasözü), and stories are primary vehicles of cultural knowledge
- **Material culture:** Carpet weaving, herding, and specific crafts carry embedded vocabulary
- **Religious practice:** Qashqai communities are predominantly Shia Muslim with syncretic pre-Islamic elements in some oral forms

## Sensitivity assessment checklist

Before assigning a sensitivity tier, consider:

- [ ] Does this content contain ceremonial language, prayers, or ritual speech?
- [ ] Does it name specific individuals, families, or tribal sub-groups in a context that could affect their reputation or safety?
- [ ] Does it describe internal community disputes, land rights, or political history?
- [ ] Does it contain oral literature that a speaker may regard as personal or family-held knowledge?
- [ ] Was the speaker's consent specific to this type of content and this use case?

If any box is checked, the tier should be at least 1 (community-restricted). If multiple boxes are checked or the content is ceremonial/sacred, assign tier 2 (restricted).

## Language handling principles

1. **Preserve dialect variation.** Qashqai has internal variation across tribal groups and regions. Do not normalize to a standard form unless the speaker explicitly requested it.

2. **Respect oral register.** Spoken Qashqai differs significantly from written forms. Retain the features of the spoken register — contractions, elisions, discourse markers — rather than imposing written conventions.

3. **Loanwords are part of the language.** Qashqai has absorbed Persian, Arabic, and more recently Farsi loanwords. These are features of living language use, not errors.

4. **Uncertain forms.** When a word or phrase cannot be identified with confidence, mark it `[unclear: possible X]` and note it for community review. Never guess and present the guess as fact.

## Cultural annotation format

Add a `## Cultural Notes` section to any transcription file:

```markdown
## Cultural Notes
- **Speech event type:** [storytelling / daily conversation / song / proverb / ceremony / other]
- **Cultural domain:** [oral literature / migration / pastoral life / material culture / family / other]
- **Notable language features:** [dialect markers, archaic terms, borrowed terms worth preserving]
- **Community context:** [any relevant background about the topic or tradition]
- **Review recommendation:** [approved / pending community review / hold]
```

## Ethical floor

This skill operates within the governance framework documented in `06_Data_Governance/`. That framework takes precedence over technical or research goals. When cultural protection and dataset utility conflict, cultural protection wins.
