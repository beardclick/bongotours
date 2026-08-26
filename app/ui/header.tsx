'use client';
import Link from 'next/link';
import { useState } from 'react';

export function Header({ transparent=false }: { transparent?:boolean }) {
  const [open,setOpen]=useState(false);
  const [submenuOpen,setSubmenuOpen]=useState(false);
  const close=()=>{setOpen(false);setSubmenuOpen(false)};
  return <header className={`site-header ${transparent?'site-header--transparent':''}`}><div className="shell nav">
    <Link href="/" className="brand" aria-label="Bongo Outdoors inicio" onClick={close}><span className="brand__mark"><img src="/images/bongo-logo.png" alt="" /></span><span className="brand__type"><b>BONGO</b><small>OUTDOORS TOURS</small></span></Link>
    <button className="nav-toggle" aria-expanded={open} aria-label="Abrir menú" onClick={()=>setOpen(!open)}><span/><span/></button>
    <nav className={open?'nav-links is-open':'nav-links'} aria-label="Navegación principal">
      <Link href="/" onClick={close}>Inicio</Link><div className={`nav-dropdown ${submenuOpen?'is-open':''}`}><button type="button" aria-expanded={submenuOpen} onClick={()=>setSubmenuOpen(!submenuOpen)}>Bongo <span className="nav-chevron" aria-hidden="true"/></button><div className="dropdown-panel">
        <Link onClick={close} href="/tours">Tours</Link><Link onClick={close} href="/tours?categoria=bike">Bike tours</Link><Link onClick={close} href="/servicios#shuttle">Shuttle Panamá</Link><Link onClick={close} href="/servicios#drones">Servicio de drones</Link><Link onClick={close} href="/tours?destino=pedasi">Tours en Pedasí</Link><Link onClick={close} href="/hospedajes">Hospedaje y cabañas</Link><Link onClick={close} href="/responsabilidad-social">Responsabilidad social</Link><Link onClick={close} href="/derechos-de-autor">Derechos de autor</Link>
      </div></div><Link onClick={close} href="/blog">Blog</Link><Link onClick={close} href="/faqs">FAQs</Link><Link onClick={close} href="/contacto">Contacto</Link>
    </nav>
    <div className="nav-actions"><Link href="/cuenta" className="account-link">Mi cuenta</Link><Link href="/tours" className="button button--small">Reservar <b>↗</b></Link></div>
  </div></header>;
}
