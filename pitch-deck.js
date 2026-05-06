/**
 * QashqAI Voice — Pitch Deck Generator
 * Generates pitch-deck-london-2026-v2.pptx
 *
 * Slide order:
 *  1  Title
 *  2  The Problem
 *  3  Our Solution
 *  4  Three-Agent Pipeline
 *  5  Classroom v0.4.0
 *  6  Ethical Framework
 *  7  Academic Recognition
 *  7a Why Multilingual AI Isn't Yet Multilingual  ← NEW
 *  7b Digital Justice by Design                  ← NEW
 *  8  Content Strategy
 *  9  Built with Claude
 *  10 Traction & Milestones
 *  11 The Ask
 *  12 Why Now                                     ← RESTORED
 *  13 Let's Preserve Together
 */

const PptxGenJS = require("pptxgenjs");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.33" x 7.5"

// ─── PALETTE ────────────────────────────────────────────────────────────────
const C = {
  darkBrown:   "2C1810",   // bg dark slides
  cream:       "FFF8F0",   // bg light slides
  terracotta:  "D2691E",   // accent bar / border
  terraDark:   "8B4513",   // bold numbers
  terraLight:  "CD853F",   // subtitle / footer
  sand:        "F5E6D3",   // light text on dark
  warmGray:    "8B7355",   // body text
  green:       "1A6B5A",   // accent (traction checks)
  white:       "FFFFFF",
  titleDark:   "2C1810",   // heading on light bg
  titleLight:  "FFF8F0",   // heading on dark bg
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
const EMU = 914400; // 1 inch in EMUs

/** Convert EMU (python-pptx units) to inches */
function e(v) { return v / EMU; }

/** Add a filled rectangle */
function rect(slide, x, y, w, h, fill) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: fill },
    line: { type: "none" },
  });
}

/** Footer strip on every content slide */
function footer(slide, bgDark = false) {
  rect(slide, 0, 6.82, 13.33, 0.47, bgDark ? "3D2318" : C.darkBrown);
  slide.addText("QashqAI Voice  |  qashqaivoice.com", {
    x: 0, y: 6.82, w: 13.33, h: 0.47,
    align: "center", valign: "middle",
    fontSize: 9, fontFace: "Calibri", color: C.terraLight,
  });
}

/** Left accent bar (vertical stripe) for light slides */
function leftBar(slide, color = C.terracotta) {
  rect(slide, 0, 0, 0.08, 7.5, color);
}

/** Slide heading */
function heading(slide, text, darkBg = false) {
  slide.addText(text, {
    x: 0.6, y: 0.3, w: 12, h: 0.7,
    fontSize: 36, fontFace: "Georgia", bold: true,
    color: darkBg ? C.titleLight : C.titleDark,
  });
}

/** Subheading line under main heading */
function subheading(slide, text) {
  slide.addText(text, {
    x: 0.6, y: 1.0, w: 12, h: 0.3,
    fontSize: 13, fontFace: "Calibri",
    color: C.terraLight,
  });
}

/** Bullet-point card (white box with terracotta top bar) */
function card(slide, x, y, w, h, title, body, accentColor = C.terracotta) {
  rect(slide, x, y, w, h, C.white);
  rect(slide, x, y, w, 0.06, accentColor);
  slide.addText(title, {
    x: x + 0.15, y: y + 0.12, w: w - 0.3, h: 0.38,
    fontSize: 14, fontFace: "Georgia", bold: true, color: C.titleDark,
  });
  slide.addText(body, {
    x: x + 0.15, y: y + 0.52, w: w - 0.3, h: h - 0.62,
    fontSize: 11, fontFace: "Calibri", color: C.warmGray,
    wrap: true, valign: "top",
  });
}

