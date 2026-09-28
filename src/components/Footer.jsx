import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FiArrowUp, FiMail } from 'react-icons/fi';
import { Link } from 'react-scroll';
import { profile } from '../data/profile';

const Footer = () => {
  return (
    <footer className='border-t border-line bg-sunken'>
      <div className='mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-6 py-8 sm:flex-row'>
        <p className='text-sm text-ink-muted'>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <div className='flex items-center gap-5 text-lg text-ink-muted'>
          <a href={profile.linkedin} target='_blank' rel='noreferrer' aria-label='LinkedIn' className='hover:text-accent'>
            <FaLinkedin />
          </a>
          <a href={profile.github} target='_blank' rel='noreferrer' aria-label='GitHub' className='hover:text-accent'>
            <FaGithub />
          </a>
          <a href={`mailto:${profile.email}`} aria-label='Email' className='hover:text-accent'>
            <FiMail />
          </a>
          <Link to='home' href='#home' smooth duration={500} className='ml-2 flex cursor-pointer items-center gap-1 font-mono text-sm hover:text-accent'>
            Back to top <FiArrowUp aria-hidden='true' />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
