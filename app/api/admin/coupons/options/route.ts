import { NextResponse } from 'next/server';
import { getChatGPTUser, isAdminEmail } from '../../../../chatgpt-auth';
import { ensureDatabase } from '../../../../../db/runtime';

export async function GET() {
  const user = await getChatGPTUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Acceso requerido.' }, { status: 403 });
  }

  const db = await ensureDatabase();
  const [products, users] = await Promise.all([
    db.prepare(`
      SELECT slug,name,'Tour' AS type FROM tours WHERE status != 'deleted'
      UNION ALL SELECT slug,name,'Servicio' AS type FROM services WHERE active=1
      UNION ALL SELECT slug,name,'Hospedaje' AS type FROM lodgings WHERE active=1
      ORDER BY type,name
    `).all(),
    db.prepare(`
      SELECT user_id,email,full_name
      FROM user_profiles
      WHERE active=1 AND deleted_at IS NULL
      ORDER BY COALESCE(NULLIF(full_name,''),email),email
    `).all(),
  ]);

  return NextResponse.json({ products: products.results, users: users.results });
}
