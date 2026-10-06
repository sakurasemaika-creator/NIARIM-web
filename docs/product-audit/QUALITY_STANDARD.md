# NIARIM Product Audit Quality Standard

この文書は、NIARIMの全面監査・改善をWork / Codex / Hermes等のセッションをまたいで継続する際の恒久的な品質基準です。実行・Git・再開手順はルートの `AGENTS.md`、現在地点は `docs/work-audit/state/ASTRA_CONTINUATION.md` と `docs/work-audit/state/ASTRA_AUDIT_STATE.md` を正とします。

## 目標

NIARIMを世界中で利用される最高水準の商用製品へ仕上げることを最優先する。時間・利用枠・トークン節約のために品質を妥協しない。

既に優れた実装・仕様・UI・ブランド・互換性は維持する。一方、問題のある部分は既存コードの温存を優先せずroot causeまで追跡し、patchより再設計・大幅なrefactor・rewriteの方が最終品質、安全性、保守性、UXを高めるなら、影響範囲を理解して必要な範囲を大胆に作り直してよい。「既存を残す」「作り直す」のどちらも目的化せず、既存仕様・データ・ユーザー資産との互換性を検証しながら最終品質で判断する。製品全体の全面rewriteや意図的な互換性破壊など重大な変更だけは事前確認する。

## 監査範囲

App/Webを別々ではなく1つの製品として横断的に扱う。重大バグ、データ損失・破損、保存/復元/autosave/import/export/migration、security、認証/認可、race/concurrency/async、crash/hang、state/データ整合性、主要機能、未完成実装、TODO/FIXME/HACK/placeholder、error/offline/network処理、App/Web間のAPI・認証・データ・投稿・共有・公開状態等の整合性、accessibility、responsive、performance、保守性、dead/duplicate/obsolete code、testability、および商品品質を明確に向上できる部分まで対象にする。

問題は必要に応じて再現・影響範囲・root causeを確認し、修正→検証→実画面確認→regressionまで完結させる。

`docs/work-audit/state/ASTRA_AUDIT_STATE.md` で明確に監査済みかつ、その後の変更で前提が変わっていない領域は同等レベルのAstra Ultra/Hermes監査成果として引き継ぎ、理由なく再監査しない。未記録領域を推測で完了扱いせず、変更の影響を受けた監査済み領域だけ必要な範囲を再確認する。

## UI/UX・デザイン

UI/UX、product design、visual qualityは「動く」「崩れていない」「テストが通る」だけで合格にせず、十分なデザイン・開発リソースを持つ企業の世界水準の商用製品と比較しても見劣りしない完成度を目標にする。

可能な限り実画面を操作・確認し、情報設計、導線、操作性、視覚階層、layout、spacing、typography、color、contrast、iconography、density、feedback、loading/empty/error等の各状態、localization、accessibility、ブランド、App/Web一貫性まで評価・改善する。既に優れた部分は理由なく変更しない。

スマートフォンとPC/DeXを単なる同一UIのレスポンシブ変形として扱わない。SPはtouch、片手操作、software keyboard、tap target、小画面、限られたcanvas等に適した自然で効率的なモバイルUIへ最適化する。PC/DeXはスマホUIの引き伸ばしではなく、大画面、mouse、keyboardを活かし、必要に応じてtoolbar/sidebar/dock/panel/context menu/shortcut/workspace/広いcanvas/resize/multi-panel workflow等を備えるプロフェッショナルな制作環境として評価・改善する。Workspaceのsave/restore、preset、reset、panel state、default layout、破損/旧設定、device/viewport変更等も確認し、共通構造が最適化を妨げる場合は必要な範囲を再設計してよい。

### 多言語・ローカライゼーション品質

日本語を意味・意図・温度感の基準原文とし、対応7言語すべてについて単なる逐語訳ではなく、**同じ意味、同程度の丁寧さ・親しみやすさ・簡潔さ・ブランド温度**になることを確認する。翻訳後は必要に応じて日本語への再翻訳（back-translation）や意味分解を行い、機能条件、否定、警告、操作主体、数量、時間、保存/削除等の不可逆性、課金・権限等の重要ニュアンスが欠落・誇張・反転していないことを確認する。

