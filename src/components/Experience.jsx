import React from 'react';
import { FiAward, FiBookOpen } from 'react-icons/fi';
import { certifications, education, experience } from '../data/profile';
import Tags from './Tags';

const Job = ({ role, company, start, end, summary, highlights, tags }) => (
  <li className='relative pl-8 sm:pl-10'>
    {/* Timeline dot */}
    <span
      aria-hidden='true'
      className={`absolute left-0 top-1.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-accent ${
        end === 'Present' ? 'bg-accent' : 'bg-page'
      }`}
    />
    <p className='font-mono text-xs uppercase tracking-wider text-ink-muted'>
      {start} – {end}
    </p>
    <h3 className='mt-2 text-xl font-semibold text-ink'>{role}</h3>
    <p className='font-medium text-accent'>{company}</p>
    <p className='mt-3 leading-relaxed text-ink-muted'>{summary}</p>
    <ul className='mt-4 space-y-2'>
      {highlights.map((item) => (
        <li key={item} className='flex gap-3 leading-relaxed text-ink-muted'>
          <span aria-hidden='true' className='mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent' />
          {item}
        </li>
      ))}
    </ul>
    <div className='mt-4'>
      <Tags tags={tags} />
    </div>
  </li>
);

const Certification = ({ name, code, date, issuer, icon: Icon, color, url }) => {
  const body = (
    <>
      <div className='flex items-center gap-2 text-sm text-ink-muted'>
        <Icon className='text-lg' style={{ color }} aria-hidden='true' />
        {issuer}
      </div>
      <p className='mt-3 font-semibold leading-snug text-ink'>{name}</p>
      <div className='mt-auto flex items-center justify-between gap-2 pt-4 font-mono text-xs'>
        <span className='rounded-full bg-accent/10 px-2.5 py-1 text-accent'>{code}</span>
        <span className='text-ink-muted'>{date}</span>
      </div>
    </>
  );
  const className = 'card flex h-full flex-col p-5 transition duration-300 hover:-translate-y-1 hover:border-accent/50';
  return (
    <li>
      {url ? (
        <a href={url} target='_blank' rel='noreferrer' className={className}>
          {body}
        </a>
      ) : (
        <div className={className}>{body}</div>
      )}
    </li>
  );
};

const Experience = () => {
  return (
    <section id='experience' className='section'>
      <p className='section-label'>02. Experience</p>
      <h2 className='section-title'>Where I've worked</h2>

      <ol className='mt-12 ml-1.5 space-y-12 border-l border-line'>
        {experience.map((job) => (
          <Job key={`${job.company}-${job.start}`} {...job} />
        ))}
      </ol>

      <h3 className='mt-20 flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-ink-muted'>
        <FiAward className='text-accent' aria-hidden='true' /> Certifications
      </h3>
      <ul className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {certifications.map((cert) => (
          <Certification key={cert.code + cert.name} {...cert} />
        ))}
      </ul>

      <h3 className='mt-16 flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-ink-muted'>
        <FiBookOpen className='text-accent' aria-hidden='true' /> Education
      </h3>
      <ul className='mt-6 grid gap-4 sm:grid-cols-2'>
        {education.map(({ degree, school, years }) => (
          <li key={degree} className='card p-5'>
            <p className='font-semibold text-ink'>{degree}</p>
            <p className='mt-1 text-accent'>{school}</p>
            {years && <p className='mt-3 font-mono text-xs text-ink-muted'>{years}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Experience;
