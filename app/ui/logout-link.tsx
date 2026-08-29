'use client';
export function LogoutLink({href,className,children='Cerrar sesión'}:{href:string;className?:string;children?:React.ReactNode}){return <a className={className} href={href} onClick={event=>{if(!confirm('¿Seguro que quieres cerrar sesión?')){event.preventDefault();return;}sessionStorage.removeItem('bongo-welcome-shown');}}>{children}</a>}
