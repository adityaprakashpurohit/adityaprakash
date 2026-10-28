import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { LetterIntro } from './LetterIntro';
import { HeroCanvas } from './HeroCanvas';
import { profile } from '../data/portfolioData';

interface HeroProps {
  onPreloadComplete?: () => void;
}

const HERO_CENTER_IMAGE = '/assets/aistudio/image__1__3992e824.png';
const THUMB_IMAGES = [
  '/assets/ecommerce-DVISmkX7.jpg',
  '/assets/expense-sbI4i9tg.jpg',
  '/assets/habitflow-BhEplUHh.jpg',
  '/assets/mindpixel-Bx0qpjdU.jpg',
];

const HEADING_CLASSES =
  'flex items-baseline text-[16vw] md:text-[10rem] lg:text-[14rem] font-black tracking-tighter drop-shadow-2xl leading-none uppercase';
const GRADIENT_TEXT_CLASSES =
  'text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-800';

export const Hero: React.FC<HeroProps> = ({ onPreloadComplete }) => {
  const [displayText, setDisplayText] = useState(profile.wordmark);
  const [introFinished, setIntroFinished] = useState(false);
  const [showLetterIntro, setShowLetterIntro] = useState(true);
  const [startCanvasPlay, setStartCanvasPlay] = useState(false);

  const titleContainerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const leftWordRef = useRef<HTMLSpanElement>(null);
  const rightWordRef = useRef<HTMLSpanElement>(null);
  const roleRef = useRef<HTMLParagraphElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const imageAnchorRef = useRef<HTMLImageElement>(null);
  const onPreloadCompleteRef = useRef(onPreloadComplete);

  useEffect(() => {
    onPreloadCompleteRef.current = onPreloadComplete;
  }, [onPreloadComplete]);

  const imagePromise = useMemo(
    () =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.src = HERO_CENTER_IMAGE;
        if (img.complete) resolve();
        else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      }),
    []
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (!introFinished) return;

    const targetWord = 'PORTFOLIO';
    const initialWord = profile.wordmark;
    let step = 0;
    let intervalId: NodeJS.Timeout | undefined;
    let cancelled = false;
    let animContext: gsap.Context | undefined;

    imagePromise.then(() => {
      if (cancelled) return;

      intervalId = setInterval(() => {
        setDisplayText(() =>
          targetWord
            .split('')
            .map((_, idx) =>
              idx < Math.floor(step)
                ? targetWord[idx]
                : idx < initialWord.length
                ? initialWord[idx]
                : ''
            )
            .join('')
        );

        if (step >= 9) {
          clearInterval(intervalId);

          animContext = gsap.context(() => {
            const tl = gsap.timeline({
              onComplete: () => {
                document.body.style.overflow = 'auto';
                onPreloadCompleteRef.current?.();
              },
            });

            const isMobile = window.innerWidth < 768;

            tl.to(
              titleContainerRef.current,
              {
                top: isMobile ? '70%' : '74%',
                duration: 1.5,
                ease: 'power3.inOut',
              },
              '+=0.2'
            )
              .fromTo(
                [roleRef.current, contactRef.current],
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: 'power3.out' },
                '-=1.0'
              )
              .call(() => setStartCanvasPlay(true), undefined, '-=1.2');

            const spread = isMobile
              ? window.innerWidth * 0.2
              : Math.min(300, window.innerWidth * 0.2);

            tl.to(leftWordRef.current, { x: -spread / 2, duration: 1.5, ease: 'power3.out' }, '<')
              .to(rightWordRef.current, { x: spread / 2, duration: 1.5, ease: 'power3.out' }, '<');
          });
        }
        step += 1 / 3;
      }, 50);
    });

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      animContext?.revert();
    };
  }, [introFinished, imagePromise]);

  const splitPoint = displayText.length <= 6 ? 3 : 4;

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-end justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        background: 'radial-gradient(circle, #222222 0%, #000000 80%)',
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <div
        ref={titleContainerRef}
        className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none select-none flex flex-col items-start w-max"
      >
        <h1
          ref={headingRef}
          className={`${HEADING_CLASSES} ${GRADIENT_TEXT_CLASSES} transition-opacity duration-300 ${
            introFinished ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span ref={leftWordRef}>{displayText.slice(0, splitPoint)}</span>
          <span ref={rightWordRef}>{displayText.slice(splitPoint)}</span>
        </h1>

        {showLetterIntro && (
          <div
            className={`absolute top-0 left-0 transition-opacity duration-300 ${
              introFinished ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <LetterIntro
              word={profile.wordmark}
              className={HEADING_CLASSES}
              letterClassName={GRADIENT_TEXT_CLASSES}
              dotClassName="bg-gray-200"
              speed={1.15}
              onComplete={() => {
                setIntroFinished(true);
                setTimeout(() => setShowLetterIntro(false), 320);
              }}
            />
          </div>
        )}

        <p
          ref={roleRef}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:-bottom-12 md:left-8 text-white text-base md:text-2xl lg:text-3xl drop-shadow-md z-10 opacity-0 w-max"
        >
          <span className="font-bold">{profile.role.bold}</span>{' '}
          <span className="font-light italic text-gray-300">{profile.role.light}</span>
        </p>

        <div
          ref={contactRef}
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 md:translate-x-0 md:-bottom-12 md:left-auto md:right-20 flex items-center gap-2 md:gap-4 pointer-events-auto z-10 opacity-0 w-max"
        >
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group px-4 py-1.5 md:px-5 md:py-2.5 rounded-full border border-[var(--accent)] bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-all cursor-pointer flex items-center gap-2 text-xs md:text-sm font-semibold shadow-md"
            title="Download / View Resume"
          >
            <span>Resume</span>
            <svg
              className="w-3.5 h-3.5 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>

          <a
            href="#contact"
            className="group w-8 h-8 md:w-12 md:h-12 rounded-full border border-gray-400/30 flex items-center justify-center backdrop-blur-md bg-black/20 hover:bg-white/10 hover:border-gray-400/50 transition-all duration-300 cursor-pointer"
            aria-label="Scroll to Contact"
          >
            <svg
              className="w-3 h-3 md:w-4 md:h-4 text-gray-300 transition-transform duration-300 group-hover:rotate-45"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 7L7 17M7 17H16M7 17V8" />
            </svg>
          </a>
          <a
            href="#contact"
            className="px-4 py-1.5 md:px-6 md:py-2.5 rounded-full border border-gray-400/30 flex items-center justify-center backdrop-blur-md bg-black/20 hover:bg-white/10 hover:border-gray-400/50 transition-all cursor-pointer"
          >
            <span className="text-gray-300 text-xs md:text-base italic font-light tracking-wider">
              Contact
            </span>
          </a>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 md:top-[4vh] z-10 text-center text-white flex flex-col items-center w-full pointer-events-none">
        <img
          ref={imageAnchorRef}
          src={HERO_CENTER_IMAGE}
          alt={profile.name}
          aria-hidden="true"
          className="invisible w-auto max-w-[90vw] h-[65vh] max-h-[580px] md:h-[105vh] md:max-h-[920px] md:max-w-[70vw] aspect-square object-contain object-bottom pointer-events-none select-none"
        />
      </div>

      <HeroCanvas
        src={HERO_CENTER_IMAGE}
        thumbs={THUMB_IMAGES}
        anchorRef={imageAnchorRef}
        play={startCanvasPlay}
        label="Portrait of Aditya Prakash Purohit made of interactive tiles"
        className="z-10"
      />
    </section>
  );
};
