import { supabase } from "./supabase";

export { supabase };

export type Pedido = {
  id: string;
  ruta_id: string;
  codigo_cliente: string;
  nombre_cliente: string;
  direccion: string;
  notas: string | null;
  orden: number | null;
  estado: "Pendiente" | "En camino" | "Entregado" | "No entregado";
  foto_url: string | null;
  entregado_at: string | null;
};

export type Ruta = {
  id: string;
  fecha: string;
  nombre_zona: string;
  conductor: string;
  placa: string;
  auxiliar: string | null;
  hora_salida: string | null;
  lado: string;
  pedidos: Pedido[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchRutas(fecha: string): Promise<Ruta[]> {
  const res = await fetch(`${API_URL}/api/rutas?fecha=${fecha}`);
  if (!res.ok) throw new Error("Error al cargar rutas");
  return res.json();
}

export async function fetchRutasSupabase(fecha: string): Promise<Ruta[]> {
  const { data, error } = await supabase
    .from("rutas")
    .select("*, pedidos(*)")
    .eq("fecha", fecha)
    .order("nombre_zona");

  if (error) throw new Error(error.message);
  return (data ?? []) as Ruta[];
}

export async function uploadExcel(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/procesar-excel", { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? err.detail ?? "Error al subir archivo");
  }
  return res.json();
}

export function subscribePedidos(onChange: () => void) {
  const channel = supabase
    .channel("pedidos-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, onChange)
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
