import { displayDate } from './display-date';
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import type { InvoiceOrder } from './invoice';
import { LOGO_PNG_BASE64 } from './logo-base64';

const GREEN = rgb(0.059, 0.302, 0.271); // #0f4d45
const ACCENT = rgb(0.369, 0.608, 0.243); // #5E9B3E
const INK = rgb(0.059, 0.173, 0.153); // #0f2c27
const MUTED = rgb(0.392, 0.451, 0.435); // #64736f
const LIGHT = rgb(0.929, 0.945, 0.937); // #edf1ef
const WHITE = rgb(1, 1, 1);

const payLabel: Record<string, string> = { cash: 'Efectivo contra entrega', paypal: 'PayPal', paguelo: 'Tarjeta de Crédito/Débito (Paguelo Fácil)' };

function right(page: PDFPage, font: PDFFont, text: string, x: number, y: number, size: number, color = INK) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: x - w, y, size, font, color });
}

export async function generateInvoicePdf(order: InvoiceOrder): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const rightEdge = width - margin;
  const total = Number(order.total || 0).toFixed(2);
  const quantity = Math.max(1, Number(order.quantity || 1));
  const unit = (Number(order.total || 0) / quantity).toFixed(2);
  const tourName = String(order.tour_slug || '').replaceAll('-', ' ');
  const tourDate = order.tour_date ? displayDate(String(order.tour_date)) : '—';
  const method = payLabel[String(order.payment_method ?? 'cash')] ?? String(order.payment_method ?? '—');
  const paid = order.status === 'completed';
  const issued = displayDate(new Date().toISOString());
  const priceMode = order.price_mode === 'group' ? ' / grupo' : order.price_mode === 'both' ? '' : ' / persona';

  // ── Header ─────────────────────────────────────────────
  let y = height - 62;
  const logo = await doc.embedPng(LOGO_PNG_BASE64);
  const logoSize = 40;
  page.drawImage(logo, { x: margin, y: y - 38, width: logoSize, height: logoSize });
  page.drawText('Bongo Outdoors Tours', { x: margin + logoSize + 12, y: y - 10, size: 16, font: bold, color: INK });
  page.drawText('Aventuras en Panamá', { x: margin + logoSize + 12, y: y - 24, size: 8, font, color: MUTED });

  right(page, bold, 'FACTURA', rightEdge, y, 24, GREEN);
  right(page, bold, `N° ${order.reference}`, rightEdge, y - 20, 10.5, INK);
  right(page, font, `Fecha de emisión: ${issued}`, rightEdge, y - 34, 9, MUTED);

  // Status badge (right side, below the date — no overlap)
  const statusText = paid ? 'PAGADO' : 'PENDIENTE DE PAGO';
  const statusW = bold.widthOfTextAtSize(statusText, 9) + 20;
  const statusColor = paid ? GREEN : rgb(0.718, 0.475, 0.122);
  page.drawRectangle({ x: rightEdge - statusW, y: y - 58, width: statusW, height: 16, color: statusColor });
  page.drawText(statusText, { x: rightEdge - statusW + 10, y: y - 54, size: 9, font: bold, color: WHITE });

  // Green rule
  y -= 82;
  page.drawLine({ start: { x: margin, y }, end: { x: rightEdge, y }, thickness: 2, color: ACCENT });

  // ── Emisor / Cliente ───────────────────────────────────
  y -= 34;
  page.drawText('EMISOR', { x: margin, y, size: 8, font: bold, color: MUTED });
  page.drawText('Bongo Outdoors Tours', { x: margin, y: y - 16, size: 11, font: bold, color: INK });
  page.drawText('Alto Boquete, Chiriquí, Panamá', { x: margin, y: y - 30, size: 9.5, font, color: MUTED });
  page.drawText('info@bongoutdoors.com · +507 6090-9741', { x: margin, y: y - 44, size: 9.5, font, color: MUTED });

  page.drawText('CLIENTE', { x: margin + 260, y, size: 8, font: bold, color: MUTED });
  page.drawText(order.customer_name, { x: margin + 260, y: y - 16, size: 11, font: bold, color: INK });
  page.drawText(order.email, { x: margin + 260, y: y - 30, size: 9.5, font, color: MUTED });
  if (order.phone) page.drawText(order.phone, { x: margin + 260, y: y - 44, size: 9.5, font, color: MUTED });

  // ── Table header ───────────────────────────────────────
  y -= 84;
  page.drawRectangle({ x: margin, y: y - 6, width: rightEdge - margin, height: 22, color: GREEN });
  page.drawText('Descripción', { x: margin + 8, y, size: 8.5, font: bold, color: WHITE });
  page.drawText('Fecha', { x: margin + 250, y, size: 8.5, font: bold, color: WHITE });
  right(page, bold, 'Cant.', margin + 340, y, 8.5, WHITE);
  right(page, bold, 'Precio', margin + 405, y, 8.5, WHITE);
  right(page, bold, 'Total', rightEdge - 8, y, 8.5, WHITE);

  // ── Item row ───────────────────────────────────────────
  y -= 30;
  page.drawText(tourName, { x: margin + 8, y, size: 10, font: bold, color: INK });
  page.drawText(tourDate, { x: margin + 250, y, size: 9.5, font, color: MUTED });
  right(page, font, String(quantity), margin + 340, y, 9.5, INK);
  right(page, font, `$${unit}${priceMode}`, margin + 405, y, 9.5, INK);
  right(page, bold, `$${total}`, rightEdge - 8, y, 10, INK);
  page.drawLine({ start: { x: margin, y: y - 12 }, end: { x: rightEdge, y: y - 12 }, thickness: 0.8, color: LIGHT });

  // ── Totals ─────────────────────────────────────────────
  y -= 34;
  page.drawText('Método de pago', { x: margin, y, size: 9, font, color: MUTED });
  page.drawText(method, { x: margin, y: y - 14, size: 11, font: bold, color: INK });

  // Total box (right)
  page.drawRectangle({ x: rightEdge - 190, y: y - 22, width: 190, height: 40, color: LIGHT });
  right(page, font, 'Total a pagar', rightEdge - 14, y - 6, 9, MUTED);
  right(page, bold, `$${total}`, rightEdge - 14, y - 24, 18, GREEN);

  // ── Footer ─────────────────────────────────────────────
  const footerY = 52;
  page.drawLine({ start: { x: margin, y: footerY + 20 }, end: { x: rightEdge, y: footerY + 20 }, thickness: 0.8, color: LIGHT });
  page.drawText('Gracias por reservar con Bongo Outdoors. Ante cualquier duda escríbenos a info@bongoutdoors.com.', {
    x: margin, y: footerY, size: 8.5, font, color: MUTED,
  });
  page.drawText('Este documento es un comprobante de reserva. Para una factura fiscal con RUC, solicítala a nuestro equipo.', {
    x: margin, y: footerY - 13, size: 8.5, font, color: MUTED,
  });

  return doc.save();
}
