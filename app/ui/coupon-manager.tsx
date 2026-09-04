'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Coupon = Record<string, unknown> & {
  id: number;
  code: string;
  discount_type: string;
  amount: number;
  usage_count: number;
  active: number;
};
type SelectOption = { value: string; label: string; search: string };
type ProductRow = { slug: string; name: string; type: string };
type UserRow = { user_id: string; email: string; full_name?: string | null };

const value = (row: Coupon | null, key: string) => row?.[key] == null ? '' : String(row[key]);
const splitValues = (input: string) => input.split(',').map(item => item.trim()).filter(Boolean);

function MultiSelectDropdown({ label, help, options, selected, onChange, placeholder }: {
  label: string;
  help: string;
  options: SelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? options.filter(option => option.search.includes(term)) : options;
  }, [options, query]);
  const labels = new Map(options.map(option => [option.value, option.label]));

  function toggle(optionValue: string) {
    onChange(selected.includes(optionValue)
      ? selected.filter(item => item !== optionValue)
      : [...selected, optionValue]);
  }

  return <div className="coupon-multiselect">
    <span className="coupon-multiselect__label">{label}</span>
    <details>
      <summary>{selected.length ? `${selected.length} seleccionado${selected.length === 1 ? '' : 's'}` : placeholder}<span>⌄</span></summary>
      <div className="coupon-multiselect__panel">
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar…" aria-label={`Buscar en ${label}`}/>
        <div className="coupon-multiselect__options">
          {filtered.length ? filtered.map(option => <label key={option.value}>
            <input type="checkbox" checked={selected.includes(option.value)} onChange={() => toggle(option.value)}/>
            <span>{option.label}</span>
          </label>) : <p>No hay coincidencias.</p>}
        </div>
      </div>
    </details>
    {selected.length > 0 && <div className="coupon-multiselect__chips">{selected.map(item => <button type="button" key={item} onClick={() => toggle(item)} title="Quitar">
      {labels.get(item) || item}<span>×</span>
    </button>)}</div>}
    <small>{help}</small>
  </div>;
}

