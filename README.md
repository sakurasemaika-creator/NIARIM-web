# NIARIM 公式サイト

手描きアニメーション制作アプリ「NIARIM」の公式サイトです。Cloudflare Workers Static Assets（静的アセット配信 + Worker）構成で、フロントエンドは Vanilla HTML/CSS/JavaScript、お問い合わせフォームの送信のみ Worker（`src/index.js`）が処理します。

日本語・英語・簡体字中国語・繁体字中国語・韓国語・フランス語・スペイン語の7言語に対応しています（`/`, `/en/`, `/zh-Hans/`, `/zh-Hant/`, `/ko/`, `/fr/`, `/es/`）。

## ディレクトリ構成

```
NIARIM-web/
├── public/              # 静的アセット（Workers Static Assetsが配信）
│   ├── index.html ...   # 日本語版（ルート）
│   ├── en/               # 英語版
│   ├── zh-Hans/          # 簡体字中国語版
│   ├── zh-Hant/          # 繁体字中国語版
│   ├── ko/               # 韓国語版
│   ├── fr/               # フランス語版
│   ├── es/               # スペイン語版
│   ├── 404.html（各言語ディレクトリにも同名で存在）
│   ├── assets/           # 画像・アイコン・フォント（全言語共通）
│   ├── css/               # reset / variables / common / pages/*
│   └── js/                 # config.js / i18n.js / main.js / animations.js / contact.js
├── src/
│   ├── index.js           # Workerエントリポイント（ルーティング）
│   └── contact.js         # /api/contact の処理ロジック
├── wrangler.jsonc
└── package.json
```

各言語ディレクトリ配下のHTMLは、CSS/JSファイルを共通で参照します（`/css/...` `/js/...` はロケールプレフィックスなし）。ページ内の表示文言のみが言語ごとに異なります。

## ローカル開発

```bash
npm install
npx wrangler dev
```

ブラウザで `http://localhost:8787/` を開いて確認してください。

## デプロイ

```bash
npx wrangler deploy
```

Cloudflareダッシュボード連携でGitHub `main` ブランチから自動デプロイする場合、Build commandは空欄、Deploy commandは `npx wrangler deploy`、Root directoryは `/` を指定してください。

## お問い合わせフォームのメール送信（Resend）

`/api/contact` は [Resend](https://resend.com/) のメール送信APIを使用します。

### なぜResendか

| 項目 | 内容 |
|------|------|
| サービス名 | Resend |
| 無料枠 | 3,000通/月、100通/日（2026年8月時点の公表内容。変更される可能性があるため、契約前に公式サイトで最新情報を確認してください） |
| 料金が発生する条件 | 無料枠（月間3,000通・日間100通）を超えた場合に有料プランへの移行が必要 |
| NIARIMでの想定月間利用量 | 個人開発アプリのお問い合わせ窓口として、月間数十〜百通程度を想定。無料枠内で運用可能と見込まれる |

Cloudflare Email Service（Workers向け送信機能）は2026年時点でBetaかつWorkers Paid向けのため、無料枠を優先する方針から今回はResendを採用しています。将来的にCloudflare Email Serviceが一般提供された場合は、`src/contact.js` の `sendViaResend` 関数を差し替えることで移行できます。

### セットアップ手順

1. [resend.com](https://resend.com/) でアカウントを作成する
2. 送信元ドメイン（例: `niarim.example.com`）を登録し、指示されるSPF/DKIMレコードをDNSに設定して認証を完了する（[要確認] 本番ドメイン確定後に実施）
3. APIキーを発行する
4. 以下のコマンドでWorkerにシークレットとして設定する（リポジトリには絶対にコミットしない）

```bash
npx wrangler secret put RESEND_API_KEY
```

5. `wrangler.jsonc` の `vars` に、送信先・送信元メールアドレスを設定する

```jsonc
"vars": {
  "CONTACT_TO_EMAIL": "your-inbox@example.com",
  "CONTACT_FROM_EMAIL": "NIARIM <noreply@niarim.example.com>"
}
```

APIキー・送信先・送信元のいずれかが未設定の場合、`/api/contact` はユーザーには「送信できませんでした」という汎用エラーを返し、詳細はWorkerのログにのみ記録します（ローカル開発時はこの状態で問題なく動作確認できます）。

## レート制限（KV Namespace）

お問い合わせフォームのスパム対策として、Cloudflare KVで簡易レート制限（同一IPにつき60秒に1回・1日20通まで）を行います。

```bash
npx wrangler kv namespace create RATE_LIMIT_KV
```

出力された `id` を `wrangler.jsonc` の `kv_namespaces` に設定してください。KV未設定のままローカル開発する場合、レート制限はスキップされ機能自体は動作します。

## 外部ライブラリについて

本サイトはjQuery等のJSライブラリを使用せず、Vanilla JavaScriptのみで実装しています（依存を減らし、初期表示速度を優先するため）。

唯一の外部リソースはGoogleフォント（Shippori Mincho / Zen Kaku Gothic New）で、`<link>` タグ経由で読み込んでいます。ライセンスはSIL Open Font License 1.1（Googleフォント標準ライセンス）です。

## [要確認] 未確定・要対応の項目

- `public/js/config.js` の `GOOGLE_PLAY_URL`：Google Play公開URL確定後に差し替え
- `public/js/config.js` の `X_URL`：公式Xアカウント確定後に差し替え
- `public/js/config.js` の `CONTACT_EMAIL` / `SITE_URL`：本番ドメイン・問い合わせ受信アドレス確定後に差し替え（あわせて全ページの `og:url` / `canonical` / hreflang内の `https://niarim.example.com` も本番ドメインへ置換）
- `public/assets/images/screenshots/` 配下：実際のアプリ画面キャプチャに差し替え（現在はプレースホルダ構造のみ）
- `public/assets/images/ogp-default.svg`：SNS各サービスはSVGのOGP画像に対応していない場合があるため、正式公開前に1200×630pxのPNG/JPEG画像を作成し `ogp-default.png` 等に差し替え、各ページの `og:image` / `twitter:image` を更新することを推奨
- Cloudflare Turnstileの導入要否（現状はhoneypot + レート制限のみ。スパムが多い場合に追加検討）
- 利用規約・プライバシーポリシーの法的最終確認（本サイトの内容はAIが一般的な条項として作成したものであり、専門家によるレビューを経ていません）
- Resendの送信元ドメインDNS認証（SPF/DKIM）設定

## セキュリティ対策の概要（`/api/contact`）

- HTTPメソッド・Content-Type検証
- リクエストサイズ上限（10KB）
- 必須項目・文字数上限・メール形式のバリデーション
- honeypotによる簡易Bot対策（ボットには成功したように見せかけ、実送信はしない）
- KVベースのレート制限（同一IPにつき60秒に1回・1日20通まで）
- メールヘッダ・本文への改行注入対策（ヘッダインジェクション・メールインジェクション対策）
- Worker内部のエラー詳細・個人情報をログや応答に含めない
- 同一オリジンのみを想定し、不要なCORSヘッダーを付与しない
