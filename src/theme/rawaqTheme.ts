/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  رواق | Rawaq — Premium Trend Shorts Series
 *  Phase 0 · Core Design System Theme
 *  "stories of big ideas & major transformations" — Dark Academia × Vox Editorial
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Single source of truth for every color token, RTL Arabic typography rule,
 * motion-physics curve and layering convention used across the channel.
 * Import from here — never hard-code hex values inside components.
 */

import type {CSSProperties} from 'react';
import {Easing, type SpringConfig} from 'remotion';

/* ─────────────────────────────────────────────────────────────
   1 · COLOR TOKENS
   ───────────────────────────────────────────────────────────── */
export const rawaqColors = {
  /** أسود فحمي عميق — the cinematic canvas */
  backgroundPrimary: '#0A0B0E',
  /** كحلي ليلي داكن — raised surfaces, cards, panels */
  backgroundSecondary: '#14171F',
  /** طبقة أرفع للبطاقات الزجاجية */
  backgroundRaised: '#1B1F2A',
  /** ذهبي عتيق — الأفكار والتحولات الكبرى */
  accentGold: '#D4AF37',
  accentGoldBright: '#F0D878',
  accentGoldDim: '#8A7223',
  accentGoldSoft: 'rgba(212,175,55,0.35)',
  lineGold: 'rgba(212,175,55,0.28)',
  lineGoldStrong: 'rgba(212,175,55,0.55)',
  /** ورق البردي / المخطوطات — النصوص الأساسية */
  parchment: '#F2ECE1',
  parchmentDim: 'rgba(242,236,225,0.66)',
  parchmentFaint: 'rgba(242,236,225,0.38)',
  /** أحمر قاني — الحروب ونقاط الانكسار التاريخي */
  crimsonAlert: '#8B1E1E',
  crimsonBright: '#C0392B',
  crimsonGlow: 'rgba(192,57,43,0.55)',
  /** حبر الغُمرة */
  ink: '#05060A',
  /** زجاج معتم للبطاقات فوق المشاهد */
  glassDark: 'rgba(16,19,27,0.78)',
  glassBorder: 'rgba(212,175,55,0.22)',
  /** تدرجات */
  vignetteCore: 'rgba(10,11,14,0)',
  vignetteEdge: 'rgba(5,6,10,0.92)',
} as const;

export const rawaqGradients = {
  /** تدرج الذهب الرئيسي للنصوص والشعارات */
  goldText:
    'linear-gradient(160deg, #F5E7B2 0%, #D4AF37 38%, #9A7B24 68%, #E8CE8A 100%)',
  goldFill:
    'linear-gradient(180deg, #F0D878 0%, #D4AF37 45%, #8A7223 100%)',
  goldBar:
    'linear-gradient(90deg, rgba(212,175,55,0) 0%, #D4AF37 12%, #F5E7B2 50%, #D4AF37 88%, rgba(212,175,55,0) 100%)',
  altFutureGlow:
    'linear-gradient(155deg, rgba(64,201,192,0.35) 0%, rgba(212,175,55,0.28) 55%, rgba(120,80,255,0.22) 100%)',
  sepiaVeil:
    'linear-gradient(180deg, rgba(58,42,18,0.55) 0%, rgba(43,32,20,0.65) 100%)',
  manuscriptPaper:
    'repeating-linear-gradient(0deg, rgba(242,236,225,0.028) 0 2px, transparent 2px 46px), radial-gradient(1200px 700px at 50% 20%, rgba(212,175,55,0.08), transparent 70%), #14171F',
  mapParchment:
    'radial-gradient(1000px 620px at 46% 42%, #1A2030 0%, #131824 52%, #0C0F17 100%)',
} as const;

/* ─────────────────────────────────────────────────────────────
   2 · RTL ARABIC TYPOGRAPHY
   Direction, shaping & ligatures are handled centrally so
   Arabic script never breaks or renders disjointed.
   ───────────────────────────────────────────────────────────── */
