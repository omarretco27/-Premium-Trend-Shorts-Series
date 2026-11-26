/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  <AnimatedMapRoute />  ·  الخرائط الجغرافية بأسلوب Cartography داكن
 * ═══════════════════════════════════════════════════════════════════════════
 *  • خريطة "Dark Vintage Cartography": بحر ليلي، خطوط شبكة ذهبية،
 *    كتل برية محفورة، وردة بوصلة، وإطار نحاسي مزدوج.
 *  • كاميرا Zoom & Pan سينمائية تنطلق من نقطة البداية وتتسع للمسار.
 *  • خط منقط متوهج يُرسم من البداية للنهاية (@remotion/paths)
 *    مع نقطة ضوء تقود الرسم، ودوائر نبضية (Pulsing Rings) عند المدن.
 *  • بطاقات أسماء المدن بالعربية + شارة routeLabel عند اكتمال المسار.
 *
 * الإحداثيات بنظام viewBox: 0..1200 × 0..640
 *
 * <AnimatedMapRoute
 *   startCoords={{x:640, y:330}} endCoords={{x:1010, y:150}}
 *   cityStartName="بغداد" cityEndName="سمرقند"
 *   routeLabel="طريق الحرير — شريان التجارة والعلم"
 *   pulseColor="#D4AF37"
 * />
 */
import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {
  rawaqColors,
  rawaqGradients,
  rawaqFonts,
  rawaqSprings,
  rawaqEasing,
  rtlBaseStyle,
} from '../../theme/rawaqTheme';

/* ── الأنواع ─────────────────────────────────────────────────── */
export interface MapPoint {
  x: number;
  y: number;
}

export interface AnimatedMapRouteProps {
  /**
   * SVG خام اختياري لكتل اليابسة (يستبدل الرسم الافتراضي لميسوبوتاميا).
   * تُحقن داخل <g> ضمن لوحة 1200×640 — لا تضف <svg> جذرياً داخها.
   */
  mapSvgData?: string;
  startCoords: MapPoint;
  endCoords: MapPoint;
  routeLabel?: string;
  /** لون النبضات والخط — الافتراضي #D4AF37 */
  pulseColor?: string;
  cityStartName?: string;
  cityEndName?: string;
  /** انحناء القوس بالبكسل (موجب = يقوس للأعلى) */
  curvature?: number;
}

const VB_W = 1200;
const VB_H = 640;

/* ═══════ الكتلة البرية الافتراضية — ميسوبوتاميا بأسلوب الطباعة الحجرية ═══════ */
const DEFAULT_LANDMASS = `
  <path d="M -40 210 L 120 150 L 265 175 L 385 120 L 520 150 L 640 122 L 770 165 L 905 130 L 1015 175 L 1240 150 L 1240 660 L -40 660 Z"
        fill="#1A2233" stroke="rgba(212,175,55,0.4)" stroke-width="1.6"/>
  <path d="M -40 330 L 105 300 L 250 330 L 360 295 L 505 320 L 620 292 L 760 330 L 880 300 L 1000 336 L 1240 318"
        fill="none" stroke="rgba(242,236,225,0.10)" stroke-width="1.1" stroke-dasharray="1 7"/>
  <path d="M 300 420 Q 380 380 470 420 T 640 430 T 815 425" fill="none" stroke="rgba(212,175,55,0.35)" stroke-width="1.4" stroke-dasharray="14 10"/>
  <path d="M 250 250 Q 330 210 430 245 T 610 240" fill="none" stroke="rgba(212,175,55,0.22)" stroke-width="1.2" stroke-dasharray="10 12"/>
  <circle cx="300" cy="248" r="2.6" fill="rgba(242,236,225,0.35)"/>
  <circle cx="470" cy="240" r="2.6" fill="rgba(242,236,225,0.35)"/>
  <circle cx="610" cy="243" r="2.6" fill="rgba(242,236,225,0.35)"/>
  <circle cx="428" cy="419" r="2.6" fill="rgba(242,236,225,0.3)"/>
  <circle cx="640" cy="429" r="2.6" fill="rgba(242,236,225,0.3)"/>
  <text x="492" y="205" font-family="'IBM Plex Sans Arabic',sans-serif" font-size="17" fill="rgba(242,236,225,0.42)" letter-spacing="4">بِلاد الرافدين</text>
  <text x="250" y="470" font-family="'IBM Plex Sans Arabic',sans-serif" font-size="17" fill="rgba(242,236,225,0.42)" letter-spacing="4">الجزيرة العربية</text>
  <text x="905" y="118" font-family="'IBM Plex Sans Arabic',sans-serif" font-size="17" fill="rgba(242,236,225,0.42)" letter-spacing="4">خُراسان</text>
`;

