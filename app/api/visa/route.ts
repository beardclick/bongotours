import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { ensureDatabase } from '../../../db/runtime';
import { verifyTurnstile } from '../../lib/turnstile';
import { queueEmail } from '../../lib/email';
import { visaQuestions } from '../../lib/visa-questions';

function runtimeValue(key: string) {
  return String((env as unknown as Record<string, unknown>)[key] ?? '').trim();
}
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] as string));
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (!await verifyTurnstile(request, body.turnstileToken, 'visa')) {
      return NextResponse.json({ error: 'Completa la verificación de seguridad.' }, { status: 400 });
    }
    const name = String(body.name ?? '').trim().slice(0, 160);
    const email = String(body.email ?? '').trim().toLowerCase().slice(0, 254);
    const phone = String(body.phone ?? '').trim().slice(0, 40);
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || phone.length < 7) {
      return NextResponse.json({ error: 'Revisa tu nombre, correo y teléfono.' }, { status: 400 });
    }
    const raw = body.answers && typeof body.answers === 'object' ? body.answers as Record<string, unknown> : {};
    const answers: Record<string, string> = {};
    for (const question of visaQuestions) answers[question.id] = String(raw[question.id] ?? '').trim().slice(0, 4000);
    const missing = visaQuestions.filter(question => !answers[question.id]);
    if (missing.length) {
      return NextResponse.json({ error: `Faltan ${missing.length} respuesta(s) del cuestionario. Completa todas las preguntas.` }, { status: 400 });
    }

    const db = await ensureDatabase();
    const rows = visaQuestions.map(question => `<tr><td style="padding:12px 0;border-bottom:1px solid #edf1ef;color:#0f2c27;font-size:13px;line-height:1.6"><strong>${escapeHtml(question.label)}</strong><br/>${escapeHtml(answers[question.id]).replace(/\n/g, '<br/>')}</td></tr>`).join('');
    const html = `<div style="margin:0;padding:0;background:#f2f6f4;font-family:'Segoe UI',Arial,sans-serif;color:#0f2c27"><div style="max-width:640px;margin:0 auto;padding:28px 16px"><div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(8,38,31,.08)"><div style="background:linear-gradient(135deg,#0f4d45,#1d7a63);padding:26px"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:rgba(255,255,255,.8)">Bongo Outdoors</div><h1 style="margin:10px 0 0;font-size:19px;line-height:1.4;font-weight:700;color:#fff">Nueva solicitud de trámite de visa</h1></div><div style="padding:24px 26px"><p style="margin:0 0 6px;font-size:13px;color:#81918c">Solicitante</p><p style="margin:0 0 4px;font-size:15px;font-weight:700">${escapeHtml(name)}</p><p style="margin:0 0 4px;font-size:13px">${escapeHtml(email)}</p><p style="margin:0 0 18px;font-size:13px">${escapeHtml(phone)}</p><table role="presentation" style="width:100%;border-collapse:collapse">${rows}</table></div></div><p style="text-align:center;font-size:11px;color:#81918c;margin:18px 0 0">Formulario de Trámites de Visa · bongoutdoors.com</p></div></div>`;
    const plain = [`Solicitante: ${name}`, `Correo: ${email}`, `Teléfono: ${phone}`, '', ...visaQuestions.map(question => `${question.label}\n${answers[question.id]}`)].join('\n\n');

    await db.prepare('INSERT INTO form_submissions (name,email,phone,interest,message,page,status,created_at) VALUES (?,?,?,?,?,?,?,?)')
      .bind(name, email, phone, 'Trámite de Visa', plain, String(body.page ?? '').trim().slice(0, 500), 'new', new Date().toISOString())
      .run();

    const recipients = Array.from(new Set(['bongoutdoors@gmail.com', ...runtimeValue('ADMIN_EMAILS').split(',').map(item => item.trim()).filter(Boolean)]));
    let delivered = false;
    for (const recipient of recipients) {
      const result = await queueEmail(db, recipient, `Nueva solicitud de visa: ${name}`, html);
      delivered = delivered || Boolean(result.sent);
    }
    await queueEmail(db, email, 'Recibimos tu solicitud de visa', `<div style="font-family:'Segoe UI',Arial,sans-serif;color:#0f2c27;line-height:1.6;max-width:560px;margin:0 auto;padding:24px"><h2 style="font-size:20px">¡Recibimos tu solicitud!</h2><p>Hola ${escapeHtml(name)}, gracias por enviarnos tu cuestionario de visa. Lo revisaremos para verificar que no falte ningún dato y te contactaremos para coordinar el pago del trámite y los siguientes pasos.</p><p style="color:#81918c;font-size:13px">Bongo Outdoors Tours</p></div>`);

    return NextResponse.json({ ok: true, message: delivered ? 'Solicitud enviada. Te contactaremos pronto.' : 'Solicitud guardada. Te contactaremos pronto.' });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo enviar la solicitud. Intenta de nuevo.' }, { status: 500 });
  }
}
