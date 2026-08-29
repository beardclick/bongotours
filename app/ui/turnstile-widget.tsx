'use client';
import { useEffect,useRef,useState } from 'react';

type TurnstileApi={render:(container:HTMLElement,options:Record<string,unknown>)=>string;remove:(widgetId:string)=>void};
declare global{interface Window{turnstile?:TurnstileApi}}
let loader:Promise<TurnstileApi>|null=null;
function loadTurnstile(){
  if(window.turnstile)return Promise.resolve(window.turnstile);if(loader)return loader;
  loader=new Promise((resolve,reject)=>{const existing=document.querySelector<HTMLScriptElement>('script[data-bongo-turnstile]');const script=existing??document.createElement('script');const ready=()=>window.turnstile?resolve(window.turnstile):reject(new Error('Turnstile no pudo iniciar.'));script.addEventListener('load',ready,{once:true});script.addEventListener('error',()=>reject(new Error('Turnstile no pudo cargar.')),{once:true});if(!existing){script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.defer=true;script.dataset.bongoTurnstile='true';document.head.appendChild(script);}});return loader;
}
export function TurnstileWidget({siteKey,action,onToken}:{siteKey:string;action:string;onToken?:(token:string)=>void}){
  const container=useRef<HTMLDivElement>(null);const [token,setToken]=useState('');const [error,setError]=useState('');
  useEffect(()=>{let widgetId='';let active=true;loadTurnstile().then(api=>{if(!active||!container.current)return;widgetId=api.render(container.current,{sitekey:siteKey,action,theme:'light',size:'flexible',callback:(value:string)=>{setToken(value);onToken?.(value)},'expired-callback':()=>{setToken('');onToken?.('')},'error-callback':()=>setError('No pudimos verificarte. Recarga la página.')});}).catch(()=>setError('No pudimos cargar la verificación.'));return()=>{active=false;if(widgetId&&window.turnstile)window.turnstile.remove(widgetId)}},[siteKey,action,onToken]);
  return <div className="turnstile-field"><div ref={container}/><input type="hidden" name="turnstileToken" value={token}/>{error&&<small role="alert">{error}</small>}</div>;
}
