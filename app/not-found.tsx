import { Header } from './ui/header';
import { Footer } from './ui/footer';
import { WhatsApp } from './ui/whatsapp';
import { SiteLink as Link } from './ui/site-link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <main>
      <Header />
      <section className="page-hero page-hero--cream">
        <div className="shell">
          <p className="eyebrow"><span /> Error 404</p>
          <h1>Esta página no está disponible.</h1>
          <p>La página que buscas no está activa en este momento o cambió de dirección. Puedes volver al inicio o explorar nuestras experiencias.</p>
          <div className="relocation-hero__actions">
            <Link className="button button--primary" href="/">Ir al inicio <b>→</b></Link>
            <Link className="button" href="/tours">Ver tours</Link>
            <Link className="button" href="/contacto">Contacto</Link>
          </div>
        </div>
      </section>
      <section className="section shell">
        <div className="visa-overview">
          <div>
            <p className="eyebrow"><span /> Quizá te interese</p>
            <h2>Explora Panamá con nosotros</h2>
            <p>Volcanes, islas y bosques con guías locales. Si no encuentras lo que buscabas, escríbenos y te ayudamos.</p>
          </div>
          <div className="visa-prices">
            <Link className="visa-price-card" href="/tours">
              <small>Experiencias</small>
              <strong>Tours</strong>
              <p>Todas nuestras aventuras disponibles.</p>
            </Link>
            <Link className="visa-price-card" href="/hospedajes">
              <small>Descansa</small>
              <strong>Hospedajes</strong>
              <p>Cabañas y opciones para tu grupo.</p>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
      <WhatsApp />
    </main>
  );
}
