import { SiteLink as Link } from './site-link';
import type { Tour } from '../data';

export function TourCard({tour,index,rating=0,style='classic'}:{tour:Tour;index:number;rating?:number;style?:'classic'|'overlay'}){
  const href=`/tours/${tour.slug}`;
  const full=Math.round(rating);
  const priceBlock=<div className="tour-card__price">{tour.priceOnRequest?<><small>Precio</small><strong>Consultar</strong></>:<><small>Desde</small><strong>${tour.price.toFixed(2)}</strong><span>/ {tour.priceType==='group'?'grupo':'persona'}</span></>}</div>;
  return <article className={`tour-card${style==='overlay'?' tour-card--overlay':''}`}>
    <Link href={href} className="tour-card__image" aria-label={`Ver ${tour.name}`}>
      <img src={tour.image} alt={tour.name}/>
      <span className={`tour-card__tag tour-card__tag--${tour.category.toLowerCase().includes('bike')?'bike':'adventure'}`}>{tour.category}</span>
      <span className="tour-card__index">{String(index+1).padStart(2,'0')}</span>
      {style==='overlay'&&priceBlock}
    </Link>
    <div className="tour-card__body">
      <div className="tour-card__location"><span>⌖</span>{tour.location}</div>
      <h2><Link href={href}>{tour.name}</Link></h2>
      {rating>0&&<div className="tour-card__rating" title={`${rating.toFixed(1)} de 5`}><span>{'★'.repeat(full)}{'☆'.repeat(Math.max(0,5-full))}</span><small>{rating.toFixed(1)}</small></div>}
      <p>{tour.short}</p>
      <div className="tour-card__facts" aria-label="Datos del tour">
        <span title="Cantidad mínima"><b>♙</b>{tour.minPeople} mín.</span>
        <span title="Dificultad"><b>◇</b>{tour.difficultyScore}/10</span>
        <span title="Duración"><b>◷</b>{tour.duration}</span>
      </div>
      {style!=='overlay'&&<div className="tour-card__footer">{priceBlock}</div>}
    </div>
  </article>;
}
