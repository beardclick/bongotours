'use client';
import { useEffect,useState } from 'react';

export function ShareButtons({title,kind='experiencia'}:{title:string;kind?:string}){
  const [copied,setCopied]=useState(false);
  const [url,setUrl]=useState('');
  useEffect(()=>setUrl(window.location.href),[]);
  async function share(){
    try{if(navigator.share){await navigator.share({title,text:`Mira esta ${kind} de Bongo Outdoors: ${title}`,url});return;}
    await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{/* El usuario puede cancelar el diálogo nativo. */}
  }
  return <div className="share-actions share-actions--icons" aria-label={`Compartir ${kind}`}><button type="button" onClick={share} aria-label={copied?'Enlace copiado':'Compartir o copiar enlace'} title={copied?'Copiado':'Compartir'}><b>↗</b></button><a target="_blank" rel="noreferrer" aria-label="Compartir por WhatsApp" title="WhatsApp" href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`}><b>◉</b></a><a target="_blank" rel="noreferrer" aria-label="Compartir en Facebook" title="Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}><b>f</b></a><a target="_blank" rel="noreferrer" aria-label="Compartir en X" title="X" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}><b>𝕏</b></a></div>;
}
