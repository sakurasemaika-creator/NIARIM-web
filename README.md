# NIARIM 公式サイト

手描きアニメーション制作アプリ「NIARIM」の公式サイトです。Cloudflare Workers Static Assets（静的アセット配信 + Worker）構成で、フロントエンドは Vanilla HTML/CSS/JavaScript、お問い合わせフォームの送信のみ Worker（`src/index.js`）が処理します。

NIARIMは、AIが自動で作品を生成するアプリではありません。**ユーザーが自分自身で絵を描き、フレームを作成し、アニメーション作品を制作・書き出し・共有できることを中心としたアプリ**です。サイト全体もこの前提に基づいて構成しています。

表示言語は日本語・英語・簡体字中国語・繁体字中国語・韓国語・フランス語・スペイン語の7言語に対応しています。`public/js/i18n.js` によりページ内の文言をJavaScriptで切り替える方式で、URLパスは全言語共通です（`/`, `/features/`, `/contact/` など）。選択した言語は `localStorage` に保存され、次回訪問時も維持されます。

## アプリ本体（NIARIMリポジトリ）との整合について

本サイトのロゴ・プライバシーポリシー・利用規約・機能紹介は、NIARIMアプリ本体リポジトリ（`sakurasemaika-creator/NIARIM`、`dev_branch`）の実データを確認したうえで反映しています。

- **ロゴ**: `public/assets/images/logo/app_logo.svg` は、アプリリポジトリの `assets/logo/app_logo.svg` をそのまま使用しています（favicon も同一データ）。
- **配色**: `public/css/variables.css` のブランドカラーは、アプリのデフォルトUIテーマ（`lib/models/app_theme_preset.dart` の `accentColor #FF5C7A`）およびロゴの配色（`#4A4636`）に合わせています。
- **プライバシーポリシー・利用規約**: `public/js/i18n-dict-legal.js` に、アプリ本体の `lib/l10n/app_*.arb`（7言語）に定義されている実際の条文をそのまま転記しています。アプリ側で既にAI翻訳・逆翻訳照合を経ていますが、専門家（弁護士等）による正式な法的確認は経ていない点はアプリ側と同様です。プライバシーポリシー第8条（お問い合わせ）のみ、アプリ側では連絡先未確定のプレースホルダーのままですが、本サイトには実際に機能するお問い合わせフォームがあるため、そちらへ案内する文言に差し替えています。
- **機能紹介**: `public/js/i18n-dict-advanced.js` に、アプリの `lib/engine/`・`lib/models/` に実装が確認できる機能（オニオンスキン・トーン・スタンプ・定規・テキスト・フィルター・フォント管理・ウォーターマーク）を追加しています。逆に、コミュニティ（作品共有）機能はUI・ダミーデータのみでバックエンド未実装であることを確認したため、既存の通り「[要確認]」のままとし、実装済みと断定していません。
- **FAQの訂正**: `public/js/i18n-dict-faq-fix.js` にて、当初「[要確認]」としていた2項目を、アプリの実データに基づき確定情報へ更新しました。
  - 対応端末: `pubspec.yaml`（`description: Hand-drawn animation creation app for Android`）および利用規約第2条により、Android向け提供であることを確認済み
  - アカウント要否: プライバシーポリシー第2条・利用規約第4条・第8条により、本アプリはサーバーへのデータ送信・アカウント機能を持たず、プロジェクトデータは端末内にのみ保存されることを確認済み（アカウント登録は不要）
- 上記以外の未確定情報（料金プラン詳細、公式Xアカウント、Google Play URL等）は、意図的に「[要確認]」のまま維持しています。アプリ側に存在する将来の課金・広告に関する内部方針（`lib/config/monetization_gate.dart` 等）は、公開時期や税務上の判断を含む未確定の内部情報のため、本サイトには反映していません。

## ディレクトリ構成

