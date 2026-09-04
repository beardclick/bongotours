type D1Like={prepare:(sql:string)=>any;batch:(statements:any[])=>Promise<unknown>};
type CouponRow={id:number;code:string;discount_type:string;amount:number;min_cart_total:number;max_discount:number|null;usage_limit:number|null;usage_limit_per_user:number|null;product_scope:string;product_slugs:string|null;allowed_emails:string|null;start_at:string|null;end_at:string|null;active:number};
export type CouponItem={tourSlug:string;total:number;tourDate?:string;quantity?:number;priceMode?:'person'|'group'};
let couponReady:Promise<void>|null=null;

export function ensureCouponSchema(db:D1Like){
  if(!couponReady)couponReady=(async()=>{
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS coupons (id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT NOT NULL UNIQUE,description TEXT,discount_type TEXT NOT NULL DEFAULT 'percentage',amount REAL NOT NULL,min_cart_total REAL NOT NULL DEFAULT 0,max_discount REAL,usage_limit INTEGER,usage_limit_per_user INTEGER,product_scope TEXT NOT NULL DEFAULT 'all',product_slugs TEXT,allowed_emails TEXT,start_at TEXT,end_at TEXT,active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS coupon_redemptions (id INTEGER PRIMARY KEY AUTOINCREMENT,coupon_id INTEGER NOT NULL,checkout_key TEXT NOT NULL UNIQUE,booking_reference TEXT,user_id TEXT,email TEXT NOT NULL,discount_amount REAL NOT NULL,created_at TEXT NOT NULL)`),
      db.prepare('CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON coupon_redemptions(coupon_id)'),
      db.prepare('CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_email ON coupon_redemptions(coupon_id,email)'),
    ]);
    for(const sql of ['ALTER TABLE bookings ADD COLUMN coupon_code TEXT','ALTER TABLE bookings ADD COLUMN discount_amount REAL DEFAULT 0','ALTER TABLE bookings ADD COLUMN cart_subtotal REAL','ALTER TABLE bookings ADD COLUMN checkout_key TEXT'])try{await db.prepare(sql).run()}catch{}
  })();
  return couponReady;
}

const list=(value:string|null)=>String(value||'').split(',').map(item=>item.trim().toLowerCase()).filter(Boolean);
export async function validateCoupon(db:D1Like,{code,items,email,userId,checkoutKey}:{code:string;items:CouponItem[];email:string;userId?:string|null;checkoutKey?:string}){
  await ensureCouponSchema(db);
  const normalized=code.trim().toUpperCase();
  if(!normalized)return{valid:false as const,error:'Escribe un código de cupón.'};
  const coupon=await db.prepare('SELECT * FROM coupons WHERE code=? AND active=1').bind(normalized).first() as CouponRow|undefined;
  if(!coupon)return{valid:false as const,error:'El cupón no existe o está inactivo.'};
  const now=new Date().toISOString();
  if(coupon.start_at&&now<coupon.start_at)return{valid:false as const,error:'Este cupón todavía no está vigente.'};
  if(coupon.end_at&&now>coupon.end_at)return{valid:false as const,error:'Este cupón ya expiró.'};
  const cartSubtotal=items.reduce((sum,item)=>sum+Math.max(0,Number(item.total||0)),0);
  if(cartSubtotal<Number(coupon.min_cart_total||0))return{valid:false as const,error:`El pedido mínimo para este cupón es $${Number(coupon.min_cart_total).toFixed(2)}.`};
  const allowed=list(coupon.allowed_emails);const identity=email.trim().toLowerCase();
  if(allowed.length&&!allowed.includes(identity))return{valid:false as const,error:'Este cupón no está disponible para este usuario.'};
  const existing=checkoutKey?await db.prepare('SELECT id FROM coupon_redemptions WHERE checkout_key=? AND coupon_id=?').bind(checkoutKey,coupon.id).first():null;
  const totalUse=await db.prepare('SELECT COUNT(*) AS total FROM coupon_redemptions WHERE coupon_id=?').bind(coupon.id).first() as {total:number}|undefined;
  if(!existing&&coupon.usage_limit&&Number(totalUse?.total||0)>=coupon.usage_limit)return{valid:false as const,error:'Este cupón alcanzó su límite de uso.'};
  const userUse=await db.prepare('SELECT COUNT(*) AS total FROM coupon_redemptions WHERE coupon_id=? AND (email=? OR (? IS NOT NULL AND user_id=?))').bind(coupon.id,identity,userId??null,userId??null).first() as {total:number}|undefined;
  if(!existing&&coupon.usage_limit_per_user&&Number(userUse?.total||0)>=coupon.usage_limit_per_user)return{valid:false as const,error:'Ya alcanzaste el límite de uso de este cupón.'};
  const products=list(coupon.product_slugs);
  const eligible=items.filter(item=>coupon.product_scope==='all'||(coupon.product_scope==='include'&&products.includes(item.tourSlug.toLowerCase()))||(coupon.product_scope==='exclude'&&!products.includes(item.tourSlug.toLowerCase())));
  const eligibleSubtotal=eligible.reduce((sum,item)=>sum+Math.max(0,Number(item.total||0)),0);
  if(!eligibleSubtotal)return{valid:false as const,error:'Este cupón no aplica a los productos del carrito.'};
  let discount=coupon.discount_type==='fixed'?Number(coupon.amount):eligibleSubtotal*(Number(coupon.amount)/100);
  if(coupon.max_discount)discount=Math.min(discount,Number(coupon.max_discount));
  discount=Math.round(Math.min(eligibleSubtotal,Math.max(0,discount))*100)/100;
  return{valid:true as const,coupon,code:normalized,discount,cartSubtotal,eligibleSubtotal,total:Math.max(0,Math.round((cartSubtotal-discount)*100)/100),eligibleSlugs:new Set(eligible.map(item=>item.tourSlug))};
}
