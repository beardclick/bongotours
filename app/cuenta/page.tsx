import type { Metadata } from 'next';
import { Header } from '../ui/header';
import { Footer } from '../ui/footer';
import { requireChatGPTUser,chatGPTSignOutPath } from '../chatgpt-auth';
import { ensureDatabase } from '../../db/runtime';
import { AccountDashboard } from '../ui/account-dashboard';
export const dynamic='force-dynamic';export const metadata:Metadata={title:'Mi cuenta'};
export default async function Cuenta(){const user=await requireChatGPTUser('/cuenta');const db=await ensureDatabase();const [bookings,profile]=await Promise.all([db.prepare('SELECT reference,tour_slug,tour_date,quantity,total,status,payment_method,created_at FROM bookings WHERE user_id=? ORDER BY id DESC').bind(user.userId).all(),db.prepare('SELECT * FROM user_profiles WHERE user_id=?').bind(user.userId).first()]);return <main><Header/><AccountDashboard user={{displayName:user.displayName,email:user.email,fullName:user.fullName??user.displayName}} profile={(profile??{}) as Record<string,unknown>} bookings={bookings.results as Array<Record<string,unknown>>} signOutPath={chatGPTSignOutPath('/')}/><Footer/></main>}
