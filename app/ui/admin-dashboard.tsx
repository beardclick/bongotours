'use client';

import { FormEvent, useEffect, useState } from 'react';
import { defaultServices } from '../services-data';

const tabs = [['tour','Tours'],['category','Categorías'],['service','Servicios'],['lodging','Hospedajes'],['post','Blog'],['faq','FAQs'],['policy','Políticas']];
type ServiceRow = { id?: number; name: string; slug: string; description: string; price: number; price_type: string; image?: string | null };

const field = (name: string, label: string, type = 'text', placeholder = '') => <label key={name}>{label}<input name={name} type={type} placeholder={placeholder} /></label>;

export function AdminDashboard() {
  const [tab, setTab] = useState('tour');
  const [status, setStatus] = useState('');
  const [serviceRows, setServiceRows] = useState<ServiceRow[]>([]);
  const [editingService, setEditingService] = useState<ServiceRow | null>(null);

  async function loadServices() {
    const res = await fetch('/api/content?type=services', { cache: 'no-store' });
    const rows = res.ok ? await res.json() as ServiceRow[] : [];
    const stored = new Map(rows.map(row => [row.slug, row]));
    const builtIns = defaultServices.map(service => stored.get(service.slug) ?? {
      name: service.name, slug: service.slug, description: service.description,
      price: service.price, price_type: service.priceType, image: service.image,
    });
    setServiceRows([...builtIns, ...rows.filter(row => !defaultServices.some(service => service.slug === row.slug))]);
  }

  useEffect(() => { if (tab === 'service') void loadServices(); }, [tab]);

  async function upload(file: File) {
    const data = new FormData(); data.append('file', file);
    const res = await fetch('/api/uploads', { method: 'POST', body: data });
    const json = await res.json() as {url?: string; error?: string};
    if (!res.ok) throw new Error(json.error || 'Falló la carga');
    return json.url!;
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setStatus('Guardando…');
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = { ...Object.fromEntries(formData.entries()), type: tab } as Record<string, unknown>;
    try {
      const cover = formData.get('coverFile');
      if (cover instanceof File && cover.size) body.coverImage = await upload(cover);
      const gallery = formData.getAll('galleryFiles').filter((file): file is File => file instanceof File && file.size > 0);
      if (gallery.length) body.gallery = JSON.stringify(await Promise.all(gallery.map(upload)));
      if (tab === 'service') body.image = body.coverImage || body.image;
      const res = await fetch('/api/content', { method: tab === 'service' && editingService ? 'PUT' : 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(body) });
      const data = await res.json() as {error?: string; slug?: string};
      setStatus(res.ok ? `Guardado correctamente${data.slug ? `: ${data.slug}` : ''}` : (data.error ?? 'No se pudo guardar'));
      if (res.ok) {
        form.reset();
        if (tab === 'service') { setEditingService(null); await loadServices(); }
      }
    } catch (error) { setStatus(error instanceof Error ? error.message : 'No se pudo guardar'); }
  }

  const title = tabs.find(item => item[0] === tab)?.[1] ?? '';
  return <div className="admin-layout"><aside className="admin-sidebar"><div><span className="admin-dot" />BONGO <small>ADMIN</small></div><nav>{tabs.map(([id,name]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setStatus(''); setEditingService(null); }}><span>{({tour:'⌁',category:'▦',service:'✦',lodging:'⌂',post:'¶',faq:'?',policy:'§'} as Record<string,string>)[id]}</span>{name}</button>)}</nav><a href="/">← Ver sitio</a></aside>
    <main className="admin-main"><header><div><p>Panel de contenido</p><h1>{title}</h1></div><div className="admin-avatar">BO</div></header>
      {tab === 'service' && <section className="admin-service-list"><div><h2>Servicios publicados</h2><button type="button" className="button button--small" onClick={() => { setEditingService(null); setStatus('Nuevo servicio'); }}>+ Nuevo servicio</button></div><div>{serviceRows.map(service => <button type="button" key={service.slug} className={editingService?.slug === service.slug ? 'active' : ''} onClick={() => { setEditingService(service); setStatus(`Editando: ${service.name}`); }}><span><b>{service.name}</b><small>/servicios/{service.slug}</small></span><em>Editar →</em></button>)}</div></section>}
      <section className="admin-card"><div className="admin-card__head"><div><h2>{editingService ? 'Editar servicio' : `Crear ${title.toLowerCase()}`}</h2><p>{tab === 'service' ? 'Cada servicio tendrá su propia página pública y enlace directo.' : 'Los cambios se guardan en la base de datos del sitio.'}</p></div><span className="status-pill">● Publicación</span></div>
        <form key={tab === 'service' ? editingService?.slug ?? 'new-service' : tab} className="admin-form" onSubmit={save}>
          {tab === 'tour' && <><div className="form-row">{field('name','Nombre del tour','text','Tour de senderismo')}{field('slug','URL amigable','text','tour-de-senderismo')}</div>{field('h1','H1 para SEO','text','Título principal del tour')}{field('metaDescription','Meta descripción','text','Resumen para Google')}{field('keywords','Palabras clave','text','boquete, senderismo, chiriquí')}<label>Descripción<textarea name="description" rows={4} /></label><div className="form-row">{field('location','Lugar')}{field('duration','Duración')}</div><div className="form-row">{field('difficulty','Dificultad')}{field('capacity','Capacidad')}</div><label>Modalidad de precio<select name="priceType"><option value="person">Por persona</option><option value="group">Por grupo</option><option value="both">Ambos</option></select></label><div className="form-row">{field('personPrice','Precio/persona','number')}{field('groupPrice','Precio/grupo','number')}</div><label>Precios por temporada (JSON)<textarea name="seasonPrices" rows={3} placeholder='[{"name":"Temporada alta","start":"2026-12-15","end":"2027-04-15","personPrice":145,"groupPrice":590}]' /></label>{field('policyId','ID de política específica (opcional)','number','Usa la política global si queda vacío')}{field('coverImage','URL de portada (opcional)','url','https://...')}<div className="form-row"><label>Subir portada<input name="coverFile" type="file" accept="image/*" /></label><label>Galería de fotos<input name="galleryFiles" type="file" accept="image/*" multiple /></label></div><div className="form-row"><label>Qué incluye<textarea name="includes" rows={3} /></label><label>Qué llevar<textarea name="bring" rows={3} /></label></div><label>No permitido<textarea name="prohibited" rows={2} /></label></>}
          {tab === 'category' && <>{field('name','Nombre de categoría')}<label>Descripción<textarea name="description" rows={4} /></label></>}
          {tab === 'service' && <><div className="form-row"><label>Nombre del servicio<input name="name" required defaultValue={editingService?.name ?? ''} /></label><label>URL amigable<input name="slug" required defaultValue={editingService?.slug ?? ''} placeholder="servicio-de-drones" /></label></div><label>Descripción<textarea name="description" rows={5} required defaultValue={editingService?.description ?? ''} /></label><div className="form-row"><label>Precio<input name="price" type="number" min="0" step="0.01" defaultValue={editingService?.price ?? 0} /></label><label>Modalidad<select name="priceType" defaultValue={editingService?.price_type ?? 'service'}><option value="service">Por servicio</option><option value="person">Por persona</option><option value="group">Por grupo</option></select></label></div><label>URL de imagen<input name="image" type="url" defaultValue={editingService?.image ?? ''} placeholder="https://..." /></label><label>O subir nueva imagen<input name="coverFile" type="file" accept="image/*" /></label></>}
          {tab === 'lodging' && <>{field('name','Nombre del hospedaje')}{field('location','Ubicación')}<label>Descripción<textarea name="description" rows={4} /></label><label>Modalidad<select name="priceType"><option value="person">Por persona</option><option value="group">Por grupo</option><option value="both">Ambos</option></select></label><div className="form-row">{field('personPrice','Precio/persona','number')}{field('groupPrice','Precio/grupo','number')}</div></>}
          {tab === 'post' && <>{field('title','Título del artículo')}<label>Extracto<textarea name="excerpt" rows={3} /></label><label>Contenido<textarea name="content" rows={10} /></label></>}
          {tab === 'faq' && <>{field('question','Pregunta')}<label>Respuesta<textarea name="answer" rows={5} /></label></>}
          {tab === 'policy' && <>{field('name','Nombre de la política')}<label>Contenido<textarea name="content" rows={8} /></label><label className="check"><input type="checkbox" name="isGlobal" /> Usar como política general para todos los tours</label></>}
          <div className="admin-form__actions"><span role="status">{status}</span><button className="button button--primary" type="submit">{editingService ? 'Guardar cambios' : 'Guardar y publicar'}</button></div>
        </form>
      </section>
    </main>
  </div>;
}
