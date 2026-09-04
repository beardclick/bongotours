'use client';
import { useEffect,useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
export function WhatsApp({tour}:{tour?:string}){const [page,setPage]=useState('https://bongoutdoors.com');useEffect(()=>setPage(window.location.href),[]);const message=tour?`Hola Bongo Outdoors, me interesa reservar: ${tour}. Página: ${page}`:`Hola Bongo Outdoors, deseo información sobre sus tours en Panamá. Página: ${page}`;return <a className="whatsapp" href={`https://wa.me/50760909741?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" aria-label="Consultar por WhatsApp"><FaWhatsapp aria-hidden="true"/><span>WhatsApp</span></a>}
