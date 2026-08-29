'use client';
import { useEffect,useState } from 'react';
import { FaCartShopping,FaTrash } from 'react-icons/fa6';
import { SiteLink as Link } from './site-link';
import { CART_KEY, type CartItem } from './booking-widget';

export function CartNav({variant}:{variant:'desktop'|'mobile'}){
  const [items,setItems]=useState<CartItem[]>([]);
  const [open,setOpen]=useState(false);
  const count=items.length;
  const total=items.reduce((sum,item)=>sum+item.total,0);

  useEffect(()=>{
    const refresh=()=>{try{const parsed=JSON.parse(localStorage.getItem(CART_KEY)||'[]');setItems(Array.isArray(parsed)?parsed:[])}catch{setItems([])}};
    refresh();
    window.addEventListener('storage',refresh);
    window.addEventListener('bongo-cart-updated',refresh);
    return()=>{window.removeEventListener('storage',refresh);window.removeEventListener('bongo-cart-updated',refresh)};
  },[]);

  function remove(index:number){const next=items.filter((_,i)=>i!==index);setItems(next);localStorage.setItem(CART_KEY,JSON.stringify(next));window.dispatchEvent(new Event('bongo-cart-updated'));}

  const badge=count>0?<span className="cart-badge">{count}</span>:null;
  const dropdown=<CartDropdown items={items} total={total} onNavigate={()=>setOpen(false)} onRemove={remove}/>;

  if(variant==='desktop'){
    return <div className="cart-nav" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}><Link href="/carrito" className="cart-link" aria-label="Ver carrito"><FaCartShopping size={15}/><span>Carrito</span>{badge}</Link>{open&&dropdown}</div>;
  }
  return <div className="cart-nav cart-nav--mobile"><Link href="/carrito" aria-label="Ver carrito" aria-expanded={open} onClick={(e)=>{e.preventDefault();setOpen(v=>!v);}}><FaCartShopping/>{badge}</Link>{open&&dropdown}</div>;
}

function CartDropdown({items,total,onNavigate,onRemove}:{items:CartItem[];total:number;onNavigate:()=>void;onRemove:(index:number)=>void}){
  return <div className="cart-dropdown" role="dialog" aria-label="Resumen del carrito">
    <div className="cart-dropdown__head"><b>Tu carrito</b>{items.length>0&&<span>{items.length} {items.length===1?'artículo':'artículos'}</span>}</div>
    {items.length===0
      ? <div className="cart-dropdown__empty"><p>Tu carrito está vacío.</p><Link className="button button--primary" href="/tours" onClick={onNavigate}>Explorar tours</Link></div>
      : <><div className="cart-dropdown__items">{items.slice(0,4).map((item,index)=><div className="cart-dropdown__item" key={`${item.tourSlug}-${item.tourDate}`}><img src={item.image||'/images/bongo-hero.png'} alt=""/><div><b>{item.tourName}</b><small>{item.tourDate} · {item.quantity} {item.quantity===1?'persona':'personas'}</small></div><strong>${item.total.toFixed(2)}</strong><button type="button" className="cart-dropdown__remove" aria-label={`Quitar ${item.tourName}`} onClick={()=>onRemove(index)}><FaTrash/></button></div>)}</div><div className="cart-dropdown__total"><span>Total estimado</span><strong>${total.toFixed(2)}</strong></div><Link className="button button--primary" href="/carrito" onClick={onNavigate}>Ver carrito y confirmar <b>→</b></Link>{items.length>4&&<small className="cart-dropdown__more">+{items.length-4} artículos más</small>}</>}
  </div>;
}
