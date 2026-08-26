'use client';

import { FormEvent, useMemo, useState } from 'react';
import { DatePicker } from './date-picker';

type Season = {name:string;start:string;end:string;personPrice?:number;groupPrice?:number};
export type CartItem = {tourSlug:string;tourName:string;tourDate:string;quantity:number;priceMode:'person'|'group';unitPrice:number;total:number;image?:string};
export const CART_KEY = 'bongo_cart';

export function BookingWidget({tourSlug,tourName,personPrice,groupPrice,priceType,seasonPrices,minPeople=1,image}:{tourSlug:string;tourName:string;personPrice:number;groupPrice?:number;priceType:'person'|'group';seasonPrices?:string;minPeople?:number;image?:string}) {
  const mode = priceType;
  const [qty,setQty] = useState(Math.max(1,minPeople));
  const [date,setDate] = useState('');
  const [status,setStatus] = useState('');
  const seasons = useMemo(() => { try { return JSON.parse(seasonPrices || '[]') as Season[]; } catch { return []; } },[seasonPrices]);
  const season = seasons.find(item => date && date >= item.start && date <= item.end);
  const activePerson = season?.personPrice ?? personPrice;
  const activeGroup = season?.groupPrice ?? groupPrice ?? personPrice;
  const unitPrice = mode === 'group' ? activeGroup : activePerson;
  const total = useMemo(() => mode === 'group' ? activeGroup : activePerson * qty,[mode,activeGroup,activePerson,qty]);
  const whatsapp = `https://wa.me/50764467276?text=${encodeURIComponent(`Hola Bongo Outdoors, necesito más información sobre ${tourName}.`)}`;

  function addToCart(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const chosenDate=String(new FormData(e.currentTarget).get('tourDate')||'');
    if (!chosenDate) { setStatus('Selecciona una fecha para continuar.'); return; }
    const item: CartItem = {tourSlug,tourName,tourDate:chosenDate,quantity:qty,priceMode:mode,unitPrice,total,image};
    let current: CartItem[] = [];
    try { current = JSON.parse(localStorage.getItem(CART_KEY) || '[]') as CartItem[]; } catch { current = []; }
    const withoutDuplicate = current.filter(saved => !(saved.tourSlug === tourSlug && saved.tourDate === chosenDate));
    localStorage.setItem(CART_KEY,JSON.stringify([...withoutDuplicate,item]));
    window.location.assign('/carrito');
  }

  return <aside className="booking-card" id="reservar"><p className="eyebrow"><span /> Reserva segura</p><h2>Book now</h2><div className="price-line"><strong>${unitPrice.toFixed(2)}</strong><span> / {mode === 'group' ? 'grupo' : 'persona'}</span></div><div className={`booking-mode booking-mode--${mode}`}>Tarifa fija por {mode === 'group' ? 'grupo' : 'persona'}</div><form onSubmit={addToCart}><label>Fecha<DatePicker value={date} onChange={setDate}/></label>{season && <p className="season-note">✦ Aplica {season.name}</p>}<label>Cantidad de personas<div className="stepper"><button type="button" aria-label="Restar persona" onClick={() => setQty(Math.max(minPeople,qty-1))}>−</button><b>{qty}</b><button type="button" aria-label="Agregar persona" onClick={() => setQty(qty+1)}>+</button></div></label><div className="booking-total"><span>Total estimado</span><strong>${total.toFixed(2)}</strong></div><button className="button button--primary full" type="submit">Book now · Añadir al carrito <b>→</b></button><a className="button button--whatsapp full" href={whatsapp} target="_blank" rel="noreferrer">Más información por WhatsApp <b>↗</b></a><small>No se cobra en línea. Confirmarás el pedido desde el carrito y el pago será en efectivo.</small>{status && <p className="form-status" role="status">{status}</p>}</form></aside>;
}
