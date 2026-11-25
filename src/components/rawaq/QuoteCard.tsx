/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  <QuoteCard />  ·  بطاقة أقوال الفلاسفة والعلماء
 * ═══════════════════════════════════════════════════════════════════════════
 * بأسلوب Pinterest Editorial الفاخر (Dark Academia):
 *   • بطاقة زجاجية معتمة فوق مخطوطة داكنة + backdrop-filter: blur(16px)
 *   • إطار هندسي ذهبي رفيع يُرسم تلقائياً (stroke-dashoffset) مع زخارف زوايا
 *   • البورتريه: أبيض وأسود عالي التباين + فلاتر Halftone خفيف
 *   • النص يظهر كلمة كلمة؛ والكلمات في highlightWords تُظلَّل بخط ذهبي يدوي
 *
 * <QuoteCard
 *   quoteText="بغدادُ واسطةُ عقدِ البلاد، ودارُ السلام، ومدينةُ العلم"
 *   authorName="ياقوت الحموي"
 *   authorTitle="معجم البلدان — ج٢"
 *   authorPortraitUrl={staticFile('assets/scholar-portrait.jpg')}
 *   era="1179–1229 م · العصر الذهبي"
 *   highlightWords={['بغداد', 'العلم']}
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

/* ── الـ Props ───────────────────────────────────────────────── */
export interface QuoteCardProps {
  quoteText: string;
  authorName: string;
  authorTitle: string;
  authorPortraitUrl?: string;
  era: string;
  /** كلمات تُظلَّل بفرشاة ذهبية — تُطابَق مع تجاهل التشكيل والترقيم */
  highlightWords?: string[];
  /** ارتفاع البطاقة بالبكسل — للاقتباسات الطويلة */
  height?: number;
}

const CARD_W = 1620;

