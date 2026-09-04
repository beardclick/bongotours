export type VideoEmbed={type:'iframe'|'video';src:string};
export function videoEmbedSrc(url:string):VideoEmbed|null{
  if(!url)return null;
  const yt=url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if(yt)return{type:'iframe',src:`https://www.youtube.com/embed/${yt[1]}`};
  const vimeo=url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if(vimeo)return{type:'iframe',src:`https://player.vimeo.com/video/${vimeo[1]}`};
  return{type:'video',src:url};
}
export function videoBackgroundSrc(url:string):string|null{
  if(!url)return null;
  const yt=url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if(yt)return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}`;
  const vimeo=url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if(vimeo)return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=1&loop=1&background=1`;
  return url;
}
