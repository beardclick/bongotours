import { NextResponse } from 'next/server';
import { getChatGPTUser, isAdminEmail } from '../../../chatgpt-auth';
import { sendBookingEmail } from '../../../lib/email';
import { ensureDatabase } from '../../../../db/runtime';

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Acceso de administrador requerido.' }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const reference = typeof body?.reference === 'string' ? body.reference.trim() : '';
  const recipient = body?.recipient;
  if (!reference || (recipient !== 'admin' && recipient !== 'customer')) {
    return NextResponse.json({ error: 'Selecciona un pedido y un destinatario válidos.' }, { status: 400 });
  }
  try {
    const db = await ensureDatabase();
    const order = await db.prepare('SELECT * FROM bookings WHERE reference=?').bind(reference).first();
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
    const result = await sendBookingEmail(db, order, recipient);
    if (!result.sent) {
      return NextResponse.json({ error: 'El proveedor de correo no confirmó el envío.' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'No se pudo reenviar el correo de la reserva.' }, { status: 500 });
  }
}
