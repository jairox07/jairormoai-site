"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  MessageCircle, GitBranch, Clock, Zap, User, Flag,
  CreditCard, CalendarDays, Plus, Trash2, X, Bot,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */
type NodeType = 'trigger' | 'message' | 'condition' | 'delay' | 'action' | 'end';

interface JNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  config?: Record<string, string>;
}

interface JEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

/* ─── Node type catalog ──────────────────────────────────────────── */
const NODE_TYPES: { type: NodeType; label: string; icon: React.ElementType; color: string }[] = [
  { type: 'trigger',   label: 'Trigger',    icon: Flag,          color: '#605BFF' },
  { type: 'message',   label: 'Mensaje',    icon: MessageCircle, color: '#0EA5E9' },
  { type: 'condition', label: 'Condición',  icon: GitBranch,     color: '#F59E0B' },
  { type: 'delay',     label: 'Espera',     icon: Clock,         color: '#8B5CF6' },
  { type: 'action',    label: 'Acción',     icon: Zap,           color: '#16A34A' },
  { type: 'end',       label: 'Fin',        icon: Flag,          color: '#DC2626' },
];

const NODE_COLOR: Record<NodeType, string> = {
  trigger:   '#605BFF',
  message:   '#0EA5E9',
  condition: '#F59E0B',
  delay:     '#8B5CF6',
  action:    '#16A34A',
  end:       '#DC2626',
};

/* ─── Initial demo journey ───────────────────────────────────────── */
const INIT_NODES: JNode[] = [
  { id: 'n1', type: 'trigger',   label: 'Mensaje recibido',        x: 60,  y: 80  },
  { id: 'n2', type: 'message',   label: 'Saludo inicial (Sofía)',   x: 60,  y: 200 },
  { id: 'n3', type: 'condition', label: '¿Interés en producto?',    x: 60,  y: 320 },
  { id: 'n4', type: 'message',   label: 'Enviar catálogo',          x: 60,  y: 440 },
  { id: 'n5', type: 'action',    label: 'Generar liga de pago',     x: 280, y: 320 },
  { id: 'n6', type: 'delay',     label: 'Esperar 24h',              x: 280, y: 440 },
  { id: 'n7', type: 'end',       label: 'Fin del journey',          x: 60,  y: 560 },
];

const INIT_EDGES: JEdge[] = [
  { id: 'e1', from: 'n1', to: 'n2' },
  { id: 'e2', from: 'n2', to: 'n3' },
  { id: 'e3', from: 'n3', to: 'n4', label: 'Sí' },
  { id: 'e4', from: 'n3', to: 'n5', label: 'No' },
  { id: 'e5', from: 'n4', to: 'n7' },
  { id: 'e6', from: 'n5', to: 'n6' },
];

const NODE_W = 180;
const NODE_H = 56;

let _nc = 100;
function nid() { return `n${++_nc}`; }
function eid() { return `e${++_nc}`; }

