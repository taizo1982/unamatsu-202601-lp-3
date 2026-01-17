# LP Template v2

シンプルなHTML/CSS/JSでランディングページを作成するためのテンプレート。

## v2 変更点

| 項目 | v1 | v2 |
|------|----|----|
| フレームワーク | React + Tailwind | HTML/CSS/JS のみ |
| 画像最適化 | なし | 自動リサイズ + AVIF/WebP |
| width/height | 手動 | 自動付与 |
| lazy loading | 手動 | 自動付与（1枚目除外） |
| 構造化データ | なし | 5タイプ対応 |
| favicon | 手動 | 自動生成 |
| PageSpeed検証 | なし | API連携 |

---

## デザイナー向け

### 作業フォルダ

```
design/
├── index.html   # HTML編集
├── style.css    # CSS編集
├── script.js    # JS編集（必要なら）
└── images/      # 画像を置くだけ
    └── favicon.png  # あれば自動でfavicon生成
```

### 画像について

**何も気にしなくてOK**

- 形式: PNG / JPG / JPEG
- サイズ: 大きくてOK（自動で1920px以下にリサイズ）
- width/height: 書かなくてOK（自動付与）
- lazy loading: 書かなくてOK（自動付与）
- WebP/AVIF: 書かなくてOK（自動変換）

```html
<!-- これだけ書けば -->
<img src="images/hero.jpg" alt="メイン画像">

<!-- ビルド後こうなる -->
<picture>
  <source srcset="images/hero.avif" type="image/avif">
  <source srcset="images/hero.webp" type="image/webp">
  <img src="images/hero.jpg" alt="メイン画像" width="1920" height="1080" loading="lazy">
</picture>
```

### コンバージョン設定

CTAに `data-cv` 属性を付ける:

```html
<a href="tel:090-1234-5678" data-cv="tel">電話する</a>
<a href="#form" data-cv="form">申し込む</a>
<a href="https://line.me/..." data-cv="line">LINE追加</a>
```

### FAQ（構造化データ用）

```html
<div class="faq-item">
  <div class="faq-question">質問文</div>
  <div class="faq-answer">回答文</div>
</div>
```

### Claude Code スキル

| スキル | 説明 |
|--------|------|
| `/lp-new` | 新規LP作成（ヒアリング→生成） |
| `/lp-section` | セクション追加 |
| `/lp-check` | 品質チェック |

---

## エンジニア向け

### セットアップ

```bash
npm install
cp .env.example .env
```

### .env 設定

```bash
# 広告タグ
GA_MEASUREMENT_ID=G-XXXXXXXX
GA_ADS_ID=AW-XXXXXXXX
GA_ADS_CONVERSION_LABEL=XXXXXXXX
META_PIXEL_ID=XXXXXXXX
LINE_TAG_ID=XXXXXXXX
YAHOO_RETARGETING_ID=XXXXXXXX

# OGP
SITE_TITLE=ページタイトル
SITE_DESCRIPTION=説明文
OG_URL=https://example.com/
OG_IMAGE_URL=https://example.com/og-image.jpg

# 構造化データ（カンマ区切りで複数可）
STRUCTURED_DATA_TYPE=Organization,FAQPage
```

### ビルド

```bash
npm run build
```

出力先: `build/`

### ビルド処理内容

1. design/ → build/ コピー
2. 画像リサイズ（1920px以下）
3. AVIF/WebP 生成
4. width/height 自動付与
5. lazy loading 付与（1枚目除外）
6. `<img>` → `<picture>` 変換
7. OGP/metaタグ注入
8. 広告タグ注入
9. コンバージョン追跡コード注入
10. 構造化データ(JSON-LD)生成
11. favicon生成
12. HTML/CSS/JS minify

### 個別実行

```bash
# 画像最適化のみ
node scripts/optimize-images.mjs

# OGP注入のみ
node scripts/inject-meta.mjs design/index.html

# 広告タグ注入のみ
node scripts/inject-analytics.mjs design/index.html

# CV追跡コード注入のみ
node scripts/inject-conversion.mjs design/script.js
```

### 品質チェック

```bash
# 375px改行チェック（孤立文字検出）
node scripts/check-typography.mjs

# アクセシビリティ
node scripts/check-accessibility.mjs

# リンク切れ
node scripts/check-links.mjs
```

### PageSpeed検証（公開後）

```bash
# モバイル + デスクトップ
node scripts/validate.mjs https://example.com

# モバイルのみ
node scripts/validate.mjs https://example.com --mobile

# デスクトップのみ
node scripts/validate.mjs https://example.com --desktop
```

API制限緩和: `.env` に `PAGESPEED_API_KEY` を設定

### Claude Code スキル

| スキル | 説明 |
|--------|------|
| `/lp-ads` | 広告タグ設定 |
| `/lp-build` | ビルド実行 |
| `/lp-validate` | 最終検証 |

---

## ディレクトリ構成

```
lp-template/
├── design/                 # デザイン作業フォルダ
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── images/
│
├── build/                  # ビルド出力
│
├── scripts/                # ビルドスクリプト
│   ├── build.mjs           # メインビルド
│   ├── inject-meta.mjs     # OGP注入
│   ├── inject-analytics.mjs # 広告タグ注入
│   ├── inject-conversion.mjs # CV追跡注入
│   ├── optimize-images.mjs # 画像最適化
│   ├── validate.mjs        # PageSpeed検証
│   ├── check-typography.mjs
│   ├── check-accessibility.mjs
│   └── check-links.mjs
│
├── .claude/skills/         # Claude Code スキル
│
├── .env.example
└── package.json
```

---

## 構造化データ対応タイプ

| タイプ | 用途 | 設定 |
|--------|------|------|
| Event | イベント告知 | EVENT_* |
| Product | 商品販売 | PRODUCT_* |
| LocalBusiness | 店舗 | BUSINESS_* |
| Organization | 企業 | ORG_* |
| FAQPage | FAQ | HTMLから自動抽出 |

---

## ライセンス

MIT
