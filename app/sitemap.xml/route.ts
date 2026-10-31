import { ensureDatabase } from '../../db/runtime';
import { tours } from '../data';
import { defaultServices } from '../services-data';
import { defaultStays } from '../lodgings-data';

export const dynamic = 'force-dynamic';
const origin = 'https://bongoutdoors.com';
const escapeXml = (value: string) => value.replace(/[<>&"']/g, char => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[char]!));

export async function GET() {
  try {
    const db = await ensureDatabase();
    const entities = [
      { table:'tours', path:'tours', defaults:tours.map(item => item.slug), visible:"status='published'" },
      { table:'services', path:'servicios', defaults:defaultServices.map(item => item.slug), visible:'active=1' },
      { table:'lodgings', path:'hospedajes', defaults:defaultStays.map(item => item.slug), visible:'active=1' },
      { table:'posts', path:'blog', defaults:['que-llevar-volcan-baru','islas-boca-chica','cafe-geisha'], visible:"status='published'" },
    ];
    const paths = new Set(['/', '/tours', '/servicios', '/hospedajes', '/blog', '/faqs', '/contacto', '/politicas', '/responsabilidad-social', '/derechos-de-autor', '/relocation-panama']);
    const deleted = await db.prepare('SELECT entity,content_key FROM content_tombstones').all<{entity:string;content_key:string}>();
    await Promise.all(entities.map(async entity => {
      // Existing unpublished rows must never fall back to their demo version.
      const rows = await db.prepare(`SELECT slug, CASE WHEN ${entity.visible} THEN 1 ELSE 0 END AS visible FROM ${entity.table}`).all<{slug:string;visible:number}>();
      const existing = new Set(rows.results.map(row => row.slug));
      const removed = new Set(deleted.results.filter(row => row.entity === entity.table).map(row => row.content_key));
      const slugs = [...rows.results.filter(row => row.visible === 1).map(row => row.slug), ...entity.defaults.filter(slug => !existing.has(slug) && !removed.has(slug))];
      for (const slug of slugs) paths.add(`/${entity.path}/${encodeURIComponent(slug)}`);
    }));
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths].sort().map(path => `  <url><loc>${escapeXml(origin + path)}</loc></url>`).join('\n')}\n</urlset>`;
    return new Response(xml, {headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'no-store'}});
  } catch (error) {
    console.error('Sitemap generation failed', error);
    // A temporary database failure must not replace the full sitemap with an incomplete one.
    return new Response('Sitemap temporarily unavailable', {status:503,headers:{'Retry-After':'60','Cache-Control':'no-store'}});
  }
}
