// src/data/events/index.js
const modules = import.meta.glob('./**/*.json', { eager: true });

function normalizeOverview(ev, filePath) {
  const raw = ev && ev.default ? ev.default : ev;
  const o = raw.overview ?? raw;
  const id = raw.id ?? o.id ?? (o.title ? o.title.toLowerCase().replace(/\s+/g, '-') : '');
  return {
    id,
    title: o.title ?? '',
    date: o.date ?? '',
    dateLabel: o.dateLabel ?? o.date ?? '',
    category: o.category ?? 'Other',
    excerpt: o.excerpt ?? '',
    image: o.image ?? '',
    url: o.url ?? `/events/${id}`,
    _raw: raw,
    _filePath: filePath
  };
}

// Group by semester folder (assumes files are in ./<semester>/<event>.json)
const groups = {};

for (const [path, mod] of Object.entries(modules)) {
  // path looks like './2024-sem1/winter-hackathon.json' or './Fall2023/event.json'
  // extract the folder name between './' and the next '/'
  const match = path.match(/^\.\/([^/]+)\//);
  const semester = match ? match[1] : 'unknown';
  const overview = normalizeOverview(mod, path);
  groups[semester] = groups[semester] || [];
  groups[semester].push(overview);
}

// Convert to array and sort events within each semester by date (desc)
const semesters = Object.keys(groups)
  .map((sem) => {
    const events = groups[sem].slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    return {
      id: sem,
      label: sem.replace(/[-_]/g, ' '), // simple label transform, adjust if you want prettier labels
      events
    };
  })
  // Sort semesters by id descending (you can change to custom order)
  .sort((a, b) => (a.id < b.id ? 1 : -1));

export default { semesters };
