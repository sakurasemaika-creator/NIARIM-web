# 引き継ぎメモ（HANDOFF）

このファイルは、このリポジトリを別のセッション・別の担当者が引き継いだときに、
これまでの経緯を素早く把握できるようにするための資料です。「なぜそうなっているか」
「同じ轍を踏まないための注意点」「まだ残っているタスク」をまとめています。

実装の詳細（ディレクトリ構成・各ページの内容根拠・多言語対応方式など）は
`README.md` を参照してください。ここには README に書ききれない「経験則」
「ハマりどころ」「進行中・未完了のタスク」を中心に記載します。

最終更新: このセクションを追記した時点のセッションにて（NIARIMアプリ本体
リポジトリのアイコン拡大・仕様変更差分の反映作業を開始した直後）。

---

## 1. リポジトリ・ブランチの前提

- **このリポジトリ**: `sakurasemaika-creator/NIARIM-web`（公開サイト、Cloudflare
  Workers Static Assets）。**`dev_branch` が実際にデプロイされているブランチ**。
  作業は必ず `dev_branch` 上で行い、`git fetch origin dev_branch && git rebase
  origin/dev_branch` してから push すること（他セッションが同時に触っている
  可能性がある）。
- **アプリ本体リポジトリ**: `sakurasemaika-creator/NIARIM`（Flutter製、private）。
  このサイトの内容（機能紹介・FAQ・ヘルプ・ロゴ・配色）は、すべてこのアプリ
  リポジトリの実データに基づいて作成しており、**憶測で機能を書き足さない**
  方針を一貫して守っている。アプリ側のdev_branchで新機能が実装されるたびに、
  このサイトの内容が古くなっていないか定期的に確認・反映する必要がある
  （後述「6. 残タスク」参照）。
  - このセッション環境では `add_repo` ツールが使えない場合でも、GitHub MCP
    ツール（`mcp__github__get_file_contents` / `list_commits` / `search_code` 等）
    で `owner: sakurasemaika-creator, repo: NIARIM` を直接指定すれば、
    ローカルにcloneしなくても内容確認・コミット履歴の調査が可能。
  - アプリ側の `dev_branch` はコミット頻度が非常に高い（1日に何本もマージ
    される）。差分確認は `list_commits`（`sha: "dev_branch"`）で新しい順に
    さかのぼり、コミットメッセージから機能追加・仕様変更を洗い出すのが
    早い（多くのコミットが日本語で詳細な変更内容を書いてくれている）。

## 2. 絶対に守るべき方針（ユーザーから明示された標準ルール）

以下はこのプロジェクトを通じて繰り返し確認された、**今後も継続すべき方針**。
新しい演出・コンポーネントを追加する際は必ずこれに照らして確認すること。

### 2.1 デザイン・演出は「技術の応用」であって「丸パクリ」は禁止

参考サイト（Dipsy等）を見て演出のレベルを上げる際、**同じ用途・同じ役割で
そっくりそのまま真似ると「丸パクリ」になる**。技術（SVGのtextPath円形テキスト、
スクロール連動のstagger reveal、connecting diagram、フローティングバッジ等）
は参考にしてよいが、**NIARIMらしい別の役割・別の視覚表現に必ず作り替える**こと。
過去に一度、参考サイトの持続的な回転バッジ演出をほぼそのまま実装してしまい、
ユーザーから「役割が完全に一致しており技術の応用ではなく丸パクリ」と指摘を
受けて全面リバートした経緯がある（`git revert`で対応）。

### 2.2 ホバー演出は「実際にクリックできる要素」だけに付ける

`<div>`や`<section>`など、実際にはクリックできない要素にホバーで動く演出
（`transform`・`box-shadow`・色変化等）を付けると、「クリックできる」と
誤認させてしまうためNG。ホバーで見た目が変わってよいのは、実際に
`<a href>` や、クリックハンドラを持つ `<button>` など、**本当に押せる
要素だけ**。逆に、実際にクリックできるのにホバーフィードバックが無い
要素（例: Community作品広場のタブボタン、言語切替のシェブロン）は積極的に
追加してよい。この方針は双方向に適用する（過剰も不足も直す）。

