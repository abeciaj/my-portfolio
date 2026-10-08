import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../lib/hooks';

const NotFoundPage = () => {
  useDocumentTitle('Page not found');

  return (
    <section className='section flex min-h-[70vh] flex-col items-start justify-center pt-36'>
      <p className='font-mono text-sm text-ink-muted'>Error 404</p>
      <h1 className='section-title mt-3'>This page doesn't exist</h1>
      <p className='lead mt-6'>The link may be broken, or the page may have moved.</p>
      <div className='mt-10 flex flex-wrap gap-3'>
        <Link to='/' className='btn-primary'>Go home</Link>
        <Link to='/blog' className='btn-secondary'>Read the blog</Link>
      </div>
    </section>
  );
};

export default NotFoundPage;
