# アイコンについて（sprite.svg）

`sprite.svg` に含まれるアイコンは、NIARIMアプリ本体のツールバー・
レイヤーパネル・タイムライン等で実際に使用されているアイコンと
完全に同じものです（推測や類似デザインではなく、アプリのソースコード
（`lib/screens/canvas/widgets/toolbar_widget.dart` 等）で参照されている
アイコン名を特定した上で、同一のアイコンを取得しています）。

- **Material Symbols / Material Icons**（`ic-brush` `ic-colorize`
  `ic-format_color_fill` `ic-highlight_alt` `ic-pan_tool_alt`
  `ic-back_hand` `ic-transform` `ic-text_fields` `ic-category`
  `ic-visibility` `ic-visibility_off` `ic-play_arrow` `ic-pause`
  `ic-skip_previous` `ic-skip_next` `ic-fast_forward` `ic-fast_rewind`
  `ic-audiotrack` `ic-gesture` `ic-auto_awesome` `ic-block`
  `ic-brush_outlined` `ic-folder_outlined` `ic-groups_outlined`
  `ic-auto_fix_high_outlined` `ic-drag_indicator`）
  — Google, Apache License 2.0。
- **Font Awesome Free**（`ic-eraser_fa`）
  — Font Awesome, Icons: CC BY 4.0（Fonts: SIL OFL 1.1 / Code: MIT）。
  NIARIMアプリ本体でも、消しゴムアイコンにはMaterial Iconsに適切な
  意匠がないため同じFont Awesomeのeraserアイコンを使用している
  （設定＞利用規約・ライセンス画面にクレジット表示あり）。
