// Blog posts are Markdown files in src/posts. Each file starts with a
// front matter block, and the file name (without .md) is the URL slug:
//
//   ---
//   title: My post
//   date: 2026-09-29
//   summary: One sentence shown on the blog list.
//   tags: [aws, terraform]
//   draft: false
//   ---
//
// Webpack bundles each file as a static asset, so posts are fetched
// on demand instead of inflating the JavaScript bundle.
import { parsePost } from './frontmatter.mjs';

const files = require.context('../posts', false, /\.md$/);

let cache;

// Resolves to all published posts, newest first.
export const getPosts = () => {
  if (!cache) {
    cache = Promise.all(
      files.keys().map(async (key) => {
        const mod = files(key);
        const url = typeof mod === 'string' ? mod : mod.default;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load ${key}: ${res.status}`);
        return parsePost(key.replace(/^\.\//, '').replace(/\.md$/, ''), await res.text());
      })
    )
      .then((posts) =>
        posts
          .filter((post) => !post.draft)
          .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
      )
      .catch((err) => {
        cache = undefined; // allow a retry on the next visit
        throw err;
      });
  }
  return cache;
};

export const formatDate = (date) => {
  if (!date) return '';
  // Dates are plain YYYY-MM-DD; parse as local time so they don't shift a day.
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
