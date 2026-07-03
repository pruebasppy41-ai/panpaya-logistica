from datetime import date
from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.excel_parser import parse_excel
from app.schemas import ParsePreview, PedidoEstadoUpdate, UploadResult
from app.services import get_rutas_by_fecha, process_excel_file, update_pedido_estado

app = FastAPI(
    title="Pan Pa Ya - API Logística",
    description="Procesamiento de rutas Excel y gestión de entregas",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/rutas/upload", response_model=UploadResult)
async def upload_rutas_excel(file: UploadFile = File(...)):
    """Sube el Excel diario, parsea bloques bidireccionales y guarda en Supabase."""
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(400, "Solo se aceptan archivos .xlsx")

    content = await file.read()
    try:
        result = process_excel_file(content, file.filename)
    except Exception as exc:
        raise HTTPException(422, f"Error al procesar Excel: {exc}") from exc

    return UploadResult(**result)


@app.post("/api/rutas/preview", response_model=ParsePreview)
async def preview_excel(file: UploadFile = File(...)):
    """Previsualiza el parseo sin guardar en base de datos."""
    content = await file.read()
    try:
        rutas = parse_excel(BytesIO(content))
    except Exception as exc:
        raise HTTPException(422, f"Error al procesar Excel: {exc}") from exc

    preview = []
    for r in rutas:
        preview.append(
            {
                "nombre_zona": r.nombre_zona,
                "lado": r.lado,
                "conductor": r.conductor,
                "placa": r.placa,
                "auxiliar": r.auxiliar,
                "hora_salida": r.hora_salida.isoformat() if r.hora_salida else None,
                "pedidos_count": len(r.pedidos),
                "pedidos": [p.__dict__ for p in r.pedidos],
            }
        )

    return ParsePreview(
        fecha=rutas[0].fecha if rutas else date.today(),
        total_rutas=len(rutas),
        total_pedidos=sum(len(r.pedidos) for r in rutas),
        rutas=preview,
    )


@app.get("/api/rutas")
def list_rutas(fecha: date):
    """Lista rutas y pedidos de una fecha (panel de asesores)."""
    try:
        return get_rutas_by_fecha(fecha)
    except Exception as exc:
        raise HTTPException(500, str(exc)) from exc


@app.patch("/api/pedidos/{pedido_id}")
def patch_pedido(pedido_id: str, body: PedidoEstadoUpdate):
    """Actualiza estado de pedido (app móvil: foto + Entregado)."""
    try:
        return update_pedido_estado(pedido_id, body.estado, body.foto_url)
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(500, str(exc)) from exc