### 2.3 絵文字は使わず、アプリ本体と同じアイコン（sprite.svg）を使う

サイト内の装飾アイコンに絵文字（✎▶🔍🏷️👑🔔等）を使うのは禁止。
`/assets/icons/ui/sprite.svg`（Material Icons / Font Awesome Free、実際に
アプリ本体で使われているアイコンのサブセット）から適切なものを選び、
`<svg class="ic"><use href="/assets/icons/ui/sprite.svg#ic-XXX"></use></svg>`
の形で埋め込む。**アイコンの見せ方は「角丸四角をテーマカラー
（`--grad-brand`のグラデーション）で塗りつぶし、アイコンを白抜きで重ねる」
に統一されている**（`.feature-section-icon`・`.intro-card .icon`・
`.news-empty-icon` が同じパターン）。新しい絵文字っぽい装飾を追加したく
なったときは、まずこのパターンで代替できないか検討すること。
sprite.svgに収録されている全アイコンIDは以下（2026-08-30時点、46個）:
`ic-add, ic-arrow_back, ic-audiotrack, ic-branding_watermark, ic-brush,
ic-camera, ic-category, ic-colorize, ic-drag_handle, ic-edit, ic-eraser_fa,
ic-fast_forward, ic-fast_rewind, ic-file_download, ic-folder,
ic-format_color_fill, ic-help_outline, ic-highlight_alt, ic-home_outlined,
ic-image, ic-layers, ic-library_add, ic-link, ic-loop, ic-merge_type,
ic-more_vert, ic-movie_filter, ic-palette, ic-pan_tool_alt, ic-pause,
ic-play_arrow, ic-push_pin_outlined, ic-redo, ic-save_outlined, ic-search,
ic-settings, ic-skip_next, ic-skip_previous, ic-straighten, ic-text_fields,
ic-transform, ic-tune, ic-undo, ic-videocam, ic-visibility,
ic-visibility_off`。該当する概念のアイコンが無い場合は、意味が近いもので
代用するか（例: 「作者から探す」→ ic-edit、「ブックマーク」→
ic-push_pin_outlined）、既存の視覚表現だけで十分なら装飾アイコン自体を
削除する（例: コミュニティランキング1位の👑は削除し、金色の枠線・
バッジ配色だけで表現）。

### 2.4 テーマカラーはアクセントカラー（`--color-accent: #FF5C7A`）

タイトルロゴ・アプリロゴのSVG（`public/assets/images/logo/title_logo.svg`
`app_logo.svg`）は、元々ブランドのダークブラウン（`#4A4636`）で塗られて
いたが、ユーザーの指示により**テーマカラー`#FF5C7A`に変更済み**。
今後アプリ本体からロゴSVGを再同期する際は、**塗り色を`#4A4636`のまま
使わず、`#FF5C7A`に置換すること**（`sed -i 's/#4A4636/#FF5C7A/g;
s/#4a4636/#FF5C7A/g' <file>` で一括置換できる）。フッターの方は
`filter: brightness(0) invert(1)` で強制的に白にしているため、
色そのものは影響しない。

## 3. CSSの既知の罠（再発させないための記録）

### 3.1 `word-break: keep-all` + `overflow-wrap: break-word` の組み合わせ

`body`に設定している`word-break: keep-all`（数字・URLの途中改行を防ぐ）と
`overflow-wrap: break-word`（`reset.css`の`min-width:0`とセットで、
グリッド/フレックスアイテムの横はみ出しを防ぐための対策）の組み合わせは、
**明示的な幅（`max-width: Nch`）を持つ「普通の段落」に対しては2つの不具合
を引き起こす**:

