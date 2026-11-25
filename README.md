# NIARIM 公式サイト

手描きアニメーション制作アプリ「NIARIM」の公式サイトです。Cloudflare Workers Static Assets（静的アセット配信 + Worker）構成で、フロントエンドは Vanilla HTML/CSS/JavaScript、お問い合わせフォームの送信は Worker（`src/worker.js`）が処理します。

> **初めてこのリポジトリを触る方・AIモデルへ**: まず
> [`引き継ぎガイド（AI開発者向け）.md`](./引き継ぎガイド（AI開発者向け）.md)
> を読んでください。全体像・環境の整え方・守るべき禁止事項に加えて、
> CSSの読み込み順、画面再現図、7言語、フォント、監査、見た目の確認手順まで
> 1枚にまとまっています。
>
> このREADMEは実装の詳細、[`HANDOFF.md`](./HANDOFF.md) は経緯とハマり
> どころ、[`DESIGN.md`](./DESIGN.md) はデザインの規範です。

NIARIMは、AIが自動で作品を生成するアプリではありません。**ユーザーが自分自身で絵を描き、フレームを作成し、アニメーション作品を制作・書き出し・共有できることを中心としたアプリ**です。サイト全体もこの前提に基づいて構成しています。

表示言語は日本語・英語・簡体字中国語・繁体字中国語・韓国語・フランス語・スペイン語の7言語に対応しています。`public/js/i18n.js` によりページ内の文言をJavaScriptで切り替える方式で、URLパスは全言語共通です（`/`, `/features/`, `/contact/` など）。選択した言語は `localStorage` に保存され、次回訪問時も維持されます。

## アプリ本体（NIARIMリポジトリ）との整合について

本サイトのロゴ・プライバシーポリシー・利用規約・機能紹介は、NIARIMアプリ本体リポジトリ（`sakurasemaika-creator/NIARIM`、`dev_branch`）の実データを確認したうえで反映しています。

- **ロゴ**: `public/assets/images/logo/app_logo.svg` は、アプリリポジトリの `assets/logo/app_logo.svg` をそのまま使用しています（favicon も同一データ）。
- **配色**: `public/css/site.css` のトークン（もとの variables.css）のブランドカラーは、アプリのデフォルトUIテーマ（`lib/models/app_theme_preset.dart` の `accentColor #FF5C7A`）およびロゴの配色（`#4A4636`）に合わせています。
- **プライバシーポリシー・利用規約**: `public/js/i18n-dict-legal.js` に、アプリ本体の `lib/l10n/app_*.arb`（7言語）の条文を転記しています（最終更新日・問い合わせ先もアプリと同じ）。所有者の指定（2026-11-25「法務確認はOKとして作業進めてください」）で確認済みとして扱います。
- **機能紹介・FAQ**: アプリの実装と画面（`public/assets/images/app-captures/`、アプリから撮った画面）に合わせています。作品広場は本番のサーバーで動いています。
- **配信の状態**: アプリはGoogle Playで配信中という前提の表現にしています（所有者の指定、2026-11-25「アプリ配信中ですべてのサービスが問題なく提供されている前提の表現にしてください」）。ストアのURLは `public/js/config.js` の `GOOGLE_PLAY_URL`。

### NIARIMとは・使い方ガイド・プレミアム・コミュニティ・FAQページの追加

