import { SiteLink as Link } from './ui/site-link';
import { Header } from './ui/header';
import { categories } from './data';
import { getTours } from './lib/tours';
import { getPageConfig } from './lib/site-config';
import { Footer } from './ui/footer';
import { FaqList } from './ui/faq-list';
import { WhatsApp } from './ui/whatsapp';
import { TourCard } from './ui/tour-card';

export const dynamic='force-dynamic';
export default async function Home() {
  const [tours,hero]=await Promise.all([getTours(),getPageConfig('home')]);
  return (
    <main>
      <Header transparent />
      <section className="hero" aria-labelledby="hero-title" style={{backgroundImage:`url(${hero.image})`}}>
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
          <div><p className="eyebrow"><span /> Experiencias inolvidables</p><h2>Best adventure tours in<br />Chiriquí &amp; Pedasí, Panamá</h2></div>
          <Link className="text-link" href="/tours">Ver todos los tours <b>→</b></Link>
        </div>
        <div className="tour-grid">
          {tours.map((tour, index) => <TourCard tour={tour} index={index} key={tour.slug}/>) }
        </div>
      </section>

      <section className="category-section"><div className="shell"><div className="section-heading"><div><p className="eyebrow"><span/> Encuentra tu plan</p><h2>Aventuras para tu estilo</h2></div><p className="section-intro">Desde la cima del volcán hasta el azul del Pacífico. Elige cómo quieres vivir Panamá.</p></div><div className="category-grid">{categories.map((category)=><Link className="category-card" href={`/tours?categoria=${category.slug}`} key={category.name}><img src={category.image} alt=""/><div className="category-card__shade"/><span className="category-card__icon">{category.icon}</span><div><small>{category.count} experiencias</small><h3>{category.name}</h3></div><b>→</b></Link>)}</div></div></section>

      <section className="destinations section shell"><div className="section-heading"><div><p className="eyebrow"><span/> Destinos</p><h2>Panamá se vive<br/>al aire libre.</h2></div><p className="section-intro">Paisajes distintos, una misma energía. Conectamos cada salida con la gente, la cultura y la naturaleza del lugar.</p></div><div className="destination-list"><Link href="/tours?destino=boquete"><span>01</span><h3>Boquete</h3><p>Montañas, café y senderos</p><b>12 tours →</b></Link><Link href="/tours?destino=chiriqui"><span>02</span><h3>Golfo de Chiriquí</h3><p>Islas, kayak y vida marina</p><b>9 tours →</b></Link><Link href="/tours?destino=pedasi"><span>03</span><h3>Pedasí</h3><p>Pacífico, surf y ballenas</p><b>6 tours →</b></Link></div></section>

      <section className="story"><div className="story__image"><img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85" alt="Guía de montaña observando el paisaje"/></div><div className="story__copy"><p className="eyebrow"><span/> Más que un tour</p><h2>Conocemos el camino. Cuidamos el destino.</h2><p>Somos una empresa local nacida entre las montañas de Chiriquí. Cada experiencia apoya a guías, comunidades y pequeños negocios de la región.</p><Link className="button" href="/responsabilidad-social">Nuestra historia <b>→</b></Link><div className="stats"><div><strong>13+</strong><span>Años explorando</span></div><div><strong>4.9</strong><span>Valoración promedio</span></div><div><strong>8k+</strong><span>Viajeros felices</span></div></div></div></section>

      <section className="reviews-section section shell"><div className="section-heading"><div><p className="eyebrow"><span/> Ellos ya lo vivieron</p><h2>Historias que vuelven<br/>con una sonrisa.</h2></div><div className="review-score"><strong>4.9</strong><span>★★★★★<small>326 reseñas verificadas</small></span></div></div><div className="reviews-grid"><blockquote><span>“</span><p>Subir el Barú de madrugada fue espectacular. El guía nos cuidó en todo momento y el amanecer valió cada minuto.</p><footer><b>María C.</b><small>Volcán Barú 4×4 · Madrid</small></footer></blockquote><blockquote><span>“</span><p>Una atención cercana desde WhatsApp hasta el regreso. Boca Chica es un paraíso y el almuerzo estuvo delicioso.</p><footer><b>Carlos R.</b><small>Islas de Boca Chica · Panamá</small></footer></blockquote><blockquote><span>“</span><p>El tour de café fue claro, divertido y nada apresurado. Salimos entendiendo por qué Boquete produce cafés tan especiales.</p><footer><b>Ana P.</b><small>Tour de Café · Colombia</small></footer></blockquote></div></section>

      <section className="home-faq"><div className="shell home-faq__grid"><div><p className="eyebrow eyebrow--light"><span/> Antes de salir</p><h2>¿Tienes preguntas?</h2><p>Encuentra respuestas rápidas o escríbenos directamente. Estamos para ayudarte a elegir bien.</p><Link className="button button--primary" href="/faqs">Ver todas las FAQs</Link></div><FaqList compact/></div></section>
      <Footer/><WhatsApp/>
    </main>
  );
}
