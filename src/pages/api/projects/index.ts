import fs from 'fs';
import path from 'path';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const basePath = path.join(process.cwd(), 'src', 'data', 'projects');

  if (!fs.existsSync(basePath)) return new Response('Projects folder not found', { status: 404 });

  const semesters = fs.readdirSync(basePath).filter(f =>
    fs.statSync(path.join(basePath, f)).isDirectory()
  );

  const baseUrl = new URL(request.url).origin;
  const allProjects: Record<string, any> = {};

  for (const sem of semesters) {
    const semPath = path.join(basePath, sem);
    const files = fs.readdirSync(semPath).filter(f => f.endsWith('.json'));

    allProjects[sem] = files.map(file => {
      const projectData = JSON.parse(fs.readFileSync(path.join(semPath, file), 'utf-8'));

      if (projectData.image) {
        projectData.image = `${baseUrl}/api/projects/${encodeURIComponent(sem)}/images/${encodeURIComponent(projectData.image)}`;
      }

      return projectData;
    });
  }

  return new Response(JSON.stringify(allProjects), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
