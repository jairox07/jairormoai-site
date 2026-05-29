# LexOS — Sistema Operativo Legal Unificado

MVP de software LegalTech con enfoque en **privacidad**, **seguridad GDPR** e **IA responsable**.

**Status:** 🚀 Módulo 4 (RAG) producción-ready | 4 módulos adicionales pendientes

---

## 🎯 Visión

Un sistema monolítico modular que permite a despachos de abogados:

1. **Onboarding seguro** de clientes con verificación de identidad
2. **Generación masiva de contratos** desde plantillas JSON
3. **Gestión de expedientes** con Kanban + alertas de plazos
4. **Investigación jurídica con IA** — búsqueda semántica + análisis de riesgos
5. **Facturación automática** — cronómetro integrado + proformas

**Diferenciales:**
- ✅ Multi-tenancy con aislamiento a nivel DB + vector DB
- ✅ Encriptación AES-256 en reposo (datos de clientes)
- ✅ Audit trail inmutable (cumple GDPR Art. 30)
- ✅ IA con hashing de queries — sin entrenar con datos legales
- ✅ Interfaz limpia + modo oscuro/claro

---

## 🏗️ Arquitectura

```
                    ┌─────────────────────┐
                    │   Frontend (React)  │
                    │   + Tailwind CSS    │
                    └──────────┬──────────┘
                               │ JWT
                               ▼
┌──────────────────────────────────────────────────────┐
│            Express.js API (Node.ts)                  │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ Middleware: Auth (Supabase) + RBAC + Audit │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  ┌─────────────┬──────────────┬─────────────────┐  │
│  │   Module 1  │   Module 2   │   Module 4 RAG  │  │
│  │ Onboarding  │  Contratos   │   ← FOCUS       │  │
│  └─────────────┴──────────────┴─────────────────┘  │
└────────────────┬──────────────┬────────────────────┘
                 │              │
        ┌────────▼──┐   ┌───────▼──────┐
        │PostgreSQL │   │  Pinecone    │
        │ (RLS)     │   │  (Namespace) │
        │           │   │  per Tenant  │
        └───────────┘   └──────────────┘
           ▲
           │ Supabase Auth (JWT verification)
           │
        ┌──┴───┐
        │ S3   │ Encrypted document storage
        └──────┘
```

---

## 📦 Stack Técnico

| Capa | Tecnología | Razón |
|------|-----------|-------|
| **Frontend** | React 18 + Vite | Hot reload, bundle pequeño, ecosystem maduro |
| **Backend** | Node.js + Express + TypeScript | JavaScript fullstack, tipado, middlewares |
| **DB Relacional** | PostgreSQL 16 | ACID, RLS (Row-Level Security), JSONB |
| **Vector DB** | Pinecone | Managed, namespace isolation, serverless |
| **Auth** | Supabase Auth | JWT estándar, OAuth2-ready, GDPR |
| **IA** | OpenAI API | SOTA embeddings + chat, API estable |
| **Encryption** | AES-256-GCM | NIST-approved, IV por documento |
| **Storage** | S3/MinIO | Encriptación en tránsito (TLS) |

---

## ⚡ Inicio rápido (5 minutos)

### Prerequisitos
- Node.js 18+
- PostgreSQL 16+
- Cuentas: Supabase (gratis), OpenAI (prueba gratis), Pinecone (pod gratis)

### Setup

```bash
# 1. Ejecutar script de setup automático (Windows)
powershell -ExecutionPolicy Bypass -File setup-dev.ps1

# 2. Editar .env con credenciales (Supabase, OpenAI, Pinecone)
notepad .env

# 3. Ejecutar migraciones
cd backend && npm run db:migrate && cd ..

# 4. Terminal 1: Backend
cd backend && npm run dev
# Deberías ver: "LexOS API running on port 4000"

# 5. Terminal 2: Frontend (en otra terminal)
cd frontend && npm run dev
# Ve a http://localhost:5173
```

