import React from 'react';

// Small pill list used for blog tags and job tech stacks.
const Tags = ({ tags }) =>
  tags.length > 0 && (
    <ul className='flex flex-wrap gap-2'>
      {tags.map((tag) => (
        <li key={tag} className='chip'>
          {tag}
        </li>
      ))}
    </ul>
  );

export default Tags;