1. **禁則処理違反**: 「。」「、」などの句読点が行頭に来てしまう
   （例: 「...できます。プレミアムプランでは、」の「。」が行頭に来る）。
2. **見えない横スクロール**: 見た目は正しく折り返されているのに、
   `document.documentElement.scrollWidth` が実際のビューポート幅より
   大きくなり、水平方向に（空白ページ分）スクロールできてしまう
   （Chromiumの `word-break: keep-all` の内部的な「分割禁止のかたまり」の
   幅計算と、`overflow-wrap`のフォールバック処理の相互作用によるものと
   推測される。ブラウザのバグに近い挙動）。

**対処法**: 見出しの短いキャッチコピーや `¥5,500` のような価格表示は
`word-break: keep-all` の恩恵を受けるべきなので触らない。一方、
**明示的な `max-width: Nch` を持つ通常の段落**（`.about-hero p`・
`.hero-lead`・`.hero-subtitle`・`.hero-bridge`・`.contact-intro p`・
`.features-header p`・`.help-header p`・`.about-name p`・
`.about-not-supported p`・`.download-panel p`・`.faq-answer p`・
`.footer-brand p` など）には、個別に
```css
overflow-wrap: normal;
word-break: normal;
```
を上書きしている（`public/css/common.css` の該当コメント、および
`about.css` / `contact.css` / `features.css` / `help.css` / `home.css`
の各セレクタを参照）。**新しく同じパターンの段落（センタリングされた
`max-width: Nch` の長文リード文）を追加するときは、同じ2行を必ず
セットで追加すること**（`overflow-wrap`だけだと上記(2)のバグが再発する。
実際に一度、`overflow-wrap: normal`だけを先に適用して(1)は直ったが
(2)が再発し、原因調査に長時間かかった）。

逆に、**`.spec-item`・`.intro-card` 等、グリッド/フレックスの
縮小フィット（intrinsic sizing）に依存しているカード内テキストには、
このオーバーライドを絶対に適用しないこと**。`reset.css`に記載されている
「日本語の長い文字列を含むgrid/flexアイテムがコンテナ幅を超えてはみ出す」
という別の（過去に実際に発生した）不具合が再発する。判別基準は
「そのテキストが明示的な`max-width`を持つブロック要素か、それとも
グリッド/フレックスの子要素として幅が決まる（shrink-to-fit）ものか」。

### 3.2 IntersectionObserver の `threshold` は要素の高さに影響される

`threshold`（例: `0.18`）は「対象要素**自身の面積**に対する交差率」で
判定されるため、**ビューポートよりずっと背の高い要素**（縦に長い
セクション、多数のカードを含むグリッド等）では、画面いっぱいに
表示されていても閾値を超えられず、**永久に`.is-visible`が付与されない**
不具合が起きる。実際にFeaturesページの「作画支援」セクション（12個の
spec-item＋長い説明文でページ内最長）がこのバグで表示されなかった
（モバイル幅で実測: 交差率0.15 < 閾値0.18で発火せず）。

**対処法**: `animations.js` の `initReveal()` / `initStaggerGrids()` は
**`threshold: 0`** にし、「どのくらい見えたら発火するか」の調整は
**`rootMargin`（ビューポート基準の割合なので対象の高さに影響されない）
だけで行う**。今後スクロール連動の新しい演出を追加する場合も、
`threshold`に0より大きい値を使うのは（対象の高さが確実に小さいと
分かっている場合を除き）避けること。

### 3.3 CSSセレクタの詳細度に要注意（`.contact-intro p` の事故）

`.contact-intro p { max-width: 42ch }`（クラス+要素、詳細度0-1-1）が、
後から追加した `.contact-personal-note { max-width: none }`
（クラスのみ、詳細度0-1-0）を**詳細度で上回ってしまい**、意図した
上書きが効かず注意書きの幅が221pxまで狭まっていた事故があった。
子要素セレクタを狙って上書きする際は、詳細度が確実に上回るように
（例: `.contact-intro .contact-personal-note`）すること。

