import { NextResponse } from 'next/server';
import { getChatGPTUser, isAdminEmail } from '../../../chatgpt-auth';
import { ensureDatabase } from '../../../../db/runtime';
import { sendInvoiceEmail } from '../../../lib/email';
import { generateInvoicePdf } from '../../../lib/invoice-pdf';
import type { InvoiceOrder } from '../../../lib/invoice';

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user || !isAdminEmail(user.email)) return NextResponse.json({ error: 'Acceso de administrador requerido.' }, { status: 403 });
  const reference = String(new URL(request.url).searchParams.get('reference') ?? '').trim();
  if (!reference) return NextResponse.json({ error: 'Referencia inválida.' }, { status: 400 });
  const db = await ensureDatabase();
  const order = await db.prepare('SELECT * FROM bookings WHERE reference=?').bind(reference).first<Record<string, unknown>>();
  if (!order) return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
  const pdf = await generateInvoicePdf(order as InvoiceOrder);
  const inline = new URL(request.url).searchParams.get('view') === '1';
  const disposition = inline ? 'inline' : `attachment; filename="factura-${reference}.pdf"`;
  return new Response(pdf as unknown as BodyInit, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': disposition,
      'cache-control': 'no-store',
    },
  });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user || !isAdminEmail(user.email)) return NextResponse.json({ error: 'Acceso de administrador requerido.' }, { status: 403 });
  const body = await request.json() as { reference?: string };
  const reference = String(body.reference ?? '').trim();
  if (!reference) return NextResponse.json({ error: 'Referencia inválida.' }, { status: 400 });
  const db = await ensureDatabase();
  const order = await db.prepare('SELECT * FROM bookings WHERE reference=?').bind(reference).first<Record<string, unknown>>();
  if (!order) return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
  const result = await sendInvoiceEmail(db, order as Parameters<typeof sendInvoiceEmail>[1]);
  return NextResponse.json({ ok: true, sent: result.sent, queued: result.queued });
}
