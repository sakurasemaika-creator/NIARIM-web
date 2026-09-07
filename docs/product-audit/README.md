# NIARIM App＋Web 製品監査（Web側再開記録）

状態：進行中、全体監査は未完了。開始：2026-09-07。

## 共通記録と安全条件

共通監査マップ・問題台帳はApp repoの `docs/product-audit/README.md` と `findings/`。
ローカルApp：`C:/Users/user/Downloads/MIRANIMA`。
ローカルWeb：`C:/Users/user/Downloads/NIARIM_web/NIARIM-web`。
双方とも `dev_branch` のみ。再開/重要領域変更/checkpoint/push直前は必ず両方の status / HEAD / fetch origin / 差分を確認する。force push / hard reset / 本番操作は禁止。
Appの既存ユーザー変更 `macos/Flutter/GeneratedPluginRegistrant.swift` と `pubspec.lock` は上書き・破棄・本監査への混入禁止。原本はApp `.git/niarim-product-audit/initial-user-changes/` に保護済み。

## 開始状態

- App HEAD：`dfa64ab981a5eaea159fa284ec6e436cc9bd9844`。
- Web HEAD：`3f397d05d624f4f3866ee85e535f15b848aaf030`。先行8commit（heroテーマ継承・既存視覚監査追従・整形）を確認してfast-forward済み。
- Web working treeは監査文書追加前clean。未push commitなし。
- 追跡152ファイルを一覧化。`public/`は静的公式サイト、`src/`は問い合わせWorker。Appの制作データをWebへ自動同期する製品ではない。

## 範囲と進捗

- 初期資料：README / 引き継ぎガイド / DESIGN確認中。HANDOFF、全ルート、読み込み順、辞書/フォント/モック/問い合わせ/CIを順次追跡。
- 認証/作品/法務/サポートはApp側横断担当と整合確認中。資料の古い「認証/バックエンド未実装」記載は現コードを基準に再評価する。
- 実画面、スマホ/PC、多言語、a11y、性能、エラー/empty/loading等は未確認。監査結果を取り、再現テスト→局所修正→回帰→再監査。
- 既存ブランドとApp実装に基づく画面表現を維持。新しい架空機能・価格/キャンペーン変更・全面rewriteはしない。

## 環境・検証

Windows/bash、Node 20.11.1/npm10.2.4。`node` はwinpty aliasのため `node.exe` を利用。資料のLinux絶対パスは使用しない。依存engine要件/Playwright/ローカルWorker配信を確認中。
Web buildは静的アセット＋Worker。無断deployや実メール送信は禁止。問い合わせテストはローカル/明示したmockで行う。

## 変更・checkpoint

production変更なし、checkpoint/pushなし。次：環境baseline→全ページのレンダリング検査→高優先度問題修正。checkpoint時にcommit/検証/残件を追記する。