- **`/about/`（NIARIMとは）**: 開発思想（老若男女誰でも手軽にアニメーション制作を楽しめること・低スペック端末対応・作り込みの自由度）、生成AIについての考え方（開発自体は効率化のためAIを活用しているが、クリエイターの権利面の懸念から生成AI機能は実装していない旨を明記）、対応環境（板タブ・液晶タブレット接続、Galaxy DeXモード・Sペン）、そして「NIARIMだけのうれしい機能」として、一般的なイラスト制作アプリ（アイビスペイント・CLIP STUDIO PAINT等）にも搭載されがちな機能（ブレンドモード・レイヤーフォルダ・投げ縄塗り等）は除外し、自動塗り・26種のテーマ外観設定・活用Tips・演出フィルター・トーン塗り・ピクセルモード・コミュニティ機能（みんなの作品を見る）のみを掲載しています（`i18n-dict-about.js`）。
- **`/help/`（使い方ガイド）**: アプリ内ヘルプの81項目・12カテゴリを、`lib/l10n/app_*.arb`（7言語）と同期しています。表示言語の本文を `public/js/help-topics/` から読み込み、キーワードやカテゴリで探せます。
- **`/premium/`（プレミアムプラン）**: `docs/AI設計書/01_プロジェクト概要.md` に記載の価格・機能仕様（月額550円／年額5,500円、無料版=全基本機能+広告あり、プレミアム=広告非表示・エンドロゴ編集・ウォーターマーク・トーンカーブ・レベル補正）に基づき作成。価格は変更の可能性がある旨をページ内に明記し、変更時に更新できる構成にしています。
- **`/community/`（みんなの作品を見る）**: `docs/AI設計書/29_動画投稿・ランキング機能仕様.md` に基づき、累計/年間/月間/週間/デイリーの5種類のランキング（Top50）、新着は即時反映、ランキングは1日2〜4回（基本2回）更新という設計を紹介。作品広場は本番のサーバーで動いており、公開作品の新着・ランキングをサイトからも見られます（`public/js/community.js`）。
- **`/faq/`**: これまでホームページのアンカー内にあったFAQを独立ページ化し、ホームページ側は上位3問の抜粋＋「すべての質問を見る」リンクのみを表示するよう整理しました。
- 全ページのヘッダー/フッターナビに About・Premium・Community・Guide・FAQ を追加し、8タブ構成にしています（`i18n-dict-nav-extra.js`）。ナビが多くなったため、ハンバーガーメニューへの切り替えブレークポイントを860pxから1180pxに拡大しています。
- トップページのヒーローを拡大し、浮遊バッジ・グロー演出・マウス追従のパララックス（`prefers-reduced-motion`時は無効化）を追加。全ページ右下に固定のページトップへ戻るボタンを追加しました（`main.js`）。

## ディレクトリ構成

