import type { Metadata } from 'next';
import { SiteLink as Link } from '../ui/site-link';
import { Header } from '../ui/header';
import { Footer } from '../ui/footer';
import { WhatsApp } from '../ui/whatsapp';
import { getStays } from '../lib/lodgings';
import { getPageConfig } from '../lib/site-config';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Hospedajes y cabañas en Chiriquí',description:'Hospedajes seleccionados en Boquete y Chiriquí con tarifas por persona o grupo.'};
export default async function Hospedajes(){const [stays,hero]=await Promise.all([getStays(),getPageConfig('lodgings')]);return <main><Header/><section className="page-hero page-hero--green" style={hero.image?{backgroundImage:`linear-gradient(132deg,rgba(8,13,13,.88),rgba(20,33,31,.75)),url(${hero.image})`}:undefined}><div className="shell"><p className="eyebrow eyebrow--light"><span/> {hero.eyebrow}</p><h1>{hero.title}</h1><p>{hero.description}</p><div className="hero__actions">{hero.buttons.map((b,i)=><Link key={i} className="button button--primary" href={b.url}>{b.label}</Link>)}</div></div></section><section className="section shell"><div className="stay-grid">{stays.map(s=><article key={s.slug}><Link href={`/hospedajes/${s.slug}`}><img src={s.image} alt={s.name}/></Link><div><small>⌖ {s.location}</small><h2><Link href={`/hospedajes/${s.slug}`}>{s.name}</Link></h2><p>{s.description}</p><div className="stay-price"><span><b>${s.priceType==='group'?s.groupPrice:s.personPrice}</b> / {s.priceType==='group'?'grupo':'persona'}</span><span>{s.guests}</span></div><Link className="button" href={`/hospedajes/${s.slug}`}>Ver hospedaje <b>→</b></Link></div></article>)}</div></section><Footer/><WhatsApp/></main>}
