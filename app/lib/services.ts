import { defaultServices, type Service, type ServicePriceType } from '../services-data';
import { getServices as getRows } from './content';

type ServiceRow = {
  slug: string;
  name: string;
  description: string;
  price_type: string;
  price: number;
  image: string | null;
};

function rowToService(row: ServiceRow): Service {
  const builtIn = defaultServices.find(service => service.slug === row.slug);
  const priceType: ServicePriceType = row.price_type === 'person' || row.price_type === 'group' ? row.price_type : 'service';
  return {
    slug: row.slug,
    name: row.name,
    h1: builtIn?.h1 ?? row.name,
    description: row.description,
    image: row.image || builtIn?.image || '/images/bongo-hero.png',
    price: Number(row.price || 0),
    priceType,
    location: builtIn?.location ?? 'Chiriquí y otras áreas de Panamá',
    duration: builtIn?.duration ?? 'Según servicio',
    includes: builtIn?.includes ?? ['Coordinación personalizada', 'Atención del equipo Bongo Outdoors', 'Entrega según el servicio contratado'],
    idealFor: builtIn?.idealFor ?? ['Viajeros', 'Grupos', 'Empresas', 'Hospedajes'],
  };
}

export async function getAllServices(): Promise<Service[]> {
  const rows = await getRows() as ServiceRow[];
  const custom = rows.map(rowToService);
  return [...custom, ...defaultServices.filter(service => !custom.some(item => item.slug === service.slug))];
}

export async function getService(slug: string): Promise<Service | undefined> {
  return (await getAllServices()).find(service => service.slug === slug);
}
