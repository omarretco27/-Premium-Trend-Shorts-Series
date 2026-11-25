/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  <ParallaxScene />  ·  تحريك الصور بعمق 2.5D
 * ═══════════════════════════════════════════════════════════════════════════
 * يحوّل أي صورة ثابتة إلى لقطة سينمائية ثلاثية الأبعاد عبر:
 *   • طبقات bg / midground / foreground تنجرف بسرعات متفاوتة (interpolate)
 *   • جزيئات غبار ذهبية تسبح ببطء في الهواء (حتميّة عبر mulberry32)
 *   • بطاقة سفلية تجمع yearBadge + captionText بظهور كتابة تدريجية
 *
 * مثال:
 *   <ParallaxScene
 *     backgroundImg={staticFile('assets/baghdad-1258.jpg')}
 *     cameraDirection="zoom-in"
 *     yearBadge="1258 م"
 *     captionText="سقوط بغداد — حين انطفأت دار الحكمة"
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
  Easing,
} from 'remotion';
import {
  rawaqColors,
  rawaqFonts,
  rawaqSprings,
  rawaqEasing,
  rtlBaseStyle,
  mulberry32,
} from '../../theme/rawaqTheme';

/* ── الـ Props ───────────────────────────────────────────────── */
export interface ParallaxSceneProps {
  /** الخلفية — إجباري */
  backgroundImg: string;
  /** الطبقة الوسطى — اختياري (تُولّد ضبابية جوّية عند غيابها) */
  midgroundImg?: string;
  /** المقدمة — اختياري (تُولّد جزيئات + إطار داكن عند غيابها) */
  foregroundImg?: string;
  cameraDirection: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right';
  captionText: string;
  yearBadge: string;
  /** سرعة الكاميرا: 1 = افتراضي، <1 أهدأ، >1 أسرع */
  cameraIntensity?: number;
}

