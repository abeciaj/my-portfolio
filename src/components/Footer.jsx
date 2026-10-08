import React from 'react';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { profile } from '../data/profile';

const socials = [
  { icon: FiLinkedin, label: 'LinkedIn', href: profile.linkedin, external: true },
  { icon: FiGithub, label: 'GitHub', href: profile.github, external: true },
  { icon: FiMail, label: 'Email', href: `mailto:${profile.email}` },
];

const Footer = () => {
  return (
    <footer className='border-t border-line'>
      <div className='container-page flex flex-col items-center justify-between gap-4 py-8 sm:flex-row'>
        <p className='text-sm text-ink-muted'>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <ul className='flex items-center gap-1'>
          {socials.map(({ icon: Icon, label, href, external }) => (
            <li key={label}>
              <a
                href={href}
                aria-label={label}
                {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className='flex rounded-full p-2 text-lg text-ink-muted transition-colors duration-200 hover:text-accent'
              >
                <Icon aria-hidden='true' />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