原文にないスラング、ネット語、若者言葉、過度なくだけ表現、過剰な宣伝調、感情の追加、地域限定でしか通じない俗語を勝手に導入しない。逆に、日本語原文自体が意図的に軽いUIラベルや短縮表現を使う場合は、その役割を各言語で自然な標準UI表現へ置き換え、直訳で不自然な砕け方を再現しない。

各言語内で敬語・人称・命令形・ですます相当のregisterを統一する。英語のcontraction、スペイン語のtú/usted、フランス語のtu/vous、中国語の你/您、韓国語の해요/합니다系などが同一製品内で理由なく混在していないかを監査する。地域差が大きい語彙は、対象ロケールで一般的かつ専門アプリとして自然な表現を選ぶ。専門用語はアニメーション・イラスト制作分野の標準語彙を優先し、App/Web/ヘルプ/ストア文面で用語を統一する。

文字列だけでなく、句読点、全角/半角、複数形、性・数一致、冠詞、助数詞、日付・時刻・数値・小数点・単位・通貨、改行、プレースホルダー順序、文法上必要な語形変化、アクセラレータ/ショートカット表記まで確認する。翻訳によりUIが長くなる言語では、省略で意味を落とすのではなくlayout側を含めて解決する。

機械的なキー一致・placeholder検査はCIへ寄せるが、**自然さ、温度感、ブランド性、専門用語、意味保存、文化的違和感**はAstra Ultraが日本語原文と照合して評価する。翻訳済みだから完了とは扱わず、重大画面・オンボーディング・保存/削除・課金・共有/公開・エラー・ヘルプ・CTA・SEO/ASO文面は優先的に人間品質で監査する。

### 必須表示監査マトリクス

全面監査・主要UI変更・responsive/visual regression確認では、次の画面幅をすべて対象にする：

`320 / 360 / 375 / 390 / 430 / 480 / 520 / 559 / 560 / 600 / 640 / 641 / 700 / 759 / 760 / 834 / 900 / 1024 / 1180 / 1280 / 1366 / 1440 / 1600 / 1920px`

各画面幅について **PC / SP の両モード × 対応7言語の全組み合わせ** を確認する。24幅 × 2モード × 7言語 = **336組み合わせ** を必須マトリクスとし、特に559/560、640/641、759/760のような境界前後は省略しない。

この336組み合わせは、可能な限りGitHub Actions / Playwright / screenshot matrix等の決定論的な自動化で全件実行し、Astra Ultraの利用枠を単純反復処理で消費しない。ただし自動化のPASSだけで品質保証済みとはせず、overflow/clipping、折返し、余白、視覚階層、操作可能領域、テーマ/色漏れ、文言欠落、長文言語での崩れ、SP/PC固有UIの誤表示等を検出できるようテスト内容を設計する。異常・差分・境界条件・品質判断が必要な画面はAstra Ultra自身が実画面/スクリーンショットを確認する。

対象ページ・主要状態に対してマトリクスが未実行、queued/running、失敗、または検査項目が不十分な場合は「表示監査完了」と扱わない。主要UI変更後は影響範囲に応じて再実行する。

## Workflow・反復作業の圧縮

NIARIMを単なる機能の集合として評価せず、ユーザーが実際の制作で繰り返す一連の操作を製品側でどこまで安全かつ自然に圧縮できるかも監査する。主要な利用シナリオについて、同じ順序で繰り返される操作、既存UIでは不要な往復や余分な手数が生じる操作、入力・処理・出力が明確な定型フロー、複数機能を毎回同じ組み合わせで使うフローを洗い出し、Action / Workflow / preset / batch処理等へ昇格させる価値を評価する。

自動化は「できるから増やす」のではなく、反復頻度、手数削減、誤操作防止、学習コスト、発見可能性、編集可能性、undo/redo・cancel、安全性、処理時間、端末性能、保存/互換性、PC/SPそれぞれの操作特性を考慮し、明確にUXを改善する場合だけ採用する。例外や分岐が多く複雑化する作業、低頻度の作業、ユーザーの判断を隠してしまう自動化は無理にWorkflow化しない。

