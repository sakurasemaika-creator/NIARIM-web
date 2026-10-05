# NIARIM 全面監査ルート（Web mirror）

状態: `bootstrap-required`

旧全面監査の途中経過・完了判定・次手は破棄した。ここからの全面監査は、最初に一度だけ最新App/Webの実装から完全なTODOルートを作成し、その固定順序で進める。App/Webで同じ製品監査routeを共有し、両repoの本ファイルを同期する。

## 初回だけ行うこと

1. 最新 `dev_branch` のApp/Webを1製品として構造調査する。
2. 実際のnavigation、画面、モーダル、パネル、主要状態、無料/Premium、empty/error/loading、設定、入力、ジェスチャー、編集、保存/復元、共有/export等から、到達可能な監査対象を漏れなくinventory化する。
3. Webは実navigationに沿う固定順序、Appは実UI導線に沿う固定順序を決める。画面だけでなく各画面内の状態・操作を子TODOとして列挙する。
4. 各TODOに安定IDを付ける。App=`A###`、Web=`W###`。必要なら `A###.##` / `W###.##` を子項目に使う。
5. 各項目に少なくとも `対象 / 前提状態 / 実操作 / 期待結果 / 必要なviewport・PC/SP・7言語・Premium条件 / 必要な実画像・証拠 / status` を持たせる。
6. `QUALITY_STANDARD.md`、`HANDS_ON_UI_STANDARD.md`、`LEGAL_IP_STANDARD.md` の横断要件を、対象TODOまたは最後の横断TODOへ必ず割り当てる。どの品質要件もTODO外に残さない。
7. 作成後に「全画面・全状態・全操作・横断品質要件が少なくとも1つのTODOへ割り当てられているか」をcoverage checkし、不足を追加してからrouteを `locked` にする。

## locked後の恒久ルール

- 通常の全面監査再開でrouteを再設計・並べ替え・再生成しない。
- `current_id` の未完了項目から順番に進め、完了したら次IDへ進む。最近のcommit、別セッションの話題、興味深い機能を理由に飛び越えない。
- 通常タスク由来の変更は、現在項目の前提を壊す場合だけその場で扱う。それ以外はroute順を変えない。
- 新しい画面/機能が最新HEADに追加された場合は既存IDを並べ替えず、対応する位置に新IDを追記し、追加理由を記録する。
- TODOの完了は要求された実操作・テスト・目視・証拠が揃った場合だけ。推測、過去の旧監査記録、別セッションの申告だけで完了にしない。
- 1周完了後に、route作成後の変更差分に対する回帰TODOを別フェーズで実施する。巡回監査と差分回帰を混ぜない。

## TODO

`bootstrap-required` のため未作成。次の明示的な全面監査Workは、実装を調査してこの節を一度だけ完全な固定TODOへ置き換えること。旧StateからTODOを復元・転記しない。

## 2026-10-06 App-side post-lock product delta to incorporate in the shared audit

Web側RouteはApp/Web共通監査のmirrorであるため、App側の通常開発でRoute lock後に追加された機能も、次回の共通監査bootstrap/差分回帰時に対象へ取り込む。Web固有のTODO順序をこの追補で変更しない。

- 範囲選択：作業レイヤーのみ／表示レイヤーすべて。
- 投げ縄「線に吸着」：軌跡・連続性・進行方向・交差角を考慮した境界追跡。
- 球体陰影：影色／光色、透明色、個別blend、楕円光領域、X/Y/位置/blur、数値入力、Canvas drag、影領域、保存復元、Undo/Redo。
- Gaussian／Lens／Prism外側blur、Anime Style線幅slider、Tone Curve、Levels、Filter編集UI/Undo、Outline侵食threshold＋下層レイヤー、Vignette、Retro Anime、CRT/VHS、Fisheye、Chromatic Aberration XYZ、眼鏡断層mask、Pixel Art、背景なじませ、墨溜まり、Auto Lineart操作、線画色トレス、Blend preview、Automationからオーロラホログラム削除、Auto Fill完成状態capture。
- 作品広場：「AI画像・AI動画使用」フラグの投稿時／投稿後ON/OFF、AI作品非表示、ミュートタイトル、ミュートタグ、全閲覧面への一貫適用、backend/API反映。
- 7言語、保存復元、targeted regression、最新Visual PDFを最終closureで再確認。

旧監査成果物や過去sessionの申告だけで完了扱いしない。最新production UI／実処理／保存復元／必要なbackend／実画像まで確認する。


## Post-lock comprehensive-audit expansion — 2026-10-06

今回の「全面監査」対象として、既存Routeで明示的に網羅されていなかった以下を追加する。既存の監査順序・既存ID・current_id・lock判定は変更しない。これは「監査対象へ追加する」ものであり、実装済み／監査済みを意味しない。実装状態・実操作・保存復元・回帰・Visual evidenceを最新HEADで確認して初めて完了とする。

### 全フィルター
- 最新HEADで到達可能な**全フィルターを実装実体から再inventory**し、通常フィルターだけでなく、質感変更系を含めて漏れなく監査対象へ割り当てる。
- **質感偏光フィルター**も明示的に対象へ含める。
- 各フィルターについて、UI到達、全設定値、適用／取消、Undo/Redo、境界値、保存／復元、実描画結果、7言語、PC/SP、必要なPremium条件、Visual evidenceを確認する。
- 「全フィルター」は旧PDFや過去の一覧を根拠に固定せず、最新HEADの実装から対象集合を確定する。Gradient Map／質感変更系を監査対象から除外する旧扱いは、この全面監査追加対象には適用しない。

### ブラシカスタム／縁取りペン／折りたたみ
- **ブラシカスタム全体**：作成、編集、複製、削除、保存／復元、import/export、各設定、実描画、Undo/Redoを監査。
- **縁取りペン**：通常描画、線幅、内側侵食threshold、色／alpha、境界、保存／復元、実描画、Undo/Redoを独立して監査。
- **折りたたみモード（Hair Fold）**：縁取りペンの拡張として監査し、別の太い塗りリボンとして扱わない。以下5モードを個別に確認する。
  - ウェーブ俯瞰
  - ウェーブ煽り
  - 右カール
  - 左カール
  - 三日月カール
- Hair Foldは、ユーザー設定のブラシ太さ、taper、曲率／折り返し、方向変化、連続性、境界、保存／復元、実描画を確認する。特に三日月カールの形状・内外曲線・終端接続・急激な太さ変化がないことをVisual確認する。
- **プリセットの髪の毛ブラシ／前髪ブラシ**：各プリセットを個別の監査対象として、プリセット設定、実描画結果、髪／前髪用途での形状、縁取りペン＋折りたたみモードとの再現性、保存／復元、Visual evidenceを確認する。
- プリセットが一般ユーザーの設定操作で同等結果を再現できるかも確認し、再現できない場合は特殊なプリセット専用ロジックで隠さず、一般機能として監査・改善対象にする。

### Visual closure
上記追加対象は、機能名・BEFORE/SETTINGS/AFTER・preset/mode・主要設定値を画像へ焼き込んだ最新Visual PDFへ含める。特に全フィルター、質感偏光、縁取りペン、Hair Fold 5モード、髪の毛ブラシ、前髪ブラシは、実際の適用結果が確認できるVisual evidenceなしに完了扱いにしない。

### 監査への取り込み
既存A/W IDを並べ替えない。既存IDで表現できる対象はそのIDへ紐付け、独立した検証が必要な上記新規対象はlock後差分回帰の末尾へ明示的な子TODOとして追加する。全面監査のcurrent_idをこの追補だけで飛ばさない。
