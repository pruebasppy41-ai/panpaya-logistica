from datetime import date, time

from supabase import Client, create_client

from app.config import settings
from app.excel_parser import RutaParseada, parse_excel


def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_key)


def _time_to_str(t: time | None) -> str | None:
    return t.isoformat() if t else None


def persist_rutas(
    rutas: list[RutaParseada],
    archivo_origen: str | None = None,
) -> tuple[list[dict], int]:
    """Inserta rutas y pedidos en Supabase. Elimina rutas previas del mismo día."""
    sb = get_supabase()
    if not rutas:
        return [], 0

    fecha = rutas[0].fecha.isoformat()
    sb.table("rutas").delete().eq("fecha", fecha).execute()

    rutas_insertadas: list[dict] = []
    total_pedidos = 0

    for ruta in rutas:
        ruta_row = {
            "fecha": ruta.fecha.isoformat(),
            "nombre_zona": ruta.nombre_zona,
            "conductor": ruta.conductor,
            "placa": ruta.placa,
            "auxiliar": ruta.auxiliar,
            "hora_salida": _time_to_str(ruta.hora_salida),
            "lado": ruta.lado,
            "archivo_origen": archivo_origen,
        }
        result = sb.table("rutas").insert(ruta_row).execute()
        ruta_db = result.data[0]
        ruta_id = ruta_db["id"]

        pedidos_rows = [
            {
                "ruta_id": ruta_id,
                "codigo_cliente": p.codigo_cliente,
                "nombre_cliente": p.nombre_cliente,
                "direccion": p.direccion,
                "notas": p.notas,
                "orden": p.orden,
                "estado": "Pendiente",
            }
            for p in ruta.pedidos
        ]
        pedidos_db: list[dict] = []
        if pedidos_rows:
            ped_res = sb.table("pedidos").insert(pedidos_rows).execute()
            pedidos_db = ped_res.data
            total_pedidos += len(pedidos_db)

        rutas_insertadas.append({**ruta_db, "pedidos": pedidos_db})

    return rutas_insertadas, total_pedidos


def process_excel_file(file_bytes: bytes, filename: str) -> dict:
    from io import BytesIO

    rutas = parse_excel(BytesIO(file_bytes))
    insertadas, num_pedidos = persist_rutas(rutas, archivo_origen=filename)
    return {
        "fecha": rutas[0].fecha if rutas else date.today(),
        "rutas_creadas": len(insertadas),
        "pedidos_creados": num_pedidos,
        "rutas": insertadas,
    }


def get_rutas_by_fecha(fecha: date) -> list[dict]:
    sb = get_supabase()
    rutas = (
        sb.table("rutas")
        .select("*, pedidos(*)")
        .eq("fecha", fecha.isoformat())
        .order("nombre_zona")
        .execute()
    )
    return rutas.data


def update_pedido_estado(pedido_id: str, estado: str, foto_url: str | None = None) -> dict:
    sb = get_supabase()
    payload: dict = {"estado": estado}
    if foto_url:
        payload["foto_url"] = foto_url
    result = sb.table("pedidos").update(payload).eq("id", pedido_id).execute()
    if not result.data:
        raise ValueError(f"Pedido {pedido_id} no encontrado")
    return result.data[0]