Workflow/presetを実装する場合は、再実行可能性、途中失敗時の一貫性、非破壊性、undo、進捗/feedback、cancel、設定編集、命名・管理、保存/復元、version/migration、import/export・共有の必要性、旧データ互換性まで製品品質として監査する。PCでは高度なAction/Workflow編集やbatch等を、SPでは小画面・touchに適した簡潔な再利用導線を検討し、同一UIを機械的に流用しない。

### AI機能は禁止

NIARIMのApp/Web製品にはAI機能を実装しない。生成AI、LLM、AIチャット、AIアシスタント、AIによる画像生成・編集・判定・提案、外部AI/Codex等をユーザー向け製品機能として組み込むことを、将来候補を含めて提案・設計・実装しない。Workflow / Action / preset / batch等は通常の決定論的な製品機能として設計する。この禁止はNIARIMを開発・監査するためにAstra等のAI開発ツールを利用することには適用しない。

## 国際展開・SEO・Discoverability・ASO・Conversion

NIARIMを日本国内向け製品の翻訳版としてではなく、各言語圏で自然に発見・理解・比較・導入されるグローバル製品として監査する。技術SEOやストアmetadataだけでなく、**検索流入 → Web理解 → ストア遷移 → ストア閲覧 → インストール/導入**までの獲得ファネル全体を品質対象に含める。

Webは各公開ページ・対応言語について、検索意図と情報設計、title/description、canonical、hreflangと言語・地域指定、robots/index/noindex、robots.txt、XML sitemap、HTTP status/redirect/404、OG/Twitter等のsocial metadata、必要に応じたschema.org/JSON-LD構造化データ、heading/semantic HTML、内部リンク、画像alt、URL設計、重複・thin content、crawlerが主要コンテンツを取得・理解できるrendering、Core Web Vitals、モバイル検索体験を確認する。

各言語のSEOコピーは日本語の直訳やkeyword置換にせず、その言語圏で実際に使われる自然な検索語・検索意図・競合カテゴリ表現を調査して、NIARIMの実在機能とブランドを誇張せず伝える。keyword stuffing、検索エンジン向け隠し文言、内容の薄い量産ページ、意味を壊すSEO翻訳は採用しない。検索順位だけでなく、検索結果上のtitle/descriptionの明瞭さ・信頼性・クリック意欲と、流入後に期待内容が一致することまで評価する。

ASOはGoogle Play / App Store等、実際の配布先に応じて、アプリ名、短い説明/サブタイトル、長い説明、keywords相当、カテゴリ、タグ、アイコン、スクリーンショット、feature graphic / preview、動画、更新情報、レビュー導線、localization、プライバシー/権限説明、価格・課金表示、ブランド/機能表現の整合を監査する。各ストアの最新仕様・文字数・policyに合わせ、未公開・未確定情報を推測で追加しない。

**ストア転換率（CVR）も製品品質指標として扱う。** 検索/ブラウズで見たユーザーが「何のアプリか」「誰向けか」「何が強みか」「自分の端末・制作フローに合うか」を短時間で理解できるか、最初のスクリーンショット/コピー/アイコンで価値が伝わるか、画像と文面が実製品と一致するかを評価する。利用可能な実データがある場合はimpression、product-page view、store listing visitor、install等のファネルを地域・言語・流入元別に比較し、CTR/CVRの低下をコピー・クリエイティブ・期待値不一致・性能/互換性・レビュー等に分解して改善する。データが無い場合は数値を捏造せず、検証可能な仮説と計測設計を提示する。

国際展開では、単に7言語を揃えるだけでなく、対象市場ごとの主要端末/画面サイズ、Android普及状況、低価格端末性能、入力デバイス、ストア提供可否、決済/価格表示、法規・プライバシー、文化的意味、サポート期待、検索チャネル等、製品に実際に影響する差を必要に応じて確認する。ただし地域ごとの機能分岐を無闇に増やさず、明確な利用価値・法的必要性・獲得効果がある場合だけ採用する。

Web→ストア/アプリ、ストア→Web/ヘルプ、共有リンク等の導線も横断監査する。deep link / Universal Links / Android App Links、UTM等の計測、canonicalな遷移先、言語引き継ぎ、404/未インストール時fallback、プライバシーを実装・配布形態に応じて確認する。

