import React from 'react';
import { Link } from 'react-router-dom';
import { HiArrowNarrowRight } from 'react-icons/hi';
import Tags from '../components/Tags';
import { formatDate } from '../lib/posts';
import { useDocumentTitle, usePosts } from '../lib/hooks';

export const PostMeta = ({ post }) => (
  <p className='font-mono text-xs text-ink-muted'>
    <time dateTime={post.date}>{formatDate(post.date)}</time>
    <span aria-hidden='true'> · </span>
    {post.readingTime} min read
  </p>
);

const BlogPage = () => {
  const { posts, error } = usePosts();
  useDocumentTitle('Blog');

  return (
    <section className='section pt-32 sm:pt-36'>
      <p className='section-label'>Blog</p>
      <h1 className='section-title'>Notes on cloud, DevOps and the web</h1>
      <p className='mt-4 max-w-2xl text-lg text-ink-muted'>
        Things I've built, problems I've solved and what I'm learning along the way.
      </p>

      <div className='mt-12'>
        {error && <p className='text-danger'>Sorry, the posts couldn't be loaded. Please try again later.</p>}
        {!error && !posts && <p className='text-ink-muted'>Loading posts…</p>}
        {posts && posts.length === 0 && <p className='text-ink-muted'>No posts yet. Check back soon!</p>}

        {posts && posts.length > 0 && (
          <ul className='grid gap-6'>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  to={`/blog/${post.slug}`}
                  className='card group block p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/50 sm:p-8'
                >
                  <PostMeta post={post} />
                  <h2 className='mt-3 text-2xl font-bold text-ink transition-colors group-hover:text-accent'>
                    {post.title}
                  </h2>
                  {post.summary && <p className='mt-3 leading-relaxed text-ink-muted'>{post.summary}</p>}
                  <div className='mt-5 flex flex-wrap items-center justify-between gap-4'>
                    <Tags tags={post.tags} />
                    <span className='flex items-center gap-2 text-sm font-medium text-accent'>
                      Read post
                      <HiArrowNarrowRight className='transition-transform duration-300 group-hover:translate-x-1' aria-hidden='true' />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default BlogPage;
