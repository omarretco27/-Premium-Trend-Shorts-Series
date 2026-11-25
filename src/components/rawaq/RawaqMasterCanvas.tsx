/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  <RawaqMasterCanvas />  ·  الغلاف البصري العام لرواق
 * ═══════════════════════════════════════════════════════════════════════════
 * يلفّ أي مشهد في القناة ويضيف تلقائياً:
 *   1. Paper & Film Grain Overlay  (opacity .06 · mix-blend-mode: overlay)
 *   2. Cinematic Vignette          (تظليل حواف مركّز على المنتصف)
 *   3. Watermark Logo "رواق"       (أعلى الزاوية · opacity .75)
 *
 * Props:
 *   children           المشهد نفسه (يُرسم أسفل الطبقات السينمائية)
 *   logoSrc            مسار اللوجو — افتراضياً "assets/rawaq-logo.svg"
 *   watermark          { show, opacity, position, width }
 *   grain              { show, opacity }  — ملمس ورق/فيلم حيّ يتحرّك كل فريم
 *   vignette           { show, strength } — 0..1
 *   letterbox          { show }           — أشرطة سينمائية علوية وسفلية
 *   hud                { show, left, right } — شارات حود اختيارية فوق كل شيء
 */
import React from 'react';
import {
  AbsoluteFill,
  staticFile,
  useCurrentFrame,
  interpolate,
} from 'remotion';
import {rawaqColors, rawaqLayout, mulberry32} from '../../theme/rawaqTheme';

/* ── واجهة الـ Props ─────────────────────────────────────────── */
export interface RawaqMasterCanvasProps {
  children: React.ReactNode;
  /** مسار اللوجو داخل مجلد public/ */
  logoSrc?: string;
  watermark?: {
    show?: boolean;
    /** 0..1 — الافتراضي 0.75 كما في الدليل البصري */
    opacity?: number;
    /** الزاوية العلوية: top-right (افتراضي) أو top-left */
    position?: 'top-right' | 'top-left';
    /** عرض اللوجو بالبكسل — الافتراضي 148 */
    width?: number;
  };
  grain?: {
    show?: boolean;
    /** 0..1 — الافتراضي 0.06 */
    opacity?: number;
  };
  vignette?: {
    show?: boolean;
    /** 0..1 — شدة التظليل، الافتراضي 0.9 */
    strength?: number;
  };
  letterbox?: {show?: boolean};
  /** شريحة HUD صغيرة أعلى الإطار (اسم المكوّن / رقم الحلقة…) */
  hud?: {show?: boolean; left?: string; right?: string};
  /** لون خلفية قاعدة المشهد */
  background?: string;
}

/* ── طبقة حبيبات الفيلم الحيّة ─────────────────────────────────
   SVG feTurbulence مع إزاحة حتمية كل فريم = اهتزاز حبيبات حقيقي
   بدون أي عشوائية غير مستقرة عبر الـ renders ─────────────────── */
