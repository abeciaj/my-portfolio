// Runs after `react-scripts build` (the npm "postbuild" script).
//
// The app is a single-page React app, so every URL is served the same
// HTML. Search engines and link previews (LinkedIn, Slack, X...) mostly
// read that raw HTML, so this script writes one HTML file per route with
// its own title, description, canonical URL, Open Graph tags and
// structured data, plus sitemap.xml and a real 404 page.
//
// With `cleanUrls` in vercel.json, build/blog.html is served at /blog and
// build/blog/<slug>.html at /blog/<slug>.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePost } from '../src/lib/frontmatter.mjs';

const SITE = {
  url: 'https://jayabecia.com',
  name: 'Jayllan Abecia',
  jobTitle: 'Cloud & DevOps Engineer',
  title: 'Jayllan Abecia | Freelance Cloud & DevOps Engineer, Melbourne',
  description:
    'Melbourne-based freelance Cloud & DevOps Engineer helping teams build, automate and run infrastructure on AWS, Azure, Google Cloud and Kubernetes.',
  // Shown in structured data so searches like "DevOps engineer Melbourne" can match.
  address: { '@type': 'PostalAddress', addressLocality: 'Melbourne', addressRegion: 'VIC', addressCountry: 'AU' },
  image: '/og-image.png',
  sameAs: ['https://www.linkedin.com/in/jayllan-abecia-907b3119a/', 'https://github.com/abeciaj'],
  knowsAbout: [
    'Cloud Computing', 'DevOps', 'AWS', 'Microsoft Azure', 'Google Cloud', 'Kubernetes', 'Docker',
    'Helm', 'Terraform', 'Ansible', 'Git', 'GitHub Actions', 'Jenkins', 'CI/CD', 'Prometheus',
    'Grafana', 'Zabbix', 'Uptime Kuma', 'Monitoring', 'Logging', 'Vulnerability Assessment',
    'Mend', 'Trivy', 'Kubescape', 'Fail2ban',
    'Red Hat Enterprise Linux', 'Debian', 'Windows Server', 'VMware', 'PostgreSQL', 'MySQL',
    'Microsoft SQL Server', 'Greenplum', 'Informatica',
  ],
  alumniOf: ['Torrens University Australia', 'University of Southern Philippines'],
  // [name, issuer]
  credentials: [
    ['Microsoft Certified: DevOps Engineer Expert (AZ-400)', 'Microsoft'],
    ['Microsoft Certified: Azure Solutions Architect Expert (AZ-305)', 'Microsoft'],
    ['HashiCorp Certified: Terraform Associate (003)', 'HashiCorp'],
    ['Microsoft Certified: Azure Administrator Associate (AZ-104)', 'Microsoft'],
    ['Google Cloud Certified Professional Cloud Architect', 'Google Cloud'],
    ['Google Cloud Certified Associate Cloud Engineer', 'Google Cloud'],
    ['Microsoft Certified: Security, Compliance, and Identity Fundamentals (SC-900)', 'Microsoft'],
    ['Microsoft Certified: Azure Data Fundamentals (DP-900)', 'Microsoft'],
  ],
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = path.join(root, 'build');
const postsDir = path.join(root, 'src', 'posts');

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// JSON inside <script> must not be able to close the tag.
const jsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');
const abs = (p) => SITE.url + (p === '/' ? '/' : p);

const person = {
  '@type': 'Person',
  '@id': `${SITE.url}/#person`,
  name: SITE.name,
  jobTitle: SITE.jobTitle,
  url: SITE.url + '/',
  image: abs(SITE.image),
  sameAs: SITE.sameAs,
  address: SITE.address,
  areaServed: 'Melbourne, Australia',
  knowsAbout: SITE.knowsAbout,
  alumniOf: SITE.alumniOf.map((name) => ({ '@type': 'CollegeOrUniversity', name })),
  hasCredential: SITE.credentials.map(([name, issuer]) => ({
    '@type': 'EducationalOccupationalCredential',
    name,
    credentialCategory: 'certification',
    recognizedBy: { '@type': 'Organization', name: issuer },
  })),
};

const headTags = ({ title, description, urlPath, type = 'website', noindex = false, extra = [], schema }) => {
  const url = abs(urlPath);
  const image = abs(SITE.image);
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    noindex
      ? '<meta name="robots" content="noindex">'
      : `<link rel="canonical" href="${url}">`,
    `<meta property="og:site_name" content="${escapeHtml(SITE.name)}">`,
    '<meta property="og:locale" content="en_AU">',
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${image}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${escapeHtml(SITE.title)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${image}">`,
    ...extra,
  ];
  if (schema) {
    tags.push(
      `<script type="application/ld+json">${jsonLd({ '@context': 'https://schema.org', '@graph': schema })}</script>`
    );
  }
  return tags.join('');
};

// Remove the defaults from public/index.html that each page replaces.
const stripManagedTags = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<meta\s+name="robots"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/<meta\s+(property="og:|name="twitter:)[^>]*>/gi, '')
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');