function CouponEditor({ coupon, products, users, status, onStatus, onCancel, onSaved }: {
  coupon: Coupon | null;
  products: SelectOption[];
  users: SelectOption[];
  status: string;
  onStatus: (message: string) => void;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [productScope, setProductScope] = useState(value(coupon, 'product_scope') || 'all');
  const [productSlugs, setProductSlugs] = useState(() => splitValues(value(coupon, 'product_slugs')));
  const [allowedEmails, setAllowedEmails] = useState(() => splitValues(value(coupon, 'allowed_emails')));

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (productScope !== 'all' && productSlugs.length === 0) {
      onStatus('Selecciona al menos un producto para esta regla.');
      return;
    }
    onStatus('Guardando cupón…');
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, unknown>;
    data.active = data.active === 'on';
    data.productScope = productScope;
    data.productSlugs = productScope === 'all' ? '' : productSlugs.join(',');
    data.allowedEmails = allowedEmails.join(',');
    if (coupon?.id) data.id = coupon.id;
    const response = await fetch('/api/admin/coupons', {
      method: coupon?.id ? 'PUT' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      onStatus(result.error || 'No se pudo guardar.');
      return;
    }
    onStatus('Cupón guardado.');
    await onSaved();
  }

  return <section className="admin-card coupon-editor">
    <button className="admin-back" type="button" onClick={onCancel}>← Volver a cupones</button>
    <div className="admin-card__head"><div><h2>{coupon ? 'Editar' : 'Crear'} cupón</h2><p>Configura el descuento, vigencia y restricciones de uso.</p></div></div>
    <form className="admin-form" onSubmit={save}>
      <div className="form-row"><label>Código<input name="code" required defaultValue={value(coupon, 'code')} placeholder="BONGO10"/></label><label>Descripción<input name="description" defaultValue={value(coupon, 'description')}/></label></div>
      <div className="form-row"><label>Tipo de descuento<select name="discountType" defaultValue={value(coupon, 'discount_type') || 'percentage'}><option value="percentage">Porcentaje</option><option value="fixed">Monto fijo en carrito</option></select></label><label>Valor<input name="amount" type="number" min="0" step="0.01" required defaultValue={value(coupon, 'amount')}/></label></div>
      <div className="form-row"><label>Compra mínima<input name="minCartTotal" type="number" min="0" step="0.01" defaultValue={value(coupon, 'min_cart_total') || '0'}/></label><label>Descuento máximo<input name="maxDiscount" type="number" min="0" step="0.01" defaultValue={value(coupon, 'max_discount')}/><small>Opcional, útil para cupones porcentuales.</small></label></div>
      <div className="form-row"><label>Límite de usos general<input name="usageLimit" type="number" min="1" defaultValue={value(coupon, 'usage_limit')}/></label><label>Límite por usuario<input name="usageLimitPerUser" type="number" min="1" defaultValue={value(coupon, 'usage_limit_per_user')}/></label></div>
      <div className="form-row"><label>Inicio<input name="startAt" type="datetime-local" defaultValue={value(coupon, 'start_at').slice(0, 16)}/></label><label>Fin<input name="endAt" type="datetime-local" defaultValue={value(coupon, 'end_at').slice(0, 16)}/></label></div>
      <label>Aplicación por producto<select name="productScope" value={productScope} onChange={event => setProductScope(event.target.value)}><option value="all">Todos los productos</option><option value="include">Solo productos indicados</option><option value="exclude">Todos excepto los indicados</option></select></label>
      {productScope !== 'all' && <MultiSelectDropdown label="Productos indicados" help="Busca por nombre y marca uno o varios tours, servicios u hospedajes." options={products} selected={productSlugs} onChange={setProductSlugs} placeholder="Seleccionar productos"/>}
      <MultiSelectDropdown label="Usuarios permitidos" help="Opcional. Si no seleccionas usuarios, cualquier cliente podrá utilizar el cupón." options={users} selected={allowedEmails} onChange={setAllowedEmails} placeholder="Todos los usuarios"/>
      <label className="check-row"><input name="active" type="checkbox" defaultChecked={coupon ? Boolean(coupon.active) : true}/> Cupón activo</label>
      <div className="admin-form__actions"><span>{status}</span><button className="button button--primary">Guardar cupón</button></div>
    </form>
  </section>;
}

export function CouponManager() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [selected, setSelected] = useState<Coupon | null | undefined>(undefined);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [users, setUsers] = useState<SelectOption[]>([]);
  const [status, setStatus] = useState('');

  async function load() {
    const [couponsResponse, optionsResponse] = await Promise.all([
      fetch('/api/admin/coupons', { cache: 'no-store' }),
      fetch('/api/admin/coupons/options', { cache: 'no-store' }),
    ]);
    if (couponsResponse.ok) setRows(await couponsResponse.json() as Coupon[]);
    if (optionsResponse.ok) {
      const data = await optionsResponse.json() as { products: ProductRow[]; users: UserRow[] };
      setProducts(data.products.map(product => ({ value: product.slug, label: `${product.name} · ${product.type}`, search: `${product.name} ${product.type} ${product.slug}`.toLowerCase() })));
      setUsers(data.users.map(user => {
        const name = user.full_name?.trim() || 'Sin nombre';
        return { value: user.email.toLowerCase(), label: `${name} (${user.email})`, search: `${name} ${user.email}`.toLowerCase() };
      }));
    }
  }

  useEffect(() => { void load(); }, []);

  async function remove(row: Coupon) {
    if (!confirm(`¿Eliminar el cupón ${row.code}?`)) return;
    const response = await fetch('/api/admin/coupons', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: row.id }) });
    if (response.ok) {
      setStatus('Cupón eliminado o archivado.');
      await load();
    }
  }

  if (selected !== undefined) return <CouponEditor key={selected?.id || 'new'} coupon={selected} products={products} users={users} status={status} onStatus={setStatus} onCancel={() => setSelected(undefined)} onSaved={async () => { await load(); setSelected(undefined); }}/>;

  return <section className="admin-list">
    <div className="admin-list__head"><div><h2>Cupones</h2><p>Descuentos porcentuales o fijos con reglas por fecha, producto y usuario.</p></div><button className="button button--primary button--small" onClick={() => setSelected(null)}>+ Crear cupón</button></div>
    <div className="coupon-list">{rows.length ? rows.map(row => <article key={row.id}><div><b>{row.code}</b><span>{row.discount_type === 'percentage' ? `${row.amount}%` : `$${Number(row.amount).toFixed(2)}`} · {row.active ? 'Activo' : 'Inactivo'}</span></div><small>{Number(row.usage_count || 0)} usos</small><div className="admin-row-actions"><button onClick={() => setSelected(row)}>Ver / editar</button><button className="danger" onClick={() => void remove(row)}>Borrar</button></div></article>) : <div className="admin-empty"><span>%</span><p>Todavía no hay cupones.</p></div>}</div>
    <p className="admin-message">{status}</p>
  </section>;
}
