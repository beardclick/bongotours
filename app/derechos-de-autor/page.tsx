import { Header } from '../ui/header';import { Footer } from '../ui/footer';
import { getPageConfig } from '../lib/site-config';
const fallbackContent='<p>Los textos, fotografías, identidad visual y materiales publicados en este sitio pertenecen a Bongo Outdoors Tours o se utilizan con autorización de sus titulares.</p><p>No está permitida su reproducción comercial sin consentimiento previo por escrito. Para solicitar autorización, escribe a <a href="mailto:info@bongoutdoors.com">info@bongoutdoors.com</a>.</p>';
export const dynamic='force-dynamic';
export default async function Derechos(){const hero=await getPageConfig('derechos-de-autor');return <main><Header/><section className="page-hero page-hero--cream"><div className="shell"><p className="eyebrow"><span/> {hero.eyebrow}</p><h1>{hero.title}</h1></div></section><article className="section shell prose"><div dangerouslySetInnerHTML={{__html:hero.content||fallbackContent}}/></article><Footer/></main>}
