import { ensureDatabase } from '../../db/runtime';
import { ensureCouponSchema, validateCoupon, type CouponItem } from './coupons';
import { getChatGPTUser } from '../chatgpt-auth';
import { verifyPayPalPayment } from './paypal';
import { notifyNewBooking } from './email';
import { syncBookingToNotion } from './notion';

type BookingRow={reference:string;customer_name:string;email:string;phone:string;tour_slug:string;tour_date:string;quantity:number;price_mode:string;total:number;status:string;payment_method:string;admin_notes?:string|null;notion_page_id?:string|null};
type PendingItem={tourSlug?:unknown;tourName?:unknown;tourDate?:unknown;quantity?:unknown;priceMode?:unknown;total?:unknown};
type PendingPayload={contact:Record<string,unknown>;items:PendingItem[];subtotal:number;discount:number;total:number;couponCode?:string;checkoutKey?:string};
const money=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;

export async function finalizePayPalOrder(orderId:string){
  const db=await ensureDatabase();await ensureCouponSchema(db);
  const pendingRow=await db.prepare('SELECT payload FROM pending_payments WHERE provider=? AND reference=?').bind('paypal',orderId).first<{payload:string}>();
  if(!pendingRow)return{ok:false as const,error:'No encontramos los datos del pedido. Inicia el pago de nuevo.',status:404};
  let payload:PendingPayload;
  try{payload=JSON.parse(pendingRow.payload) as PendingPayload;}catch{return{ok:false as const,error:'Los datos del pedido están dañados.',status:400};}
  const total=Math.max(0,Number(payload.total||0));
  const items=Array.isArray(payload.items)?payload.items:[];
  const contact=payload.contact&&typeof payload.contact==='object'?payload.contact:{};
  const checkoutKey=String(payload.checkoutKey||'');
  if(!items.length||!contact.customerName||!contact.email||!contact.phone||total<=0)return{ok:false as const,error:'Faltan datos del pedido pagado.',status:400};
  const previous=await db.prepare('SELECT * FROM bookings WHERE payment_reference=? AND checkout_key=? ORDER BY id').bind(orderId,checkoutKey).all();
  if(previous.results.length){await db.prepare(`UPDATE pending_payments SET status='completed' WHERE provider='paypal' AND reference=?`).bind(orderId).run();return{ok:true as const,orders:previous.results as BookingRow[],recovered:true,contact,items,total,subtotal:payload.subtotal,discount:payload.discount,couponCode:payload.couponCode};}
  if(!await verifyPayPalPayment(orderId,total))return{ok:false as const,error:'El importe pagado no coincide con el pedido.',status:402};
  const user=await getChatGPTUser();const now=new Date().toISOString();const email=String(contact.email).trim().toLowerCase();
  const cartItems=items.map(item=>({tourSlug:String(item.tourSlug??''),total:Math.max(0,Number(item.total||0))})) as CouponItem[];
  const cartSubtotal=cartItems.reduce((sum,item)=>sum+item.total,0);const paidDiscount=Math.max(0,Number(payload.discount||0));
  if(Math.abs(Math.max(0,cartSubtotal-paidDiscount)-total)>0.01)return{ok:false as const,error:'El resumen del carrito no coincide con el pago.',status:400};
  const couponCode=String(payload.couponCode??'').trim();
  const couponResult=couponCode?await validateCoupon(db,{code:couponCode,items:cartItems,email,userId:user?.userId,checkoutKey}):null;
  const coupon=couponResult?.valid?couponResult:null;
  let allocated=0;const eligibleIndexes=coupon?items.map((item,index)=>coupon.eligibleSlugs.has(String(item.tourSlug??''))?index:-1).filter(i=>i>=0):[];const lastEligible=eligibleIndexes.at(-1);
  const records=items.map((item,index)=>{const slug=String(item.tourSlug??'');if(!slug||!item.tourDate||!item.quantity||!item.priceMode)throw new Error('Uno de los productos pagados está incompleto.');const eligible=Boolean(coupon?.eligibleSlugs.has(slug));const itemDiscount=!coupon||!eligible?0:index===lastEligible?money(paidDiscount-allocated):money(paidDiscount*(Number(item.total)/coupon.eligibleSubtotal));allocated=money(allocated+itemDiscount);return{tourSlug:slug,tourDate:String(item.tourDate),quantity:Math.max(1,Number(item.quantity)),priceMode:String(item.priceMode),unitTotal:Math.max(0,Number(item.total||0)),discount:itemDiscount,total:money(Math.max(0,Number(item.total||0))-itemDiscount),reference:`BO-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0,4).toUpperCase()}`};});
  const statements=[];
  for(const r of records){statements.push(db.prepare(`INSERT INTO bookings (reference,user_id,tour_slug,customer_name,email,phone,tour_date,quantity,price_mode,total,payment_method,payment_reference,coupon_code,discount_amount,cart_subtotal,checkout_key,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(r.reference,user?.userId??null,r.tourSlug,String(contact.customerName),email,String(contact.phone),r.tourDate,r.quantity,r.priceMode,r.total,'paypal',orderId,couponCode||null,r.discount,cartSubtotal,checkoutKey,'completed',now,now));statements.push(db.prepare(`INSERT INTO booking_status_history (booking_reference,status,note,changed_by,created_at) VALUES (?,'completed','Pago verificado y capturado por PayPal',?,?)`).bind(r.reference,email,now));}
  if(coupon&&records[0])statements.push(db.prepare(`INSERT OR IGNORE INTO coupon_redemptions (coupon_id,checkout_key,booking_reference,user_id,email,discount_amount,created_at) VALUES (?,?,?,?,?,?,?)`).bind(coupon.coupon.id,checkoutKey,records[0].reference,user?.userId??null,email,paidDiscount,now));
  statements.push(db.prepare(`UPDATE pending_payments SET status='completed' WHERE provider='paypal' AND reference=?`).bind(orderId));
  await db.batch(statements);
  const saved=await db.prepare('SELECT * FROM bookings WHERE checkout_key=? AND email=? ORDER BY id').bind(checkoutKey,email).all();
  const orders=saved.results as BookingRow[];
  for(const order of orders){await notifyNewBooking(db,order);const pageId=await syncBookingToNotion(order);if(pageId)await db.prepare('UPDATE bookings SET notion_page_id=? WHERE reference=?').bind(pageId,order.reference).run();}
  return{ok:true as const,orders,contact,items,total,subtotal:payload.subtotal,discount:payload.discount,couponCode:payload.couponCode};
}
