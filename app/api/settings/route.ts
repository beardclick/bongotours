import { NextResponse } from 'next/server';
import { getChatGPTUser,isAdminEmail } from '../../chatgpt-auth';
import { getPaymentMethods,setPaymentMethods,getShareImage,setShareImage,getLiabilityWaiver,setLiabilityWaiver,getFooterLogos,setFooterLogos,type FooterLogo } from '../../lib/settings';
import { sanitizeRichHtml } from '../../lib/rich-html';
export async function GET(){return NextResponse.json({paymentMethods:await getPaymentMethods(),shareImage:await getShareImage(),liabilityWaiver:await getLiabilityWaiver(),footerLogos:await getFooterLogos()});}
export async function PATCH(request:Request){
  const user=await getChatGPTUser();
  if(!user||!isAdminEmail(user.email))return NextResponse.json({error:'Acceso de administrador requerido.'},{status:403});
  const body=await request.json() as Record<string,unknown>;
  if(Array.isArray(body.footerLogos)){
    await setFooterLogos(body.footerLogos as FooterLogo[]);
    return NextResponse.json({ok:true,footerLogos:await getFooterLogos()});
  }
  if(typeof body.shareImage==='string'){
    await setShareImage(body.shareImage);
    return NextResponse.json({ok:true,shareImage:await getShareImage()});
  }
  if(typeof body.liabilityWaiver==='string'){
    await setLiabilityWaiver(sanitizeRichHtml(body.liabilityWaiver));
    return NextResponse.json({ok:true,liabilityWaiver:await getLiabilityWaiver()});
  }
  const m=body.paymentMethods as Record<string,unknown>|undefined;
  if(!m)return NextResponse.json({error:'Datos inválidos.'},{status:400});
  await setPaymentMethods({cash:Boolean(m.cash),paguelo:Boolean(m.paguelo),paypal:Boolean(m.paypal)});
  return NextResponse.json({ok:true,paymentMethods:await getPaymentMethods(),shareImage:await getShareImage()});
}
