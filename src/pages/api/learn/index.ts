import fs from 'fs';
import path from 'path';
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const dataPath = path.join(
    process.cwd(),
    'src',
    'data',
    'learn',
    'data'
  );

  if (!fs.existsSync(dataPath)) {
    return new Response('Learn data folder not found', { status: 404 });
  }

  const files = fs.readdirSync(dataPath).filter(f => f.endsWith('.json'));
  const baseUrl = new URL(request.url).origin;

  const learnItems = files.map(file => {
    const learnData = JSON.parse(
      fs.readFileSync(path.join(dataPath, file), 'utf-8')
    );

    if (learnData.image) {
      learnData.image =
        `${baseUrl}/api/learn/images/${encodeURIComponent(learnData.image)}`;
    }

    return learnData;
  });

  return new Response(JSON.stringify(learnItems), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
