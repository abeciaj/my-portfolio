import React, { useEffect, useState } from 'react';
import { FiGithub, FiLinkedin, FiMenu, FiX } from 'react-icons/fi';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink, NavLink, useLocation } from 'react-router-dom';
import Logo from '../assets/logo.png';
import { profile } from '../data/profile';
import { useScrolledPast } from '../lib/hooks';
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

const navLinkClass = 'rounded-full px-3 py-2 text-sm text-ink-muted transition-colors duration-200 hover:text-ink';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolledPast(10);
  const onHome = useLocation().pathname === '/';

  // Stop the page behind the mobile menu from scrolling; Escape closes it.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      // Transparent over the top of the page; solid once scrolled or when the menu is open.
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled || open ? 'border-line bg-surface shadow-lg shadow-zinc-900/5' : 'border-transparent bg-transparent'
      }`}
    >
      <nav aria-label='Main' className='container-page flex h-[72px] items-center justify-between'>
        <SectionLink to='home' onHome={onHome} onClick={close} className='rounded-md'>
          <img src={Logo} alt={profile.name} width='98' height='48' className='h-12 w-auto' />
        </SectionLink>

        <div className='flex items-center gap-1 lg:gap-3'>
          <ul className='hidden items-center lg:flex'>
            {links.map(({ to, label }) => (
              <li key={to}>
                <SectionLink to={to} onHome={onHome} spy activeClass='!text-ink' className={navLinkClass}>
                  {label}
                </SectionLink>
              </li>
            ))}
            <li>
              <NavLink to='/blog' className={({ isActive }) => `${navLinkClass} ${isActive ? '!text-ink' : ''}`}>
                Blog
              </NavLink>
            </li>
          </ul>
          <a href={profile.resume} target='_blank' rel='noreferrer' className='btn-secondary hidden py-2 lg:inline-flex'>
            Resume
          </a>

          <ThemeToggle />

          <button
            type='button'
            onClick={() => setOpen(!open)}
            className='rounded-full p-2 text-xl text-ink lg:hidden'
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <FiX aria-hidden='true' /> : <FiMenu aria-hidden='true' />}
          </button>
        </div>
      </nav>

      {open && (
        <div className='flex h-[calc(100vh-72px)] flex-col justify-center gap-2 overscroll-contain bg-surface px-6 lg:hidden'>
          {links.map(({ to, label }) => (
            <SectionLink
              key={to}
              to={to}
              onHome={onHome}
              onClick={close}
              className='py-2 text-4xl font-semibold tracking-tight text-ink hover:text-accent'
            >
              {label}
            </SectionLink>
          ))}
          <RouterLink to='/blog' onClick={close} className='py-2 text-4xl font-semibold tracking-tight text-ink hover:text-accent'>
            Blog
          </RouterLink>
          <div className='mt-8 flex items-center gap-4'>
            <a href={profile.resume} target='_blank' rel='noreferrer' className='btn-secondary'>
              Resume
            </a>
            <a href={profile.linkedin} target='_blank' rel='noreferrer' aria-label='LinkedIn' className='rounded-full p-2 text-2xl text-ink-muted hover:text-accent'>
              <FiLinkedin aria-hidden='true' />
            </a>
            <a href={profile.github} target='_blank' rel='noreferrer' aria-label='GitHub' className='rounded-full p-2 text-2xl text-ink-muted hover:text-accent'>
              <FiGithub aria-hidden='true' />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
