import { displayDate } from './display-date';
export type InvoiceOrder = {
  reference: string;
  customer_name: string;
  email: string;
  phone?: string | null;
  tour_slug: string;
  tour_date: string;
  quantity: number;
  price_mode?: string | null;
  total: number;
  payment_method?: string | null;
  status?: string | null;
  created_at?: string | null;
};

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(
    /[&<>'"]/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char as '&' | '<' | '>' | "'" | '"']!),
  );

const payLabel: Record<string, string> = {
  cash: 'Efectivo contra entrega',
  paypal: 'PayPal',
  paguelo: 'Tarjeta de Crédito/Débito (Paguelo Fácil)',
};

export function invoiceHtml(order: InvoiceOrder): string {
  const total = Number(order.total || 0).toFixed(2);
  const quantity = Math.max(1, Number(order.quantity || 1));
  const unit = (Number(order.total || 0) / quantity).toFixed(2);
  const issued = displayDate(new Date().toISOString());
  const tourDate = order.tour_date ? displayDate(String(order.tour_date)) : '—';
  const tourName = String(order.tour_slug || '').replaceAll('-', ' ');
  const method = payLabel[String(order.payment_method ?? 'cash')] ?? String(order.payment_method ?? '—');
  const paid = order.status === 'completed';
  const statusText = paid ? 'Pagado' : 'Pendiente de pago';
  const statusColor = paid ? '#1d7a63' : '#b7791f';
  const priceMode = order.price_mode === 'group' ? ' / grupo' : order.price_mode === 'both' ? '' : ' / persona';

  return `<div style="margin:0;padding:0;background:#f2f6f4;font-family:'Segoe UI',Arial,sans-serif;color:#0f2c27">
<div style="max-width:640px;margin:0 auto;padding:28px 16px">
  <div style="text-align:center;padding:8px 0 22px">
    <div style="font-size:23px;font-weight:800;letter-spacing:.02em">BONGO <span style="color:#5E9B3E">OUTDOORS</span></div>
    <div style="font-size:11px;letter-spacing:.22em;color:#81918c;margin-top:4px">TOURS · PANAMÁ</div>
  </div>

  <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(8,38,31,.08)">
    <div style="background:linear-gradient(135deg,#0f4d45,#1d7a63);padding:28px 28px 24px">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap">
        <div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:rgba(255,255,255,.8)">Factura</div>
          <h1 style="margin:8px 0 0;font-size:21px;line-height:1.3;font-weight:700;color:#fff">N° ${escapeHtml(order.reference)}</h1>
        </div>
        <div style="text-align:right;color:#fff">
          <div style="font-size:11px;color:rgba(255,255,255,.75)">Fecha de emisión</div>
          <div style="font-size:13px;font-weight:700;margin-top:2px">${escapeHtml(issued)}</div>
          <div style="margin-top:8px;display:inline-block;padding:4px 12px;border-radius:99px;background:${statusColor};font-size:11px;font-weight:800;letter-spacing:.04em">${statusText.toUpperCase()}</div>
        </div>
      </div>
    </div>

    <div style="padding:26px 28px">
      <div style="display:flex;justify-content:space-between;gap:22px;flex-wrap:wrap;padding-bottom:22px;border-bottom:1px solid #edf1ef">
        <div style="font-size:12px;line-height:1.7;color:#0f2c27">
          <b style="font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#81918c;display:block;margin-bottom:6px">Emisor</b>
          <b style="display:block">Bongo Outdoors Tours</b>
          <span style="color:#64736f">Alto Boquete, Chiriquí, Panamá</span><br/>
          <span style="color:#64736f">info@bongoutdoors.com · +507 6090-9741</span>
        </div>
        <div style="font-size:12px;line-height:1.7;color:#0f2c27;text-align:right">
          <b style="font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#81918c;display:block;margin-bottom:6px">Cliente</b>
          <b style="display:block">${escapeHtml(order.customer_name)}</b>
          <span style="color:#64736f">${escapeHtml(order.email)}</span><br/>
          ${order.phone ? `<span style="color:#64736f">${escapeHtml(order.phone)}</span>` : ''}
        </div>
      </div>

      <table role="presentation" style="width:100%;border-collapse:collapse;margin:20px 0 0">
        <tr>
          <th style="text-align:left;padding:10px 8px;border-bottom:2px solid #0f4d45;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#81918c">Descripción</th>
          <th style="text-align:left;padding:10px 8px;border-bottom:2px solid #0f4d45;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#81918c">Fecha</th>
          <th style="text-align:right;padding:10px 8px;border-bottom:2px solid #0f4d45;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#81918c">Cant.</th>
          <th style="text-align:right;padding:10px 8px;border-bottom:2px solid #0f4d45;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#81918c">Precio</th>
          <th style="text-align:right;padding:10px 8px;border-bottom:2px solid #0f4d45;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#81918c">Total</th>
        </tr>
        <tr>
          <td style="padding:14px 8px;border-bottom:1px solid #edf1ef;font-weight:700;text-transform:capitalize">${escapeHtml(tourName)}</td>
          <td style="padding:14px 8px;border-bottom:1px solid #edf1ef;color:#64736f">${escapeHtml(tourDate)}</td>
          <td style="padding:14px 8px;border-bottom:1px solid #edf1ef;text-align:right">${quantity}</td>
          <td style="padding:14px 8px;border-bottom:1px solid #edf1ef;text-align:right">$${unit}${priceMode}</td>
          <td style="padding:14px 8px;border-bottom:1px solid #edf1ef;text-align:right;font-weight:800">$${total}</td>
        </tr>
      </table>

      <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:20px;padding:16px 18px;border-radius:12px;background:#f0f7f2">
        <div style="font-size:11px;color:#64736f">Método de pago<br/><b style="color:#0f2c27">${escapeHtml(method)}</b></div>
        <div style="text-align:right"><span style="font-size:11px;color:#64736f">Total a pagar</span><div style="font-size:22px;font-weight:800;color:#0f4d45">$${total}</div></div>
      </div>
    </div>
  </div>

  <div style="text-align:center;padding:20px 16px 4px;font-size:11px;line-height:1.6;color:#81918c">
    Gracias por reservar con Bongo Outdoors. Ante cualquier duda escríbenos a info@bongoutdoors.com.<br/>
    Este documento es un comprobante de reserva. Si necesitas una factura fiscal con RUC, solicítala a nuestro equipo.
  </div>
</div>
</div>`;
}
