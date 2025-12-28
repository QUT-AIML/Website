// src/data/events/index.js
// Eagerly import all JSON files in the folder at build time
const modules = import.meta.glob('./*.json', { eager: true });

const events = Object.values(modules)
  .map((m) => (m && m.default) ? m.default : m) // handle bundlers that wrap default
  // Normalize: prefer overview if present, otherwise assume top-level fields
  .map((ev) => {
    const data = ev.overview ? ev.overview : ev;
    return {
      id: ev.id ?? data.id ?? data.title?.toLowerCase().replace(/\s+/g, '-'),
      title: data.title,
      date: data.date,
      dateLabel: data.dateLabel ?? data.date,
      category: data.category ?? 'Other',
      excerpt: data.excerpt ?? '',
      image: data.image ?? '',
      url: data.url ?? `/events/${ev.id ?? data.id ?? ''}`,
      // keep full object if you need it later
      _raw: ev
    };
  })
  // Optional: sort by date descending by default
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export default events;
