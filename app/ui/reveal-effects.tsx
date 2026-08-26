'use client';

import { useEffect } from 'react';

export function RevealEffects(){
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const selector='main section h1, main section h2, main section .lead, .tour-card, .category-card, .destination-list>a, .service-grid article, .stay-grid article, .tour-spec-grid>div, .included-card, .excluded-card, .bring-section, .safety-card, .recommendation-card, .tour-extra-message, .policy-card, .gallery img, .amenity-grid span, .cart-items article, .cart-summary';
    const elements=Array.from(document.querySelectorAll<HTMLElement>(selector));
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('reveal-visible');observer.unobserve(entry.target);}}},{threshold:.12,rootMargin:'0px 0px -35px'});
    elements.forEach((element,index)=>{element.classList.add('reveal-ready');element.style.setProperty('--reveal-delay',`${Math.min(index%4,3)*70}ms`);observer.observe(element);});
    return()=>observer.disconnect();
  },[]);
  return null;
}
