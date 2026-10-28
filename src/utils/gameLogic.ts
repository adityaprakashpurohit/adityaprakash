/**
 * Pure helper functions for the Breakout arcade game and calculations.
 */

export const clamp = (val: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, val));

export const CHAR_BIT_MAP: Record<string, string> = {
  A: `.###./#...#/#...#/#####/#...#/#...#/#...#`,
  B: `####./#...#/#...#/####./#...#/#...#/####.`,
  C: `.####/#..../#..../#..../#..../#..../.####`,
  D: `####./#...#/#...#/#...#/#...#/#...#/####.`,
  E: `#####/#..../#..../####./#..../#..../#####`,
  F: `#####/#..../#..../####./#..../#..../#....`,
  G: `.###./#...#/#..../#..##/#...#/#...#/.###.`,
  H: `#...#/#...#/#...#/#####/#...#/#...#/#...#`,
  I: `#####/..#../..#../..#../..#../..#../#####`,
  J: `..###/...#./...#./...#./...#./#..#./.##..`,
  K: `#...#/#..#./#.#../##.../#.#../#..#./#...#`,
  L: `#..../#..../#..../#..../#..../#..../#####`,
  M: `#...#/##.##/#.#.#/#...#/#...#/#...#/#...#`,
  N: `#...#/##..#/#.#.#/#..##/#...#/#...#/#...#`,
  O: `.###./#...#/#...#/#...#/#...#/#...#/.###.`,
  P: `####./#...#/#...#/####./#..../#..../#....`,
  Q: `.###./#...#/#...#/#...#/#.#.#/#..#./.##.#`,
  R: `####./#...#/#...#/####./#.#../#..#./#...#`,
  S: `.####/#..../#..../.###./....#/....#/####.`,
  T: `#####/..#../..#../..#../..#../..#../..#..`,
  U: `#...#/#...#/#...#/#...#/#...#/#...#/.###.`,
  V: `#...#/#...#/#...#/#...#/#...#/.#.#./..#..`,
  W: `#...#/#...#/#...#/#...#/#.#.#/##.##/#...#`,
  X: `#...#/#...#/.#.#./..#../.#.#./#...#/#...#`,
  Y: `#...#/#...#/.#.#./..#../..#../..#../..#..`,
  Z: `#####/....#/...#./..#../.#.../#..../#####`,
  0: `.###./#...#/#..##/#.#.#/##..#/#...#/.###.`,
  1: `..#../.##../..#../..#../..#../..#../.###.`,
  2: `.###./#...#/....#/...#./..#../.#.../#####`,
  3: `#####/...#./..#../...#./....#/#...#/.###.`,
  4: `...#./..##./.#.#./#..#./#####/...#./...#.`,
  5: `#####/#..../####./....#/....#/#...#/.###.`,
  6: `..##./.#.../#..../####./#...#/#...#/.###.`,
  7: `#####/....#/...#./..#../.#.../.#.../.#...`,
  8: `.###./#...#/#...#/.###./#...#/#...#/.###.`,
  9: `.###./#...#/#...#/.####/....#/...#./.##..`,
  '!': `..#../..#../..#../..#../..#../...../..#..`,
  '?': `.###./#...#/....#/..##./..#../...../..#..`,
  '-': `...../...../...../#####/...../...../.....`,
  '.': `...../...../...../...../...../.##../.##..`,
  ' ': `...../...../...../...../...../...../.....`,
};

export const CHAR_WIDTH = 5;
export const CHAR_HEIGHT = 7;
export const CHAR_SPACING = 1;
export const LINE_SPACING = 3;

export function measureTextPixelWidth(text: string): number {
  return Math.max(0, text.length * (CHAR_WIDTH + CHAR_SPACING) - CHAR_SPACING);
}

export function measureLinesPixelBounds(lines: string[]): { w: number; h: number } {
  return {
    w: Math.max(1, ...lines.map(measureTextPixelWidth)),
    h: lines.length * CHAR_HEIGHT + Math.max(0, lines.length - 1) * LINE_SPACING,
  };
}

export const STATE_EMPTY = 0;
export const STATE_ACTIVE = 1;
export const STATE_HIT = 2;

export function buildPixelGrid(
  lines: string[],
  cols: number,
  rows: number,
  topRatio = 0.35
): { grid: Uint8Array; standing: number } {
  const grid = new Uint8Array(cols * rows);
  const bounds = measureLinesPixelBounds(lines);
  const startY = Math.max(0, Math.round(rows * topRatio - bounds.h / 2));
  let standing = 0;

  lines.forEach((line, lineIdx) => {
    const lineWidth = measureTextPixelWidth(line);
    const startX = Math.round((cols - lineWidth) / 2);
    const yOffset = startY + lineIdx * (CHAR_HEIGHT + LINE_SPACING);

    Array.from(line.toUpperCase()).forEach((char, charIdx) => {
      const bitPattern = CHAR_BIT_MAP[char] || CHAR_BIT_MAP[' '];
      const charX = startX + charIdx * (CHAR_WIDTH + CHAR_SPACING);

      bitPattern.split('/').forEach((rowStr, rIdx) => {
        for (let cIdx = 0; cIdx < CHAR_WIDTH; cIdx++) {
          if (rowStr[cIdx] === '#') {
            const gx = charX + cIdx;
            const gy = yOffset + rIdx;
            if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
              const idx = gy * cols + gx;
              grid[idx] = STATE_ACTIVE;
              standing++;
            }
          }
        }
      });
    });
  });

  return { grid, standing };
}

export function computePaddleBounce(
  ballX: number,
  paddleX: number,
  paddleHalfWidth: number,
  baseSpeed: number,
  currentVx: number,
  currentVy: number
): { vx: number; vy: number } {
  const normalizedHit = clamp((ballX - paddleX) / paddleHalfWidth, -1, 1) * 1.05;
  const currentSpeed = Math.hypot(currentVx, currentVy);
  const nextSpeed = Math.min(currentSpeed * 1.008, baseSpeed * 1.45);
  return {
    vx: Math.sin(normalizedHit) * nextSpeed,
    vy: -Math.cos(normalizedHit) * nextSpeed,
  };
}

export function isGameOver(lives: number): boolean {
  return lives <= 0;
}

export function isGameWon(standing: number): boolean {
  return standing === 0;
}
