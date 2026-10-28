import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects, profile } from '../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

interface ProjectsProps {
  onCtaClick?: () => void;
}

export const Projects: React.FC<ProjectsProps> = ({ onCtaClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Parallax images
      gsap.utils.toArray<HTMLElement>('[data-parallax]', container).forEach((imgEl) => {
        const frame = imgEl.closest('[data-parallax-frame]') || imgEl;
        gsap.fromTo(
          imgEl,
          { yPercent: -4 },
          {
            yPercent: 4,
            ease: 'none',
            scrollTrigger: {
              trigger: frame,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });

      // Reveal elements
      gsap.utils.toArray<HTMLElement>('[data-reveal]', container).forEach((el) => {
        const dir = el.dataset.reveal;
        const xOffset = dir === 'left' ? -40 : dir === 'right' ? 40 : 0;
        const yOffset = dir === 'up' ? 40 : 0;
        gsap.from(el, {
          x: xOffset,
          y: yOffset,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        });
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      id="project"
      className="bg-[#050505] w-full text-white pt-10 md:pt-20 pb-24 px-6 md:px-16"
    >
      <div className="flex flex-col lg:flex-row justify-between items-start w-full z-10 gap-12 lg:gap-0 mb-20 lg:mb-32">
        <div className="w-full lg:w-7/12 overflow-visible">
          <h2
            data-reveal-lines
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter drop-shadow-2xl leading-[0.9] uppercase whitespace-nowrap"
          >
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="line flex items-center gap-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-800">
                  Featured
                </span>
                <span className="font-light italic text-gray-300 lowercase font-serif pr-4 pt-2 md:pt-4">
                  projects
                </span>
              </span>
            </span>
          </h2>
        </div>

        <div className="w-full lg:w-4/12 flex flex-col items-start lg:mt-4">
          <p className="text-gray-300 text-sm md:text-base font-light leading-relaxed mb-8">
            High-impact web platforms, multi-step booking systems, academic interfaces, and machine learning pipelines developed with modern frameworks and clean architecture.
          </p>
          <button
            type="button"
            onClick={onCtaClick}
            className="cursor-pointer px-6 py-2.5 rounded-full border border-[var(--accent)] bg-[var(--accent)] text-black font-medium text-xs md:text-sm hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)] transition-colors flex items-center gap-2"
          >
            Explore Stack & Code
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-24 lg:gap-36 w-full">
        {projects.map((proj, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <div
              key={proj.name}
              className={`flex flex-col ${
                isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center justify-between gap-12 lg:gap-16 w-full group`}
            >
              <div
                data-reveal={isEven ? 'left' : 'right'}
                data-parallax-frame
                className="w-full lg:w-6/12 overflow-hidden relative aspect-[16/10] bg-[#111] rounded-xl border border-white/10"
              >
                <img
                  src={proj.image}
                  alt={proj.name}
                  loading="lazy"
                  decoding="async"
                  data-parallax="40"
                  className="w-full h-[112%] -mt-[6%] object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
              </div>

              <div className="w-full lg:w-5/12 flex flex-col items-start">
                <span className="text-[var(--accent)] text-xs md:text-sm font-bold tracking-widest uppercase mb-3">
                  0{idx + 1}
                </span>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-white leading-[1.1] uppercase mb-4">
                  {proj.prefix}{' '}
                  {proj.highlight && (
                    <span className="font-light italic text-gray-300 lowercase font-serif">
                      {proj.highlight}
                    </span>
                  )}
                  {proj.highlight ? <br /> : ' '}
                  {proj.subtitle}
                </h3>

                {/* Tech stack tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {proj.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium tracking-wide bg-white/[0.06] border border-white/10 text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed mb-6">
                  {proj.description}
                </p>

                {/* Resume Bullet Points */}
                <ul className="space-y-2 mb-8 text-xs md:text-sm text-gray-300 font-light">
                  {proj.keyPoints.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5">
                      <span className="text-[var(--accent)] text-xs mt-1">■</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-4 flex-wrap">
                  <a
                    href={proj.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer px-6 py-2.5 rounded-full border border-[var(--accent)] bg-[var(--accent)] text-black text-xs md:text-sm font-medium hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)] transition-colors inline-flex items-center gap-2 shadow-sm"
                  >
                    GitHub
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                  </a>

                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer px-6 py-2.5 rounded-full border border-white/30 text-white text-xs md:text-sm hover:bg-white hover:text-black transition-colors inline-flex items-center gap-2"
                  >
                    View in Resume
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
