import { NextResponse } from 'next/server';
import { finalizePagueloOrder } from '../../../lib/paguelo-finalize';
export async function POST(request:Request){
  try{
    const body=await request.json() as Record<string,unknown>;
    const checkoutKey=String(body.checkoutKey??'').trim();
    const paymentReference=String(body.paymentReference??'').trim();
    if(!checkoutKey||!paymentReference)return NextResponse.json({error:'Faltan datos de la transacción.'},{status:400});
    const result=await finalizePagueloOrder(checkoutKey,paymentReference);
    if(!result.ok)return NextResponse.json({error:result.error},{status:result.status||400});
    return NextResponse.json({ok:true,orders:result.orders,recovered:result.recovered,contact:result.contact,items:result.items,total:result.total,subtotal:result.subtotal,discount:result.discount,couponCode:result.couponCode});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'No se pudo registrar el pedido pagado.'},{status:500})}
}
