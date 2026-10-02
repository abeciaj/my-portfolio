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
