import React from 'react';
import { HiArrowNarrowRight } from 'react-icons/hi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import { Link } from 'react-scroll';
import { profile } from '../data/profile';

// Always dark, like a real terminal, regardless of the site theme.
const Terminal = () => (
  <div className='hidden w-full max-w-sm overflow-hidden rounded-xl border border-[#1e2942] bg-[#0b1120] font-mono text-sm text-[#e2e8f0] shadow-2xl shadow-black/30 lg:block' aria-hidden='true'>
    <div className='flex items-center gap-2 border-b border-[#1e2942] px-4 py-3'>
      <span className='h-3 w-3 rounded-full bg-[#ff5f57]' />
      <span className='h-3 w-3 rounded-full bg-[#febc2e]' />
      <span className='h-3 w-3 rounded-full bg-[#28c840]' />
      <span className='ml-2 text-xs text-[#94a3b8]'>~/infra</span>
    </div>
    <div className='space-y-1 p-5 leading-relaxed'>
      <p>
        <span className='text-[#a78bfa]'>$</span> whoami
      </p>
      <p className='text-[#94a3b8]'>{profile.name.toLowerCase()}</p>
      <p className='pt-2'>
        <span className='text-[#a78bfa]'>$</span> terraform apply
      </p>
      <p className='text-[#94a3b8]'>Plan: 3 to add, 0 to change.</p>
      <p className='text-[#4ade80]'>Apply complete!</p>
      <p className='pt-2'>
        <span className='text-[#a78bfa]'>$</span> kubectl get nodes
      </p>
      <p className='text-[#94a3b8]'>
        NAME&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;STATUS
      </p>
      <p className='text-[#94a3b8]'>
        node-1&nbsp;&nbsp;&nbsp;<span className='text-[#4ade80]'>Ready</span>
      </p>
      <p className='pt-2'>
        <span className='text-[#a78bfa]'>$</span>{' '}
        <span className='inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-[#a78bfa]' />
      </p>
    </div>
  </div>
);

const Home = () => {
  return (
    <section
      id='home'
      className='relative flex min-h-screen items-center overflow-hidden'
    >
      {/* Background glow + grid */}
      <div aria-hidden='true' className='hero-glow pointer-events-none absolute inset-0' />
      <div aria-hidden='true' className='hero-grid pointer-events-none absolute inset-0' />

      <div className='relative mx-auto flex w-full max-w-5xl items-center justify-between gap-12 px-6 pt-24 pb-16'>
        <div className='max-w-2xl'>
          <p className='font-mono text-accent'>Hi, my name is</p>
          <h1 className='mt-4 text-5xl font-extrabold tracking-tight text-ink sm:text-7xl'>
            {profile.name}.
          </h1>
          <h2 className='mt-3 text-3xl font-bold tracking-tight text-ink-muted sm:text-5xl'>
            {profile.role}.
          </h2>
          <p className='mt-6 max-w-xl text-lg leading-relaxed text-ink-muted'>
            {profile.tagline}
          </p>

          <div className='mt-10 flex flex-wrap gap-4'>
            <Link to='contact' href='#contact' smooth duration={500} offset={-72} className='btn-primary group cursor-pointer'>
              Let's work together
              <HiArrowNarrowRight className='transition-transform duration-300 group-hover:translate-x-1' />
            </Link>
            <Link to='skills' href='#skills' smooth duration={500} offset={-72} className='btn-outline cursor-pointer'>
              View skills
            </Link>
          </div>

          <div className='mt-10 flex items-center gap-5 text-xl text-ink-muted'>
            <a href={profile.linkedin} target='_blank' rel='noreferrer' aria-label='LinkedIn' className='transition-colors hover:text-accent'>
              <FaLinkedin />
            </a>
            <a href={profile.github} target='_blank' rel='noreferrer' aria-label='GitHub' className='transition-colors hover:text-accent'>
              <FaGithub />
            </a>
            <a href={`mailto:${profile.email}`} aria-label='Email' className='transition-colors hover:text-accent'>
              <FiMail />
            </a>
          </div>
        </div>

        <Terminal />
      </div>
    </section>
  );
};

export default Home;
