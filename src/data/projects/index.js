import fs from 'fs';
import path from 'path';

// Detect all JSON files
const modules = import.meta.glob('./**/*.json', { eager: true });
const allPaths = Object.keys(modules);

// Detect all top-level folders under the current directory
const baseDir = new URL('./', import.meta.url).pathname;
const folderNames = fs.readdirSync(baseDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

// Group JSON files by folder
const groups = {};
allPaths.forEach(filePath => {
  if (filePath.endsWith('template.json')) return; // skip template.json

  const parts = filePath.split('/');
  const folder = parts[1]; // top-level folder under './'
  const overview = modules[filePath]?.default ? modules[filePath].default : modules[filePath];
  groups[folder] = groups[folder] || [];
  groups[folder].push(overview);
});

// Include folders without JSON files
folderNames.forEach(folder => {
  if (!groups[folder]) groups[folder] = [];
});

// Normalize overview objects
function normalizeOverview(ev, filePath) {
  const fileName = filePath?.split('/').pop().replace('.json', '');
  const raw = ev ?? {};
  const o = raw.overview ?? raw;

  const id = raw.id ?? o.id ?? (o.title ? o.title.toLowerCase().replace(/\s+/g, '-') : fileName);

  return {
    id,
    title: o.title ?? '',
    date: o.date ?? '',
    dateLabel: o.dateLabel ?? o.date ?? '',
    category: o.category ?? 'Other',
    excerpt: o.excerpt ?? '',
    image: o.image ?? '',
    url: `/projects/${id}`,
    _raw: raw,
    _filePath: filePath
  };
}

// Parse folder name for year and semester
function parseSemesterFolder(folderName) {
  const yearMatch = folderName.match(/(20\d{2})/);
  const year = yearMatch ? Number(yearMatch[1]) : null;

  const semMatch = folderName.match(/sem(?:ester)?[\s-_]*([12])/i);
  const sem = semMatch ? Number(semMatch[1]) : null;

  let label;
  if (year && sem) label = `Sem ${sem}, ${year}`;
  else if (year) label = folderName.replace(/[-_]/g, ' ');
  else label = folderName.replace(/[-_]/g, ' ');

  return { year, sem, label };
}

// Convert groups into semesters array
let semesters = Object.keys(groups).map(folder => {
  const parsed = parseSemesterFolder(folder);
  const projects = groups[folder]
    .map(ev => normalizeOverview(ev, null))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    id: folder,
    folder,
    label: parsed.label,
    year: parsed.year,
    sem: parsed.sem,
    projects
  };
});

// Sort semesters: newest year first, then highest semester
semesters.sort((a, b) => {
  if (a.year && b.year) {
    if (a.year !== b.year) return b.year - a.year;
    const aSem = a.sem ?? -1;
    const bSem = b.sem ?? -1;
    return bSem - aSem;
  }
  if (a.year && !b.year) return -1;
  if (!a.year && b.year) return 1;
  return b.folder.localeCompare(a.folder);
});

// Debug
console.log("Detected folders:", folderNames);
console.log("Semesters after sorting:", semesters.map(s => s.label));

// Export
export default { semesters };
