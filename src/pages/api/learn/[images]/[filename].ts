import fs from 'fs';
import path from 'path';
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { filename } = params!;

  const imagePath = path.join(
    process.cwd(),
    'src',
    'data',
    'learn',
    'data',
    'images',
    filename
  );

  if (!fs.existsSync(imagePath)) {
    return new Response('Image not found', { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType =
    ext === '.png' ? 'image/png'
    : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
    : ext === '.gif' ? 'image/gif'
    : 'application/octet-stream';

  return new Response(fs.readFileSync(imagePath), {
    status: 200,
    headers: { 'Content-Type': contentType },
  });
};
