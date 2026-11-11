import type { Metadata } from 'next';import { chatGPTSignOutPath,requireChatGPTAdmin } from '../chatgpt-auth';import { syncUserProfile } from '../lib/user-profile';import { AdminDashboard } from '../ui/admin-dashboard';import { WelcomeToast } from '../ui/welcome-toast';
export const dynamic='force-dynamic';export const metadata:Metadata={title:'Administración',robots:{index:false,follow:false}};
export default async function Admin({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const params=new URLSearchParams();
  const query=await searchParams;
  for(const key of ['tab','edit','new','order','user']){
    const value=query[key];
    if(typeof value==='string')params.set(key,value);
  }
  const user=await requireChatGPTAdmin(params.size?`/admin?${params}`:'/admin');
  await syncUserProfile({id:user.userId,email:user.email,user_metadata:{full_name:user.fullName??user.displayName}});
  return <><AdminDashboard signOutPath={chatGPTSignOutPath('/')} userName={user.displayName}/><WelcomeToast name={user.displayName}/></>;
}
