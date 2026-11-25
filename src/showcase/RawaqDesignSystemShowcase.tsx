/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  RawaqDesignSystemShowcase · عرض نظام رواق للمكوّنات
 *  «ماذا لو لم تسقط بغداد؟» — 45 ثانية @60fps · 1080p
 * ═══════════════════════════════════════════════════════════════════════════
 */
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {RawaqMasterCanvas} from '../components/rawaq/RawaqMasterCanvas';
import {ParallaxScene} from '../components/rawaq/ParallaxScene';
import {HistoricalTimeline} from '../components/rawaq/HistoricalTimeline';
import {QuoteCard} from '../components/rawaq/QuoteCard';
import {AnimatedMapRoute} from '../components/rawaq/AnimatedMapRoute';
import {SplitScreenComparison} from '../components/rawaq/SplitScreenComparison';
import {rawaqColors, rawaqFonts, rawaqSprings, rtlBaseStyle} from '../theme/rawaqTheme';

/* ── مخطط الأزمنة (فريمات @60fps) ───────────────────────────── */
const FPS = 60;
const INTRO = {from: 0, duration: 240}; // 0–4s
const PARALLAX = {from: 240, duration: 600}; // 4–14s
const TIMELINE = {from: 840, duration: 600}; // 14–24s
const QUOTE = {from: 1440, duration: 468}; // 24–31.8s
const MAP = {from: 1908, duration: 414}; // 31.8–38.7s
const SPLIT = {from: 2322, duration: 378}; // 38.7–45s
export const SHOWCASE_DURATION = SPLIT.from + SPLIT.duration; // 2700

