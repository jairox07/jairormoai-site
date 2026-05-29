# LexOS API — Ejemplos de uso

Ejemplos de cURL para testear los endpoints del Módulo RAG.

## 🔐 Obtener JWT Token (Supabase)

```bash
# 1. Crear usuario de test en Supabase Dashboard
#    Authentication → Users → Invite
#    Email: test@lexos.local
#    Password: Test123!@#

# 2. Obtener token
curl -X POST https://YOUR_PROJECT_ID.supabase.co/auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@lexos.local",
    "password": "Test123!@#",
    "grant_type": "password"
  }' | jq -r '.access_token'

# Guarda el token en variable (Windows PowerShell)
$TOKEN = "eyJhbGc..." # pega el token anterior
```

---

## 🏥 Health Check

```bash
curl http://localhost:4000/health
# Respuesta: {"status":"ok","timestamp":"2024-11-27T...","version":"1.0.0"}
```

---

## 🔍 Búsqueda Semántica

Busca documentos indexados usando embeddings + similitud semántica.

```bash
curl -X POST http://localhost:4000/api/rag/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "¿Cuáles son los plazos de resolución del contrato?",
    "queryType": "semantic_search",
    "language": "es"
  }' | jq

# Respuesta:
# {
#   "answer": "El contrato establece...",
#   "sources": [
#     {
#       "documentId": "uuid",
#       "filename": "contrato.pdf",
#       "pageNumber": 5,
#       "score": 0.87,
#       "snippet": "El plazo de resolución es de..."
#     }
#   ],
#   "queryType": "semantic_search",
#   "tokensUsed": 450,
#   "durationMs": 1250
# }
```

---

## ⚠️ Análisis de Riesgos

Identifica cláusulas desfavorables, obligaciones onerosas, penalizaciones.

```bash
curl -X POST http://localhost:4000/api/rag/risk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentIds": ["uuid-doc-1", "uuid-doc-2"],
    "caseId": "uuid-case-123"
  }' | jq

# Respuesta: Riesgos clasificados como ALTO/MEDIO/BAJO
# {
#   "answer": "RIESGOS IDENTIFICADOS:\n
#     ALTO: Cláusula de penalización sin límite (pág. 8)\n
#     MEDIO: Plazos ambiguos de entrega...",
#   "sources": [...],
#   "queryType": "risk_analysis",
#   ...
# }
```

---

## 📝 Resumir Documento

Genera resumen ejecutivo: partes, objeto, obligaciones, plazos.

```bash
curl -X POST http://localhost:4000/api/rag/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Resume este documento en puntos clave",
    "queryType": "summarize",
    "documentIds": ["uuid-doc"],
    "language": "es"
  }' | jq

# Respuesta: Resumen estructurado
```

---

## ⚖️ Extraer Jurisprudencia

Busca y sintetiza precedentes legales en los documentos.

```bash
curl -X POST http://localhost:4000/api/rag/jurisprudence \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentIds": ["uuid-jurisprudencia-1", "uuid-jurisprudencia-2"],
    "topic": "Nulidad de cláusulas suelo en hipotecas"
  }' | jq
```

---

## 📑 Extractar Cláusulas

Extrae y clasifica todas las cláusulas por tipo.

```bash
curl -X POST http://localhost:4000/api/rag/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Extrae todas las cláusulas del contrato clasificadas por tipo",
    "queryType": "clause_extract",
    "documentIds": ["uuid-contrato"]
  }' | jq
```

---

## 🗂️ Indexar Documento (Asíncrono)

Inicia la ingesta de un documento: PDF/DOCX → chunks → embeddings → Pinecone.

```bash
curl -X POST http://localhost:4000/api/rag/documents/{documentId}/index \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Respuesta (202 Accepted):
# {
#   "message": "Document indexing started",
#   "documentId": "uuid",
#   "statusUrl": "/api/documents/uuid/index-status"
# }
```

---

## 📊 Verificar estado de indexación

Verifica si un documento ya está procesado (chunks creados, embeddings en Pinecone).

```bash
curl -X GET http://localhost:4000/api/documents/{documentId}/index-status \
  -H "Authorization: Bearer $TOKEN"

# Respuesta:
# {
#   "id": "uuid",
#   "index_status": "indexed",
#   "chunk_count": 42,
#   "index_error": null
# }

# Estados posibles:
#   "pending"    - Esperando procesamiento
#   "processing" - En curso
#   "indexed"    - ✅ Listo para consultas
#   "failed"     - ❌ Error (ver index_error)
```

---

## 🚀 Flujo completo de ejemplo

```bash
#!/bin/bash

# 1. Obtener token
TOKEN=$(curl -s -X POST https://YOUR_PROJECT_ID.supabase.co/auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@lexos.local",
    "password": "Test123!@#",
    "grant_type": "password"
  }' | jq -r '.access_token')

echo "✅ Token: $TOKEN"

# 2. Indexar documento (imagina que ya existe en la BD)
DOC_ID="12345678-1234-1234-1234-123456789012"
curl -X POST http://localhost:4000/api/rag/documents/$DOC_ID/index \
  -H "Authorization: Bearer $TOKEN"

# 3. Esperar a que se indexe (polling)
for i in {1..10}; do
  STATUS=$(curl -s http://localhost:4000/api/rag/documents/$DOC_ID/index-status \
    -H "Authorization: Bearer $TOKEN" | jq -r '.index_status')
  echo "Status: $STATUS"
  if [ "$STATUS" = "indexed" ]; then
    echo "✅ Documento indexado!"
    break
  fi
  sleep 2
done

# 4. Consultar
curl -X POST http://localhost:4000/api/rag/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "¿Cuáles son las obligaciones del contratista?",
    "queryType": "semantic_search",
    "documentIds": ["'$DOC_ID'"]
  }' | jq .answer

# 5. Analizar riesgos
curl -X POST http://localhost:4000/api/rag/risk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentIds": ["'$DOC_ID'"]
  }' | jq .answer
```

---

## 🔐 Códigos de error comunes

| Código | Problema | Solución |
|--------|----------|----------|
| **401** | Token inválido/expirado | Obtén uno nuevo del endpoint de auth |
| **403** | Documento no pertenece a tu tenant | Verifica documentId |
| **404** | Documento no encontrado | Asegúrate que existe en la BD |
| **422** | Validación fallida (JSON inválido) | Revisa el formato del request |
| **429** | Rate limit excedido | Espera 1 min (IA tiene límite de 20 req/min) |
| **500** | Error del servidor | Revisa logs en terminal de backend |

---

## 💡 Tips

- **Todos los requests RAG requieren JWT token** — sin él, recibirás 401
- **documentIds es opcional** — si lo omites, busca en TODO los documentos del tenant
- **Las consultas toman 1-3 segundos** — depende del tamaño del contexto
- **Tokens están hasheados** — nunca se guardan las consultas en texto plano
- **Máximo 8 chunks retornados** — para mantener contexto < 6000 tokens

---

## 🧪 Testing con Postman

1. Abre Postman
2. Crea colección "LexOS"
3. Variables de entorno:
   ```
   {{BASE_URL}} = http://localhost:4000/api
   {{TOKEN}} = (pega tu JWT aquí)
   ```
4. Crea requests:
   - POST {{BASE_URL}}/rag/query
   - POST {{BASE_URL}}/rag/risk
   - GET {{BASE_URL}}/documents/{id}/index-status

---

Documentación: [OpenAPI spec próximamente en `/api/docs`]
