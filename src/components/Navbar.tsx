import React, { useCallback, useEffect, useRef, useState } from 'react';
import { profile } from '../data/portfolioData';

const NAV_ITEMS = ['Home', 'About', 'Service', 'Project', 'Components', 'Contact'];

export const Navbar: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollScheduled = useRef(false);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const [firstName, ...restNames] = profile.name.split(' ');
  const lastName = restNames.join(' ');

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setIsScrolled(scrollY > 24);
      setScrollProgress(maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0);
      scrollScheduled.current = false;
    };

    const requestScroll = () => {
      if (!scrollScheduled.current) {
        scrollScheduled.current = true;
        window.requestAnimationFrame(handleScroll);
      }
    };

    handleScroll();
    window.addEventListener('scroll', requestScroll, { passive: true });
    return () => window.removeEventListener('scroll', requestScroll);
  }, []);

  useEffect(() => {
    const sectionElements = NAV_ITEMS.map((item) =>
      document.getElementById(item.toLowerCase())
    ).filter(Boolean) as HTMLElement[];

    if (!sectionElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sectionElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        triggerButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <>
      <nav
        aria-label="Main"
        className={`fixed top-0 left-0 w-full z-50 transition-[transform,opacity,background-color,border-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          isMounted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        } ${
          mobileMenuOpen || isScrolled
            ? 'bg-black/70 backdrop-blur-xl border-b border-white/10'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 md:px-12 md:py-6">
          <a
            href="#home"
            aria-label={profile.name}
            onClick={closeMenu}
            className="group relative z-50 text-white font-black text-xl md:text-2xl tracking-widest uppercase leading-none rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          >
            <span
              aria-hidden="true"
              className="inline-block transition-colors duration-300 group-hover:text-[var(--accent)]"
            >
              {firstName}
              {lastName && (
                <span className="hidden md:inline-block overflow-hidden align-bottom">
                  <span className="inline-block translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover:translate-x-1">
                    &nbsp;{lastName}
                  </span>
                </span>
              )}
            </span>
            <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover:scale-x-100" />
          </a>

          <ul className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const slug = item.toLowerCase();
              const isActive = activeSection === slug;
              return (
                <li key={item}>
                  <a
                    href={`#${slug}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={`group relative block py-1 text-sm uppercase tracking-wider font-medium transition-colors duration-300 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-black ${
                      isActive
                        ? 'text-[var(--accent)]'
                        : 'text-gray-300 hover:text-[var(--accent)]'
                    }`}
                  >
                    {item}
                    <span
                      className={`absolute -bottom-0.5 left-0 h-px w-full bg-[var(--accent)] origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          <button
            ref={triggerButtonRef}
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <span
              className={`block h-px w-6 bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                mobileMenuOpen ? 'translate-y-[3.5px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-px w-6 bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                mobileMenuOpen ? '-translate-y-[3.5px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>

        <div
          aria-hidden="true"
          className={`h-px w-full origin-left bg-[var(--accent)] transition-opacity duration-300 ${
            isScrolled ? 'opacity-60' : 'opacity-0'
          }`}
          style={{ transform: `scaleX(${scrollProgress})` }}
        />
      </nav>

      <div
        id="mobile-menu"
        aria-hidden={!mobileMenuOpen}
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0a0a0a] transition-[opacity,visibility] duration-500 ease-out motion-reduce:transition-none md:hidden ${
          mobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none'
        }`}
      >
        <ul className="flex flex-col items-center gap-8">
          {NAV_ITEMS.map((item, idx) => (
            <li
              key={item}
              className={`transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{
                transitionDelay: mobileMenuOpen ? `${120 + idx * 60}ms` : '0ms',
              }}
            >
              <a
                href={`#${item.toLowerCase()}`}
                onClick={closeMenu}
                className="block text-3xl font-black uppercase tracking-widest text-white transition-colors duration-300 hover:text-[var(--accent)] active:text-[var(--accent)] outline-none focus-visible:text-[var(--accent)]"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
