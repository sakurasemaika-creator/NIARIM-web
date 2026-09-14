import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('public/js/main.js', 'utf8');

assert.equal(
  source.includes('data-i18n="fd.frameListMode"'),
  false,
  'frame strip must not generate the legacy frame-list label',
);
assert.equal(
  source.includes('data-i18n="fd.timelineMode"'),
  false,
  'frame strip must not generate the legacy timeline label',
);
assert.match(
  source,
  /fd-frame-mode-icon[\s\S]*ic-movie_filter/,
  'frame/timeline switch must be a real movie-filter SVG icon',
);
assert.match(
  source,
  /fd-timeline-topbar-left[\s\S]*fd-back-canvas[\s\S]*fd-timeline-topbar-right[\s\S]*fd-timeline-title[\s\S]*ic-home_outlined[\s\S]*ic-undo[\s\S]*ic-redo[\s\S]*ic-more_vert[\s\S]*ic-help_outline/,
  'timeline topbar must have explicit left and right groups',
);

for (const functionName of ['layerPanel', 'onionPanel']) {
  const start = source.indexOf(`function ${functionName}()`);
  assert.notEqual(start, -1, `${functionName} must exist`);
  const end = source.indexOf('\n  function ', start + 1);
  const block = source.slice(start, end === -1 ? source.length : end);
  const closeIndex = block.indexOf('panelCloseBar()');
  assert.notEqual(closeIndex, -1, `${functionName} must include the shared close affordance`);
  assert.ok(
    closeIndex > block.indexOf('data-i18n='),
    `${functionName} must render the close affordance after its panel content`,
  );
}

console.log('mock-ui-source-regression: ok');
