import { NextResponse } from 'next/server';
import { getChatGPTUser } from '../../../chatgpt-auth';
import { ensureDatabase } from '../../../../db/runtime';
import { validateCoupon,type CouponItem } from '../../../lib/coupons';
import { priceCheckoutItems,type CheckoutItemInput } from '../../../lib/checkout-pricing';
import { verifyTurnstile } from '../../../lib/turnstile';
import { getPaymentMethods } from '../../../lib/settings';
import { notifyNewBooking } from '../../../lib/email';
import { syncBookingToNotion } from '../../../lib/notion';

type BookingRow={reference:string;customer_name:string;email:string;phone:string;tour_slug:string;tour_date:string;quantity:number;price_mode:string;total:number;status:string;payment_method:string;admin_notes?:string|null;notion_page_id?:string|null};
type CheckoutBody={customerName?:unknown;email?:unknown;phone?:unknown;items?:CheckoutItemInput[];couponCode?:unknown;checkoutKey?:unknown;turnstileToken?:unknown};
const money=(value:number)=>Math.round((value+Number.EPSILON)*100)/100;

export async function POST(request:Request){
  try{
    if(!(await getPaymentMethods()).cash)return NextResponse.json({error:'El pago en efectivo está deshabilitado temporalmente.'},{status:400});
    const body=await request.json() as CheckoutBody;
    if(!await verifyTurnstile(request,body.turnstileToken,'checkout'))return NextResponse.json({error:'Completa la verificación de seguridad.'},{status:400});
    const customerName=String(body.customerName??'').trim().slice(0,120);
    const email=String(body.email??'').trim().toLowerCase().slice(0,254);
    const phone=String(body.phone??'').trim().slice(0,40);
    if(customerName.length<2||!/^\S+@\S+\.\S+$/.test(email)||phone.length<7)return NextResponse.json({error:'Revisa tu nombre, correo y teléfono.'},{status:400});
    const checkoutKey=String(body.checkoutKey??crypto.randomUUID()).trim().slice(0,80);
    const [{items,subtotal},db,user]=await Promise.all([priceCheckoutItems(Array.isArray(body.items)?body.items:[]),ensureDatabase(),getChatGPTUser()]);
    const existing=await db.prepare('SELECT * FROM bookings WHERE checkout_key=? AND email=? ORDER BY id').bind(checkoutKey,email).all();
    if(existing.results.length)return NextResponse.json({ok:true,orders:existing.results,recovered:true,subtotal,total:existing.results.reduce((sum:number,row:any)=>sum+Number(row.total||0),0)});
    if(!user){const account=await db.prepare('SELECT user_id FROM user_profiles WHERE email=? AND deleted_at IS NULL LIMIT 1').bind(email).first();if(account)return NextResponse.json({error:'Este correo ya tiene una cuenta. Inicia sesión para continuar con tu pedido.'},{status:409});}
    const couponCode=String(body.couponCode??'').trim();
    const couponResult=couponCode?await validateCoupon(db,{code:couponCode,items:items as CouponItem[],email,userId:user?.userId,checkoutKey}):null;
    if(couponResult&&!couponResult.valid)return NextResponse.json({error:couponResult.error},{status:400});
    const coupon=couponResult?.valid?couponResult:null;
    const total=coupon?.total??subtotal;const discount=coupon?.discount??0;const now=new Date().toISOString();
    let allocated=0;const eligibleIndexes=coupon?items.map((item,index)=>coupon.eligibleSlugs.has(item.tourSlug)?index:-1).filter(index=>index>=0):[];const lastEligible=eligibleIndexes.at(-1);
    const records=items.map((item,index)=>{const eligible=Boolean(coupon?.eligibleSlugs.has(item.tourSlug));const itemDiscount=!coupon||!eligible?0:index===lastEligible?money(discount-allocated):money(discount*(item.total/coupon.eligibleSubtotal));allocated=money(allocated+itemDiscount);return{...item,discount:itemDiscount,total:money(item.total-itemDiscount),reference:`BO-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0,6).toUpperCase()}`}});
    const statements=[];
    for(const item of records){statements.push(db.prepare(`INSERT INTO bookings (reference,user_id,tour_slug,customer_name,email,phone,tour_date,quantity,price_mode,total,payment_method,payment_reference,coupon_code,discount_amount,cart_subtotal,checkout_key,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,'cash','',?,?,?,?,'pending',?,?)`).bind(item.reference,user?.userId??null,item.tourSlug,customerName,email,phone,item.tourDate,item.quantity,item.priceMode,item.total,coupon?.code??null,item.discount,subtotal,checkoutKey,now,now));statements.push(db.prepare(`INSERT INTO booking_status_history (booking_reference,status,note,changed_by,created_at) VALUES (?,'pending','Pedido creado — pago contra entrega',?,?)`).bind(item.reference,user?.email??email,now));}
    if(coupon&&records[0])statements.push(db.prepare(`INSERT OR IGNORE INTO coupon_redemptions (coupon_id,checkout_key,booking_reference,user_id,email,discount_amount,created_at) VALUES (?,?,?,?,?,?,?)`).bind(coupon.coupon.id,checkoutKey,records[0].reference,user?.userId??null,email,discount,now));
    await db.batch(statements);
    const saved=await db.prepare('SELECT * FROM bookings WHERE checkout_key=? AND email=? ORDER BY id').bind(checkoutKey,email).all();const orders=saved.results as BookingRow[];
    for(const order of orders){await notifyNewBooking(db,order);const pageId=await syncBookingToNotion(order);if(pageId)await db.prepare('UPDATE bookings SET notion_page_id=? WHERE reference=?').bind(pageId,order.reference).run()}
    return NextResponse.json({ok:true,orders,items,subtotal,discount,total,couponCode:coupon?.code});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'No se pudo confirmar el pedido.'},{status:400})}
}
