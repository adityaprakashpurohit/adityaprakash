/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { About } from './components/About';
import { Services } from './components/Services';
import { Projects } from './components/Projects';
import { ComponentsShop } from './components/ComponentsShop';
import { BreakoutGame } from './components/BreakoutGame';
import { Contact } from './components/Contact';
import { ComingSoon } from './components/ComingSoon';

export default function App() {
  const [isPreloaded, setIsPreloaded] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('autostart') === '1';
    }
    return false;
  });

  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    if (isPreloaded) {
      document.body.style.overflow = 'auto';
    }
  }, [isPreloaded]);

  if (showComingSoon) {
    return <ComingSoon onBack={() => setShowComingSoon(false)} />;
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-[#e8e4dc] selection:text-[#050505]">
      <Hero onPreloadComplete={() => setIsPreloaded(true)} />
      {isPreloaded && (
        <div className="animate-fade-in-up">
          <Navbar />
          <About />
          <Services
            onViewProjects={() => {
              const el = document.getElementById('project');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
          <Projects onCtaClick={() => setShowComingSoon(true)} />
          <ComponentsShop />
          <section id="play" className="bg-[#050505] text-white py-24 md:py-32 px-4 sm:px-6 md:px-16">
            <div className="mx-auto max-w-5xl">
              <BreakoutGame
                lines={['ADITYA', 'PUROHIT']}
                caption="Interactive brick-breaker arcade physics. Break it to reveal."
                panelClassName="aspect-[5/6] sm:aspect-[4/3] lg:aspect-[16/9]"
              />
            </div>
          </section>
          <Contact />
        </div>
      )}
    </main>
  );
}
