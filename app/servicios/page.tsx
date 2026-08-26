import type { Metadata } from 'next';
import { Header } from '../ui/header';
import { Footer } from '../ui/footer';
import { WhatsApp } from '../ui/whatsapp';
import { SiteLink as Link } from '../ui/site-link';
import { getAllServices } from '../lib/services';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Servicios: drones, fotografía y shuttle',
  description: 'Fotografía y video con drones, shuttle privado y servicios para complementar tu aventura en Panamá.',
};

function priceLabel(price: number, type: string) {
  if (!price) return 'Cotización personalizada';
  const unit = type === 'person' ? 'persona' : type === 'group' ? 'grupo' : 'servicio';
  return `Desde $${price.toFixed(2)} / ${unit}`;
}

export default async function Servicios() {
  const services = await getAllServices();
  return <main>
    <Header />
    <section className="page-hero page-hero--image"><div className="shell"><p className="eyebrow eyebrow--light"><span /> Complementa la aventura</p><h1>Servicios que hacen el viaje más fácil.</h1></div></section>
    <section className="section shell"><div className="service-grid">{services.map((service, index) => <article key={service.slug}>
      <Link className="service-card__image" href={`/servicios/${service.slug}`} aria-label={`Ver ${service.name}`}><img src={service.image} alt={service.name} /></Link>
      <span>{['◌','↝','◎'][index % 3]}</span>
      <h2><Link href={`/servicios/${service.slug}`}>{service.name}</Link></h2>
      <p>{service.description}</p>
      <b>{priceLabel(service.price, service.priceType)}</b>
      <Link className="button" href={`/servicios/${service.slug}`}>Ver servicio <b>→</b></Link>
    </article>)}</div></section>
    <Footer /><WhatsApp />
  </main>;
}
