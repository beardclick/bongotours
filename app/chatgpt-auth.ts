import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from 'cloudflare:workers';
import { isUserActive } from './lib/user-profile';

export type ChatGPTUser = {userId:string;displayName:string;email:string;fullName:string|null};
const ACCESS_COOKIE='bongo-access-token';
const REFRESH_COOKIE='bongo-refresh-token';
const SIWC_SIGN_IN_PATH='/signin-with-chatgpt';
const SIWC_SIGN_OUT_PATH='/signout-with-chatgpt';
const CALLBACK_PATH='/callback';

function runtimeValue(key:string){const runtimeEnv=env as unknown as Record<string,unknown>;return String(runtimeEnv[key]??process.env[key]??'').trim()}
export function supabaseConfig(){const url=runtimeValue('SUPABASE_URL').replace(/\/$/,'');const anonKey=runtimeValue('SUPABASE_ANON_KEY');return url&&anonKey?{url,anonKey}:null}
export async function supabaseAuthRequest(path:string,init:RequestInit={}){const config=supabaseConfig();if(!config)throw new Error('Supabase no está configurado.');const requestHeaders=new Headers(init.headers);requestHeaders.set('apikey',config.anonKey);requestHeaders.set('content-type','application/json');return fetch(`${config.url}/auth/v1${path}`,{...init,headers:requestHeaders})}

type Session={access_token?:unknown;refresh_token?:unknown;expires_in?:unknown};
function parseSupabaseUser(user:{id?:string;email?:string;user_metadata?:Record<string,unknown>}):ChatGPTUser|null{if(!user.id||!user.email)return null;const fullName=String(user.user_metadata?.full_name??user.user_metadata?.name??'').trim()||null;return{userId:user.id,email:user.email,fullName,displayName:fullName??user.email}}
function persistSession(store:Awaited<ReturnType<typeof cookies>>,session:Session){const access=String(session.access_token??'');const refresh=String(session.refresh_token??'');if(access)store.set(ACCESS_COOKIE,access,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:Number(session.expires_in)||3600});if(refresh)store.set(REFRESH_COOKIE,refresh,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:60*60*24*30});}
async function getSupabaseUser():Promise<ChatGPTUser|null>{const config=supabaseConfig();if(!config)return null;const store=await cookies();const access=store.get(ACCESS_COOKIE)?.value;if(access){const response=await supabaseAuthRequest('/user',{headers:{Authorization:`Bearer ${access}`},cache:'no-store'});if(response.ok)return parseSupabaseUser(await response.json() as {id?:string;email?:string;user_metadata?:Record<string,unknown>});}const refresh=store.get(REFRESH_COOKIE)?.value;if(!refresh)return null;const refreshed=await supabaseAuthRequest('/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:refresh})});if(!refreshed.ok)return null;const session=await refreshed.json() as Session;const newAccess=String(session.access_token??'');if(!newAccess)return null;try{persistSession(store,session);}catch{return null;}const response=await supabaseAuthRequest('/user',{headers:{Authorization:`Bearer ${newAccess}`},cache:'no-store'});if(!response.ok)return null;return parseSupabaseUser(await response.json() as {id?:string;email?:string;user_metadata?:Record<string,unknown>});}
export async function getChatGPTUser():Promise<ChatGPTUser|null>{const user=await getSupabaseUser();return user&&await isUserActive(user.userId)?user:null}
export async function requireChatGPTUser(returnTo:string):Promise<ChatGPTUser>{const user=await getChatGPTUser();if(user)return user;if(supabaseConfig()){const store=await cookies();if(store.get(REFRESH_COOKIE)?.value)redirect(`/api/auth/refresh?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`)}redirect(chatGPTSignInPath(returnTo))}
export function isAdminEmail(email:string):boolean{const allowed=runtimeValue('ADMIN_EMAILS').split(',').map(value=>value.trim().toLowerCase()).filter(Boolean);if(process.env.NODE_ENV!=='production'&&email.toLowerCase().endsWith('@sites.test'))return true;return allowed.includes(email.trim().toLowerCase())}
export async function requireChatGPTAdmin(returnTo='/admin'):Promise<ChatGPTUser>{const user=await requireChatGPTUser(returnTo);if(isAdminEmail(user.email))return user;redirect('/cuenta?admin=denied')}
export async function isCurrentUserAdmin(){const user=await getChatGPTUser();return Boolean(user&&isAdminEmail(user.email))}
export function chatGPTSignInPath(returnTo:string):string{const safeReturnTo=safeRelativeReturnPath(returnTo);return supabaseConfig()?`/acceso?return_to=${encodeURIComponent(safeReturnTo)}`:`${SIWC_SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`}
export function chatGPTSignOutPath(returnTo='/'):string{const safeReturnTo=safeRelativeReturnPath(returnTo);return supabaseConfig()?`/api/auth/signout?return_to=${encodeURIComponent(safeReturnTo)}`:`${SIWC_SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`}
export const authCookies={access:ACCESS_COOKIE,refresh:REFRESH_COOKIE};
function safeRelativeReturnPath(value:string):string{if(!value.startsWith('/')||value.startsWith('//'))return '/';let url:URL;try{url=new URL(value,'https://app.local')}catch{return '/'}if(url.origin!=='https://app.local')return '/';if([SIWC_SIGN_IN_PATH,SIWC_SIGN_OUT_PATH,CALLBACK_PATH].includes(url.pathname))return '/';return `${url.pathname}${url.search}${url.hash}`}