### 3.4 Playwrightでの検証時の注意

- `scroll-behavior: smooth`（`reset.css`）がグローバルに効いているため、
  `page.evaluate(() => window.scrollTo(0, y))` で大きくジャンプすると
  アニメーション中の状態をキャプチャしてしまい、意図した位置の
  スクリーンショットにならないことがある。フルページを分割撮影する
  ときは `document.documentElement.style.scrollBehavior = 'auto'` を
  先に設定してから scrollTo すること。
- ホバー系のテストでは `boundingBox()` が「現在ビューポート内にあるか」
  を保証しないため、必ず `el.scrollIntoViewIfNeeded()` を先に呼んでから
  `boundingBox()` → `mouse.move()` すること。
- `page.screenshot({ fullPage: true })` は横幅が大きいページ（features/help
  等、縦12000px超）だと解像度が粗くなり文字が読めなくなるため、
  「viewportの高さを大きく（例: 4000px）した上で、スクロール位置を
  ずらしながら通常撮影を繰り返す」方式でチャンク分割するのが実用的
  （幅は変えず高さだけ変えても折り返し結果は変わらないため、実際の
  折り返し崩れ調査には支障がない）。

## 4. i18n（多言語対応）に関する注意

- 辞書は `window.NIARIM_I18N_DICT` へのマージ方式。`i18n-dict.js`（ja/en）
  と `i18n-dict-intl.js`（zh-Hans/zh-Hant/ko/fr/es）が基本で、機能ごとに
  `i18n-dict-*.js` が分割追加されている。読み込み順に依存して既存キーを
  上書きしない設計。
- `data-i18n`（`textContent`）は子要素を破壊するため、`<br>`や装飾用の
  子`<svg>`を含む要素には必ず `data-i18n-html`（`innerHTML`）を使うこと。
  実際に「を」と「つ」の間で改行してほしいという要望に`data-i18n`のまま
  `<br>`を書いても効かず、`data-i18n-html`への変更が必要だった。
- 新しいコピーを追加・変更する際は、**原則7言語すべてを更新する**
  （このプロジェクトの一貫した方針）。ただし作業量が非常に多い場合は、
  最低限 ja/en を先に直し、残りの5言語をいつ・誰が追う予定かをこの
  ファイルか対応するコミットメッセージに明記しておくこと。
- 日本語の複数行にまたがるJS文字列をsed/正規表現で編集すると、
  マルチバイト文字の境界やエスケープの扱いを誤って**文字化けやゴミの
  制御文字が混入する事故が起きやすい**（実際に一度発生し、`cat -A`で
  発覚した）。日本語を含むJS/CSSの複数行置換は、シェルのsedではなく
  **Pythonスクリプト（`content.replace(old, new)`方式）か、Editツール**
  を使うこと。

## 5. お問い合わせフォーム（画像・動画添付）に関する注意

- フロントエンドは `FormData`（`multipart/form-data`）で送信する方式に
  変更済み（以前はJSON）。`Content-Type`ヘッダーは手動指定しない
  （ブラウザがboundaryを含めて自動設定するため、指定すると壊れる）。
- 添付上限: 画像1枚5MB・動画1本15MB・合計20MB・最大3件
  （`public/js/contact.js` と `src/contact.js` の両方で二重にチェックして
  いる。片方だけ変更すると齟齬が出るので、上限を変える場合は必ず両方
  揃えること）。許可MIMEタイプ: `image/png, image/jpeg, image/webp,
  image/gif, video/mp4, video/quicktime, video/webm`。
- バックエンド（`src/contact.js`）はCloudflare Workersなので
  Node.jsの`Buffer`が使えず、base64化は自前の`arrayBufferToBase64()`
  （chunk単位で`String.fromCharCode`）で行っている。
