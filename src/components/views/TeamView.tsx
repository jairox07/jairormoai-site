"use client";

import { UserPlus } from "lucide-react";
import { TEAM } from "@/lib/data";

const ROLE_STYLE: Record<string, { label: string; color: string }> = {
  admin:   { label: 'Admin',   color: '#605BFF' },
  manager: { label: 'Manager', color: '#0284C7' },
  agent:   { label: 'Agente',  color: '#16A34A' },
  viewer:  { label: 'Viewer',  color: '#71717a' },
};

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function TeamView() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[18px] font-semibold tracking-tight text-ink-900">Equipo</h1>
            <p className="text-[12px] text-ink-500 mt-0.5">{TEAM.length} miembros · Plan Growth</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-md bg-ink-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-ink-800">
            <UserPlus size={13} /> Invitar miembro
          </button>
        </div>

        <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr>
                {['Miembro', 'Rol', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {TEAM.map(member => {
                const role = ROLE_STYLE[member.role];
                return (
                  <tr key={member.id} className="hover:bg-ink-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="grid size-9 place-items-center rounded-full text-white text-[12px] font-bold"
                               style={{ background: `hsl(${member.avatarHue},65%,52%)` }}>
                            {initials(member.name)}
                          </div>
                          {member.online && (
                            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-ink-900">{member.name}</p>
                          <p className="text-[11px] text-ink-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded px-2 py-0.5 text-[11px] font-semibold"
                            style={{ background: role.color + '22', color: role.color }}>
                        {role.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`flex items-center gap-1.5 text-[11px] font-medium ${member.online ? 'text-emerald-600' : 'text-ink-400'}`}>
                        <span className={`size-1.5 rounded-full ${member.online ? 'bg-emerald-500' : 'bg-ink-300'}`} />
                        {member.online ? 'En línea' : 'Desconectado'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button className="text-[12px] text-ink-500 hover:text-ink-800 font-medium">Editar</button>
                        {member.role !== 'admin' && (
                          <button className="text-[12px] text-rose-500 hover:text-rose-700 font-medium">Remover</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
