import type { Metadata } from 'next';
import { Header } from '../ui/header';import { Footer } from '../ui/footer';
import { FaqAccordion, type FaqItem } from '../ui/faq-accordion';

const faqs:FaqItem[]=[
  {question:'¿Qué tipo de servicios ofrecen para expats y extranjeros que quieren mudarse a Panamá?',answer:'Ofrecemos acompañamiento integral: visas y residencia, trámites migratorios, apertura de cuentas bancarias, constitución de sociedades, compra/alquiler de bienes raíces, y asesoría legal general para tu instalación en el país.'},
  {question:'¿Qué tipos de visa puedo tramitar?',answer:'Depende de tu perfil: Visa de Países Amigos, Visa de Solvencia Económica, Visa de Jubilado o Rentista, Visa de Inversionista, y otras categorías migratorias vigentes en Panamá. Te ayudamos a identificar cuál aplica a tu caso.'},
  {question:'¿Cuánto tiempo toma obtener la residencia en Panamá?',answer:'Los tiempos varían según el tipo de visa, pero muchos procesos de residencia pueden gestionarse en pocos días hábiles una vez reunida toda la documentación requerida.'},
  {question:'¿Qué documentos necesito para iniciar mi trámite migratorio?',answer:'Generalmente: pasaporte vigente, certificado de antecedentes penales apostillado, comprobante de solvencia económica o ingresos, fotografías y el formulario migratorio correspondiente.'},
  {question:'¿Puedo incluir a mi familia en el proceso de residencia?',answer:'Sí. La mayoría de las categorías migratorias permiten incluir a cónyuge y dependientes dentro de la misma solicitud.'},
  {question:'¿Me pueden ayudar a abrir una empresa o comprar un negocio en Panamá?',answer:'Sí. Brindamos asesoría legal comercial para constitución de sociedades, compra de negocios existentes, contratos comerciales y cumplimiento regulatorio.'},
  {question:'¿Ofrecen apoyo en bienes raíces (compra, venta o alquiler de propiedad)?',answer:'Sí. Te acompañamos en la búsqueda de vivienda, revisión legal de contratos de arrendamiento o compraventa, due diligence de la propiedad, y todo el respaldo jurídico necesario para una transacción de bienes raíces segura en Panamá.'},
  {question:'¿Puedo establecer residencia fiscal en Panamá sin vivir aquí todo el año?',answer:'Sí, Panamá permite establecer residencia fiscal sin necesidad de residencia permanente física, según ciertos requisitos legales que te explicamos según tu caso.'},
  {question:'¿Qué pasa si ya tengo mi visa pero necesito ayuda con otros trámites (cédula, bancos, colegios, etc.)?',answer:'Nuestro servicio no termina con la visa. Te apoyamos también en trámites prácticos de instalación: cédula de residente, apertura de cuentas bancarias, orientación sobre colegios y logística de llegada.'},
  {question:'¿Cómo empiezo el proceso?',answer:'Solo contáctanos y con gusto coordinamos una consulta inicial para evaluar tu caso, explicarte las opciones disponibles y diseñar contigo la ruta legal más adecuada para tu nueva vida en Panamá.'},
];

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Relocation Panama',description:'Asesoría legal, migratoria y de bienes raíces para tu mudanza a Panamá, junto a Panalegal & Co.'};

export default function RelocationPanama(){
  return <main><Header/>
    <section className="relocation-hero"><div className="shell"><p className="eyebrow eyebrow--light"><span/> Relocation Panamá</p><h1>Relocation <em>Panama</em></h1><p>Tu mudanza a Panamá, acompañada por expertos legales: migración, residencia, bienes raíces y la instalación completa de tu nueva vida.</p><div className="relocation-hero__actions"><a className="button button--primary" href="https://www.panalegalpa.com" target="_blank" rel="noreferrer">Visitar Panalegal & Co. <b>↗</b></a><a className="button button--glass" href="#faq">Ver preguntas frecuentes</a></div></div></section>

    <section className="shell relocation-body">
      <div className="relocation-partner">
        <span className="relocation-partner__icon">⚖️</span>
        <div><p className="eyebrow"><span/> Aliado legal</p><h2>Migración, Relocación y Trámites Legales en Panamá</h2><p>¿Buscas ayuda para tu mudanza a Panamá? Trabajamos con <strong>Panalegal &amp; Co.</strong>, una firma de abogados especializada, la cual podrá ayudarte con todo lo relacionado a tu nueva aventura en Panamá: desde tu proceso migratorio hasta la instalación completa de tu vida personal, bienes raíces o de negocios en el país.</p><a className="text-link" href="https://www.panalegalpa.com" target="_blank" rel="noreferrer">www.panalegalpa.com <b>→</b></a></div>
      </div>

      <div className="relocation-faq" id="faq">
        <div className="relocation-faq__head"><p className="eyebrow"><span/> Preguntas frecuentes</p><h2>Resolvemos tus dudas</h2></div>
        <FaqAccordion items={faqs}/>
        <p className="relocation-faq__note"><strong>Panalegal &amp; Co.</strong> te acompañará en cada paso de tu proceso migratorio, legal, de bienes raíces y de instalación en Panamá. <a href="https://www.panalegalpa.com" target="_blank" rel="noreferrer">www.panalegalpa.com</a></p>
      </div>
    </section>
    <Footer/></main>;
}
