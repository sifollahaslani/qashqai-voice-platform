/**
 * SystemStatus.jsx — Public status component for QashqAI Voice.
 *
 * Renders component-level state for the platform without exposing
 * upstream vendor identity. Multilingual: Persian, German, English, Qashqai.
 *
 * See: docs/AI_INFRASTRUCTURE.md and OPS_PLAYBOOK.md
 */
"use client";

import { useEffect, useState } from "react";

// Resolve the status endpoint safely across environments:
// - In Next.js production builds, process.env.NEXT_PUBLIC_API_BASE is
//   inlined at build time by the bundler.
// - In standalone preview / Artifact runtimes, `process` is undefined,
//   so we fall back to a relative path that works behind the same origin.
// - Consumers can also override via the `apiBase` prop (see component).
function resolveStatusEndpoint(apiBaseProp) {
  if (apiBaseProp) return `${apiBaseProp}/status`;
  if (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_BASE) {
    return `${process.env.NEXT_PUBLIC_API_BASE}/status`;
  }
  return "/api/status";
}

// ---------------------------------------------------------------------------
// i18n labels
// ---------------------------------------------------------------------------

const LABELS = {
  en: {
    title: "QashqAI Voice — System Status",
    components: {
      frontend: "Frontend",
      backend: "Backend",
      database: "Database",
      ai_pipeline: "AI Pipeline",
      submission_safety: "Submission Safety",
      human_review_queue: "Human Review Queue",
    },
    states: {
      operational: "Operational",
      degraded: "Degraded",
      unavailable: "Unavailable",
      active: "Active",
      available: "Available",
      unknown: "Unknown",
      not_checked: "Not checked",
      pending: "Pending",
      checking: "Checking…",
    },
    last_updated: "Last updated",
    transparency_link: "About our AI infrastructure",
    error: "Status unavailable",
    fallback_notice: "Live status could not be reached. Showing best available information.",
  },
  de: {
    title: "QashqAI Voice — Systemstatus",
    components: {
      frontend: "Frontend",
      backend: "Backend",
      database: "Datenbank",
      ai_pipeline: "KI-Pipeline",
      submission_safety: "Beitragssicherheit",
      human_review_queue: "Menschliche Prüfung",
    },
    states: {
      operational: "Betriebsbereit",
      degraded: "Beeinträchtigt",
      unavailable: "Nicht verfügbar",
      active: "Aktiv",
      available: "Verfügbar",
      unknown: "Unbekannt",
      not_checked: "Nicht geprüft",
      pending: "Ausstehend",
      checking: "Wird geprüft…",
    },
    last_updated: "Zuletzt aktualisiert",
    transparency_link: "Über unsere KI-Infrastruktur",
    error: "Status nicht erreichbar",
    fallback_notice: "Live-Status nicht erreichbar. Anzeige der besten verfügbaren Informationen.",
  },
  fa: {
    title: "وضعیت سامانه‌ی صدای قشقایی",
    components: {
      frontend: "رابط کاربری",
      backend: "سرویس پشتیبان",
      database: "پایگاه داده",
      ai_pipeline: "خط پردازش هوش مصنوعی",
      submission_safety: "ایمنی مشارکت",
      human_review_queue: "صف بازبینی انسانی",
    },
    states: {
      operational: "فعال",
      degraded: "محدود",
      unavailable: "در دسترس نیست",
      active: "فعال",
      available: "در دسترس",
      unknown: "نامشخص",
      not_checked: "بررسی نشده",
      pending: "در انتظار",
      checking: "…در حال بررسی",
    },
    last_updated: "آخرین به‌روزرسانی",
    transparency_link: "درباره‌ی زیرساخت هوش مصنوعی ما",
    error: "وضعیت در دسترس نیست",
    fallback_notice: "وضعیت زنده در دسترس نیست. بهترین اطلاعات موجود نمایش داده می‌شود.",
  },
  qsh: {
    // NOTE: Qashqai labels are PROVISIONAL — must be validated by Layer 4
    // (father) before public deployment. Until validated, set locale fallback
    // to "fa" in the consuming page.
    title: "صدای قشقایی — سیستم دوروم",
    components: {
      frontend: "اوزوگ",
      backend: "بکاند",
      database: "ویریلر",
      ai_pipeline: "آغیلی ماشین یولو",
      submission_safety: "گؤندرمک امنیتی",
      human_review_queue: "آدام باخیشی صفی",
    },
    states: {
      operational: "ایشله‌ییر",
      degraded: "آز ایشله‌ییر",
      unavailable: "ایشله‌میر",
      active: "ایشله‌ییر",
      available: "وار",
      unknown: "بیلینمیر",
      not_checked: "باخیلمادی",
      pending: "گؤزله‌ییر",
      checking: "…باخیلیر",
    },
    last_updated: "صون یئنیله‌مه",
    transparency_link: "بیزیم آغیلی ماشین حاقدا",
    error: "دوروم یوخدور",
    fallback_notice: "جانلی دوروم یوخدور. ان یاخشی بیلگی گؤستریلیر.",
  },
};

// ---------------------------------------------------------------------------
// Style — Warm Terracotta palette (matches London pitch deck)
// ---------------------------------------------------------------------------

