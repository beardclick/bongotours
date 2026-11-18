'use client';
import { FormEvent, useState } from 'react';
import { TurnstileWidget } from './turnstile-widget';
import { visaQuestions } from '../lib/visa-questions';

export function VisaForm({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [challengeKey, setChallengeKey] = useState(0);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus('');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const answers: Record<string, string> = {};
    for (const question of visaQuestions) answers[question.id] = data[question.id] ?? '';
    const res = await fetch('/api/visa', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        answers,
        page: window.location.href,
        turnstileToken: data.turnstileToken,
      }),
    });
    const json = await res.json() as { message?: string; error?: string };
    setStatus(res.ok ? json.message || 'Solicitud enviada.' : json.error || 'No se pudo enviar.');
    setBusy(false);
    if (res.ok) form.reset();
    setChallengeKey(key => key + 1);
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <h2>Cuestionario de 21 preguntas</h2>
      <p className="visa-form-intro">Responde todo de una forma detallada para evitar errores en la aplicación. Los apellidos y nombres deben coincidir exactamente con el pasaporte.</p>
      <div className="form-row">
        <label>Nombre completo<input name="name" required maxLength={160} placeholder="Tu nombre" /></label>
        <label>Correo<input name="email" type="email" required maxLength={254} placeholder="nombre@correo.com" /></label>
      </div>
      <div className="form-row">
        <label>Teléfono / WhatsApp<input name="phone" required maxLength={40} placeholder="+507 0000-0000" /></label>
        <span aria-hidden="true" />
      </div>
      {visaQuestions.map((question, index) => (
        <label key={question.id} className="visa-question">
          <span>{index + 1}. {question.label}</span>
          {question.kind === 'textarea'
            ? <textarea name={question.id} rows={3} required maxLength={4000} placeholder="Escribe tu respuesta con detalle" />
            : <input name={question.id} required maxLength={300} placeholder="Escribe tu respuesta" />}
        </label>
      ))}
      {turnstileSiteKey && <TurnstileWidget key={challengeKey} siteKey={turnstileSiteKey} action="visa" />}
      <button className="button button--primary full" type="submit" disabled={busy}>{busy ? 'Enviando…' : 'Enviar solicitud'}</button>
      {status && <p className="form-status" role="status">{status}</p>}
    </form>
  );
}
