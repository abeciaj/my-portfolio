import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import Tags from '../components/Tags';
import { formatDate } from '../lib/posts';
import { useDocumentTitle, usePosts } from '../lib/hooks';

// `stacked` puts the reading time on its own line (used in the narrow date
// column of the blog list).
export const PostMeta = ({ post, stacked = false }) => (
  <p className='font-mono text-xs text-ink-muted'>
    <time dateTime={post.date}>{formatDate(post.date)}</time>
    {stacked ? <br /> : <span aria-hidden='true'> · </span>}
    {post.readingTime} min read
  </p>
);

const BlogPage = () => {
  const { posts, error } = usePosts();
  useDocumentTitle('Blog');

  return (
    <section className='section pt-36 md:pt-40'>
      <h1 className='section-title'>Notes on cloud, DevOps and the web</h1>
      <p className='lead mt-6'>
        Things I've built, problems I've solved and what I'm learning along the way.
      </p>

      <div className='mt-12'>
        {error && <p className='text-danger'>Sorry, the posts couldn't be loaded. Please try again later.</p>}
        {!error && !posts && <p className='text-ink-muted'>Loading posts…</p>}
        {posts && posts.length === 0 && <p className='text-ink-muted'>No posts yet. Check back soon!</p>}

        {posts && posts.length > 0 && (
          <ul className='border-b border-line'>
            {posts.map((post) => (
              <li key={post.slug} className='border-t border-line'>
                <Link
                  to={`/blog/${post.slug}`}
                  className='group grid gap-3 py-10 md:grid-cols-[12rem_1fr] md:gap-10'
                >
                  <PostMeta post={post} stacked />
                  <div>
                    <h2 className='text-2xl font-semibold tracking-tight text-ink transition-colors duration-200 group-hover:text-accent'>
                      {post.title}
                    </h2>
                    {post.summary && <p className='mt-3 max-w-[65ch] leading-relaxed text-ink-muted'>{post.summary}</p>}
                    <div className='mt-5 flex flex-wrap items-center justify-between gap-4'>
                      <Tags tags={post.tags} />
                      <span className='flex items-center gap-2 text-sm font-medium text-accent'>
                        Read post
                        <FiArrowRight className='transition-transform duration-200 group-hover:translate-x-0.5' aria-hidden='true' />
                      </span>
                    </div>
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