```
NIARIM-web/
├── public/                    # 静的アセット（Workers Static Assetsが配信）
│   ├── index.html             # トップページ
│   ├── 404.html
│   ├── about/index.html        # NIARIMとは（コンセプト・対応環境・独自機能）
│   ├── help/index.html         # 使い方ガイド（アプリ内ヘルプの再現、検索付き）
│   ├── premium/index.html      # プレミアムプラン（料金・機能比較）
│   ├── community/index.html    # みんなの作品を見る（作品広場の紹介と公開作品）
│   ├── faq/index.html          # よくある質問（独立ページ）
│   ├── privacy/index.html
│   ├── terms/index.html
│   ├── tokushoho/index.html    # 特定商取引法に基づく表記（NIARIM Premiumの販売。代表者・所在地・電話番号は請求時に開示）
│   ├── contact/index.html
│   ├── news/index.html
│   ├── features/index.html
│   ├── robots.txt             # 全ページをクロール許可 + サイトマップの所在
│   ├── sitemap.xml            # 全13ページ（canonicalと同一URL）
│   ├── _headers               # 静的アセットのセキュリティヘッダー（下記参照）
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo/app_logo.svg                   # NIARIMアプリ本体と共通の正式ロゴ
│   │   │   ├── screenshots/                        # アプリ画面キャプチャ差し替え用
│   │   │   └── ogp-default.png                     # OGP画像（ロゴとアプリの画面、1200×630）
│   │   ├── icons/              # favicon.svg / apple-touch-icon.png
│   │   └── fonts/
│   ├── css/
│   │   ├── site.css（全ページ共通）
│   │   └── pages/（ページごとの1枚：home.css / features.css / legal.css …）
│   └── js/
│       ├── config.js           # サイト内の変更可能な値を集約（URL等）
│       ├── i18n.js              # 多言語切り替えロジック
│       ├── i18n-dict.js         # 翻訳辞書（日本語・英語、共通nav/footer等）
│       ├── i18n-dict-intl.js    # 翻訳辞書（簡体字中国語・繁体字中国語・韓国語・仏語・西語）
│       ├── i18n-dict-nav-extra.js  # About/Guideナビ用の追加辞書（全ページ共通）
│       ├── i18n-dict-legal.js      # プライバシーポリシー・利用規約辞書（/privacy/, /terms/ のみ）
│       ├── i18n-dict-tokushoho.js  # 特定商取引法に基づく表記の辞書（/tokushoho/ のみ。フッターの項目名は i18n-dict-nav-extra.js）
│       ├── i18n-dict-advanced.js   # 追加機能紹介辞書（/, /features/ のみ）
│       ├── i18n-dict-faq-fix.js    # FAQ訂正辞書（/ のみ）
│       ├── i18n-dict-about.js      # NIARIMとはページ辞書（/about/ のみ）
│       ├── i18n-dict-help.js       # 使い方ガイドの検索ラベル
│       ├── help-topics/           # 使い方ガイドの言語別本文
│       ├── i18n-dict-widget.js     # ホーム画面ウィジェット節の辞書（/features/ のみ）
│       ├── main.js              # ヘッダー・メニュー・FAQアコーディオン
│       ├── animations.js        # スクロールアニメーション（IntersectionObserver）
│       ├── help.js              # 使い方ガイドのキーワード検索フィルタ
│       └── contact.js           # お問い合わせフォーム送信ロジック
├── src/
│   ├── index.js            # Workerエントリポイント（ルーティング）
│   ├── contact.js          # /api/contact の処理ロジック（Resend連携）
│   └── utils.js            # Worker共通ユーティリティ
├── tools/                  # 開発用スクリプト（本番配信には含まれない）
│   ├── build-fonts.py      # フォントのサブセット生成 + site.cssの@font-face更新
│   ├── measure-serif-chars.js  # 見出しフォントで実際に使う文字の実測（Playwright）
│   ├── serif-chars.txt     # 上の実測結果（先頭行が対象ファイルの指紋）
│   └── audit-site.js       # 全ページの回帰チェック（`npm run audit`）
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

### 回帰チェック

`wrangler dev` を起動したまま、別ターミナルで実行します。

```bash
npm run audit
```

全13ページを1280/1024/768/375/320pxで開き、次を機械的に確認します。
問題が1件でもあれば終了コード1で落ちるので、そのままCIに載せられます。

- JSエラー・失敗したリクエスト・**同一オリジン以外への通信**（フォントを
  自前配信に切り替えた効果が消えていないかの見張り）
- アクセシブル名の無いリンク／ボタン、ラベルの無い入力欄
- 表示されているのに行き先の無いリンク（未設定のSNSリンクは隠す運用）
- 畳んだFAQの中身がタブ順に残っていないか（実際に `focus()` を試して判定）
- 見出しレベルの飛び、h1の個数、lang / title / description / canonical
- 各幅での横スクロールの発生

判定の実装上の注意は `tools/audit-site.js` の冒頭コメントに書いてあります
（「見えない」を `display:none` だけで判定しない、リンク名を最初の `img` の
`alt` だけで判定しない、など、過去に誤検出を出した箇所）。

### 見た目の確認（スクリーンショット）

機械的な監査では拾えない「値としては正常なのに見え方が違う」不具合
（フォントの字形が環境で変わる、実機に無い帯が見える、小さな文字が
読めない等）は、実際に描画したものを撮って確かめます。

```bash
node tools/shot.mjs "#drawing .feature-diagram"                    # 1枚撮る
node tools/shot.mjs "#workspace" --langs ja,en,fr --vp sp          # 多言語・SP
node tools/shot.mjs ".fd-appbar" --dsf 4 --measure                 # 拡大＋実測
```

出力は `artifacts/shots/`（gitignore済み）。撮り方の根拠と、数値の測り方・
誤検出の注意点は
[`引き継ぎガイド（AI開発者向け）.md`](./引き継ぎガイド（AI開発者向け）.md)
の5節・11節にまとめてあります。

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

| 項目                     | 内容                                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| サービス名               | Resend                                                                                                                      |
| 無料枠                   | 3,000通/月、100通/日（2026年8月時点の公表内容。変更される可能性があるため、契約前に公式サイトで最新情報を確認してください） |
| 料金が発生する条件       | 無料枠（月間3,000通・日間100通）を超えた場合に有料プランへの移行が必要                                                      |
| NIARIMでの想定月間利用量 | 個人開発アプリのお問い合わせ窓口として、月間数十〜百通程度を想定。無料枠内で運用可能と見込まれる                            |

- **Cloudflare Email Service**（Workers向け送信機能）は2026年時点でBetaかつ**Workers Paid向け**のため、無料枠を優先する方針から今回はResendを採用しています。
- **Cloudflare Email Routing**は設定せず、受信はさくらメールボックスで運用します。
- Cloudflare公式にも、WorkersからResendを使ってメールを送信する構成のチュートリアルが公開されています。

将来的にCloudflare Email Serviceが無料枠付きで一般提供された場合や、別のメール送信サービスへ移行する場合は、`src/contact.js` の `sendViaResend` 関数を差し替えることで対応できます。フォーム側の窓口（`POST /api/contact`）は変更する必要がありません。

### セットアップ手順

- Resendに送信ドメインの `miranima-studio.com` を登録し、提示された送信用DNSレコードを設定します。既存のさくらメールボックスはルートドメインの受信用MXを使用します。Resendの送信用レコードは指示された名前に追加します。
- 認証済みドメイン向けの送信専用APIキーを発行し、Cloudflareの `niarim-web` Workerに暗号化された `RESEND_API_KEY` として登録します。
- フォームの送信元と受信先は `support@miranima-studio.com` です。返信先にはフォームに入力されたメールアドレスを使います。MIRANIMA Studioの総合窓口は `contact@miranima-studio.com` です。
- フォームは `SITE_ORIGIN` と `CONTACT_SITE_ORIGIN` で指定したホストからの同一オリジン送信を受け付けます。ローカル確認では `SITE_ORIGIN` をブラウザと同じローカルURLに設定してください。
- 有効な送信設定がない場合、フォームは送信エラーを返します。お問い合わせページの直通メールリンクからも連絡できます。

## レート制限（Durable Objects）

同一IPからの送信を60秒に1回、直近24時間で20回に制限します。入力と添付の検査後、メールサービスを呼び出す前に送信枠を確保します。メールサービスの失敗も、送信を試みた1回として数えます。

`wrangler.jsonc` の `contact-rate-limiter-v1` でSQLiteを使うDurable Objectを作成します。同時送信の判定と記録はIPごとのデータベースで一度に行います。レコードには時刻だけを保存し、24時間経過後に削除します。以前の `RATE_LIMIT_KV` の記録は作成から最大24時間後に失効します。

## 多言語対応について

> **辞書ファイルを追加するときの注意**: ページ固有の辞書（`i18n-dict-<用途>.js`）は
> 必ず `i18n-dict.js` → `i18n-dict-intl.js` の**後**に読み込むこと。
> 全ページで既にその順序になっている。以前は `i18n-dict-intl.js` が
> `DICT["zh-Hans"] = {...}` と代入していたため、先に読み込まれた辞書の内容が
> 日本語・英語以外の5言語ぶん丸ごと消える状態だった（現在は他の辞書と同じ
> `Object.assign` によるマージへ修正済み）。

- 対応言語: 日本語(ja) / 英語(en) / 簡体字中国語(zh-Hans) / 繁体字中国語(zh-Hant) / 韓国語(ko) / フランス語(fr) / スペイン語(es)
- 実装方式: `public/js/i18n-dict.js`・`i18n-dict-intl.js` の辞書オブジェクトを `public/js/i18n.js` が読み込み、`data-i18n` / `data-i18n-attr` / `data-i18n-html` 属性を持つ要素の内容を選択言語に差し替えます。
- 初期表示言語はブラウザの `navigator.language` から自動判定し、以降はユーザーが選んだ言語を `localStorage` に保存して次回訪問時も維持します。
- プライバシーポリシー・利用規約の本文も7言語で表示します（アプリの条文と同じ）。
- 各言語の翻訳内容は、実装時に日本語へ逆翻訳し、意図した表現になっているかを確認しています（英語・簡体字中国語・繁体字中国語・韓国語・フランス語・スペイン語の主要文言を対象）。逆翻訳による確認結果の要旨は以下の通りです。
  - 全言語共通で、意味の欠落・誤訳・不自然な機械翻訳的表現は確認されませんでした。
  - 「AIが自動生成するアプリではない」という否定文の意味が、全言語で正しく保持されていることを確認しました。
  - 追加の言語や翻訳範囲の拡張を行う際は、本セクションを更新してください。

## 外部ライブラリについて

本サイトはjQuery等のJSライブラリを使用せず、Vanilla JavaScriptのみで実装しています（依存を減らし、初期表示速度を優先するため）。

唯一の外部リソースはGoogleフォント（Shippori Mincho / Zen Kaku Gothic New）で、`<link>` タグ経由で読み込んでいます。ライセンスはSIL Open Font License 1.1（Googleフォント標準ライセンス）です。

外部ライブラリを新たに追加する場合は、「なぜ必要か／何が改善されるか／サイズ／ライセンス」を本セクションに追記してください。

## 作品広場の通報の管理ページ（`/admin/`）

所有者だけが使う、作品広場への通報を確認・対応するページです。日本語だけで、サイトのどこからもリンクしません。`<meta name="robots" content="noindex, nofollow">` と `X-Robots-Tag: noindex, nofollow`（`src/admin.js`・`public/_headers`）を付け、サイトマップ・SEO・7言語の監査のページ一覧にも入れていません。

- **ファイル**：`public/admin/index.html`、`public/js/admin-core.js`（管理APIの呼び出し・エラーの日本語化・営業日の数え方・URLの確認。画面を持たない）、`public/js/admin.js`（画面）、`public/css/pages/admin.css`（site.cssを読まない単独のファイル。色・角丸・線はサイトのトークンと同じ値）、`src/admin.js`（Worker側）。
- **ログイン**：ページは `GET /api/admin/config` から、アカウント削除のページと同じ `ACCOUNT_DELETION_GOOGLE_CLIENT_ID`（バックエンドの `GOOGLE_CLIENT_ID` と同じ公開のWebクライアントID）と、`NIARIM_PUBLIC_API_BASE_URL`（Lambda Function URL）を受け取り、Google Identity Servicesでログインします。IDトークンはそのタブのメモリーにだけ置き（localStorage・Cookieに書かない）、期限が切れたとき・401が返ったときはもう一度ログインしてもらいます。ログアウトすると画面の通報も消します。
- **管理API**：ブラウザーがLambdaの `/admin/...` を `Authorization: Bearer <IDトークン>` で直接呼びます（Workerはトークンを中継しません）。バックエンドは `/admin/` のパスだけ、Originが `https://niarim.miranima-studio.com` のときにCORSを許すので、**本番のドメインで開いたときだけ**つながります。仕様はアプリのリポジトリの `backend/README.md`「作品広場の通報対応」。
- **CSP**：`/admin/` だけ、GIS（`accounts.google.com/gsi/`）、Lambdaのオリジンへの通信、YouTubeのサムネイル（`i.ytimg.com`・`img.youtube.com`）を許すCSPに差し替えます（`src/admin.js`）。ほかのページのCSPは変えていません。
- **安全のための決まり**：通報・作品・アカウントの文字はすべて `textContent` で出し（`innerHTML` を使わない）、リンク・画像はhttp(s)だけ、サムネイルはYouTubeの画像のホストだけ、YouTubeへのリンクは新しいタブ（`rel="noopener noreferrer"`）で開きます。

