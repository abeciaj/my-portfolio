import React from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { useScrolledPast } from '../lib/hooks';

// Floating button in the bottom-right corner, shown once the visitor
// has scrolled down a bit.
const ScrollTopButton = () => {
  const visible = useScrolledPast(400);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <button
      type='button'
      onClick={scrollToTop}
      aria-label='Scroll to top'
      title='Scroll to top'
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-xl text-on-accent shadow-lg shadow-zinc-900/20 transition-[opacity,transform,background-color] duration-300 hover:-translate-y-1 active:scale-[0.96] hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page ${
        visible ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <FiArrowUp aria-hidden='true' />
    </button>
  );
};

export default ScrollTopButton;