```
NIARIM-web/
├── public/                    # 静的アセット（Workers Static Assetsが配信）
│   ├── index.html             # トップページ
│   ├── 404.html
│   ├── privacy/index.html
│   ├── terms/index.html
│   ├── contact/index.html
│   ├── news/index.html
│   ├── features/index.html
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo/app_logo.svg                   # NIARIMアプリ本体と共通の正式ロゴ
│   │   │   ├── screenshots/                        # アプリ画面キャプチャ差し替え用
│   │   │   └── ogp-default.png                     # OGP画像（プレースホルダー）
│   │   ├── icons/              # favicon.svg / apple-touch-icon.png
│   │   └── fonts/
│   ├── css/
│   │   ├── reset.css / variables.css / common.css
│   │   └── pages/ (home.css / contact.css / legal.css / features.css / news.css)
│   └── js/
│       ├── config.js           # サイト内の変更可能な値を集約（URL・メールアドレス等）
│       ├── i18n.js              # 多言語切り替えロジック
│       ├── i18n-dict.js         # 翻訳辞書（日本語・英語）
│       ├── i18n-dict-intl.js    # 翻訳辞書（簡体字中国語・繁体字中国語・韓国語・仏語・西語）
│       ├── main.js              # ヘッダー・メニュー・FAQアコーディオン
│       ├── animations.js        # スクロールアニメーション（IntersectionObserver）
│       └── contact.js           # お問い合わせフォーム送信ロジック
├── src/
│   ├── index.js            # Workerエントリポイント（ルーティング）
│   ├── contact.js          # /api/contact の処理ロジック（Resend連携）
│   └── utils.js            # Worker共通ユーティリティ
├── wrangler.jsonc
└── package.json
```

各ページのHTMLは、CSS/JSファイルを共通で参照します（`/css/...` `/js/...` はロケールプレフィックスなし）。ページ内の表示文言は `data-i18n` 属性経由でJavaScriptが差し替えます。

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

本番サイトには Cloudflare Access を設定しないでください（一般ユーザーが誰でも閲覧できる公式サイトのため）。

## お問い合わせフォームのメール送信（Resend）