### 所有者が最初に1回だけすること

1. AWSのSystems Manager（東京リージョン）のパラメーターストアに、SecureStringの `/niarim/moderation/admin-emails` を作り、管理に使うGoogleアカウントのメールアドレスを入れる（複数はカンマ区切り）。無い間は、ページに「管理画面はまだ使えるように設定されていません」と出ます。通報メール（`/niarim/moderation/resend-api-key`）・AIの判定（`/niarim/moderation/anthropic-api-key`）のキーも同じ所に作ります（手順はアプリのリポジトリの `backend/README.md`）。
2. Google Cloud Consoleで、そのWebクライアント（`GOOGLE_CLIENT_ID`）の「承認済みのJavaScript生成元」に `https://niarim.miranima-studio.com` を足す。
3. `wrangler.jsonc` の `vars` の `ACCOUNT_DELETION_GOOGLE_CLIENT_ID` には、公開のWebクライアントIDを入れてあります。クライアントを作り直したときは、ここを新しいIDにしてデプロイし直します（空にするとページに設定の案内が出ます）。
4. バックエンドの管理API（`/admin/...`・`/admin/settings`）は、アプリのリポジトリの Backend CI を手動で実行してデプロイしたときに本番に入ります。

### 対応の流れ（目安は受付から10営業日）