- ローカル開発（`wrangler dev`）では `RESEND_API_KEY` 等が未設定のため、
  バリデーションを通過した送信は最終的に `500 internal_error` で
  止まるのが正常（本番はCloudflareのSecretsに設定されている前提）。
- お問い合わせページの構成方針: **まず公式Xへ誘導し、個人情報
  （アカウント・メールアドレス等）に関わる内容だけこのフォーム
  （メール受付）に誘導する**という2段構成にユーザー指示で変更済み。
  今後コピーを変更する際もこの優先順位を崩さないこと。

## 6. 残タスク・進行中の作業

### 6.1 [ほぼ対応済み] アプリ本体リポジトリの最新仕様との突き合わせ

直近のユーザー指示: 「アプリの仕様変更が複数あるので、最新のNIARIM
リポジトリ内dev_branchを確認して、追加・修正が必要なものがあれば対応
してください」。2026-08-28前後のアプリ側dev_branchコミットを一通り
洗い出し、以下の対応・判断を行った。**実質的にクローズ**しているが、
今後さらにアプリ側で仕様変更が入った場合に備え、確認済みの範囲と
ワークフローを記録しておく。

- アプリ側`dev_branch`の直近コミット（2026-08-28前後）で確認した、
  サイトへの反映有無が未確認・要確認の項目:
  - **[確認済み・対応不要] 背景馴染ませフィルター**
    （`FilterKind.backgroundBlend`、Task#162）・**オーロラホログラム
    フィルター**（Task#161）: どちらもFeatures/Helpページのフィルター
    一覧に単語として含まれている（`narrative.advanced.9/10.body`等）。
    サイト全体のフィルター紹介は「名称を列挙する一覧形式」で統一されて
    おり（他の個々のフィルター、例えば「レトロアニメ」「魚眼レンズ」等も
    スライダー構成やプリセット詳細までは書いていない）、この2つだけ
    実装の粒度（光/影の自動検出、6プリセット名等）まで掘り下げると
    既存ページの文体から浮いてしまうため、**現状の一覧形式のままで
    十分と判断し、変更不要**とした。
  - **[確認済み・対応不要] 作品広場のショートモード判定方法**（Task#159）:
    サイト側の説明（`communityPage.advanced.shorts.title/body`）は
    「縦長で投稿された作品は...」という書き方。実装は「投稿元プロジェクト
    のキャンバス縦横比」で判定しているが、これはユーザー視点では
    「縦長で投稿した作品」と同じ意味であり、YouTube Data APIの
    Shorts判定フラグが無いという技術的経緯はマーケティングコピーとしては
    書く必要がない情報と判断し、**変更不要**とした。
  - **[対応済み] 引継ぎ(.niatra)の拡張**（Task#155, #158）:
    6.1.1参照。対応済み。
  - **[確認済み・対応不要] コミュニティ独自の公開/非公開設定**
    （Task#157, #154, および「コミュニティ公開範囲の仕様を見直し」
    コミット）: FAQの`faq.q9`/`faq.a9`（`i18n-dict-faq-page.js`）を
    実際のARBキー（`communityVisibilityCardTitle`等）と突き合わせた
    結果、「NIARIM作品広場での公開・非公開はYouTube側の公開範囲とは
    独立した設定」「YouTube側を非公開/削除にすると作品広場での表示も
    自動的に停止する（NIARIM側の設定自体は保持される）」という最新仕様を
    **既に正確に反映済み**であることを確認した。追加の変更は不要と判断。
    （Communityページ自体には投稿者本人がこのトグルを操作できるという
    UI的な言及はまだ無いが、FAQで概念自体は正確にカバーされているため
    優先度は低い。余裕があれば `communityPage` の該当intro-cardに
    一言追記してもよい）。
  - **選択範囲を反転ボタン**（Task#160）・**トーンのディザリング
    プリセット追加**（Bayerオーダードディザ10種）・**容量削減画面**
    （StorageScreen、既にHelpページに`help.entry70`として反映済みと
    見られるが詳細説明が最新か要確認）・**個別設定のQRコード共有**
    （既に`help.entry14.desc`に反映済み）: 優先度は低いが、Help/Featuresの
    該当項目の説明文が実装の粒度に見合っているか、時間があれば確認。
