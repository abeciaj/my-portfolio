import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ScrollTopButton from './components/ScrollTopButton';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// Blog pages (and the Markdown renderer) load only when visited.
const BlogPage = lazy(() => import('./pages/BlogPage'));
const PostPage = lazy(() => import('./pages/PostPage'));

// Start each new page at the top (hash links are handled by HomePage).
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

// Moves focus past the navbar without changing the URL hash (which
// HomePage would treat as a section to scroll to).
const skipToMain = (e) => {
  e.preventDefault();
  document.getElementById('main').focus();
};

function App() {
  return (
    <div className='flex min-h-screen flex-col'>
      <ScrollToTop />
      <a
        href='#main'
        onClick={skipToMain}
        className='sr-only z-[60] rounded-full bg-accent px-4 py-2 text-sm font-medium text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4'
      >
        Skip to content
      </a>
      <Navbar />
      <main id='main' tabIndex={-1} className='flex-1 focus:outline-none'>
        <Suspense fallback={<div className='min-h-screen' />}>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/blog' element={<BlogPage />} />
            <Route path='/blog/:slug' element={<PostPage />} />
            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ScrollTopButton />
      <div aria-hidden='true' className='grain' />
    </div>
  );
}

export default App;
