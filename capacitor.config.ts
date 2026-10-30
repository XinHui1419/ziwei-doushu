import type { CapacitorConfig } from '@capacitor/cli';

// 手机 App 打包配置：网页静态导出到 out/，由 Capacitor 装进 Android / iOS 壳里
// 用法见 docs/mobile-app.md
const config: CapacitorConfig = {
  appId: 'com.ziwei.doushu',
  appName: '紫微命盘',
  webDir: 'out',
  backgroundColor: '#020810',
};

export default config;
