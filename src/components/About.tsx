import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { experiences, introWords, profile, stackCategories } from '../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

interface MarqueeRowProps {
  items: string[];
  copies: number;
  duration: number;
  reverse?: boolean;
}

const MarqueeRow: React.FC<MarqueeRowProps> = ({ items, copies, duration, reverse }) => {
  const repeated = Array.from({ length: copies }, () => items).flat();
  return (
    <div className="marquee-row" aria-hidden="true">
      <div
        className="marquee-track"
        style={
          {
            '--marquee-duration': `${duration}s`,
            '--marquee-direction': reverse ? 'reverse' : 'normal',
          } as React.CSSProperties
        }
      >
        {[...repeated, ...repeated].map((item, idx) => (
          <span
            key={idx}
            className="mx-1 md:mx-1.5 inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 md:px-5 md:py-2.5 text-[13px] md:text-[15px] font-medium tracking-wide text-gray-300 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            <span className="h-1 w-1 shrink-0 rounded-full bg-white/25" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export const About: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const paragraph = paragraphRef.current;
    if (!section || !paragraph) return;

    const isDesktop = window.innerWidth >= 768;
    const ctx = gsap.context(() => {
      gsap.from('[data-intro]', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          once: true,
        },
      });

      if (isDesktop) {
        gsap.fromTo(
          paragraph.querySelectorAll('.word'),
          { color: '#52525b', opacity: 0.2 },
          {
            color: '#ffffff',
            opacity: 1,
            stagger: 0.1,
            scrollTrigger: {
              trigger: paragraph,
              start: 'top 85%',
              end: 'bottom 50%',
              scrub: true,
            },
          }
        );
      } else {
        gsap.from(paragraph, {
          y: 24,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: paragraph,
            start: 'top 90%',
            once: true,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="bg-[#050505] text-white pt-24 pb-0 px-6 md:px-16 flex flex-col justify-center relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full z-10 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 md:gap-12 lg:gap-24 items-center">
          <div className="flex flex-col items-center lg:items-start">
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.32em] text-gray-500 mb-4 md:mb-6">
              About me
            </span>
            <h2
              data-intro
              className="text-[18vw] md:text-[9rem] lg:text-[11rem] xl:text-[13rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-800 drop-shadow-2xl leading-[0.85]"
            >
              Intro
            </h2>
            <div className="mt-6 flex items-center gap-4 bg-white/[0.04] p-2.5 pr-5 rounded-full border border-white/10 backdrop-blur-md">
              <img
                src="/assets/aistudio/image__1__3992e824.png"
                alt={profile.name}
                className="w-14 h-14 rounded-full object-cover bg-neutral-900 border border-[var(--accent)]/40 shadow-inner"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-tight">{profile.name}</span>
                <span className="text-[11px] text-gray-400 font-mono">B.Tech CSE · GIET University</span>
              </div>
            </div>
          </div>

          <div className="relative bg-white/5 backdrop-blur-md px-5 py-7 md:p-10 lg:p-12 rounded-3xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/[0.07] transition-colors duration-300 text-left">
            <p
              ref={paragraphRef}
              lang="en"
              className="text-gray-300 text-[15px] sm:text-base md:text-lg lg:text-xl leading-[1.7] md:leading-relaxed font-light text-pretty hyphens-auto"
            >
              {introWords.map((wordObj, idx) => (
                <React.Fragment key={idx}>
                  <span className={`word ${wordObj.className || ''}`}>{wordObj.text}</span>
                  {idx < introWords.length - 1 && ' '}
                </React.Fragment>
              ))}
            </p>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Education</span>
                <span className="text-sm font-medium text-white">{profile.university}</span>
                <span className="text-xs text-gray-400">B.Tech CSE (2023 – 2027)</span>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Location</span>
                <span className="text-sm font-medium text-white">{profile.location}</span>
                <span className="text-xs text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Open to Internships & Roles
                </span>
              </div>
              <div className="ml-auto">
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full border border-white/20 text-xs text-gray-300 hover:text-white hover:border-white transition-colors inline-flex items-center gap-2"
                >
                  Download CV (PDF)
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Experience Section Cards from PDF */}
        <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiences.map((exp, idx) => (
            <div
              key={idx}
              className="p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xs font-mono text-[var(--accent)] tracking-wider uppercase">
                  {exp.period}
                </span>
                <span className="text-[11px] text-gray-500">{exp.location}</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-1">{exp.role}</h3>
              <p className="text-sm text-gray-400 font-medium mb-4">{exp.organization}</p>
              <ul className="space-y-2 text-xs md:text-sm text-gray-300 font-light">
                {exp.highlights.map((item, hIdx) => (
                  <li key={hIdx} className="flex items-start gap-2.5">
                    <span className="text-[var(--accent)] text-xs mt-1">■</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-auto -mx-6 md:-mx-16 pt-10 pb-2 bg-[#030303]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex items-center gap-4 px-6 md:px-16 mb-6">
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.32em] text-gray-500 whitespace-nowrap">
            Technical Skills & Stack
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        <ul className="sr-only">
          {stackCategories
            .flatMap((cat) => cat.items)
            .map((item) => (
              <li key={item}>{item}</li>
            ))}
        </ul>

        <div className="flex flex-col gap-2.5 md:gap-3">
          {stackCategories.map((cat) => (
            <MarqueeRow
              key={cat.label}
              items={cat.items}
              copies={cat.copies}
              duration={cat.duration}
              reverse={cat.reverse}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
