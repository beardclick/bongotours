'use client';
import { useEffect, useState } from 'react';
import { SiteLink as Link } from '../../ui/site-link';
import { CART_KEY } from '../../ui/booking-widget';

export default function PagoPaguelo(){
  const [state,setState]=useState<'loading'|'success'|'rejected'|'empty'>('loading');
  const [msg,setMsg]=useState('');
  useEffect(()=>{void(async()=>{
    const params=new URLSearchParams(window.location.search);
    const estado=String(params.get('Estado')||'').toLowerCase();
    const oper=params.get('Oper')||'';
    let checkoutKey=params.get('PARM_1')||'';
    if(!checkoutKey){try{const raw=sessionStorage.getItem('bongo-pending-payment');if(raw)checkoutKey=String((JSON.parse(raw) as {checkoutKey?:string}).checkoutKey||'')}catch{}}
    if(!checkoutKey){setState('empty');return;}
    if(estado!=='aprobada'){sessionStorage.removeItem('bongo-pending-payment');localStorage.removeItem(CART_KEY);setState('rejected');return;}
    try{
      const res=await fetch('/api/bookings/paguelo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({checkoutKey,paymentReference:oper})});
      const data=await res.json() as {orders?:Array<Record<string,unknown>>;contact?:Record<string,unknown>;items?:Array<Record<string,unknown>>;total?:number;subtotal?:number;discount?:number;couponCode?:string;error?:string};
      if(!res.ok||!data.orders?.length)throw new Error(data.error||'No se pudo confirmar la reserva.');
      sessionStorage.setItem('bongo-last-order',JSON.stringify({orders:data.orders,items:data.items??[],contact:data.contact??{},total:data.total??0,subtotal:data.subtotal??0,discount:data.discount??0,couponCode:data.couponCode,createdAt:new Date().toISOString()}));
      localStorage.removeItem(CART_KEY);
      sessionStorage.removeItem('bongo-pending-payment');
      setState('success');
    }catch(e){setMsg(e instanceof Error?e.message:'Ocurrió un error.');setState('empty');}
  })()},[]);
  return <main style={{minHeight:'65vh',display:'grid',placeItems:'center',padding:'40px 16px'}}><section style={{textAlign:'center',maxWidth:480}}>{state==='loading'?<><p style={{fontSize:34}}>⏳</p><h1>Procesando tu pago…</h1><p style={{color:'#55736b'}}>Un momento, estamos confirmando tu reserva.</p></>:state==='success'?<><p style={{fontSize:34}}>✅</p><h1>¡Pago registrado!</h1><p style={{color:'#55736b'}}>Tu reserva quedó registrada y está pendiente de verificación del pago. Te contactaremos para confirmar la disponibilidad.</p><Link className="button button--primary" href="/orden/confirmada">Ver mi pedido →</Link></>:state==='rejected'?<><p style={{fontSize:34}}>❌</p><h1>Pago rechazado</h1><p style={{color:'#55736b'}}>El pago no fue aprobado. Puedes intentarlo de nuevo o pagar en efectivo.</p><Link className="button button--primary" href="/carrito">Volver al carrito</Link></>:<><p style={{fontSize:34}}>⚠️</p><h1>No hay un pago pendiente</h1><p style={{color:'#55736b'}}>{msg||'No encontramos una compra en proceso.'}</p><Link className="button button--primary" href="/tours">Explorar tours</Link></>}</section></main>;
}
