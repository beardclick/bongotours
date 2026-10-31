export function FeaturedBadge({badge,clickable=false}:{badge?:{icon:string;text:string;url:string};clickable?:boolean}){
  if(!badge||(!badge.icon&&!badge.text))return null;
  const isImage=/^(\/|https?:)/.test(badge.icon);
  const icon=isImage?<img className="featured-badge__icon" src={badge.icon} alt=""/>:<span className="featured-badge__icon featured-badge__icon--text">{badge.icon}</span>;
  const content=<>{icon}{badge.text&&<span className="featured-badge__text">{badge.text}</span>}</>;
  if(clickable&&badge.url)return <a className="featured-badge featured-badge--link" href={badge.url} target="_blank" rel="noreferrer" title={badge.text}>{content}</a>;
  return <span className="featured-badge" title={badge.text}>{content}</span>;
}
