import { useEffect, useState } from 'react';
import { getPosts } from './posts';

const SITE_TITLE = 'Jayllan Abecia | Freelance Cloud & DevOps Engineer, Melbourne';

export const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | Jayllan Abecia` : SITE_TITLE;
  }, [title]);
};

// { posts, error } — posts is null while loading.
export const usePosts = () => {
  const [state, setState] = useState({ posts: null, error: null });

  useEffect(() => {
    let active = true;
    getPosts()
      .then((posts) => active && setState({ posts, error: null }))
      .catch((error) => active && setState({ posts: null, error }));
    return () => {
      active = false;
    };
  }, []);

  return state;
};

// True once the page has scrolled more than `offset` px. Uses an
// IntersectionObserver on a sentinel instead of a scroll listener, so it only
// re-renders when the threshold is crossed.
export const useScrolledPast = (offset) => {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    Object.assign(sentinel.style, {
      position: 'absolute',
      top: `${offset}px`,
      left: '0',
      width: '1px',
      height: '1px',
      pointerEvents: 'none',
    });
    document.body.appendChild(sentinel);
    const observer = new IntersectionObserver(([entry]) =>
      setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    );
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, [offset]);

  return past;
};
