# AGENTS.md

Instructions for AI coding agents working in this repository. For how the site
should look and feel, read [`DESIGN.md`](DESIGN.md) before changing any UI.

## Project

Personal portfolio and blog for Jayllan Abecia, a Melbourne-based freelance
Cloud & DevOps Engineer. Live at **https://jayabecia.com**, hosted on Vercel.

Single-page React app (home page with sections) plus a Markdown blog.

## Stack and version constraints

| Package | Version | Why it is pinned |
|---|---|---|
| `react-scripts` (Create React App) | 5.0.0 | Build tool. CRA is deprecated; migrating to Vite or Astro is a separate, planned task. Do not start it unprompted. |
| `react`, `react-dom` | 17 | Use `ReactDOM.render`. **No React 18 APIs** (`react-dom/client`, `useId`, `useTransition`, ...). |
| `tailwindcss` | 3.1 | v3 config and `@tailwind` directives. Do not apply Tailwind v4 syntax. |
| `react-router-dom` | 6 | v7 requires React 18. |
| `react-markdown` / `remark-gfm` | 8 / 3 | Newer majors require React 18. |
| `react-icons` | 4.3.1 | Newer majors **removed** the AWS and Azure logos used in Skills. Do not upgrade. Check an icon exists before importing it: `grep "exports.SiName " node_modules/react-icons/si/index.js`. |
| `@fontsource-variable/geist`, `geist-mono` | 5 | Self-hosted fonts, imported in `src/index.js`. Do not add Google Fonts links. |

Package manager is **npm** (`package-lock.json`). Do not add `yarn.lock`.

## Commands

```bash
npm install                 # install dependencies
npm start                   # dev server on http://localhost:3000
CI=true npm run build       # production build, exactly as Vercel runs it
npx serve build             # serve the production build (clean URLs + real 404, like Vercel)
```

`npm run build` runs `postbuild` automatically (`scripts/build-pages.mjs`).

**Always run `CI=true npm run build` before calling a change done.** With
`CI=true`, CRA treats ESLint warnings as errors, so an unused import or variable
fails the Vercel deploy. There are no unit tests; verify UI changes in a browser
at desktop and 390px mobile widths, in both light and dark themes.

Do not use `serve -s` for testing: the site intentionally has no SPA catch-all
(see Deployment).

## Where things live

```
src/
  data/profile.js        ALL site content: name, tagline, links, services, skills,
                         experience, education, certifications. Edit content here,
                         not in components.
  data/brandIcons.js     Logos missing from react-icons 4.3.1 (from Simple Icons, CC0)
  components/            Page sections (Home, About, Experience, Skills, Contact),
                         Navbar, Footer, ThemeToggle, ScrollTopButton, Tags,
                         Reveal (scroll-in animation wrapper)
  pages/                 Routes: HomePage, BlogPage, PostPage, NotFoundPage
  posts/*.md             Blog posts (front matter + Markdown)
  lib/frontmatter.mjs    Front matter parser, shared by the app and the build script
  lib/posts.js           Loads posts at runtime (require.context)
  lib/hooks.js           usePosts, useDocumentTitle, useScrolledPast
  index.css              Theme tokens (CSS variables) and component classes
scripts/build-pages.mjs  Post-build SEO step (see below)
public/                  index.html, resume.pdf, og-image.png, icons, robots.txt
vercel.json              cleanUrls, no-index header for resume.pdf
.claude/                 Agent tooling (see "Agent tooling")
```

`src/components/Work.jsx`, `src/data/data.js` and `src/assets/projects/` are
unused leftovers from an old Work section. Leave them unless asked to remove them.

## Routing

Routes are `/`, `/blog` and `/blog/:slug`; anything else renders `NotFoundPage`.
Blog pages are lazy-loaded (`React.lazy`) so the Markdown renderer stays out of
the home page bundle. Keep it that way.

