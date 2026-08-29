'use client';
import { useRef,useState } from 'react';
import { compressImage } from '../lib/image-compression';

export function ImageUpload({name,initial='',label='Imagen',onChange}:{name:string;initial?:string;label?:string;onChange?:(url:string)=>void}){
  const [url,setUrl]=useState(initial);
  const [dragging,setDragging]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const inputRef=useRef<HTMLInputElement>(null);
  async function handle(file:File){
    if(!file.type.startsWith('image/')){setError('Solo se permiten imágenes.');return;}
    setBusy(true);setError('');
    try{
      const optimized=await compressImage(file);
      const data=new FormData();data.append('file',optimized);
      const res=await fetch('/api/uploads',{method:'POST',body:data});
      const json=await res.json() as {url?:string;error?:string};
      if(!res.ok)throw new Error(json.error||'Falló la carga');
      setUrl(json.url||'');onChange?.(json.url||'');
    }catch(e){setError(e instanceof Error?e.message:'No se pudo subir la imagen.');}
    finally{setBusy(false);}
  }
  return <div className={`image-upload${dragging?' is-dragging':''}`} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);const f=e.dataTransfer.files?.[0];if(f)void handle(f);}}>
    <input type="hidden" name={name} value={url}/>
    <input ref={inputRef} type="file" accept="image/*" hidden onChange={e=>{const f=e.target.files?.[0];if(f)void handle(f);e.target.value='';}}/>
    {url?<img className="image-upload__preview" src={url} alt="Vista previa"/>:<div className="image-upload__empty"><span>⇪</span><b>{label}</b><small>Arrastra o haz click para subir</small></div>}
    <button type="button" className="image-upload__action" onClick={()=>inputRef.current?.click()}>{busy?'Subiendo…':url?'Cambiar imagen':'Subir imagen'}</button>
    {error&&<small className="image-upload__error">{error}</small>}
  </div>;
}
