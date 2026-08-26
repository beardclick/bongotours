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
  return <div className="share-actions" aria-label={`Compartir ${kind}`}><span>Compartir</span><button type="button" onClick={share} aria-label="Compartir o copiar enlace"><b>↗</b>{copied?'Copiado':'Enlace'}</button><a target="_blank" rel="noreferrer" aria-label="Compartir por WhatsApp" href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`}><b>◉</b>WhatsApp</a><a target="_blank" rel="noreferrer" aria-label="Compartir en Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}><b>f</b>Facebook</a><a target="_blank" rel="noreferrer" aria-label="Compartir en X" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}><b>𝕏</b>X</a></div>;
}
