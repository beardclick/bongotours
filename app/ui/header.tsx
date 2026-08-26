import { getMenuItems } from '../lib/site-config';
import { HeaderClient } from './header-client';
export async function Header({transparent=false}:{transparent?:boolean}){const items=await getMenuItems();return <HeaderClient transparent={transparent} items={items}/>}
