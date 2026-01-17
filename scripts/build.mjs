/**
 * LP Template - メインビルドスクリプト
 *
 * design/ の内容を最適化して build/ に出力
 *
 * 機能:
 * - 画像最適化（リサイズ、AVIF/WebP変換）
 * - width/height自動付与
 * - lazy loading自動付与（最初の画像以外）
 * - <img>→<picture>変換
 * - OGP/metaタグ注入
 * - 広告タグ注入
 * - コンバージョンコード注入
 * - 構造化データ生成
 * - favicon生成
 * - HTML/CSS/JS minify
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { minify as minifyHtml } from "html-minifier-terser";
import CleanCSS from "clean-css";
import { minify as minifyJs } from "terser";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const designDir = path.resolve(projectRoot, "design");
const buildDir = path.resolve(projectRoot, "build");

// 環境変数の読み込み
async function loadEnv() {
  const envPath = path.resolve(projectRoot, ".env");
  const env = {};

  try {
    const content = await fs.readFile(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        env[key.trim()] = valueParts.join("=").trim();
      }
    });
  } catch (error) {
    console.log("Note: .env file not found, using defaults");
  }

  return env;
}

// 画像サイズ情報を読み込み
async function loadImageDimensions() {
  const dimensionsPath = path.resolve(projectRoot, ".image-dimensions.json");
  try {
    const content = await fs.readFile(dimensionsPath, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

// ディレクトリをコピー
async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// HTMLエスケープ
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// OGP/metaタグを生成
function generateMetaTags(env) {
  const tags = [];

  if (env.SITE_DESCRIPTION) {
    tags.push(`<meta name="description" content="${escapeHtml(env.SITE_DESCRIPTION)}">`);
  }

  tags.push(`<meta property="og:type" content="${escapeHtml(env.OG_TYPE || 'website')}">`);

  if (env.SITE_TITLE) {
    tags.push(`<meta property="og:title" content="${escapeHtml(env.SITE_TITLE)}">`);
  }

  if (env.SITE_DESCRIPTION) {
    tags.push(`<meta property="og:description" content="${escapeHtml(env.SITE_DESCRIPTION)}">`);
  }

  if (env.OG_URL) {
    tags.push(`<meta property="og:url" content="${escapeHtml(env.OG_URL)}">`);
  }

  if (env.OG_IMAGE_URL) {
    tags.push(`<meta property="og:image" content="${escapeHtml(env.OG_IMAGE_URL)}">`);
    tags.push(`<meta property="og:image:width" content="${env.OG_IMAGE_WIDTH || '1200'}">`);
    tags.push(`<meta property="og:image:height" content="${env.OG_IMAGE_HEIGHT || '630'}">`);
  }

  if (env.OG_SITE_NAME) {
    tags.push(`<meta property="og:site_name" content="${escapeHtml(env.OG_SITE_NAME)}">`);
  }

  tags.push(`<meta property="og:locale" content="${env.OG_LOCALE || 'ja_JP'}">`);

  // Twitter Card
  tags.push(`<meta name="twitter:card" content="${env.TWITTER_CARD || 'summary_large_image'}">`);

  if (env.TWITTER_SITE) {
    tags.push(`<meta name="twitter:site" content="${escapeHtml(env.TWITTER_SITE)}">`);
  }

  if (env.SITE_TITLE) {
    tags.push(`<meta name="twitter:title" content="${escapeHtml(env.SITE_TITLE)}">`);
  }

  if (env.SITE_DESCRIPTION) {
    tags.push(`<meta name="twitter:description" content="${escapeHtml(env.SITE_DESCRIPTION)}">`);
  }

  if (env.OG_IMAGE_URL) {
    tags.push(`<meta name="twitter:image" content="${escapeHtml(env.OG_IMAGE_URL)}">`);
  }

  return tags.length > 0 ? `<!-- OGP -->\n${tags.join("\n")}` : "";
}

// 広告タグを生成
function generateAnalyticsTags(env) {
  const tags = [];

  // Google Analytics 4
  if (env.GA_MEASUREMENT_ID) {
    tags.push(`
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${env.GA_MEASUREMENT_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${env.GA_MEASUREMENT_ID}');
  ${env.GA_ADS_ID ? `gtag('config', '${env.GA_ADS_ID}');` : ""}
</script>`);
  }

  // Meta Pixel
  if (env.META_PIXEL_ID) {
    tags.push(`
<!-- Meta Pixel -->
<script>
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${env.META_PIXEL_ID}');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${env.META_PIXEL_ID}&ev=PageView&noscript=1"/></noscript>`);
  }

  // LINE Tag
  if (env.LINE_TAG_ID) {
    tags.push(`
<!-- LINE Tag -->
<script>
  (function(g,d,o){g._ltq=g._ltq||[];g._lt=g._lt||function(){g._ltq.push(arguments)};
  var h=d.getElementsByTagName(o)[0];var s=d.createElement(o);s.async=1;
  s.src='https://d.line-scdn.net/n/line_tag/public/release/v1/lt.js';
  h.parentNode.insertBefore(s,h)})(window,document,'script');
  _lt('init',{customerType:'account',tagId:'${env.LINE_TAG_ID}'});
  _lt('send','pv',['${env.LINE_TAG_ID}']);
</script>
<noscript><img height="1" width="1" style="display:none" src="https://tr.line.me/tag.gif?c_t=lap&t_id=${env.LINE_TAG_ID}&e=pv&noscript=1"/></noscript>`);
  }

  // Yahoo Tag
  if (env.YAHOO_RETARGETING_ID) {
    tags.push(`
<!-- Yahoo Tag -->
<script async src="https://s.yimg.jp/images/listing/tool/cv/ytag.js"></script>
<script>
  window.yjDataLayer = window.yjDataLayer || [];
  function ytag(){yjDataLayer.push(arguments);}
  ytag('config', { yahoo_ss_retargeting_id: '${env.YAHOO_RETARGETING_ID}' });
</script>`);
  }

  return tags.join("\n");
}

// 構造化データを生成
function generateStructuredData(env, html) {
  const type = env.STRUCTURED_DATA_TYPE;
  if (!type) return "";

  let data = null;

  switch (type.toLowerCase()) {
    case "event":
      data = {
        "@context": "https://schema.org",
        "@type": "Event",
        name: env.SITE_TITLE || "",
        description: env.SITE_DESCRIPTION || "",
        startDate: env.EVENT_START_DATE || "",
        endDate: env.EVENT_END_DATE || "",
        location: {
          "@type": "Place",
          name: env.EVENT_LOCATION_NAME || "",
          address: env.EVENT_LOCATION_ADDRESS || "",
        },
        offers: {
          "@type": "Offer",
          price: env.EVENT_PRICE || "0",
          priceCurrency: "JPY",
          availability: "https://schema.org/InStock",
          url: env.OG_URL || "",
        },
        organizer: {
          "@type": "Organization",
          name: env.OG_SITE_NAME || "",
        },
      };
      break;

    case "product":
      data = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: env.SITE_TITLE || "",
        description: env.SITE_DESCRIPTION || "",
        image: env.OG_IMAGE_URL || "",
        offers: {
          "@type": "Offer",
          price: env.PRODUCT_PRICE || "0",
          priceCurrency: "JPY",
          availability: "https://schema.org/InStock",
        },
      };
      break;

    case "localbusiness":
      data = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: env.OG_SITE_NAME || "",
        description: env.SITE_DESCRIPTION || "",
        image: env.OG_IMAGE_URL || "",
        telephone: env.BUSINESS_PHONE || "",
        address: {
          "@type": "PostalAddress",
          streetAddress: env.BUSINESS_ADDRESS || "",
        },
      };
      break;

    case "organization":
      data = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: env.OG_SITE_NAME || "",
        url: env.OG_URL || "",
        logo: env.OG_IMAGE_URL || "",
        description: env.SITE_DESCRIPTION || "",
      };
      break;

    case "faqpage":
      // FAQをHTMLから抽出
      const faqItems = [];
      const faqRegex = /<summary[^>]*>([\s\S]*?)<\/summary>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi;
      let match;
      while ((match = faqRegex.exec(html)) !== null) {
        faqItems.push({
          "@type": "Question",
          name: match[1].trim(),
          acceptedAnswer: {
            "@type": "Answer",
            text: match[2].trim(),
          },
        });
      }
      if (faqItems.length > 0) {
        data = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems,
        };
      }
      break;
  }

  if (data) {
    return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
  }

  return "";
}

// コンバージョン追跡コードを生成
function generateConversionCode(env) {
  const code = [];

  code.push(`
(function() {
  document.querySelectorAll('[data-cv]').forEach(function(el) {
    el.addEventListener('click', function() {
      var cvType = this.dataset.cv;
      var label = this.textContent || this.innerText;
`);

  if (env.GA_MEASUREMENT_ID) {
    code.push(`
      if (typeof gtag === 'function') {
        gtag('event', cvType, { event_category: 'conversion', event_label: label });
      }`);
  }

  if (env.GA_ADS_ID && env.GA_ADS_CONVERSION_LABEL) {
    code.push(`
      if (typeof gtag === 'function') {
        gtag('event', 'conversion', { send_to: '${env.GA_ADS_ID}/${env.GA_ADS_CONVERSION_LABEL}' });
      }`);
  }

  if (env.META_PIXEL_ID) {
    code.push(`
      if (typeof fbq === 'function') {
        fbq('track', cvType === 'tel' ? 'Contact' : 'Lead');
      }`);
  }

  if (env.LINE_TAG_ID) {
    code.push(`
      if (typeof _lt === 'function') {
        _lt('send', 'cv', { type: cvType });
      }`);
  }

  if (env.YAHOO_CONVERSION_ID && env.YAHOO_CONVERSION_LABEL) {
    code.push(`
      if (typeof ytag === 'function') {
        ytag('conversion', { yahoo_conversion_id: '${env.YAHOO_CONVERSION_ID}', yahoo_conversion_label: '${env.YAHOO_CONVERSION_LABEL}' });
      }`);
  }

  code.push(`
    });
  });
`);

  // スクロール深度トラッキング
  if (env.TRACK_SCROLL_DEPTH === "true" && env.GA_MEASUREMENT_ID) {
    code.push(`
  var scrollTracked = {};
  window.addEventListener('scroll', function() {
    var scrollPercent = Math.floor((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
    [25, 50, 75, 90].forEach(function(point) {
      if (scrollPercent >= point && !scrollTracked[point]) {
        scrollTracked[point] = true;
        if (typeof gtag === 'function') { gtag('event', 'scroll_depth', { depth: point }); }
      }
    });
  });
`);
  }

  // 滞在時間トラッキング
  if (env.TRACK_TIME_ON_PAGE && env.GA_MEASUREMENT_ID) {
    const times = env.TRACK_TIME_ON_PAGE.split(",").map((t) => parseInt(t.trim(), 10));
    code.push(`
  var timeTracked = {};
  var timePoints = ${JSON.stringify(times)};
  var startTime = Date.now();
  setInterval(function() {
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    timePoints.forEach(function(seconds) {
      if (elapsed >= seconds && !timeTracked[seconds]) {
        timeTracked[seconds] = true;
        if (typeof gtag === 'function') { gtag('event', 'time_on_page', { seconds: seconds }); }
      }
    });
  }, 1000);
`);
  }

  code.push(`})();`);
  return code.join("");
}

// width/height自動付与 + lazy loading + <picture>変換
async function processImages(html, dimensions) {
  let imageIndex = 0;

  // <img>タグを処理
  const imgRegex = /<img([^>]*)src=["']([^"']+)["']([^>]*)>/gi;

  html = html.replace(imgRegex, (match, before, src, after) => {
    imageIndex++;
    const isFirst = imageIndex === 1;

    // すでにwidth/heightがあるかチェック
    const hasWidth = /width=/i.test(before + after);
    const hasHeight = /height=/i.test(before + after);
    const hasLazy = /loading=/i.test(before + after);

    let newBefore = before;
    let newAfter = after;

    // width/height を追加
    if (!hasWidth || !hasHeight) {
      const relativePath = src.startsWith("/") ? src.slice(1) : src;
      const dimKey = Object.keys(dimensions).find((k) => k.endsWith(relativePath));
      if (dimKey && dimensions[dimKey]) {
        const { width, height } = dimensions[dimKey];
        if (!hasWidth) newAfter += ` width="${width}"`;
        if (!hasHeight) newAfter += ` height="${height}"`;
      }
    }

    // lazy loading を追加（最初の画像以外）
    if (!isFirst && !hasLazy) {
      newAfter += ' loading="lazy"';
    }

    // <picture>変換（PNG/JPG/JPEGの場合）
    const ext = path.extname(src).toLowerCase();
    if ([".png", ".jpg", ".jpeg"].includes(ext)) {
      const baseName = src.replace(/\.(png|jpe?g)$/i, "");
      return `<picture>
  <source srcset="${baseName}.avif" type="image/avif">
  <source srcset="${baseName}.webp" type="image/webp">
  <img${newBefore}src="${src}"${newAfter}>
</picture>`;
    }

    return `<img${newBefore}src="${src}"${newAfter}>`;
  });

  return html;
}

// favicon生成
async function generateFavicons(designDir, buildDir) {
  const faviconSrc = path.join(designDir, "images", "favicon.png");

  try {
    await fs.access(faviconSrc);
  } catch {
    console.log("  favicon.png not found, skipping favicon generation");
    return "";
  }

  const sizes = [
    { size: 16, name: "favicon-16x16.png" },
    { size: 32, name: "favicon-32x32.png" },
    { size: 180, name: "apple-touch-icon.png" },
    { size: 192, name: "android-chrome-192x192.png" },
    { size: 512, name: "android-chrome-512x512.png" },
  ];

  const faviconTags = [];

  for (const { size, name } of sizes) {
    const outputPath = path.join(buildDir, name);
    await sharp(faviconSrc).resize(size, size).png().toFile(outputPath);
  }

  // ICO生成（16x16）
  const icoPath = path.join(buildDir, "favicon.ico");
  await sharp(faviconSrc).resize(32, 32).toFile(icoPath);

  faviconTags.push(`<link rel="icon" type="image/x-icon" href="/favicon.ico">`);
  faviconTags.push(`<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">`);
  faviconTags.push(`<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">`);
  faviconTags.push(`<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`);

  console.log("✓ Favicon generated");
  return `<!-- Favicon -->\n${faviconTags.join("\n")}`;
}

// CSSを最適化
async function optimizeCss(filePath) {
  const css = await fs.readFile(filePath, "utf-8");
  const result = new CleanCSS({ level: 2 }).minify(css);
  return result.styles;
}

// JSを最適化
async function optimizeJs(filePath, env) {
  let js = await fs.readFile(filePath, "utf-8");

  // プレースホルダーを削除
  js = js.replace(/\/\/\s*__CONVERSION_CODE_PLACEHOLDER__/g, "");

  // コンバージョンコードを追加
  const conversionCode = generateConversionCode(env);
  js = js.trim() + "\n\n" + conversionCode;

  const result = await minifyJs(js, { compress: true, mangle: true });
  return result.code;
}

// メインビルド処理
async function build() {
  console.log("Building LP...\n");

  const env = await loadEnv();
  const dimensions = await loadImageDimensions();

  // build/ をクリア
  await fs.rm(buildDir, { recursive: true, force: true });
  await fs.mkdir(buildDir, { recursive: true });

  // images/ をコピー
  const imagesDir = path.join(designDir, "images");
  try {
    await fs.access(imagesDir);
    await copyDir(imagesDir, path.join(buildDir, "images"));
    console.log("✓ Images copied");
  } catch {
    console.log("  No images directory");
  }

  // Favicon生成
  let faviconTags = "";
  try {
    faviconTags = await generateFavicons(designDir, buildDir);
  } catch (error) {
    console.log(`  Favicon generation skipped: ${error.message}`);
  }

  // HTML処理
  const htmlPath = path.join(designDir, "index.html");
  try {
    let html = await fs.readFile(htmlPath, "utf-8");

    // タイトルを更新
    if (env.SITE_TITLE) {
      html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(env.SITE_TITLE)}</title>`);
    }

    // OGP/metaタグを注入
    const metaTags = generateMetaTags(env);
    html = html.replace("</head>", `${metaTags}\n</head>`);

    // 広告タグを注入
    const analyticsTags = generateAnalyticsTags(env);
    html = html.replace("</head>", `${analyticsTags}\n</head>`);

    // Faviconタグを注入
    if (faviconTags) {
      html = html.replace("</head>", `${faviconTags}\n</head>`);
    }

    // 構造化データを注入
    const structuredData = generateStructuredData(env, html);
    if (structuredData) {
      html = html.replace("</head>", `${structuredData}\n</head>`);
    }

    // 画像処理（width/height、lazy loading、picture変換）
    html = await processImages(html, dimensions);

    // CSS/JSリンクを更新
    html = html.replace('href="style.css"', 'href="style.min.css"');
    html = html.replace('src="script.js"', 'src="script.min.js"');

    // minify
    const minified = await minifyHtml(html, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true,
    });

    await fs.writeFile(path.join(buildDir, "index.html"), minified);
    console.log("✓ HTML optimized");
  } catch (error) {
    console.error("✗ HTML optimization failed:", error.message);
  }

  // CSS処理
  const cssPath = path.join(designDir, "style.css");
  try {
    const css = await optimizeCss(cssPath);
    await fs.writeFile(path.join(buildDir, "style.min.css"), css);
    console.log("✓ CSS optimized");
  } catch (error) {
    console.error("✗ CSS optimization failed:", error.message);
  }

  // JS処理
  const jsPath = path.join(designDir, "script.js");
  try {
    const js = await optimizeJs(jsPath, env);
    await fs.writeFile(path.join(buildDir, "script.min.js"), js);
    console.log("✓ JS optimized (with conversion tracking)");
  } catch (error) {
    console.error("✗ JS optimization failed:", error.message);
  }

  console.log("\n✓ Build complete! Output: build/");
}

build().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