/* ─── Canvas ─────────────────────────────────────────────────────── */
export default function JourneyCanvas() {
  const [nodes, setNodes]       = useState<JNode[]>(INIT_NODES);
  const [edges, setEdges]       = useState<JEdge[]>(INIT_EDGES);
  const [selected, setSelected] = useState<string | null>(null);
  const [connecting, setConn]   = useState<string | null>(null); // source node id
  const [pan, setPan]           = useState({ x: 20, y: 20 });
  const [panning, setPanning]   = useState(false);
  const panStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const svgRef = useRef<SVGSVGElement>(null);
  const dragNode = useRef<{ id: string; ox: number; oy: number } | null>(null);

  /* ── Node drag ────────────────────────────────────────────────── */
  const onNodeMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (connecting) {
      // complete connection
      if (connecting !== id) {
        setEdges(p => [...p, { id: eid(), from: connecting, to: id }]);
      }
      setConn(null);
      return;
    }
    setSelected(id);
    const node = nodes.find(n => n.id === id)!;
    dragNode.current = { id, ox: e.clientX - node.x, oy: e.clientY - node.y };
  }, [nodes, connecting]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragNode.current) return;
      const { id, ox, oy } = dragNode.current;
      setNodes(p => p.map(n => n.id === id ? { ...n, x: e.clientX - ox, y: e.clientY - oy } : n));
    }
    function onUp() { dragNode.current = null; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  /* ── Canvas pan ───────────────────────────────────────────────── */
  function onCanvasMouseDown(e: React.MouseEvent) {
    if (e.target !== svgRef.current) return;
    setSelected(null);
    if (connecting) { setConn(null); return; }
    setPanning(true);
    panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
  }
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!panning) return;
      setPan({
        x: panStart.current.px + e.clientX - panStart.current.mx,
        y: panStart.current.py + e.clientY - panStart.current.my,
      });
    }
    function onUp() { setPanning(false); }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [panning]);

  /* ── Add node ─────────────────────────────────────────────────── */
  function addNode(type: NodeType) {
    const def = NODE_TYPES.find(t => t.type === type)!;
    setNodes(p => [...p, {
      id: nid(), type, label: def.label,
      x: 200 - pan.x + Math.random() * 60,
      y: 200 - pan.y + Math.random() * 60,
    }]);
  }

  /* ── Delete node ──────────────────────────────────────────────── */
  function deleteNode(id: string) {
    setNodes(p => p.filter(n => n.id !== id));
    setEdges(p => p.filter(e => e.from !== id && e.to !== id));
    if (selected === id) setSelected(null);
  }

  /* ── Edge path ────────────────────────────────────────────────── */
  function edgePath(from: JNode, to: JNode) {
    const x1 = from.x + NODE_W / 2;
    const y1 = from.y + NODE_H;
    const x2 = to.x + NODE_W / 2;
    const y2 = to.y;
    const cy = (y1 + y2) / 2;
    return `M${x1},${y1} C${x1},${cy} ${x2},${cy} ${x2},${y2}`;
  }

  const selNode = nodes.find(n => n.id === selected);

  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
      {/* ── Sidebar: node palette ─────────────────────────────────── */}
      <div className="w-44 shrink-0 flex flex-col border-r border-ink-200 bg-white p-3 gap-1.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400 mb-1 px-1">Nodos</p>
        {NODE_TYPES.map(nt => {
          const Icon = nt.icon;
          return (
            <button
              key={nt.type}
              onClick={() => addNode(nt.type)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium text-ink-700 hover:bg-ink-50 border border-ink-200 transition-colors"
            >
              <div className="grid size-6 shrink-0 place-items-center rounded-md" style={{ background: nt.color + '20' }}>
                <Icon size={12} style={{ color: nt.color }} />
              </div>
              {nt.label}
            </button>
          );
        })}

        <div className="mt-2 pt-2 border-t border-ink-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400 mb-1 px-1">Canvas</p>
          <button
            onClick={() => setConn(connecting ? null : (selected ?? null))}
            className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-medium border transition-colors ${connecting ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-ink-200 text-ink-700 hover:bg-ink-50'}`}
          >
            <GitBranch size={12} />
            {connecting ? 'Cancelar conexión' : 'Conectar nodos'}
          </button>
        </div>
      </div>

      {/* ── Canvas area ───────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden" style={{ cursor: panning ? 'grabbing' : connecting ? 'crosshair' : 'default' }}>
        <svg
          ref={svgRef}
          className="w-full h-full"
          onMouseDown={onCanvasMouseDown}
        >
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
            </marker>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#e2e8f0" />
            </pattern>
          </defs>

          {/* Grid background */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          <g transform={`translate(${pan.x},${pan.y})`}>
            {/* Edges */}
            {edges.map(edge => {
              const from = nodes.find(n => n.id === edge.from);
              const to   = nodes.find(n => n.id === edge.to);
              if (!from || !to) return null;
              const mx = (from.x + NODE_W / 2 + to.x + NODE_W / 2) / 2;
              const my = (from.y + NODE_H + to.y) / 2;
              return (
                <g key={edge.id}>
                  <path
                    d={edgePath(from, to)}
                    stroke="#94a3b8" strokeWidth="1.5" fill="none"
                    markerEnd="url(#arrow)" strokeDasharray="none"
                  />
                  {edge.label && (
                    <text x={mx} y={my} textAnchor="middle" fontSize="10" fill="#64748b"
                          className="pointer-events-none select-none" dy="-3">
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const color  = NODE_COLOR[node.type];
              const def    = NODE_TYPES.find(t => t.type === node.type)!;
              const Icon   = def.icon;
              const isSel  = selected === node.id;
              const isConn = connecting === node.id;
              return (
                <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                  {/* Connection source indicator */}
                  {isConn && (
                    <rect x={-4} y={-4} width={NODE_W + 8} height={NODE_H + 8}
                          rx={14} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />
                  )}

                  {/* Node body */}
                  <rect
                    x={0} y={0} width={NODE_W} height={NODE_H}
                    rx={10}
                    fill="white"
                    stroke={isSel ? color : '#e2e8f0'}
                    strokeWidth={isSel ? 2 : 1}
                    className="drop-shadow-sm"
                    style={{ cursor: dragNode.current?.id === node.id ? 'grabbing' : 'grab', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))' }}
                    onMouseDown={e => onNodeMouseDown(e, node.id)}
                  />

                  {/* Left accent */}
                  <rect x={0} y={0} width={4} height={NODE_H} rx={2} fill={color} style={{ pointerEvents: 'none' }} />

                  {/* Icon */}
                  <foreignObject x={12} y={12} width={28} height={28} style={{ pointerEvents: 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: color + '20', display: 'grid', placeItems: 'center' }}>
                      <Icon size={13} style={{ color }} />
                    </div>
                  </foreignObject>

                  {/* Label */}
                  <text x={48} y={22} fontSize="11" fontWeight="600" fill="#0f172a"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    {node.label.length > 18 ? node.label.slice(0, 18) + '…' : node.label}
                  </text>
                  <text x={48} y={36} fontSize="9" fill="#94a3b8"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    {def.label}
                  </text>

                  {/* Delete button */}
                  {isSel && (
                    <g transform={`translate(${NODE_W - 18},6)`}
                       style={{ cursor: 'pointer' }}
                       onMouseDown={e => { e.stopPropagation(); deleteNode(node.id); }}>
                      <circle cx={8} cy={8} r={8} fill="#fef2f2" />
                      <text x={8} y={12} textAnchor="middle" fontSize="11" fill="#dc2626">×</text>
                    </g>
                  )}

                  {/* Connect port (bottom) */}
                  <circle
                    cx={NODE_W / 2} cy={NODE_H} r={5}
                    fill={connecting === node.id ? '#F59E0B' : 'white'}
                    stroke={color} strokeWidth="1.5"
                    style={{ cursor: 'crosshair' }}
                    onMouseDown={e => { e.stopPropagation(); setConn(node.id); }}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {/* Status bar */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-ink-200 bg-white/90 backdrop-blur px-3 py-1.5 text-[10px] text-ink-500">
          <span>{nodes.length} nodos</span>
          <span>·</span>
          <span>{edges.length} conexiones</span>
          {connecting && (
            <>
              <span>·</span>
              <span className="text-amber-600 font-semibold">Modo conexión — clic en destino</span>
            </>
          )}
        </div>

        {/* Tip */}
        <div className="absolute top-3 right-3 rounded-lg border border-ink-200 bg-white/90 backdrop-blur px-3 py-1.5 text-[10px] text-ink-500">
          Arrastra nodos · Click para seleccionar · Punto inferior para conectar
        </div>
      </div>
    </div>
  );
}
