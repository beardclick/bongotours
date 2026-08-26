'use client';
import Link from 'next/link';
import { useState } from 'react';

export function Header({ transparent=false }: { transparent?:boolean }) {
  const [open,setOpen]=useState(false);
  return <header className={`site-header ${transparent?'site-header--transparent':''}`}><div className="shell nav">
    <Link href="/" className="brand" aria-label="Bongo Outdoors inicio"><img src="/images/bongo-logo.png" alt="Bongo Outdoors" /></Link>
    <button className="nav-toggle" aria-expanded={open} aria-label="Abrir menú" onClick={()=>setOpen(!open)}><span/><span/></button>
    <nav className={open?'nav-links is-open':'nav-links'} aria-label="Navegación principal">
      <Link href="/">Inicio</Link><div className="nav-dropdown"><button>Bongo <span>⌄</span></button><div className="dropdown-panel">
        <Link href="/tours">Tours</Link><Link href="/tours?categoria=bike">Bike tours</Link><Link href="/servicios#shuttle">Shuttle Panamá</Link><Link href="/servicios#drones">Servicio de drones</Link><Link href="/tours?destino=pedasi">Tours en Pedasí</Link><Link href="/hospedajes">Hospedaje y cabañas</Link><Link href="/responsabilidad-social">Responsabilidad social</Link><Link href="/derechos-de-autor">Derechos de autor</Link>
      </div></div><Link href="/blog">Blog</Link><Link href="/faqs">FAQs</Link><Link href="/contacto">Contacto</Link>
    </nav>
    <div className="nav-actions"><Link href="/cuenta" className="account-link">Mi cuenta</Link><Link href="/tours" className="button button--small">Reservar <b>↗</b></Link></div>
  </div></header>;
}
