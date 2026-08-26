import type { AnchorHTMLAttributes,ReactNode } from 'react';

type Props=Omit<AnchorHTMLAttributes<HTMLAnchorElement>,'href'>&{href:string;children:ReactNode};

/** Navegación HTML fiable en el runtime desplegado, sin prefetch RSC. */
export function SiteLink({href,children,...props}:Props){return <a href={href} {...props}>{children}</a>;}
