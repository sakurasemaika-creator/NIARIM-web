# NIARIM Hands-on UI Audit Standard

この文書は全面監査における実操作・実画面確認の必須基準であり、`QUALITY_STANDARD.md` と併用する。

## 必須範囲

App/Web双方について、通常利用で到達可能な全画面、route、dialog、sheet、popover、menu、context menu、toolbar、sidebar、panel、tab、設定、onboarding、およびempty/loading/error/disabled/offline等の主要状態をinventory化し、実際に起動した製品または本番相当環境で到達して実画面を目視確認する。

各画面から実行可能な操作を漏れなく棚卸しし、適用可能なtap/click、long press、keyboard入力、shortcut、focus/Tab移動、hover、scroll、drag/drop、resize、zoom/pan、context menu、選択/複数選択、toggle、slider、入力/編集/確定/取消、戻る/閉じる、undo/redo、save/load/import/export、共有/公開、権限要求、retry/cancel等を実際に操作する。コード上の存在確認や自動テストによるイベント発火だけで実操作確認の代替にしない。

必要に応じて操作前・操作中・成功後・取消後・失敗時・境界値・空/長大データ・無効状態・loading/error/offline・権限拒否・再起動/再訪後まで観察し、state遷移、feedback、focus、keyboard、scroll位置、選択状態、保存/復元、undo/redo、二重実行、誤操作耐性、データ整合性を確認する。破壊的操作は専用テストデータ/隔離環境で行う。

機械的な反復はActions/Playwright/E2E等で網羅してよいが、実画面の視覚品質と人間が操作したときの自然さをAstra Ultra自身が確認する工程を省略しない。自動テスト、DOM/widget tree、ログ、数値、snapshot/screenshot diffのPASSだけを根拠に「目視済み」「操作済み」と記録しない。実行環境の制約で確認できない対象はPASSにせず、未確認理由と必要環境をcheckpointへ残す。

既定の24幅 × PC/SP × 7言語 = 336組み合わせの表示監査は決定論的自動化で全件網羅しつつ、全操作を336回ずつAstraが手作業反復することは要求しない。操作網羅と表示マトリクスを組み合わせ、異常・差分・境界・主要workflow・デザイン判断が必要な代表ケースをAstraが実操作・目視する。ただし、特定言語/viewport/PC-SPでのみ操作や状態が変わる場合はその組み合わせも実操作対象にする。

## 証跡と完了条件

inventoryには最低限、対象画面/状態、操作、PC/SP、確認方法、結果、未確認理由を追跡できる証跡を残す。全面監査完了には未説明の未確認項目がなく、重大な操作フローについて修正後の再操作・regressionまで完了していることを要求する。CI/testがPASSしていても、この実操作・実画面監査が未完了なら全面監査をcompleteにしない。
