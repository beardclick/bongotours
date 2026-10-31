import { ensureDatabase } from '../../db/runtime';

export type PaymentMethods = {cash:boolean;paguelo:boolean;paypal:boolean};
export type FooterLogo = {id:string;label:string;image:string;alt:string;link:string;enabled:boolean};
export const defaultFooterLogos:FooterLogo[]=[
  {id:'sello-anfitrion',label:'Sello Anfitrión',image:'/images/anfitrion.png',alt:'Sello Anfitrión',link:'',enabled:true},
  {id:'visit-panama',label:'Visit Panamá',image:'/images/visit_panama.png',alt:'Visit Panamá',link:'https://www.visitpanama.com/',enabled:true},
  {id:'payment-methods',label:'Métodos de pago',image:'/images/visa-mc-clave-300x67.png',alt:'Visa, Mastercard y Clave',link:'',enabled:true},
];
export const defaultPaymentMethods:PaymentMethods = {cash:true,paguelo:true,paypal:true};

export async function getPaymentMethods():Promise<PaymentMethods>{
  try{
    const db=await ensureDatabase();
    const row=await db.prepare('SELECT value FROM settings WHERE key=?').bind('payment_methods').first<{value:string}>();
    if(!row)return defaultPaymentMethods;
    const parsed=JSON.parse(row.value) as Partial<PaymentMethods>;
    return {cash:parsed.cash!==false,paguelo:parsed.paguelo!==false,paypal:parsed.paypal!==false};
  }catch{return defaultPaymentMethods;}
}

export async function setPaymentMethods(methods:PaymentMethods):Promise<void>{
  const db=await ensureDatabase();
  await db.prepare(`INSERT INTO settings (key,value,updated_at) VALUES ('payment_methods',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at`).bind(JSON.stringify({cash:Boolean(methods.cash),paguelo:Boolean(methods.paguelo),paypal:Boolean(methods.paypal)}),new Date().toISOString()).run();
}

export const defaultShareImage='/og.png';

export async function getShareImage():Promise<string>{
  try{
    const db=await ensureDatabase();
    const row=await db.prepare('SELECT value FROM settings WHERE key=?').bind('share_image').first<{value:string}>();
    const value=row?.value?.trim();
    return value||defaultShareImage;
  }catch{return defaultShareImage;}
}

export async function setShareImage(url:string):Promise<void>{
  const db=await ensureDatabase();
  await db.prepare(`INSERT INTO settings (key,value,updated_at) VALUES ('share_image',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at`).bind(url.trim()||defaultShareImage,new Date().toISOString()).run();
}

export const defaultLiabilityWaiver=`<h2>✅ Acepto los términos y condiciones</h2><ul><li>Acepto el deslinde y las condiciones del tour</li><li>He leído y acepto el deslinde de responsabilidad</li></ul><h2>DESLINDE DE RESPONSABILIDAD</h2><p>Declaro que participo voluntariamente en las actividades de Bongo Outdoors Tours y que cuento con las condiciones físicas y de salud necesarias para realizar la actividad seleccionada.</p><p>Entiendo que las actividades turísticas y de aventura pueden implicar riesgos propios de la actividad, incluyendo, entre otros, caídas, golpes, lesiones, condiciones climáticas, terreno irregular, accidentes y otros riesgos inherentes.</p><p>Bongo Outdoors Tours no se hace responsable por lesiones, daños o incidentes derivados de la falta de condición física, incumplimiento de las instrucciones de los guías, información médica omitida o cualquier otra situación atribuible a la conducta o condiciones personales del participante.</p><p>Al realizar la reserva, confirmo que he leído, comprendido y aceptado este deslinde de responsabilidad y las condiciones de participación.</p><ul><li>Acepto las condiciones de participación</li><li>Confirmo mi aceptación y responsabilidad</li></ul>`;

export async function getLiabilityWaiver():Promise<string>{
  try{
    const db=await ensureDatabase();
    const row=await db.prepare('SELECT value FROM settings WHERE key=?').bind('liability_waiver').first<{value:string}>();
    return row?.value?.trim()||defaultLiabilityWaiver;
  }catch{return defaultLiabilityWaiver;}
}

export async function setLiabilityWaiver(html:string):Promise<void>{
  const db=await ensureDatabase();
  await db.prepare(`INSERT INTO settings (key,value,updated_at) VALUES ('liability_waiver',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at`).bind(html||defaultLiabilityWaiver,new Date().toISOString()).run();
}

export async function getFooterLogos():Promise<FooterLogo[]>{
  try{
    const db=await ensureDatabase();
    const row=await db.prepare('SELECT value FROM settings WHERE key=?').bind('footer_logos').first<{value:string}>();
    if(!row)return defaultFooterLogos;
    const saved=JSON.parse(row.value);
    if(Array.isArray(saved)) return [...defaultFooterLogos.filter(item=>!saved.some((entry:FooterLogo)=>entry.id===item.id)),...saved];
    return Array.isArray(saved.logos)?saved.logos:defaultFooterLogos;
  }catch{return defaultFooterLogos;}
}

export async function setFooterLogos(logos:FooterLogo[]):Promise<void>{
  const normalized=logos.slice(0,50).map((item)=>{
    let link='';try{const url=new URL(String(item.link));if(url.protocol==='https:'||url.protocol==='http:')link=url.toString()}catch{}
    return{id:String(item.id||crypto.randomUUID()).slice(0,100),label:String(item.label||'Logo').trim().slice(0,160),image:String(item.image||'').trim().slice(0,500),alt:String(item.alt||'').trim().slice(0,160),link,enabled:Boolean(item.enabled)};
  });
  const db=await ensureDatabase();
  await db.prepare(`INSERT INTO settings (key,value,updated_at) VALUES ('footer_logos',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at`).bind(JSON.stringify({version:2,logos:normalized}),new Date().toISOString()).run();
}
