// Guard shared brand colour roles against regressions below AA text/control contrast.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const luminance = hex => {
  const [r,g,b] = hex.replace('#','').match(/../g).map(value => parseInt(value,16)/255).map(value => value <= .04045 ? value/12.92 : ((value+.055)/1.055)**2.4);
  return .2126*r+.7152*g+.0722*b;
};
const contrast = (a,b) => (Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
test('brand action roles meet AA for normal-size text in resting, hover and active states', async () => {
  const css = await readFile(new URL('../../frontend/src/styles/accessibility.css',import.meta.url),'utf8');
  for (const token of ['claw-action','claw-action-hover','claw-action-active']) {
    const value = css.match(new RegExp(`--${token}: (#[a-f0-9]{6})`))?.[1];
    assert.ok(value, token);
    assert.ok(contrast(value,'#ffffff') >= 4.5, `${token} fails white-button/text contrast`);
  }
  for (const [foreground,background] of [['#ffffff','#516847'],['#c0dfb4','#36452f'],['#686868','#ffffff'],['#005c99','#ccebff'],['#36452f','#b1d7a1']]) assert.ok(contrast(foreground,background) >= 4.5, `${foreground} on ${background}`);
  assert.ok(contrast('#868686','#ffffff') >= 3, 'Control borders must remain distinguishable');
});
