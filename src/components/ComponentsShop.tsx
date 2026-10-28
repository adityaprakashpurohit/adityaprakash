import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { componentProducts, profile } from '../data/portfolioData';

const RACK_CLASSES = [
  'scale-100 opacity-100',
  'scale-90 opacity-50',
  'scale-[0.81] opacity-25',
];

const CARD_GRADIENTS = [
  'bg-[linear-gradient(160deg,#1c1917_0%,#292524_50%,#0c0a09_100%)]',
  'bg-[linear-gradient(160deg,#0f172a_0%,#1e293b_50%,#020617_100%)]',
  'bg-[linear-gradient(160deg,#1e1b4b_0%,#312e81_50%,#0f172a_100%)]',
  'bg-[linear-gradient(160deg,#064e3b_0%,#065f46_50%,#022c22_100%)]',
  'bg-[linear-gradient(160deg,#431407_0%,#7c2d12_50%,#1c1917_100%)]',
  'bg-[linear-gradient(160deg,#2e1065_0%,#3b0764_50%,#09090b_100%)]',
];

interface ShelfCardProps {
  item: (typeof componentProducts)[0];
  idx: number;
  isActive: boolean;
  rack: number;
  onSelect: () => void;
  wasDragged: () => boolean;
}

const ShelfCard: React.FC<ShelfCardProps> = ({
  item,
  idx,
  isActive,
  rack,
  onSelect,
  wasDragged,
}) => {
  const query = encodeURIComponent(
    `Hi Aditya, I saw your portfolio and would like to discuss your "${item.name}" project/architecture.`
  );
  const grad = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];

  return (
    <div
      className={`relative shrink-0 snap-start flex flex-col origin-top transition-[scale,opacity] duration-[320ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] w-[280px] sm:w-[320px] lg:w-[360px] ${
        RACK_CLASSES[rack] || RACK_CLASSES[2]
      }`}
    >
      <div
        onClick={() => {
          if (!wasDragged() && !isActive) {
            onSelect();
          }
        }}
        className="block w-full text-left cursor-pointer bg-[#0d0d0f] border-2 border-[var(--accent)]/55 overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <div className={`relative w-full aspect-[9/14] ${grad} p-6 flex flex-col justify-between overflow-hidden border-b border-white/10`}>
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-white/15 text-white border border-white/20">
              {item.category}
            </span>
            <span className="text-[11px] font-mono text-[var(--accent)] font-semibold">
              0{idx + 1}
            </span>
          </div>

          <div className="relative z-10 my-auto py-4">
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2 leading-tight">
              {item.name}
            </p>
            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
              {item.tagline}
            </p>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>{item.tech}</span>
            <span className="text-[var(--accent)]">{item.metrics}</span>
          </div>
        </div>

        <div className="px-5 py-4 bg-[#0a0a0c]">
          <div className="flex items-center justify-between gap-3 text-[10px] tracking-wider text-gray-400 font-mono uppercase">
            <span>Core: {item.deps}</span>
            <a
              href={`https://wa.me/${profile.whatsapp}?text=${query}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              Discuss module →
            </a>
          </div>
        </div>
      </div>

      <a
        href={`https://wa.me/${profile.whatsapp}?text=${query}`}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={isActive ? 0 : -1}
        className={`mt-4 w-full px-5 py-2.5 rounded-full border border-white/25 text-white text-xs hover:bg-white hover:text-black transition-colors inline-flex items-center justify-center gap-2 ${
          isActive ? '' : 'pointer-events-none'
        }`}
      >
        Chat about {item.name}
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.24-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.2 3.72.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.29z" />
        </svg>
      </a>
    </div>
  );
};

