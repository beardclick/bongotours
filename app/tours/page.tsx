import type { Metadata } from 'next';
import { SiteLink as Link } from '../ui/site-link';
import { categories } from '../data';
import { getTours } from '../lib/tours';
import { Header } from '../ui/header';
import { Footer } from '../ui/footer';
import { WhatsApp } from '../ui/whatsapp';
import { TourCard } from '../ui/tour-card';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Tours en Chiriquí y Panamá',description:'Explora tours de aventura, montaña, café, kayak e islas en Chiriquí, Pedasí y otros destinos de Panamá.'};

export default async function Tours({searchParams}:{searchParams:Promise<{categoria?:string;destino?:string}>}){
  const {categoria='',destino=''}=await searchParams;
  const allTours=await getTours();
  const selected=categories.find(c=>c.slug===categoria);
  const clean=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const filtered=allTours.filter(t=>{
    const matchesCategory=!categoria||(categoria==='bike'?clean(t.category).includes('bike'):selected?clean(t.category)===clean(selected.name):true);
    const destination=clean(destino);
    const place=clean(t.location);
    const matchesDestination=!destino||(destination==='chiriqui'?place.includes('chiriqui')||place.includes('boca chica')||place.includes('david'):place.includes(destination));
    return matchesCategory&&matchesDestination;
  });
  return <main><Header/><section className="page-hero page-hero--green"><div className="shell"><p className="eyebrow eyebrow--light"><span/> Explora Panamá</p><h1>Encuentra tu próxima aventura.</h1><p>Experiencias pequeñas, guías locales y paisajes que se quedan contigo.</p></div></section><section className="filter-bar"><div className="shell"><span>Filtrar por:</span><Link className={!categoria&&!destino?'active':''} href="/tours">Todos</Link>{categories.map(c=><Link className={categoria===c.slug?'active':''} key={c.slug} href={`/tours?categoria=${c.slug}`}>{c.name}</Link>)}</div></section><section className="section shell">{filtered.length?<div className="tour-grid">{filtered.map((tour,index)=><TourCard tour={tour} index={index} key={tour.slug}/>)}</div>:<div className="empty-state"><span>⌖</span><h2>No encontramos tours con ese filtro.</h2><p>Prueba otra categoría o revisa todas las experiencias disponibles.</p><Link className="button button--primary" href="/tours">Ver todos los tours</Link></div>}</section><Footer/><WhatsApp/></main>;
}
