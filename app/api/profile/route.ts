import { NextResponse } from 'next/server';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { ensureDatabase } from '../../../db/runtime';

export async function GET(){
  const user=await requireChatGPTUser('/cuenta');
  const db=await ensureDatabase();
  const row=await db.prepare('SELECT * FROM user_profiles WHERE user_id=?').bind(user.userId).first();
  return NextResponse.json(row??{user_id:user.userId,email:user.email,full_name:user.fullName??user.displayName,phone:'',country:'Panamá',city:'',emergency_contact:'',marketing_opt_in:0});
}

export async function PUT(request:Request){
  const user=await requireChatGPTUser('/cuenta');
  const body=await request.json() as Record<string,unknown>;
  const clean=(key:string,max=160)=>String(body[key]??'').trim().slice(0,max);
  const now=new Date().toISOString();
  const db=await ensureDatabase();
  await db.prepare(`INSERT INTO user_profiles (user_id,email,full_name,phone,country,city,emergency_contact,marketing_opt_in,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET email=excluded.email,full_name=excluded.full_name,phone=excluded.phone,country=excluded.country,city=excluded.city,emergency_contact=excluded.emergency_contact,marketing_opt_in=excluded.marketing_opt_in,updated_at=excluded.updated_at`).bind(user.userId,user.email,clean('fullName'),clean('phone',40),clean('country',80),clean('city',80),clean('emergencyContact',160),body.marketingOptIn?1:0,now,now).run();
  return NextResponse.json({ok:true});
}
