import { env } from 'cloudflare:workers';

function runtimeValue(key:string){
  const runtimeEnv=env as unknown as Record<string,unknown>;
  return String(runtimeEnv[key]??process.env[key]??'').trim();
}

export function turnstileSiteKey(){return runtimeValue('TURNSTILE_SITE_KEY');}

export async function verifyTurnstile(request:Request,token:unknown,expectedAction:string){
  const secret=runtimeValue('TURNSTILE_SECRET_KEY');const response=String(token??'').trim();
  if(!secret||!response)return false;
  const payload=new URLSearchParams({secret,response});const remoteIp=request.headers.get('CF-Connecting-IP');if(remoteIp)payload.set('remoteip',remoteIp);
  try{const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:payload});const result=await verification.json() as {success?:boolean;action?:string};return Boolean(result.success&&(!result.action||result.action===expectedAction||result.action==='test'));}catch{return false;}
}