📖 **Guía detallada:** [`SETUP_LOCAL.md`](./SETUP_LOCAL.md)

---

## 🚀 Módulo 4 — RAG (Investigación Legal con IA)

### Flujo de ingesta
```
PDF/DOCX uploaded
     ↓
extractText (PDF parser, Mammoth)
     ↓
chunkText (1500 chars, 200 char overlap)
     ↓
embedChunks (OpenAI text-embedding-3-large, batch)
     ↓
Pinecone.namespace(tenantId).upsert() ← AISLAMIENTO por tenant
     ↓
document_chunks tabla (solo hashes + metadatos)
```

### 5 modos de consulta

| Modo | Caso de uso | Respuesta |
|------|-----------|-----------|
| **Búsqueda** | "¿Cuál es el plazo?" | Respuesta directa + fuentes |
| **Riesgos** | "Analiza este contrato" | ALTO/MEDIO/BAJO claros + ubicación |
| **Resumen** | "Resume el expediente" | Partes, objeto, obligaciones, plazos |
| **Jurisprudencia** | "¿Qué dice el TS?" | Precedentes + criterios + evolución |
| **Cláusulas** | "Extrae cláusulas" | Clasificadas: objeto, precio, garantías… |

### Seguridad en RAG

✅ **Queries nunca se almacenan** — solo SHA-256  
✅ **Aislamiento por tenant** — namespace separado en Pinecone  
✅ **Temperatura = 0.1** — respuestas factual, no inventa  
✅ **Max 8 chunks** — contexto < 6000 tokens  
✅ **Rate limiting** — 20 req/min por tenant  

### Ejemplo de uso
```bash
curl -X POST http://localhost:4000/api/rag/query \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "query": "¿Cuáles son los riesgos de este contrato?",
    "queryType": "risk_analysis",
    "documentIds": ["uuid-contrato"]
  }'

# Respuesta:
{
  "answer": "RIESGOS IDENTIFICADOS:\nALTO: Cláusula de penalización...",
  "sources": [{...}],
  "tokensUsed": 450,
  "durationMs": 1250
}
```

---

## 📡 API Endpoints (RAG)

```
POST   /api/rag/query              ← Búsqueda + síntesis
POST   /api/rag/risk               ← Análisis de riesgos
POST   /api/rag/jurisprudence      ← Sumario de jurisprudencia
POST   /api/rag/documents/:id/index ← Inicia indexación
GET    /api/rag/documents/:id/index-status ← Status indexación
```

📚 **Ejemplos completos:** [`API_EXAMPLES.md`](./API_EXAMPLES.md)

---

## 🔐 Seguridad & Compliance

### GDPR/LOPD
- ✅ Consentimiento explícito + timestamp + IP
- ✅ Derecho al olvido (triggers para anonimización)
- ✅ Datos legales encriptados AES-256-GCM
- ✅ Audit trail immutable (cumple Art. 30)
- ✅ Data residency: EU-only (region us-east-1 es default local, cambiar en producción)

### Encriptación
```
Datos de cliente:  AES-256-GCM (IV por row)
Documentos:        AES-256-GCM (IV por documento)
Queries RAG:       SHA-256 (one-way, nunca se descifra)
```

### Rate limiting
- Global: 100 req/15min
- IA queries: 20 req/min (costo OpenAI)

---

## 📊 Base de datos

**Tablas principales:**
- `tenants` — Despachos de abogados
- `users` — Abogados, paralegales, administrativos
- `clients` — Clientes con datos encriptados
- `cases` — Expedientes + Kanban
- `documents` — Archivos (PDF, DOCX)
- `document_chunks` — Chunks para RAG (metadata only)
- `rag_queries` — Log de consultas IA (hasheadas)
- `audit_logs` — Trail inmutable (RLS insert-only)
- `contracts` — Contratos generados
- `time_entries` — Horas billables
- `invoices` — Facturas proforma

