import { readFile,writeFile } from 'node:fs/promises';

const source=new URL('../dist/server/wrangler.json',import.meta.url);
const target=new URL('../dist/server/wrangler.cloudflare.json',import.meta.url);
const config=JSON.parse(await readFile(source,'utf8'));
config.name='bongo-outdoors-staging';
config.d1_databases=[{binding:'DB',database_name:'bongo-outdoors-staging',database_id:'c7b4070b-77f0-4e3c-869f-a37eb84270ce'}];
config.r2_buckets=[{binding:'FILES',bucket_name:'bongo-outdoors-staging-files'}];
config.vars={
  ...(config.vars??{}),
  SUPABASE_URL:'https://ysymfuonqcndxuvidlfa.supabase.co',
  SITE_URL:'https://bongo-outdoors-staging.bongoutdoors.workers.dev',
  TURNSTILE_SITE_KEY:'0x4AAAAAAEdcBoTNLErnUbDy',
  MAIL_FROM:'Bongo Outdoors <reservas@bongoutdoors.com>',
};
await writeFile(target,`${JSON.stringify(config,null,2)}\n`);
console.log('Configuración de Cloudflare preparada.');
