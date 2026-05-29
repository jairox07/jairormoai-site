"use client";

import { useState, useMemo } from "react";
import {
  Package, AlertTriangle, Plus, Search, ShoppingCart,
  Pill, Scissors, Box, Star, ChevronDown, X, Check,
  TrendingDown, Download,
} from "lucide-react";
import { INVENTORY, type InventoryItem, type InventoryCategory } from "@/lib/data";
import { useApp } from "@/context/AppContext";

const CATEGORY_CONFIG: Record<InventoryCategory, { label: string; icon: React.ElementType; color: string; soft: string }> = {
  medicamento:     { label: 'Medicamentos',    icon: Pill,     color: '#7C3AED', soft: '#f5f3ff' },
  consumible:      { label: 'Consumibles',     icon: Package,  color: '#0EA5E9', soft: '#e0f2fe' },
  equipo:          { label: 'Equipo médico',   icon: Box,      color: '#64748B', soft: '#f1f5f9' },
  implante:        { label: 'Implantes',       icon: Star,     color: '#EC4899', soft: '#fdf2f8' },
  'producto-venta':{ label: 'Prod. de venta',  icon: ShoppingCart, color: '#16A34A', soft: '#f0fdf4' },
};

function formatMXN(n: number) {
  return n === 0 ? '—' : `$${n.toLocaleString('es-MX')} MXN`;
}