/* ── تلاشٍ دخول/خروج موحّد لكل مشهد ─────────────────────────── */
const FadeSection: React.FC<{children: React.ReactNode; durationInFrames: number}> = ({
  children,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 16, durationInFrames - 16, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

/* ── شريحة المكوّن الحالية أعلى الإطار ──────────────────────── */
const SECTION_TAGS: Array<{from: number; to: number; index: string; name: string}> = [
  {from: 0, to: INTRO.from + INTRO.duration, index: '٠٠', name: 'OPENING'},
  {from: PARALLAX.from, to: PARALLAX.from + PARALLAX.duration, index: '٠١', name: '<ParallaxScene />'},
  {from: TIMELINE.from, to: TIMELINE.from + TIMELINE.duration, index: '٠٢', name: '<HistoricalTimeline />'},
  {from: QUOTE.from, to: QUOTE.from + QUOTE.duration, index: '٠٣', name: '<QuoteCard />'},
  {from: MAP.from, to: MAP.from + MAP.duration, index: '٠٤', name: '<AnimatedMapRoute />'},
  {from: SPLIT.from, to: SPLIT.from + SPLIT.duration, index: '٠٥', name: '<SplitScreenComparison />'},
];

const SectionTag: React.FC = () => {
  const frame = useCurrentFrame();
  const active = SECTION_TAGS.find((s) => frame >= s.from && frame < s.to);
  if (!active) return null;
  return (
    <div
      dir="ltr"
      style={{
        position: 'absolute',
        top: 26,
        left: 44,
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontFamily: 'Cairo, sans-serif',
        fontSize: 15,
        letterSpacing: '0.18em',
        color: 'rgba(242,236,225,0.78)',
        background: 'rgba(10,11,14,0.55)',
        border: `1px solid ${rawaqColors.lineGold}`,
        borderRadius: 4,
        padding: '6px 14px',
        backdropFilter: 'blur(6px)',
      }}
    >
      <span style={{color: rawaqColors.accentGold, fontWeight: 800}}>{active.index}</span>
      <span style={{opacity: 0.5}}>|</span>
      <span dir="ltr" style={{direction: 'ltr'}}>{active.name}</span>
    </div>
  );
};

/* ══════════════ المشهد الافتتاحي — شعار واهتزاز الوعد ══════════════ */
const OpeningSlate: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const logoIn = spring({frame: frame - 4, fps, config: rawaqSprings.standard});
  const titleIn = spring({frame: frame - 26, fps, config: rawaqSprings.gentle});
  const subIn = spring({frame: frame - 52, fps, config: rawaqSprings.gentle});
  const rule = interpolate(frame, [30, 96], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        ...rtlBaseStyle,
        background: `radial-gradient(1100px 640px at 50% 42%, #14171F 0%, ${rawaqColors.backgroundPrimary} 75%)`,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* هالة ذهبية خلف الشعار */}
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 560,
          borderRadius: '50%',
          background:
            'radial-gradient(closest-side, rgba(212,175,55,0.16), transparent)',
          transform: `scale(${0.6 + logoIn * 0.6})`,
          opacity: logoIn,
        }}
      />
      <Img
        src={staticFile('assets/rawaq-logo.svg')}
        style={{
          width: 360,
          marginBottom: 30,
          transform: `scale(${interpolate(logoIn, [0, 1], [0.55, 1])}) translateY(${interpolate(logoIn, [0, 1], [-60, 0])}px)`,
          opacity: logoIn,
          filter: 'drop-shadow(0 0 34px rgba(212,175,55,0.4))',
        }}
      />
      <div
        style={{
          fontFamily: rawaqFonts.label,
          fontSize: 19,
          letterSpacing: '0.42em',
          color: rawaqColors.accentGold,
          fontWeight: 800,
          opacity: interpolate(titleIn, [0, 0.5], [0, 1], {extrapolateRight: 'clamp'}),
        }}
      >
        رواق · قصص الأفكار والتحولات الكبرى
      </div>

      {/* الخط الفاصل الذهبي */}
      <div
        style={{
          width: 620 * rule,
          height: 2.5,
          margin: '26px 0',
          background: rawaqColors.accentGold,
          boxShadow: '0 0 18px rgba(212,175,55,0.8)',
        }}
      />

      <div
        style={{
          fontFamily: rawaqFonts.display,
          fontSize: 96,
          lineHeight: 1.25,
          textAlign: 'center',
          background: 'linear-gradient(165deg, #FBF3D0 0%, #D4AF37 45%, #8A7223 75%, #E8CE8A 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          transform: `translateY(${interpolate(titleIn, [0, 1], [70, 0])}px)`,
          opacity: interpolate(titleIn, [0, 0.55], [0, 1], {extrapolateRight: 'clamp'}),
          textShadow: 'none',
        }}
      >
        ماذا لو لم تسقط بغداد؟
      </div>

      <div
        style={{
          marginTop: 22,
          fontFamily: rawaqFonts.data,
          fontSize: 25,
          color: rawaqColors.parchmentDim,
          letterSpacing: '0.04em',
          opacity: interpolate(subIn, [0, 0.6], [0, 1], {extrapolateRight: 'clamp'}),
        }}
      >
        استوديو المكوّنات — العرض الرسمي للمرحلة صفر
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════ العرض الرئيسي ═══════════════════════════ */
export const RawaqDesignSystemShowcase: React.FC = () => {
  return (
    <RawaqMasterCanvas
      hud={{show: true, left: 'رواق — استوديو المكونات', right: 'PHASE 0 · 00_SHOWCASE'}}
      letterbox={{show: false}}
    >
      {/* مؤثرات صوتية انتقالية: Whooshes + Ticks + Booms */}
      {[214, 834, 1434, 1902].map((f) => (
        <Sequence key={f} from={f} durationInFrames={70} name="whoosh">
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.55} />
        </Sequence>
      ))}
      <Sequence from={2316} durationInFrames={70} name="whoosh">
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.6} />
      </Sequence>
      {/* Ticks عند تفعيل كل حدث في شريط الزمن */}
      {[28, 160, 292, 424].map((off) => (
        <Sequence key={off} from={TIMELINE.from + off} durationInFrames={12} name="tick">
          <Audio src={staticFile('sfx/tick.wav')} volume={0.4} />
        </Sequence>
      ))}
      {/* Boom عند لحظة الانكسار (1258) */}
      <Sequence from={TIMELINE.from + 424} durationInFrames={100} name="boom">
        <Audio src={staticFile('sfx/boom.wav')} volume={0.75} />
      </Sequence>

      {/* ٠٠ — الافتتاحي */}
      <Sequence from={INTRO.from} durationInFrames={INTRO.duration}>
        <FadeSection durationInFrames={INTRO.duration}>
          <OpeningSlate />
        </FadeSection>
      </Sequence>

      {/* ٠١ — <ParallaxScene /> · لقطة 2.5D لسقوط بغداد */}
      <Sequence from={PARALLAX.from} durationInFrames={PARALLAX.duration}>
        <FadeSection durationInFrames={PARALLAX.duration}>
          <ParallaxScene
            backgroundImg={staticFile('assets/baghdad-1258.jpg')}
            cameraDirection="zoom-in"
            cameraIntensity={1.15}
            yearBadge="١٢٥٨ م"
            captionText="بغداد تحترق — وهنا بدأت أكبر عملية مسحٍ لذاكرة العالم"
          />
        </FadeSection>
      </Sequence>

      {/* ٠٢ — <HistoricalTimeline /> · من مدينة السلام إلى سقوطها */}
      <Sequence from={TIMELINE.from} durationInFrames={TIMELINE.duration}>
        <FadeSection durationInFrames={TIMELINE.duration}>
          <HistoricalTimeline
            startYear={762}
            endYear={1300}
            eventDwellFrames={132}
            events={[
              {
                year: 762,
                title: 'تأسيس بغداد — مدينة السلام، زوراء المنصور',
                thumbnailUrl: staticFile('assets/baghdad-762.jpg'),
              },
              {
                year: 830,
                title: 'دار الحكمة — المأمون يحوّل بغداد إلى عاصمة الترجمة والعلم',
                thumbnailUrl: staticFile('assets/bayt-hikma.jpg'),
              },
              {
                year: 945,
                title: 'دخول البويهيين — الخلافة تضعف والسيف يعلو على القلم',
                thumbnailUrl: staticFile('assets/baghdad-762.jpg'),
                isTurningPoint: true,
              },
              {
                year: 1258,
                title: 'سقوط بغداد — هولاكو يحرق دار الكتب، وتسبق مياه دجلة الحبرَ دماً',
                thumbnailUrl: staticFile('assets/baghdad-1258.jpg'),
                isTurningPoint: true,
              },
            ]}
          />
        </FadeSection>
      </Sequence>

      {/* ٠٣ — <QuoteCard /> · صوت المؤرخين */}
      <Sequence from={QUOTE.from} durationInFrames={QUOTE.duration}>
        <FadeSection durationInFrames={QUOTE.duration}>
          <QuoteCard
            quoteText="بغدادُ واسطةُ عِقدِ البلاد، ودارُ السلام، وأمُّ العراق، ومدينةُ العلم التي لم تَلِد مثلها الأرض"
            authorName="ياقوت الحموي"
            authorTitle="معجم البلدان — باب الباء"
            authorPortraitUrl={staticFile('assets/scholar-portrait.jpg')}
            era="1179–1229 م · العصر الذهبي"
            highlightWords={['بغداد', 'العلم']}
          />
        </FadeSection>
      </Sequence>

      {/* ٠٤ — <AnimatedMapRoute /> · طريق الحرير */}
      <Sequence from={MAP.from} durationInFrames={MAP.duration}>
        <FadeSection durationInFrames={MAP.duration}>
          <AnimatedMapRoute
            startCoords={{x: 620, y: 345}}
            endCoords={{x: 1015, y: 155}}
            cityStartName="بغداد"
            cityEndName="سمرقند"
            routeLabel="طريق الحرير — شريان الكتب والقوافل من بغداد إلى سمرقند"
            pulseColor="#D4AF37"
            curvature={95}
          />
        </FadeSection>
      </Sequence>

      {/* ٠٥ — <SplitScreenComparison /> · المقارنة الكبرى */}
      <Sequence from={SPLIT.from} durationInFrames={SPLIT.duration}>
        <FadeSection durationInFrames={SPLIT.duration}>
          <SplitScreenComparison
            realHistoryMedia={staticFile('assets/baghdad-1258.jpg')}
            realTitle="١٢٥٨ — بغداد تسقط، ودار الكتب تحترق"
            alternateHistoryMedia={staticFile('assets/baghdad-golden-alt.jpg')}
            alternateTitle="بغداد ١٣٠٠ — عاصمة العلم التي لم تسقط قط"
            comparisonMetrics={[
              {label: 'ازدهار العلم والترجمة', realValue: 18, altValue: 96},
              {label: 'مكانة بغداد في العالم', realValue: 12, altValue: 90},
              {label: 'بقاء دار الحكمة', realValue: 0, altValue: 100},
            ]}
          />
        </FadeSection>
      </Sequence>

      {/* شريحة المكوّن أعلى الإطار — فوق كل المشاهد */}
      <SectionTag />
    </RawaqMasterCanvas>
  );
};

export default RawaqDesignSystemShowcase;
