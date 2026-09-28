import React from 'react';
import { skillGroups } from '../data/profile';

const SkillCard = ({ name, icon: Icon, color, image, wide }) => (
  <li className='card group flex flex-col items-center gap-3 px-4 py-6 text-center transition duration-300 hover:-translate-y-1 hover:border-accent/50'>
    {Icon ? (
      <Icon className={`h-10 ${wide ? 'w-20' : 'w-10'} text-ink transition-transform duration-300 group-hover:scale-110`} style={color ? { color } : undefined} aria-hidden='true' />
    ) : (
      <img src={image} alt='' className='h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110' />
    )}
    <span className='text-sm font-medium text-ink'>{name}</span>
  </li>
);

const Skills = () => {
  return (
    <section id='skills' className='section'>
      <p className='section-label'>02. Skills</p>
      <h2 className='section-title'>Technologies I work with</h2>

      <div className='mt-12 space-y-10'>
        {skillGroups.map(({ title, skills }) => (
          <div key={title}>
            <h3 className='font-mono text-sm uppercase tracking-widest text-ink-muted'>{title}</h3>
            <ul className='mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
              {skills.map((skill) => (
                <SkillCard key={skill.name} {...skill} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
