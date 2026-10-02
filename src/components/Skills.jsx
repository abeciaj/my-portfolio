import React from 'react';
import { skillGroups } from '../data/profile';

// A skill shows a react-icons component (`icon`), an image (`image`), or,
// for tools with no available logo, a letter badge (`monogram`).
const SkillLogo = ({ icon: Icon, color, image, wide, monogram }) => {
  const motion = 'transition-transform duration-300 group-hover:scale-110';
  if (Icon) {
    return (
      <Icon className={`h-10 ${wide ? 'w-20' : 'w-10'} text-ink ${motion}`} style={color ? { color } : undefined} aria-hidden='true' />
    );
  }
  if (monogram) {
    return (
      <span
        className={`flex h-10 min-w-[2.5rem] items-center justify-center rounded-md px-1.5 text-lg font-extrabold text-white ${motion}`}
        style={{ backgroundColor: color }}
        aria-hidden='true'
      >
        {monogram}
      </span>
    );
  }
  return <img src={image} alt='' className={`h-10 w-10 object-contain ${motion}`} />;
};

const SkillCard = ({ name, ...logo }) => (
  <li className='card group flex flex-col items-center gap-3 px-4 py-6 text-center transition duration-300 hover:-translate-y-1 hover:border-accent/50'>
    <SkillLogo {...logo} />
    <span className='text-sm font-medium text-ink'>{name}</span>
  </li>
);

const Skills = () => {
  return (
    <section id='skills' className='section'>
      <p className='section-label'>03. Skills</p>
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
