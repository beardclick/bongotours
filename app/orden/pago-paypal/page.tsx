'use client';

import { useEffect, useState } from 'react';
import { SiteLink as Link } from '../../ui/site-link';
import { CART_KEY } from '../../ui/booking-widget';

export default function PagoPayPal(){
  const [state,setState]=useState<'loading'|'success'|'error'|'empty'>('loading');
  const [message,setMessage]=useState('');

  useEffect(()=>{void(async()=>{
    const orderId=new URLSearchParams(window.location.search).get('token');
    if(!orderId){setState('empty');return}
    try{
      const capture=await fetch('/api/payments/paypal/capture',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({orderId})});
      const captureData=await capture.json() as {success?:boolean;reference?:string;message?:string};
      if(!capture.ok||!captureData.success)throw new Error(captureData.message||'PayPal no confirmó el pago.');
      const booking=await fetch('/api/bookings/paypal',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({orderId,paymentReference:captureData.reference||orderId})});
      const bookingData=await booking.json() as {orders?:Array<Record<string,unknown>>;contact?:Record<string,unknown>;items?:Array<Record<string,unknown>>;total?:number;subtotal?:number;discount?:number;couponCode?:string;error?:string};
      if(!booking.ok||!bookingData.orders?.length)throw new Error(bookingData.error||'El pago se confirmó, pero no pudimos registrar la reserva.');
      sessionStorage.setItem('bongo-last-order',JSON.stringify({orders:bookingData.orders,items:bookingData.items??[],contact:bookingData.contact??{},total:bookingData.total??0,subtotal:bookingData.subtotal??0,discount:bookingData.discount??0,couponCode:bookingData.couponCode,createdAt:new Date().toISOString()}));
      localStorage.removeItem(CART_KEY);sessionStorage.removeItem('bongo-pending-paypal');setState('success');
    }catch(error){setMessage(error instanceof Error?error.message:'Ocurrió un error.');setState('error')}
  })()},[]);

  return <main className="payment-result"><section>{state==='loading'?<><span>⏳</span><h1>Confirmando PayPal…</h1><p>Estamos verificando tu pago y registrando el pedido.</p></>:state==='success'?<><span>✅</span><h1>¡Pago y pedido registrados!</h1><p>La reserva quedó registrada y está pendiente de confirmación. Te contactaremos para confirmar la disponibilidad.</p><Link className="button button--primary" href="/orden/confirmada">Ver mi pedido →</Link></>:state==='error'?<><span>⚠️</span><h1>El pedido necesita atención</h1><p>{message}</p><button className="button button--primary" type="button" onClick={()=>window.location.reload()}>Reintentar registro</button><Link className="button" href="/contacto">Contactar a Bongo</Link></>:<><span>◇</span><h1>No encontramos los datos del pago</h1><p>Si PayPal confirmó el cobro, contacta a Bongo para localizarlo con la referencia de PayPal.</p><Link className="button button--primary" href="/contacto">Contactar a Bongo</Link></>}</section></main>;
}