const loadPosts = async () => {
  const files = (await readdir(postsDir)).filter((f) => f.endsWith('.md'));
  const posts = await Promise.all(
    files.map(async (f) => parsePost(f.replace(/\.md$/, ''), await readFile(path.join(postsDir, f), 'utf8')))
  );
  return posts.filter((p) => !p.draft).sort((a, b) => (a.date < b.date ? 1 : -1));
};

const main = async () => {
  const template = stripManagedTags(await readFile(path.join(buildDir, 'index.html'), 'utf8'));
  if (!template.includes('</head>')) throw new Error('build/index.html has no </head>');
  const render = (opts) => template.replace('</head>', headTags(opts) + '</head>');
  const posts = await loadPosts();

  const pages = [
    {
      file: 'index.html',
      urlPath: '/',
      title: SITE.title,
      description: SITE.description,
      schema: [
        person,
        { '@type': 'WebSite', '@id': `${SITE.url}/#website`, url: SITE.url + '/', name: SITE.name, publisher: { '@id': person['@id'] } },
      ],
    },
    {
      file: 'blog.html',
      urlPath: '/blog',
      title: `Blog | ${SITE.name}`,
      description: `Notes on cloud, DevOps and the web from ${SITE.name}: things I've built, problems I've solved and what I'm learning.`,
      schema: [{ '@type': 'Blog', url: abs('/blog'), name: `${SITE.name}'s Blog`, author: person }],
    },
    ...posts.map((post) => ({
      file: path.join('blog', `${post.slug}.html`),
      urlPath: `/blog/${post.slug}`,
      title: `${post.title} | ${SITE.name}`,
      description: post.summary || SITE.description,
      type: 'article',
      extra: [
        post.date && `<meta property="article:published_time" content="${escapeHtml(post.date)}">`,
        ...post.tags.map((t) => `<meta property="article:tag" content="${escapeHtml(t)}">`),
      ].filter(Boolean),
      schema: [
        {
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.summary || undefined,
          datePublished: post.date || undefined,
          url: abs(`/blog/${post.slug}`),
          mainEntityOfPage: abs(`/blog/${post.slug}`),
          image: abs(SITE.image),
          keywords: post.tags.join(', ') || undefined,
          author: person,
        },
      ],
    })),
    {
      // Served by Vercel with a 404 status for unknown URLs; the app
      // then renders its "page not found" screen.
      file: '404.html',
      urlPath: '/404',
      title: `Page not found | ${SITE.name}`,
      description: SITE.description,
      noindex: true,
    },
  ];

  await mkdir(path.join(buildDir, 'blog'), { recursive: true });
  await Promise.all(pages.map((page) => writeFile(path.join(buildDir, page.file), render(page))));

  // lastmod only where we know a real date; Google ignores lastmod values
  // that change on every build.
  const urls = [
    { loc: abs('/') },
    { loc: abs('/blog'), lastmod: posts[0]?.date },
    ...posts.map((p) => ({ loc: abs(`/blog/${p.slug}`), lastmod: p.date })),
  ];
  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
      .join('\n') +
    '\n</urlset>\n';
  await writeFile(path.join(buildDir, 'sitemap.xml'), sitemap);

  console.log(`SEO pages: wrote ${pages.length} HTML files and sitemap.xml (${urls.length} URLs).`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
