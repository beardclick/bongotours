import { env } from 'cloudflare:workers';
function runtimeValue(key:string){return String((env as unknown as Record<string,unknown>)[key]??'').trim()}
const baseUrl=()=>runtimeValue('PAGUELO_ENV')==='production'?'https://secure.paguelofacil.com':'https://sandbox.paguelofacil.com';
function hexEncode(value:string){return value.split('').map(c=>c.charCodeAt(0).toString(16).padStart(2,'0').toUpperCase()).join('')}
export type PagueloLink={success:boolean;url?:string;code?:string;message?:string};
export async function pagueloCreateLink(p:{amount:number;description:string;returnUrl:string;parm1?:string}):Promise<PagueloLink>{
  const cclw=runtimeValue('PAGUELO_CCLW');
  if(!cclw)return{success:false,message:'Paguelo Fácil no está configurado.'};
  const params=new URLSearchParams();
  params.set('CCLW',cclw);
  params.set('CMTN',Number(p.amount).toFixed(2));
  params.set('CDSC',p.description.slice(0,150));
  params.set('RETURN_URL',hexEncode(p.returnUrl));
  if(p.parm1)params.set('PARM_1',p.parm1.slice(0,150));
  params.set('CARD_TYPE','CARD');
  params.set('EXPIRES_IN','3600');
  try{
    const res=await fetch(`${baseUrl()}/LinkDeamon.cfm`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Accept':'*/*'},body:params.toString()});
    const data=await res.json() as {success?:boolean;message?:string;data?:{url?:string;code?:string}};
    return{success:Boolean(data?.success),url:data?.data?.url,code:data?.data?.code,message:data?.message};
  }catch(e){return{success:false,message:e instanceof Error?e.message:'Error de red al contactar Paguelo Fácil.'}}
}
