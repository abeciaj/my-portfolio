# DESIGN.md

How jayabecia.com should look and feel. Read this before changing any UI.
Build and code conventions are in [`AGENTS.md`](AGENTS.md).

This file describes the system **as built**. If you change the design, update
this file in the same PR.

## Design read

Developer portfolio for **hiring managers and freelance clients** (Melbourne and
remote), with a calm, precise, technical DevOps language: neutral off-black and
off-white surfaces with a dot-grid "infrastructure canvas", soft violet light,
Geist type, and a terminal that prints real profile data. Content credibility (real roles, real certifications) matters more
than spectacle.

Taste Skill dials: `DESIGN_VARIANCE 7`, `MOTION_INTENSITY 5`, `VISUAL_DENSITY 4`.
Each home section uses a different layout family (see Layout).

## Brand

- **Logo:** lavender ring with a "J" and a monospace "Jayllan" wordmark
  (`src/assets/logo.png`, square icon `public/logo.png`). Do not recolor or redraw it.
- **Accent:** violet, taken from the logo. The only accent on the site.
- **Voice:** first person, plain and factual. No invented metrics, clients or
  testimonials. Experience and certifications come from the resume only.
  The hero tagline is the owner's own wording; do not rewrite it unasked.

## Color tokens

All colors are CSS variables in `src/index.css`, exposed to Tailwind in
`tailwind.config.js`. Components use token classes (`bg-page`, `text-ink`,
`border-line`, `text-accent`, `bg-accent/10`, ...) and **never** hex values or
`dark:` color variants. Switching theme only swaps variable values.

Neutrals are the zinc scale (no pure `#000`/`#fff`).

| Token | Light | Dark | Use |
|---|---|---|---|
| `page` | `#F6F6F7` | `#0A0A0C` | Page background |
| `surface` | `#FDFDFD` | `#141417` | Tiles, form panel, navbar (scrolled), mobile menu |
| `sunken` | `#EFEFF1` | `#050507` | Inputs, Data skill tile |
| `line` | `#E4E4E7` | `#27272A` | Borders, dividers |
| `ink` | `#18181B` | `#F4F4F5` | Headings, primary text |
| `ink-muted` | `#52525B` | `#A1A1AA` | Body copy, meta text |
| `accent` | `#6D28D9` | `#A78BFA` | Links, primary button, chips, focus ring |
| `accent-hover` | `#5B21B6` | `#C4B5FD` | Hover state of accent |
| `on-accent` | `#FDFDFD` | `#0A0A0C` | Text on accent backgrounds |
| `success` | `#15803D` | `#4ADE80` | Form success |
| `danger` | `#B91C1C` | `#F87171` | Form errors |

Every text/background pair above passes WCAG AA (measured 6.6:1 to 18:1). Keep
new colors at 4.5:1 or better.

**Theme-independent colors** (the only hex values allowed in components):
- The hero terminal is always dark: `#0F0F12` bg, `#27272A` border, `#E4E4E7`
  text, `#A1A1AA` output, `#A78BFA` prompt, `#7DD3FC` YAML keys, `#86EFAC` file
  names, macOS traffic-light dots.
- Brand logo colors in `profile.js` (skills, certifications). Black or white
  logos (GitHub, Helm, VMware, Trivy) omit `color` so they use `ink`.
- Letter badges for tools without a logo (Zabbix, Mend, Kubescape, Fail2ban).
- Blog code blocks are dark in both themes (`#141417` bg, `#F4F4F5` text,
  set in `tailwind.config.js`).

## Theming

- Light and dark are equal citizens; test every change in both.
- Default follows the OS (`prefers-color-scheme`); the navbar toggle overrides it
  and is remembered in `localStorage` (`theme`). An inline script in
  `public/index.html` applies it before first paint. Do not remove it.
- Theme is page-wide. Sections never invert.

## Typography

Self-hosted with `@fontsource-variable` (imported in `src/index.js`); no Google
Fonts requests.

- **Sans:** Geist (variable), for everything by default.
- **Mono:** Geist Mono, for small technical details only: dates, exam codes,
  chips, blog meta.

