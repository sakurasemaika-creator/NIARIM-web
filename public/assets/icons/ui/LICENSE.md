# アイコンについて（sprite.svg）

`sprite.svg` に含まれるアイコンは、NIARIMアプリ本体のツールバー・
レイヤーパネル・タイムライン・書き出し画面・キャンバス上部バーで
実際に使用されているアイコンと完全に同じものです（推測や類似デザイン
ではなく、アプリのソースコードで実際に参照されているアイコン名を
特定した上で取得しています）。

- **Material Symbols / Material Icons**
  （`ic-brush` `ic-colorize` `ic-format_color_fill` `ic-highlight_alt`
  `ic-pan_tool_alt` `ic-category` `ic-text_fields` `ic-visibility`
  `ic-visibility_off` `ic-play_arrow` `ic-pause` `ic-skip_previous`
  `ic-skip_next` `ic-fast_forward` `ic-fast_rewind` `ic-audiotrack`
  `ic-edit` `ic-palette` `ic-link` `ic-folder` `ic-image` `ic-videocam`
  `ic-branding_watermark` `ic-drag_handle` `ic-file_download` `ic-undo`
  `ic-redo` `ic-straighten` `ic-settings` `ic-help_outline`
  `ic-lock` `ic-star` `ic-star_outline`）
  — Google, Apache License 2.0。
  出典: `toolbar_widget.dart`（描画ツールバー）、
  `layer_panel.dart`（レイヤーパネルの表示/非表示・レイヤー種別・
  ドラッグハンドル）、`timeline_screen.dart`（再生バー）、
  `export_screen.dart`（書き出しボタン）、`canvas_screen.dart`の
  上部バー構成（Undo/Redo/定規/設定/ヘルプ、`help_diagrams.dart`の
  コメントで確認）、`premium_lock_widget.dart`（プレミアム限定を示す錠、
  `Icons.lock`）、`theme_settings_screen.dart`（テーマ一覧のお気に入り、
  `Icons.star` / `Icons.star_outline`）。
  ※ 錠と星は以前、絵文字の 🔒 と文字の ★ ☆ で代用していた。絵文字は
  同梱フォントに無く閲覧環境のカラー絵文字で描かれるため、単色の
  アイコンが並ぶ中でそこだけ色付きで浮いていた。アプリ本体が実際に
  使っている意匠に差し替えている。
- **Font Awesome Free**（`ic-eraser_fa`）
  — Font Awesome, Icons: CC BY 4.0（Fonts: SIL OFL 1.1 / Code: MIT）。
  NIARIMアプリ本体でも、消しゴムアイコンにはMaterial Iconsに適切な
  意匠がないため同じFont Awesomeのeraserアイコンを使用している
  （設定＞利用規約・ライセンス画面にクレジット表示あり）。
- **Font Awesome Free**（`ic-x_fa`＝X（旧Twitter）のロゴ）
  — Font Awesome, Icons: CC BY 4.0（Fonts: SIL OFL 1.1 / Code: MIT）。
  公式サイトのフッターから公式Xアカウントへ導線を張るためにのみ使用する。
  X および X のロゴは X Corp. の商標であり、本サイトでは同社の
  アカウントを指し示す目的（指名的言及）でのみ表示している。
  ※ 以前はロゴの代わりに文字「𝕏」(U+1D54F 数学用二重打ち大文字X)を
  置いていたが、この符号位置を収録していない環境では豆腐(□)に
  なってしまうため、SVGアイコンへ差し替えた。
