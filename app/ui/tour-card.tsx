import Link from 'next/link';
import type { Tour } from '../data';

export function TourCard({tour,index}:{tour:Tour;index:number}){
  const href=`/tours/${tour.slug}`;
  return <article className="tour-card">
    <Link href={href} className="tour-card__image" aria-label={`Ver ${tour.name}`}>
      <img src={tour.image} alt={tour.name}/>
      <span className={`tour-card__tag tour-card__tag--${tour.category.toLowerCase().includes('bike')?'bike':'adventure'}`}>{tour.category}</span>
      <span className="tour-card__index">{String(index+1).padStart(2,'0')}</span>
    </Link>
    <div className="tour-card__body">
      <div className="tour-card__location"><span>⌖</span>{tour.location}</div>
      <h2><Link href={href}>{tour.name}</Link></h2>
      <p>{tour.short}</p>
      <div className="tour-card__facts" aria-label="Datos del tour">
        <span title="Cantidad mínima"><b>♙</b>{tour.minPeople} mín.</span>
        <span title="Dificultad"><b>◇</b>{tour.difficultyScore}/10</span>
        <span title="Duración"><b>◷</b>{tour.duration}</span>
      </div>
      <div className="tour-card__footer">
        <div><small>Desde</small><strong>${tour.price.toFixed(2)}</strong><span> / {tour.priceType==='group'?'grupo':'persona'}</span></div>
        <Link aria-label={`Abrir ${tour.name}`} href={href}>→</Link>
      </div>
    </div>
  </article>;
}
