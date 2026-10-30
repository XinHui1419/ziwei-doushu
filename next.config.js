/** @type {import('next').NextConfig} */

// MOBILE_BUILD=1：静态导出到 out/，给 Capacitor 打包成手机 App（见 docs/mobile-app.md）
const isMobile = process.env.MOBILE_BUILD === '1';

const nextConfig = {
  transpilePackages: ['lunar-javascript'],
  ...(isMobile && {
    output: 'export',
    // App 里每个页面是 目录/index.html，带尾斜杠才能直接按文件找到
    trailingSlash: true,
    images: { unoptimized: true },
    env: { NEXT_PUBLIC_MOBILE_BUILD: '1' },
  }),
};

module.exports = nextConfig;