/** Dark card for dark-bg slides */
function darkCard(slide, x, y, w, h, title, body, num) {
  rect(slide, x, y, w, h, "3D2318");
  // number badge
  rect(slide, x + 0.15, y + 0.15, 0.42, 0.42, C.terracotta);
  slide.addText(String(num), {
    x: x + 0.15, y: y + 0.15, w: 0.42, h: 0.42,
    fontSize: 18, fontFace: "Georgia", bold: true, color: C.darkBrown,
    align: "center", valign: "middle",
  });
  slide.addText(title, {
    x: x + 0.7, y: y + 0.15, w: w - 0.85, h: 0.42,
    fontSize: 14, fontFace: "Georgia", bold: true, color: C.titleLight,
    valign: "middle",
  });
  slide.addText(body, {
    x: x + 0.15, y: y + 0.68, w: w - 0.3, h: h - 0.78,
    fontSize: 11, fontFace: "Calibri", color: C.sand,
    wrap: true, valign: "top",
  });
}

/** Stat box (white card with big number) */
function statBox(slide, x, y, w, h, stat, label, accentColor = C.terraDark) {
  rect(slide, x, y, w, h, C.white);
  rect(slide, x, y, w, 0.06, accentColor);
  slide.addText(stat, {
    x, y: y + 0.15, w, h: 0.8,
    fontSize: 40, fontFace: "Georgia", bold: true,
    color: accentColor, align: "center",
  });
  slide.addText(label, {
    x: x + 0.1, y: y + 1.0, w: w - 0.2, h: h - 1.1,
    fontSize: 12, fontFace: "Calibri", color: C.warmGray,
    align: "center", wrap: true,
  });
}

/** Bullet list for new slides */
function bulletList(slide, x, y, w, items, bulletColor = C.terracotta) {
  items.forEach((item, i) => {
    const iy = y + i * 0.55;
    // bullet dot
    rect(slide, x, iy + 0.17, 0.12, 0.12, bulletColor);
    slide.addText(item, {
      x: x + 0.22, y: iy, w: w - 0.22, h: 0.5,
      fontSize: 13, fontFace: "Calibri", color: C.titleDark,
      valign: "middle",
    });
  });
}

