import React from 'react';
import { certifications, education, experience } from '../data/profile';
import Reveal from './Reveal';
import Tags from './Tags';

const Job = ({ role, company, start, end, summary, highlights, tags }) => (
  <Reveal as='li' className='grid gap-4 border-t border-line py-10 md:grid-cols-[12rem_1fr] md:gap-10'>
    <div className='flex items-start gap-3 md:flex-col'>
      <p className='font-mono text-sm text-ink-muted'>
        {start} - {end}
      </p>
      {end === 'Present' && <span className='chip'>Current</span>}
    </div>
    <div>
      <h3 className='text-xl font-semibold text-ink'>{role}</h3>
      <p className='mt-1 text-accent'>{company}</p>
      <p className='mt-4 max-w-[65ch] leading-relaxed text-ink-muted'>{summary}</p>
      <ul className='mt-4 max-w-[65ch] list-disc space-y-2 pl-5 leading-relaxed text-ink-muted marker:text-accent'>
        {highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className='mt-5'>
        <Tags tags={tags} />
      </div>
    </div>
  </Reveal>
);

// Certifications grouped by issuer, in the order the issuers first appear.
const certGroups = certifications.reduce((groups, cert) => {
  const group = groups.find((g) => g.issuer === cert.issuer);
  if (group) group.certs.push(cert);
  else groups.push({ issuer: cert.issuer, icon: cert.icon, color: cert.color, certs: [cert] });
  return groups;
}, []);

const Experience = () => {
  return (
    <section id='experience' className='band'>
      <div className='section'>
        <Reveal>
          <h2 className='section-title'>Where I've worked</h2>
        </Reveal>

        <ol className='mt-12 border-b border-line'>
          {experience.map((job) => (
            <Job key={`${job.company}-${job.start}`} {...job} />
          ))}
        </ol>

        <div className='mt-24 grid gap-16 lg:grid-cols-12 lg:gap-12'>
          <Reveal className='lg:col-span-8'>
            <h3 className='text-2xl font-semibold tracking-tight text-ink'>Certifications</h3>
            <div className='mt-8 gap-10 sm:columns-2'>
              {certGroups.map(({ issuer, icon: Icon, color, certs }) => (
                <div key={issuer} className='mb-10 break-inside-avoid'>
                  <p className='flex items-center gap-2 text-sm font-medium text-ink'>
                    <Icon className='h-4 w-4' style={{ color }} aria-hidden='true' />
                    {issuer}
                  </p>
                  <ul className='mt-4 space-y-4'>
                    {certs.map(({ name, code, date }) => (
                      <li key={code + name}>
                        <p className='leading-snug text-ink'>{name}</p>
                        <p className='mt-1 font-mono text-xs text-ink-muted'>
                          {code} <span aria-hidden='true'>·</span> {date}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className='lg:col-span-4' delay={120}>
            <h3 className='text-2xl font-semibold tracking-tight text-ink'>Education</h3>
            <ul className='mt-8 space-y-6'>
              {education.map(({ degree, school, years }) => (
                <li key={degree}>
                  <p className='leading-snug text-ink'>{degree}</p>
                  <p className='mt-1 text-sm text-accent'>{school}</p>
                  {years && <p className='mt-1 font-mono text-xs text-ink-muted'>{years}</p>}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Experience;
