import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';

interface LetterIntroProps {
  word: string;
  pivotIndex?: number;
  className?: string;
  letterClassName?: string;
  dotClassName?: string;
  loop?: boolean;
  speed?: number;
  onComplete?: () => void;
}

const measureChar = (char: string, el: HTMLElement, fontHeight: number) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const style = getComputedStyle(el);
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const metrics = ctx.measureText(char);
    if (!Number.isFinite(metrics.actualBoundingBoxLeft)) return null;
    const offset =
      (fontHeight - (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent)) / 2 +
      metrics.fontBoundingBoxAscent;
    return {
      cx: (metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft) / 2,
      bottom: offset + metrics.fontBoundingBoxDescent,
      height: metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent,
    };
  } catch {
    return null;
  }
};

export const LetterIntro: React.FC<LetterIntroProps> = ({
  word,
  pivotIndex,
  className = '',
  letterClassName = '',
  dotClassName = 'bg-white',
  loop = false,
  speed = 1.15,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const [counter, setCounter] = useState(0);
  const letters = useMemo(() => Array.from(word), [word]);
  const pivot = useMemo(() => {
    if (Number.isInteger(pivotIndex) && letters[pivotIndex!]?.trim()) return pivotIndex!;
    const idx = letters.findIndex((char) => 'Iil1'.includes(char));
    return idx === -1 ? 0 : idx;
  }, [letters, pivotIndex]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const heading = headingRef.current;
    const dot = dotRef.current;
    const glow = glowRef.current;
    const activeLetterRefs = letterRefs.current.slice(0, letters.length);
    const pivotEl = activeLetterRefs[pivot];

    if (!container || !heading || !dot || !pivotEl) return;

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      gsap.set(activeLetterRefs.filter(Boolean), { opacity: 1 });
      gsap.set(dot, { opacity: 0 });
      const timer = setTimeout(() => onCompleteRef.current?.(), 250);
      return () => clearTimeout(timer);
    }

    gsap.set(activeLetterRefs.filter(Boolean), { opacity: 0 });
    gsap.set(dot, { opacity: 0 });

    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled) return;

      ctx = gsap.context(() => {
        gsap.set([...activeLetterRefs.filter(Boolean), dot], { clearProps: 'transform' });
        const cRect = container.getBoundingClientRect();
        const fontSize = parseFloat(getComputedStyle(heading).fontSize) || 16;
        const rects = activeLetterRefs.map((el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            left: r.left - cRect.left,
            top: r.top - cRect.top,
            w: r.width,
            h: r.height,
            cx: r.left - cRect.left + r.width / 2,
            cy: r.top - cRect.top + r.height / 2,
          };
        });

        const pRect = rects[pivot];
        if (!pRect) return;

        const metrics =
          measureChar(letters[pivot], pivotEl, pRect.h) ?? {
            cx: pRect.w / 2,
            bottom: pRect.h,
            height: pRect.h * 0.78,
          };

        const pivotPoint = { x: pRect.left + metrics.cx, y: pRect.top + metrics.bottom };
        const stemHeight = metrics.height;
        const dotSize = fontSize * 0.24;

        gsap.set(pivotEl, {
          transformOrigin: `${(metrics.cx / pRect.w) * 100}% ${(metrics.bottom / pRect.h) * 100}%`,
        });

        gsap.set(dot, {
          width: dotSize,
          height: dotSize,
          left: pivotPoint.x - dotSize / 2,
          top: pivotPoint.y + fontSize * 0.1,
        });

        const getRotatedTip = (deg: number) => {
          const rad = (deg * Math.PI) / 180;
          return {
            x: pivotPoint.x + Math.sin(rad) * stemHeight,
            y: pivotPoint.y - Math.cos(rad) * stemHeight,
          };
        };

        const dropStartY = -(cRect.top + pivotPoint.y) - fontSize;
        const flashRadius = fontSize * 2.6;

        const flash = (tl: gsap.core.Timeline, pos: { x: number; y: number }, peakOpacity: number, atTime: number) => {
          if (!glow) return;
          tl.set(glow, { width: flashRadius, height: flashRadius, left: pos.x - flashRadius / 2, top: pos.y - flashRadius / 2 }, atTime)
            .to(glow, { opacity: peakOpacity, duration: 0.05, ease: 'none' }, atTime)
            .to(glow, { opacity: 0, duration: 0.34, ease: 'power2.out' }, atTime + 0.05);
        };

        const flingLetter = (
          tl: gsap.core.Timeline,
          idx: number,
          origin: { x: number; y: number },
          atTime: number
        ) => {
          const el = activeLetterRefs[idx];
          const r = rects[idx];
          if (!el || !r) return atTime;

          const dx = origin.x - r.cx;
          const dy = origin.y - r.cy;
          const dur = 0.5 + Math.min(Math.abs(dx) / 900, 0.32);
          const arcHeight = -(Math.abs(dx) * 0.3 + fontSize * 0.25);
          const spin = (dx > 0 ? -1 : 1) * gsap.utils.random(170, 300);

          tl.set(el, { x: dx, y: dy, rotation: spin, scale: 0.3, opacity: 0, transformOrigin: '50% 50%' }, atTime)
            .to(el, { opacity: 1, scale: 1, duration: dur * 0.45 }, atTime)
            .to(el, { x: 0, duration: dur, ease: 'power1.out' }, atTime)
            .to(el, { y: Math.min(dy, 0) + arcHeight, duration: dur * 0.45, ease: 'power2.out' }, atTime)
            .to(el, { y: 0, duration: dur * 0.55, ease: 'power2.in' }, atTime + dur * 0.45)
            .to(el, { rotation: 0, duration: dur, ease: 'power2.out' }, atTime)
            .to(el, { y: -fontSize * 0.05, duration: 0.09, ease: 'power2.out' }, atTime + dur)
            .to(el, { y: 0, duration: 0.16, ease: 'power2.in' }, atTime + dur + 0.09);

          return atTime + dur;
        };

        const tiltAndFlingGroup = (
          tl: gsap.core.Timeline,
          angle: number,
          indices: number[],
          atTime: number
        ) => {
          if (!indices.length) return atTime;
          const tip = getRotatedTip(angle);
          tl.to(pivotEl, { rotation: angle, duration: 0.4, ease: 'back.out(1.4)' }, atTime)
            .to(pivotEl, { rotation: angle + (angle < 0 ? 6 : -6), duration: 0.08 }, atTime + 0.34)
            .to(pivotEl, { rotation: angle, duration: 0.3, ease: 'elastic.out(1, 0.5)' }, atTime + 0.42);

          let maxEnd = atTime;
          indices.forEach((idx, i) => {
            const flingStart = atTime + 0.34 + i * 0.1;
            flash(tl, tip, 0.5 - i * 0.1, flingStart);
            maxEnd = Math.max(maxEnd, flingLetter(tl, idx, tip, flingStart));
          });
          return maxEnd;
        };

        const master = gsap.timeline({
          defaults: { ease: 'power2.out' },
          repeat: loop ? -1 : 0,
          repeatDelay: loop ? 1.1 : 0,
          onComplete: () => {
            if (!loop) onCompleteRef.current?.();
          },
        });

        master.timeScale(speed);
        master.set(container, { opacity: 1 });
        master.set(activeLetterRefs.filter(Boolean), { opacity: 0, x: 0, y: 0, rotation: 0, scale: 1 });
        master.set(pivotEl, { opacity: 0, y: dropStartY, rotation: 0 });
        master.set(dot, { opacity: 0, y: dropStartY, scale: 1 });

        const dropTl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        const rebound = fontSize * 0.4;

        dropTl.set(dot, { opacity: 1 }, 0)
          .to(dot, { y: 0, duration: 0.42, ease: 'power2.in' }, 0)
          .to(dot, { scaleX: 0.82, scaleY: 1.22, duration: 0.28, ease: 'power1.in' }, 0.14)
          .to(dot, { scaleX: 1.4, scaleY: 0.52, duration: 0.06 }, 0.42)
          .to(dot, { y: -rebound, duration: 0.2 }, 0.48)
          .to(dot, { scaleX: 1, scaleY: 1, duration: 0.18 }, 0.48)
          .to(dot, { y: 0, duration: 0.18, ease: 'power2.in' }, 0.68)
          .to(dot, { scaleX: 0.92, scaleY: 1.08, duration: 0.14, ease: 'power1.in' }, 0.72)
          .to(dot, { scaleX: 1.2, scaleY: 0.74, duration: 0.05 }, 0.86)
          .to(dot, { scaleX: 1, scaleY: 1, duration: 0.36, ease: 'elastic.out(1, 0.42)' }, 0.91);

        flash(dropTl, pivotPoint, 0.4, 0.42);
        flash(dropTl, pivotPoint, 0.24, 0.86);

        const stemRebound = fontSize * 0.13;
        dropTl.set(pivotEl, { opacity: 1 }, 0.8)
          .to(pivotEl, { y: 0, duration: 0.34, ease: 'power2.in' }, 0.8)
          .to(pivotEl, { scaleX: 0.86, scaleY: 1.16, duration: 0.24, ease: 'power1.in' }, 0.88)
          .to(pivotEl, { scaleX: 1.32, scaleY: 0.64, duration: 0.06 }, 1.14)
          .to(pivotEl, { y: -stemRebound, duration: 0.1 }, 1.2)
          .to(pivotEl, { scaleX: 1, scaleY: 1, duration: 0.12 }, 1.2)
          .to(pivotEl, { y: 0, duration: 0.1, ease: 'power2.in' }, 1.3)
          .to(pivotEl, { scaleX: 1.12, scaleY: 0.88, duration: 0.05 }, 1.4)
          .to(pivotEl, { scaleX: 1, scaleY: 1, duration: 0.38, ease: 'elastic.out(1, 0.4)' }, 1.45)
          .fromTo(pivotEl, { rotation: -9 }, { rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.36)' }, 1.19);

        flash(dropTl, pivotPoint, 0.6, 1.14);
        flash(dropTl, pivotPoint, 0.26, 1.4);

        master.add(dropTl.timeScale(0.5), 0);

        const leftGroup = letters
          .map((_, i) => i)
          .filter((i) => i < pivot)
          .reverse();
        const rightGroup = letters.map((_, i) => i).filter((i) => i > pivot);

        let phaseEnd = 1.4 / 0.5;
        phaseEnd = tiltAndFlingGroup(master, -63, leftGroup, phaseEnd);
        phaseEnd = tiltAndFlingGroup(master, 63, rightGroup, leftGroup.length ? phaseEnd - 0.3 : phaseEnd);

        master.to(pivotEl, { rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.55)' }, phaseEnd - 0.16)
          .to(dot, { opacity: 0, scale: 0, duration: 0.3, ease: 'power2.in' }, phaseEnd - 0.12);
      }, container);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [letters, pivot, loop, speed, counter]);

  return (
    <div ref={containerRef} aria-hidden="true" className="absolute top-0 left-0 opacity-0">
      <h1 ref={headingRef} className={className}>
        {letters.map((char, idx) => (
          <span
            key={`${char}-${idx}`}
            ref={(el) => {
              letterRefs.current[idx] = el;
            }}
            className={`inline-block will-change-transform ${letterClassName}`}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>
      <span ref={dotRef} className={`absolute rounded-full pointer-events-none ${dotClassName}`} />
      <span
        ref={glowRef}
        className="absolute rounded-full opacity-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)',
        }}
      />
    </div>
  );
};