SEO/ASO/Conversionは公開環境・ストア管理画面・実データでしか確定できない項目を区別し、実装だけで完了扱いしない。自動検証可能なmetadata、リンク、sitemap、structured data、status、rendering、文字数、asset仕様等はCI/テストへ寄せ、検索意図、コピー品質、多言語自然性、クリエイティブ、情報設計、ブランド判断、CVR仮説はAstra Ultraが評価する。変更後はvisual/accessibility/performance/regressionと、可能な範囲で計測結果まで確認する。

## Astra・自動化

root cause分析、複雑な不具合、security、データ安全性、設計、App/Web横断判断、UI/UX・product design・visual quality等、高度な推論が必要な仕事はAstra Ultraが担う。

formatter、lint、static analysis、build、定型テスト、Playwright、viewport/language/theme等のmatrix、screenshot生成等の決定論的・反復処理はActions/CI/通常ツールへ任せ、必要なら再利用可能で高効率な専用Action/testを作成してよい。CI/test成功を無条件に品質保証とは扱わず、テスト自体の網羅性・妥当性も必要に応じて評価する。

サブエージェントの具体的な利用・timeout・wait・polling方針は `AGENTS.md` の最新指示に従う。AIサブエージェントとActions/CI/test等の非AI並列処理を区別する。

品質を落とさず、重複読み込み・重複推論・短時間polling・不要なcontext再投入・Astraで行う必要のない単純処理だけを削減する。具体的な調査順序・実装方法・テスト戦略は、最終品質を最大化できる方法をAstra Ultra自身が選択する。

## 完了基準

一部修正やbuild/test/CI成功、利用上限到達を全面監査完了とは扱わない。App＋Web＋横断監査、必要な修正・改善、実画面UI/UX評価、SP/PC/DeX最適化、**7言語の意味・温度感・用語・registerを含むローカライゼーション監査**、必須表示監査マトリクス、Workflow・反復作業の圧縮、**国際展開・SEO・Discoverability・ASO・ストア転換率/獲得ファネル**、regression、修正後再監査まで継続する。

合理的に「現時点で明確に直すべき問題がもう見つからない」と判断できる完成度を目標に、自律的に監査→判断→実装→検証→checkpoint→次の問題→再監査を進める。checkpoint・push・継続情報・自動再開は `AGENTS.md` の最新ルールに従う。

## 全画面・全操作・全分岐の実操作網羅強化

全面監査では「代表画面を触った」「主要happy pathを通した」だけを網羅完了としない。最新実装から、各画面・各route・各dialog/sheet/menu/panel/tab/toolbar/overlayについて、ユーザーが実際に実行可能な**固有の操作を全件inventory**し、存在する操作は実際の入力方式で少なくとも一度ずつ実行する。

操作はhappy pathだけでなく、状態・分岐ごとに、open/close、確定/取消、back、再実行、連打、二重tap、長押し、drag開始/途中/終了、slider微調整、数値直接入力、focus/Tab/IME、hover、context menu、選択/解除、undo/redo、save/load/import/export、share/publish、permission、retry/cancelなど、実装上存在する全分岐を確認する。制作系では実際のcanvas/layer/frame/timeline/selection/dataを使う。

数学的な全直積（全操作×全viewport×全言語×全設定値）を人手で無限反復することは要求しない。その代わり、**操作の種類・状態遷移・境界・分岐は全件、表示条件と値の組合せは自動matrix＋境界/代表差分ケースで全ての異常パターンを覆う**。ある言語、PC/SP、theme、textScale、input deviceで挙動が変わる場合はその条件を別操作ケースとして追加する。

自動化した操作と、担当者が実際に手で操作して目視した操作はEvidenceで別管理する。自動化だけで人間操作の自然さ・見た目・フィードバック・使いやすさをPASSにしない。

## 全プリセット監査

「全プリセット」は髪/前髪だけを意味しない。最新HEADのproduction UI、model、preset repository、asset/catalog、serializationから**全てのプリセットカテゴリをinventory**する。対象には、built-in/custom brush、髪/前髪、filter preset、texture/material preset、theme/color preset、automation/action/workflow preset、size/pressure preset、timeline/animation preset、その他UIから選択・適用・保存できるpresetを含める。

