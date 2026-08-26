import type { Metadata } from 'next';
import { SiteLink as Link } from '../ui/site-link';
import { categories as defaultCategories } from '../data';
import { getTours } from '../lib/tours';
import { getModuleCategories,getPageConfig } from '../lib/site-config';
import { Header } from '../ui/header';
import { Footer } from '../ui/footer';
import { WhatsApp } from '../ui/whatsapp';
import { TourCard } from '../ui/tour-card';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Tours en Chiriquí y Panamá',description:'Explora tours de aventura, montaña, café, kayak e islas en Chiriquí, Pedasí y otros destinos de Panamá.'};

export default async function Tours({searchParams}:{searchParams:Promise<{categoria?:string;destino?:string}>}){
  const {categoria='',destino=''}=await searchParams;
  const [allTours,storedCategories,hero]=await Promise.all([getTours(),getModuleCategories('tour'),getPageConfig('tours')]);
  const categories=storedCategories.length?storedCategories.map(c=>({name:String(c.name),slug:String(c.slug)})):defaultCategories;
  const selected=categories.find(c=>c.slug===categoria);
  const clean=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const filtered=allTours.filter(t=>{
    const matchesCategory=!categoria||(categoria==='bike'?clean(t.category).includes('bike'):selected?clean(t.category)===clean(selected.name):true);
    const destination=clean(destino);
    const place=clean(t.location);
    const matchesDestination=!destino||(destination==='chiriqui'?place.includes('chiriqui')||place.includes('boca chica')||place.includes('david'):place.includes(destination));
    return matchesCategory&&matchesDestination;
  });
  return <main><Header/><section className="page-hero page-hero--green" style={hero.image?{backgroundImage:`linear-gradient(132deg,rgba(8,13,13,.88),rgba(20,33,31,.78)),url(${hero.image})`}:undefined}><div className="shell"><p className="eyebrow eyebrow--light"><span/> {hero.eyebrow}</p><h1>{hero.title}</h1><p>{hero.description}</p>{hero.buttons.length>0&&<div className="hero__actions">{hero.buttons.map((b,i)=><Link key={i} className="button button--primary" href={b.url}>{b.label}</Link>)}</div>}</div></section><section className="filter-bar"><div className="shell"><span>Filtrar por:</span><Link className={!categoria&&!destino?'active':''} href="/tours">Todos</Link>{categories.map(c=><Link className={categoria===c.slug?'active':''} key={String(c.slug)} href={`/tours?categoria=${c.slug}`}>{c.name}</Link>)}</div></section><section className="section shell">{filtered.length?<div className="tour-grid">{filtered.map((tour,index)=><TourCard tour={tour} index={index} key={tour.slug}/>)}</div>:<div className="empty-state"><span>⌖</span><h2>No encontramos tours con ese filtro.</h2><p>Prueba otra categoría o revisa todas las experiencias disponibles.</p><Link className="button button--primary" href="/tours">Ver todos los tours</Link></div>}</section><Footer/><WhatsApp/></main>;
}
