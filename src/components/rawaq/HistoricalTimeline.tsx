/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  <HistoricalTimeline />  ·  شريط الزمن بأسلوب وثائقيات Vox
 * ═══════════════════════════════════════════════════════════════════════════
 * مسطرة تاريخية SVG + كاميرا تنزلق بفيزياء ناعمة، عند بلوغ كل حدث:
 *   • تتوهّج النقطة ذهبياً (#D4AF37) أو قرمزياً (#8B1E1E) لنقاط الانكسار
 *   • تنسحب صورة الحدث داخل إطار ورق مقصوص (Torn Paper Frame)
 *   • يعرض مفتاح HUD السنة ضخماً كشبح في الخلفية
 *
 * الاتجاه: الأقدم يساراً (هندسة Vox الكلاسيكية) — النصوص العربية تبقى RTL.
 * مثال:
 *   <HistoricalTimeline
 *     startYear={762} endYear={1258}
 *     events={[{ year: 762, title: 'تأسيس بغداد — مدينة السلام', ... }]}
 *   />
 */
import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';
import {
  rawaqColors,
  rawaqFonts,
  rawaqSprings,
  rawaqEasing,
  rtlBaseStyle,
  formatYearArabic,
} from '../../theme/rawaqTheme';

/* ── الأنواع ─────────────────────────────────────────────────── */
export interface TimelineEvent {
  year: number;
  title: string;
  thumbnailUrl?: string;
  isTurningPoint?: boolean;
}

export interface HistoricalTimelineProps {
  startYear: number;
  endYear: number;
  events: TimelineEvent[];
  /** مدة توقّف الكاميرا عند كل حدث (بالفريمات) — الافتراضي 78 (~1.3ث @60fps) */
  eventDwellFrames?: number;
  /** تأخير بدء انطلاق الكاميرا — الافتراضي 28 */
  startDelayFrames?: number;
}

/** تصدير ثوابت المزامنة — لحقن المؤثرات الصوتية (ticks) في الـ Showcase */
export const TIMELINE_START_DELAY = 28;
export const TIMELINE_EVENT_STEP = 78;

/* إطار ورق مقصوص — حواف مسننة حتمية */
const TORN_CLIP =
  'polygon(2% 8%, 6% 0%, 18% 3%, 30% 0%, 44% 4%, 57% 1%, 70% 4%, 84% 0%, 96% 5%, 100% 18%, 98% 32%, 100% 47%, 97% 61%, 100% 76%, 96% 88%, 98% 96%, 82% 100%, 68% 96%, 55% 100%, 41% 97%, 27% 100%, 13% 96%, 0% 92%, 2% 74%, 0% 58%, 3% 40%, 0% 24%)';

const PX_PER_YEAR = 4.6;
const PAD = 420;
const RULER_Y = 330; // موضع خط المسطرة عمودياً
const RULER_H = 130;

export const HistoricalTimeline: React.FC<HistoricalTimelineProps> = ({
  startYear,
  endYear,
  events,
  eventDwellFrames = TIMELINE_EVENT_STEP,
  startDelayFrames = TIMELINE_START_DELAY,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const sorted = useMemo(
    () => [...events].sort((a, b) => a.year - b.year),
    [events],
  );

  const span = Math.max(endYear - startYear, 1);
  const contentWidth = span * PX_PER_YEAR + PAD * 2;
  const maxCam = Math.max(contentWidth - width, 0);
  const xOf = (year: number) => PAD + (year - startYear) * PX_PER_YEAR;

  /* ── محطات الكاميرا: تنطلق مرة وتقف عند كل حدث ── */
  const camKeys = useMemo(() => {
    const frames: number[] = [0];
    const values: number[] = [0];
    sorted.forEach((ev, i) => {
      frames.push(startDelayFrames + i * eventDwellFrames);
      values.push(
        Math.min(Math.max(xOf(ev.year) - width * 0.38, 0), maxCam),
      );
    });
    frames.push(startDelayFrames + sorted.length * eventDwellFrames + 30);
    values.push(
      Math.min(Math.max(xOf(sorted[sorted.length - 1].year) - width * 0.62, 0), maxCam),
    );
    return {frames, values};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted, startDelayFrames, eventDwellFrames, maxCam]);

  const camX = interpolate(frame, camKeys.frames, camKeys.values, {
    easing: rawaqEasing.inOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* ── الحدث النشط حسب الزمن ── */
  const activeIndex = useMemo(() => {
    let idx = -1;
    sorted.forEach((_, i) => {
      if (frame >= startDelayFrames + i * eventDwellFrames - 8) idx = i;
    });
    return Math.min(Math.max(idx, 0), sorted.length - 1);
  }, [frame, sorted, startDelayFrames, eventDwellFrames]);
  const active = sorted[activeIndex];
  const activeStart = startDelayFrames + activeIndex * eventDwellFrames;
  const sinceActive = frame - activeStart;

  /* ── حركات الحدث النشط ── */
  const pop = spring({frame: sinceActive, fps, config: rawaqSprings.standard});
  const dockIn = spring({frame: sinceActive, fps, config: rawaqSprings.gentle});

  /* ── خطوط السنوات ── */
  const tickYears = useMemo(() => {
    const arr: number[] = [];
    const first = Math.ceil(startYear / 10) * 10;
    for (let y = first; y <= endYear; y += 10) arr.push(y);
    return arr;
  }, [startYear, endYear]);

  const activation = (i: number) => startDelayFrames + i * eventDwellFrames;

  return (
    <AbsoluteFill
      style={{
        ...rtlBaseStyle,
        background: rawaqColors.backgroundSecondary,
        overflow: 'hidden',
      }}
    >
      {/* لوحة خلفية: ورق مخطوط داكن */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(1300px 800px at 50% 18%, rgba(212,175,55,0.07), transparent 60%), radial-gradient(900px 600px at 85% 90%, rgba(139,30,30,0.10), transparent 55%)',
        }}
      />

      {/* ── رأس الشريط ── */}
      <div
        style={{
          position: 'absolute',
          top: 112,
          right: 96,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 6,
        }}
      >
        <div
          style={{
            fontFamily: rawaqFonts.label,
            fontSize: 19,
            letterSpacing: '0.32em',
            color: rawaqColors.accentGold,
            fontWeight: 700,
          }}
        >
          شريط الزمن · THE TIMELINE
        </div>
        <div
          style={{
            fontFamily: rawaqFonts.display,
            fontSize: 58,
            color: rawaqColors.parchment,
            lineHeight: 1.15,
          }}
        >
          من مدينة السلام إلى سقوطها
        </div>
        <div
          style={{
            width: 210,
            height: 4,
            background: rawaqColors.accentGold,
            boxShadow: '0 0 14px rgba(212,175,55,0.6)',
          }}
        />
      </div>

      {/* ── السنة الشبح العملاقة في الخلفية ── */}
      <div
        dir="ltr"
        style={{
          position: 'absolute',
          left: 60,
          top: 96,
          fontFamily: rawaqFonts.ghost,
          fontWeight: 900,
          fontSize: 300,
          color: 'transparent',
          WebkitTextStroke: `2px ${
            active?.isTurningPoint ? 'rgba(192,57,43,0.5)' : 'rgba(212,175,55,0.4)'
          }`,
          opacity: interpolate(sinceActive, [0, 24], [0, 1], {
            extrapolateRight: 'clamp',
          }),
          zIndex: 1,
          userSelect: 'none',
        }}
      >
        {active?.year}
      </div>

      {/* ══════ المسطرة — تتحرك أفقياً داخل نافذة ثابتة ══════ */}
      <div
        dir="ltr"
        style={{
          position: 'absolute',
          top: RULER_Y,
          left: 0,
          width: contentWidth,
          height: RULER_H,
          transform: `translateX(${-camX}px)`,
          zIndex: 3,
        }}
      >
        {/* خط الأساس */}
        <div
          style={{
            position: 'absolute',
            top: RULER_H / 2,
            left: 0,
            width: contentWidth,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${rawaqColors.lineGoldStrong} 8%, ${rawaqColors.accentGold} 50%, ${rawaqColors.lineGoldStrong} 92%, transparent)`,
            boxShadow: '0 0 18px rgba(212,175,55,0.35)',
          }}
        />

        {/* الشرطات + أرقام القرون */}
        {tickYears.map((y) => {
          const major50 = y % 50 === 0;
          const major100 = y % 100 === 0;
          const h = major100 ? 44 : major50 ? 30 : 15;
          return (
            <div key={y} style={{position: 'absolute', left: xOf(y), top: 0}}>
              <div
                style={{
                  position: 'absolute',
                  left: -1,
                  top: RULER_H / 2 - h / 2,
                  width: major100 ? 3 : 2,
                  height: h,
                  background: major100
                    ? rawaqColors.accentGold
                    : 'rgba(242,236,225,0.4)',
                }}
              />
              {major100 && (
                <div
                  style={{
                    position: 'absolute',
                    left: -46,
                    top: RULER_H / 2 + 30,
                    width: 92,
                    textAlign: 'center',
                    fontFamily: rawaqFonts.data,
                    fontWeight: 500,
                    fontSize: 21,
                    color: rawaqColors.parchmentFaint,
                    letterSpacing: '0.08em',
                  }}
                >
                  {y}
                </div>
              )}
            </div>
          );
        })}

        {/* نقاط الأحداث */}
        {sorted.map((ev, i) => {
          const born = frame >= activation(i) - 8;
          const t = Math.min(Math.max((frame - activation(i) + 8) / 18, 0), 1);
          const glow =
            i === activeIndex
              ? interpolate(Math.sin(frame * 0.16), [-1, 1], [0.75, 1])
              : born
                ? 0.85
                : 0.35;
          const color = ev.isTurningPoint
            ? rawaqColors.crimsonBright
            : rawaqColors.accentGold;
          const size = ev.isTurningPoint ? 26 : 20;
          return (
            <div
              key={`${ev.year}-${i}`}
              style={{
                position: 'absolute',
                left: xOf(ev.year) - size / 2,
                top: RULER_H / 2 - size / 2,
                width: size,
                height: size,
                borderRadius: '50%',
                background: color,
                opacity: glow * (born ? 1 : 0.28),
                boxShadow: `0 0 ${ev.isTurningPoint ? 34 : 26}px ${color}`,
                transform: `scale(${interpolate(t, [0, 1], [0.4, 1])})`,
                border: '2px solid rgba(10,11,14,0.9)',
              }}
            />
          );
        })}
      </div>

      {/* ══════ رصيف التفاصيل — يتبدل مع كل حدث ══════ */}
      <div
        style={{
          position: 'absolute',
          top: RULER_Y + RULER_H + 36,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 5,
        }}
      >
        <div
          key={activeIndex}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 46,
            transform: `translateY(${interpolate(dockIn, [0, 1], [140, 0])}px)`,
            opacity: interpolate(dockIn, [0, 0.75], [0, 1], {
              extrapolateRight: 'clamp',
            }),
            background: rawaqColors.glassDark,
            backdropFilter: 'blur(16px)',
            border: `1px solid ${
              active?.isTurningPoint ? 'rgba(192,57,43,0.45)' : rawaqColors.glassBorder
            }`,
            borderRadius: 8,
            padding: '22px 30px',
            boxShadow: '0 26px 70px rgba(0,0,0,0.6)',
            maxWidth: 1250,
          }}
        >
          {/* إطار الورق المقصوص */}
          {active?.thumbnailUrl && (
            <div
              style={{
                clipPath: TORN_CLIP,
                background: rawaqColors.parchment,
                padding: 14,
                flexShrink: 0,
                transform: `scale(${interpolate(pop, [0, 1], [0.6, 1])}) rotate(${interpolate(pop, [0, 1], [-6, -1.5])}deg)`,
                filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.65))',
              }}
            >
              <Img
                src={active.thumbnailUrl}
                style={{
                  width: 300,
                  height: 190,
                  objectFit: 'cover',
                  filter: active.isTurningPoint
                    ? 'grayscale(0.75) contrast(1.15) sepia(0.25)'
                    : 'grayscale(0.35) contrast(1.1)',
                  display: 'block',
                }}
              />
            </div>
          )}
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            <div
              style={{
                fontFamily: rawaqFonts.label,
                fontWeight: 700,
                fontSize: 21,
                letterSpacing: '0.2em',
                color: active?.isTurningPoint
                  ? rawaqColors.crimsonBright
                  : rawaqColors.accentGold,
              }}
            >
              {formatYearArabic(active.year)}
              {active.isTurningPoint ? '  ·  نقطة انكسار' : ''}
            </div>
            <div
              style={{
                fontFamily: rawaqFonts.display,
                fontSize: 40,
                color: rawaqColors.parchment,
                lineHeight: 1.4,
              }}
            >
              {active?.title}
            </div>
          </div>
        </div>
      </div>

      {/* ── سكة تقدّم رفيعة أسفل الشاشة ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 74,
          left: 96,
          right: 96,
          height: 3,
          background: 'rgba(242,236,225,0.12)',
          zIndex: 6,
        }}
      >
        <div
          style={{
            height: '100%',
            background: rawaqColors.accentGold,
            width: `${interpolate(frame, [0, camKeys.frames[camKeys.frames.length - 1]], [0, 100], {
              extrapolateRight: 'clamp',
            })}%`,
            boxShadow: '0 0 12px rgba(212,175,55,0.7)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export default HistoricalTimeline;
