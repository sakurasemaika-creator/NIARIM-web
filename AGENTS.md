# AGENTS.md — NIARIM-web repository guard

このファイルは通常タスク、全面監査セッション、監査システム保守を分離する入口です。

## 0. 毎ターンのモード再判定

各ユーザー依頼ごとに、現在のトップレベル依頼だけを使ってモードをゼロから再判定する。前ターンや同一セッションで全面監査を実行していた事実を、次の依頼の起動条件に引き継がない。

現在の依頼が通常タスクなら、既にコンテキストへ入っている監査専用情報もcontinuation・scope・優先順位・完了判定の根拠として使わず、監査Stateを再同期・更新しない。

## 1. 通常タスク

ユーザーが現在のトップレベル依頼でNIARIM全面監査そのものの実行または再開を明示していない限り、通常タスクとして扱う。「監査」「回帰監査」「UI監査」「PNG監査」「全入口確認」「最終green」等の語、作業項目の多さ、過去会話の引用、前回作業の継続だけでは全面監査へ昇格しない。特定の機能・問題・順序・完了条件を指定した依頼も、全面監査そのものの明示がなければ通常タスクである。

通常タスクでは：

- 作業branchは原則 `dev_branch`。明示指示なしにmain等へ変更・push・mergeしない。
- `docs/work-audit/state/AUDIT_ROUTE.md` は全面監査モード専用TODOとする。通常チャット/Sol等であっても、通常タスクではread/search/fetch/listせず、status・ID・Discovery・coverage・順序・内容を追加、変更、削除しない。通常タスクの検証結果を監査済みとして反映しない。
- `docs/work-audit/state/ASTRA_CONTINUATION.md` と `ASTRA_AUDIT_STATE.md` も通常タスクではread/search/fetch/list/writeしない。ファイル名の`ASTRA_`は既存互換のため維持しているだけで、Astra専用を意味しない。全面監査のProgress/Evidenceは、ユーザーが明示的に開始した全面監査セッションだけが更新する。
- `docs/work-audit/**` と監査専用 `docs/product-audit/**` を通常タスクのcontinuationや実行指示に使わない。通常作業に必要なWeb固有ルールは対象機能に関係する `引き継ぎガイド（AI開発者向け）.md`、`HANDOFF.md`、`README.md`、`DESIGN.md`、コード等から確認する。
- 監査領域、`AGENTS.md`、`.github/workflows/audit-policy-guard.yml` を通常タスクの副作用として編集・整理・短縮・削除・移動・名称変更しない。
- `[audit-policy-approved]` / `[audit-state]` markerを通常タスクで使用しない。
- 通常タスクで未監査対象と同じ機能を実装・テストしても、Route上のdone、監査済み、coverage済みの根拠にはしない。
- App仕様に関わる変更は `sakurasemaika-creator/NIARIM` の最新 `dev_branch` 実装を確認し、Web側の憶測で機能・文言・画面を追加しない。
- 他セッションの変更を失わない。force push、破壊的reset、ユーザー変更の無断破棄は禁止。競合は意味的に統合する。

`AGENTS.md` 自体を読むことは通常タスクでも正しい。通常タスクと判定したら監査policy/stateへ進まず通常ルートで作業する。

## 2. 全面監査モード（Work / 通常Chat共通）

ユーザーが現在のトップレベル依頼で「NIARIMの全面監査を再開」「前回の全面監査・改善作業を再開」「NIARIMの全面監査を実行」等、全面監査そのものを明示した場合だけ監査モードを有効化する。実行場所がWorkか通常Chatか、担当モデルがAstra/Sol/その他かは起動条件にしない。

監査モードでは `docs/work-audit/policy/ASTRA_WORK.md` を入口とし、そのPolicyに従って `AUDIT_ROUTE.md`、`ASTRA_CONTINUATION.md`、`ASTRA_AUDIT_STATE.md` を使用する。これらのファイル名は既存参照を壊さないため当面維持するが、全面監査モード用であって特定モデル専用ではない。Route/Progress/Evidenceのread/writeはこの全面監査モードに限定する。

通常Chatでも、ユーザーが明示的に全面監査を依頼したセッションではSol等がRouteを正本として監査を継続し、検証済みEvidence/Progressを更新してよい。逆に、同じSolでも通常タスクではSection 1に従い監査Route/Stateへアクセスしない。

今回のユーザー指示、Policy、Route、Stateを混同しない。通常タスクや別セッションの変更・話題・テスト結果を、そのままRouteのdoneや監査Evidenceへ昇格させない。

## 3. 監査システム保守

ユーザーが監査policy/guard/State分離等の監査システム変更を明示した場合は、必要な監査policy/guardファイルだけアクセス・変更してよい。Route/Stateのread/writeは、その依頼がRoute/State移行・復元・修復にも明示的に関係する場合だけ行う。監査システム保守を全面監査の進捗更新と混同しない。

この境界は、通常タスクが全面監査専用Route/Stateをcontinuationとして読んだり、未監査TODOを勝手に監査済み扱いしたり、全面監査セッションが通常タスクの成果を監査正史へ無検証で取り込んだりすることを防ぐ恒久ルールとする。
