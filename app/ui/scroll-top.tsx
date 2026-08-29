'use client';
import { useEffect,useState } from 'react';
import { FaChevronUp } from 'react-icons/fa6';
export function ScrollTop(){
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const onScroll=()=>setVisible(window.scrollY>400);
    onScroll();
    window.addEventListener('scroll',onScroll,{passive:true});
    return()=>window.removeEventListener('scroll',onScroll);
  },[]);
  return <button type="button" className={`scroll-top ${visible?'scroll-top--visible':''}`} aria-label="Volver arriba" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}><FaChevronUp aria-hidden="true"/></button>;
}
