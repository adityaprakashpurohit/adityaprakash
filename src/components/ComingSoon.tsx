import React from 'react';

interface ComingSoonProps {
  onBack: () => void;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-[var(--accent)] w-full">
      <h1 className="text-5xl md:text-7xl font-black uppercase tracking-widest mb-8 text-center px-4">
        Coming Soon
      </h1>
      <button
        type="button"
        onClick={onBack}
        className="cursor-pointer px-8 py-3 rounded-full border border-[var(--accent)] text-black bg-[var(--accent)] font-bold text-sm md:text-base hover:bg-black hover:text-[var(--accent)] transition-colors"
      >
        Go Back
      </button>
    </div>
  );
};
