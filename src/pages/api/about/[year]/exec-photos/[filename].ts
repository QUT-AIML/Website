import fs from 'fs';
import path from 'path';
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { year, filename } = params!;
  const imagePath = path.join(
    process.cwd(),
    'src',
    'data',
    'about',
    year,
    'exec-photos',
    filename
  );

  if (!fs.existsSync(imagePath)) {
    return new Response('Image not found', { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = ext === '.png' ? 'image/png'
                     : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
                     : ext === '.gif' ? 'image/gif'
                     : 'application/octet-stream';

  const imageBuffer = fs.readFileSync(imagePath);
  return new Response(imageBuffer, {
    status: 200,
    headers: { 'Content-Type': contentType },
  });
};
