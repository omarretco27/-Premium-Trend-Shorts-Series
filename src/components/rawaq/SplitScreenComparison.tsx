/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  <SplitScreenComparison />  ·  التاريخ الحقيقي × ماذا لو؟
 * ═══════════════════════════════════════════════════════════════════════════
 *  • انقسام الشاشة بخط ذهبي مائلي متوهج يجتاح الشاشة (Wipe) ثم يستقر بالمنتصف.
 *  • النصف الأيمن — التاريخ الحقيقي: تدرج باهت/كلاسيكي (Sepia / Desaturated).
 *  • النصف الأيسر — ماذا لو (التاريخ البديل): ألوان سينمائية مشبعة وحية.
 *  • في المنتصف: مقارنات سريعة بأشرطة بيانية ترتفع بحركة spring متدرجة.
 *
 * <SplitScreenComparison
 *   realHistoryMedia={staticFile('assets/baghdad-1258.jpg')}
 *   realTitle="التاريخ الحقيقي — سقوط بغداد ١٢٥٨"
 *   alternateHistoryMedia={staticFile('assets/baghdad-golden-alt.jpg')}
 *   alternateTitle="ماذا لو؟ — بغداد ١٣٠٠، عاصمة العلم"
 *   comparisonMetrics={[{label:'ازدهار العلم', realValue:22, altValue:96}]}
 * />
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
} from '../../theme/rawaqTheme';

/* ── الأنواع ─────────────────────────────────────────────────── */
export interface ComparisonMetric {
  label: string;
  /** 0..100 */
  realValue: number;
  /** 0..100 */
  altValue: number;
}

export interface SplitScreenComparisonProps {
  realHistoryMedia: string;
  realTitle: string;
  alternateHistoryMedia: string;
  alternateTitle: string;
  comparisonMetrics: ComparisonMetric[];
  /** ميل خط القسمة بالدرجات — الافتراضي 6° */
  dividerTiltDeg?: number;
}

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 100);