Home sections are scrolled to with `react-scroll`, using `offset: -72` for the
fixed navbar. Section `id`s (`home`, `about`, `experience`, `skills`, `contact`)
are linked from the navbar, the blog (`/#contact`) and search results. **Do not
rename them.** From other routes the navbar links to `/#section` and
`HomePage` scrolls to the hash.

Do not add `scroll-behavior: smooth` to CSS. It fights react-scroll's own
animation and makes nav links stop short of their section.

Do not add `window.addEventListener('scroll', ...)`. Use `useScrolledPast(px)`
from `lib/hooks.js` (IntersectionObserver) for scroll-dependent UI, and
`<Reveal>` for scroll-in animation.

## Blog posts

Add a file `src/posts/<slug>.md`. The file name is the URL slug.

```markdown
---
title: My post
date: 2026-10-08
summary: One sentence shown on the blog list and in search/social previews.
tags: [terraform, aws]
draft: false
---

Markdown body (GitHub-flavoured: tables, fenced code blocks).
```

`draft: true` hides a post everywhere, including the sitemap. Site-relative links
in posts (`/#contact`, `/blog/other-post`) navigate in-app.

## SEO and the post-build step

The app is client-rendered, but crawlers and link previews read raw HTML. After
`react-scripts build`, `scripts/build-pages.mjs`:

- writes `build/index.html`, `build/blog.html`, `build/blog/<slug>.html` and
  `build/404.html`, each with its own title, description, canonical URL,
  Open Graph/Twitter tags and JSON-LD (`Person`, `WebSite`, `Blog`, `BlogPosting`)
- writes `build/sitemap.xml` from the published posts

Site-wide SEO values (title, description, `knowsAbout`, credentials, address)
live in the `SITE` object at the top of that script. **When you change skills,
certifications or education in `profile.js`, update `SITE` to match.**

The canonical domain is `https://jayabecia.com` (no `www`). It is hard-coded in
`build-pages.mjs` and `public/robots.txt`.

`public/index.html` keeps the Google Search Console verification tag and an
inline script that applies the theme before first paint. Do not remove either.

## Deployment

Vercel builds every push; merging to `master` deploys production.

- `vercel.json` uses `cleanUrls` (so `blog.html` serves `/blog`) and **no
  catch-all rewrite**, so unknown URLs return a real 404 via `404.html`. Adding a
  new top-level route means adding a page for it in `build-pages.mjs`.
- Never add a `homepage` field to `package.json`; it breaks asset paths.
- `public/resume.pdf` is served with `X-Robots-Tag: noindex`. Replace the file to
  update the resume; keep the name.

## Conventions

- Match the surrounding code: functional components, single quotes in JSX
  attributes, Tailwind utilities, comments only where intent is non-obvious.
- Colors come from theme tokens (`bg-page`, `text-ink`, `border-line`,
  `text-accent`, ...). Do not hard-code hex values in components or add `dark:`
  color variants; see `DESIGN.md`.
- UI icons come from Feather only (`react-icons/fi`); brand logos from
  `react-icons/si`. Icons need `aria-hidden='true'` when decorative; icon-only
  links and buttons need `aria-label`.
- External links use `target='_blank' rel='noreferrer'`.
- Keep `profile.js` the single source of content. Never invent experience,
  certifications, metrics or testimonials. Content about Jayllan must come from
  the user or their resume.

## Git

Work on a `feature/<name>` branch off `master` and open a PR. Do not commit to
`master` directly. Do not commit `build/`.

## Agent tooling

- `/web-interface-guidelines <files>`: Claude Code slash command
  (`.claude/commands/`) that reviews UI code against Vercel's Web Interface
  Guidelines (accessibility, focus, forms, motion, typography, performance).
  Run it on any component you change.
- `design-taste-frontend` skill (`.claude/skills/`): Taste Skill's design rules
  for landing pages and portfolios. Several of its defaults conflict with
  deliberate choices here; `DESIGN.md` lists them and wins.

Both are vendored and pinned to reviewed commits (see the source notes in each).
Review upstream changes before updating them.
