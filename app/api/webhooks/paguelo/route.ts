import { NextResponse } from 'next/server';
import { ensureDatabase } from '../../../../db/runtime';
import { finalizePagueloOrder } from '../../../lib/paguelo-finalize';

// IPs de Paguelo Fácil (Live + Demo). No hay firma HMAC/token, así que esta es la capa de verificación.
const ALLOWED_IPS=new Set(['44.240.22.135','52.88.2.249','54.177.48.203','54.176.141.69']);

export async function POST(request:Request){
  try{
    const ip=String(request.headers.get('CF-Connecting-IP')??'').trim();
    if(!ip||!ALLOWED_IPS.has(ip))return NextResponse.json({ok:false,error:'Origen no autorizado.'},{status:401});
    const contentType=request.headers.get('content-type')||'';
    let body:Record<string,unknown>={};
    if(contentType.includes('application/json')){body=await request.json() as Record<string,unknown>;}
    else{const text=await request.text();const params=new URLSearchParams(text);body={};for(const [k,v] of params.entries())body[k]=v;}
    const db=await ensureDatabase();
    await db.prepare(`INSERT INTO webhook_events (provider,payload,created_at) VALUES (?,?,?)`).bind('paguelo',JSON.stringify(body),new Date().toISOString()).run();
    const checkoutKey=String(body.PARM_1??body.parm_1??'').trim();
    const oper=String(body.Oper??body.oper??'').trim();
    const estado=String(body.Estado??body.estado??body.status??'').toLowerCase();
    if(!checkoutKey||!oper)return NextResponse.json({ok:true,ignored:'sin referencia'});
    if(estado!=='aprobada'&&estado!=='approved')return NextResponse.json({ok:true,ignored:estado});
    const result=await finalizePagueloOrder(checkoutKey,oper,true);
    if(!result.ok)return NextResponse.json({ok:false,error:result.error},{status:result.status||400});
    return NextResponse.json({ok:true,orders:result.orders.length});
  }catch(e){return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Error'},{status:400});}
}