export const rawaqFonts = {
  /** العناوين والاقتباسات التاريخية (حرف ديواني/نسخ أصيل) */
  display: `'Aref Ruqaa', 'Amiri', 'Noto Naskh Arabic', serif`,
  /** بديل قرآني رصين للاقتباسات الطويلة */
  quote: `'Amiri', 'Noto Naskh Arabic', serif`,
  /** البيانات والموشن جرافيكس العصري */
  data: `'IBM Plex Sans Arabic', 'Cairo', 'Noto Kufi Arabic', sans-serif`,
  /** التسميات الصغيرة والأزرار والشارات */
  label: `'Cairo', 'IBM Plex Sans Arabic', sans-serif`,
  /** أرقام السنوات العملاقة في الخلفية */
  ghost: `'Cairo', 'IBM Plex Sans Arabic', sans-serif`,
} as const;

/** ضعه على أي حاوية عربية — يضبط الاتجاه والربط والتشكيل */
export const rtlBaseStyle: CSSProperties = {
  direction: 'rtl',
  textAlign: 'right',
  fontFamily: rawaqFonts.data,
  // يُبقي الحروف العربية متّصلة ويفعّل العلّمات والربط التقليدي
  fontFeatureSettings: '"liga" 1, "calt" 1, "mark" 1, "mkmk" 1, "kern" 1',
  fontKerning: 'normal',
  textRendering: 'optimizeLegibility',
  WebkitFontSmoothing: 'antialiased',
  unicodeBidi: 'plaintext',
};

/** أسلوب الأرقام العربية المشرقية عام 1258 م */
export const formatYearArabic = (year: number): string =>
  `${new Intl.NumberFormat('ar-EG', {useGrouping: false}).format(
    year,
  )} م`;

/* ─────────────────────────────────────────────────────────────
   3 · ANIMATION PHYSICS — لا حركة خطية في عالم رواق
   ───────────────────────────────────────────────────────────── */
export const rawaqSprings: Record<string, SpringConfig> = {
  /** القياسي: الدخول الرئيس للمكونات — ثقيل، واثق، سينمائي */
  standard: {damping: 18, stiffness: 90, mass: 1, overshootClamping: false},
  /** أكثر نعومة للكاميرا واللقطات الواسعة */
  gentle: {damping: 26, stiffness: 60, mass: 1.4, overshootClamping: false},
  /** للعناصر الصغيرة: نقاط، شارات، أدوات */
  snappy: {damping: 14, stiffness: 170, mass: 0.7, overshootClamping: false},
  /** ظهور المواد الورقية الثقيلة / الأختام */
  heavy: {damping: 22, stiffness: 70, mass: 1.8, overshootClamping: false},
};

/** منحنيات بيزير سينمائية — بدل linear تماماً */
export const rawaqEasing = {
  /** المنحنى الرئيسي: خروج ناعم بسرعة عالية ثم استقرار بطيء (easeOutExpo-like) */
  out: Easing.bezier(0.22, 1, 0.36, 1),
  /** دخول ناعم مع بداية متدرجة */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** انطلاق هادئ جداً ثم قوة — للضربات الدرامية (الانكسارات) */
  dramatic: Easing.bezier(0.16, 1, 0.3, 1),
  /** توقف سريع بعد ارتداد طفيف — للأرقام والعدّادات */
  settle: Easing.bezier(0.34, 1.56, 0.64, 1),
} as const;

/* ─────────────────────────────────────────────────────────────
   4 · LAYOUT, LAYERS & SAFE AREA
   ───────────────────────────────────────────────────────────── */
export const rawaqLayout = {
  /** 1080p master canvas */
  width: 1920,
  height: 1080,
  /** هامش الأمان للنصوص والشارات */
  safeArea: 96,
  /** مواضع الطبقات */
  z: {
    scene: 0,
    content: 10,
    grain: 40,
    vignette: 50,
    letterbox: 60,
    watermark: 70,
    hud: 80,
  },
  /** حبيبات الفيلم + الحواف */
  grainOpacity: 0.06,
  vignetteOpacity: 0.9,
  watermarkOpacity: 0.75,
} as const;

/** مدد انتقالية قياسية (بالفريمات @60fps) */
export const rawaqTiming = {
  /** وميض كتابة الحرف الواحد في التايبوغرفي */
  typewriterCharFrames: 1.6,
  /** تلاشي ظهور لوحة */
  panelFadeFrames: 24,
  /** رسم الإطار الذهبي */
  frameDrawFrames: 90,
  /** نبضة حلقات المدن */
  pulsePeriodFrames: 90,
} as const;

/* ─────────────────────────────────────────────────────────────
   5 · SEEDED RANDOM — جزيئات وحبيبات حتمية (render-safe)
   ───────────────────────────────────────────────────────────── */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