各プリセットは1対象ごとに、表示名・説明・設定値・既定値・適用結果・編集可否・複製/削除・保存/復元・import/export・互換性・権限制御・7言語・PC/SP・実描画/実結果を確認する。プリセット専用hidden behaviorでしか成立しないものは一般機能の改善候補として記録し、プリセット名が違うだけの別経路で重複実装しない。

## 設定・テーマ・保存形式の変更耐性

品質設定を固定値のまま確認せず、監査中に意味のある設定を**意図的に変更して再監査**する。テーマカラーを複数系統で変更し、文字・outline・icon・slider・background・selected/disabled/error/overlay等の全連動箇所へ伝播するかを確認する。light/dark/custom、textScale、アクセシビリティ設定、言語、PC/SP、reduced-motion等の変更後に画面遷移・保存・再起動を跨いでも一貫するか確認する。

セーブ形式/serialization version/schemaを変更する場合は、現在形式だけでなくlegacy→current、current→current、unknown/newer/invalid/truncated/corruptの隔離・復旧を検証する。保存前後のデータ内容・hash・version/schema・順序・参照・画像/音声等のembedded assetを比較し、「保存できた」だけでなく**指定した形式そのものになっているか、復元した内容が完全一致するか**を確認する。migration後は旧データ由来のUI/state/undo/asset参照も再確認する。

設定値を変えたときにengine/model/service/UIのどこか一段だけが更新される不整合を許容しない。UI→model→serialization→service→engine→render→reloadの往復を必要箇所で通す。

## 実行時間・性能・軽量化

主要なユーザー操作について、cold/warm起動、画面遷移、設定反映、描画、filter/apply、blur、undo/redo、save/load、import/export、一覧取得、検索、共有/公開等の**実測時間**を記録する。操作ごとに入力サイズ、端末/環境、測定方法、p50/p95等の再現可能な指標を残し、体感遅延・frame drop・jank・メモリ増加・不要な再描画・同期処理によるUI停止も確認する。

時間がかかる箇所は、まずprofile/traceで原因を特定し、同じ結果が得られる範囲で、アルゴリズム変更、キャッシュ、差分更新、非同期化、不要なallocation/clone削減、巨大画像/バッファの縮小、widget rebuild抑制、I/O batching、serialization最適化等を検討する。コードを短くすること自体を目的にせず、**最終結果・互換性・安定性を維持したまま、低性能端末でも軽くなることを実測で確認**する。

最適化後は同一fixture/同一環境で変更前後を比較し、速度改善だけでなく画像品質、state、保存内容、メモリ、安全性、undo/redo、境界条件に退行がないことを確認する。

## ソース衛生・不要コード・コメント

全面監査には、未使用import、dead code、到達不能route、obsolete model/service、未使用asset、debug print/log、temporary workaround、生成物、古いtest/fixture/workflow参照、TODO/FIXME/HACK/placeholderを実装全体から探索する工程を含める。

同一結果をより単純・安全・高速・保守しやすい方法で実現できる場合は、既存コードを温存せず適切にrefactor/rewriteする。削除・統合の後はanalyze/lint/test/buildと実画面regressionを行い、参照切れや間接利用を残さない。

production sourceのコメントは、コードの意味、設計上の不変条件、非自明な制約、公開API/ライセンス等の恒久的情報に限定する。開発中の経緯、誰が何を修正したか、過去の失敗記録、チャット由来の作業メモはsource commentへ残さない。法的/ライセンス上必要なattributionは保持する。

## UX・導線・デザインの積極的ブラッシュアップ

機能仕様どおり動作していても、操作手数が多い、入口が見つけにくい、情報階層が不自然、戻る/取消が分かりにくい、設定が散在する、PC/SPの強みを活かせない、theme変更で一部だけ古い色が残る、feedbackが弱い等、**利用者の成功率・理解速度・制作効率を明確に改善できる余地**があれば改善する。

改善は好みだけで行わず、実操作上の負荷、視認性、アクセシビリティ、誤操作、discoverability、手数、consistency、実測性能、商用製品としての情報設計を根拠にする。改善した箇所は必ず同じ操作を再実行し、Visual/functional/regressionで副作用がないことを確認する。