- **確認方法**: `mcp__github__list_commits`（`owner:
  sakurasemaika-creator, repo: NIARIM, sha: "dev_branch"`）で新しい順に
  コミット一覧を取得し、コミットメッセージ本文（日本語で詳細に書かれて
  いることが多い）から機能追加・仕様変更を洗い出す→該当する
  `lib/l10n/app_ja.arb` 等の実データを`get_file_contents`で確認→
  このサイトの対応箇所（`public/*/index.html` + `public/js/i18n-dict-*.js`）
  と突き合わせて、古い記述があれば7言語まとめて修正する、という
  従来からの一貫したワークフローを踏襲すること。

### 6.1.1 [対応済み] .niatra引継ぎの説明を最新仕様に更新

上記6.1のうち「引継ぎ(.niatra)の拡張」（Task#155, #158）は対応済み。
`featuresPage.save.item5.body`（`i18n-dict-save.js`）・
`narrative.save.7.body`（`i18n-dict-narrative.js`）・
`help.entry51.desc`（`i18n-dict-help.js`）の3箇所×7言語に、
「パレット（カラーピッカー・ドット絵専用）」と「制作中のプロジェクトを
任意で選んで含められる」旨を追記済み。

### 6.1.2 [確認済み・対応不要] アプリアイコンのグリフ拡大は既に反映済み

`sakurasemaika-creator/NIARIM` の `assets/logo/app_logo.svg` /
`title_logo.svg`（コミット`d8dd0dbff699542fd9eeeac1d84d865fb5ab5684`
「2026/08/28_アイコンサイズ拡大」時点、`scale(1.85)`のグリフ拡大込み）を
`public/assets/images/logo/` の同名ファイルとバイトレベルで突き合わせた
結果、**塗り色（テーマカラーへの変更、2.4節参照）以外は完全に同一**
だった。つまり、ユーザーが報告した「グリフ比率0.58→0.74等への拡大」は
**既にこのサイトへ反映済み**であり、追加の同期作業は不要と判断した。
Android adaptive icon前景（0.46→0.50）はAndroidアプリの起動アイコン
専用の話で、このサイトには対応する使用箇所が無い（サイトはfavicon/
ヘッダーロゴともに`app_logo.svg`のモノグラムをそのまま使っている）ため、
同様に対応不要。
なお `tool/gen_app_icon.py` はアプリ本体リポジトリにコミットされておらず
（ローカル専用スクリプトの可能性）、今後もこの経路での差分確認はできない
点に注意。

### 6.3 未着手・低優先度（README.mdの「[要確認]」セクションと重複するが再掲）

- News/Contactページは正式リリース前のプレースホルダーが多く残っている
  （News: お知らせ0件、Contact: 送信先メールアドレス未設定）。正式
  リリースのタイミングでREADME.mdの「[要確認]」セクションを参照して
  差し替えること。
- Google Play URL・公式XアカウントURL（`public/js/config.js`）は未確定。
- OGP画像・apple-touch-iconは単色プレースホルダーのまま
  （6.2のアイコン反映作業と合わせて更新できると良い）。
- Cloudflare Turnstileの導入要否（スパムが増えた場合に検討）。
- 利用規約・プライバシーポリシーの専門家（弁護士）による法的最終確認は
  未実施。

---

このファイルは今後も、大きな方針変更・重大なバグの再発防止策・長期の
持ち越しタスクが発生するたびに追記していくこと。日々の細かい変更履歴は
`git log` を参照すれば十分なので、ここにすべてのコミットを書き写す
必要はない。
