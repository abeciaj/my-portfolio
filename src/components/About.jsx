import React from 'react';
import { certifications, education, profile, services } from '../data/profile';
import Reveal from './Reveal';

const issuers = [...new Set(certifications.map((cert) => cert.issuer))];
const listWithAnd = (items) => `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

const facts = [
  { label: 'Based in', value: profile.location },
  { label: 'Education', value: `${education[0].degree}, ${education[0].school}` },
  { label: 'Certifications', value: `${certifications.length} across ${listWithAnd(issuers)}` },
];

const About = () => {
  return (
    <section id='about' className='section grid gap-16 lg:grid-cols-12 lg:gap-12'>
      <Reveal className='lg:col-span-5'>
        <h2 className='section-title'>Hello, I'm {profile.firstName}. Nice to meet you!</h2>
        <div className='mt-6 space-y-4 leading-relaxed text-ink-muted'>
          {profile.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <dl className='mt-10 space-y-4 border-t border-line pt-8'>
          {facts.map(({ label, value }) => (
            <div key={label} className='grid grid-cols-[7.5rem_1fr] gap-4 text-sm'>
              <dt className='text-ink-muted'>{label}</dt>
              <dd className='text-ink'>{value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal className='lg:col-span-7' delay={120}>
        <h3 className='text-sm font-medium text-ink-muted'>What I can help with</h3>
        <ul className='mt-4 divide-y divide-line border-y border-line'>
          {services.map(({ icon: Icon, title, text }) => (
            <li key={title} className='grid grid-cols-[2.5rem_1fr] gap-4 py-6'>
              <span className='flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent'>
                <Icon className='h-5 w-5' aria-hidden='true' />
              </span>
              <div>
                <h4 className='text-lg font-semibold text-ink'>{title}</h4>
                <p className='mt-1 leading-relaxed text-ink-muted'>{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
};

export default About;
