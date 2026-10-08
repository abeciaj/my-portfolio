import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiArrowLeft } from 'react-icons/fi';
import { useDocumentTitle, usePosts } from '../lib/hooks';
import Tags from '../components/Tags';
import { PostMeta } from './BlogPage';
import NotFoundPage from './NotFoundPage';

// Site-relative links (e.g. /#contact) navigate in-app; others open in a new tab.
const MarkdownLink = ({ href = '', children }) => {
  if (href.startsWith('/')) return <Link to={href}>{children}</Link>;
  if (href.startsWith('#')) return <a href={href}>{children}</a>;
  return (
    <a href={href} target='_blank' rel='noreferrer'>
      {children}
    </a>
  );
};

const PostPage = () => {
  const { slug } = useParams();
  const { posts, error } = usePosts();
  const post = posts && posts.find((p) => p.slug === slug);
  useDocumentTitle(post ? post.title : 'Blog');

  if (posts && !post) return <NotFoundPage />;

  return (
    <article className='mx-auto w-full max-w-3xl px-6 pt-36 pb-24 md:pt-40'>
      <Link to='/blog' className='link inline-flex items-center gap-2 text-sm'>
        <FiArrowLeft aria-hidden='true' /> All posts
      </Link>

      {error && <p className='mt-10 text-danger'>Sorry, this post couldn't be loaded. Please try again later.</p>}
      {!error && !post && <p className='mt-10 text-ink-muted'>Loading…</p>}

      {post && (
        <>
          <header className='mt-8 border-b border-line pb-8'>
            <PostMeta post={post} />
            <h1 className='mt-3 text-4xl font-semibold tracking-tighter text-ink md:text-5xl'>{post.title}</h1>
            {post.summary && <p className='lead mt-4'>{post.summary}</p>}
            <div className='mt-6'>
              <Tags tags={post.tags} />
            </div>
          </header>

          <div className='prose prose-lg mt-10 max-w-none'>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: MarkdownLink }}>
              {post.body}
            </ReactMarkdown>
          </div>
        </>
      )}
    </article>
  );
};

export default PostPage;
