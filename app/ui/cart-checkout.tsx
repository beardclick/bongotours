'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CART_KEY, type CartItem } from './booking-widget';
import { SiteLink as Link } from './site-link';

export function CartCheckout({isLoggedIn=false}:{isLoggedIn?:boolean}) {
  const [items,setItems] = useState<CartItem[]>([]);
  const [ready,setReady] = useState(false);
  const [status,setStatus] = useState('');
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem(CART_KEY) || '[]') as CartItem[]); } catch { setItems([]); } setReady(true); },[]);
  const total = useMemo(() => items.reduce((sum,item) => sum + item.total,0),[items]);
  function remove(index:number) { const next=items.filter((_,i)=>i!==index); setItems(next); localStorage.setItem(CART_KEY,JSON.stringify(next)); window.dispatchEvent(new Event('bongo-cart-updated')); }
  async function confirm(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!items.length) return;
    setStatus('Confirmando tu pedido…');
    const contact=Object.fromEntries(new FormData(e.currentTarget).entries());
    const references:string[]=[];const orders:Record<string,unknown>[]=[];
    for (const item of items) {
      const response=await fetch('/api/bookings',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...contact,...item})});
      const data=await response.json() as {reference?:string;order?:Record<string,unknown>;error?:string};
      if(!response.ok){setStatus(data.error??'No pudimos confirmar el pedido.');return;}
      if(data.reference)references.push(data.reference);if(data.order)orders.push(data.order);
    }
    sessionStorage.setItem('bongo-last-order',JSON.stringify({orders,items,contact,total,createdAt:new Date().toISOString()}));localStorage.removeItem(CART_KEY);setItems([]);window.location.assign('/orden/confirmada');
  }
  if(!ready)return <div className="cart-empty">Cargando carrito…</div>;
  if(!items.length)return <div className="cart-empty"><span>✓</span><h2>{status?'Pedido enviado':'Tu carrito está vacío'}</h2><p>{status||'Selecciona una fecha desde la página de un tour para comenzar.'}</p><Link className="button button--primary" href="/tours">Explorar tours</Link></div>;
  return <div className="cart-layout"><section className="cart-items"><h2>Tu selección</h2>{items.map((item,index)=><article key={`${item.tourSlug}-${item.tourDate}`}><img src={item.image||'/images/bongo-hero.png'} alt=""/><div><h3>{item.tourName}</h3><p>▣ {item.tourDate} · ♙ {item.quantity} persona{item.quantity===1?'':'s'}</p><small>Tarifa por {item.priceMode==='group'?'grupo':'persona'}</small></div><strong>${item.total.toFixed(2)}</strong><button type="button" onClick={()=>remove(index)} aria-label={`Quitar ${item.tourName}`}>×</button></article>)}</section><aside className="cart-summary"><h2>Confirmar pedido</h2><div className="cart-summary__total"><span>Total estimado</span><strong>${total.toFixed(2)}</strong></div>{!isLoggedIn&&<div className="cart-account-note"><span>¿Tienes cuenta?</span><div><Link href="/acceso?return_to=/carrito">Inicia sesión</Link><span>·</span><Link href="/acceso?return_to=/carrito">Regístrate</Link></div></div>}<form onSubmit={confirm}><label>Nombre completo<input name="customerName" required /></label><label>Correo electrónico<input name="email" type="email" required /></label><label>WhatsApp o teléfono<input name="phone" required placeholder="+507 ..." /></label><div className="cash-method"><span>$</span><div><b>Pago contra entrega</b><small>Efectivo al confirmar la experiencia</small></div><strong>Único método</strong></div><button className="button button--primary full" type="submit">Confirmar pedido <b>→</b></button><small>No se solicitará tarjeta. Nuestro equipo confirmará disponibilidad y detalles antes de aceptar el pedido.</small><a className="button button--whatsapp full" target="_blank" rel="noreferrer" href={`https://wa.me/50764467276?text=${encodeURIComponent('Hola Bongo Outdoors, necesito ayuda con mi carrito de reserva.')}`}>Ayuda por WhatsApp</a>{status&&<p className="form-status" role="status">{status}</p>}</form></aside></div>;
}
