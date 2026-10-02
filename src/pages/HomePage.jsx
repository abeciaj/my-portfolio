import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scroller } from 'react-scroll';
import About from '../components/About';
import Contact from '../components/Contact';
import Experience from '../components/Experience';
import Home from '../components/Home';
import Skills from '../components/Skills';
import { useDocumentTitle } from '../lib/hooks';

const HomePage = () => {
  const { hash, key } = useLocation();
  useDocumentTitle();

  // Links from other pages arrive as /#section; scroll there once rendered.
  useEffect(() => {
    if (hash) {
      scroller.scrollTo(hash.slice(1), { smooth: true, duration: 500, offset: -72 });
    }
  }, [hash, key]);

  return (
    <>
      <Home />
      <About />
      <Experience />
      <Skills />
      <Contact />
    </>
  );
};

export default HomePage;
