import { NextResponse, type NextRequest } from 'next/server';
import { env } from 'cloudflare:workers';

type Database = { prepare: (sql: string) => { all: () => Promise<{ results?: unknown[] }> } };
let cache: { paths: string[]; at: number } | null = null;
const TTL = 10_000;

async function disabledPaths(): Promise<string[] | null> {
  try {
    if (cache && Date.now() - cache.at < TTL) return cache.paths;
    const db = (env as unknown as { DB?: Database }).DB;
    if (!db) return null;
    const rows = await db.prepare('SELECT path FROM disabled_pages').all();
    const paths = (rows.results ?? [])
      .map(row => String((row as { path?: unknown }).path ?? '').trim())
      .filter(Boolean)
      .map(path => (path === '/' ? '/' : path.replace(/\/+$/, '')));
    cache = { paths, at: Date.now() };
    return paths;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return NextResponse.next();
  const paths = await disabledPaths();
  if (!paths || !paths.length) return NextResponse.next();
  const pathname = request.nextUrl.pathname;
  const clean = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const blocked = paths.some(path => (path === '/' ? clean === '/' : clean === path || clean.startsWith(`${path}/`)));
  if (!blocked) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = '/pagina-no-disponible';
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next|images|files|media|favicon|apple-touch-icon|site.webmanifest|robots.txt|sitemap.xml).*)'],
};
