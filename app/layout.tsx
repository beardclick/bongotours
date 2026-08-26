import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });

export const metadata: Metadata = {
  title: { default: 'Bongo Outdoors Tours | Aventuras en Panamá', template: '%s | Bongo Outdoors' },
  description: 'Tours de aventura en Chiriquí, Boquete, Pedasí y otros destinos de Panamá. Reserva experiencias locales inolvidables con Bongo Outdoors.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bongoutdoors.com'),
  keywords: ['tours en Chiriquí','tours en Boquete','Volcán Barú','Boca Chica','Pedasí Panamá','Bongo Outdoors'],
  openGraph: { title:'Bongo Outdoors Tours', description:'Aventuras en Chiriquí & Pedasí, Panamá', images:['/og.png'], locale:'es_PA', type:'website' },
  twitter: { card:'summary_large_image', title:'Bongo Outdoors Tours', description:'Aventuras en Chiriquí & Pedasí, Panamá', images:['/og.png'] },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gaId=process.env.NEXT_PUBLIC_GA_ID;
  return <html lang="es"><body className={montserrat.variable}>{children}{gaId&&<><Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive"/><Script id="google-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}</Script></>}</body></html>;
}
