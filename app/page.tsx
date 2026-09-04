import type { Metadata } from 'next';
import { SiteLink as Link } from './ui/site-link';
import { Header } from './ui/header';
import { categories } from './data';
import { getTours,getTourStats,sortHomeTours } from './lib/tours';
import { getHomeFaqs,getReviewStats } from './lib/content';
import { getModuleCategories,getPageConfig } from './lib/site-config';
import { getMediaUrlByName } from './lib/media';
import { videoBackgroundSrc,videoEmbedSrc } from './lib/video';
import { Footer } from './ui/footer';
import { FaqList } from './ui/faq-list';
import { WhatsApp } from './ui/whatsapp';
import { TourCard } from './ui/tour-card';
import { HeroSlideshow } from './ui/hero-slideshow';

export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{const hero=await getPageConfig('home');return{title:hero.seoTitle||hero.title,description:hero.seoDescription||hero.description,keywords:(hero.seoKeywords||'').split(',').map(k=>k.trim()).filter(Boolean)};}
export default async function Home() {
  const [tours,hero,storedCategories]=await Promise.all([getTours(true),getPageConfig('home'),getModuleCategories('tour')]);
  const stats=await getTourStats();
  const reviewStats=await getReviewStats();
  const homeTours=sortHomeTours(tours,hero.tourSort||'manual',hero.tourOrder||[],stats);
  const homeCategories=(storedCategories.length?storedCategories.filter(c=>Number(c.show_home??1)===1):(categories as unknown as Record<string,unknown>[])).map(c=>{const demo=categories.find(d=>d.slug===String(c.slug));return{slug:String(c.slug),name:String(c.name),image:String(c.image||demo?.image||'/images/bongo-hero.png'),icon:String(demo?.icon||'⌁'),count:Number(demo?.count||0)};});
  const coffeeLogo=(await getMediaUrlByName('logo-circuuito-del-cafe-color-300x188.png'))||(await getMediaUrlByName('logo-circuito-del-cafe-color-300x188.png'))||'/images/logo-circuuito-del-cafe-color-300x188.png';
  const heroVideoUrl=hero.heroConfig?.type==='video'?(hero.heroConfig.videoUrl||''):'';
  const heroVideoEmbed=heroVideoUrl?videoEmbedSrc(heroVideoUrl):null;
  const heroVideoIframe=heroVideoEmbed?.type==='iframe'?videoBackgroundSrc(heroVideoUrl):null;
  const homeFaqs=await getHomeFaqs();
  const homeFaqGroups=[...new Set(homeFaqs.map((r:any)=>String(r.category_name)))].map((name:any)=>({name,items:homeFaqs.filter((r:any)=>String(r.category_name)===name).map((r:any)=>[String(r.question),String(r.answer)])}));
  return (
    <main>
      <Header transparent />
      <section className="hero" aria-labelledby="hero-title">
        {heroVideoEmbed?heroVideoEmbed.type==='iframe'?<iframe className="hero__media" src={heroVideoIframe!} title="Video de fondo" allow="autoplay; fullscreen; encrypted-media" allowFullScreen/>:<video className="hero__media" autoPlay muted loop playsInline src={heroVideoEmbed.src}/>:hero.heroConfig?.type==='slideshow'&&(hero.heroConfig.slides?.length??0)>0?<HeroSlideshow slides={hero.heroConfig.slides!}/>:<div className="hero__bg" style={{backgroundImage:`url(${hero.image})`}}/>}
        <div className="hero__shade" />
        <div className="hero__content shell">
          <p className="eyebrow eyebrow--light"><span /> {hero.eyebrow}</p>
          <h1 id="hero-title">{hero.title}</h1>
          <p>{hero.description}</p>
          <div className="hero__actions">
            {hero.buttons.map((button,index)=><Link key={`${button.label}-${index}`} className={`button ${button.style==='glass'?'button--glass':'button--primary'}`} href={button.url}>{button.label}{button.style!=='glass'&&<b>↗</b>}</Link>)}
          </div>
        </div>
        <div className="hero__meta shell">{hero.meta.map(item=><span key={item}>{item}</span>)}</div>
      </section>

      <section className="section shell" id="tours">
        <div className="section-heading">
          <div><p className="eyebrow"><span /> {hero.sections.tours.eyebrow}</p><h2>{hero.sections.tours.title}</h2></div>
          <Link className="text-link" href="/tours">Ver todos los tours <b>→</b></Link>
        </div>
        <div className="tour-grid">
          {homeTours.map((tour, index) => <TourCard tour={tour} index={index} rating={reviewStats.get(tour.slug)||0} key={tour.slug} style={hero.tourCardStyle}/>) }
        </div>
      </section>

      <section className="category-section"><div className="shell"><div className="section-heading"><div><p className="eyebrow"><span/> {hero.sections.categories.eyebrow}</p><h2>{hero.sections.categories.title}</h2></div><p className="section-intro">{hero.sections.categories.intro}</p></div><div className="category-grid">{homeCategories.map((category)=><Link className="category-card" href={`/tours?categoria=${category.slug}`} key={category.name}><img src={category.image} alt=""/><div className="category-card__shade"/><span className="category-card__icon">{category.icon}</span><div><small>{category.count} experiencias</small><h3>{category.name}</h3></div><b>→</b></Link>)}</div></div></section>

      <section className="destinations section shell"><div className="section-heading"><div><p className="eyebrow"><span/> {hero.sections.destinations.eyebrow}</p><h2>{hero.sections.destinations.title}</h2></div><p className="section-intro">{hero.sections.destinations.intro}</p></div><div className="destination-list"><Link href="/tours?destino=boquete"><span>01</span><h3>Boquete</h3><p>Montañas, café y senderos</p><b>12 tours →</b></Link><Link href="/tours?destino=chiriqui"><span>02</span><h3>Golfo de Chiriquí</h3><p>Islas, kayak y vida marina</p><b>9 tours →</b></Link><Link href="/tours?destino=pedasi"><span>03</span><h3>Pedasí</h3><p>Pacífico, surf y ballenas</p><b>6 tours →</b></Link></div></section>

      <section className="story"><div className="story__image"><img src={hero.sections.story.image} alt={hero.sections.story.title}/></div><div className="story__copy"><p className="eyebrow"><span/> {hero.sections.story.eyebrow}</p><h2>{hero.sections.story.title}</h2><p>{hero.sections.story.text}</p><Link className="button" href={hero.sections.story.linkUrl||'/responsabilidad-social'}>{hero.sections.story.linkLabel||'Nuestra historia'} <b>→</b></Link><div className="stats">{(hero.sections.story.stats||[]).map((stat,i)=><div key={i}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div></div></section>

      <section className="section shell coffee-circuit"><div className="coffee-circuit__inner"><img className="coffee-circuit__logo" src={coffeeLogo} alt="Circuito del Café"/><div className="coffee-circuit__copy"><p className="eyebrow"><span/> Aliados locales</p><h2>Miembros del Circuito del Café</h2><p>Formamos parte del Circuito del Café de Panamá, una red de experiencias y productores que celebran el café de altura de Chiriquí.</p><div className="coffee-circuit__actions"><a className="button button--primary" href="https://www.kayak.es/David.23013.guide" target="_blank" rel="noreferrer">Explora la Guía de viaje en David, Chiriquí <b>↗</b></a><a className="button" href="https://www.kayak.es/flights" target="_blank" rel="noreferrer">Reserva tus vuelos a David hoy mismo <b>↗</b></a></div></div></div></section>

      <section className="reviews-section section shell"><div className="section-heading"><div><p className="eyebrow"><span/> {hero.sections.reviews.eyebrow}</p><h2>{hero.sections.reviews.title}</h2></div><div className="review-score"><strong>4.9</strong><span>★★★★★<small>326 reseñas verificadas</small></span></div></div><div className="reviews-grid"><blockquote><span>“</span><p>Subir el Barú de madrugada fue espectacular. El guía nos cuidó en todo momento y el amanecer valió cada minuto.</p><footer><b>María C.</b><small>Volcán Barú 4×4 · Madrid</small></footer></blockquote><blockquote><span>“</span><p>Una atención cercana desde WhatsApp hasta el regreso. Boca Chica es un paraíso y el almuerzo estuvo delicioso.</p><footer><b>Carlos R.</b><small>Islas de Boca Chica · Panamá</small></footer></blockquote><blockquote><span>“</span><p>El tour de café fue claro, divertido y nada apresurado. Salimos entendiendo por qué Boquete produce cafés tan especiales.</p><footer><b>Ana P.</b><small>Tour de Café · Colombia</small></footer></blockquote></div></section>

      <section className="home-faq"><div className="shell home-faq__grid"><div><p className="eyebrow eyebrow--light"><span/> {hero.sections.faq.eyebrow}</p><h2>{hero.sections.faq.title}</h2><p>{hero.sections.faq.text}</p><Link className="button button--primary" href="/faqs">Ver todas las FAQs</Link></div>{homeFaqGroups.length?<FaqList customGroups={homeFaqGroups}/>:<FaqList compact/>}</div></section>
      <Footer/><WhatsApp/>
    </main>
  );
}
