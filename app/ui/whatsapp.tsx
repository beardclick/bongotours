'use client';
import { useEffect,useState } from 'react';
export function WhatsApp({tour}:{tour?:string}){const [page,setPage]=useState('https://bongoutdoors.com');useEffect(()=>setPage(window.location.href),[]);const message=tour?`Hola Bongo Outdoors, me interesa reservar: ${tour}. Página: ${page}`:`Hola Bongo Outdoors, deseo información sobre sus tours en Panamá. Página: ${page}`;return <a className="whatsapp" href={`https://wa.me/50764467276?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" aria-label="Consultar por WhatsApp"><b>◉</b><span>WhatsApp</span></a>}
