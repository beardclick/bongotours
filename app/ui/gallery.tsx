'use client';

import { useEffect, useState } from 'react';

export function Gallery({images,title}:{images:string[];title:string}) {
  const [index,setIndex] = useState<number|null>(null);
  const safe = images.filter(Boolean);
  const count = safe.length;
  const current = index===null ? 0 : index;
  const open = index!==null && index>=0 && index<count;
  const show = (delta:number) => setIndex(prev => prev===null ? null : (prev+delta+count)%count);
  useEffect(() => {
    if(index===null) return;
    const onKey = (e:KeyboardEvent) => {
      if(e.key==='Escape') setIndex(null);
      else if(e.key==='ArrowRight') show(1);
      else if(e.key==='ArrowLeft') show(-1);
    };
    window.addEventListener('keydown',onKey);
    document.body.style.overflow='hidden';
    return () => { window.removeEventListener('keydown',onKey); document.body.style.overflow=''; };
  },[index,count]);
  if(!count) return null;
  return (
    <>
      <div className="gallery" id="galeria">
        {safe.map((src,i) => (
          <button key={`${src}-${i}`} type="button" className="gallery__thumb" onClick={()=>setIndex(i)} aria-label={`Ampliar imagen ${i+1} de ${title}`}>
            <img src={src} alt={`${title}, imagen ${i+1}`} loading={i>0?'lazy':'eager'} />
          </button>
        ))}
      </div>
      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Galería de ${title}`} onClick={()=>setIndex(null)}>
          <button type="button" className="lightbox__close" onClick={()=>setIndex(null)} aria-label="Cerrar galería">×</button>
          <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={(e)=>{e.stopPropagation();show(-1);}} aria-label="Imagen anterior">‹</button>
          <figure className="lightbox__figure" onClick={(e)=>e.stopPropagation()}>
            <img src={safe[current]} alt={`${title}, imagen ${current+1}`} />
            <figcaption>{title} · {current+1} de {count}</figcaption>
          </figure>
          <button type="button" className="lightbox__nav lightbox__nav--next" onClick={(e)=>{e.stopPropagation();show(1);}} aria-label="Imagen siguiente">›</button>
        </div>
      )}
    </>
  );
}
