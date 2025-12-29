// src/data/learn/index.js

const modules = import.meta.glob('./data/**/*.json', { eager: true });

function getIdFromPath(filePath) {
  const match = filePath.match(/\/([^/]+)\.json$/);
  return match ? match[1] : null;
}

function normalizeTopic(raw, filePath) {
  const id = getIdFromPath(filePath);

  return {
    id,             
    title: raw.title,
    description: raw.description ?? '',
    excerpt: raw.excerpt ?? raw.description ?? '',
    category: raw.category ?? 'Other',
    image: raw.image ?? '',
    featured: raw.featured ?? false,
    url: `/learn/${id}`, 
    date: raw.date ?? '',
    dateLabel: raw.date ?? raw.dateLabel ?? '',
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
  const id = getIdFromPath(path);

  if (id && raw.title) {
    topics.push(normalizeTopic(raw, path));
  }
}

export default { topics };
