import { ensureDatabase } from '../../db/runtime';
export async function getServices(){try{const db=await ensureDatabase();return (await db.prepare(`SELECT name,slug,description,price_type,price,image FROM services WHERE active=1 ORDER BY id DESC`).all()).results}catch{return[]}}
export async function getLodgings(){try{const db=await ensureDatabase();return (await db.prepare(`SELECT name,slug,location,description,price_type,person_price,group_price,image FROM lodgings WHERE active=1 ORDER BY id DESC`).all()).results}catch{return[]}}
export async function getPosts(){try{const db=await ensureDatabase();return (await db.prepare(`SELECT title,slug,excerpt,content,cover_image,published_at FROM posts WHERE status='published' ORDER BY id DESC`).all()).results}catch{return[]}}
export async function getFaqs(){try{const db=await ensureDatabase();return (await db.prepare(`SELECT question,answer FROM faqs WHERE active=1 ORDER BY sort_order,id`).all()).results}catch{return[]}}
