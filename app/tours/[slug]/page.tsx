import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { tours as demos } from '../../data';
import { getTour } from '../../lib/tours';
import { Header } from '../../ui/header';
import { Footer } from '../../ui/footer';
import { BookingWidget } from '../../ui/booking-widget';
import { WhatsApp } from '../../ui/whatsapp';
import { ReviewForm } from '../../ui/review-form';
import { ShareButtons } from '../../ui/share-buttons';
import { SectionNav } from '../../ui/section-nav';

export function generateStaticParams(){return demos.map(t=>({slug:t.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const tour=await getTour(slug);if(!tour)return{};return{title:tour.h1,description:tour.short,keywords:[tour.category,tour.location,'tours Panamá','Bongo Outdoors'],openGraph:{title:tour.h1,description:tour.short,images:[tour.image],type:'website'},twitter:{card:'summary_large_image',title:tour.h1,description:tour.short,images:[tour.image]}};}

const defaultIncluded=['Guía local certificado','Equipo necesario para la actividad','Agua y snack local','Seguro básico de actividad'];
const defaultExcluded=['Gastos personales o compras adicionales','Transporte fuera de la ruta indicada','Servicios no especificados en “Qué incluye”'];
const defaultBring=['Ropa cómoda y cambio seco','Protector solar y repelente','Calzado cerrado','Documento personal'];
const defaultRecommendations=['Llega al punto de encuentro con 15 minutos de anticipación.','Sigue en todo momento las instrucciones del guía y comunica cualquier condición médica relevante.'];

export default async function TourDetail({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const tour=await getTour(slug);if(!tour)notFound();
  const included=tour.includes?.length?tour.includes:defaultIncluded;
  const excluded=tour.notIncluded?.length?tour.notIncluded:defaultExcluded;
  const bring=tour.bring?.length?tour.bring:defaultBring;
  const recommendations=tour.recommendations?.length?tour.recommendations:defaultRecommendations;
  const prohibited=tour.prohibited?.length?tour.prohibited:['Alcohol durante la actividad','Mascotas sin autorización','Drones personales en áreas protegidas','Acciones que afecten la flora o fauna'];
  return <main><Header transparent/>
    <section className="tour-hero" style={{backgroundImage:`url(${tour.image})`}}><div className="tour-hero__shade"/><div className="shell"><p className="eyebrow eyebrow--light"><span/>{tour.category} · {tour.location}</p><h1>{tour.h1}</h1><div className="tour-hero__actions"><a href="#reservar" className="button button--primary">Reservar ahora <b>↓</b></a></div></div></section>
    <SectionNav items={[{label:'Resumen',href:'#resumen'},{label:'Detalles',href:'#detalles'},{label:'Incluye',href:'#incluye'},{label:'Recomendaciones',href:'#recomendaciones'},{label:'Galería',href:'#galeria'},{label:'Reseñas',href:'#resenas'},{label:'Reservar',href:'#reservar'}]}/>
    <section className="tour-detail shell"><article className="tour-copy" id="resumen"><p className="eyebrow"><span/> La experiencia</p><h2>Una forma distinta de conocer {tour.location}.</h2><p className="lead">{tour.short}</p><p>Prepárate para descubrir paisajes extraordinarios acompañado por un guía local. Mantenemos grupos pequeños para cuidar cada detalle, movernos con respeto y disfrutar el recorrido sin prisa.</p>
      <div className="share-panel"><ShareButtons title={tour.name} kind="tour"/></div>
      <div className="tour-spec-grid" id="detalles" aria-label="Detalles del tour">
        <div><span>▣</span><small>Fecha</small><b>Elige tu fecha</b></div><div><span>◷</span><small>Hora de salida</small><b>{tour.departureTime??'Por confirmar'}</b></div><div><span>⌖</span><small>Punto de encuentro</small><b>{tour.meetingPoint??tour.location}</b></div><div><span>◉</span><small>Duración</small><b>{tour.duration}</b></div><div><span>▱</span><small>Dificultad</small><b>{tour.difficulty} · {tour.difficultyScore}/10</b></div><div><span>♙</span><small>Capacidad</small><b>{tour.capacity}</b></div>
      </div>
      <div className="included-grid" id="incluye"><section className="included-card"><h3><span>✓</span>Qué incluye</h3><ul>{included.map(item=><li key={item}>✓ <span>{item}</span></li>)}</ul></section><section className="excluded-card"><h3><span>×</span>Qué no incluye</h3><ul>{excluded.map(item=><li key={item}>× <span>{item}</span></li>)}</ul></section></div>
      <section className="bring-section"><h3><span>▱</span>Qué debes llevar</h3><div>{bring.map(item=><p key={item}>✓ <b>{item}</b></p>)}</div></section>
      <section className="safety-card"><span>♢</span><h3>Tu seguridad es parte de la experiencia</h3><p>Cada salida se organiza tomando en cuenta las condiciones del destino, la dificultad del recorrido y las necesidades del grupo.</p><div><b>▰ Transporte coordinado</b><b>♙ Guía local cuando sea requerido</b></div></section>
      <section className="recommendation-card" id="recomendaciones"><h3>△ Recomendaciones del recorrido</h3><ul>{recommendations.map(item=><li key={item}>{item}</li>)}</ul></section>
      {tour.extraMessages?.map((message,index)=><section className="tour-extra-message" key={`${message}-${index}`}><h3>Información importante</h3><p>{message}</p></section>)}
      <section className="prohibited-card"><h3>⊘ No está permitido</h3><ul>{prohibited.map(item=><li key={item}>{item}</li>)}</ul></section>
      <section className="policy-card"><span>§</span><div><h3>Política de cancelación</h3><p>{tour.policy??'Reprogramación sin cargo avisando con 72 horas. Las condiciones climáticas y las políticas específicas del operador pueden aplicar; siempre recibirás los detalles antes de confirmar.'}</p></div></section>
      <div className="gallery" id="galeria"><img src={tour.image} alt={`${tour.name}, vista principal`}/><img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85" alt="Paisaje de aventura en Panamá"/><img src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=85" alt="Naturaleza tropical"/></div>
      <section className="review-form" id="resenas"><h2>¿Ya viviste esta aventura?</h2><p>Comparte tu experiencia. Todas las reseñas pasan por moderación antes de publicarse.</p><ReviewForm tourSlug={tour.slug}/></section>
    </article><BookingWidget tourSlug={tour.slug} tourName={tour.name} personPrice={tour.price} groupPrice={tour.groupPrice} priceType={tour.priceType} seasonPrices={tour.seasonPrices} minPeople={tour.minPeople} image={tour.image}/></section><Footer/><WhatsApp tour={tour.name}/></main>;
}