/* إزالة التشكيل والترقيم للمطابقة */
const normalizeArabic = (s: string) =>
  s
    .replace(/[ً-ٰٟۖ-ۭ]/g, '')
    .replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')
    .toLowerCase();

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quoteText,
  authorName,
  authorTitle,
  authorPortraitUrl,
  era,
  highlightWords = [],
  height = 620,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const STEP = Math.max(2, Math.round(fps * 0.075)); // كلمة كل ~75ms
  const WORDS_START = 34;

  const words = useMemo(() => quoteText.trim().split(/\s+/), [quoteText]);
  const highlightSet = useMemo(
    () => new Set(highlightWords.map(normalizeArabic).filter(Boolean)),
    [highlightWords],
  );

  /* ── دخول البطاقة ── */
  const enter = spring({frame, fps, config: rawaqSprings.standard});
  const cardY = interpolate(enter, [0, 1], [90, 0]);
  const cardOpacity = interpolate(enter, [0, 0.5], [0, 1], {
    extrapolateRight: 'clamp',
  });

  /* ── رسم الإطار الذهبي (stroke-dashoffset) ── */
  const frameProgress = interpolate(frame, [8, 8 + 90], [0, 1], {
    easing: rawaqEasing.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const PERIMETER = 2 * (CARD_W + height);

  /* ── زخرفة الزوايا ── */
  const cornerPop = (i: number) =>
    spring({frame: frame - 20 - i * 7, fps, config: rawaqSprings.snappy});

  return (
    <AbsoluteFill
      style={{
        ...rtlBaseStyle,
        background: rawaqColors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* ملمس المخطوطة الداكنة */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(1200px 700px at 50% 22%, rgba(212,175,55,0.09), transparent 62%),
            repeating-linear-gradient(0deg, rgba(242,236,225,0.022) 0 2px, transparent 2px 44px),
            radial-gradient(closest-side, rgba(242,236,225,0.03), transparent)`,
        }}
      />

      {/* هالة خلف البطاقة */}
      <div
        style={{
          position: 'absolute',
          width: CARD_W + 240,
          height: height + 240,
          borderRadius: 44,
          background:
            'radial-gradient(closest-side, rgba(212,175,55,0.12), transparent)',
          filter: 'blur(10px)',
        }}
      />

      {/* ══════════ البطاقة ══════════ */}
      <div
        style={{
          position: 'relative',
          width: CARD_W,
          height,
          transform: `translateY(${cardY}px)`,
          opacity: cardOpacity,
          background: 'rgba(20,23,31,0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 10,
          boxShadow: '0 40px 110px rgba(0,0,0,0.65)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '0 64px',
          gap: 64,
        }}
      >
        {/* ── الإطار الذهبي المُرسم تلقائياً ── */}
        <svg
          width={CARD_W}
          height={height}
          style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
        >
          {/* الإطار الخارجي — خط مرسوم */}
          <rect
            x={7}
            y={7}
            width={CARD_W - 14}
            height={height - 14}
            fill="none"
            stroke={rawaqColors.accentGold}
            strokeWidth={2.4}
            strokeDasharray={PERIMETER}
            strokeDashoffset={PERIMETER * (1 - frameProgress)}
            opacity={0.95}
            style={{filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.5))'}}
          />
          {/* الإطار الداخلي — ثابت رقيق */}
          <rect
            x={20}
            y={20}
            width={CARD_W - 40}
            height={height - 40}
            fill="none"
            stroke={rawaqColors.lineGold}
            strokeWidth={1}
          />
        </svg>

        {/* زخارف الزوايا الأربع */}
        {[
          {top: -13, right: -13},
          {top: -13, left: -13},
          {bottom: -13, right: -13},
          {bottom: -13, left: -13},
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              ...(pos as React.CSSProperties),
              width: 30,
              height: 30,
              transform: `rotate(45deg) scale(${cornerPop(i)})`,
              background: rawaqGradientsGold,
              border: '2px solid #0A0B0E',
              boxShadow: '0 0 18px rgba(212,175,55,0.6)',
            }}
          />
        ))}

        {/* علامة اقتباس عملاقة */}
        <div
          style={{
            position: 'absolute',
            top: -34,
            left: 34,
            fontFamily: rawaqFonts.quote,
            fontSize: 210,
            lineHeight: 1,
            color: rawaqColors.accentGold,
            opacity: 0.2,
            userSelect: 'none',
          }}
        >
          ”
        </div>

        {/* ════════ العمود الأيمن: البورتريه ════════ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
            flexShrink: 0,
            width: 300,
          }}
        >
          {authorPortraitUrl ? (
            <div
              style={{
                position: 'relative',
                width: 232,
                height: 232,
                borderRadius: '50%',
                padding: 6,
                background:
                  'conic-gradient(from 210deg, #D4AF37, #5e4d16, #F5E7B2, #8A7223, #D4AF37)',
                boxShadow:
                  '0 0 0 1px rgba(10,11,14,0.9), 0 0 42px rgba(212,175,55,0.35)',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#000',
                }}
              >
                <Img
                  src={authorPortraitUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'grayscale(1) contrast(1.18) brightness(0.88)',
                  }}
                />
                {/* Halftone خفيف */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                      'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.55) 1.05px, transparent 1.25px)',
                    backgroundSize: '5px 5px',
                    mixBlendMode: 'overlay',
                    opacity: 0.7,
                  }}
                />
                {/* لمعة زيتية */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'radial-gradient(80% 60% at 32% 22%, rgba(255,255,255,0.28), transparent 55%)',
                    mixBlendMode: 'screen',
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                width: 232,
                height: 232,
                borderRadius: '50%',
                border: `1.5px dashed ${rawaqColors.lineGoldStrong}`,
              }}
            />
          )}

          <div style={{textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4}}>
            <div
              style={{
                fontFamily: rawaqFonts.display,
                fontSize: 34,
                color: rawaqColors.parchment,
                lineHeight: 1.3,
              }}
            >
              {authorName}
            </div>
            <div
              style={{
                fontFamily: rawaqFonts.data,
                fontSize: 19,
                color: rawaqColors.parchmentDim,
                lineHeight: 1.5,
              }}
            >
              {authorTitle}
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: rawaqFonts.label,
                fontSize: 15,
                letterSpacing: '0.24em',
                color: rawaqColors.accentGold,
                fontWeight: 600,
              }}
            >
              {era}
            </div>
          </div>
        </div>

        {/* ════════ العمود الأيسر: نص الاقتباس كلمة كلمة ════════ */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'center',
            rowGap: 18,
            columnGap: 10,
            fontFamily: rawaqFonts.quote,
            fontSize: 46,
            lineHeight: 1.9,
            color: rawaqColors.parchment,
          }}
        >
          {words.map((word, i) => {
            const t = frame - (WORDS_START + i * STEP);
            const show = t >= 0;
            const appear = interpolate(t, [0, 10], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const rise = interpolate(t, [0, 14], [16, 0], {
              easing: rawaqEasing.out,
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const isHi = highlightSet.has(normalizeArabic(word));
            const brush = isHi
              ? interpolate(t, [4, 26], [0, 1], {
                  easing: rawaqEasing.out,
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })
              : 0;
            return (
              <span
                key={i}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  opacity: appear,
                  transform: `translateY(${rise}px)`,
                  whiteSpace: 'pre',
                }}
              >
                {isHi && (
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      insetInline: -8,
                      bottom: 2,
                      height: '0.42em',
                      background:
                        'linear-gradient(180deg, rgba(212,175,55,0.24) 0%, rgba(212,175,55,0.85) 45%, rgba(138,114,35,0.9) 100%)',
                      borderRadius: '38% 62% 55% 45% / 70% 60% 40% 55%',
                      transform: `scaleX(${brush}) rotate(-0.6deg)`,
                      transformOrigin: 'right center',
                      mixBlendMode: 'screen',
                      zIndex: -1,
                    }}
                  />
                )}
                <span
                  style={{
                    position: 'relative',
                    color: isHi ? rawaqColors.accentGoldBright : rawaqColors.parchment,
                    fontWeight: isHi ? 700 : 400,
                    textShadow: isHi ? '0 0 18px rgba(212,175,55,0.4)' : 'none',
                  }}
                >
                  {word}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* تدرّج الذهب المستخدم في زخارف الزوايا */
const rawaqGradientsGold =
  'linear-gradient(150deg, #F5E7B2 0%, #D4AF37 40%, #8A7223 100%)';

export default QuoteCard;
