import assert from 'node:assert/strict';
import { placeCard, resizeRect } from '../src/components/dashboard/cardGeometry.ts';

const a = { x: 0, y: 0, width: 280, height: 180 };
const b = { ...a, x: 300 };
const c = { ...a, y: 200, height: 80 };
const original = { a, b, c };
const resize = (dx: number, dy: number, x: Parameters<typeof resizeRect>[3], y: Parameters<typeof resizeRect>[4]) =>
  resizeRect(a, dx, dy, x, y, 580, 128, 65, 500);

assert.deepEqual(resize(12, 0, 'right', 'none'), { ...a, width: 292 });
assert.deepEqual(resize(12, 10, 'left', 'top'), { x: 12, y: 10, width: 268, height: 170 });
assert.deepEqual(resize(900, 900, 'left', 'top'), { x: 152, y: 115, width: 128, height: 65 });
assert.deepEqual(resize(500, -90, 'none', 'none'), { ...a, x: 300 });
const grown = placeCard(original, 'a', resize(0, 110, 'none', 'bottom'), 20);
assert.deepEqual(grown.b, b);
assert.deepEqual(grown.c, { ...c, y: 310 });
const reduced = placeCard(original, 'a', resize(0, -100, 'none', 'bottom'), 20);
const docked = placeCard(reduced, 'c', { ...c, y: 100 }, 20);
assert.deepEqual(docked.b, b);
assert.deepEqual(docked.c, { ...c, y: 100 });
assert.deepEqual(placeCard(original, 'a', a, 20), original);
console.log('Card geometry checks passed');
