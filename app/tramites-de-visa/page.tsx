import type { Metadata } from 'next';
import { Header } from '../ui/header';
import { Footer } from '../ui/footer';
import { VisaForm } from '../ui/visa-form';
import { turnstileSiteKey } from '../lib/turnstile';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Trámites de Visa',
  description: 'Acompañamiento profesional para tu trámite de visa en Panamá: pago del trámite, cuestionario, costo de la visa y documentación para tu cita.',
};

export default function TramitesDeVisa() {
  return (
    <main>
      <Header />
      <section className="relocation-hero">
        <div className="shell">
          <p className="eyebrow eyebrow--light"><span /> Visas y trámites</p>
          <h1>Trámites de <em>Visa</em></h1>
          <p>Te acompañamos paso a paso para tramitar la visa americana desde Panama: desde el pago del trámite hasta la documentación que debes llevar a tu cita.</p>
          <div className="relocation-hero__actions">
            <a className="button button--primary" href="#solicitud">Solicitar mi trámite <b>→</b></a>
            <a className="button button--glass" href="#proceso">Ver el proceso</a>
          </div>
        </div>
      </section>

      <section className="shell relocation-body">
        <div className="visa-overview">
          <div>
            <p className="eyebrow"><span /> Un proceso claro</p>
            <h2>Cómo trabajamos tu visa</h2>
            <p>Te explicamos cada paso: qué pagas, cuándo lo pagas y qué necesitas para llegar preparado a tu cita. Sin sorpresas y con acompañamiento en todo el camino.</p>
          </div>
          <div className="visa-prices">
            <div className="visa-price-card">
              <small>Trámite</small>
              <strong>$75</strong>
              <p>Se paga antes de iniciar cualquier gestión. Con este pago comenzamos la revisión de tu caso.</p>
            </div>
            <div className="visa-price-card">
              <small>Visa</small>
              <strong>$185</strong>
              <p>Por Western Union (ellos gestionan el cobro de visas) o por tarjeta, con el enlace e instrucciones que te compartimos.</p>
            </div>
          </div>
        </div>

        <div id="proceso" className="visa-section">
          <p className="eyebrow"><span /> Paso a paso</p>
          <h2>Cómo avanza tu solicitud</h2>
          <ol className="visa-steps">
            <li className="visa-step">
              <div>
                <h3>Pago del trámite: $75</h3>
                <p>Antes de iniciar el trámite se debe realizar el pago del mismo, por un valor de <strong>$75</strong>. Con este pago comenzamos la revisión de tu caso.</p>
              </div>
            </li>
            <li className="visa-step">
              <div>
                <h3>Cuestionario de 21 preguntas</h3>
                <p>Debes completar el cuestionario de 21 preguntas y enviárnoslo. Lo revisamos para verificar si hace falta algún dato antes de continuar.</p>
              </div>
            </li>
            <li className="visa-step">
              <div>
                <h3>Costo de la visa: $185</h3>
                <p>La visa tiene un costo de <strong>$185</strong>. Puedes pagarlo por <strong>Western Union</strong>, ya que ellos están gestionando el tema del cobro de visas, o por <strong>tarjeta</strong>, mediante un enlace que te compartiremos junto con las instrucciones para realizar ese pago.</p>
              </div>
            </li>
            <li className="visa-step">
              <div>
                <h3>Fecha de la cita</h3>
                <p>Las fechas de las citas las tenemos que verificar según se vaya realizando la solicitud. No podemos confirmar una fecha hasta que el proceso esté en curso.</p>
              </div>
            </li>
            <li className="visa-step">
              <div>
                <h3>Documentación y requisitos</h3>
                <p>Una vez que tengamos la fecha de la cita y hayamos entregado el formulario, te enviaremos al correo la documentación que debes imprimir para la cita y los requisitos que debes cumplir <strong>15 días antes</strong> de la cita.</p>
              </div>
            </li>
          </ol>
        </div>

        <div id="solicitud" className="visa-section">
          <div className="visa-form-card">
            <div>
              <p className="eyebrow"><span /> Empecemos</p>
              <h2>Solicita tu trámite</h2>
              <p>Completa el cuestionario de 21 preguntas con el mayor detalle posible. Lo revisamos para verificar que no falte ningún dato y te contactamos para coordinar el pago del trámite.</p>
            </div>
            <VisaForm turnstileSiteKey={turnstileSiteKey()} />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
