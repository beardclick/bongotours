export type ServicePriceType = 'service' | 'person' | 'group';

export type Service = {
  slug: string;
  name: string;
  h1: string;
  description: string;
  image: string;
  price: number;
  priceType: ServicePriceType;
  location: string;
  duration: string;
  includes: string[];
  idealFor: string[];
};

export const defaultServices: Service[] = [
  {
    slug: 'fotografia-drones',
    name: 'Fotografía y video con drones',
    h1: 'Servicio de fotografía y video con drones en Panamá',
    description: 'Tomas aéreas profesionales para parejas, grupos, hoteles, propiedades y producciones. Coordinamos el vuelo, la captura y la entrega de material editado según las condiciones del lugar.',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1800&q=85',
    price: 180,
    priceType: 'service',
    location: 'Chiriquí y otras áreas de Panamá',
    duration: 'Según proyecto',
    includes: ['Planificación de tomas', 'Piloto y operación del dron', 'Selección de material', 'Entrega digital'],
    idealFor: ['Tours y aventuras', 'Hoteles y hospedajes', 'Parejas y grupos', 'Contenido comercial'],
  },
  {
    slug: 'shuttle-panama',
    name: 'Shuttle Panamá',
    h1: 'Servicio de shuttle privado en Panamá',
    description: 'Traslados privados para conectar aeropuertos, Boquete, David, Boca Chica, Pedasí y otros destinos de Panamá con atención personalizada.',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1800&q=85',
    price: 0,
    priceType: 'group',
    location: 'Panamá',
    duration: 'Según ruta',
    includes: ['Traslado privado', 'Coordinación de horario', 'Asistencia por WhatsApp', 'Espacio para equipaje'],
    idealFor: ['Aeropuertos', 'Grupos', 'Conexiones entre destinos', 'Viajes privados'],
  },
  {
    slug: 'fotografia-aventura',
    name: 'Fotografía de aventura',
    h1: 'Fotografía profesional para tu aventura en Panamá',
    description: 'Documenta la experiencia sin preocuparte por la cámara. Capturamos los mejores momentos y entregamos una selección digital editada.',
    image: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1800&q=85',
    price: 65,
    priceType: 'group',
    location: 'Chiriquí y destinos seleccionados',
    duration: 'Según actividad',
    includes: ['Cobertura durante la experiencia', 'Selección de fotografías', 'Edición básica', 'Entrega digital'],
    idealFor: ['Parejas', 'Familias', 'Grupos de amigos', 'Marcas'],
  },
];
