import fs from 'fs';
import path from 'path';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const basePath = path.join(process.cwd(), 'src', 'data', 'about');
  if (!fs.existsSync(basePath)) return new Response('Data folder not found', { status: 404 });

  const years = fs.readdirSync(basePath).filter(f =>
    fs.statSync(path.join(basePath, f)).isDirectory()
  );

  const baseUrl = new URL(request.url).origin;
  const result: Record<string, any> = {};

  for (const year of years) {
    const yearPath = path.join(basePath, year);
    const teamPhotoPath = path.join(yearPath, 'team-photo.png');
    const teamDetailsPath = path.join(yearPath, 'team-details.json');
    const execPhotosPath = path.join(yearPath, 'exec-photos');

    // Load executive list JSON
    const executiveList = fs.existsSync(teamDetailsPath)
      ? JSON.parse(fs.readFileSync(teamDetailsPath, 'utf-8'))
      : [];

    // Replace `image` field in nested items with actual API route
    if (fs.existsSync(execPhotosPath)) {
      for (const section of executiveList) {
        if (section.items && Array.isArray(section.items)) {
          for (const exec of section.items) {
            if (exec.image) {
              const imageFilePath = path.join(execPhotosPath, exec.image);
              if (fs.existsSync(imageFilePath)) {
                exec.image = `${baseUrl}/api/about/${encodeURIComponent(year)}/exec-photos/${encodeURIComponent(exec.image)}`;
              } else {
                exec.image = null; // fallback if file doesn't exist
              }
            }
          }
        }
      }
    }

    result[year] = {
      teamPhoto: fs.existsSync(teamPhotoPath)
        ? `${baseUrl}/api/about/${encodeURIComponent(year)}/team-photo.png`
        : null,
      executiveList,
    };
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
