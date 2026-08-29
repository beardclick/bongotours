import type { Metadata } from 'next';import { Header } from '../../ui/header';import { Footer } from '../../ui/footer';import { WhatsApp } from '../../ui/whatsapp';import { OrderConfirmation } from '../../ui/order-confirmation';
export const metadata:Metadata={title:'Pedido confirmado',robots:{index:false,follow:false}};
export default function ConfirmedOrder(){return <main><Header/><section className="order-confirmation-page shell"><OrderConfirmation/></section><Footer/><WhatsApp/></main>}
