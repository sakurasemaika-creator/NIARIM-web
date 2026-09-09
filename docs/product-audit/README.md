# NIARIM App＋Web 製品監査（Web側再開記録）

状態：**進行中、全体監査は未完了**。2026-09-07 Work checkpoint。

## 2026-09-09 JST 継続checkpoint

- W08〜W10と問い合わせ回帰: `b5cac10` の [CI 34281650981](https://github.com/sakurasemaika-creator/NIARIM-web/actions/runs/34281650981) は全17job成功。問い合わせ28/28、表示4,032条件成功。中国語短文の長さによる誤検知は修正済み。
- 目視: 日本語自動線画のCI単体PNGでSVGアイコンを含む4設定・線画色・適用操作を確認。仏語/簡体字SP問い合わせの失敗表示、スペイン語→仏語の実ブラウザー言語切替も確認。ローカルpreview固有のアイコン欠落を製品不具合とは断定しない。
- 後続Hero変更は境界監査とformatが失敗しており、以前の全greenを現在の品質保証として流用しない。追加2スクリプトのformatは今回修正。HEAD・最新結果・次の操作はcontinuationを正とする。
- HANDS_ON_UI_STANDARDの全画面/主要状態/操作inventoryは未完了。法務/IP・言語品質・獲得導線・実運用も継続対象。

## Git・前工程

- `sakurasemaika-creator/NIARIM-web` / App `sakurasemaika-creator/NIARIM`、双方 `dev_branch` のみ。force push・破壊的reset・本番データ操作は禁止。
- Work checkout: `/workspace/scratch/dd8428d3aee3/NIARIM-web`、Appは同階層。開始時clean、stash・未pushなし。
- Web初期HEAD `10116b5` → 最新 **`e53f248`** へincomingを確認してfast-forward。hero 628px高/幅ladder/Community再現/書式修正等を継承。
- Hermesの前READMEは全領域が調査中または未確認。完了領域を推測で引き継がない。App側の正式監査記録も参照する。
- Appの最初の修正checkpointはGitHub **`5076259`**（auth identity / YouTube stats、backend105test成功）。本Webの実投稿サービス化などは行わない。

## 採択問題・変更

| ID / 優先度         | 問題 / 修正・検証                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W01 / P1 資源枯渇   | contact WorkerはContent-Lengthだけで全量parseを許していた。受信streamの実バイト上限を追加し、未知fieldも含め超過時に中断。偽装/未指定lengthのテスト成功 |
| W02 / P2 無駄な処理 | rate-limit判定が添付読込/base64化の後。制限を本文読込より前へ移動、変換を逐次化、送信timeoutを追加。過剰リクエストでbody未消費を確認                    |
| W03 / P2 フォームUX | 同意/添付のエラーへfocusできず、success reset後の選択表示が残る。最初のエラー行へ誘導、reset/言語変更で表示再同期、説明ariaを維持、通信timeoutを追加    |
| W04 / P2 言語menu   | 開閉状態が支援技術へ伝わらず閉じた要素へfocusが残る。aria-expanded/controls、選択/Escapeのfocus復帰、reduced-motion対応                                 |
| W05 / P2 入力支援   | 添付inputと代理buttonが二重に操作対象になる。代理buttonにラベル・制限・状態を関連付け、native inputをfocus/読み上げ対象外へ。message hintも関連付け     |
| W06 / 開発環境      | 監督付きpreviewの--host/--strictPortとWrangler引数が不一致。tools/start-dev.mjsでWranglerの--ipへ変換。通常のdev引数は維持                              |

## 検証・実画面

- Linux / Node **24.19.0**。依存は既存package-lockで導入。初期format gate失敗5ファイルはincomingで修正済み、統合後に再実行する。
- `node --test tests/contact-api.test.mjs`: **6/6成功**。正常送信mock・HTML escape・容量上限・rate limit・honeypot/入力・添付制限・不正multipart。実メールは送っていない。
- 超過streamを中断するtestは実HTTPに相当する生bytesで実行。Nodeのoutgoing FormData生成streamのcancel時エラーと区別し、全量受信前のcancelも検証。
- 実ブラウザ：問い合わせの必須入力エラー、同意欄へのfocus（activeElement=agree）、言語メニュー開閉、English選択後のfocus復帰/aria-expanded=falseを確認。
- 送信成功後のreset/添付、多言語・viewport matrixの自動回帰はまだ未完了。12全ページの実画面レビュー・全体UI/UX評価も未完了。
- ブランドは既存ロゴ/HakkouMincho/Kuramubon/coralを維持。明るいcoralに白文字という既存指定は維持しているが、小さいCTA文字のコントラストは要判断。AA準拠済みとは扱わない。
- RATE_LIMIT_KVのatomic性/運用設定、実メール、外部X/ストアURLの設定、実機ブラウザは未検証。無断deploy/実メール送信なし。

## checkpoint / 次の作業

このREADMEを含むWeb修正を検証後checkpoint化する。commitは `git log -- docs/product-audit/README.md` で特定できる。push前にfetchし差分を確認する。

1. format/Worker再実行、フォーム・言語の実行回帰をCIへ追加。
2. 全ページ・7言語・スマホ/PC実画面とnavigation/empty/errorを評価。
3. 既存CIの期待値書換えやfallbackによる見逃しを精査し、根拠のある修正を行う。
4. App/Webの用語・機能・導線とブランドを横断確認し、修正後の再監査へ進む。

## 2026-09-08 JST 12時台の監査継続

- 開始HEAD `392b727`。Actions `34181676783` はformatと見出し検査で失敗。従来の24幅×12ページ（日本語PCのみ）は288条件成功、7言語の既存capture/final-matrixも成功だが、指定336条件/ページの合格ではない。
- **W07 / P2 監査精度**: FAQは `.about-hero` を使っており、存在しない `.faq-header` を検査して6幅すべてで誤検知していた。実画面の見出しと中央配置を確認して修正。中央位置はスクロールバーを除いたclientWidth基準とする。
- 全ページの幾何検査を、24幅×PC/SP（touch/mobile emulation）×7言語＝**336条件/ページ、12ページで4,032条件**に拡張。既存の14 capture jobに分割し、失敗条件の画像とJSONを保存する。reduced-motionを利用し、画面外revealの内容も検査する。通常motionの画像・操作検査は既存jobで継続する。
- 自律操作監査の失敗を別テストの成功で打ち消すshell fallbackを除去。最新CIで実際に失敗した7ファイルをPrettierで整形した。
- ローカル確認: Worker **6/6成功**、JS構文確認成功、format成功。問い合わせ空送信でname/email/message/agreeがinvalidとなりnameへfocus。FAQを実画面で確認。拡張matrixはpush後のCI実行待ちであり、まだ合格とは扱わない。
- 次: 拡張CIの失敗を実画面で分類・修正。問い合わせ成功/reset/添付/言語変更、未設定X案内、App保存A02を継続。全体監査は未完了。

## 2026-09-08 JST 23時台の監査継続

- Web `56a6610` のActions `34186579146` は全17job成功。上記4,032条件も全件成功。その後の実装変更を含む現在HEADの合格とは扱わない。
- **W08 / P1 起動・SEO生成**: 辞書全ファイルを名前順に実行するとDOM専用辞書が `document is not defined` で停止し、ベース辞書が後勝ちで上書きもする。各HTMLの読み込み順にmetadata辞書だけを評価し、11ページ×7言語のtitle/descriptionを必須検査する。Worker dry-run build成功、既存SEO契約検査成功。CIにもbuildを追加した。
- **W09 / P2 問い合わせ誘導**: `X_URL` 未設定時もXへ誘導する文章を表示していた。未設定時は既存7言語の汎用問い合わせ説明を使い、X専用案内を隠す。未設定のリンクは追加しない。実画面でフランス語の非空説明・X案内非表示と、日本語の必須エラー/focusを確認。
- **W10 / P2 Appとの整合**: 自動線画のタイトル・ラフ幅/線幅/入り抜き/補正・線画色をApp ARBと既定値へ合わせた。省略されていた線画色と減算操作の表示を補い、長いラベルを折り返す。誤った配列添字による監査を、描画されたパラメーター名と値の検査へ移した。フランス語PCの表示確認済み。SVGアイコンとSP/他言語の目視は継続。
- 問い合わせ回帰を28条件（7言語×PC/SP×X設定有無）へ追加。無効添付/4枚/成功/reset/二重送信/429/500/通信失敗をAPI差し替えで確認する設計であり、実メールは送らない。追加ブラウザー検査はCI実行待ち。
- ローカル: Worker6/6、SEO contract、operations SEO、JS構文、Worker dry-run build成功。直近incoming変更の10ファイルは既存Prettier 3.6.2で整形。UI変更後の全matrixとスクリーンショット分類は未完了。
- App A02は `b61db7f` でproduction修正済み。最新Flutterの保存回帰job成功。全体829成功/5skip/27失敗、analyze46件、format43ファイル。全体合格ではない。
- 次: Web追加CI結果と実画像を確認し、Appの自動線画テスト修正を実行検証する。両repo最新の品質/法務・IP基準を継承し、未精査領域を引き続き監査する。
