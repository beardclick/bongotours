import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { env } from 'cloudflare:workers';
import './globals.css';
import { RevealEffects } from './ui/reveal-effects';
import { ScrollTop } from './ui/scroll-top';

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });
const runtimeValue=(key:string)=>String((env as unknown as Record<string,unknown>)[key]??process.env[key]??'').trim();

export async function generateMetadata(): Promise<Metadata> {
  const { getShareImage } = await import('./lib/settings');
  const shareImage = await getShareImage();
  return {
    title: { default: 'Bongo Outdoors Tours | Aventuras en Panamá', template: '%s | Bongo Outdoors' },
    description: 'Tours de aventura en Chiriquí, Boquete, Pedasí y otros destinos de Panamá. Reserva experiencias locales inolvidables con Bongo Outdoors.',
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bongoutdoors.com'),
    keywords: ['tours en Chiriquí','tours en Boquete','Volcán Barú','Boca Chica','Pedasí Panamá','Bongo Outdoors'],
    openGraph: { title:'Bongo Outdoors Tours', description:'Aventuras en Chiriquí & Pedasí, Panamá', images:[shareImage], locale:'es_PA', type:'website' },
    twitter: { card:'summary_large_image', title:'Bongo Outdoors Tours', description:'Aventuras en Chiriquí & Pedasí, Panamá', images:[shareImage] },
    icons: {
      icon: [
        { url:'/favicon-48.png', type:'image/png', sizes:'48x48' },
        { url:'/favicon-96.png', type:'image/png', sizes:'96x96' },
      ],
      apple: [{ url:'/apple-touch-icon.png', type:'image/png', sizes:'180x180' }],
    },
    manifest: '/site.webmanifest',
    verification: { google: runtimeValue('NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION') || undefined },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gaId=runtimeValue('NEXT_PUBLIC_GA_ID');
  const verification=runtimeValue('NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION');
  const organizationJsonLd={
    '@context':'https://schema.org',
    '@type':['Organization','TouristInformationCenter'],
    '@id':'https://bongoutdoors.com/#organization',
    name:'Bongo Outdoors Tours',
    url:'https://bongoutdoors.com/',
    logo:{'@type':'ImageObject',url:'https://bongoutdoors.com/images/bongo-logo.png',width:1080,height:1080},
    image:'https://bongoutdoors.com/images/bongo-logo.png',
    email:'info@bongoutdoors.com',
    telephone:'+507 6090-9741',
    address:{'@type':'PostalAddress',addressLocality:'Alto Boquete',addressRegion:'Chiriquí',addressCountry:'PA'},
    sameAs:['https://www.facebook.com/bongoutdoors/','https://twitter.com/bongoutdoors','https://www.instagram.com/bongo_tours/','https://www.tiktok.com/@bongo.tours','https://www.youtube.com/@bongo_tours/'],
  };
  return <html lang="es">
    <head>
      <link rel="icon" href="/favicon-48.png" type="image/png" sizes="48x48"/>
      <link rel="icon" href="/favicon-96.png" type="image/png" sizes="96x96"/>
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180"/>
      <link rel="manifest" href="/site.webmanifest"/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationJsonLd)}}/>
      {verification&&<meta name="google-site-verification" content={verification}/>}
      {gaId&&<>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}/>
        <script dangerouslySetInnerHTML={{__html:`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}}/>
      </>}
    </head>
    <body className={montserrat.variable}>{children}<RevealEffects/><ScrollTop/></body>
  </html>;
}
