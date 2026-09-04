import { NextResponse } from 'next/server';
import { verifyPayPalWebhookSignature } from '../../../lib/paypal';
import { finalizePayPalOrder } from '../../../lib/paypal-finalize';
export async function POST(request:Request){
  const rawBody=await request.text();
  if(!await verifyPayPalWebhookSignature(request,rawBody))return NextResponse.json({error:'Firma inválida.'},{status:401});
  let event:Record<string,unknown>;
  try{event=JSON.parse(rawBody) as Record<string,unknown>;}catch{return NextResponse.json({error:'Cuerpo inválido.'},{status:400});}
  const eventType=String(event.event_type??'');
  if(eventType!=='PAYMENT.CAPTURE.COMPLETED')return NextResponse.json({ok:true,ignored:eventType});
  const resource=(event.resource??{}) as Record<string,unknown>;
  const supplementary=(resource.supplementary_data??{}) as Record<string,unknown>;
  const relatedIds=(supplementary.related_ids??{}) as Record<string,unknown>;
  const orderId=String(relatedIds.order_id??resource.id??'');
  if(!orderId)return NextResponse.json({ok:true,ignored:'sin orderId'});
  const result=await finalizePayPalOrder(orderId);
  if(!result.ok)return NextResponse.json({error:result.error},{status:result.status||400});
  return NextResponse.json({ok:true,orders:result.orders.length});
}