- 通報が届くと、サポートの受信箱（お問い合わせフォームの送り先と同じ）に件名 `[NIARIM通報]` のメールが届き、本文にこのページのURLがあります。
- 「未対応」のタブは古い順に並び、各通報に受付からの営業日（日本時間の月〜金。祝日は数に含めています）と、10営業日目の期限の目安を出します。8営業日以上待っている通報には印が付きます。
- 調べ始めたら「確認中にする」。決めたら「却下（問題なし）」か「違反として非表示」（投稿者の違反を1回数え、3回で投稿を自動で停止）。同じ作品・アカウントへの未対応の通報はまとめて対応済みになります。アカウントへの通報で非表示にするときは、作品のID（YouTubeの動画ID）か動画のURLを入れます。
- 異議（お問い合わせ）を認めたときは「作品を再表示」（「違反の記録も取り消す」）や「停止を解除」（「違反の記録もリセット」）を使います。手動で止めるときは「投稿を停止」（理由は必須）。
- ページの上の「AIの判定」で、AIの判定をオフ・常に判定する・通報が多いときだけ、から選べます（サーバーにAPIキーがあるときだけ動き、1件あたり約$0.01〜0.02）。
- 同じ欄の「サブスクのClaudeで下見する」では、APIキーを使わずにClaudeのサブスクで見立てを書いてもらえます。「下見の鍵」は、決まった時刻に動くClaude Codeのセッションが未対応の通報を読み、見立てを書き込むための鍵です（作ったときに一度だけ表示。サーバーにはハッシュだけを残し、作り直す・無効にするができます。この鍵でできるのは通報を読むことと見立てを書くことだけ）。「チャットで今すぐ頼む」は、見立てを待っている通報（最大20件）をまとめた依頼の文をコピーしてClaudeのチャットに貼り、返ってきた答えを貼り戻して取り込みます。どちらも「重大」の見立てはAPIキーでの判定と同じく確認まで作品を一時非表示にし、カードの判定の行には書いたもの（AI（API）・AI（サブスクの下見）・AI（チャット））が出ます。

