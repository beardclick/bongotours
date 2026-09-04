import { env } from 'cloudflare:workers';

type NotionOrder = {
  reference:string; customer_name:string; email:string; phone:string|null;
  tour_slug:string; tour_date:string; quantity:number; total:number; status:string;
  notion_page_id?:string|null;
};

function notionConfig(){const runtime=env as unknown as Record<string,unknown>;const token=String(runtime.NOTION_TOKEN??'').trim();const databaseId=String(runtime.NOTION_DATABASE_ID??'').trim();return token&&databaseId?{token,databaseId}:null;}

function richText(value:string){return {rich_text:[{text:{content:String(value||'')}}]};}
function title(value:string){return {title:[{text:{content:String(value||'')}}]};}
function dateProp(value:string){return {date:{start:String(value||'')}};}
function numberProp(value:number){return {number:Number(value)||0};}
function selectProp(value:string){return {select:{name:String(value||'pending')}};}

const CANDIDATES:Record<string,string[]> = {
  name:['Name','Nombre','Tour','Experiencia','Título','Title'],
  date:['Fecha','Date','Fecha del tour','Tour Date'],
  client:['Cliente','Customer','Nombre del cliente'],
  email:['Email','Correo','Correo electrónico'],
  phone:['Teléfono','Phone','WhatsApp','Teléfono / WhatsApp'],
  quantity:['Cantidad','Quantity','Personas','Participantes'],
  total:['Total','Precio','Monto','Importe'],
  status:['Estado','Status','Etapa'],
  reference:['Referencia','Reference','Código'],
};

export async function syncBookingToNotion(order:NotionOrder):Promise<string|null>{
  const cfg=notionConfig();if(!cfg)return null;
  try{
    const schemaRes=await fetch(`https://api.notion.com/v1/databases/${cfg.databaseId}`,{headers:{Authorization:`Bearer ${cfg.token}`,'Notion-Version':'2022-06-28'},cache:'no-store'});
    if(!schemaRes.ok)return null;
    const schema=await schemaRes.json() as {properties?:Record<string,{type:string}>};
    const props=schema.properties??{};
    const pick=(keys:string[],types:string[])=>{for(const type of types){for(const key of keys){if(props[key]?.type===type)return {key,type};}}return null;};
    const set=(field:string,types:string[],build:(type:string)=>Record<string,unknown>)=>{const found=pick(CANDIDATES[field],types);return found?{[found.key]:build(found.type)}:{};};
    const properties:Record<string,unknown>={};
    const titleProp=Object.keys(props).find(k=>props[k].type==='title');
    if(titleProp)properties[titleProp]=title(`${order.tour_slug.replaceAll('-',' ')} — ${order.reference}`);
    Object.assign(properties,set('date',['date'],()=>dateProp(order.tour_date)));
    Object.assign(properties,set('client',['rich_text','title'],()=>richText(order.customer_name)));
    Object.assign(properties,set('email',['email','rich_text'],t=>t==='email'?{email:order.email}:richText(order.email)));
    Object.assign(properties,set('phone',['phone_number','rich_text'],t=>t==='phone_number'?{phone_number:order.phone||''}:richText(order.phone||'')));
    Object.assign(properties,set('quantity',['number'],()=>numberProp(order.quantity)));
    Object.assign(properties,set('total',['number'],()=>numberProp(order.total)));
    Object.assign(properties,set('status',['select','rich_text'],t=>t==='select'?selectProp(order.status):richText(order.status)));
    Object.assign(properties,set('reference',['rich_text','title'],()=>richText(order.reference)));
    const headers={Authorization:`Bearer ${cfg.token}`,'Notion-Version':'2022-06-28','Content-Type':'application/json'};
    if(order.notion_page_id){
      const res=await fetch(`https://api.notion.com/v1/pages/${order.notion_page_id}`,{method:'PATCH',headers,body:JSON.stringify({properties})});
      return res.ok?order.notion_page_id:null;
    }
    const res=await fetch('https://api.notion.com/v1/pages',{method:'POST',headers,body:JSON.stringify({parent:{database_id:cfg.databaseId},properties})});
    const data=await res.json() as {id?:string};
    return res.ok&&data.id?data.id:null;
  }catch{return null;}
}
