---
name: lp-new
description: 新しいランディングページを作成。ヒアリングしてHTML/CSS/JSを生成。LPを作りたい、ランディングページを作成して、と言われたら使用。
allowed-tools: Write, Read, Edit, Bash, Skill
---

# LP新規作成スキル

design/ ディレクトリに新しいランディングページを作成します。

**重要**: デザイン作成時は必ず `/frontend-design` スキルを使用してください。

## ヒアリング項目

以下を順番に確認してください：

1. **LPの目的**
   - イベント集客
   - 商品販売
   - リード獲得
   - サービス紹介
   - その他

2. **ターゲット層**
   - 年齢層
   - 性別
   - 職業・属性
   - 悩み・課題

3. **必要なセクション**（デフォルトは全て含む）
   - ヒーロー（必須）
   - 課題・悩み（Pain）
   - 解決策（Solution）
   - お客様の声（Testimonials）
   - よくある質問（FAQ）
   - 料金・オファー
   - CTA（必須）
   - フッター（必須）

4. **カラースキーム**
   - メインカラー
   - アクセントカラー
   - 業種に合った提案も可

5. **参考サイト**（あれば）

6. **コンバージョンアクション**
   - フォーム送信
   - 電話
   - LINE追加
   - 資料請求

## 出力ファイル

```
design/
├── index.html    # HTML構造
├── style.css     # スタイル
├── script.js     # インタラクション
└── images/       # 画像フォルダ（プレースホルダー画像の説明をコメントで記載）
```

## 重要なルール

1. **data-cv属性**: CTAボタンには必ず `data-cv="種類"` を付与
   ```html
   <a href="#form" data-cv="cta-click">申し込む</a>
   <a href="tel:xxx" data-cv="tel">電話する</a>
   <a href="https://line.me/..." data-cv="line">LINE追加</a>
   ```

2. **画像のwidth/height**: CLSを防ぐため必ず指定
   ```html
   <img src="images/hero.jpg" alt="説明" width="1200" height="630">
   ```

3. **セマンティックHTML**: 適切なタグを使用
   - `<header>`, `<main>`, `<section>`, `<footer>`
   - 見出しは `<h1>` から順番に

4. **アクセシビリティ**:
   - 全画像にalt属性
   - タップ領域は44x44px以上
   - コントラスト比を意識

5. **レスポンシブ**: モバイルファースト
   - 375pxで見やすいデザイン
   - 孤立文字（1-2文字の行末）を避ける

## 作成フロー

1. ヒアリングで要件を確認
2. `/frontend-design` スキルを呼び出してデザイン作成
3. design/ に HTML/CSS/JS を出力

## 完了後の案内

作成完了後、以下を案内：
- `npm run dev` でプレビュー
- `/lp-check` で品質チェック
- `/lp-ads` で広告タグ設定
- `/lp-build` で本番ビルド
