from datetime import date, time
from uuid import UUID

from pydantic import BaseModel, Field


class PedidoResponse(BaseModel):
    id: UUID
    ruta_id: UUID
    codigo_cliente: str
    nombre_cliente: str
    direccion: str
    notas: str | None
    orden: int | None
    estado: str
    foto_url: str | None
    entregado_at: str | None


class RutaResponse(BaseModel):
    id: UUID
    fecha: date
    nombre_zona: str
    conductor: str
    placa: str
    auxiliar: str | None
    hora_salida: time | None
    lado: str
    pedidos: list[PedidoResponse] = Field(default_factory=list)


class UploadResult(BaseModel):
    fecha: date
    rutas_creadas: int
    pedidos_creados: int
    rutas: list[RutaResponse]


class PedidoEstadoUpdate(BaseModel):
    estado: str = Field(..., pattern="^(Pendiente|En camino|Entregado|No entregado)$")
    foto_url: str | None = None


class ParsePreview(BaseModel):
    fecha: date
    total_rutas: int
    total_pedidos: int
    rutas: list[dict]
