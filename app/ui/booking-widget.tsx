'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { DatePicker } from './date-picker';

type Season = {name:string;start:string;end:string;personPrice?:number;groupPrice?:number};
export type CartItem = {tourSlug:string;tourName:string;tourDate:string;quantity:number;priceMode:'person'|'group';unitPrice:number;total:number;image?:string;minPeople?:number};
export const CART_KEY = 'bongo_cart';

export function BookingWidget({tourSlug,tourName,personPrice,groupPrice,priceType,seasonPrices,minPeople=1,image,priceOnRequest}:{tourSlug:string;tourName:string;personPrice:number;groupPrice?:number;priceType:'person'|'group';seasonPrices?:string;minPeople?:number;image?:string;priceOnRequest?:boolean}) {
  const mode = priceType;
  const [qty,setQty] = useState(minPeople);
  const [date,setDate] = useState('');
  const [status,setStatus] = useState('');
  useEffect(()=>{try{const saved=JSON.parse(sessionStorage.getItem(`bongo-selection:${tourSlug}`)||'null');if(saved){setQty(Math.max(minPeople,Number(saved.quantity)||minPeople));setDate(String(saved.date||''));}}catch{}},[tourSlug,minPeople]);
  function rememberSelection(quantity:number,chosenDate:string){try{sessionStorage.setItem(`bongo-selection:${tourSlug}`,JSON.stringify({quantity,date:chosenDate}));}catch{}}
  const seasons = useMemo(() => { try { return JSON.parse(seasonPrices || '[]') as Season[]; } catch { return []; } },[seasonPrices]);
  const season = seasons.find(item => date && date >= item.start && date <= item.end);
  const activePerson = season?.personPrice ?? personPrice;
  const activeGroup = season?.groupPrice ?? groupPrice ?? personPrice;
  const unitPrice = mode === 'group' ? activeGroup : activePerson;
  const total = useMemo(() => mode === 'group' ? activeGroup : activePerson * qty,[mode,activeGroup,activePerson,qty]);
  const whatsapp = `https://wa.me/50760909741?text=${encodeURIComponent(`Hola Bongo Outdoors, necesito más información sobre ${tourName}.`)}`;

  function addToCart(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const chosenDate=String(new FormData(e.currentTarget).get('tourDate')||'');
    if (!chosenDate) { setStatus('Selecciona una fecha para continuar.'); return; }
    if(qty<minPeople){setStatus(`Este tour requiere un mínimo de ${minPeople} personas.`);return;}
    rememberSelection(qty,chosenDate);
    const item: CartItem = {tourSlug,tourName,tourDate:chosenDate,quantity:qty,priceMode:mode,unitPrice,total,image,minPeople};
    let current: CartItem[] = [];
    try { current = JSON.parse(localStorage.getItem(CART_KEY) || '[]') as CartItem[]; } catch { current = []; }
    const withoutDuplicate = current.filter(saved => !(saved.tourSlug === tourSlug && saved.tourDate === chosenDate));
    localStorage.setItem(CART_KEY,JSON.stringify([...withoutDuplicate,item]));
    window.location.assign('/carrito');
  }

  return <aside className="booking-card" id="reservar">{priceOnRequest?<><p className="eyebrow"><span /> Reserva segura</p><h2>Precio a consultar</h2><p className="booking-mode booking-mode--consult">Indícanos la fecha y el número de personas por WhatsApp y te confirmamos la tarifa disponible.</p><a className="button button--whatsapp full" href={whatsapp} target="_blank" rel="noreferrer">Consultar por WhatsApp <b>↗</b></a><small>Nuestro equipo confirmará disponibilidad y precio. Luego podrás pagar con tarjeta al completar tu reserva.</small></>:<><p className="eyebrow"><span /> Reserva segura</p><h2>Book now</h2><div className="price-line"><strong>${unitPrice.toFixed(2)}</strong><span> / {mode === 'group' ? 'grupo' : 'persona'}</span></div><div className={`booking-mode booking-mode--${mode}`}>Tarifa fija por {mode === 'group' ? 'grupo' : 'persona'}</div><form onSubmit={addToCart}><label>Fecha<DatePicker value={date} onChange={value=>{setDate(value);rememberSelection(qty,value)}}/></label>{season && <p className="season-note">✦ Aplica {season.name}</p>}<label>Cantidad de personas<div className="stepper"><button type="button" aria-label="Restar persona" onClick={() => {const next=Math.max(minPeople,qty-1);setQty(next);rememberSelection(next,date)}}>−</button><b>{qty}</b><button type="button" aria-label="Agregar persona" onClick={() => {setQty(qty+1);rememberSelection(qty+1,date)}}>+</button></div></label><div className="booking-total"><span>Total estimado</span><strong>${total.toFixed(2)}</strong></div><button className="button button--primary full" type="submit">Book now · Añadir al carrito <b>→</b></button><a className="button button--whatsapp full" href={whatsapp} target="_blank" rel="noreferrer">Más información por WhatsApp <b>↗</b></a><small>Completa tu reserva desde el carrito y paga en línea con tarjeta. También puedes elegir efectivo entre las opciones disponibles.</small>{status && <p className="form-status" role="status">{status}</p>}</form></>}</aside>;
}
