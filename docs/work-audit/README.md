# NIARIM 全面監査領域

このディレクトリはNIARIM全面監査の専用領域です。通常の実装・修正タスクでは、ユーザーが全面監査を明示していない限り、この領域のState/Routeを監査済み判定や作業優先順位の根拠として使用しません。

## 全面監査の正本
- `docs/work-audit/FULL_AUDIT_ENTRYPOINT.md`
- `docs/work-audit/policy/ASTRA_WORK.md`
- `docs/work-audit/state/AUDIT_ROUTE.md`
- `docs/work-audit/state/AUDIT_DELTA_ROUTE.md`
- `docs/work-audit/state/FULL_AUDIT_EXECUTION_STANDARD.md`

## 横断品質基準
- `docs/product-audit/QUALITY_STANDARD.md`
- `docs/product-audit/ENGINEERING_QUALITY_STANDARD.md`
- `docs/product-audit/HANDS_ON_UI_STANDARD.md`
- `docs/product-audit/LEGAL_IP_STANDARD.md`

State / inventory / verifier群も、全面監査開始時に現在HEADから確認します。

## 補助資料
`docs/AI設計書/**`、機能別verification、security audit、operation capture等は仕様・過去証拠として必要な箇所だけ参照します。日付付き資料や古いHEADは現在の監査完了の根拠にしません。現在のdev_branchと矛盾する場合は現在の実装を一次事実とし、必要ならDiscovery/Deltaへ登録します。

## 原則
1. 最新dev_branchの開始SHAを記録する。
2. Baseline RouteのID・順序・definitionを変更しない。
3. lock後の新規画面・状態・操作・機能・品質リスクはDiscovery/Deltaへ登録する。
4. 自動テスト、snapshot、DOM/source reviewだけでは実操作PASSにしない。
5. 機能・意図挙動・見た目・継続性・製品品質を独立判定する。
6. 改善は根拠を記録し、修正→再操作→regressionまで行う。
7. Baseline/Discovery/Delta、未登録Discovery、advisor-pending、必要証拠がすべて完了するまで全面監査完了としない。
