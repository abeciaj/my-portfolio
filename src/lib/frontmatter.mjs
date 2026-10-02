// Front matter parser shared by the app (src/lib/posts.js) and the
// build script (scripts/build-pages.mjs), so it must stay dependency-free.
const parseValue = (value) => {
  const v = value.trim();
  if (v.startsWith('[') && v.endsWith(']')) {
    return v
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }
  if (v === 'true' || v === 'false') return v === 'true';
  return v.replace(/^['"]|['"]$/g, '');
};

export const parsePost = (slug, raw) => {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const meta = {};
  if (match) {
    match[1].split(/\r?\n/).forEach((line) => {
      const i = line.indexOf(':');
      if (i > 0) meta[line.slice(0, i).trim()] = parseValue(line.slice(i + 1));
    });
  }
  const body = (match ? match[2] : raw).trim();
  const words = body.split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: meta.title || slug,
    date: meta.date || '',
    summary: meta.summary || '',
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    draft: meta.draft === true,
    readingTime: Math.max(1, Math.round(words / 200)),
    body,
  };
};
