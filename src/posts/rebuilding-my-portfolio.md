---
title: Rebuilding my portfolio
date: 2026-09-29
summary: A redesign, light and dark mode, a move from GitHub Pages to Vercel, and this blog.
tags: [react, tailwind, vercel]
---

Welcome to my blog! This is where I'll be writing about cloud, DevOps and the things I learn along the way. To start, here's a quick look at how this site is put together.

## The stack

- **React** for the UI
- **Tailwind CSS** for styling
- **Vercel** for hosting, with a fresh deploy on every push

## Light and dark mode

Every color on the site is a CSS variable, with one set of values for the light theme and one for the dark theme:

```css
:root {
  --page: 248 250 252;
  --accent: 109 40 217;
}

.dark {
  --page: 11 17 32;
  --accent: 167 139 250;
}
```

Tailwind reads those variables, so a class like `bg-page` works in both themes without any extra `dark:` variants. The site follows your system setting until you pick a theme with the toggle in the navbar.

## Writing posts

Each post is a Markdown file in the repository. Publishing a new one is just adding a file and pushing:

```bash
git add src/posts/my-new-post.md
git commit -m "New post"
git push
```

Vercel picks up the push and the post is live a minute later.

Thanks for reading, and feel free to [get in touch](/#contact) if you'd like to work together.
