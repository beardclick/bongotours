import { ensureDatabase } from '../../db/runtime';
export async function getMediaUrlByName(name:string):Promise<string|null>{
  try{const db=await ensureDatabase();
    const exact=await db.prepare('SELECT key FROM media_meta WHERE lower(name)=lower(?) LIMIT 1').bind(name).first<{key:string}>();
    if(exact)return `/api/files/${exact.key}`;
    const base=name.toLowerCase().replace(/\.[^.]+$/,'').replace(/[^a-z0-9]+/g,'-');
    const partial=await db.prepare('SELECT key FROM media_meta WHERE lower(name) LIKE ? LIMIT 1').bind(`%${base}%`).first<{key:string}>();
    return partial?`/api/files/${partial.key}`:null;
  }catch{return null}
}
