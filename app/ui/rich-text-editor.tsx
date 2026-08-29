'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  FaBold,
  FaHeading,
  FaImage,
  FaItalic,
  FaLink,
  FaListOl,
  FaListUl,
  FaMinus,
  FaParagraph,
  FaQuoteLeft,
} from 'react-icons/fa6';
import { compressImage } from '../lib/image-compression';

type Props={name:string;label:string;value:string};

export function RichTextEditor({name,label,value}:Props){
  const editor=useRef<HTMLDivElement>(null);
  const mediaInput=useRef<HTMLInputElement>(null);
  const selection=useRef<Range|null>(null);
  const [html,setHtml]=useState(value);
  const [status,setStatus]=useState('');

  useEffect(()=>{
    if(editor.current&&editor.current.innerHTML!==value)editor.current.innerHTML=value;
    setHtml(value);
  },[value]);
  function rememberSelection(){
    const selected=window.getSelection();
    if(!selected?.rangeCount||!editor.current)return;
    const range=selected.getRangeAt(0);
    if(editor.current.contains(range.commonAncestorContainer))selection.current=range.cloneRange();
  }
  function restoreSelection(){
    editor.current?.focus();
    if(!selection.current)return;
    const selected=window.getSelection();
    selected?.removeAllRanges();
    selected?.addRange(selection.current);
  }
  function sync(){setHtml(editor.current?.innerHTML??'');rememberSelection();}
  function command(action:string,arg?:string){
    restoreSelection();
    document.execCommand(action,false,arg);
    sync();
  }
  function block(tag:'p'|'h2'|'h3'|'blockquote'){command('formatBlock',tag);}
  function insertHtml(markup:string){
    editor.current?.focus();
    document.execCommand('insertHTML',false,markup);
    sync();
  }
  function addLink(){
    const url=window.prompt('Pega la URL del enlace');
    if(url)command('createLink',url);
  }
  async function addMedia(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];
    if(!file)return;
    setStatus('Optimizando y subiendo imagen…');
    try{
      const optimized=await compressImage(file);
      const data=new FormData();
      data.append('file',optimized);
      const response=await fetch('/api/uploads',{method:'POST',body:data});
      const result=await response.json() as {url?:string;error?:string};
      if(!response.ok||!result.url)throw new Error(result.error||'No se pudo subir la imagen.');
      const alt=file.name.replace(/[-_]/g,' ').replace(/\.[^.]+$/,'');
      insertHtml(`<figure class="content-media"><img src="${result.url}" alt="${alt}"><figcaption>Escribe una descripción para la imagen</figcaption></figure><p><br></p>`);
      setStatus('Imagen añadida al contenido.');
    }catch(error){setStatus(error instanceof Error?error.message:'No se pudo subir la imagen.');}
    finally{event.target.value='';}
  }

  return <div className="gutenberg-field">
    <div className="gutenberg-label"><span>{label}</span><small>Editor por bloques · el contenido se guarda con formato</small></div>
    <div className="gutenberg-editor">
      <div className="gutenberg-topbar">
        <div className="gutenberg-brand"><b>＋</b><span>Contenido</span></div>
        <div className="gutenberg-tools" aria-label="Herramientas de formato" onMouseDown={event=>event.preventDefault()}>
          <button type="button" onClick={()=>block('p')} title="Párrafo"><FaParagraph/><span>Párrafo</span></button>
          <button type="button" onClick={()=>block('h2')} title="Título H2"><FaHeading/><span>H2</span></button>
          <button type="button" onClick={()=>command('bold')} title="Negrita"><FaBold/></button>
          <button type="button" onClick={()=>command('italic')} title="Cursiva"><FaItalic/></button>
          <button type="button" onClick={()=>command('insertUnorderedList')} title="Lista"><FaListUl/></button>
          <button type="button" onClick={()=>command('insertOrderedList')} title="Lista numerada"><FaListOl/></button>
          <button type="button" onClick={addLink} title="Enlace"><FaLink/></button>
        </div>
        <button className="gutenberg-media" type="button" onMouseDown={event=>event.preventDefault()} onClick={()=>mediaInput.current?.click()}><FaImage/> Añadir media</button>
        <input ref={mediaInput} type="file" accept="image/*" hidden onChange={addMedia}/>
      </div>
      <div className="gutenberg-canvas">
        <div className="gutenberg-block-hint"><span>⋮⋮</span> Bloque de contenido</div>
        <div ref={editor} className="wysiwyg-editor" contentEditable suppressContentEditableWarning data-placeholder="Empieza a escribir o añade un bloque…" onInput={sync} onKeyUp={rememberSelection} onMouseUp={rememberSelection} onFocus={rememberSelection}/>
        <div className="block-inserter" aria-label="Añadir bloque" onMouseDown={event=>event.preventDefault()}>
          <span>＋ Añadir bloque</span>
          <button type="button" onClick={()=>insertHtml('<p><br></p>')}><FaParagraph/> Párrafo</button>
          <button type="button" onClick={()=>insertHtml('<h2>Nuevo título</h2>')}><FaHeading/> Título</button>
          <button type="button" onClick={()=>insertHtml('<blockquote>Escribe una cita destacada</blockquote>')}><FaQuoteLeft/> Cita</button>
          <button type="button" onClick={()=>mediaInput.current?.click()}><FaImage/> Imagen</button>
          <button type="button" onClick={()=>insertHtml('<hr><p><br></p>')}><FaMinus/> Separador</button>
        </div>
      </div>
      <div className="gutenberg-status"><span>{status||'Los cambios se guardan al publicar.'}</span><button type="button" onClick={()=>command('removeFormat')}>Limpiar formato</button></div>
    </div>
    <textarea name={name} value={html} readOnly hidden/>
  </div>;
}