export const SplitScreenComparison: React.FC<SplitScreenComparisonProps> = ({
  realHistoryMedia,
  realTitle,
  alternateHistoryMedia,
  alternateTitle,
  comparisonMetrics,
  dividerTiltDeg = 6,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  /* ── اجتياح خط القسمة من اليمين إلى المنتصف ── */
  const SWEEP_START = 8;
  const s = spring({
    frame: frame - SWEEP_START,
    fps,
    config: rawaqSprings.standard,
    durationInFrames: 130,
  });
  // موضع خط القسمة (نسبة العرض): يبدأ خارج الشاشة يميناً ويعود إلى 0.52
  const dividerX = interpolate(s, [0, 1], [1.16, 0.52]);
  const tilt = (dividerTiltDeg * Math.PI) / 180;

  /* الخط يمر بمركز الشاشة (dividerX*W, H/2) بميل dividerTiltDeg عن الشاقول */
  const W = 1920;
  const H = 1080;
  const cx = dividerX * W;
  const halfShift = (H / 2) * Math.tan(tilt); // الإزاحة الأفقية لنصفي الخط
  const xAtTop = cx + halfShift;
  const xAtBottom = cx - halfShift;

  const splitClip = (side: 'real' | 'alt') =>
    side === 'real'
      ? `polygon(${xAtTop}px 0px, ${W}px 0px, ${W}px ${H}px, ${xAtBottom}px ${H}px)`
      : `polygon(0px 0px, ${xAtTop}px 0px, ${xAtBottom}px ${H}px, 0px ${H}px)`;

  // نقطتا الخط ممتدتان خارج الشاشة لضمان استمرارية الحافة
  const lineXTop = cx + (H / 2 + 48) * Math.tan(tilt);
  const lineXBottom = cx - (H / 2 + 48) * Math.tan(tilt);

  /* ── شارة العنوان والـ «؟» ── */
  const headIn = spring({frame, fps, config: rawaqSprings.gentle});
  const sealPop = spring({
    frame: frame - SWEEP_START - 40,
    fps,
    config: rawaqSprings.snappy,
  });

  /* ── الأشرطة البيانية ── */
  const metricsStart = SWEEP_START + 78;
  const barSpring = (i: number) =>
    spring({
      frame: frame - (metricsStart + i * 14),
      fps,
      config: rawaqSprings.standard,
    });

  const glowPulse = 0.75 + 0.25 * Math.sin(frame * 0.11);

  return (
    <AbsoluteFill style={{background: rawaqColors.ink, overflow: 'hidden'}}>
      {/* ══════ النصف الأيمن: التاريخ الحقيقي (Sepia) ══════ */}
      <AbsoluteFill style={{clipPath: splitClip('real'), zIndex: 1}}>
        <Img
          src={realHistoryMedia}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '62% 40%',
            filter: 'sepia(0.62) saturate(0.5) brightness(0.72) contrast(1.02)',
          }}
        />
        {/* حجاب كلاسيكي */}
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(270deg, rgba(43,32,20,0.6) 0%, rgba(43,32,20,0.18) 45%, transparent 100%)',
          }}
        />
        <div
          dir="rtl"
          style={{
            position: 'absolute',
            top: 190,
            right: 110,
            maxWidth: 610,
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontFamily: rawaqFonts.label,
              fontSize: 17,
              letterSpacing: '0.3em',
              color: 'rgba(242,236,225,0.6)',
              fontWeight: 700,
            }}
          >
            REALITY · التاريخ الحقيقي
          </div>
          <div
            style={{
              fontFamily: rawaqFonts.display,
              fontSize: 45,
              lineHeight: 1.32,
              color: 'rgba(242,236,225,0.92)',
              marginTop: 10,
              textShadow: '0 4px 30px rgba(0,0,0,0.8)',
            }}
          >
            {realTitle}
          </div>
        </div>
      </AbsoluteFill>

      {/* ══════ النصف الأيسر: ماذا لو؟ (مشبع وحي) ══════ */}
      <AbsoluteFill style={{clipPath: splitClip('alt'), zIndex: 1}}>
        <Img
          src={alternateHistoryMedia}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '38% 40%',
            filter: 'saturate(1.28) contrast(1.08) brightness(0.94)',
          }}
        />
        {/* توهج مستقبلي ذهبي–فيروزي */}
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(90deg, rgba(12,40,44,0.55) 0%, rgba(212,175,55,0.14) 45%, transparent 100%)',
          }}
        />
        {/* أشعة اللهب الذهبي للبديل */}
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(60% 50% at 30% 32%, rgba(245,231,178,0.22), transparent 60%)',
            mixBlendMode: 'screen',
          }}
        />
        <div
          dir="rtl"
          style={{
            position: 'absolute',
            top: 190,
            left: 110,
            maxWidth: 610,
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontFamily: rawaqFonts.label,
              fontSize: 17,
              letterSpacing: '0.3em',
              color: rawaqColors.accentGoldBright,
              fontWeight: 700,
            }}
          >
            WHAT IF · التاريخ البديل
          </div>
          <div
            style={{
              fontFamily: rawaqFonts.display,
              fontSize: 45,
              lineHeight: 1.32,
              color: '#FFFBEA',
              marginTop: 10,
              textShadow: '0 4px 34px rgba(0,0,0,0.75)',
            }}
          >
            {alternateTitle}
          </div>
        </div>
      </AbsoluteFill>

      {/* ══════ خط القسمة الذهبي المائل ══════ */}
      <svg
        width="1920"
        height="1080"
        style={{position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none'}}
      >
        <defs>
          <linearGradient id="dividerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F5E7B2" />
            <stop offset="0.5" stopColor="#D4AF37" />
            <stop offset="1" stopColor="#8A7223" />
          </linearGradient>
        </defs>
        {/* توهج عريض */}
        <line
          x1={lineXTop}
          y1={-48}
          x2={lineXBottom}
          y2={1128}
          stroke="#D4AF37"
          strokeWidth={26}
          opacity={0.22 * glowPulse}
          style={{filter: 'blur(10px)'}}
        />
        {/* الخط نفسه */}
        <line
          x1={lineXTop}
          y1={-48}
          x2={lineXBottom}
          y2={1128}
          stroke="url(#dividerGrad)"
          strokeWidth={6}
          style={{filter: 'drop-shadow(0 0 14px rgba(212,175,55,0.9))'}}
        />
      </svg>

      {/* ══════ ختم «؟» المركزي ══════ */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: `calc(${dividerX * 100}% - 62px)`,
          zIndex: 4,
          width: 124,
          height: 124,
          borderRadius: '50%',
          transform: `scale(${interpolate(sealPop, [0, 1], [0, 1])})`,
          background:
            'radial-gradient(circle at 38% 34%, #F5E7B2 0%, #D4AF37 45%, #6E5A18 100%)',
          border: '3px solid #0A0B0E',
          boxShadow:
            '0 0 0 2px rgba(212,175,55,0.6), 0 0 60px rgba(212,175,55,0.55)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}
      >
        <span
          style={{
            fontFamily: rawaqFonts.display,
            fontSize: 58,
            lineHeight: 1,
            color: '#241B05',
            fontWeight: 700,
          }}
        >
          ؟
        </span>
        <span
          style={{
            fontFamily: rawaqFonts.label,
            fontSize: 11,
            letterSpacing: '0.28em',
            color: '#3A2E0E',
            fontWeight: 800,
          }}
        >
          رواق
        </span>
      </div>

      {/* ══════ الشريط العلوي: عنوان المقارنة ══════ */}
      <div
        style={{
          position: 'absolute',
          top: 58,
          left: 0,
          right: 0,
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          opacity: interpolate(headIn, [0, 0.6], [0, 1], {extrapolateRight: 'clamp'}),
          transform: `translateY(${interpolate(headIn, [0, 1], [-30, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: rawaqFonts.label,
            fontSize: 16,
            letterSpacing: '0.4em',
            color: rawaqColors.accentGold,
            fontWeight: 800,
          }}
        >
          المقارنة الكبرى · THE GREAT COMPARISON
        </div>
        <div
          style={{
            fontFamily: rawaqFonts.display,
            fontSize: 64,
            color: rawaqColors.parchment,
            textShadow: '0 6px 40px rgba(0,0,0,0.85)',
          }}
        >
          ماذا لو لم تسقط بغداد؟
        </div>
      </div>

      {/* ══════ لوحة الموازين — مقارنات رقمية ══════ */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          bottom: 44,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 1120,
          zIndex: 5,
          background: 'rgba(10,11,14,0.82)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${rawaqColors.glassBorder}`,
          borderRadius: 6,
          padding: '18px 30px 20px',
          boxShadow: '0 28px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* ترويسة اللوحة + وسيلة الإيضاح */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            borderBottom: `1px solid ${rawaqColors.lineGold}`,
            paddingBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: rawaqFonts.label,
              fontSize: 17,
              letterSpacing: '0.26em',
              color: rawaqColors.parchmentDim,
              fontWeight: 700,
            }}
          >
            المِيزان · THE BALANCE
          </span>
          <span style={{display: 'flex', gap: 22, alignItems: 'center'}}>
            <span style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#C9B998'}}>
              <i style={{width: 26, height: 8, background: '#8d7a5c', display: 'inline-block', borderRadius: 2}} />
              الحقيقي
            </span>
            <span style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: rawaqColors.accentGoldBright}}>
              <i style={{width: 26, height: 8, background: rawaqColors.accentGold, display: 'inline-block', borderRadius: 2}} />
              البديل
            </span>
          </span>
        </div>

        {/* صفوف المقاييس */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          {comparisonMetrics.map((m, i) => {
            const t = barSpring(i);
            const realW = (clamp01(m.realValue) / 100) * t;
            const altW = (clamp01(m.altValue) / 100) * t;
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18}}>
                <div
                  style={{
                    width: 210,
                    fontFamily: rawaqFonts.data,
                    fontWeight: 600,
                    fontSize: 21,
                    color: rawaqColors.parchment,
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {m.label}
                </div>
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 4}}>
                  {/* شريط الحقيقي */}
                  <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <div style={{flex: 1, height: 9, background: 'rgba(242,236,225,0.08)', borderRadius: 2, overflow: 'hidden'}}>
                      <div style={{width: `${realW * 100}%`, height: '100%', background: '#8d7a5c'}} />
                    </div>
                    <span dir="ltr" style={{fontSize: 15, color: '#C9B998', fontFamily: rawaqFonts.data, width: 40}}>
                      {Math.round(clamp01(m.realValue) * t)}
                    </span>
                  </div>
                  {/* شريط البديل */}
                  <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <div style={{flex: 1, height: 9, background: 'rgba(242,236,225,0.08)', borderRadius: 2, overflow: 'hidden'}}>
                      <div
                        style={{
                          width: `${altW * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #8A7223, #D4AF37 55%, #F5E7B2)',
                          boxShadow: '0 0 12px rgba(212,175,55,0.6)',
                        }}
                      />
                    </div>
                    <span dir="ltr" style={{fontSize: 15, color: rawaqColors.accentGoldBright, fontFamily: rawaqFonts.data, width: 40}}>
                      {Math.round(clamp01(m.altValue) * t)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default SplitScreenComparison;
