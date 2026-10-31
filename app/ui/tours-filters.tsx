'use client';
import { useState } from 'react';
import { SiteLink as Link } from './site-link';

type FilterItem={name:string;slug:string};

export function ToursFilters({categories,destinations,categoria,destino}:{categories:FilterItem[];destinations:FilterItem[];categoria:string;destino:string}){
  const [open,setOpen]=useState(false);
  const close=()=>setOpen(false);
  const filters=<>
    <span className="filter-group-title">Categoría</span>
    <Link className={!categoria&&!destino?'active':''} href="/tours" onClick={close}>Todos</Link>
    {categories.map(c=><Link className={categoria===c.slug?'active':''} key={c.slug} href={`/tours?categoria=${c.slug}`} onClick={close}>{c.name}</Link>)}
    <span className="filter-group-title">Destino</span>
    {destinations.map(d=><Link className={destino===d.slug?'active':''} key={d.slug} href={`/tours?destino=${d.slug}`} onClick={close}>{d.name}</Link>)}
  </>;
  return <>
    <button type="button" className="tours-filter-toggle" onClick={()=>setOpen(true)} aria-label="Abrir filtros"><span aria-hidden="true">☰</span> Filtros</button>
    <div className={`tours-filter-overlay${open?' is-open':''}`} onClick={close} aria-hidden="true"/>
    <aside className={`tours-filters${open?' is-open':''}`}>
      <div className="tours-filters__head"><b>Filtros</b><button type="button" onClick={close} aria-label="Cerrar">×</button></div>
      {filters}
    </aside>
  </>;
}
