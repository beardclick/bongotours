export type Tour = { slug:string; name:string; h1:string; category:string; location:string; price:number; groupPrice?:number; seasonPrices?:string; policy?:string; duration:string; difficulty:string; capacity:string; image:string; short:string; };

export const tours: Tour[] = [
  { slug:'kayak-chiriqui', name:'Tour en Kayak en Chiriquí', h1:'Tour en Kayak en Chiriquí, Panamá | Inolvidable', category:'Agua', location:'Golfo de Chiriquí', price:95, groupPrice:420, duration:'8 horas', difficulty:'Moderada', capacity:'2–10 personas', image:'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=85', short:'Rema entre islas tropicales, manglares y aguas cristalinas del Pacífico.' },
  { slug:'volcan-baru-4x4', name:'Vibrante Volcán Barú 4×4', h1:'Subir Volcán Barú en 4×4 | Vibrante Volcán Barú 4×4', category:'Montaña', location:'Boquete, Chiriquí', price:125, groupPrice:520, seasonPrices:'[{"name":"Temporada alta","start":"2026-12-15","end":"2027-04-15","personPrice":145,"groupPrice":590}]', duration:'6 horas', difficulty:'Media', capacity:'1–8 personas', image:'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=85', short:'Alcanza el punto más alto de Panamá y contempla dos océanos al amanecer.' },
  { slug:'cafe-boquete', name:'Tour de Café en Boquete', h1:'Tour de Café en Boquete con degustación / increíble', category:'Cultura', location:'Boquete, Chiriquí', price:48, duration:'3 horas', difficulty:'Fácil', capacity:'1–12 personas', image:'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=85', short:'Conoce el viaje del grano a la taza y degusta cafés de altura excepcionales.' },
  { slug:'islas-boca-chica', name:'Islas de Boca Chica', h1:'Tour de islas en Boca Chica, Chiriquí | Experiencia Inolvidable', category:'Islas', location:'Boca Chica, Chiriquí', price:110, groupPrice:560, duration:'Día completo', difficulty:'Fácil', capacity:'2–12 personas', image:'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=85', short:'Navega entre islas vírgenes, haz snorkel y relájate frente al Pacífico.' },
];

export const categories = [
  { name:'Montaña', icon:'△', count:7, image:tours[1].image },
  { name:'Agua e islas', icon:'≈', count:9, image:tours[3].image },
  { name:'Cultura y café', icon:'✦', count:5, image:tours[2].image },
  { name:'Bike tours', icon:'◉', count:4, image:'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=85' },
];
