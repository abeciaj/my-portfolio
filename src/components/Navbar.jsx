import React, { useEffect, useState } from 'react';
import { FaBars, FaTimes, FaGithub, FaLinkedin } from 'react-icons/fa';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink, NavLink, useLocation } from 'react-router-dom';
import Logo from '../assets/logo.png';
import { profile } from '../data/profile';
import ThemeToggle from './ThemeToggle';

const links = [
  { to: 'about', label: 'About' },
  { to: 'experience', label: 'Experience' },
  { to: 'skills', label: 'Skills' },
  { to: 'contact', label: 'Contact' },
];

const scrollProps = { smooth: true, duration: 500, offset: -72 };

// Scrolls to a section on the home page; from any other page it
// navigates home first and HomePage scrolls to the #hash.
const SectionLink = ({ to, onHome, className = '', children, ...rest }) =>
  onHome ? (
    <ScrollLink to={to} href={`#${to}`} {...scrollProps} {...rest} className={`cursor-pointer ${className}`}>
      {children}
    </ScrollLink>
  ) : (
    <RouterLink to={`/#${to}`} onClick={rest.onClick} className={className}>
      {children}
    </RouterLink>
  );

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const onHome = useLocation().pathname === '/';

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
        <SectionLink to='home' onHome={onHome} onClick={close}>
          <img src={Logo} alt={profile.name} className='h-12 w-auto' />
        </SectionLink>

        <div className='flex items-center gap-2 lg:gap-6'>
          <ul className='hidden items-center gap-6 lg:flex'>
            {links.map(({ to, label }, i) => (
              <li key={to}>
                <SectionLink
                  to={to}
                  onHome={onHome}
                  spy
                  activeClass='!text-accent'
                  className='text-sm text-ink-muted transition-colors hover:text-accent'
                >
                  <span className='font-mono text-accent'>0{i + 1}.</span> {label}
                </SectionLink>
              </li>
            ))}
            <li>
              <NavLink
                to='/blog'
                className={({ isActive }) =>
                  `text-sm transition-colors hover:text-accent ${isActive ? 'text-accent' : 'text-ink-muted'}`
                }
              >
                <span className='font-mono text-accent'>0{links.length + 1}.</span> Blog
              </NavLink>
            </li>
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
            className='rounded p-2 text-xl text-ink lg:hidden'
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {open && (
        <div className='flex h-[calc(100vh-72px)] flex-col items-center justify-center gap-6 bg-page lg:hidden'>
          {links.map(({ to, label }) => (
            <SectionLink
              key={to}
              to={to}
              onHome={onHome}
              onClick={close}
              className='text-3xl font-semibold text-ink hover:text-accent'
            >
              {label}
            </SectionLink>
          ))}
          <RouterLink to='/blog' onClick={close} className='text-3xl font-semibold text-ink hover:text-accent'>
            Blog
          </RouterLink>
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
