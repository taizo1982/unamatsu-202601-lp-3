---
name: lp-section
description: LPにセクションを追加。hero、pain、solution、testimonials、faq、cta等。セクションを追加して、と言われたら使用。
allowed-tools: Read, Edit, Write, Skill
---

# セクション追加スキル

既存のLPに新しいセクションを追加します。

**重要**: デザイン作成時は `/frontend-design` スキルを使用してください。

## 対応セクション

| セクション | 説明 | 用途 |
|-----------|------|------|
| hero | ヒーローセクション | メインビジュアル、キャッチコピー |
| pain | 課題・悩み | ターゲットの悩みを列挙 |
| solution | 解決策 | ステップ形式で解決方法を提示 |
| features | 特徴・強み | サービスの特徴を紹介 |
| testimonials | お客様の声 | 実績・信頼性 |
| faq | よくある質問 | 不安解消 |
| pricing | 料金 | 価格表 |
| offer | オファー | 限定特典、イベント詳細 |
| cta | CTA | 行動喚起 |
| about | 会社紹介 | 信頼性向上 |
| flow | 流れ | 申し込み〜利用までの流れ |
| comparison | 比較表 | 競合との差別化 |

## 使い方

1. 追加したいセクション名を指定
2. 必要な情報をヒアリング
3. design/index.html に追加
4. design/style.css にスタイル追加

## セクションテンプレート例

### Pain（課題）セクション
```html
<section class="pain">
  <div class="container">
    <h2 class="section-title">こんなお悩みありませんか？</h2>
    <ul class="pain-list">
      <li class="pain-item">課題1</li>
      <li class="pain-item">課題2</li>
      <li class="pain-item">課題3</li>
    </ul>
  </div>
</section>
```

### Testimonials（お客様の声）セクション
```html
<section class="testimonials">
  <div class="container">
    <h2 class="section-title">お客様の声</h2>
    <div class="testimonial-list">
      <div class="testimonial">
        <p class="testimonial-text">「感想テキスト」</p>
        <p class="testimonial-author">30代 女性</p>
      </div>
    </div>
  </div>
</section>
```

### FAQ セクション
```html
<section class="faq">
  <div class="container">
    <h2 class="section-title">よくあるご質問</h2>
    <div class="faq-list">
      <details class="faq-item">
        <summary class="faq-question">質問1</summary>
        <p class="faq-answer">回答1</p>
      </details>
    </div>
  </div>
</section>
```

## 注意事項

- 既存のスタイルとの整合性を確認
- セクションの順序を考慮（ストーリー性）
- CTAボタンには data-cv 属性を付与
