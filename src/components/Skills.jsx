import React from 'react';
import { skillGroups } from '../data/profile';
import Reveal from './Reveal';

// Bento layout: one cell per group, sized by how many tools it holds.
// lg: [Cloud | DevOps 2] [Monitoring | Security | Systems] [Data 3]
// md (dense packing, so no empty cells): [Cloud | Monitoring] [DevOps 2]
//     [Security | Systems] [Data 2]
const cellLayout = {
  'DevOps & IaC': { span: 'md:col-span-2', cols: 'grid-cols-2 sm:grid-cols-4', tone: 'accent' },
  Cloud: { span: '', cols: 'grid-cols-2 lg:grid-cols-1', tone: 'surface' },
  'Monitoring & Logging': { span: '', cols: 'grid-cols-2', tone: 'surface' },
  'Security & Vulnerability Assessment': { span: '', cols: 'grid-cols-2', tone: 'surface' },
  'Systems & Virtualization': { span: '', cols: 'grid-cols-2', tone: 'surface' },
  Data: { span: 'md:col-span-2 lg:col-span-3', cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5', tone: 'sunken' },
};

const tones = {
  accent: 'border-accent/25 bg-accent/[0.06]',
  surface: 'border-line bg-surface shadow-sm shadow-zinc-900/5 dark:shadow-none',
  sunken: 'border-line bg-sunken',
};

// A skill shows a react-icons component (`icon`), an image (`image`), or,
// for tools with no available logo, a letter badge (`monogram`).
const SkillLogo = ({ icon: Icon, color, image, wide, monogram }) => {
  if (Icon) {
    return (
      <Icon className={`h-6 shrink-0 text-ink ${wide ? 'w-12' : 'w-6'}`} style={color ? { color } : undefined} aria-hidden='true' />
    );
  }
  if (monogram) {
    return (
      <span
        className='flex h-6 min-w-[1.5rem] shrink-0 items-center justify-center rounded-md px-1 text-[0.65rem] font-bold text-white'
        style={{ backgroundColor: color }}
        aria-hidden='true'
      >
        {monogram}
      </span>
    );
  }
  return <img src={image} alt='' width='24' height='24' loading='lazy' className='h-6 w-6 shrink-0 object-contain' />;
};

const Skills = () => {
  return (
    <section id='skills' className='relative isolate'>
      <div aria-hidden='true' className='bg-dots fade-edges absolute inset-0 -z-10' />
      <div className='section'>
        <Reveal>
          <h2 className='section-title'>Technologies I work with</h2>
        </Reveal>

        <div className='mt-12 grid gap-4 md:grid-flow-row-dense md:grid-cols-2 lg:grid-cols-3'>
          {skillGroups.map(({ title, skills }, i) => {
            const layout = cellLayout[title] || { span: '', cols: 'grid-cols-2', tone: 'surface' };
            return (
              <Reveal
                key={title}
                delay={(i % 3) * 80}
                className={`rounded-2xl border p-6 ${tones[layout.tone]} ${layout.span}`}
              >
                <h3 className='text-base font-semibold text-ink'>{title}</h3>
                <ul className={`mt-5 grid gap-x-4 gap-y-4 ${layout.cols}`}>
                  {skills.map(({ name, ...logo }) => (
                    <li key={name} className='flex min-w-0 items-center gap-3'>
                      <SkillLogo {...logo} />
                      <span className='min-w-0 break-words text-sm text-ink'>{name}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;
