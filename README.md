# Pan Pa Ya — Sistema Logístico

Backend y panel web para procesar rutas diarias desde Excel, gestionar entregas en Supabase y auditar en tiempo real.

## Arquitectura

```
Excel diario (.xlsx)
       │
       ▼
┌──────────────────┐     ┌─────────────┐     ┌─────────────────┐
│  FastAPI (Python)│────▶│  Supabase   │◀────│  App móvil      │
│  excel_parser    │     │  rutas      │     │  (foto→Entregado)│
└──────────────────┘     │  pedidos    │     └─────────────────┘
       ▲                 └──────┬──────┘
       │                        │ Realtime
┌──────┴───────┐                 ▼
│ Panel Next.js│◀────────────────┘
│   (Vercel)   │
└──────────────┘
```

## Estructura del Excel

| Col A | Col B | Col C | Col D | | Col F | Col G | Col H | Col I |
|-------|-------|-------|-------|---|-------|-------|-------|-------|
| Código | Cliente | Dirección | Notas | | Código | Cliente | Dirección | Notas |

- **Fila 1:** fecha de entrega
- **Bloques bidireccionales:** zona izquierda (A–D) y derecha (F–I)
- **Pie de bloque:** `NOMBRE`, `PLACA`, `AUX.` con conductor, placa y auxiliar
- Soporta variantes **MULTIAMBIENTE** (título en col B/G) y rutas sin pedidos (recogidas)

## Configuración

### 1. Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ejecutar `supabase/migrations/001_initial_schema.sql` en el SQL Editor
3. Crear bucket `entregas` en Storage (público o con políticas RLS)

### 2. Backend (Python)

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # completar SUPABASE_URL y SUPABASE_SERVICE_KEY
uvicorn app.main:app --reload --port 8000
```

**Endpoints:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/rutas/upload` | Sube Excel y guarda en Supabase |
| POST | `/api/rutas/preview` | Previsualiza sin guardar |
| GET | `/api/rutas?fecha=YYYY-MM-DD` | Lista rutas del día |
| PATCH | `/api/pedidos/{id}` | Actualiza estado (app móvil) |

### 3. Panel web (Vercel)

```bash
cd web
.\mnpm.cmd install
cp .env.example .env.local
.\mnpm.cmd run dev
```

Variables en Vercel:
- `NEXT_PUBLIC_API_URL` → URL del backend (Railway, Render, etc.)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. App móvil (integración)

Para marcar entrega con foto:

```http
PATCH /api/pedidos/{pedido_id}
Content-Type: application/json

{
  "estado": "Entregado",
  "foto_url": "https://...supabase.co/storage/v1/object/public/entregas/foto.jpg"
}
```

Subir la foto primero a Supabase Storage, luego enviar la URL.

## Probar el parser

```bash
cd backend
PYTHONPATH=. python scripts/test_parser.py ../03.07.2026.xlsx
```

Resultado esperado: **21 rutas**, **107 pedidos** para el archivo de ejemplo.

## Despliegue recomendado

| Componente | Plataforma |
|------------|------------|
| Panel web | Vercel |
| API Python | Railway / Render / Fly.io |
| Base de datos | Supabase |
| Storage fotos | Supabase Storage |

## Próximos pasos

- [ ] Autenticación (conductores vs asesores) con Supabase Auth
- [ ] App móvil React Native / Expo
- [ ] Notificaciones push al entregar
- [ ] Reportes PDF de cierre de día