### テスト

- `node --test tests/admin-core.test.mjs tests/admin-worker.test.mjs`：APIの呼び出し（認証のヘッダー・エラーの日本語化・カーソルでの続きの読み込み）、日本時間の営業日、文字とURLの扱い、Workerの設定の返し方とCSP。
- `node tests/admin-browser.mjs`：GISと管理APIを差し替えて、ログイン→AIの判定の切り替え→一覧→非表示→却下→確認中→投稿の停止と解除→再表示→詳細→ログインの期限切れ→ログアウトを通します（通報の文に入れた `<script>`・`<img onerror>` が文字のまま出ることも）。`ADMIN_BASE_URL=http://127.0.0.1:8790`（`wrangler dev`）を付けるとWorkerのCSPの下で動かし、`ADMIN_SHOTS=artifacts/admin` を付けると画面を撮ります。

## 所有者の作業として残っている項目

- Googleの公式のGoogle Playのバッジの画像（7言語、手を加えずに）を `public/assets/badges/google-play/{ja,en,fr,es,ko,zh-Hans,zh-Hant}.png` に置く。置くまでは、ストアへのリンクは文字のボタンで出る（`public/js/store-release-link.js`）。
- 公式のXのアカウントを載せるときは `public/js/config.js` の `X_URL` に入れる（空の間はXのリンクを出さない）。
- 運用：お問い合わせのメールの送信（Resendの送信元ドメインの認証）、スパムが増えたときのCloudflare Turnstileの追加、お知らせ（`public/news/`）の掲載。

## セキュリティ対策の概要（`/api/contact`）

- HTTPメソッド・Content-Type検証（`multipart/form-data`のみ受け付け）
- リクエストサイズ上限（添付合計20MBとフォームの余裕分）
- 必須項目・文字数上限・メール形式のバリデーション
- 添付は最大3件（画像は1件5MB、動画は1件15MB）。形式の識別情報を確認
- honeypotによる簡易Bot対策（ボットには成功したように見せかけ、実送信はしない）
- Durable Objectで送信枠を確保（同一IPにつき60秒に1回、直近24時間で20回まで）
- メールヘッダ・本文への改行注入対策（ヘッダインジェクション・メールインジェクション対策）
- Worker内部のエラー詳細・個人情報をログや応答に含めない
- 同一オリジンのみを想定し、不要なCORSヘッダーを付与しない
- レスポンスに `X-Content-Type-Options` / `X-Frame-Options` / `Referrer-Policy` を付与

## アクセシビリティ・パフォーマンス

- semantic HTML、`alt`、`aria-label`、フォーカス表示、キーボード操作に対応
- `prefers-reduced-motion` が有効な環境では、スクロールアニメーション・Heroアニメーションを抑制
- 外部ライブラリを増やさず、画像はAVIF/WebPと幅ごとの`srcset`で出して初期表示速度を確保
