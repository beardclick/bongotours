import type { Metadata } from 'next';
import { Header } from '../ui/header';
import { Footer } from '../ui/footer';
import { WhatsApp } from '../ui/whatsapp';
import { CartCheckout } from '../ui/cart-checkout';
import { getChatGPTUser } from '../chatgpt-auth';
import { ensureDatabase } from '../../db/runtime';
import { turnstileSiteKey } from '../lib/turnstile';
import { getPaymentMethods } from '../lib/settings';

export const metadata:Metadata={title:'Carrito de reserva',description:'Revisa y confirma tu selección de tours con Bongo Outdoors.'};
export default async function CartPage(){const [user,paymentMethods]=await Promise.all([getChatGPTUser(),getPaymentMethods()]);let customer:{fullName?:string;email?:string;phone?:string}={fullName:'',email:'',phone:''};if(user){try{const db=await ensureDatabase();const p=await db.prepare('SELECT full_name,email,phone FROM user_profiles WHERE user_id=?').bind(user.userId).first() as {full_name?:string;email?:string;phone?:string}|null;customer={fullName:user.fullName||user.displayName||p?.full_name||'',email:p?.email||user.email||'',phone:p?.phone||''};}catch{}}return <main><Header/><section className="page-hero page-hero--green"><div className="shell"><p className="eyebrow eyebrow--light"><span/> Reserva en efectivo</p><h1>Tu carrito de aventura.</h1><p>Revisa las fechas y completa tus datos para solicitar la reserva.</p></div></section><section className="section shell"><CartCheckout isLoggedIn={Boolean(user)} customer={customer} turnstileSiteKey={turnstileSiteKey()} paymentMethods={paymentMethods}/></section><Footer/><WhatsApp/></main>}
