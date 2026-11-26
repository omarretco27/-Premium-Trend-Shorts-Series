# رواق | Premium Trend Shorts Series — 00 · Design System

**رواق — قصص الأفكار والتحولات الكبرى**
المرحلة صفر: مكتبة مكوّنات موشن جرافيكس قياسية (React + TypeScript + Remotion)
مستوحاة من أرقى مدارس Pinterest الفنية: **Dark Academia · Vox Editorial · Mixed Media Collage · Kinetic Arabic Typography**.

---

## ⚡ البدء السريع

```bash
npm install
npm run studio          # معاينة حيّة في المتصفح
npm run typecheck       # فحص الأنواع
npm run render:showcase # ريندر العرض التعريفي → out/00_Rawaq_Components_Showcase.mp4
```

- المخرجات: `1920×1080 @60fps · H.264`
- الخطوط العربية **مضمّنة محلياً** عبر Fontsource (Amiri · Aref Ruqaa · Cairo · IBM Plex Sans Arabic) — لا حاجة لاتصال بالإنترنت أثناء الريندر.
- ⚠️ الريندر يتطلب Chrome/Chromium. راجع [ملاحظة البيئات المقيّدة](#-ملاحظة-البيئات-المقيّدة-offline-render) إذا كان جهازك بلا شبكة.

---

## 🎨 `src/theme/rawaqTheme.ts` — نظام التصميم

| الرمز | القيمة | الاستخدام |
|---|---|---|
| `backgroundPrimary` | `#0A0B0E` | أسود فحمي — اللوحة السينمائية |
| `backgroundSecondary` | `#14171F` | كحلي ليلي — البطاقات والأسطح |
| `accentGold` | `#D4AF37` | ذهبي عتيق — الأفكار والتحولات |
| `parchment` | `#F2ECE1` | ورق البردي — النصوص الأساسية |
| `crimsonAlert` | `#8B1E1E` | أحمر قاني — الحروب ونقاط الانكسار |

بالإضافة إلى: تدرّجات ذهبية جاهزة (`rawaqGradients`)، إعدادات RTL كاملة (`rtlBaseStyle` — `direction: rtl` مع `font-feature-settings: "liga" "calt" "mark"`)، و`formatYearArabic()` للأرقام العربية المشرقية.

**فيزياء الحركة (لا تستخدم linear أبداً):**
```ts
rawaqSprings.standard   // { damping: 18, stiffness: 90,  mass: 1   } — الدخول الرئيس
rawaqSprings.gentle     // { damping: 26, stiffness: 60,  mass: 1.4 } — كاميرات ولقطات واسعة
rawaqSprings.snappy     // { damping: 14, stiffness: 170, mass: 0.7 } — نقاط وشارات
rawaqSprings.heavy      // { damping: 22, stiffness: 70,  mass: 1.8 } — ورق/أختام ثقيلة

rawaqEasing.out         // Easing.bezier(0.22, 1, 0.36, 1) — المنحنى السينمائي الرئيس
rawaqEasing.inOut       // Easing.bezier(0.65, 0, 0.35, 1) — الكاميرا على المسطرة
rawaqEasing.dramatic    // Easing.bezier(0.16, 1, 0.3, 1)  — ضربات درامية
rawaqEasing.settle      // Easing.bezier(0.34, 1.56, 0.64, 1) — استقرار بارتداد
```

كما يصدّر الثيم `mulberry32(seed)` — مولّد أرقام حتمية للجزيئات (render-safe).

---

## 🖼️ `<RawaqMasterCanvas />` — الغلاف البصري العام

يلفّ أي مشهد ويطبّق تلقائياً: **حبيبات ورق + فيلم سينمائي** (`opacity .06` · `mix-blend-mode: overlay` · اهتزاز حتمي كل فريمين)، **Vignette** ناعم للحواف، و**لوجو رواق** في الزاوية العلوية (`opacity .75`) مع دعم شريط HUD اختياري وأشرطة 2.39:1.

```tsx
<RawaqMasterCanvas
  logoSrc="assets/rawaq-logo.svg"          // افتراضي
  watermark={{show: true, opacity: 0.75, position: 'top-right', width: 150}}
  grain={{show: true, opacity: 0.06}}
  vignette={{show: true, strength: 0.9}}
  letterbox={{show: false}}                 // أشرطة سينمائية اختيارية
  hud={{show: true, left: 'رواق — استوديو المكونات', right: 'PHASE 0'}}
>
  {/* المشهد */}
</RawaqMasterCanvas>
```

---

## 📚 المكوّنات الخمسة

### 1️⃣ `<ParallaxScene />` — لقطة 2.5D
تصوير سينمائي لأي صورة مع عمق ثلاثي الطبقات، غبار ذهبي، وبطاقة سنة + تعليق يُكتب حرفاً حرفاً.

```tsx
<ParallaxScene
  backgroundImg={staticFile('assets/baghdad-1258.jpg')}   // إجباري
  midgroundImg={...}                                      // اختياري
  foregroundImg={...}                                     // اختياري
  cameraDirection="zoom-in"        // 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right'
  cameraIntensity={1.15}           // سرعة الكاميرا (اختياري، افتراضي 1)
  yearBadge="١٢٥٨ م"
  captionText="بغداد تحترق — وهنا بدأت أكبر عملية مسحٍ لذاكرة العالم"
/>
```

### 2️⃣ `<HistoricalTimeline />` — شريط الزمن بأسلوب Vox
مسطرة SVG بشرطات دقيقة وأرقام قرون، كاميرا تنزلق بفيزياء ناعمة، نقاط تتوهّج (ذهبي / قرمزي لنقاط الانكسار)، إطار ورق مقصوص تنبثق فيه صورة الحدث، و«سنة شبح» عملاقة في الخلفية.

```tsx
<HistoricalTimeline
  startYear={762}
  endYear={1300}
  eventDwellFrames={132}           // اختياري (افتراضي 78)
  events={[
    {year: 762,  title: 'تأسيس بغداد — مدينة السلام', thumbnailUrl: staticFile('assets/baghdad-762.jpg')},
    {year: 1258, title: 'سقوط بغداد — هولاكو', thumbnailUrl: staticFile('assets/baghdad-1258.jpg'), isTurningPoint: true},
  ]}
/>
```
> الثوابت `TIMELINE_START_DELAY` و`TIMELINE_EVENT_STEP` مُصدَّرة لمزامنة مؤثرات Tik الصوتية في التايملاين الخارجي.

### 3️⃣ `<QuoteCard />` — بطاقة الاقتباس الفاخرة
زجاج `backdrop-filter: blur(16px)` فوق مخطوطة داكنة، إطار ذهبي يُرسم تلقائياً (`stroke-dashoffset`) مع زخارف زوايا، بورتريه أبيض وأسود عالي التباين + Halftone، والنص يظهر **كلمة كلمة** مع تظليل `highlightWords` بفرشاة ذهبية يدوية.

```tsx
<QuoteCard
  quoteText="بغدادُ واسطةُ عِقدِ البلاد، ودارُ السلام، وأمُّ العراق، ومدينةُ العلم"
  authorName="ياقوت الحموي"
  authorTitle="معجم البلدان — باب الباء"
  authorPortraitUrl={staticFile('assets/scholar-portrait.jpg')}
  era="1179–1229 م · العصر الذهبي"
  highlightWords={['بغداد', 'العلم']}
/>
```

### 4️⃣ `<AnimatedMapRoute />` — خرائط وطرق بأسلوب Cartography داكن
بحر ليلي بخطوط شبكة ذهبية، كتل برية بأسلوب الطباعة الحجرية، وردة بوصلة، إطار نحاسي مزدوج، كاميرا Zoom & Pan، وخط منقط متوهج يُرسَم عبر `@remotion/paths` مع نقطة ضوء تقود الرسم وحلقات نابضة (Pulsing Rings) عند المدن.

```tsx
<AnimatedMapRoute
  startCoords={{x: 620, y: 345}}   // نظام viewBox: 0..1200 × 0..640
  endCoords={{x: 1015, y: 155}}
  cityStartName="بغداد"
  cityEndName="سمرقند"
  routeLabel="طريق الحرير — شريان الكتب والقوافل"
  pulseColor="#D4AF37"
  curvature={95}                   // انحناء القوس (اختياري)
  mapSvgData="<path ... />"        // اختياري — يستبدل اليابسة الافتراضية
/>
```

### 5️⃣ `<SplitScreenComparison />` — التاريخ الحقيقي × ماذا لو؟
انقسام بخط ذهبي مائل متوهج يجتاح الشاشة (Wipe) ثم يستقر بالمنتصف؛ اليمين = التاريخ الحقيقي (Sepia)، واليسار = التاريخ البديل (ألوان سينمائية مشبعة)؛ وفي المنتصف «المِيزان» — مقارنات رقمية بأشرطة spring متدرجة، مع ختم «؟» رواق المركزي.

```tsx
<SplitScreenComparison
  realHistoryMedia={staticFile('assets/baghdad-1258.jpg')}
  realTitle="١٢٥٨ — بغداد تسقط، ودار الكتب تحترق"
  alternateHistoryMedia={staticFile('assets/baghdad-golden-alt.jpg')}
  alternateTitle="بغداد ١٣٠٠ — عاصمة العلم التي لم تسقط قط"
  comparisonMetrics={[
    {label: 'ازدهار العلم والترجمة', realValue: 18, altValue: 96},
    {label: 'بقاء دار الحكمة',       realValue: 0,  altValue: 100},
  ]}
  dividerTiltDeg={6}
/>
```

---

## 🎬 `RawaqDesignSystemShowcase` — العرض الرسمي

كومبوزيشن `RawaqDesignSystemShowcase` · **45 ثانية · 2700 فريم · 1920×1080 @60fps** حول موضوع **«ماذا لو لم تسقط بغداد؟»**:

| التوقيت | المشهد |
|---|---|
| 0–4ث | الافتتاحي — شعار رواق + وعد الحلقة |
| 4–14ث | `٠١ <ParallaxScene />` — سقوط بغداد ١٢٥٨ |
| 14–24ث | `٠٢ <HistoricalTimeline />` — 762 ← 830 ← 945 ← 1258 |
| 24–31.8ث | `٠٣ <QuoteCard />` — ياقوت الحموي + تظليل ذهبي |
| 31.8–38.7ث | `٠٤ <AnimatedMapRoute />` — طريق الحرير بغداد ← سمرقند |
| 38.7–45ث | `٠٥ <SplitScreenComparison />` — المقارنة الكبرى |

مؤثرات صوتية: **Whooshes** عند كل انتقال، **Ticks** عند تفعيل كل حدث زمني، **Boom** عند لحظة الانكسار (1258) — مولّدة برمجياً في `public/sfx/`.

---

## 📦 البنية

```
src/
  theme/          rawaqTheme.ts · fonts.ts          # الهوية: ألوان، RTL، فيزياء
  components/rawaq/
    RawaqMasterCanvas.tsx                           # الغلاف السينمائي
    ParallaxScene.tsx · HistoricalTimeline.tsx
    QuoteCard.tsx · AnimatedMapRoute.tsx
    SplitScreenComparison.tsx · index.ts            # barrel export
  showcase/       RawaqDesignSystemShowcase.tsx     # كومبوزيشن العرض
public/
  assets/         اللوجو + الصور المولّدة (بغداد 1258، البدائل…)
  sfx/            whoosh.wav · tick.wav · boom.wav
```

## 🔌 مذكرة HyperFrames
المكوّنات مكتوبة بـ React/TS قياسية بلا تبعيات خاصة بـ HyperFrames؛ يمكن تغليف أي مكوّن داخل تركيبة HyperFrames (HTML/GSAP) عبر بوابة `@remotion/player` أو عرضه كطبقة مستقلة. لا توجد حزمة npm رسمية باسم `hyperframes` في منظومة Remotion حتى تاريخه — تم الاكتفاء بـ Remotion الرسمي (انظر [مقارنة HyperFrames vs Remotion](https://pireel.com/en/blog/hyperframes-vs-remotion)).

## 🌐 ملاحظة البيئات المقيّدة (offline render)
يتطلّب Remotion متصفح Chrome. على الأجهزة المتصلة يُنزَّل تلقائياً. في بيئات بلا شبكة خارجية:
1. ضع `chrome-headless-shell` داخل `.toolchain/chrome-headless-shell` مع مكتبات NSS/NSPR في `.toolchain/nss-lib/`.
2. شغّل الريندر مع `LD_LIBRARY_PATH=$PWD/.toolchain/nss-lib npx remotion render ...`

## 📄 الترخيص وحقوق الصور
- الصور المرفقة في `public/assets/` مولّدة بالكامل داخل المشروع لهذا العرض.
- اللوجو ملك لقناة رواق (من Google Drive — مجلد BRAND).
- Remotion مجاني للفرق حتى 3 أفراد، ويحتاج ترخيصاً للمؤسسات الأكبر.
