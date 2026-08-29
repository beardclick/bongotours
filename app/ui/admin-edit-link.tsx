'use client';
import { FaPen } from 'react-icons/fa6';
export function AdminEditLink({href,label}:{href:string;label:string}){return <a className="admin-edit-link" href={href} aria-label={label} title={label}><FaPen aria-hidden="true"/></a>}