const FilmGrain: React.FC<{opacity: number}> = ({opacity}) => {
  const frame = useCurrentFrame();
  // إزاحة صغيرة تتغير كل 2 فريم فقط (عيناك تستقر، الحبيبات لا)
  const step = Math.floor(frame / 2);
  const dx = (mulberry32((step * 2654435761) >>> 0)() - 0.5) * 110;
  const dy = (mulberry32((step * 40503 + 97) >>> 0)() - 0.5) * 110;
  return (
    <AbsoluteFill
      style={{
        zIndex: rawaqLayout.z.grain,
        opacity,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <svg
        width="130%"
        height="130%"
        style={{
          position: 'absolute',
          left: dx,
          top: dy,
          filter: 'contrast(1.4)',
        }}
      >
        <filter id="rawaq-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="3"
            seed={step % 17}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#rawaq-grain)" />
      </svg>
      {/* خدش فيلم أفقي عابر خافت كل ~7 ثوانٍ */}
      <div
        style={{
          position: 'absolute',
          top: `${((frame * 0.55 + 31) % 130) - 15}%`,
          left: 0,
          right: 0,
          height: 1.5,
          background:
            'linear-gradient(90deg, transparent, rgba(242,236,225,0.5) 30%, rgba(242,236,225,0.7) 50%, rgba(242,236,225,0.5) 70%, transparent)',
          opacity: (frame % 420) < 26 ? 0.5 : 0,
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};

/* ── تظليل الحواف السينمائي ─────────────────────────────────── */
const Vignette: React.FC<{strength: number}> = ({strength}) => (
  <AbsoluteFill
    style={{
      zIndex: rawaqLayout.z.vignette,
      pointerEvents: 'none',
      background: `radial-gradient(120% 88% at 50% 46%, ${rawaqColors.vignetteCore} 0%, ${rawaqColors.vignetteCore} 42%, rgba(5,6,10,${
        0.42 * strength
      }) 74%, ${rawaqColors.vignetteEdge} 100%)`,
    }}
  />
);

/* ── أشرطة سينمائية 2.39:1 ───────────────────────────────────── */
const Letterbox: React.FC = () => (
  <AbsoluteFill style={{zIndex: rawaqLayout.z.letterbox, pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: rawaqColors.ink, height: '6.5%'}} />
    <AbsoluteFill
      style={{
        background: rawaqColors.ink,
        height: '6.5%',
        top: 'auto',
        bottom: 0,
      }}
    />
  </AbsoluteFill>
);

/* ═════════════════════════ المكوّن الرئيسي ═════════════════════════ */
export const RawaqMasterCanvas: React.FC<RawaqMasterCanvasProps> = ({
  children,
  logoSrc = 'assets/rawaq-logo.svg',
  watermark,
  grain,
  vignette,
  letterbox,
  hud,
  background = rawaqColors.backgroundPrimary,
}) => {
  const frame = useCurrentFrame();
  const wm = {
    show: true,
    opacity: rawaqLayout.watermarkOpacity,
    position: 'top-right' as const,
    width: 150,
    ...watermark,
  };
  const gr = {show: true, opacity: rawaqLayout.grainOpacity, ...grain};
  const vg = {show: true, strength: rawaqLayout.vignetteOpacity, ...vignette};
  const letterIn = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background, overflow: 'hidden'}}>
      {/* المشهد نفسه */}
      <AbsoluteFill style={{zIndex: rawaqLayout.z.scene}}>{children}</AbsoluteFill>

      {/* ملمس الورق والفيلم */}
      {gr.show ? <FilmGrain opacity={gr.opacity} /> : null}

      {/* الحواف */}
      {vg.show ? <Vignette strength={vg.strength} /> : null}

      {/* أشرطة 2.39:1 */}
      {letterbox?.show ? <Letterbox /> : null}

      {/* لوجو رواق — الزاوية العلوية */}
      {wm.show ? (
        <img
          src={staticFile(logoSrc)}
          alt="رواق"
          style={{
            position: 'absolute',
            zIndex: rawaqLayout.z.watermark,
            top: 30,
            [wm.position === 'top-right' ? 'right' : 'left']: 44,
            width: wm.width,
            opacity: wm.opacity * letterIn,
            mixBlendMode: 'screen',
            filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.6))',
            pointerEvents: 'none',
          }}
        />
      ) : null}

      {/* شريط HUD اختياري */}
      {hud?.show ? (
        <AbsoluteFill
          style={{
            zIndex: rawaqLayout.z.hud,
            pointerEvents: 'none',
            justifyContent: 'flex-end',
            padding: '0 44px 26px',
          }}
        >
          <div
            dir="rtl"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'Cairo, sans-serif',
              fontSize: 15,
              letterSpacing: '0.18em',
              color: 'rgba(242,236,225,0.55)',
              borderTop: '1px solid rgba(212,175,55,0.25)',
              paddingTop: 10,
            }}
          >
            <span>{hud.left ?? 'رواق — DESIGN SYSTEM'}</span>
            <span style={{color: rawaqColors.accentGold}}>{hud.right ?? 'فاز ٠ · التأسيس'}</span>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export default RawaqMasterCanvas;
