from pathlib import Path

js_path = Path('public/js/main.js')
s = js_path.read_text(encoding='utf-8')

old_mode = "      '<span class=\"fd-frame-mode\"><span class=\"is-selected\" data-i18n=\"fd.frameListMode\">フレーム一覧</span><span data-i18n=\"fd.timelineMode\">タイムライン</span></span>' +"
new_mode = "      '<span class=\"fd-frame-mode-icon\">' + icon(\"ic-movie_filter\") + \"</span>\" +"
if old_mode not in s:
    raise SystemExit('legacy frame mode markup anchor not found')
s = s.replace(old_mode, new_mode, 1)


def move_close_to_bottom(text: str, function_name: str, inner_final_marker: str) -> str:
    start = text.index(f'  function {function_name}()')
    end = text.index('\n  function ', start + 1)
    block = text[start:end]
    top = '      panelCloseBar() +\n'
    if block.count(top) != 1:
        raise SystemExit(f'{function_name}: expected exactly one close bar')
    block = block.replace(top, '', 1)
    insert_at = block.rfind(inner_final_marker)
    if insert_at < 0:
        raise SystemExit(f'{function_name}: final panel marker not found')
    block = block[:insert_at] + top + block[insert_at:]
    return text[:start] + block + text[end:]


s = move_close_to_bottom(s, 'layerPanel', '      "</div>" +')
s = move_close_to_bottom(s, 'onionPanel', '      "</div>"\n')

old_topbar = '''  function timelineTopBar() {
    return (
      '<div class="fd-timeline-topbar">' +
      '<span class="fd-back-canvas">' +
      icon("ic-arrow_back") +
      icon("ic-palette") +
      "</span>" +
      '<span class="fd-timeline-title" data-i18n="fd.projectName">プロジェクト名</span><span class="fd-spacer"></span>' +
      iconButton("ic-home_outlined") +
      iconButton("ic-undo") +
      iconButton("ic-redo") +
      iconButton("ic-more_vert") +
      iconButton("ic-help_outline") +
      "</div>"
    );
  }'''
new_topbar = '''  function timelineTopBar() {
    return (
      '<div class="fd-timeline-topbar">' +
      '<span class="fd-timeline-topbar-left"><span class="fd-back-canvas">' +
      icon("ic-arrow_back") +
      icon("ic-palette") +
      "</span></span>" +
      '<span class="fd-timeline-topbar-right">' +
      '<span class="fd-timeline-title" data-i18n="fd.projectName">プロジェクト名</span>' +
      iconButton("ic-home_outlined") +
      iconButton("ic-undo") +
      iconButton("ic-redo") +
      iconButton("ic-more_vert") +
      iconButton("ic-help_outline") +
      "</span>" +
      "</div>"
    );
  }'''
if old_topbar not in s:
    raise SystemExit('timeline topbar anchor not found')
s = s.replace(old_topbar, new_topbar, 1)
js_path.write_text(s, encoding='utf-8')

css_path = Path('public/css/screen-mock-accuracy-base.css')
css = css_path.read_text(encoding='utf-8')
start = css.index('.fd-frame-mode {')
end = css.index('\n\n/* ── LayerPanel:', start)
replacement = '''.fd-frame-mode-icon {
  width: 42px !important;
  height: 42px !important;
  flex: 0 0 42px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: 1px solid var(--fd-muted, #9d8c90) !important;
  border-radius: 50% !important;
  background: #fff !important;
  color: var(--fd-muted, #6f6064) !important;
}
.fd-frame-mode-icon .ic {
  width: 22px !important;
  height: 22px !important;
}'''
css = css[:start] + replacement + css[end:]
css += '''

/* Structural groups keep timeline navigation left and project/actions right. */
.fd-timeline-topbar-left,
.fd-timeline-topbar-right {
  display: flex !important;
  align-items: center !important;
}
.fd-timeline-topbar-left {
  flex: 0 0 auto !important;
}
.fd-timeline-topbar-right {
  min-width: 0 !important;
  margin-left: auto !important;
  gap: 2px !important;
}
'''
css_path.write_text(css, encoding='utf-8')
