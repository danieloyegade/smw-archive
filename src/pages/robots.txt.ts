import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemap = site ? new URL('sitemap-index.xml', site).href : undefined;
  const body = ['User-agent: *', 'Allow: /', ...(sitemap ? [`Sitemap: ${sitemap}`] : []), ''].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
