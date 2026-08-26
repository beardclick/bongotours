import { getMenuItems } from '../lib/site-config';
import { HeaderClient } from './header-client';
import { getChatGPTUser,isAdminEmail } from '../chatgpt-auth';
export async function Header({transparent=false}:{transparent?:boolean}){const [items,user]=await Promise.all([getMenuItems(),getChatGPTUser()]);return <HeaderClient transparent={transparent} items={items} isAdmin={Boolean(user&&isAdminEmail(user.email))}/>}
