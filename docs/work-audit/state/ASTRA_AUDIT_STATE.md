# NIARIM App＋Web 製品監査（Web側再開記録）

状態：**進行中、全体監査は未完了**。2026-09-07 Work checkpoint。

## 2026-09-09 検証根拠の復元

本節と継続checkpointを最新の現在地点とする。新Policy/Stateへ移行された記録の欠落を、全面監査で確認したGit/CIの証拠から補った。

- **W11 / ガイド検索中のカテゴリ移動**: `cf35f9c` のfr実操作で、検索語「Annuler」により保存カテゴリがdisplay noneになった状態でも「Enregistrement」リンクが残り、クリックするとURLだけが `#help-save` へ変わって内容が表示されないことを再現。最新 `e6e07ed` でも対象help.jsに変更なし。通常のカテゴリ選択時は検索を解除し、anchor移動が測定する前にカテゴリを表示する修正を追加した。7言語×PCキーボード/SPタップの14条件で検索・該当なし・カテゴリ移動を検証するCIを追加。修正後の成功は結果確認後に確定する。
- `103e26af` / [CI 34325708843](https://github.com/sakurasemaika-creator/NIARIM-web/actions/runs/34325708843) は **17ジョブすべて成功**。追加したWorker runtime SEOも成功し、言語URL・canonical・hreflang・Content-Language・JSON-LD・robots/sitemapを実Worker応答で検証した。後続CSS変更 `e6e07ed` はこの合格へ含めない。
- fr FAQの実操作: Spaceで開いた回答は言語変更後も展開を保ち、言語ボタンへfocusが戻る。回答全文の表示を目視確認し、Enterで閉じると読み上げregionから外れる。ガイドは翻訳済み語での検索と該当なし表示を確認。全操作inventoryの完了とは扱わない。

- **W08 / SEOメタデータ生成**: `f2d309d` で11ページのscript順序とmetadata-onlyの辞書読込を修正。DOM依存scriptのReferenceErrorや基底辞書による翻訳上書きを防ぎ、11ページ×7言語のtitle/description契約を確認。
- **W09 / 問い合わせ回帰**: X未設定時は7言語の汎用案内にし、設定済みの場合のみX案内を表示。7言語×PC/SP×X有無の28条件で必須入力・添付MIME/個数・模擬成功/reset・重複送信抑制・429/500/通信失敗時の入力保持を検証。中国語の正しい短いエラーを誤検知した文字数assertは、空や未翻訳キーでないことの検査へ修正した。
- **W10 / App自動線画mock整合**: App ARBと7言語を照合し、rough width12・output width2・taper8・smoothing5と対応するslider比率、黒い線画色、増減操作、折り返せるラベルを反映。
- [CI 34281650981](https://github.com/sakurasemaika-creator/NIARIM-web/actions/runs/34281650981) (`b5cac10`): **17ジョブ成功、問い合わせ28/28、24幅×PC/SP×7言語×12ページ=4,032条件成功**。対象変更の根拠であり、後続HEADの合格や全UI/UX完了を意味しない。
- [CI 34323159862](https://github.com/sakurasemaika-creator/NIARIM-web/actions/runs/34323159862) (`fae5cf8`): 問い合わせ、final-matrix、14全ページjob成功。formatと中間幅Home検査は失敗。後続 `cf35f9c` のCSS修正は外部変更として取り込み、必要な検証後に確定する。
- `cf35f9c` の実操作: ナビからFAQへ遷移、閉じた回答はheight0/visibility hiddenで読み上げsnapshotに現れず、Spaceで開くと対応regionと回答が現れることを確認。以前の「閉じた回答が露出する」疑いはこのHEADでは再現せず、根拠のない修正を追加しない。
- Workerのruntime SEO検査は既存のままCIに未接続だったため、ローカルWorker起動と検査stepを追加した。結果確認前に合格扱いしない。実メール・本番deployは行っていない。

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

この記録を含むWeb修正を検証後checkpoint化する。commitは `git log -- docs/work-audit/state/ASTRA_AUDIT_STATE.md` で特定できる。push前にfetchし差分を確認する。

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
