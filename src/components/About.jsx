import React from 'react';
import { profile, services } from '../data/profile';

const About = () => {
  return (
    <section id='about' className='section'>
      <p className='section-label'>01. About</p>
      <h2 className='section-title'>Hello, I'm {profile.firstName}. Nice to meet you!</h2>

      <div className='mt-8 max-w-3xl space-y-4 text-lg leading-relaxed text-ink-muted'>
        {profile.about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <h3 className='mt-16 font-mono text-sm uppercase tracking-widest text-ink-muted'>
        What I can help with
      </h3>
      <div className='mt-6 grid gap-5 sm:grid-cols-2'>
        {services.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className='card p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/50'
          >
            <Icon className='text-2xl text-accent' aria-hidden='true' />
            <h4 className='mt-4 text-lg font-semibold text-ink'>{title}</h4>
            <p className='mt-2 leading-relaxed text-ink-muted'>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default About;
