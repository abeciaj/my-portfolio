import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../lib/hooks';

const NotFoundPage = () => {
  useDocumentTitle('Page not found');

  return (
    <section className='section flex min-h-[70vh] flex-col items-start justify-center pt-32'>
      <p className='section-label'>404</p>
      <h1 className='section-title'>This page doesn't exist</h1>
      <p className='mt-4 text-lg text-ink-muted'>The link may be broken, or the page may have moved.</p>
      <div className='mt-8 flex flex-wrap gap-4'>
        <Link to='/' className='btn-primary'>Go home</Link>
        <Link to='/blog' className='btn-outline'>Read the blog</Link>
      </div>
    </section>
  );
};

export default NotFoundPage;
