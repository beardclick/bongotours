import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { defaultServices } from '../../services-data';
import { getService } from '../../lib/services';
import { Header } from '../../ui/header';
import { Footer } from '../../ui/footer';
import { WhatsApp } from '../../ui/whatsapp';
import { ShareButtons } from '../../ui/share-buttons';
import { SectionNav } from '../../ui/section-nav';
import { getChatGPTUser,isAdminEmail } from '../../chatgpt-auth';
import { AdminEditLink } from '../../ui/admin-edit-link';
import { ReviewForm } from '../../ui/review-form';
import { ReviewList } from '../../ui/review-list';
import { turnstileSiteKey } from '../../lib/turnstile';

export const dynamic = 'force-dynamic';
export function generateStaticParams() { return defaultServices.map(service => ({ slug: service.slug })); }
export async function generateMetadata({ params }: { params: Promise<{slug: string}> }): Promise<Metadata> {
  const service = await getService((await params).slug);
  return service ? { title: service.h1, description: service.description, openGraph: { title: service.h1, description: service.description, images: [service.image] } } : {};
}

function priceLabel(price: number, type: string) {
  if (!price) return 'Solicitar cotización';
  const unit = type === 'person' ? 'persona' : type === 'group' ? 'grupo' : 'servicio';
  return `$${price.toFixed(2)} / ${unit}`;
}

export default async function ServicePage({ params }: { params: Promise<{slug: string}> }) {
  const service = await getService((await params).slug);
  if (!service) notFound();
  const user = await getChatGPTUser();
  const isAdmin = Boolean(user && isAdminEmail(user.email));
  const isLoggedIn = Boolean(user);
  const message = encodeURIComponent(`Hola Bongo Outdoors, deseo cotizar ${service.name}. Página: https://bongo-outdoors-panama-tours.chiriquitech.chatgpt.site/servicios/${service.slug}`);
  return <main>
    <Header transparent />
    <section className="tour-hero service-hero" style={{ backgroundImage: `url(${service.image})` }}><div className="tour-hero__shade" /><div className="shell"><p className="eyebrow eyebrow--light"><span /> Servicio Bongo Outdoors</p><h1>{service.h1}</h1><div className="tour-hero__actions"><a href="#cotizar" className="button button--primary">Cotizar ahora <b>↓</b></a><ShareButtons title={service.name} kind="servicio" /></div></div></section>
    <SectionNav items={[{label:'Resumen',href:'#resumen'},{label:'Detalles',href:'#detalles'},{label:'Condiciones',href:'#condiciones'},{label:'Cotizar',href:'#cotizar'}]}/>
    <section className="fact-strip" id="detalles"><div className="shell"><div><span>⌖</span><small>Cobertura</small><b>{service.location}</b></div><div><span>◷</span><small>Duración</small><b>{service.duration}</b></div><div><span>◇</span><small>Modalidad</small><b>{service.priceType === 'person' ? 'Por persona' : service.priceType === 'group' ? 'Por grupo' : 'Por servicio'}</b></div><div><span>✦</span><small>Atención</small><b>Personalizada</b></div></div></section>
    <section className="tour-detail shell"><article className="tour-copy" id="resumen"><p className="eyebrow"><span /> El servicio</p><h2>Haz que cada detalle de tu experiencia cuente.</h2><p className="lead">{service.description}</p><p>Nuestro equipo coordina contigo el alcance, la ubicación, el horario y los entregables. Antes de confirmar revisamos disponibilidad, condiciones del lugar y cualquier requisito especial.</p><div className="detail-columns"><div><h3>✓ Qué incluye</h3><ul>{service.includes.map(item => <li key={item}>{item}</li>)}</ul></div><div><h3>◎ Ideal para</h3><ul>{service.idealFor.map(item => <li key={item}>{item}</li>)}</ul></div></div><div className="detail-block" id="condiciones"><h3>Disponibilidad y condiciones</h3><p>La operación depende del clima, permisos aplicables y condiciones de seguridad. Te confirmaremos todos los detalles antes de aceptar el servicio.</p></div><ReviewList slug={service.slug}/><ReviewForm tourSlug={service.slug} itemType="service" turnstileSiteKey={turnstileSiteKey()} isLoggedIn={isLoggedIn}/></article>
      <aside id="cotizar" className="stay-booking"><span className={`booking-mode ${service.priceType === 'group' ? 'booking-mode--group' : ''}`}>Tarifa por {service.priceType === 'person' ? 'persona' : service.priceType === 'group' ? 'grupo' : 'servicio'}</span><small>{service.price ? 'Desde' : 'Precio'}</small><div><strong>{priceLabel(service.price, service.priceType)}</strong></div><p>Respuesta y coordinación directa con Bongo Outdoors.</p><a className="button button--primary full" href={`https://wa.me/50760909741?text=${message}`} target="_blank" rel="noreferrer">Cotizar por WhatsApp <b>→</b></a></aside>
    </section>
    <Footer /><WhatsApp tour={service.name} />{isAdmin && <AdminEditLink href={`/admin?tab=service&edit=${service.slug}`} label="Editar servicio" />}
  </main>;
}
