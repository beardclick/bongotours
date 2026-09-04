import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { defaultStays } from '../../lodgings-data';
import { getStay } from '../../lib/lodgings';
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

export const dynamic='force-dynamic';
export function generateStaticParams(){return defaultStays.map(s=>({slug:s.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const stay=await getStay((await params).slug);return stay?{title:stay.h1,description:stay.description}:{};}
export default async function StayPage({params}:{params:Promise<{slug:string}>}){const stay=await getStay((await params).slug);if(!stay)notFound();const user=await getChatGPTUser();const isAdmin=Boolean(user&&isAdminEmail(user.email));const isLoggedIn=Boolean(user);const price=stay.priceType==='group'?stay.groupPrice:stay.personPrice;const message=encodeURIComponent(`Hola, deseo consultar disponibilidad para ${stay.name} en ${stay.location}.`);return <main><Header transparent/><section className="stay-hero"><div className="stay-hero__image"><img src={stay.image} alt={stay.name}/></div><div className="shell stay-hero__content"><p className="eyebrow eyebrow--light"><span/> Hospedaje · {stay.location}</p><h1>{stay.h1}</h1><div className="tour-hero__actions"><ShareButtons title={stay.name} kind="hospedaje"/></div></div></section><SectionNav items={[{label:'Resumen',href:'#resumen'},{label:'Incluye',href:'#incluye'},{label:'Disponibilidad',href:'#disponibilidad'}]}/><section className="stay-detail shell"><article id="resumen"><p className="eyebrow"><span/> Tu base de aventura</p><h2>Descansa cerca de lo que quieres explorar.</h2><p className="lead">{stay.description}</p><h3 id="incluye">El hospedaje incluye</h3><div className="amenity-grid">{stay.amenities.map((a,i)=><span key={a}><b>{['⌂','◇','⌁','✓'][i%4]}</b>{a}</span>)}</div><p>La disponibilidad, horarios de llegada y condiciones finales se confirman directamente con nuestro equipo antes de reservar.</p><ReviewList slug={stay.slug}/><ReviewForm tourSlug={stay.slug} itemType="lodging" turnstileSiteKey={turnstileSiteKey()} isLoggedIn={isLoggedIn}/></article><aside className="stay-booking" id="disponibilidad"><span className="booking-mode">Tarifa por {stay.priceType==='group'?'grupo':'persona'}</span><small>Desde</small><div><strong>${price?.toFixed(2)}</strong> / {stay.priceType==='group'?'grupo':'persona'}</div><p>{stay.guests}</p><a className="button button--primary full" href={`https://wa.me/50760909741?text=${message}`} target="_blank" rel="noreferrer">Consultar por WhatsApp <b>→</b></a></aside></section><Footer/><WhatsApp tour={stay.name}/>{isAdmin&&<AdminEditLink href={`/admin?tab=lodging&edit=${stay.slug}`} label="Editar hospedaje"/>}</main>}
