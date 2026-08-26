type Item={label:string;href:string};
export function SectionNav({items}:{items:Item[]}){return <nav className="mobile-section-nav" aria-label="Secciones de esta página"><div>{items.map(item=><a key={item.href} href={item.href}>{item.label}</a>)}</div></nav>}