`/api/contact` は [Resend](https://resend.com/) のメール送信APIを使用します。

### なぜResendか

Cloudflare上でメールを送信する方法を検討した結果、以下の理由からResendを採用しています。

| 項目 | 内容 |
|------|------|
| サービス名 | Resend |
| 無料枠 | 3,000通/月、100通/日（2026年8月時点の公表内容。変更される可能性があるため、契約前に公式サイトで最新情報を確認してください） |
| 料金が発生する条件 | 無料枠（月間3,000通・日間100通）を超えた場合に有料プランへの移行が必要 |
| NIARIMでの想定月間利用量 | 個人開発アプリのお問い合わせ窓口として、月間数十〜百通程度を想定。無料枠内で運用可能と見込まれる |

- **Cloudflare Email Service**（Workers向け送信機能）は2026年時点でBetaかつ**Workers Paid向け**のため、無料枠を優先する方針から今回はResendを採用しています。
- **Cloudflare Email Routing**は「受信メールを別のアドレスへ転送する」ためのサービスであり、Workerからの能動的なメール送信（お問い合わせフォームの送信先へのメール送信）には利用できません。今回の用途には合致しないため使用していません。
- Cloudflare公式にも、WorkersからResendを使ってメールを送信する構成のチュートリアルが公開されています。

将来的にCloudflare Email Serviceが無料枠付きで一般提供された場合や、別のメール送信サービスへ移行する場合は、`src/contact.js` の `sendViaResend` 関数を差し替えることで対応できます。フォーム側の窓口（`POST /api/contact`）は変更する必要がありません。

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

## 多言語対応について

- 対応言語: 日本語(ja) / 英語(en) / 簡体字中国語(zh-Hans) / 繁体字中国語(zh-Hant) / 韓国語(ko) / フランス語(fr) / スペイン語(es)
- 実装方式: `public/js/i18n-dict.js`・`i18n-dict-intl.js` の辞書オブジェクトを `public/js/i18n.js` が読み込み、`data-i18n` / `data-i18n-attr` / `data-i18n-html` 属性を持つ要素の内容を選択言語に差し替えます。
- 初期表示言語はブラウザの `navigator.language` から自動判定し、以降はユーザーが選んだ言語を `localStorage` に保存して次回訪問時も維持します。
- **プライバシーポリシー・利用規約の本文は日本語を正本とし、翻訳していません**（法的文書の誤訳リスクを避けるため）。他言語を選択した場合も、本文は日本語のまま表示し、その旨を案内バナーで表示しています。
- 各言語の翻訳内容は、実装時に日本語へ逆翻訳し、意図した表現になっているかを確認しています（英語・簡体字中国語・繁体字中国語・韓国語・フランス語・スペイン語の主要文言を対象）。逆翻訳による確認結果の要旨は以下の通りです。
  - 全言語共通で、意味の欠落・誤訳・不自然な機械翻訳的表現は確認されませんでした。
  - 「AIが自動生成するアプリではない」という否定文の意味が、全言語で正しく保持されていることを確認しました。
  - `[要確認]` に相当する保留表現（英語 "[To be confirmed]"、簡体字中国語「【待确认】」、繁体字中国語「【待確認】」、韓国語「[확인 필요]」、フランス語 "[À confirmer]"、スペイン語 "[Por confirmar]"）が、日本語の「[要確認]」と同じ「未確定であることの明示」という意図で機能していることを確認しました。
  - 追加の言語や翻訳範囲の拡張を行う際は、本セクションを更新してください。

## 外部ライブラリについて

本サイトはjQuery等のJSライブラリを使用せず、Vanilla JavaScriptのみで実装しています（依存を減らし、初期表示速度を優先するため）。

唯一の外部リソースはGoogleフォント（Shippori Mincho / Zen Kaku Gothic New）で、`<link>` タグ経由で読み込んでいます。ライセンスはSIL Open Font License 1.1（Googleフォント標準ライセンス）です。

外部ライブラリを新たに追加する場合は、「なぜ必要か／何が改善されるか／サイズ／ライセンス」を本セクションに追記してください。

## [要確認] 未確定・要対応の項目

- `public/js/config.js` の `GOOGLE_PLAY_URL`：Google Play公開URL確定後に差し替え
- `public/js/config.js` の `X_URL`：公式Xアカウント確定後に差し替え
- `public/js/config.js` の `CONTACT_EMAIL` / `SITE_URL`：本番ドメイン・問い合わせ受信アドレス確定後に差し替え（あわせて全ページの `og:url` / `canonical` / hreflang内の `https://niarim.example.com` も本番ドメインへ置換）
- `public/assets/images/screenshots/` 配下：実際のアプリ画面キャプチャに差し替え（現在はプレースホルダ構造のみ）
- `public/assets/images/ogp-default.png`：現在は単色のプレースホルダー画像。正式公開前に1200×630pxのブランドOGP画像へ差し替え、各ページの `og:image` / `twitter:image` を確認すること
- `public/assets/icons/apple-touch-icon.png`：現在は単色のプレースホルダー画像。正式なアプリアイコンへ差し替え
- FAQ・機能紹介ページ内の `[要確認]` 表記（アプリ内共有機能の有無、料金プラン等）：正式リリース時の仕様確定後に更新（対応OS・アカウント要否は確定情報へ更新済み。上記「アプリ本体との整合について」参照）
- `public/privacy/index.html` `public/terms/index.html` 内の `[要確認]` 表記（最終更新日、制作物の権利帰属、Cookie/アクセス解析の使用有無、準拠法・裁判管轄等）：法務の最終確認を経て更新
- Cloudflare Turnstileの導入要否（現状はhoneypot + レート制限のみ。スパムが多い場合に追加検討）
- 利用規約・プライバシーポリシーの法的最終確認（本サイトの内容はAIが一般的な条項として作成したものであり、専門家によるレビューを経ていません）
- Resendの送信元ドメインDNS認証（SPF/DKIM）設定
- `public/news/` のお知らせ本文（現在は「お知らせなし」の状態。正式リリース時のお知らせに差し替え）

## セキュリティ対策の概要（`/api/contact`）

- HTTPメソッド・Content-Type検証
- リクエストサイズ上限（10KB）
- 必須項目・文字数上限・メール形式のバリデーション
- honeypotによる簡易Bot対策（ボットには成功したように見せかけ、実送信はしない）
- KVベースのレート制限（同一IPにつき60秒に1回・1日20通まで）
- メールヘッダ・本文への改行注入対策（ヘッダインジェクション・メールインジェクション対策）
- Worker内部のエラー詳細・個人情報をログや応答に含めない
- 同一オリジンのみを想定し、不要なCORSヘッダーを付与しない
- レスポンスに `X-Content-Type-Options` / `X-Frame-Options` / `Referrer-Policy` を付与

## アクセシビリティ・パフォーマンス

- semantic HTML、`alt`、`aria-label`、フォーカス表示、キーボード操作に対応
- `prefers-reduced-motion` が有効な環境では、スクロールアニメーション・Heroアニメーションを抑制
- 外部ライブラリを増やさず、画像は必要になった時点で差し替え可能なプレースホルダー構造とすることで初期表示速度を確保
