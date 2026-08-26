'use client';
import { useEffect,useState } from 'react';

export function ShareButtons({title}:{title:string}){
  const [copied,setCopied]=useState(false);
  const [url,setUrl]=useState('');
  useEffect(()=>setUrl(window.location.href),[]);
  async function share(){
    try{if(navigator.share){await navigator.share({title,text:`Mira este tour de Bongo Outdoors: ${title}`,url});return;}
    await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{/* El usuario puede cancelar el diálogo nativo. */}
  }
  return <div className="share-actions" aria-label="Compartir tour"><span>Compartir:</span><button type="button" onClick={share}>{copied?'Enlace copiado ✓':'Compartir enlace'}</button><a target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`}>WhatsApp</a><a target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}>Facebook</a></div>;
}
