import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('public/js/lang-flag.js', 'utf8');
const title = '実際にアニメーションを つくってみよう！';
const body = '描きたいと思ったら今すぐにでも始められる。全フレーム手描きでもキーフレームアニメーションでもあなたのお好みで。納得するまでとことんこだわってあなただけのオリジナル作品をつくろう。完成したら作品広場でみんなにみてもらうことができます。逆に、他の人の作品をみることもできます。つくって、公開して、みつけよう。';

assert.ok(source.includes(title), 'approved Japanese CTA title must be installed');
assert.ok(source.includes(body), 'approved Japanese CTA body must be installed');
assert.match(source, /NIARIM_I18N_DICT[\s\S]*cta\.title[\s\S]*cta\.body/, 'CTA copy must update the shared Japanese i18n dictionary');

console.log('cta-copy-regression: ok');
