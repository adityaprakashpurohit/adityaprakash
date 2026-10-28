import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  clamp,
  measureLinesPixelBounds,
  buildPixelGrid,
  computePaddleBounce,
  STATE_EMPTY,
  STATE_ACTIVE,
  STATE_HIT,
} from '../utils/gameLogic';

interface BreakoutGameProps {
  lines?: string[];
  caption?: string;
  startingLives?: number;
  autoPlay?: boolean;
  speed?: number;
  className?: string;
  panelClassName?: string;
  onWin?: () => void;
}

interface GameState {
  width: number;
  height: number;
  cell: number;
  cols: number;
  rows: number;
  grid: Uint8Array;
  standing: number;
  ox: number;
  oy: number;
  gap: number;
  accent: string;
  layer: HTMLCanvasElement;
  layerCtx: CanvasRenderingContext2D;
  layerDirty: boolean;
  radius: number;
  paddle: { x: number; y: number; w: number; h: number };
  ball: { x: number; y: number; vx: number; vy: number };
  baseSpeed: number;
  serving: boolean;
  serveDelay: number;
  lives: number;
  phase: 'idle' | 'attract' | 'playing' | 'won' | 'over';
  clock: number;
  regrow: { cell: number; at: number }[];
  last: number;
  acc: number;
}

