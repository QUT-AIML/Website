import fs from 'fs';
import path from 'path';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const basePath = path.join(process.cwd(), 'src', 'data', 'events');

  if (!fs.existsSync(basePath)) {
    return new Response('Events folder not found', { status: 404 });
  }

  const semesters = fs.readdirSync(basePath).filter(sem =>
    fs.statSync(path.join(basePath, sem)).isDirectory()
  );

  const baseUrl = new URL(request.url).origin;
  const allEvents: Record<string, any[]> = {};

  for (const sem of semesters) {
    const semPath = path.join(basePath, sem);
    const files = fs.readdirSync(semPath).filter(f => f.endsWith('.json'));

    allEvents[sem] = files.map(file => {
      const eventData = JSON.parse(
        fs.readFileSync(path.join(semPath, file), 'utf-8')
      );

      // 🔹 Main image
      if (eventData.image) {
        eventData.image =
          `${baseUrl}/api/events/${encodeURIComponent(sem)}/images/${encodeURIComponent(eventData.image)}`;
      }

      // 🔹 Gallery images
      if (Array.isArray(eventData.gallery)) {
        eventData.gallery = eventData.gallery.map(item => ({
          ...item,
          src: `${baseUrl}/api/events/${encodeURIComponent(sem)}/images/${encodeURIComponent(item.src)}`
        }));
      }

      return eventData;
    });
  }

  return new Response(JSON.stringify(allEvents), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
