# 手机 App（Android / iOS）

本仓库可以打包成手机 App。做法是用 [Capacitor](https://capacitorjs.com/) 把网页**静态导出**后装进原生壳：
排盘引擎、古籍库全部在手机本地运行，**不需要服务器，离线也能排盘**。

| 平台 | 工程目录 | 需要什么 |
|---|---|---|
| Android | `android/` | 什么都不用装：GitHub Actions 自动出 APK；本地打包需 Android Studio |
| iOS | `ios/` | 一台 Mac + Xcode；装到真机/上架需 Apple 开发者账号 |

> 和网页版一样，开源版不含 `/api/*` 后端，App 里的 AI 解读、合盘分析会提示「开源版不含该接口」，排盘不受影响。

## 方式一：GitHub Actions 自动打包 Android APK（最省事）

1. 打开你 fork 的仓库 → **Actions** 页。fork 的仓库默认关闭 Actions，第一次需点 **I understand my workflows, go ahead and enable them**。
2. 左侧选 **Android APK** → 右侧 **Run workflow**（推送到 `main` 也会自动跑）。
3. 大约 5 分钟跑完，进入这次运行页面，底部 **Artifacts** 下载 `ziwei-android-apk`，解压得到 `app-debug.apk`。
4. 把 APK 发到 Android 手机上打开安装（首次需在系统设置里允许「安装未知来源应用」）。

这是调试版（debug）APK，适合自己和朋友安装；上架 Google Play 需要签名的正式版，见下文。

## 方式二：本地打包

先装好 Node.js 22，然后：

```bash
npm ci
npm run mobile:build      # 静态导出到 out/ 并同步进 android/、ios/
```

**Android**：装 [Android Studio](https://developer.android.com/studio)，然后

```bash
npm run mobile:android    # 构建并用 Android Studio 打开工程
```

在 Android Studio 里点 ▶ 运行到手机/模拟器；正式包用 **Build → Generate Signed App Bundle / APK**。

**iOS**（需要 Mac）：装 Xcode，然后

```bash
npm run mobile:ios        # 构建并用 Xcode 打开工程
```

在 Xcode 里选好 Team（Apple ID）后点 ▶ 运行到 iPhone；上架用 **Product → Archive**。

改了网页代码后，重新跑一次 `npm run mobile:build` 即可同步到两个原生工程。

## 原理与改动点

- `next.config.js`：环境变量 `MOBILE_BUILD=1` 时 `output: 'export'`，输出纯静态文件到 `out/`；平时的 `npm run build` / Vercel 部署不受影响。
- `capacitor.config.ts`：App 名称「紫微命盘」、包名 `com.ziwei.doushu`、网页目录 `out/`。想改包名，改这里以及 `android/app/build.gradle` 的 `applicationId`、Xcode 里的 Bundle Identifier。
- `lib/site.ts` 的 `IS_MOBILE_APP`：App 里不加载 Vercel 统计脚本，`/api/*` 直接按「接口不存在」处理。
- App 图标与启动图目前是 Capacitor 默认图。准备一张 1024×1024 的图标后，可用 [`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets) 一键生成各尺寸。
