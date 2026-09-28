import React, { useEffect, useState } from 'react';
import { FaBars, FaTimes, FaGithub, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-scroll';
import Logo from '../assets/logo.png';
import { profile } from '../data/profile';
import ThemeToggle from './ThemeToggle';

const links = [
  { to: 'about', label: 'About' },
  { to: 'skills', label: 'Skills' },
  { to: 'contact', label: 'Contact' },
];

const scrollProps = { smooth: true, duration: 500, offset: -72 };

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Stop the page behind the mobile menu from scrolling.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        open
          ? 'bg-page'
          : scrolled
          ? 'border-b border-line/70 bg-page/85 backdrop-blur'
          : 'bg-transparent'
      }`}
    >
      <nav className='mx-auto flex h-[72px] max-w-5xl items-center justify-between px-6'>
        <Link to='home' {...scrollProps} href='#home' onClick={close} className='cursor-pointer'>
          <img src={Logo} alt={profile.name} className='h-12 w-auto' />
        </Link>

        <div className='flex items-center gap-2 md:gap-6'>
          <ul className='hidden items-center gap-8 md:flex'>
            {links.map(({ to, label }, i) => (
              <li key={to}>
                <Link
                  to={to}
                  href={`#${to}`}
                  spy
                  activeClass='!text-accent'
                  {...scrollProps}
                  className='cursor-pointer text-sm text-ink-muted transition-colors hover:text-accent'
                >
                  <span className='font-mono text-accent'>0{i + 1}.</span> {label}
                </Link>
              </li>
            ))}
            <li>
              <a href={profile.resume} target='_blank' rel='noreferrer' className='btn-outline py-2'>
                Resume
              </a>
            </li>
          </ul>

          <ThemeToggle />

          <button
            type='button'
            onClick={() => setOpen(!open)}
            className='rounded p-2 text-xl text-ink md:hidden'
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {open && (
        <div className='flex h-[calc(100vh-72px)] flex-col items-center justify-center gap-8 bg-page md:hidden'>
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              href={`#${to}`}
              {...scrollProps}
              onClick={close}
              className='cursor-pointer text-3xl font-semibold text-ink hover:text-accent'
            >
              {label}
            </Link>
          ))}
          <a href={profile.resume} target='_blank' rel='noreferrer' className='btn-outline'>
            Resume
          </a>
          <div className='flex gap-6 text-2xl text-ink-muted'>
            <a href={profile.linkedin} target='_blank' rel='noreferrer' aria-label='LinkedIn' className='hover:text-accent'>
              <FaLinkedin />
            </a>
            <a href={profile.github} target='_blank' rel='noreferrer' aria-label='GitHub' className='hover:text-accent'>
              <FaGithub />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
