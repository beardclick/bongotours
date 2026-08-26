import type { Metadata } from 'next';
import { Header } from '../ui/header';
import { Footer } from '../ui/footer';
import { WhatsApp } from '../ui/whatsapp';
import { CartCheckout } from '../ui/cart-checkout';

export const metadata:Metadata={title:'Carrito de reserva',description:'Revisa y confirma tu selección de tours con Bongo Outdoors.'};
export default function CartPage(){return <main><Header/><section className="page-hero page-hero--green"><div className="shell"><p className="eyebrow eyebrow--light"><span/> Reserva en efectivo</p><h1>Tu carrito de aventura.</h1><p>Revisa las fechas y completa tus datos para solicitar la reserva.</p></div></section><section className="section shell"><CartCheckout/></section><Footer/><WhatsApp/></main>}
