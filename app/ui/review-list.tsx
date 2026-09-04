'use client';
import { useEffect,useState } from 'react';
type Row={name:string;rating:number;comment:string};
export function ReviewList({slug}:{slug:string}){const [rows,setRows]=useState<Row[]>([]);useEffect(()=>{fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`).then(r=>r.json()).then(data=>setRows(Array.isArray(data)?data:[])).catch(()=>{})},[slug]);if(!rows.length)return null;return <div className="review-list">{rows.map((r,i)=><blockquote key={i}><div className="review-list__stars">{'★'.repeat(Math.max(1,Math.min(5,Number(r.rating)||5)))}{'☆'.repeat(Math.max(0,5-Math.max(1,Math.min(5,Number(r.rating)||5))))}</div><p>{r.comment}</p><footer><b>{r.name}</b></footer></blockquote>)}</div>}
