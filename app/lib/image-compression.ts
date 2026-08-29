const COMPRESSIBLE_TYPES=new Set(['image/jpeg','image/png','image/webp']);
export async function compressImage(file:File){
  if(!COMPRESSIBLE_TYPES.has(file.type))return file;
  try{const bitmap=await createImageBitmap(file);const maxSide=2000;const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));const width=Math.max(1,Math.round(bitmap.width*scale));const height=Math.max(1,Math.round(bitmap.height*scale));const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const context=canvas.getContext('2d');if(!context){bitmap.close();return file;}context.drawImage(bitmap,0,0,width,height);bitmap.close();const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',.82));if(!blob||blob.size>=file.size)return file;const base=file.name.replace(/\.[^.]+$/,'');return new File([blob],`${base}.webp`,{type:'image/webp',lastModified:Date.now()});}catch{return file;}
}
