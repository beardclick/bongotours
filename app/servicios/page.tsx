import type { Metadata } from 'next';
import { Header } from '../ui/header';
import { Footer } from '../ui/footer';
import { WhatsApp } from '../ui/whatsapp';
import { SiteLink as Link } from '../ui/site-link';
import { getAllServices } from '../lib/services';
import { getPageConfig } from '../lib/site-config';

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
  const [services,hero] = await Promise.all([getAllServices(),getPageConfig('services')]);
  return <main>
    <Header />
    <section className="page-hero page-hero--image" style={hero.image?{backgroundImage:`linear-gradient(132deg,rgba(8,13,13,.85),rgba(20,33,31,.72)),url(${hero.image})`}:undefined}><div className="shell"><p className="eyebrow eyebrow--light"><span /> {hero.eyebrow}</p><h1>{hero.title}</h1>{hero.description&&<p>{hero.description}</p>}<div className="hero__actions">{hero.buttons.map((b,i)=><Link key={i} className="button button--primary" href={b.url}>{b.label}</Link>)}</div></div></section>
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