const COLORS = {
  bg: "#FAF6F1",
  surface: "#FFFFFF",
  text: "#3A2618",
  textMuted: "#7A6A5C",
  border: "#E8DDD0",
  operational: "#5A7D52",
  degraded: "#C28840",
  unavailable: "#A04E3F",
  accent: "#8B3A2F",
};

const STATE_COLOR = {
  operational: COLORS.operational,
  active: COLORS.operational,
  available: COLORS.operational,
  degraded: COLORS.degraded,
  unavailable: COLORS.unavailable,
  unknown: COLORS.textMuted,
  not_checked: COLORS.textMuted,
  pending: COLORS.degraded,
  checking: COLORS.textMuted,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso, locale) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const localeMap = { en: "en-GB", de: "de-DE", fa: "fa-IR", qsh: "fa-IR" };
    return d.toLocaleString(localeMap[locale] || "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// Default initial state — shown while the first fetch is in flight.
// Frontend is "operational" by definition: if this component is rendering,
// the frontend is reachable. All other components are "checking" until proven.
const INITIAL_STATUS = {
  frontend: "operational",
  backend: "checking",
  database: "checking",
  ai_pipeline: "checking",
  submission_safety: "checking",
  human_review_queue: "checking",
  last_updated: null,
  incident_active: false,
  incident_message: null,
};

// Fallback state — shown when the status endpoint cannot be reached.
// Speakers see structured information rather than a single error string:
// they can tell that the frontend works but the backend is unreachable,
// which is itself useful operational information.
const OFFLINE_FALLBACK = {
  frontend: "operational",
  backend: "unavailable",
  database: "unknown",
  ai_pipeline: "not_checked",
  submission_safety: "pending",
  human_review_queue: "unknown",
  last_updated: null,
  incident_active: true,
  incident_message: null,
};

export default function SystemStatus({ locale = "en", apiBase = null }) {
  const [status, setStatus] = useState(INITIAL_STATUS);
  const [isLive, setIsLive] = useState(true);

  const t = LABELS[locale] || LABELS.en;
  const isRtl = locale === "fa" || locale === "qsh";
  const statusEndpoint = resolveStatusEndpoint(apiBase);

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch(statusEndpoint, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setStatus(data);
          setIsLive(true);
        }
      } catch {
        if (!cancelled) {
          setStatus(OFFLINE_FALLBACK);
          setIsLive(false);
        }
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [statusEndpoint]);

  const containerStyle = {
    ...styles.container,
    direction: isRtl ? "rtl" : "ltr",
    fontFamily: isRtl
      ? "'Vazirmatn', 'Noto Sans Arabic', system-ui, sans-serif"
      : "'Inter', system-ui, -apple-system, sans-serif",
  };

  const componentKeys = [
    "frontend",
    "backend",
    "database",
    "ai_pipeline",
    "submission_safety",
    "human_review_queue",
  ];

  return (
    <div style={containerStyle}>
      <h2 style={styles.title}>{t.title}</h2>

      {!isLive && (
        <div style={styles.fallbackBanner}>{t.fallback_notice}</div>
      )}

      {isLive && status.incident_active && status.incident_message && (
        <div style={styles.incidentBanner}>{status.incident_message}</div>
      )}

      <div style={styles.grid}>
        {componentKeys.map((key) => {
          const state = status[key];
          const color = STATE_COLOR[state] || COLORS.textMuted;
          return (
            <div key={key} style={styles.row}>
              <span style={styles.componentLabel}>{t.components[key]}</span>
              <span style={{ ...styles.stateLabel, color }}>
                <span style={{ ...styles.dot, backgroundColor: color }} />
                {t.states[state] || state}
              </span>
            </div>
          );
        })}
      </div>

      <div style={styles.footer}>
        <span style={styles.mutedText}>
          {status.last_updated
            ? `${t.last_updated}: ${formatDate(status.last_updated, locale)}`
            : ""}
        </span>
        <a href="/ai-infrastructure" style={styles.link}>
          {t.transparency_link}
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = {
  container: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "32px 28px",
    backgroundColor: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    color: COLORS.text,
    boxShadow: "0 1px 3px rgba(58, 38, 24, 0.04)",
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    marginTop: 0,
    marginBottom: 24,
    color: COLORS.accent,
    letterSpacing: "-0.01em",
  },
  incidentBanner: {
    padding: "12px 16px",
    marginBottom: 20,
    backgroundColor: "#FBF0E6",
    border: `1px solid ${COLORS.degraded}`,
    borderRadius: 8,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 1.5,
  },
  fallbackBanner: {
    padding: "10px 14px",
    marginBottom: 20,
    backgroundColor: "#F4EEE6",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 1.5,
    fontStyle: "italic",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: `1px solid ${COLORS.border}`,
    fontSize: 15,
  },
  componentLabel: {
    color: COLORS.text,
    fontWeight: 500,
  },
  stateLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 500,
    fontSize: 14,
  },
  dot: {
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 16,
    borderTop: `1px solid ${COLORS.border}`,
    fontSize: 13,
    flexWrap: "wrap",
    gap: 12,
  },
  mutedText: {
    color: COLORS.textMuted,
  },
  link: {
    color: COLORS.accent,
    textDecoration: "none",
    fontWeight: 500,
  },
  errorText: {
    color: COLORS.unavailable,
    fontSize: 14,
    margin: 0,
  },
};
