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

function App() {
  return (
    <div className='flex min-h-screen flex-col'>
      <ScrollToTop />
      <Navbar />
      <main className='flex-1'>
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
    </div>
  );
}

export default App;