/** Pipeline agent box */
function agentBox(slide, x, y, num, title, lines) {
  const w = 3.2, h = 2.5;
  rect(slide, x, y, w, h, C.cream);
  rect(slide, x, y, w, 0.06, C.terracotta);
  // circle badge
  slide.addShape(pptx.ShapeType.ellipse, {
    x: x + w / 2 - 0.3, y: y + 0.1, w: 0.6, h: 0.6,
    fill: { color: C.terracotta }, line: { type: "none" },
  });
  slide.addText(String(num), {
    x: x + w / 2 - 0.3, y: y + 0.1, w: 0.6, h: 0.6,
    fontSize: 20, fontFace: "Georgia", bold: true,
    color: C.white, align: "center", valign: "middle",
  });
  slide.addText(title, {
    x: x + 0.15, y: y + 0.8, w: w - 0.3, h: 0.55,
    fontSize: 15, fontFace: "Georgia", bold: true,
    color: C.titleDark, align: "center",
  });
  slide.addText(lines.join("\n"), {
    x: x + 0.15, y: y + 1.4, w: w - 0.3, h: h - 1.5,
    fontSize: 11, fontFace: "Calibri", color: C.warmGray,
    wrap: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 1 — TITLE
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  rect(s, 0, 0, 13.33, 7.5, C.darkBrown);
  // top accent bar
  rect(s, 0, 0, 13.33, 0.08, C.terracotta);
  // logo placeholder circle
  slide_circle(s, 6.67, 1.4, 0.75);

  s.addText("QashqAI Voice", {
    x: 0.5, y: 2.3, w: 12.33, h: 0.9,
    fontSize: 44, fontFace: "Georgia", bold: true,
    color: C.cream, align: "center",
  });
  s.addText("Ethical AI for Endangered Language Preservation", {
    x: 1, y: 3.15, w: 11.33, h: 0.55,
    fontSize: 18, fontFace: "Calibri", color: C.terraLight, align: "center",
  });
  // divider
  rect(s, 3.5, 3.85, 6.33, 0.03, C.terracotta);
  s.addText("Siefollah Aslani  |  Founder & Director", {
    x: 1, y: 4.05, w: 11.33, h: 0.4,
    fontSize: 14, fontFace: "Calibri", color: C.sand, align: "center",
  });
  s.addText("Code with Claude London  |  May 19, 2026", {
    x: 1, y: 4.45, w: 11.33, h: 0.35,
    fontSize: 12, fontFace: "Calibri", color: C.warmGray, align: "center",
  });
}

function slide_circle(s, cx, cy, r) {
  s.addShape(pptx.ShapeType.ellipse, {
    x: cx - r, y: cy - r, w: r * 2, h: r * 2,
    fill: { color: C.terracotta }, line: { type: "none" },
  });
  s.addText("Q", {
    x: cx - r, y: cy - r, w: r * 2, h: r * 2,
    fontSize: 28, fontFace: "Georgia", bold: true,
    color: C.cream, align: "center", valign: "middle",
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 2 — THE PROBLEM
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  rect(s, 0, 0, 13.33, 7.5, C.cream);
  leftBar(s);
  heading(s, "The Problem");

  statBox(s, 0.7, 1.4, 2.7, 2.2, "7,000", "Languages spoken\nworldwide today");
  statBox(s, 3.8, 1.4, 2.7, 2.2, "50%", "Will disappear\nby 2100");
  statBox(s, 6.9, 1.4, 2.7, 2.2, "1", "Darreh-Shuri Qashqai\ndialect at risk", C.green);

  s.addText(
    "Every language lost is a library burned — a unique worldview silenced forever.",
    {
      x: 0.7, y: 3.9, w: 11.5, h: 0.5,
      fontSize: 13, fontFace: "Calibri", color: C.terraDark,
      align: "center", italic: true,
    }
  );
  s.addText(
    "Qashqai: spoken by 1.5M+ nomadic people in Iran — no keyboard standard, no spell checker,\nno Wikipedia, and zero representation in any AI training corpus.",
    {
      x: 0.7, y: 4.55, w: 11.5, h: 0.8,
      fontSize: 12, fontFace: "Calibri", color: C.warmGray, align: "center",
    }
  );
  footer(s);
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 3 — OUR SOLUTION
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  rect(s, 0, 0, 13.33, 7.5, C.cream);
  leftBar(s, C.green);
  heading(s, "Our Solution");

  s.addText(
    "QashqAI Voice is a multilingual cultural-technology platform that uses ethical AI to digitally preserve the Darreh-Shuri Qashqai language — with community consent, cultural data sovereignty, and transparent documentation.",
    {
      x: 0.7, y: 1.1, w: 11.5, h: 0.9,
      fontSize: 14, fontFace: "Calibri", color: C.titleDark,
    }
  );

  card(s, 0.7,  2.3, 2.85, 1.15, "AI-Powered Pipeline",    "Three-agent system for language detection, cultural validation, and reasoning");
  card(s, 3.75, 2.3, 2.85, 1.15, "Interactive Classroom",   "4-language learning with Web Speech API pronunciation");
  card(s, 6.8,  2.3, 2.85, 1.15, "Ethical by Design",       "Community Consent Framework, non-extractive data policy");
  card(s, 9.85, 2.3, 2.85, 1.15, "Open & Replicable",       "A global model for any endangered language community");

  footer(s);
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 4 — THREE-AGENT PIPELINE
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  rect(s, 0, 0, 13.33, 7.5, C.cream);
  leftBar(s);
  heading(s, "Three-Agent Pipeline");
  subheading(s, "Built with FastAPI + Next.js  |  Powered by Claude API");

  agentBox(s, 0.7,  1.6, 1, "Language\nDetector",  [
    "Identifies Qashqai text",
    "Distinguishes from Turkish,",
    "Azerbaijani, and Persian",
    "Heuristic Unicode analysis",
  ]);

  // arrow
  s.addText("▶", {
    x: 4.05, y: 2.65, w: 0.5, h: 0.5,
    fontSize: 22, color: C.terracotta, align: "center",
  });

  agentBox(s, 4.6,  1.6, 2, "Cultural\nGuardian",  [
    "Validates cultural accuracy",
    "Ensures respectful representation",
    "of Qashqai heritage",
    "Mandatory consent gate",
  ]);

  s.addText("▶", {
    x: 7.95, y: 2.65, w: 0.5, h: 0.5,
    fontSize: 22, color: C.terracotta, align: "center",
  });

  agentBox(s, 8.5,  1.6, 3, "Reasoning\nAgent",   [
    "Processes queries with",
    "full cultural context",
    "Claude Opus 4.6 with",
    "adaptive thinking",
  ]);

  footer(s);
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 5 — CLASSROOM v0.4.0
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  rect(s, 0, 0, 13.33, 7.5, C.cream);
  leftBar(s);
  heading(s, "Classroom v0.4.0");

  card(s, 0.7,  1.5, 2.85, 1.3, "4-Language Support",  "Persian, Qashqai/Turkish, German, English — seamless switching");
  card(s, 3.75, 1.5, 2.85, 1.3, "Web Speech API",       "Real-time pronunciation with tr-TR voice engine");
  card(s, 6.8,  1.5, 2.85, 1.3, "100+ Vocabulary Items","Curated Qashqai words with cultural context");
  card(s, 9.85, 1.5, 2.85, 1.3, "Interactive Learning", "Audio playback, visual cards, category browsing");

  // Screenshot area placeholder
  rect(s, 0.7, 3.1, 11.5, 3.3, "EDE0D4");
  s.addText("[ Live Classroom Demo ]", {
    x: 0.7, y: 3.1, w: 11.5, h: 3.3,
    fontSize: 18, fontFace: "Georgia", color: C.warmGray,
    align: "center", valign: "middle",
  });

  footer(s);
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 6 — ETHICAL FRAMEWORK
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  rect(s, 0, 0, 13.33, 7.5, C.darkBrown);
  leftBar(s, C.terracotta);
  heading(s, "Ethical Framework", true);
  subheading(s, "What sets QashqAI Voice apart");

  const etItems = [
    ["Community Consent Framework v1.0", "No data collection without explicit, informed community approval"],
    ["Cultural Data Sovereignty",         "The Qashqai community owns their linguistic and cultural data"],
    ["Non-Extractive Policy",             "AI serves the community — never the other way around"],
    ["Transparent Documentation",         "Open-source, auditable processes via GitHub and CLAUDE.md"],
  ];

  etItems.forEach(([title, body], i) => {
    const x = i < 2 ? 0.7 : 7.0;
    const y = i % 2 === 0 ? 1.55 : 3.3;
    const w = 5.9, h = 1.5;
    rect(s, x, y, w, h, "3D2318");
    rect(s, x, y, w, 0.06, C.terracotta);
    s.addText(title, {
      x: x + 0.2, y: y + 0.15, w: w - 0.4, h: 0.42,
      fontSize: 13, fontFace: "Georgia", bold: true, color: C.titleLight,
    });
    s.addText(body, {
      x: x + 0.2, y: y + 0.6, w: w - 0.4, h: 0.8,
      fontSize: 11, fontFace: "Calibri", color: C.sand, wrap: true,
    });
  });

  footer(s, true);
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 7 — ACADEMIC RECOGNITION
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  rect(s, 0, 0, 13.33, 7.5, C.cream);
  leftBar(s);
  heading(s, "Academic Recognition");

  const acItems = [
    { color: C.green,     title: "LDA 2026 Berlin",        body: "Abstract accepted\nID: sciencesconf.org:lda2026:713903" },
    { color: C.terraDark, title: "UNESCO-Level Article",   body: "Academic article in Persian on ethical AI for language preservation" },
    { color: C.terraDark, title: "Medium & Substack",      body: "Regular publications on cultural AI and language rights" },
  ];

  acItems.forEach(({ color, title, body }, i) => {
    const x = 0.7 + i * 4.2;
    rect(s, x, 1.5, 3.9, 4.5, C.white);
    rect(s, x, 1.5, 3.9, 0.06, color);
    s.addText(title, {
      x: x + 0.2, y: 1.65, w: 3.5, h: 0.55,
      fontSize: 16, fontFace: "Georgia", bold: true, color,
    });
    s.addText(body, {
      x: x + 0.2, y: 2.35, w: 3.5, h: 1.5,
      fontSize: 12, fontFace: "Calibri", color: C.warmGray, wrap: true,
    });
  });

  footer(s);
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 7a — WHY MULTILINGUAL AI ISN'T YET MULTILINGUAL  ← NEW
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  rect(s, 0, 0, 13.33, 7.5, C.cream);
  leftBar(s, C.terracotta);
  heading(s, "Why Multilingual AI Isn\u2019t Yet Multilingual");
  subheading(s, "The gap between linguistic interface and infrastructural access");

  // ── Section header (centered, above columns) ─────────────────────────────
  s.addText("Two gaps define the current state of multilingual AI:", {
    x: 0.5, y: 1.38, w: 12.33, h: 0.35,
    fontSize: 13, fontFace: "Calibri", bold: true, color: C.titleDark,
    align: "center",
  });

  // ── Column layout constants ──────────────────────────────────────────────
  const LX = 0.5,  LW = 5.9;   // left col: x=0.5, width=5.9"
  const RX = 6.98, RW = 5.95;  // right col: x=6.98, width=5.95"
  const HDR_Y   = 1.82;         // column header top
  const ITEM_Y0 = 2.28;         // first item top
  const ITEM_H  = 0.82;         // height per item slot

  // ── Left column header ───────────────────────────────────────────────────
  rect(s, LX, HDR_Y, LW, 0.06, C.terracotta);
  s.addText("The Linguistic Gap", {
    x: LX, y: HDR_Y + 0.08, w: LW, h: 0.30,
    fontSize: 13, fontFace: "Georgia", bold: true, color: C.titleDark,
    align: "center", valign: "top",
  });

  // ── Right column header ──────────────────────────────────────────────────
  rect(s, RX, HDR_Y, RW, 0.06, C.terracotta);
  s.addText("The Infrastructure Gap", {
    x: RX, y: HDR_Y + 0.08, w: RW, h: 0.30,
    fontSize: 13, fontFace: "Georgia", bold: true, color: C.titleDark,
    align: "center", valign: "top",
  });

  // ── Left column items (bold lead-in + one sentence each) ─────────────────
  const leftItems = [
    [
      "Tokenization bias",
      "Mainstream tokenizers fragment low-resource languages into inefficient sub-word units, raising compute costs and degrading output quality.",
    ],
    [
      "Performance degradation",
      "Model accuracy drops measurably for under-represented languages and dialects, even when nominally \u201csupported.\u201d",
    ],
    [
      "Dialect collapse",
      "Regional varieties are absorbed under standardized national forms \u2014 erasing the linguistic diversity AI claims to serve.",
    ],
  ];

  leftItems.forEach(([lead, sentence], i) => {
    const y = ITEM_Y0 + i * ITEM_H;
    if (i > 0) rect(s, LX, y - 0.05, LW, 0.012, "E8D5C0");
    s.addText(
      [
        { text: lead,             options: { bold: true,  color: C.titleDark } },
        { text: "\n" + sentence,  options: { bold: false, color: C.warmGray  } },
      ],
      {
        x: LX + 0.15, y, w: LW - 0.15, h: ITEM_H - 0.05,
        fontSize: 11, fontFace: "Calibri", valign: "top", wrap: true,
      }
    );
  });

  // ── Right column items (bold lead-in + one sentence each) ────────────────
  const rightItems = [
    [
      "Compute concentration",
      "Training and inference capacity is concentrated in a small number of global regions and providers.",
    ],
    [
      "API dependency",
      "Communities without institutional access depend on commercial endpoints they cannot audit, govern, or guarantee.",
    ],
    [
      "Cloud centralization",
      "Cultural data flows through infrastructure shaped by jurisdictions and incentives external to the communities it represents.",
    ],
    [
      "Continuity risk",
      "Outages, pricing shifts, or policy changes can disconnect a language community from the tools it has come to rely on.",
    ],
  ];

  rightItems.forEach(([lead, sentence], i) => {
    const y = ITEM_Y0 + i * ITEM_H;
    if (i > 0) rect(s, RX, y - 0.05, RW, 0.012, "E8D5C0");
    s.addText(
      [
        { text: lead,             options: { bold: true,  color: C.titleDark } },
        { text: "\n" + sentence,  options: { bold: false, color: C.warmGray  } },
      ],
      {
        x: RX + 0.15, y, w: RW - 0.15, h: ITEM_H - 0.05,
        fontSize: 11, fontFace: "Calibri", valign: "top", wrap: true,
      }
    );
  });

  // ── Bottom keyline (centered, Warm Terracotta, larger weight) ────────────
  // Positioned below the 4 right-column items (the taller column)
  const KL_Y = ITEM_Y0 + 4 * ITEM_H + 0.10;
  s.addText(
    "AI can be multilingual in interface, while remaining unequal in infrastructure.",
    {
      x: 0.5, y: KL_Y, w: 12.33, h: 0.45,
      fontSize: 15, fontFace: "Georgia", bold: true,
      color: C.terracotta, align: "center", valign: "middle",
    }
  );

  // ── Footer line (small, neutral) ─────────────────────────────────────────
  s.addText(
    "Aligned with UNESCO Recommendation on the Ethics of AI (2021) and EU AI Act provisions on linguistic and cultural inclusion.",
    {
      x: 0.5, y: KL_Y + 0.52, w: 12.33, h: 0.28,
      fontSize: 9, fontFace: "Calibri", color: C.warmGray,
      align: "center", valign: "middle",
    }
  );

  footer(s);
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 7b — DIGITAL JUSTICE BY DESIGN  ← NEW
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  rect(s, 0, 0, 13.33, 7.5, C.darkBrown);
  leftBar(s, C.terracotta);
  heading(s, "Digital Justice by Design", true);
  subheading(s, "Principles that make QashqAI Voice a replicable model");

  const principles = [
    {
      num: 1,
      title: "Community Consent Before Data",
      body:  "Shell hooks block the entire pipeline if speaker consent is unconfirmed — it's not a setting, it's an architecture constraint",
    },
    {
      num: 2,
      title: "Cultural Data Sovereignty",
      body:  "Non-extractive model: the Qashqai community owns their linguistic heritage. Data stays local unless community approves export",
    },
    {
      num: 3,
      title: "Transparent AI Documentation",
      body:  "Every agent decision is logged. CLAUDE.md, open-source GitHub, and the 3-agent pipeline are auditable by anyone",
    },
    {
      num: 4,
      title: "UNESCO Faro Convention & EU AI Act",
      body:  "Aligned with Faro Convention on cultural heritage rights and EU AI Act transparency requirements for high-risk applications",
    },
    {
      num: 5,
      title: "Replicable for Any Endangered Language",
      body:  "Swap detection rules + system prompts → works for Zazaki, Luri, Balochi, Uyghur, Aromanian, Sami — any community, any language",
    },
  ];

  principles.forEach(({ num, title, body }, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i < 3 ? i : i - 3;
    const x = col === 0 ? 0.7 : 7.1;
    const y = 1.5 + row * 1.55;
    const w = col === 0 ? 6.0 : 5.8;
    const h = 1.35;

    rect(s, x, y, w, h, "3D2318");
    // number badge
    rect(s, x + 0.15, y + 0.15, 0.45, 0.45, C.terracotta);
    s.addText(String(num), {
      x: x + 0.15, y: y + 0.15, w: 0.45, h: 0.45,
      fontSize: 16, fontFace: "Georgia", bold: true, color: C.darkBrown,
      align: "center", valign: "middle",
    });
    s.addText(title, {
      x: x + 0.75, y: y + 0.13, w: w - 0.9, h: 0.42,
      fontSize: 12, fontFace: "Georgia", bold: true, color: C.titleLight,
      valign: "middle",
    });
    s.addText(body, {
      x: x + 0.15, y: y + 0.65, w: w - 0.3, h: 0.6,
      fontSize: 10, fontFace: "Calibri", color: C.sand, wrap: true,
    });
  });

  footer(s, true);
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 8 — CONTENT STRATEGY
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  rect(s, 0, 0, 13.33, 7.5, C.cream);
  leftBar(s, C.green);
  heading(s, "Content Strategy");

  const stats = [
    { n: "2",  label: "Posts\nper Day" },
    { n: "4",  label: "Languages\nPersian, Qashqai,\nGerman, English" },
    { n: "3",  label: "Platforms\nLinkedIn, Instagram,\nFacebook" },
  ];

  stats.forEach(({ n, label }, i) => {
    const x = 0.7 + i * 4.1;
    statBox(s, x, 1.4, 3.7, 2.5, n, label, C.green);
  });

  rect(s, 0.7, 4.2, 11.5, 0.6, "E8F5F2");
  s.addText(
    "Strictly cultural, educational, and constructive — never political or inflammatory",
    {
      x: 0.9, y: 4.2, w: 11.1, h: 0.6,
      fontSize: 12, fontFace: "Calibri", color: C.terraDark,
      align: "center", valign: "middle", italic: true,
    }
  );

  footer(s);
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 9 — BUILT WITH CLAUDE
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  rect(s, 0, 0, 13.33, 7.5, C.darkBrown);
  leftBar(s, C.terracotta);
  heading(s, "Built with Claude", true);
  subheading(s, "Anthropic's AI powers every layer of QashqAI Voice");

  const claudeItems = [
    ["Claude API",   "Powers the three-agent pipeline — language detection, cultural validation, and reasoning"],
    ["Claude Code",  "Full-stack development — FastAPI backend, Next.js frontend, Vercel deployment"],
    ["Claude.ai",    "Content creation, strategic planning, multilingual communication, and academic writing"],
  ];

  claudeItems.forEach(([title, body], i) => {
    darkCard(s, 0.7 + i * 4.2, 1.55, 3.9, 1.9, title, body, i + 1);
  });

  footer(s, true);
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 10 — TRACTION & MILESTONES
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  rect(s, 0, 0, 13.33, 7.5, C.cream);
  leftBar(s);
  heading(s, "Traction & Milestones");

  const milestones = [
    "GitHub Release v0.4.0 — Classroom & Three-Agent Pipeline",
    "qashqaivoice.com live — custom domain via Webador Lite",
    "Auto-deploy via Vercel from GitHub",
    "LDA 2026 Berlin abstract accepted",
    "Community Consent Framework v1.0 published",
    "Children's vocabulary app (100 words) on GitHub Pages",
    "UNESCO & Deutsche UNESCO-Kommission outreach",
    "Core Strategic Operating System document finalized",
  ];

  milestones.forEach((text, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i < 4 ? i : i - 4;
    const x = col === 0 ? 0.7 : 7.1;
    const y = 1.3 + row * 1.12;

    // check badge
    rect(s, x, y + 0.08, 0.42, 0.42, C.green);
    s.addText("✓", {
      x, y: y + 0.08, w: 0.42, h: 0.42,
      fontSize: 12, fontFace: "Calibri", bold: true,
      color: C.white, align: "center", valign: "middle",
    });
    s.addText(text, {
      x: x + 0.52, y, w: 5.8, h: 0.6,
      fontSize: 11, fontFace: "Calibri", color: C.titleDark, valign: "middle",
    });
  });

  footer(s);
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 11 — THE ASK
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  rect(s, 0, 0, 13.33, 7.5, C.darkBrown);
  leftBar(s, C.terracotta);
  heading(s, "The Ask", true);

  darkCard(s, 0.7,  1.55, 3.9, 2.1, "Anthropic Humanitarian API Access",
    "Dedicated API credits for endangered language preservation research and development", 1);
  darkCard(s, 4.72, 1.55, 3.9, 2.1, "Partnership & Mentorship",
    "Collaboration with Anthropic's team to refine the pipeline and scale the model", 2);
  darkCard(s, 8.73, 1.55, 3.9, 2.1, "Global Replication",
    "Support QashqAI Voice as a replicable template for endangered language communities worldwide", 3);

  footer(s, true);
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 12 — WHY NOW
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  rect(s, 0, 0, 13.33, 7.5, C.cream);
  leftBar(s, C.terraDark);
  heading(s, "Why Now");

  const whyNow = [
    {
      icon: "2022–2032",
      color: C.green,
      title: "UNESCO Decade of Indigenous Languages",
      body:  "The international community has set a 10-year window. We are halfway through it. Every month of inaction is permanent loss.",
    },
    {
      icon: "EU 2024",
      color: C.terracotta,
      title: "EU AI Act — Transparency Window",
      body:  "The EU AI Act creates a compliance window that rewards ethical-by-design systems. QashqAI Voice is already aligned.",
    },
    {
      icon: "NOW",
      color: C.terraDark,
      title: "Elder Speakers Won't Wait",
      body:  "The Darreh-Shuri speakers who carry the language are aging. Voice recordings must begin now — there is no second chance.",
    },
    {
      icon: "2026",
      color: C.green,
      title: "Claude Can Do This — Today",
      body:  "No other model handles under-resourced languages like Claude. The technology exists. The ethical framework exists. The community exists.",
    },
  ];

  whyNow.forEach(({ icon, color, title, body }, i) => {
    const x = i < 2 ? 0.7 : 7.0;
    const y = i % 2 === 0 ? 1.5 : 3.7;
    const w = 5.9, h = 1.9;
    rect(s, x, y, w, h, C.white);
    rect(s, x, y, w, 0.06, color);
    // icon badge
    rect(s, x + 0.15, y + 0.15, 1.0, 0.45, color);
    s.addText(icon, {
      x: x + 0.15, y: y + 0.15, w: 1.0, h: 0.45,
      fontSize: 9, fontFace: "Georgia", bold: true, color: C.white,
      align: "center", valign: "middle",
    });
    s.addText(title, {
      x: x + 1.3, y: y + 0.15, w: w - 1.45, h: 0.45,
      fontSize: 13, fontFace: "Georgia", bold: true, color: C.titleDark,
      valign: "middle",
    });
    s.addText(body, {
      x: x + 0.15, y: y + 0.72, w: w - 0.3, h: 1.0,
      fontSize: 11, fontFace: "Calibri", color: C.warmGray, wrap: true,
    });
  });

  footer(s);
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 13 — LET'S PRESERVE TOGETHER
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  rect(s, 0, 0, 13.33, 7.5, C.darkBrown);
  rect(s, 0, 0, 13.33, 0.08, C.terracotta);
  rect(s, 0, 7.42, 13.33, 0.08, C.terracotta);

  s.addText("Let's Preserve Together", {
    x: 0.5, y: 1.8, w: 12.33, h: 0.85,
    fontSize: 36, fontFace: "Georgia", bold: true,
    color: C.titleLight, align: "center",
  });

  rect(s, 3.5, 2.85, 6.33, 0.03, C.terracotta);

  s.addText("Siefollah Aslani", {
    x: 0.5, y: 3.1, w: 12.33, h: 0.5,
    fontSize: 16, fontFace: "Calibri", bold: true,
    color: C.titleLight, align: "center",
  });
  s.addText("Founder & Director, QashqAI Voice", {
    x: 0.5, y: 3.6, w: 12.33, h: 0.4,
    fontSize: 12, fontFace: "Calibri", color: C.terraLight, align: "center",
  });
  s.addText("qashqaivoice.com", {
    x: 0.5, y: 4.1, w: 12.33, h: 0.4,
    fontSize: 13, fontFace: "Calibri", color: C.sand, align: "center",
  });
  s.addText("github.com/QashqAI-Voice", {
    x: 0.5, y: 4.5, w: 12.33, h: 0.4,
    fontSize: 13, fontFace: "Calibri", color: C.sand, align: "center",
  });
  s.addText("Bremen, Germany", {
    x: 0.5, y: 5.0, w: 12.33, h: 0.4,
    fontSize: 12, fontFace: "Calibri", color: C.warmGray, align: "center",
  });
}

// ─── WRITE FILE ─────────────────────────────────────────────────────────────
const OUT = "pitch-deck-london-2026-v2.pptx";
pptx.writeFile({ fileName: OUT }).then(() => {
  console.log(`\n✓  Saved: ${OUT}`);
  console.log(`   Slides: 13 original + 2 new (7a, 7b) = 15 total`);
  console.log(`   Palette: Warm Terracotta (D2691E / 2C1810 / FFF8F0)`);
});
