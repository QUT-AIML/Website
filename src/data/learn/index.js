// src/data/learn/index.js

const modules = import.meta.glob('./data/**/*.json', { eager: true });

function normalizeTopic(raw, filePath) {
  return {
    id: raw.slug,
    slug: raw.slug,
    title: raw.title,
    description: raw.description ?? '',
    excerpt: raw.excerpt ?? raw.description ?? '',
    category: raw.category ?? 'Other',
    image: raw.image ?? '',
    featured: raw.featured ?? false,
    url: raw.url ?? `/learn/${raw.slug}`,
    date: raw.date ?? '',
    dateLabel: raw.date ?? '',
    overview: raw.overview ?? null,
    tutorials: raw.tutorials ?? [],
    videos: raw.videos ?? [],
    applications: raw.applications ?? [],
    resources: raw.resources ?? [],
    tips: raw.tips ?? [],
    _filePath: filePath
  };
}

const topics = [];

for (const [path, mod] of Object.entries(modules)) {
  if (path.endsWith('template.json')) continue;

  const raw = mod?.default ?? mod;

  if (raw.slug && raw.title) {
    topics.push(normalizeTopic(raw, path));
  }
}

export default { topics };
