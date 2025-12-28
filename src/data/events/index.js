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

/**
 * Parse a folder name to extract a year and semester number.
 * Supports common patterns like:
 *  - "2026-sem2", "2026_sem2", "2026/sem2"
 *  - "sem2-2026", "Sem 2, 2026"
 *  - "Fall2023" (will extract year only)
 *
 * Returns { year: number|null, sem: number|null, label: string }
 */
function parseSemesterFolder(folderName) {
  // Try to find a 4-digit year
  const yearMatch = folderName.match(/(20\d{2})/);
  const year = yearMatch ? Number(yearMatch[1]) : null;

  // Try to find semester number (1 or 2)
  // matches "sem1", "sem 1", "semester1", "semester 2", "Sem 2"
  const semMatch = folderName.match(/(?:sem(?:ester)?[\s-_]?|s[\s-_]?)([12])\b/i);
  const sem = semMatch ? Number(semMatch[1]) : null;

  // If folder looks like "Fall2023" or "Spring2024" we won't infer sem number
  // Build a friendly label
  let label;
  if (year && sem) {
    label = `Sem ${sem}, ${year}`;
  } else if (year && !sem) {
    // no semester number but year present
    label = `${folderName.replace(/[-_]/g, ' ')}`;
  } else {
    // fallback to raw folder name
    label = folderName.replace(/[-_]/g, ' ');
  }

  return { year, sem, label };
}

// Group by semester folder (assumes files are in ./<semester-folder>/<event>.json)
const groups = {};

for (const [path, mod] of Object.entries(modules)) {
  // path looks like './2024-sem1/winter-hackathon.json' or './Sem 2, 2026/event.json'
  const match = path.match(/^\.\/([^/]+)\//);
  const semesterFolder = match ? match[1] : 'unknown';
  const overview = normalizeOverview(mod, path);
  groups[semesterFolder] = groups[semesterFolder] || [];
  groups[semesterFolder].push(overview);
}

// Convert to array and attach parsed metadata
let semesters = Object.keys(groups).map((folder) => {
  const parsed = parseSemesterFolder(folder);
  const events = groups[folder].slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  return {
    id: folder,
    folder,
    label: parsed.label,
    year: parsed.year,
    sem: parsed.sem,
    events
  };
});

// Sort semesters: newest year first; if same year, highest sem number first.
// If year missing, place them after known years and sort by folder name.
semesters.sort((a, b) => {
  // both have year
  if (a.year && b.year) {
    if (a.year !== b.year) return b.year - a.year; // newest year first
    // same year: compare sem (nulls go last)
    const aSem = a.sem ?? -1;
    const bSem = b.sem ?? -1;
    return bSem - aSem;
  }

  // only a has year
  if (a.year && !b.year) return -1;
  // only b has year
  if (!a.year && b.year) return 1;

  // neither has year: fallback to folder name descending
  return b.folder.localeCompare(a.folder);
});

// Export shape: { semesters: [...] }
export default { semesters };
