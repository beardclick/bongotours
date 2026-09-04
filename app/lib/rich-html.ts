import sanitizeHtml from 'sanitize-html';

const allowedTags=[
  'p','br','h2','h3','h4','h5','blockquote','ul','ol','li','strong','b','em','i','u','s',
  'a','img','figure','figcaption','hr','table','thead','tbody','tr','th','td','div','span',
];

export function sanitizeRichHtml(value:unknown){
  return sanitizeHtml(String(value??''),{
    allowedTags,
    allowedAttributes:{
      a:['href','title','target','rel'],
      img:['src','alt','title','width','height','loading'],
      '*':['class'],
    },
    allowedSchemes:['http','https','mailto','tel'],
    allowedSchemesByTag:{img:['http','https','data']},
    allowProtocolRelative:false,
    transformTags:{
      a:(_,attrs)=>({tagName:'a',attribs:{...attrs,...(attrs.target==='_blank'?{rel:'noopener noreferrer'}:{})}}),
      img:(_,attrs)=>({tagName:'img',attribs:{...attrs,loading:attrs.loading||'lazy'}}),
    },
    exclusiveFilter:frame=>frame.tag==='a'&&!frame.attribs.href,
  });
}
export function plainText(value:unknown){return String(value??'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#8211;|&ndash;/g,'–').replace(/&#8217;|&rsquo;/g,'’').replace(/&#8220;|&ldquo;/g,'“').replace(/&#8221;|&rdquo;/g,'”').replace(/&#(\d+);/g,(_,code)=>String.fromCharCode(Number(code))).replace(/\s+/g,' ').trim();}