| Role | Classes |
|---|---|
| Hero headline (h1) | `text-4xl sm:text-5xl md:text-6xl lg:text-[3.25rem] xl:text-6xl font-semibold leading-[1.05] tracking-tighter`; role on a second line in `text-ink-muted` |
| Section title (h2) | `.section-title` = `text-3xl md:text-5xl font-semibold tracking-tight` |
| Sub-heading (h3) | `text-2xl font-semibold tracking-tight` (blocks) or `text-xl font-semibold` (items) |
| Lead paragraph | `.lead` = `max-w-[65ch] text-lg leading-relaxed text-ink-muted` |
| Body | `leading-relaxed text-ink-muted`, max `65ch` |
| Small label | `text-sm font-medium text-ink-muted` (sentence case, no uppercase tracking) |
| Meta | `font-mono text-xs` or `text-sm text-ink-muted` |

Headings use `text-wrap: balance` (set globally for h1-h3). The hero headline
must stay on **2 lines** from `md` up; it may wrap to 3 on phones.

Dashes: use a plain hyphen for ranges (`Jul 2024 - Present`, `2014 - 2018`).
No em or en dashes in visible text. Loading text ends with `…`.

## Layout

- Container: `.container-page` = `mx-auto w-full max-w-6xl px-6`. Blog posts:
  `max-w-3xl`.
- Sections: `.section` = container + `py-24 md:py-32`. No eyebrow labels above
  section titles; the heading stands alone.
- Home section order and layout family (one family per section):

| Section | Layout |
|---|---|
| Hero | Asymmetric split: text left, terminal in a fixed `24rem` column. `min-h-[100dvh]`, `pt-24`. Max 4 elements: headline, tagline, 2 CTAs, terminal. Background: dot grid + two accent glows. |
| About | 5/7 split: bio + facts list (`dl`) left, services as a divided list right. |
| Experience | Tinted `.band`. Timeline rows: date column (`12rem`) + role content, `border-t` per row. Then certifications grouped by issuer (CSS columns) and education. |
| Skills | Dot-grid background. Bento grid, one cell per group, exactly as many cells as groups. Uses `md:grid-flow-row-dense` so no empty cells. Tones: DevOps tinted accent, Data `sunken`, others `surface`. |
| Contact | Tinted `.band` with dot grid and an accent glow. Stacked: title + lead, then channels list (4/12) + form panel (8/12). |

- All multi-column layouts collapse to one column below `md` or `lg`.
- Footer stays at the bottom on short pages (`App` is a `min-h-screen` flex column).

## Backgrounds

Classes in `src/index.css`, all built from tokens so they adapt to both themes:

| Class | What it does |
|---|---|
| `.bg-dots` | 1px dots on a 22px grid (`ink` at 20%). Pair with `.fade-edges` so it fades out radially. |
| `.glow` | Blurred radial violet light. Position it absolutely, partly off-canvas. |
| `.band` | Full-width tinted strip (`surface` at 70%, top/bottom borders) with a thin accent "beam" on its top edge. |
| `.grain` | Fixed, page-wide film grain (3.5% light, 5% dark), `pointer-events: none`. Rendered once in `App`. |

Rules: decorative layers are `aria-hidden`, sit behind content (`-z-10` inside an
`isolate` section), and never use a second accent hue. Alternate plain and
banded sections so the page has rhythm.

## Shape and elevation

One documented radius rule, applied everywhere:

| Element | Radius |
|---|---|
| Buttons, chips, nav links, icon buttons, scroll-to-top | `rounded-full` (pill) |
| Inputs, letter badges | `rounded-xl` / `rounded-md` for 24px badges |
| Tiles, form panel, code blocks | `rounded-2xl` |

Elevation: `.tile` = `rounded-2xl border border-line bg-surface shadow-sm
shadow-zinc-900/5` (no shadow in dark). Shadows are zinc-tinted, never pure black.
Use tiles only where grouping carries meaning; elsewhere use `border-t` and space.

## Components

| Class / component | Purpose |
|---|---|
| `.btn-primary` | Main action. Accent fill, `on-accent` text. "Get in touch" in the hero, "Send message" in the form. |
| `.btn-secondary` | Secondary action. Bordered surface pill ("Resume", "Read the blog"). |
| `.tile` | Grouped content panel. |
| `.chip` | Mono pill: `rounded-full bg-accent/10 px-3 py-1 font-mono text-xs text-accent`. Tags, "Current". |
| `.field` | Inputs and textarea. Label above, `gap-2`. |
| `.link` | Inline text link with underline on hover. |
| `<Reveal>` | Scroll-in wrapper (see Motion). Accepts `as` and `delay`. |
| `Tags` | List of `.chip`s. |
| `Navbar` | Fixed, 72px. **Transparent at the top, solid `surface` with border and soft shadow once scrolled** (or when the mobile menu is open). Links at `lg`+, full-screen menu below. |
| `ThemeToggle` | Sun/moon pill button. |
| `ScrollTopButton` | Round accent button, bottom right, after 400px of scroll. |

