import { ensureDatabase } from '../../db/runtime';

export type PaymentMethods = {cash:boolean;paguelo:boolean;paypal:boolean};
export const defaultPaymentMethods:PaymentMethods = {cash:true,paguelo:true,paypal:true};

export async function getPaymentMethods():Promise<PaymentMethods>{
  try{
    const db=await ensureDatabase();
    const row=await db.prepare('SELECT value FROM settings WHERE key=?').bind('payment_methods').first<{value:string}>();
    if(!row)return defaultPaymentMethods;
    const parsed=JSON.parse(row.value) as Partial<PaymentMethods>;
    return {cash:parsed.cash!==false,paguelo:parsed.paguelo!==false,paypal:parsed.paypal!==false};
  }catch{return defaultPaymentMethods;}
}

export async function setPaymentMethods(methods:PaymentMethods):Promise<void>{
  const db=await ensureDatabase();
  await db.prepare(`INSERT INTO settings (key,value,updated_at) VALUES ('payment_methods',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at`).bind(JSON.stringify({cash:Boolean(methods.cash),paguelo:Boolean(methods.paguelo),paypal:Boolean(methods.paypal)}),new Date().toISOString()).run();
}
