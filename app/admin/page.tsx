import type { Metadata } from 'next';import { requireChatGPTAdmin } from '../chatgpt-auth';import { AdminDashboard } from '../ui/admin-dashboard';
export const dynamic='force-dynamic';export const metadata:Metadata={title:'Administración',robots:{index:false,follow:false}};
export default async function Admin(){await requireChatGPTAdmin('/admin');return <AdminDashboard/>}
