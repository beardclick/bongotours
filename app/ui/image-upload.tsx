'use client';
import { useRef,useState } from 'react';
import { compressImage } from '../lib/image-compression';

export function ImageUpload({name,initial='',label='Imagen',onChange}:{name:string;initial?:string;label?:string;onChange?:(url:string)=>void}){
  const [url,setUrl]=useState(initial);
  const [dragging,setDragging]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [pickerOpen,setPickerOpen]=useState(false);
  const [library,setLibrary]=useState<Array<{key:string;name:string;alt:string;contentType:string}>>([]);
  const [loading,setLoading]=useState(false);
  const inputRef=useRef<HTMLInputElement>(null);
  const isImage=(f:{contentType:string;name:string})=>f.contentType.startsWith('image/')||/\.(png|jpe?g|webp|gif|avif|svg|bmp)$/i.test(f.name);
  async function openPicker(){
    setPickerOpen(true);setLoading(true);
    try{const res=await fetch('/api/uploads',{cache:'no-store'});if(res.ok){const data=await res.json() as {files:typeof library};setLibrary((data.files||[]).filter(isImage));}}
    catch{setError('No se pudo cargar la biblioteca.');}
    finally{setLoading(false);}
  }
  function choose(key:string){const src=`/api/files/${key}`;setUrl(src);onChange?.(src);setPickerOpen(false);}
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
    <div className="image-upload__actions"><button type="button" className="image-upload__action" onClick={()=>inputRef.current?.click()}>{busy?'Subiendo…':url?'Cambiar imagen':'Subir imagen'}</button><button type="button" className="image-upload__action" onClick={openPicker}>Elegir de la biblioteca</button></div>
    {error&&<small className="image-upload__error">{error}</small>}
    {pickerOpen&&<div className="media-picker" onClick={()=>setPickerOpen(false)}><div className="media-picker__panel" onClick={e=>e.stopPropagation()}><div className="media-picker__head"><b>Biblioteca de medios</b><button type="button" onClick={()=>setPickerOpen(false)} aria-label="Cerrar">×</button></div>{loading?<p className="media-picker__status">Cargando…</p>:library.length?<div className="media-picker__grid">{library.map(f=><button type="button" key={f.key} className="media-picker__item" onClick={()=>choose(f.key)}><img src={`/api/files/${f.key}`} alt={f.alt||f.name} loading="lazy"/></button>)}</div>:<p className="media-picker__status">No hay imágenes todavía. Sube una primero.</p>}</div></div>}
  </div>;
}
