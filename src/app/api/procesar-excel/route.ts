import { NextResponse } from "next/server";
import { parseExcelBuffer } from "@/lib/excelParser";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se cargó ningún archivo" }, { status: 400 });
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json(
        { error: "Solo se aceptan archivos Excel (.xlsx, .xls)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const rutas = parseExcelBuffer(buffer);

    if (rutas.length === 0) {
      return NextResponse.json(
        { error: "No se detectaron rutas en el archivo" },
        { status: 422 }
      );
    }

    const supabase = createSupabaseAdmin();
    const fecha = rutas[0].fecha;

    await supabase.from("rutas").delete().eq("fecha", fecha);

    let rutasCreadas = 0;
    let pedidosCreados = 0;

    for (const r of rutas) {
      const { data: nuevaRuta, error: errorRuta } = await supabase
        .from("rutas")
        .insert({
          fecha: r.fecha,
          nombre_zona: r.nombre_zona,
          conductor: r.conductor,
          placa: r.placa,
          auxiliar: r.auxiliar,
          hora_salida: r.hora_salida,
          lado: r.lado,
          archivo_origen: file.name,
        })
        .select()
        .single();

      if (errorRuta) throw errorRuta;

      rutasCreadas++;

      if (r.pedidos.length > 0) {
        const pedidosInsertar = r.pedidos.map((p) => ({
          ruta_id: nuevaRuta.id,
          codigo_cliente: p.codigo_cliente,
          nombre_cliente: p.nombre_cliente,
          direccion: p.direccion,
          notas: p.notas,
          orden: p.orden,
          estado: "Pendiente",
        }));

        const { error: errorPedidos } = await supabase
          .from("pedidos")
          .insert(pedidosInsertar);

        if (errorPedidos) throw errorPedidos;
        pedidosCreados += pedidosInsertar.length;
      }
    }

    return NextResponse.json({
      success: true,
      mensaje: "Distribución cargada correctamente",
      fecha,
      rutas_creadas: rutasCreadas,
      pedidos_creados: pedidosCreados,
      archivo: file.name,
    });
  } catch (error: unknown) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
