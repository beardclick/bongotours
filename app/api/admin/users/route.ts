import { NextResponse } from 'next/server';
import { getChatGPTUser,isAdminEmail,supabaseAuthRequest } from '../../../chatgpt-auth';
import { ensureDatabase } from '../../../../db/runtime';
import { syncUserProfile } from '../../../lib/user-profile';

async function authorized(){const user=await getChatGPTUser();return Boolean(user&&isAdminEmail(user.email))}

export async function GET(request:Request){
  if(!await authorized())return NextResponse.json({error:'Acceso de administrador requerido.'},{status:403});
  const db=await ensureDatabase();
  const userId=new URL(request.url).searchParams.get('userId');
  if(userId){
    const [profile,orders]=await Promise.all([
      db.prepare('SELECT * FROM user_profiles WHERE user_id=?').bind(userId).first(),
      db.prepare('SELECT * FROM bookings WHERE user_id=? ORDER BY id DESC').bind(userId).all(),
    ]);
    if(!profile)return NextResponse.json({error:'Usuario no encontrado.'},{status:404});
    return NextResponse.json({profile,orders:orders.results});
  }
  const result=await db.prepare(`SELECT p.*,COUNT(b.id) AS order_count,COALESCE(SUM(b.total),0) AS order_total,MAX(b.created_at) AS last_order_at FROM user_profiles p LEFT JOIN bookings b ON b.user_id=p.user_id WHERE p.active=1 GROUP BY p.user_id ORDER BY p.created_at DESC`).all();
  return NextResponse.json(result.results);
}

export async function POST(request:Request){
  if(!await authorized())return NextResponse.json({error:'Acceso de administrador requerido.'},{status:403});
  const body=await request.json() as Record<string,unknown>;
  const email=String(body.email??'').trim().toLowerCase();
  const password=String(body.password??'');
  const fullName=String(body.fullName??'').trim().slice(0,160);
  if(!email||password.length<8)return NextResponse.json({error:'Escribe un correo válido y una contraseña temporal de al menos 8 caracteres.'},{status:400});
  const response=await supabaseAuthRequest('/signup',{method:'POST',body:JSON.stringify({email,password,data:{full_name:fullName}})});
  const data=await response.json() as {user?:{id?:unknown;email?:unknown;user_metadata?:Record<string,unknown>};msg?:string;error_description?:string};
  if(!response.ok||!data.user)return NextResponse.json({error:String(data.msg??data.error_description??'No se pudo crear el usuario.')},{status:response.status||400});
  await syncUserProfile(data.user);
  const db=await ensureDatabase();
  await db.prepare('UPDATE user_profiles SET phone=?,country=?,city=?,active=1,deleted_at=NULL,updated_at=? WHERE user_id=?').bind(String(body.phone??'').trim().slice(0,40),String(body.country??'Panamá').trim().slice(0,80),String(body.city??'').trim().slice(0,80),new Date().toISOString(),String(data.user.id)).run();
  return NextResponse.json({ok:true,userId:data.user.id,message:'Usuario creado correctamente.'});
}

export async function PATCH(request:Request){
  if(!await authorized())return NextResponse.json({error:'Acceso de administrador requerido.'},{status:403});
  const body=await request.json() as Record<string,unknown>;
  const userId=String(body.userId??'').trim();
  if(!userId)return NextResponse.json({error:'Usuario inválido.'},{status:400});
  const clean=(key:string,max=160)=>String(body[key]??'').trim().slice(0,max);
  const db=await ensureDatabase();
  await db.prepare('UPDATE user_profiles SET full_name=?,phone=?,country=?,city=?,emergency_contact=?,marketing_opt_in=?,updated_at=? WHERE user_id=?').bind(clean('fullName'),clean('phone',40),clean('country',80),clean('city',80),clean('emergencyContact'),body.marketingOptIn?1:0,new Date().toISOString(),userId).run();
  const profile=await db.prepare('SELECT * FROM user_profiles WHERE user_id=?').bind(userId).first();
  return NextResponse.json({ok:true,profile});
}

export async function DELETE(request:Request){
  const current=await getChatGPTUser();
  if(!current||!isAdminEmail(current.email))return NextResponse.json({error:'Acceso de administrador requerido.'},{status:403});
  const body=await request.json() as Record<string,unknown>;
  const userId=String(body.userId??'').trim();
  if(!userId||userId===current.userId)return NextResponse.json({error:'No puedes eliminar tu propia cuenta administrativa.'},{status:400});
  const db=await ensureDatabase();
  const profile=await db.prepare('SELECT email FROM user_profiles WHERE user_id=?').bind(userId).first<{email:string}>();
  if(!profile)return NextResponse.json({error:'Usuario no encontrado.'},{status:404});
  if(isAdminEmail(profile.email))return NextResponse.json({error:'No se puede eliminar otro administrador desde este panel.'},{status:400});
  const now=new Date().toISOString();
  await db.prepare('UPDATE user_profiles SET active=0,deleted_at=?,updated_at=? WHERE user_id=?').bind(now,now,userId).run();
  return NextResponse.json({ok:true,message:'Usuario eliminado y acceso bloqueado.'});
}
