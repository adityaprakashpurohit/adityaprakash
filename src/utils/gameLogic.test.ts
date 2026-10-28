import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp,
  measureTextPixelWidth,
  measureLinesPixelBounds,
  buildPixelGrid,
  computePaddleBounce,
  isGameOver,
  isGameWon,
  STATE_ACTIVE
} from './gameLogic.ts';

test('clamp restricts numbers within bounds', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);
});

test('measureTextPixelWidth measures string in pixels', () => {
  assert.equal(measureTextPixelWidth('A'), 5);
  assert.equal(measureTextPixelWidth('AB'), 11);
});

test('measureLinesPixelBounds returns maximum width and stacked height', () => {
  const bounds = measureLinesPixelBounds(['ADITYA', 'PUROHIT']);
  assert.equal(bounds.w, measureTextPixelWidth('PUROHIT'));
  assert.equal(bounds.h, 17);
});

test('buildPixelGrid creates standing pixel bricks for ADITYA PUROHIT', () => {
  const { grid, standing } = buildPixelGrid(['ADITYA', 'PUROHIT'], 50, 30);
  assert.ok(standing > 0);
  assert.equal(grid.length, 50 * 30);
  let counted = 0;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === STATE_ACTIVE) counted++;
  }
  assert.equal(counted, standing);
});

test('computePaddleBounce angles the ball upwards', () => {
  const centerBounce = computePaddleBounce(100, 100, 50, 200, 0, 200);
  assert.ok(centerBounce.vy < 0);
  assert.ok(Math.abs(centerBounce.vx) < 5);

  const rightBounce = computePaddleBounce(140, 100, 50, 200, 0, 200);
  assert.ok(rightBounce.vy < 0);
  assert.ok(rightBounce.vx > 0);
});

test('game state checks for win and loss', () => {
  assert.equal(isGameOver(0), true);
  assert.equal(isGameOver(1), false);
  assert.equal(isGameWon(0), true);
  assert.equal(isGameWon(10), false);
});
