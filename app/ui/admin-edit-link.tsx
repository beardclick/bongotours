'use client';
import { FaPen } from 'react-icons/fa6';
export function AdminEditLink({href,label,gray=false}:{href:string;label:string;gray?:boolean}){return <a className="admin-edit-link" href={href} style={gray?{background:"#5b6562"}:undefined} aria-label={label} title={label}><FaPen aria-hidden="true"/></a>}
