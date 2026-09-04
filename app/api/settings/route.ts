import { NextResponse } from 'next/server';
import { getChatGPTUser,isAdminEmail } from '../../chatgpt-auth';
import { getPaymentMethods,setPaymentMethods } from '../../lib/settings';
export async function GET(){return NextResponse.json({paymentMethods:await getPaymentMethods()});}
export async function PATCH(request:Request){
  const user=await getChatGPTUser();
  if(!user||!isAdminEmail(user.email))return NextResponse.json({error:'Acceso de administrador requerido.'},{status:403});
  const body=await request.json() as Record<string,unknown>;
  const m=body.paymentMethods as Record<string,unknown>|undefined;
  if(!m)return NextResponse.json({error:'Datos inválidos.'},{status:400});
  await setPaymentMethods({cash:Boolean(m.cash),paguelo:Boolean(m.paguelo),paypal:Boolean(m.paypal)});
  return NextResponse.json({ok:true,paymentMethods:await getPaymentMethods()});
}
