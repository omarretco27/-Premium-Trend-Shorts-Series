import {Config} from '@remotion/cli/config';
import fs from 'node:fs';
import path from 'node:path';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('angle');
Config.setEntryPoint('./src/index.ts');

/**
 * بيئة العرض بدون شبكة خارجية:
 * إذا وُجد متصفح Chromium داخل .toolchain (كما في sandbox الإنتاج)
 * نستخدمه؛ وإلا سيسقط Remotion إلى سلوكه الافتراضي
 * (تنزيل chrome-headless-shell تلقائياً، كما على أجهزة المطورين).
 */
const localBrowser =
  process.env.REMOTION_BROWSER_EXECUTABLE ??
  path.resolve(process.cwd(), '.toolchain', 'chrome-headless-shell');
if (fs.existsSync(localBrowser)) {
  Config.setBrowserExecutable(localBrowser);
}
