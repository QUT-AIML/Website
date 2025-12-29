// src/data/learn/index.js

const modules = import.meta.glob('./data/**/*.json', { eager: true });

function getIdFromPath(filePath) {
  const match = filePath.match(/\/([^/]+)\.json$/);
  return match ? match[1] : null;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function normalizeTopic(raw, filePath) {
  return {
    id: filePath.match(/\/([^/]+)\.json$/)?.[1],
    title: raw.title,
    description: raw.description ?? '',
    excerpt: raw.excerpt ?? raw.description ?? '',
    category: raw.category ?? 'Other',
    image: raw.image ?? '',
    featured: raw.featured ?? false,
    url: `/learn/${filePath.match(/\/([^/]+)\.json$/)?.[1]}`,
    date: raw.date ?? '',
    dateLabel: formatDate(raw.date), 
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
