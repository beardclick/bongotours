import { defaultStays,type Stay } from '../lodgings-data';
import { getContentTombstones, getLodgings as getRows } from './content';

type StayRow={slug:string;name:string;location:string;description:string;price_type:string;person_price:number|null;group_price:number|null;image:string|null};
function rowToStay(row:StayRow):Stay{return{slug:row.slug,name:row.name,h1:`${row.name} en ${row.location}`,location:row.location,description:row.description,image:row.image||'/images/bongo-hero.png',priceType:row.price_type==='group'?'group':'person',personPrice:row.person_price??undefined,groupPrice:row.group_price??undefined,guests:'Consultar capacidad',amenities:['Ubicación estratégica','Atención local','Tours disponibles','Asistencia por WhatsApp']};}
export async function getStays(){const [rows,deleted]=await Promise.all([getRows() as Promise<StayRow[]>,getContentTombstones('lodgings')]);const custom=rows.map(rowToStay);return[...custom,...defaultStays.filter(d=>!deleted.has(d.slug)&&!custom.some(c=>c.slug===d.slug))];}
export async function getStay(slug:string){return(await getStays()).find(stay=>stay.slug===slug);}
