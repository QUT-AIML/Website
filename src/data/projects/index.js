import fs from 'fs';

// Detect all JSON files
const modules = import.meta.glob('./**/*.json', { eager: true });
const allPaths = Object.keys(modules);

// Detect all top-level folders under the current directory
const baseDir = new URL('./', import.meta.url).pathname;
const folderNames = fs
  .readdirSync(baseDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

// --------------------------------------------------
// Group JSON files by folder WITH filePath preserved
// --------------------------------------------------
const groups = {};

allPaths.forEach(filePath => {
  if (filePath.endsWith('template.json')) return;
  if (filePath.endsWith('TBC.json')) return;

  const parts = filePath.split('/');
  const folder = parts[1];

  const data = modules[filePath]?.default ?? modules[filePath];

  groups[folder] = groups[folder] || [];
  groups[folder].push({
    data,
    filePath
  });
});

// Include folders without JSON files
folderNames.forEach(folder => {
  if (!groups[folder]) groups[folder] = [];
});

// --------------------------------------------------
// Normalize overview (ID = filename ONLY)
// --------------------------------------------------
function normalizeOverview(ev, filePath, semesterSlug) {
  const raw = ev ?? {};
  const o = raw.overview ?? raw;

  const match = filePath.match(/\/([^/]+)\.json$/);
  if (!match) {
    throw new Error(`Cannot derive project ID from file path: ${filePath}`);
  }

  const id = match[1]; // ✅ filename-based ID

  return {
    id,
    title: o.title ?? '',
    date: o.date ?? '',
    dateLabel: o.dateLabel ?? o.date ?? '',
    category: o.category ?? 'Other',
    excerpt: o.excerpt ?? '',
    image: o.image ?? '',
    url: `/projects/${semesterSlug}/${id}`,
    _raw: raw,
    _filePath: filePath
  };
}

// --------------------------------------------------
// Parse semester folder → slug + metadata
// --------------------------------------------------
function parseSemesterFolder(folderName) {
  const yearMatch = folderName.match(/(20\d{2})/);
  const year = yearMatch ? Number(yearMatch[1]) : null;

  const semMatch = folderName.match(/(?:sem|s)[\s-_]*([12])/i);
  const sem = semMatch ? Number(semMatch[1]) : null;

  // Canonical slug used for routing
  const slug =
    year && sem
      ? `sem-${sem}-${year}`
      : folderName.replace(/[\s,_]+/g, '-').toLowerCase();

  // Friendly label for UI
  const label =
    year && sem
      ? `Sem ${sem}, ${year}`
      : folderName.replace(/[-_]/g, ' ');

  return { year, sem, label, slug };
}

// --------------------------------------------------
// Convert groups → semesters array
// --------------------------------------------------
let semesters = Object.keys(groups).map(folder => {
  const parsed = parseSemesterFolder(folder);

  const projects = groups[folder]
    .map(({ data, filePath }) =>
      normalizeOverview(data, filePath, parsed.slug)
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    id: parsed.slug, // used as semesterId
    label: parsed.label,
    year: parsed.year,
    sem: parsed.sem,
    projects
  };
});

// --------------------------------------------------
// Sort semesters: newest year → highest sem
// --------------------------------------------------
semesters.sort((a, b) => {
  if (a.year && b.year) {
    if (a.year !== b.year) return b.year - a.year;
    return (b.sem ?? -1) - (a.sem ?? -1);
  }
  if (a.year && !b.year) return -1;
  if (!a.year && b.year) return 1;
  return b.id.localeCompare(a.id);
});

// Debug
console.log('Detected folders:', folderNames);
console.log('Semester slugs:', semesters.map(s => s.id));

// Export
export default { semesters };