/* ─── Add / Edit item modal ─────────────────────────────────────── */
function ItemModal({
  item, onClose, onSave,
}: { item: Partial<InventoryItem> | null; onClose: () => void; onSave: (i: InventoryItem) => void }) {
  const [form, setForm] = useState<Partial<InventoryItem>>(item ?? {
    category: 'medicamento', unit: 'caja', stock: 0, minStock: 10, costPrice: 0, salePrice: 0,
  });
  function set(k: keyof InventoryItem, v: unknown) { setForm(p => ({ ...p, [k]: v })); }

  if (!item && item !== null) return null; // TypeScript guard

  const cls = "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-[520px] rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-200 px-6 py-4">
          <h2 className="text-[15px] font-semibold text-ink-900">{form.id ? 'Editar producto' : 'Agregar producto'}</h2>
          <button onClick={onClose} className="grid size-7 place-items-center rounded-lg text-ink-400 hover:bg-ink-100"><X size={15} /></button>
        </div>
        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[12px] font-semibold text-ink-700 mb-1">Nombre del producto *</label>
              <input className={cls} value={form.name ?? ''} onChange={e => set('name', e.target.value)} placeholder="Amoxicilina 500mg c/20" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink-700 mb-1">Categoría</label>
              <select className={cls} value={form.category} onChange={e => set('category', e.target.value as InventoryCategory)}>
                {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink-700 mb-1">SKU</label>
              <input className={cls} value={form.sku ?? ''} onChange={e => set('sku', e.target.value)} placeholder="MED-AMX-500" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink-700 mb-1">Stock actual</label>
              <input className={cls} type="number" min={0} value={form.stock ?? 0} onChange={e => set('stock', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink-700 mb-1">Stock mínimo</label>
              <input className={cls} type="number" min={0} value={form.minStock ?? 0} onChange={e => set('minStock', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink-700 mb-1">Unidad</label>
              <input className={cls} value={form.unit ?? ''} onChange={e => set('unit', e.target.value)} placeholder="caja, ampolleta, pieza…" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink-700 mb-1">Proveedor</label>
              <input className={cls} value={form.supplier ?? ''} onChange={e => set('supplier', e.target.value)} placeholder="Distribuidora IMEX" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink-700 mb-1">Precio de costo (MXN)</label>
              <input className={cls} type="number" min={0} value={form.costPrice ?? 0} onChange={e => set('costPrice', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink-700 mb-1">Precio de venta (MXN)</label>
              <input className={cls} type="number" min={0} value={form.salePrice ?? 0} onChange={e => set('salePrice', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink-700 mb-1">Fecha de caducidad</label>
              <input className={cls} type="date" value={form.expiresAt ?? ''} onChange={e => set('expiresAt', e.target.value)} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink-700 mb-1">Ubicación</label>
              <input className={cls} value={form.location ?? ''} onChange={e => set('location', e.target.value)} placeholder="Estante A-1" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-ink-100 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50">Cancelar</button>
          <button
            onClick={() => { if (form.name) onSave({ ...form as InventoryItem, id: form.id ?? `inv-${Date.now()}` }); }}
            className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90"
          >
            {form.id ? 'Guardar cambios' : 'Agregar producto'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function InventoryView() {
  const { toast } = useApp();
  const [items,       setItems]       = useState<InventoryItem[]>(INVENTORY);
  const [query,       setQuery]       = useState('');
  const [catFilter,   setCatFilter]   = useState<InventoryCategory | 'all'>('all');
  const [editItem,    setEditItem]    = useState<Partial<InventoryItem> | null | undefined>(undefined);
  const [selling,     setSelling]     = useState<InventoryItem | null>(null);
  const [sellQty,     setSellQty]     = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(i => {
      if (catFilter !== 'all' && i.category !== catFilter) return false;
      if (!q) return true;
      return [i.name, i.sku, i.supplier ?? ''].join(' ').toLowerCase().includes(q);
    });
  }, [items, query, catFilter]);

  const lowStock  = items.filter(i => i.stock <= i.minStock);
  const totalValue = items.reduce((a, i) => a + i.stock * i.costPrice, 0);

  function saveItem(item: InventoryItem) {
    setItems(p => {
      const idx = p.findIndex(x => x.id === item.id);
      if (idx >= 0) { const next = [...p]; next[idx] = item; return next; }
      return [item, ...p];
    });
    toast(item.id ? `"${item.name}" actualizado` : `"${item.name}" agregado al inventario`, 'success');
    setEditItem(undefined);
  }

  function sellItem(item: InventoryItem, qty: number) {
    if (qty > item.stock) { toast('Stock insuficiente', 'error'); return; }
    setItems(p => p.map(x => x.id === item.id ? { ...x, stock: x.stock - qty } : x));
    toast(`Venta registrada: ${qty}× ${item.name} · ${formatMXN(qty * item.salePrice)}`, 'success');
    setSelling(null);
    setSellQty(1);
  }

  const CATS: { id: InventoryCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Todos' },
    ...Object.entries(CATEGORY_CONFIG).map(([k, v]) => ({ id: k as InventoryCategory, label: v.label })),
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[18px] font-semibold tracking-tight text-ink-900">Inventario y Farmacia</h1>
            <p className="text-[12px] text-ink-500 mt-0.5">Medicamentos, consumibles, implantes y productos de venta al paciente</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toast('Exportando CSV…', 'info')}
              className="flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-[12px] font-medium text-ink-700 hover:bg-ink-50">
              <Download size={13} /> Exportar
            </button>
            <button onClick={() => setEditItem({})}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90">
              <Plus size={13} /> Agregar producto
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-ink-200 rounded-xl p-4">
            <p className="text-[22px] font-bold text-ink-900">{items.length}</p>
            <p className="text-[11px] text-ink-500 mt-0.5">SKUs totales</p>
          </div>
          <div className="bg-white border border-ink-200 rounded-xl p-4">
            <p className="text-[22px] font-bold text-amber-600">{lowStock.length}</p>
            <p className="text-[11px] text-ink-500 mt-0.5">Bajo stock mínimo</p>
          </div>
          <div className="bg-white border border-ink-200 rounded-xl p-4">
            <p className="text-[22px] font-bold text-emerald-600">${(totalValue / 1000).toFixed(0)}K</p>
            <p className="text-[11px] text-ink-500 mt-0.5">Valor total en almacén</p>
          </div>
          <div className="bg-white border border-ink-200 rounded-xl p-4">
            <p className="text-[22px] font-bold text-primary">
              {items.filter(i => i.salePrice > 0).length}
            </p>
            <p className="text-[11px] text-ink-500 mt-0.5">Productos en venta</p>
          </div>
        </div>

        {/* Alertas de stock bajo */}
        {lowStock.length > 0 && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-600" />
              <p className="text-[13px] font-semibold text-amber-900">Alertas de stock bajo ({lowStock.length})</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStock.map(i => (
                <span key={i.id} className="flex items-center gap-1.5 rounded-lg bg-white border border-amber-200 px-2.5 py-1 text-[11px]">
                  <TrendingDown size={11} className="text-amber-600" />
                  <span className="font-medium text-amber-900">{i.name}</span>
                  <span className="text-amber-600">· {i.stock}/{i.minStock} {i.unit}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nombre, SKU, proveedor..."
              className="h-9 w-full rounded-md border border-ink-200 bg-white pl-8 pr-3 text-[13px] text-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex items-center gap-1 bg-white border border-ink-200 rounded-md overflow-hidden text-[12px]">
            {CATS.map(c => (
              <button key={c.id} onClick={() => setCatFilter(c.id)}
                className={`px-3 py-1.5 font-medium transition-colors ${catFilter === c.id ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-50'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr>
                {['Producto', 'Categoría', 'SKU', 'Stock', 'Costo', 'Venta', 'Caducidad', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map(item => {
                const cat    = CATEGORY_CONFIG[item.category];
                const Icon   = cat.icon;
                const isLow  = item.stock <= item.minStock;
                return (
                  <tr key={item.id} className="hover:bg-ink-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[13px] font-medium text-ink-900">{item.name}</p>
                        {item.location && <p className="text-[10px] text-ink-400">{item.location}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 w-max rounded-md px-2 py-1 text-[11px] font-medium"
                            style={{ background: cat.soft, color: cat.color }}>
                        <Icon size={11} />
                        {cat.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] font-mono text-ink-500">{item.sku}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[13px] font-semibold tabular-nums ${isLow ? 'text-amber-600' : 'text-ink-900'}`}>
                          {item.stock}
                        </span>
                        <span className="text-[10px] text-ink-400">/ {item.minStock} min</span>
                        {isLow && <AlertTriangle size={11} className="text-amber-500" />}
                      </div>
                      {/* Stock bar */}
                      <div className="mt-1 h-1 w-16 rounded-full bg-ink-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                             style={{ width: `${Math.min((item.stock / Math.max(item.minStock * 2, 1)) * 100, 100)}%`,
                                      background: isLow ? '#F59E0B' : '#22C55E' }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-ink-600">{formatMXN(item.costPrice)}</td>
                    <td className="px-4 py-3 text-[12px] font-medium text-emerald-700">
                      {item.salePrice > 0 ? formatMXN(item.salePrice) : <span className="text-ink-400">No venta</span>}
                    </td>
                    <td className="px-4 py-3 text-[11px]">
                      {item.expiresAt ? (
                        <span className={(() => {
                          const days = Math.ceil((new Date(item.expiresAt).getTime() - Date.now()) / 86400000);
                          return days < 60 ? 'text-rose-600 font-medium' : days < 120 ? 'text-amber-600' : 'text-ink-500';
                        })()}>
                          {new Date(item.expiresAt).toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })}
                        </span>
                      ) : <span className="text-ink-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {item.salePrice > 0 && (
                          <button onClick={() => { setSelling(item); setSellQty(1); }}
                            className="flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100">
                            <ShoppingCart size={10} /> Vender
                          </button>
                        )}
                        <button onClick={() => setEditItem(item)}
                          className="rounded-md border border-ink-200 px-2 py-1 text-[11px] text-ink-600 hover:bg-ink-50">
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-[13px] text-ink-400">Sin productos que coincidan con la búsqueda</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit modal */}
      {editItem !== undefined && (
        <ItemModal item={editItem} onClose={() => setEditItem(undefined)} onSave={saveItem} />
      )}

      {/* Sell modal */}
      {selling && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelling(null)} />
          <div className="relative z-10 w-80 rounded-2xl bg-white shadow-2xl p-6">
            <h3 className="text-[14px] font-semibold text-ink-900 mb-1">Registrar venta</h3>
            <p className="text-[12px] text-ink-500 mb-4">{selling.name}</p>
            <label className="block text-[12px] font-semibold text-ink-700 mb-1">Cantidad ({selling.unit})</label>
            <input type="number" min={1} max={selling.stock} value={sellQty}
              onChange={e => setSellQty(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-[14px] text-ink-800 focus:outline-none focus:ring-2 focus:ring-primary/20 mb-2" />
            <p className="text-[12px] text-ink-500 mb-4">
              Total: <span className="font-semibold text-emerald-700">{formatMXN(sellQty * selling.salePrice)}</span>
              <span className="ml-2 text-ink-400">Stock disponible: {selling.stock}</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSelling(null)} className="flex-1 rounded-lg border border-ink-200 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50">Cancelar</button>
              <button onClick={() => sellItem(selling, sellQty)}
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700 flex items-center justify-center gap-1.5">
                <Check size={13} /> Confirmar venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
