import React from 'react';

// Small pill list used for blog tags, job tech stacks and project stacks.
const Tags = ({ tags }) =>
  tags.length > 0 && (
    <ul className='flex flex-wrap gap-2'>
      {tags.map((tag) => (
        <li key={tag} className='rounded-full bg-accent/10 px-3 py-1 font-mono text-xs text-accent'>
          {tag}
        </li>
      ))}
    </ul>
  );

export default Tags;
