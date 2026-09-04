'use client';

import { useEffect, useState } from 'react';
import { SiteLink as Link } from './site-link';

type Receipt = {
  orders: Array<Record<string, unknown>>;
  items: Array<Record<string, unknown>>;
  contact: Record<string, unknown>;
  total: number;
  subtotal?: number;
  discount?: number;
  couponCode?: string;
  createdAt: string;
};

function paymentLabel(method: unknown) {
  if (method === 'paypal') return 'PayPal';
  if (method === 'paguelo') return 'Tarjeta · Paguelo Fácil';
  return 'Contra entrega · Efectivo';
}

export function OrderConfirmation() {
  const [receipt, setReceipt] = useState<Receipt | null | undefined>(undefined);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('bongo-last-order');
      if (saved) setReceipt(JSON.parse(saved) as Receipt);
    } catch {
      setReceipt(null);
    }
  }, []);

  if (receipt === undefined) {
    return <div className="cart-empty"><p>Cargando confirmación…</p></div>;
  }

  if (!receipt) {
    return <div className="cart-empty"><h2>No encontramos una orden reciente</h2><p>Consulta tus pedidos desde Mi cuenta o vuelve al catálogo.</p><Link className="button button--primary" href="/tours">Ver tours</Link></div>;
  }

  const method = receipt.orders[0]?.payment_method;
  return <div className="order-confirmation">
    <header><span>✓</span><p>Orden recibida</p><h1>¡Gracias por reservar con Bongo!</h1><small>Te mostraremos cualquier cambio también en Mi cuenta.</small></header>
    <div className="order-receipt">
      <section>
        <h2>Resumen de tu orden</h2>
        {receipt.items.map((item, index) => <article key={`${String(item.tourSlug)}-${index}`}>
          <div><b>{String(item.tourName || 'Reserva Bongo Outdoors')}</b><small>{String(item.tourDate || '')} · {String(item.quantity || 1)} participante(s)</small></div>
          <strong>${Number(item.total || 0).toFixed(2)}</strong>
        </article>)}
        <div className="receipt-totals">
          {Number(receipt.discount || 0) > 0 && <><p><span>Subtotal</span><b>${Number(receipt.subtotal || receipt.total).toFixed(2)}</b></p><p className="discount"><span>Descuento {receipt.couponCode ? `(${receipt.couponCode})` : ''}</span><b>−${Number(receipt.discount).toFixed(2)}</b></p></>}
          <p className="grand-total"><span>Total</span><strong>${Number(receipt.total).toFixed(2)}</strong></p>
        </div>
      </section>
      <aside><h2>Datos del pedido</h2><p><span>Cliente</span><b>{String(receipt.contact.customerName || '')}</b></p><p><span>Correo</span><b>{String(receipt.contact.email || '')}</b></p><p><span>Teléfono</span><b>{String(receipt.contact.phone || '')}</b></p><p><span>Método de pago</span><b>{paymentLabel(method)}</b></p></aside>
    </div>
    <div className="confirmation-actions"><Link className="button button--primary" href="/cuenta">Ver mis pedidos</Link><Link className="button button--ghost" href="/tours">Seguir explorando</Link></div>
  </div>;
}