/* ── جزيئات الغبار الذهبي ─────────────────────────────────────── */
const GoldDust: React.FC<{count?: number; seed?: number}> = ({
  count = 46,
  seed = 20240607,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const particles = useMemo(
    () =>
      Array.from({length: count}, (_, i) => {
        const r = mulberry32(seed + i * 1013);
        return {
          x: r() * width,
          y: r() * height,
          size: 1.2 + r() * 3.6,
          driftX: (r() - 0.5) * 260,
          driftY: 60 + r() * 180,
          phase: r() * Math.PI * 2,
          speed: 0.35 + r() * 0.5,
          opacity: 0.35 + r() * 0.5,
        };
      }),
    [count, seed, width, height],
  );
  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 3}}>
      {particles.map((p, i) => {
        const t = (frame / 60) * p.speed;
        const y = (((p.y - t * p.driftY) % (height + 80)) + height + 80) % (height + 80) - 40;
        const x = p.x + Math.sin(t * 0.9 + p.phase) * 46 + Math.sin(frame * 0.012 + p.phase) * 10;
        const twinkle = 0.55 + 0.45 * Math.sin(frame * 0.09 + p.phase * 3);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, #F5E7B2 0%, ${rawaqColors.accentGold} 55%, transparent 75%)`,
              boxShadow: `0 0 ${p.size * 3.2}px rgba(212,175,55,0.8)`,
              opacity: p.opacity * twinkle,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ═════════════════════════ المكوّن الرئيسي ═════════════════════════ */
export const ParallaxScene: React.FC<ParallaxSceneProps> = ({
  backgroundImg,
  midgroundImg,
  foregroundImg,
  cameraDirection,
  captionText,
  yearBadge,
  cameraIntensity = 1,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps, width, height} = useVideoConfig();
  const dur = durationInFrames;

  /* ── مسارات الكاميرا (لا linear — rawaqEasing.out دائماً) ── */
  const cam = (mag: number) => {
    const m = mag * cameraIntensity;
    const p = interpolate(frame, [0, dur], [0, 1], {
      easing: rawaqEasing.out,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    switch (cameraDirection) {
      case 'zoom-in':
        return {scale: 1 + p * 0.14 * m, x: 0, y: 0};
      case 'zoom-out':
        return {scale: 1.14 - p * 0.14 * m, x: 0, y: 0};
      case 'pan-left':
        return {scale: 1.12, x: (0.5 - p) * 130 * m, y: 0};
      case 'pan-right':
        return {scale: 1.12, x: (p - 0.5) * 130 * m, y: 0};
    }
  };

  const bg = cam(0.55); // الخلفية: أبطأ حركة
  const mid = cam(0.95); // الوسط
  const fg = cam(1.5); // المقدمة: أسرع انجراف = عمق

  /* ── كتابة تدريجية للتعليق ── */
  const capStart = Math.round(fps * 0.9);
  const typeProgress = interpolate(
    frame,
    [capStart, capStart + Math.max(captionText.length * 1.6, 40)],
    [0, 1],
    {easing: Easing.linear, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const visibleChars = Math.floor(typeProgress * captionText.length);
  const typed = captionText.slice(0, visibleChars);
  const caretOn = Math.floor(frame / 16) % 2 === 0 && typeProgress < 1;

  /* ── بطاقة التعليق والشارة ── */
  const cardSpring = spring({
    frame: frame - Math.round(fps * 0.45),
    fps,
    config: rawaqSprings.standard,
  });
  const cardY = interpolate(cardSpring, [0, 1], [120, 0]);
  const cardOpacity = interpolate(cardSpring, [0, 0.6], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const badgePop = spring({
    frame: frame - Math.round(fps * 0.7),
    fps,
    config: rawaqSprings.snappy,
  });

  return (
    <AbsoluteFill style={{background: rawaqColors.backgroundPrimary, overflow: 'hidden'}}>
      {/* ── الطبقة 1 · الخلفية ── */}
      <AbsoluteFill
        style={{
          transform: `scale(${bg.scale}) translate(${bg.x}px, ${bg.y}px)`,
          zIndex: 0,
        }}
      >
        <Img
          src={backgroundImg}
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
        {/* تعادل لون سينمائي */}
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(180deg, rgba(10,11,14,0.42) 0%, rgba(10,11,14,0.05) 30%, rgba(10,11,14,0.08) 62%, rgba(10,11,14,0.78) 100%)',
          }}
        />
      </AbsoluteFill>

      {/* ── الطبقة 2 · الوسط (أو ضباب جوي مولّد) ── */}
      {midgroundImg ? (
        <AbsoluteFill
          style={{
            transform: `scale(${mid.scale + 0.04}) translate(${mid.x}px, ${mid.y}px)`,
            zIndex: 1,
            opacity: 0.96,
          }}
        >
          <Img
            src={midgroundImg}
            style={{width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'normal'}}
          />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill
          style={{
            zIndex: 1,
            transform: `translate(${mid.x * 0.6}px, 0px)`,
            background:
              'radial-gradient(90% 55% at 50% 78%, rgba(242,236,225,0.10) 0%, transparent 60%)',
          }}
        />
      )}

      {/* ── ضباب ذهبي منخفض الأفق ── */}
      <AbsoluteFill
        style={{
          zIndex: 2,
          background:
            'radial-gradient(140% 42% at 50% 88%, rgba(212,175,55,0.10) 0%, transparent 55%)',
        }}
      />

      {/* ── الطبقة 3 · المقدمة / الجزيئات ── */}
      {foregroundImg ? (
        <AbsoluteFill
          style={{
            zIndex: 3,
            transform: `scale(${fg.scale + 0.08}) translate(${fg.x}px, ${fg.y}px)`,
          }}
        >
          <Img
            src={foregroundImg}
            style={{width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply'}}
          />
        </AbsoluteFill>
      ) : null}
      <GoldDust />

      {/* ── البطاقة السفلية: السنة + التعليق ── */}
      <AbsoluteFill
        style={{
          zIndex: 5,
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          padding: '0 96px 84px',
        }}
      >
        <div
          style={{
            ...rtlBaseStyle,
            transform: `translateY(${cardY}px)`,
            opacity: cardOpacity,
            maxWidth: 1250,
            background: rawaqColors.glassDark,
            backdropFilter: 'blur(14px)',
            border: `1px solid ${rawaqColors.glassBorder}`,
            borderInlineStart: `3px solid ${rawaqColors.accentGold}`,
            borderRadius: 6,
            padding: '26px 34px 26px 40px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            gap: 28,
          }}
        >
          {/* شارة السنة */}
          <div
            style={{
              transform: `scale(${interpolate(badgePop, [0, 1], [0, 1])}) rotate(-3deg)`,
              background: rawaqColors.accentGold,
              color: rawaqColors.ink,
              fontFamily: rawaqFonts.label,
              fontWeight: 900,
              fontSize: 44,
              lineHeight: 1,
              padding: '14px 18px',
              borderRadius: 4,
              boxShadow: '0 6px 24px rgba(212,175,55,0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            {yearBadge}
          </div>

          {/* التعليق — كتابة تدريجية */}
          <div
            style={{
              fontFamily: rawaqFonts.data,
              fontWeight: 600,
              fontSize: 44,
              color: rawaqColors.parchment,
              lineHeight: 1.45,
              minHeight: '1.5em',
            }}
          >
            {typed}
            <span
              style={{
                display: 'inline-block',
                width: 4,
                height: '0.95em',
                verticalAlign: '-0.12em',
                marginInlineStart: 6,
                background: rawaqColors.accentGold,
                opacity: caretOn ? 1 : 0,
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default ParallaxScene;