export const ComponentsShop: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalItems = componentProducts.length;
  const activeFocus = Math.min(currentIndex, totalItems - 1);

  const updateIndexFromScroll = useCallback(() => {
    const shelf = shelfRef.current;
    if (!shelf) return;
    const currentScroll = shelf.scrollLeft;
    let closestIndex = 0;
    let minDistance = Infinity;

    Array.from(shelf.children).forEach((child, idx) => {
      const el = child as HTMLElement;
      const dist = Math.abs(el.offsetLeft - shelf.offsetLeft - currentScroll);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });
    setCurrentIndex(closestIndex);
  }, []);

  useEffect(() => {
    const shelf = shelfRef.current;
    if (!shelf) return;
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateIndexFromScroll);
    };
    shelf.addEventListener('scroll', onScroll, { passive: true });
    updateIndexFromScroll();
    return () => {
      cancelAnimationFrame(rafId);
      shelf.removeEventListener('scroll', onScroll);
    };
  }, [updateIndexFromScroll]);

  const scrollToIndex = useCallback((index: number) => {
    const shelf = shelfRef.current;
    if (!shelf) return;
    const targetChild = shelf.children[
      Math.max(0, Math.min(shelf.children.length - 1, index))
    ] as HTMLElement;
    if (targetChild) {
      shelf.scrollTo({
        left: targetChild.offsetLeft - shelf.offsetLeft,
        behavior: 'smooth',
      });
    }
  }, []);

  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const shelf = shelfRef.current;
    if (!shelf) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startScroll: shelf.scrollLeft,
      moved: 0,
    };
    shelf.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active || !shelfRef.current) return;
    const diff = e.clientX - dragRef.current.startX;
    dragRef.current.moved = Math.abs(diff);
    shelfRef.current.scrollLeft = dragRef.current.startScroll - diff;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current.active) {
      dragRef.current.active = false;
      shelfRef.current?.releasePointerCapture?.(e.pointerId);
      scrollToIndex(currentIndex);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToIndex(currentIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToIndex(currentIndex - 1);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="components"
      className="bg-[#050505] w-full text-white overflow-hidden pt-10 md:pt-20 pb-24"
    >
      <div className="max-w-[1600px] mx-auto w-full flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-5 px-6 md:px-16">
        <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col">
          <div className="bg-white/[0.05] p-[1.125rem] border-t-2 border-white/80 rounded-xl">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white leading-[0.95] mb-5">
              Architectural Modules & Engineered Systems.
            </h2>
            <p className="text-gray-400 text-sm font-light leading-relaxed mb-4">
              Explore key modules built across MotoRent, Student ERP, and AI/ML experiments — built with clean abstractions, reactive state flows, and modular reusable design.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span>{totalItems} Core Blueprints</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-3 bg-white/[0.05] p-[1.125rem] rounded-xl">
            <a
              href={profile.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group px-6 py-3.5 bg-[var(--accent)] text-black text-xs font-bold tracking-[0.15em] uppercase hover:bg-[var(--accent-hover)] transition-colors inline-flex items-center gap-2 shadow-[0_0_28px_-6px_var(--accent)] rounded-lg"
            >
              Explore on GitHub
              <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>

            <a
              href={`https://wa.me/${profile.whatsapp}?text=Hi%20Aditya%2C%20I'd%20like%20to%20connect%20about%20your%20projects.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 border border-white/25 text-white text-xs font-bold tracking-[0.15em] uppercase hover:bg-white hover:text-black transition-colors rounded-lg"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col bg-white/[0.05] p-[1.125rem] gap-3 rounded-xl">
          <div
            ref={shelfRef}
            role="group"
            aria-roledescription="carousel"
            aria-label="Engineered modules"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="flex items-stretch gap-4 py-3 -my-3 -mr-[1.125rem] pr-[1.125rem] overflow-x-auto snap-x snap-mandatory cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
          >
            {componentProducts.map((prod, idx) => (
              <ShelfCard
                key={prod.slug}
                item={prod}
                idx={idx}
                isActive={idx === currentIndex}
                rack={Math.min(2, Math.abs(idx - currentIndex))}
                wasDragged={() => dragRef.current.moved > 6}
                onSelect={() => scrollToIndex(idx)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
            <div className="flex items-center gap-4">
              <div className="flex gap-[0.3rem]">
                {componentProducts.map((prod, idx) => (
                  <button
                    key={prod.slug}
                    type="button"
                    onClick={() => scrollToIndex(idx)}
                    aria-label={`Go to ${prod.name}`}
                    className={`h-[3px] transition-all duration-[320ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                      idx === activeFocus ? 'w-5 bg-white' : 'w-2 bg-white/25 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
              <span className="hidden sm:inline text-[10px] tracking-[0.2em] text-[#ff5c3d] font-mono uppercase">
                → Drag to spin modules
              </span>
            </div>

            <span className="text-[10px] tracking-[0.2em] text-gray-500 font-mono">
              {activeFocus + 1} / {totalItems}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
