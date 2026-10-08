import React from 'react';
import { FiArrowRight, FiFileText } from 'react-icons/fi';
import { Link } from 'react-scroll';
import { certifications, profile, skillGroups } from '../data/profile';

// Everything the terminal prints comes from profile.js, so it stays true.
const certPrefix = { 'Google Cloud': 'gcp-', HashiCorp: 'terraform-' };
const certFiles = certifications.map((c) => `${certPrefix[c.issuer] || ''}${c.code.toLowerCase()}`);
const clouds = (skillGroups.find((g) => g.title === 'Cloud')?.skills || []).map((s) => s.name.toLowerCase());

const Prompt = () => (
  <span className='select-none text-[#a78bfa]' aria-hidden='true'>
    ${' '}
  </span>
);

// Always dark, like a real terminal, in both site themes. Lines appear in
// sequence with the .rise stagger; reduced motion shows them at once.
const Terminal = () => {
  let i = 3;
  const line = (content, className = '') => (
    <p className={`rise ${className}`} style={{ '--i': i++ }}>
      {content}
    </p>
  );

  return (
    <figure
      className='rise w-full overflow-hidden rounded-2xl border border-[#27272a] bg-[#0f0f12] font-mono text-[13px] leading-relaxed text-[#e4e4e7] shadow-2xl shadow-zinc-900/30'
      style={{ '--i': 2 }}
    >
      <div className='flex items-center gap-2 border-b border-[#27272a] px-4 py-3' aria-hidden='true'>
        <span className='h-3 w-3 rounded-full bg-[#ff5f57]' />
        <span className='h-3 w-3 rounded-full bg-[#febc2e]' />
        <span className='h-3 w-3 rounded-full bg-[#28c840]' />
        <span className='ml-2 text-xs text-[#a1a1aa]'>jayllan@melbourne: ~</span>
      </div>
      <figcaption className='sr-only'>Terminal summary of {profile.name}'s profile and certifications</figcaption>
      <div className='space-y-1 p-5' translate='no'>
        {line(<><Prompt />whoami</>)}
        {line(profile.name.toLowerCase().replace(' ', '-'), 'text-[#a1a1aa]')}
        {line(<><Prompt />cat profile.yaml</>, 'pt-3')}
        {line(<><span className='text-[#7dd3fc]'>role:</span> {profile.role}</>, 'text-[#a1a1aa]')}
        {line(<><span className='text-[#7dd3fc]'>based_in:</span> {profile.location}</>, 'text-[#a1a1aa]')}
        {line(<><span className='text-[#7dd3fc]'>clouds:</span> [{clouds.join(', ')}]</>, 'text-[#a1a1aa]')}
        {line(<><Prompt />ls certifications/</>, 'pt-3')}
        {line(
          <span className='flex flex-wrap gap-x-4 gap-y-0.5 text-[#86efac]'>
            {certFiles.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </span>
        )}
        {line(
          <>
            <Prompt />
            <span className='cursor-blink inline-block h-4 w-2 translate-y-0.5 bg-[#a78bfa]' aria-hidden='true' />
          </>,
          'pt-3'
        )}
      </div>
    </figure>
  );
};

const Home = () => {
  return (
    <section id='home' className='relative isolate flex min-h-screen items-center overflow-hidden min-h-[100dvh]'>
      {/* Background: dot grid canvas + soft accent light */}
      <div aria-hidden='true' className='bg-dots fade-edges absolute inset-0 -z-10' />
      <div aria-hidden='true' className='glow absolute -right-24 -top-24 -z-10 h-[40rem] w-[40rem]' />
      <div aria-hidden='true' className='glow absolute -bottom-40 -left-32 -z-10 h-[32rem] w-[32rem] opacity-70' />

      <div className='container-page grid items-center gap-14 pt-24 pb-16 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12'>
        <div>
          <h1 className='rise text-4xl font-semibold leading-[1.05] tracking-tighter text-ink sm:text-5xl md:text-6xl lg:text-[2.875rem] xl:text-[3.5rem]'>
            {profile.name}
            <span className='block text-ink-muted'>{profile.role}</span>
          </h1>
          <p className='rise lead mt-6' style={{ '--i': 1 }}>
            {profile.tagline}
          </p>
          <div className='rise mt-10 flex flex-wrap gap-3' style={{ '--i': 2 }}>
            <Link to='contact' href='#contact' smooth duration={500} offset={-72} className='btn-primary group cursor-pointer'>
              Get in touch
              <FiArrowRight className='transition-transform duration-200 group-hover:translate-x-0.5' aria-hidden='true' />
            </Link>
            <a href={profile.resume} target='_blank' rel='noreferrer' className='btn-secondary'>
              <FiFileText aria-hidden='true' /> Resume
            </a>
          </div>
        </div>

        <Terminal />
      </div>
    </section>
  );
};

export default Home;