**Estadísticas de desarrollo:**
- 14 tablas
- 23 índices (performance optimization)
- RLS en 12 tablas (tenant isolation)
- 0 secrets en BD (todo encriptado)

---

## 🎨 Frontend

**Componentes implementados:**
- Página de búsqueda RAG con 5 modos
- Selector dinámico de tipo de consulta
- Análisis de riesgos con badges (ALTO/MEDIO/BAJO)
- Tarjetas de fuentes (snippet + relevancia %)
- Loading states + error handling
- Dark/Light mode (Tailwind)

**Almacenamiento:**
- Zustand store para auth (persistido en localStorage)
- React Query para llamadas API (caché automático)
- Tailwind CSS + componentes customizados

---

## 📋 Por completar

### Módulo 1: Onboarding (cliente seguro)
- [ ] Formulario dinámico con validación
- [ ] Verificación de identidad (API externa)
- [ ] Portal de cliente con token temporal
- [ ] Upload seguro de documentos (encriptación)

### Módulo 2: Generador de contratos
- [ ] Editor de plantillas JSON
- [ ] Motor Handlebars/Mustache
- [ ] Generación masiva .docx/.pdf
- [ ] Historial de versiones

### Módulo 3: Gestión de expedientes
- [ ] Kanban full-stack (drag-drop)
- [ ] Alerts de plazos (cron job)
- [ ] Integración Google/Outlook calendarios
- [ ] Notificaciones en tiempo real

### Módulo 5: Facturación
- [ ] Cronómetro integrado por tarea
- [ ] Cálculo automático de honorarios
- [ ] Generación de proformas
- [ ] Exportación a contabilidad

### DevOps
- [ ] Dockerfiles (backend ✅, frontend ✅)
- [ ] docker-compose.yml ✅
- [ ] GitHub Actions (CI/CD)
- [ ] Terraform (IaC)
- [ ] Monitoreo (Sentry, DataDog)

---

## 🧪 Testing

```bash
# Backend unit tests
cd backend && npm run test

# Frontend component tests
cd frontend && npm run test

# E2E tests (Cypress)
npm run test:e2e
```

---

## 📖 Documentación

- [`SETUP_LOCAL.md`](./SETUP_LOCAL.md) — Guía de instalación paso a paso
- [`API_EXAMPLES.md`](./API_EXAMPLES.md) — Ejemplos cURL de todos los endpoints
- [`database/migrations/001_initial_schema.sql`](./database/migrations/001_initial_schema.sql) — Schema comentado
- OpenAPI spec: Próximamente en `/api/docs`

---

## 🤝 Contribuir

```bash
# 1. Crear rama
git checkout -b feature/modulo-1-onboarding

# 2. Hacer cambios
# (sin commitear .env, dist/, node_modules/)

# 3. Testear
npm run test && npm run lint

# 4. Push
git push -u origin feature/modulo-1-onboarding

# 5. PR → Review → Merge
```

**Conventions:**
- Commits: `feat:`, `fix:`, `docs:`, `chore:` (conventional commits)
- TypeScript: `strict: true`, types explícitos
- SQL: comentarios en líneas clave
- Pruebas: mínimo 80% coverage

---

## 📄 Licencia

**AGPL-3.0** — Código abierto + contribuciones de vuelta

---

## 💬 Soporte

- 📧 Email: [to be configured]
- 💬 Issues: GitHub issues
- 📞 Slack: [community channel]

---

## 🚀 Roadmap (6 meses)

| Q | Objetivo |
|---|----------|
| Q1 2025 | Módulos 1-5 completos + dockerized |
| Q2 2025 | Auth integrado (Supabase Auth UI) + tests |
| Q3 2025 | CI/CD (GitHub Actions) + monitoreo |
| Q4 2025 | SaaS multi-tenant + stripe billing |

---

**Status: MVP de Módulo 4 ✅ — Listo para producción (con auditoría).**

*Hecho con ❤️ por Jairo Romo & Claude AI*