CTA labels, one per intent: contact = "Get in touch"; resume = "Resume".

Accessibility baseline (keep it):
- Visible focus everywhere: buttons use an `accent` ring; other links get a
  global 2px `accent` outline on `:focus-visible` (`index.css`).
- "Skip to content" is the first Tab stop; Escape closes the mobile menu.
- In-page targets have `scroll-margin-top: 80px` to clear the fixed navbar.
- Dates are formatted with `Intl` in `en-AU` ("29 September 2026").
- Copy stays sentence case and first person (owner's voice), even though the
  Web Interface Guidelines prefer Title Case and second person.

## Iconography

- **UI icons:** Feather only (`react-icons/fi`), 2px stroke. Do not mix in
  Font Awesome or Heroicons.
- **Brand logos:** `react-icons/si` (Simple Icons). Missing logos go in
  `src/data/brandIcons.js` from Simple Icons (CC0). If no logo exists, use a
  `monogram` letter badge. Never hand-draw a brand logo.
- Decorative icons get `aria-hidden='true'`; icon-only controls get `aria-label`.
- `<img>` tags carry `width`/`height` to prevent layout shift.

## Motion

`MOTION_INTENSITY 5`: every animation communicates entrance or feedback.

- **Terminal:** each line enters with the same `.rise` stagger, then the cursor
  blinks (`.cursor-blink`). Reduced motion shows all lines and a still cursor.
- **Hero entrance:** `.rise` keyframe (fade + 16px lift, 700ms,
  `cubic-bezier(0.16, 1, 0.3, 1)`), staggered by `--i` (90ms steps).
- **Scroll reveal:** `<Reveal>` adds `.is-visible` once via IntersectionObserver
  (fade + 24px lift, same easing). Optional `delay` for siblings.
- **Feedback:** buttons press to `scale(0.98)`; CTA arrows nudge 2px; nav and
  link colors fade in 200ms.
- Only `transform` and `opacity` animate (plus colors). Never `transition: all`.
- No scroll listeners: `useScrolledPast(px)` (IntersectionObserver on a
  sentinel) drives the navbar and scroll-to-top button.
- `prefers-reduced-motion: reduce` disables `.rise`, shows `.reveal` content
  immediately, and the scroll-to-top button jumps instead of smooth-scrolling.

## Deliberate decisions (keep unless the owner asks)

These intentionally override defaults in the `design-taste-frontend` skill:

1. **Violet accent.** It is the brand color from the logo (the skill's "LILA
   rule" override applies). Keep it restrained: no glows, no gradient text.
2. **Melbourne location** appears in the About facts and Contact channels (not
   the hero). It is real information that supports local search.
3. **Transparent-at-top navbar** that turns solid on scroll (owner's request).
4. **Light and dark themes with a toggle** (owner's request).
5. **Letter badges** for tools with no free logo.
6. **Hero terminal** (owner's request, for the DevOps feel). The skill bans
   fake terminal UI, so it only prints true data from `profile.js`: name,
   role, location, clouds and certification codes. Never add invented output
   (fake deploy logs, version numbers, node lists).
7. **Dot grid, glows and grain** backgrounds (owner asked for more than flat
   black and white). Keep them subtle and violet-only.
8. **Feather icons via react-icons** instead of the skill's preferred Phosphor:
   it is already a dependency and works with React 17.
9. **Middle dot** separates exam code and date in certification meta (one per line).

## Open items

- The logo PNG is pale lavender, so the small "Jayllan" wordmark is faint,
  especially in light mode. An SVG logo would fix it; needs the owner's artwork.
- `public/og-image.png` still shows the earlier certification-tile hero in the
  current palette. Regenerate it if you want the share image to show the terminal.

## Reviewing UI changes

1. `CI=true npm run build` must pass.
2. Check desktop (1280px), the `lg` breakpoint (1024px), `md` (768px) and
   mobile (390px). Hero headline: 2 lines from `md` up.
3. Check light and dark themes.
4. Scroll the full page before screenshots: sections reveal on scroll.
5. Run `/web-interface-guidelines` on changed files.
6. Run the `design-taste-frontend` pre-flight check, treating the "Deliberate
   decisions" above as passing.
