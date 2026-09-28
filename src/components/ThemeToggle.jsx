import React, { useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';

const STORAGE_KEY = 'theme';

// public/index.html sets the initial class before React loads,
// so read the current state from the DOM rather than recomputing it.
const isDark = () => document.documentElement.classList.contains('dark');

const ThemeToggle = ({ className = '' }) => {
  const [dark, setDark] = useState(isDark);

  // Follow the OS setting until the visitor picks a theme themselves.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      let saved = null;
      try {
        saved = localStorage.getItem(STORAGE_KEY);
      } catch (err) {}
      if (!saved) {
        document.documentElement.classList.toggle('dark', e.matches);
        setDark(e.matches);
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    } catch (err) {}
    setDark(next);
  };

  return (
    <button
      type='button'
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`rounded-md p-2 text-lg text-ink-muted transition-colors hover:bg-accent/10 hover:text-accent ${className}`}
    >
      {dark ? <FiSun /> : <FiMoon />}
    </button>
  );
};

export default ThemeToggle;
