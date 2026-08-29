import { ensureDatabase } from '../../db/runtime';

export async function syncUserProfile(user:{id?:unknown;email?:unknown;user_metadata?:Record<string,unknown>}|null|undefined){
  const userId=String(user?.id??'').trim();
  const email=String(user?.email??'').trim().toLowerCase();
  if(!userId||!email)return;
  const fullName=String(user?.user_metadata?.full_name??user?.user_metadata?.name??'').trim().slice(0,160);
  const now=new Date().toISOString();
  const db=await ensureDatabase();
  await db.prepare(`INSERT INTO user_profiles (user_id,email,full_name,phone,country,city,emergency_contact,marketing_opt_in,created_at,updated_at) VALUES (?,?,?,'','Panamá','','',0,?,?) ON CONFLICT(user_id) DO UPDATE SET email=excluded.email,full_name=CASE WHEN user_profiles.full_name IS NULL OR user_profiles.full_name='' THEN excluded.full_name ELSE user_profiles.full_name END,updated_at=excluded.updated_at`).bind(userId,email,fullName,now,now).run();
}

export async function isUserActive(userId:string){
  try{const db=await ensureDatabase();const row=await db.prepare('SELECT active FROM user_profiles WHERE user_id=?').bind(userId).first<{active:number}>();return row?.active!==0}catch{return true}
}
