import { ensureDatabase } from '../../db/runtime';
import { tours as demoTours } from '../data';

export type CheckoutItemInput={tourSlug:unknown;tourDate:unknown;quantity:unknown;priceMode:unknown};
export type PricedCheckoutItem={tourSlug:string;tourName:string;tourDate:string;quantity:number;priceMode:'person'|'group';unitPrice:number;total:number};
type PriceRow={slug:string;name:string;price_type:string;person_price:number|null;group_price:number|null;season_prices:string|null;capacity:string|null;price_on_request:number|null};
type Season={start?:unknown;end?:unknown;personPrice?:unknown;groupPrice?:unknown};

const money=(value:number)=>Math.round((value+Number.EPSILON)*100)/100;
const panamaToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Panama',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function parseSeasons(value:string|null){try{const parsed=JSON.parse(value||'[]');return Array.isArray(parsed)?parsed as Season[]:[]}catch{return[]}}
function minPeople(value:string|null){const match=String(value||'').match(/\d+/);return match?Math.max(1,Number(match[0])):1}
function validDate(value:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const parsed=new Date(`${value}T12:00:00Z`);return !Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===value}

async function findPricing(slug:string):Promise<PriceRow|null>{
  const db=await ensureDatabase();
  const row=await db.prepare(`SELECT slug,name,price_type,person_price,group_price,season_prices,capacity,price_on_request FROM tours WHERE slug=? AND status='published' LIMIT 1`).bind(slug).first() as PriceRow|null;
  if(row)return row;
  const demo=demoTours.find(item=>item.slug===slug);
  return demo?{slug:demo.slug,name:demo.name,price_type:demo.priceType,person_price:demo.priceType==='person'?demo.price:null,group_price:demo.groupPrice??(demo.priceType==='group'?demo.price:null),season_prices:demo.seasonPrices??null,capacity:demo.capacity,price_on_request:demo.priceOnRequest?1:0}:null;
}

export async function priceCheckoutItem(input:CheckoutItemInput):Promise<PricedCheckoutItem>{
  const tourSlug=String(input.tourSlug??'').trim();
  const tourDate=String(input.tourDate??'').trim();
  const quantity=Number(input.quantity);
  const priceMode=String(input.priceMode??'');
  if(!tourSlug||tourSlug.length>160)throw new Error('El tour seleccionado no es válido.');
  if(!validDate(tourDate)||tourDate<panamaToday())throw new Error('Selecciona una fecha válida que no haya pasado.');
  if(!Number.isInteger(quantity)||quantity<1||quantity>50)throw new Error('La cantidad debe estar entre 1 y 50 personas.');
  if(priceMode!=='person'&&priceMode!=='group')throw new Error('La modalidad de precio no es válida.');
  const tour=await findPricing(tourSlug);
  if(!tour)throw new Error('El tour ya no está disponible.');
  if(tour.price_on_request)throw new Error('Este tour requiere confirmar el precio por WhatsApp.');
  if(quantity<minPeople(tour.capacity))throw new Error(`Este tour requiere un mínimo de ${minPeople(tour.capacity)} personas.`);
  const officialType=tour.price_type==='group'?'group':tour.price_type==='both'?priceMode:'person';
  if(tour.price_type!=='both'&&priceMode!==officialType)throw new Error(`La tarifa de este tour es por ${officialType==='group'?'grupo':'persona'}.`);
  const season=parseSeasons(tour.season_prices).find(item=>String(item.start??'')<=tourDate&&String(item.end??'')>=tourDate);
  const rawPrice=priceMode==='group'?(season?.groupPrice??tour.group_price):(season?.personPrice??tour.person_price);
  const unitPrice=Number(rawPrice);
  if(!Number.isFinite(unitPrice)||unitPrice<=0)throw new Error('El tour no tiene un precio disponible para esta fecha.');
  return{tourSlug,tourName:tour.name,tourDate,quantity,priceMode,unitPrice:money(unitPrice),total:money(priceMode==='group'?unitPrice:unitPrice*quantity)};
}

export async function priceCheckoutItems(inputs:CheckoutItemInput[]){
  if(!Array.isArray(inputs)||!inputs.length||inputs.length>20)throw new Error('El carrito debe contener entre 1 y 20 tours.');
  const keys=new Set<string>();
  for(const input of inputs){const key=`${String(input.tourSlug)}|${String(input.tourDate)}`;if(keys.has(key))throw new Error('El carrito contiene tours duplicados.');keys.add(key)}
  const items=await Promise.all(inputs.map(priceCheckoutItem));
  return{items,subtotal:money(items.reduce((sum,item)=>sum+item.total,0))};
}
