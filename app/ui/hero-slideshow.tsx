'use client';
import { useEffect,useState } from 'react';
type Slide={url:string;duration:number;kenburns:boolean};
export function HeroSlideshow({slides}:{slides:Slide[]}){
  const [index,setIndex]=useState(0);
  useEffect(()=>{if(slides.length<2)return;const current=slides[index];const duration=Math.max(3,Number(current.duration)||5)*1000;const timer=setTimeout(()=>setIndex(i=>(i+1)%slides.length),duration);return()=>clearTimeout(timer);},[index,slides]);
  if(!slides.length)return null;
  return <div className="hero__slides">{slides.map((slide,i)=><div key={i} className={`hero__slide${slide.kenburns?' kenburns':''}${i===index?' is-active':''}`} style={{backgroundImage:`url(${slide.url})`,animationDuration:slide.kenburns?`${Math.max(3,Number(slide.duration)||5)}s`:undefined}}/>)}</div>;
}