export const BreakoutGame: React.FC<BreakoutGameProps> = ({
  lines = ['Hello', 'World'],
  caption,
  startingLives = 3,
  autoPlay = true,
  speed = 1,
  className = '',
  panelClassName = 'aspect-[5/6] sm:aspect-[4/3] lg:aspect-[16/9]',
  onWin,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState | null>(null);
  const linesRef = useRef(lines);
  const onWinRef = useRef(onWin);
  const controlsRef = useRef<{
    launch: () => void;
    movePaddleTo: (x: number) => void;
    nudgePaddle: (dx: number) => void;
  } | null>(null);

  useEffect(() => {
    linesRef.current = lines;
    onWinRef.current = onWin;
  }, [lines, onWin]);

  const [phase, setPhase] = useState<'idle' | 'attract' | 'playing' | 'won' | 'over'>('idle');
  const [lives, setLives] = useState(startingLives);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!container || !canvas || !ctx) return;

    let animFrame = 0;
    let sizeKey = '';
    let isVisible = true;
    let isIntersecting = false;

    const renderLayer = () => {
      const g = gameRef.current;
      if (!g) return;
      const { layerCtx, cell, gap, cols, rows, grid, ox, oy } = g;
      layerCtx.clearRect(0, 0, g.width, g.height);
      const brickSize = cell - gap;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = grid[r * cols + c];
          if (val !== STATE_EMPTY) {
            layerCtx.fillStyle = val === STATE_ACTIVE ? '#f2efe9' : 'rgba(242,239,233,0.07)';
            layerCtx.fillRect(ox + c * cell, oy + r * cell, brickSize, brickSize);
          }
        }
      }
      g.layerDirty = false;
    };

    const render = () => {
      const g = gameRef.current;
      if (!g) return;
      if (g.layerDirty) renderLayer();

      ctx.clearRect(0, 0, g.width, g.height);
      ctx.drawImage(g.layer, 0, 0, g.width, g.height);

      if (g.phase !== 'playing' && g.phase !== 'attract') return;

      const { paddle, ball, radius } = g;
      ctx.fillStyle = g.accent;
      const padX = paddle.x - paddle.w / 2;

      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(padX, paddle.y, paddle.w, paddle.h, paddle.h / 2);
        ctx.fill();
      } else {
        ctx.fillRect(padX, paddle.y, paddle.w, paddle.h);
      }

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const initGrid = () => {
      const cRect = container.getBoundingClientRect();
      const w = Math.round(cRect.width);
      const h = Math.round(cRect.height);
      if (w < 40 || h < 40) return;

      sizeKey = `${w}x${h}`;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const willAttract = autoPlay && !reduced;
      const curLines = linesRef.current;
      const bounds = measureLinesPixelBounds(curLines);

      const scaleFactor = Math.min((w * (w < 520 ? 0.94 : 0.88)) / bounds.w, (h * 0.56) / bounds.h);
      const pixelPitch = clamp(Math.floor(scaleFactor * dpr) / dpr, 4, 26);
      const cols = Math.floor(w / pixelPitch);
      const rows = Math.floor(h / pixelPitch);

      const { grid, standing } = buildPixelGrid(
        curLines,
        cols,
        rows,
        clamp(0.3 + (h / w) * 0.12, 0.3, 0.44)
      );

      const layerCanvas = document.createElement('canvas');
      layerCanvas.width = canvas.width;
      layerCanvas.height = canvas.height;
      const layerCtx = layerCanvas.getContext('2d')!;
      layerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const accentColor =
        getComputedStyle(container).getPropertyValue('--accent').trim() || '#e8e4dc';

      gameRef.current = {
        width: w,
        height: h,
        cell: pixelPitch,
        cols,
        rows,
        grid,
        standing,
        ox: (w - cols * pixelPitch) / 2,
        oy: (h - rows * pixelPitch) / 2,
        gap: Math.max(1, Math.round(pixelPitch * 0.22)),
        accent: accentColor,
        layer: layerCanvas,
        layerCtx,
        layerDirty: true,
        radius: clamp(pixelPitch * 0.5, 4, 9),
        paddle: {
          x: w / 2,
          w: clamp(w * 0.26, 64, 200),
          h: clamp(pixelPitch * 0.8, 5, 14),
          y: h - Math.max(26, pixelPitch * 2.4),
        },
        ball: { x: w / 2, y: 0, vx: 0, vy: 0 },
        baseSpeed: clamp(h * 0.46, 150, 420) * speed,
        serving: true,
        serveDelay: willAttract ? 0.6 : Infinity,
        lives: startingLives,
        phase: willAttract ? 'attract' : 'idle',
        clock: 0,
        regrow: [],
        last: 0,
        acc: 0,
      };

      setPhase(willAttract ? 'attract' : 'idle');
      setLives(startingLives);
      render();
    };

    const getHitBricks = () => {
      const g = gameRef.current;
      if (!g) return [];
      const { ball, radius, cell, cols, rows, ox, oy, grid } = g;
      const leftCol = Math.floor((ball.x - radius - ox) / cell);
      const rightCol = Math.floor((ball.x + radius - ox) / cell);
      const topRow = Math.floor((ball.y - radius - oy) / cell);
      const bottomRow = Math.floor((ball.y + radius - oy) / cell);
      const hits: number[] = [];

      for (let r = Math.max(0, topRow); r <= Math.min(rows - 1, bottomRow); r++) {
        for (let c = Math.max(0, leftCol); c <= Math.min(cols - 1, rightCol); c++) {
          const idx = r * cols + c;
          if (grid[idx] === STATE_ACTIVE) hits.push(idx);
        }
      }
      return hits;
    };

    const stepAxis = (axis: 'x' | 'y', dt: number) => {
      const g = gameRef.current;
      if (!g) return;
      if (axis === 'x') g.ball.x += g.ball.vx * dt;
      else g.ball.y += g.ball.vy * dt;

      const hits = getHitBricks();
      if (!hits.length) return;

      const isAttract = g.phase === 'attract';
      hits.forEach((idx) => {
        g.grid[idx] = STATE_HIT;
        --g.standing;
        if (isAttract) {
          g.regrow.push({ cell: idx, at: g.clock + 1.4 });
        }
      });

      g.layerDirty = true;
      if (axis === 'x') {
        g.ball.x -= g.ball.vx * dt;
        g.ball.vx = -g.ball.vx;
      } else {
        g.ball.y -= g.ball.vy * dt;
        g.ball.vy = -g.ball.vy;
      }
    };

    const resetServe = () => {
      const g = gameRef.current;
      if (!g) return;
      g.serving = true;
      g.serveDelay = 0.8;
      g.ball.vx = 0;
      g.ball.vy = 0;
    };

    const setEndPhase = (next: 'won' | 'over') => {
      if (!gameRef.current) return;
      gameRef.current.phase = next;
      setPhase(next);
      if (next === 'won') onWinRef.current?.();
    };

    const tick = (dt: number) => {
      const g = gameRef.current;
      if (!g) return;
      const { ball, paddle, radius } = g;
      const isAttract = g.phase === 'attract';

      g.clock += dt;
      while (g.regrow.length && g.regrow[0].at <= g.clock) {
        const item = g.regrow.shift()!;
        if (g.grid[item.cell] === STATE_HIT) {
          g.grid[item.cell] = STATE_ACTIVE;
          g.standing += 1;
          g.layerDirty = true;
        }
      }

      if (isAttract && !g.serving) {
        paddle.x = clamp(paddle.x + (ball.x - paddle.x) * Math.min(1, dt * 7), paddle.w / 2, g.width - paddle.w / 2);
      }

      if (g.serving) {
        ball.x = paddle.x;
        ball.y = paddle.y - radius - 1;
        if (Number.isFinite(g.serveDelay)) {
          g.serveDelay -= dt;
          if (g.serveDelay <= 0) {
            g.serving = false;
            g.ball.vx = g.baseSpeed * 0.35 * (Math.random() < 0.5 ? -1 : 1);
            g.ball.vy = -g.baseSpeed;
          }
        }
        return;
      }

      stepAxis('x', dt);
      stepAxis('y', dt);

      if (ball.x - radius < 0) {
        ball.x = radius;
        ball.vx = Math.abs(ball.vx);
      }
      if (ball.x + radius > g.width) {
        ball.x = g.width - radius;
        ball.vx = -Math.abs(ball.vx);
      }
      if (ball.y - radius < 0) {
        ball.y = radius;
        ball.vy = Math.abs(ball.vy);
      }

      const inPaddleX = Math.abs(ball.x - paddle.x) <= paddle.w / 2 + radius;
      const inPaddleY = ball.vy > 0 && ball.y + radius >= paddle.y && ball.y - radius <= paddle.y + paddle.h;
      if (inPaddleX && inPaddleY) {
        const bounce = computePaddleBounce(ball.x, paddle.x, paddle.w / 2, g.baseSpeed, ball.vx, ball.vy);
        ball.vx = bounce.vx;
        ball.vy = bounce.vy;
        ball.y = paddle.y - radius - 0.5;
      }

      if (ball.y - radius > g.height) {
        if (isAttract) {
          resetServe();
        } else {
          --g.lives;
          setLives(g.lives);
          if (g.lives <= 0) {
            setEndPhase('over');
          } else {
            resetServe();
          }
        }
      }

      if (!isAttract && g.standing === 0) {
        setEndPhase('won');
      }
    };

    const FIXED_STEP = 1 / 120;
    const gameLoop = (time: number) => {
      animFrame = requestAnimationFrame(gameLoop);
      const g = gameRef.current;
      if (!g) return;

      const dt = g.last ? Math.min((time - g.last) / 1000, 4 * FIXED_STEP) : 0;
      g.last = time;

      if (g.phase === 'playing' || g.phase === 'attract') {
        g.acc += dt;
        let iters = 0;
        while (g.acc >= FIXED_STEP && iters < 4) {
          tick(FIXED_STEP);
          g.acc -= FIXED_STEP;
          iters++;
        }
        if (iters === 4) g.acc = 0;
      }
      render();
    };

    const isRunning = () => isVisible && isIntersecting;
    const startLoop = () => {
      if (!animFrame && isRunning()) {
        if (gameRef.current) {
          gameRef.current.last = 0;
          gameRef.current.acc = 0;
        }
        animFrame = requestAnimationFrame(gameLoop);
      }
    };
    const stopLoop = () => {
      cancelAnimationFrame(animFrame);
      animFrame = 0;
    };

    controlsRef.current = {
      launch: () => {
        let g = gameRef.current;
        if (!g) return;
        if (g.phase !== 'playing') {
          initGrid();
          g = gameRef.current;
        }
        if (!g) return;
        g.phase = 'playing';
        setPhase('playing');
        if (g.serving) {
          g.ball.x = g.paddle.x;
          g.ball.y = g.paddle.y - g.radius - 1;
          g.serving = false;
          g.serveDelay = Infinity;
          g.ball.vx = g.baseSpeed * 0.35;
          g.ball.vy = -g.baseSpeed;
        }
        startLoop();
      },
      movePaddleTo: (x: number) => {
        const g = gameRef.current;
        if (g) g.paddle.x = clamp(x, g.paddle.w / 2, g.width - g.paddle.w / 2);
      },
      nudgePaddle: (dx: number) => {
        const g = gameRef.current;
        if (g) g.paddle.x = clamp(g.paddle.x + dx, g.paddle.w / 2, g.width - g.paddle.w / 2);
      },
    };

    initGrid();
    startLoop();

    let resizeTimer: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const rect = container.getBoundingClientRect();
        if (`${Math.round(rect.width)}x${Math.round(rect.height)}` !== sizeKey) {
          initGrid();
        }
      }, 180);
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isRunning()) startLoop();
        else stopLoop();
      },
      { threshold: 0.01 }
    );
    intersectionObserver.observe(container);

    const onVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
      if (isRunning()) startLoop();
      else stopLoop();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stopLoop();
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      controlsRef.current = null;
    };
  }, [autoPlay, startingLives, speed]);

  const handlePointerInteraction = useCallback(() => {
    if (gameRef.current?.phase === 'attract') {
      controlsRef.current?.launch();
      return true;
    }
    return false;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;
      handlePointerInteraction();
      controlsRef.current?.movePaddleTo(e.clientX - container.getBoundingClientRect().left);
    },
    [handlePointerInteraction]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = (gameRef.current?.cell ?? 8) * 4;
      if (e.key === 'ArrowLeft') {
        handlePointerInteraction();
        controlsRef.current?.nudgePaddle(-step);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        handlePointerInteraction();
        controlsRef.current?.nudgePaddle(step);
        e.preventDefault();
      } else if (e.key === ' ' || e.key === 'Enter') {
        controlsRef.current?.launch();
        e.preventDefault();
      }
    },
    [handlePointerInteraction]
  );

  const statusLabel =
    phase === 'won'
      ? 'Cleared'
      : phase === 'over'
      ? 'Out of balls'
      : phase === 'playing'
      ? 'Playing'
      : 'Ready';

  return (
    <div className={`relative ${className}`}>
      {caption && (
        <p className="mb-5 inline-block pb-1 border-b-2 border-[var(--accent)] text-xs sm:text-sm font-medium tracking-wide text-white/80">
          {caption}
        </p>
      )}

      <div
        ref={containerRef}
        role="application"
        aria-roledescription="brick breaker"
        aria-label={`${lines.join(' ')} — a playable headline. Arrow keys move the paddle, space launches the ball.`}
        tabIndex={0}
        onPointerMove={onPointerMove}
        onPointerDown={() => controlsRef.current?.launch()}
        onKeyDown={onKeyDown}
        style={{ touchAction: phase === 'playing' ? 'none' : 'auto' }}
        className={`relative w-full ${panelClassName} select-none outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] ${
          phase === 'playing' ? 'cursor-none' : 'cursor-pointer'
        }`}
      >
        <canvas ref={canvasRef} aria-hidden="true" className="block w-full h-full" />
        <h2 className="sr-only">{lines.join(' ')}</h2>
        <p aria-live="polite" className="sr-only">
          {statusLabel}
        </p>

        {phase === 'playing' && (
          <div className="absolute top-3 right-3 flex gap-1.5" aria-hidden="true">
            {Array.from({ length: startingLives }).map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  idx < lives ? 'bg-[var(--accent)]' : 'bg-white/15'
                }`}
              />
            ))}
          </div>
        )}

        {phase !== 'playing' && (
          <div className="absolute bottom-4 right-4 flex items-center gap-4 pointer-events-none">
            {(phase === 'over' || phase === 'won') && (
              <span
                className={`bg-[#050505] px-2 py-1 text-xs sm:text-sm tracking-widest uppercase ${
                  phase === 'won' ? 'text-[var(--accent)]' : 'text-white/50'
                }`}
              >
                {statusLabel}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                controlsRef.current?.launch();
              }}
              className="pointer-events-auto cursor-pointer px-5 py-2 bg-[#050505] border border-[var(--accent)]/50 text-[var(--accent)] text-xs sm:text-sm tracking-[0.3em] uppercase transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              {phase === 'over' || phase === 'won' ? 'Again' : 'Play'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