/* وردة البوصلة */
const Compass: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x},${y})`} opacity={0.9}>
    <circle r={30} fill="rgba(10,11,14,0.6)" stroke={rawaqColors.lineGoldStrong} strokeWidth={1.4} />
    <circle r={22} fill="none" stroke={rawaqColors.lineGold} strokeWidth={0.8} />
    <path d="M 0 -26 L 4.5 -4.5 L 26 0 L 4.5 4.5 L 0 26 L -4.5 4.5 L -26 0 L -4.5 -4.5 Z"
          fill={rawaqColors.accentGold} opacity={0.9} stroke="#0A0B0E" strokeWidth={0.8}/>
    <circle r={3.4} fill="#0A0B0E" stroke={rawaqColors.accentGold} strokeWidth={1.2} />
    <text y={-36} textAnchor="middle" fontSize={15} fill={rawaqColors.accentGold}
          fontFamily="'IBM Plex Sans Arabic',sans-serif" fontWeight={700}>ش</text>
  </g>
);

export const AnimatedMapRoute: React.FC<AnimatedMapRouteProps> = ({
  mapSvgData,
  startCoords,
  endCoords,
  routeLabel,
  pulseColor = rawaqColors.accentGold,
  cityStartName = 'بغداد',
  cityEndName = 'سمرقند',
  curvature = 120,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  /* ── مسار القوس: من S إلى E بقوس انسيابي ── */
  const {d, length} = useMemo(() => {
    const mx = (startCoords.x + endCoords.x) / 2;
    const my = (startCoords.y + endCoords.y) / 2 - curvature;
    const dx = endCoords.x - startCoords.x;
    const dy = endCoords.y - startCoords.y;
    const len = Math.hypot(dx, dy);
    const c1x = startCoords.x + dx * 0.28;
    const c1y = startCoords.y + dy * 0.28 - curvature * 0.9;
    const c2x = startCoords.x + dx * 0.72;
    const c2y = startCoords.y + dy * 0.72 - curvature * 0.9;
    const path = `M ${startCoords.x} ${startCoords.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endCoords.x} ${endCoords.y}`;
    return {d: path, length: getLength(path)};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(startCoords), JSON.stringify(endCoords), curvature]);

  const DRAW_START = 26;
  const DRAW_END = DRAW_START + Math.round(fps * 3.1);

  const progress = interpolate(frame, [DRAW_START, DRAW_END], [0, 1], {
    easing: rawaqEasing.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tipPoint = getPointAtLength(d, length * progress);
  const tip = tipPoint ?? {x: endCoords.x, y: endCoords.y};

  /* ── الكاميرا: تنطلق قريبة من البداية ثم تتسع للمسار ── */
  const camZoom = interpolate(frame, [0, DRAW_END], [1.28, 1.0], {
    easing: rawaqEasing.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const originX = ((startCoords.x + endCoords.x) / 2 / VB_W) * 100;
  const originY = ((startCoords.y + endCoords.y) / 2 / VB_H) * 100;

  /* ── شارة المسار بعد اكتمال الرسم ── */
  const labelSpring = spring({
    frame: frame - DRAW_END - 4,
    fps,
    config: rawaqSprings.snappy,
  });

  const mid = getPointAtLength(d, length * 0.5);

  /* ── الحلقات النابضة ── */
  const Pulse = ({cx, cy, offset}: {cx: number; cy: number; offset: number}) => {
    const rings = [0, 26, 52];
    return (
      <>
        {rings.map((off, i) => {
          const cycle = (frame * 1.35 + off + offset) % 78;
          const r = 6 + cycle * 0.62;
          const o = Math.max(0, 1 - cycle / 78);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={pulseColor}
              strokeWidth={2.2}
              opacity={o * 0.85}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={7.5} fill={pulseColor} stroke="#0A0B0E" strokeWidth={2} />
      </>
    );
  };

  const CityTag: React.FC<{p: MapPoint; name: string; anchor: 'start' | 'end'}> = ({
    p,
    name,
    anchor,
  }) => (
    <g transform={`translate(${p.x}, ${p.y - 46})`}>
      <rect
        x={anchor === 'start' ? -14 : -132}
        y={-24}
        width={146}
        height={38}
        rx={4}
        fill="rgba(10,11,14,0.82)"
        stroke={rawaqColors.lineGoldStrong}
        strokeWidth={1.3}
      />
      <text
        x={anchor === 'start' ? 59 : -59}
        y={2}
        textAnchor="middle"
        fontSize={22}
        fontWeight={700}
        fill={rawaqColors.parchment}
        fontFamily="'IBM Plex Sans Arabic',sans-serif"
      >
        {name}
      </text>
    </g>
  );

  return (
    <AbsoluteFill
      style={{
        ...rtlBaseStyle,
        background: '#07090E',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 84,
        overflow: 'hidden',
      }}
    >
      {/* ترويسة */}
      <div style={{position: 'absolute', top: 108, right: 96, zIndex: 6}}>
        <div
          style={{
            fontFamily: rawaqFonts.label,
            fontSize: 19,
            letterSpacing: '0.32em',
            color: rawaqColors.accentGold,
            fontWeight: 700,
          }}
        >
          الخريطة · CARTOGRAPHY
        </div>
        <div
          style={{
            fontFamily: rawaqFonts.display,
            fontSize: 52,
            color: rawaqColors.parchment,
            marginTop: 8,
          }}
        >
          شريان العالم الإسلامي
        </div>
      </div>

      {/* ══════════ لوحة الخريطة النحاسية ══════════ */}
      <div
        style={{
          position: 'relative',
          width: 1520,
          height: 740,
          borderRadius: 6,
          padding: 14,
          background:
            'linear-gradient(160deg, #3A2F14 0%, #8A7223 18%, #D4AF37 32%, #5C4C1C 50%, #D4AF37 68%, #40351A 100%)',
          boxShadow:
            '0 50px 120px rgba(0,0,0,0.75), inset 0 0 40px rgba(0,0,0,0.6)',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: rawaqGradients.mapParchment,
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* الكاميرا */}
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            width="100%"
            height="100%"
            style={{
              transform: `scale(${camZoom})`,
              transformOrigin: `${originX}% ${originY}%`,
              display: 'block',
            }}
          >
            {/* خطوط الشبكة */}
            <g stroke="rgba(212,175,55,0.16)" strokeWidth={1} strokeDasharray="3 9">
              {[150, 300, 450, 600, 750, 900, 1050].map((x) => (
                <line key={x} x1={x} y1={0} x2={x} y2={VB_H} />
              ))}
              {[120, 240, 360, 480].map((y) => (
                <line key={y} x1={0} y1={y} x2={VB_W} y2={y} />
              ))}
            </g>

            {/* عروق طولية للبحر */}
            <g stroke="rgba(242,236,225,0.05)" strokeWidth={1}>
              {[60, 180, 300, 420, 540].map((y) => (
                <path key={y} d={`M 0 ${y} Q 300 ${y + 14}, 600 ${y} T 1200 ${y}`} fill="none" />
              ))}
            </g>

            {/* اليابسة */}
            {mapSvgData ? (
              <g dangerouslySetInnerHTML={{__html: mapSvgData}} />
            ) : (
              <g dangerouslySetInnerHTML={{__html: DEFAULT_LANDMASS}} />
            )}

            {/* المسار — هالة منقطة خافتة كاملة */}
            <path d={d} fill="none" stroke={pulseColor} strokeWidth={5}
                  strokeDasharray="2 16" opacity={0.35} strokeLinecap="round" />
            {/* المسار — خط الرسم المتوهج */}
            <path
              d={d}
              fill="none"
              stroke={pulseColor}
              strokeWidth={5.5}
              strokeLinecap="round"
              strokeDasharray={length}
              strokeDashoffset={length * (1 - progress)}
              opacity={0.95}
              style={{filter: `drop-shadow(0 0 12px ${pulseColor})`}}
            />
            {/* رأس الإضاءة */}
            {progress > 0 && progress < 1 && (
              <circle cx={tip.x} cy={tip.y} r={9} fill="#FFF7D6"
                      style={{filter: 'blur(1px) drop-shadow(0 0 16px #F5E7B2)'}} />
            )}

            {/* حلقات نابضة */}
            <Pulse cx={startCoords.x} cy={startCoords.y} offset={0} />
            {progress > 0.55 && (
              <Pulse cx={endCoords.x} cy={endCoords.y} offset={30} />
            )}

            {/* تسميات المدن */}
            <CityTag p={startCoords} name={cityStartName} anchor="start" />
            {progress > 0.5 && <CityTag p={endCoords} name={cityEndName} anchor="end" />}

            {/* وردة البوصلة وحدود اللوحة */}
            <Compass x={96} y={96} />
          </svg>

          {/* إطار اللوحة الداخلي المزدوج */}
          <div
            style={{
              position: 'absolute',
              inset: 12,
              border: `1.5px solid ${rawaqColors.lineGoldStrong}`,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 18,
              border: `0.75px solid ${rawaqColors.lineGold}`,
              pointerEvents: 'none',
            }}
          />

          {/* شارة routeLabel */}
          {routeLabel && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: 44,
                transform: `translate(-50%, ${interpolate(labelSpring, [0, 1], [60, 0])}px) scale(${interpolate(labelSpring, [0, 1], [0.7, 1])})`,
                opacity: interpolate(labelSpring, [0, 0.6], [0, 1], {
                  extrapolateRight: 'clamp',
                }),
                direction: 'rtl',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: 'rgba(10,11,14,0.85)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${rawaqColors.lineGoldStrong}`,
                padding: '12px 26px',
                borderRadius: 4,
                boxShadow: '0 18px 50px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.18)',
              }}
            >
              <svg width="72" height="10" viewBox="0 0 72 10">
                <line x1="0" y1="5" x2="72" y2="5" stroke={pulseColor} strokeWidth="2.6" strokeDasharray="5 6" />
                <circle cx="2" cy="5" r="3.4" fill={pulseColor} />
                <circle cx="70" cy="5" r="3.4" fill={pulseColor} />
              </svg>
              <span
                style={{
                  fontFamily: rawaqFonts.label,
                  fontWeight: 600,
                  fontSize: 25,
                  color: rawaqColors.parchment,
                  whiteSpace: 'nowrap',
                }}
              >
                {routeLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default AnimatedMapRoute;
