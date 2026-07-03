'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PedidoRuta {
  id: string;
  codigo_cliente: string;
  nombre_cliente: string;
  direccion: string;
  notas: string | null;
  estado: string;
  foto_url: string | null;
  rutas: {
    placa: string;
    fecha: string;
  };
}

export default function ConductorPOD() {
  const [placas, setPlacas] = useState<string[]>([]);
  const [placaSeleccionada, setPlacaSeleccionada] = useState('');
  const [pedidos, setPedidos] = useState<PedidoRuta[]>([]);
  const [loading, setLoading] = useState(false);

  const [pedidoParaEvidencia, setPedidoParaEvidencia] = useState<PedidoRuta | null>(null);
  const [subiendoPOD, setSubiendoPOD] = useState(false);

  useEffect(() => {
    const obtenerPlacasHoy = async () => {
      const hoy = new Date().toISOString().split('T')[0];
      const { data } = await supabase.from('rutas').select('placa').eq('fecha', hoy);
      if (data) {
        setPlacas(Array.from(new Set(data.map((r) => r.placa as string))));
      }
    };
    obtenerPlacasHoy();
  }, []);

  const consultarHojaRuta = async (placa: string) => {
    setPlacaSeleccionada(placa);
    setLoading(true);
    const hoy = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('pedidos')
      .select(
        'id, codigo_cliente, nombre_cliente, direccion, notas, estado, foto_url, rutas!inner(placa, fecha)'
      )
      .eq('rutas.placa', placa)
      .eq('rutas.fecha', hoy);

    if (data) setPedidos(data as unknown as PedidoRuta[]);
    setLoading(false);
  };

  const handleSubirEvidencia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !pedidoParaEvidencia) return;

    setSubiendoPOD(true);
    const file = e.target.files[0];
    const extension = file.name.split('.').pop() ?? 'jpg';
    const hoy = new Date().toISOString().split('T')[0];

    const nombreArchivo = `${hoy}/${placaSeleccionada}_${pedidoParaEvidencia.codigo_cliente}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('evidencias-entrega')
      .upload(nombreArchivo, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      alert('Error al subir el archivo al storage: ' + uploadError.message);
      setSubiendoPOD(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('evidencias-entrega').getPublicUrl(nombreArchivo);

    const { error: updateError } = await supabase
      .from('pedidos')
      .update({
        estado: 'Entregado',
        foto_url: publicUrl,
      })
      .eq('id', pedidoParaEvidencia.id);

    if (updateError) {
      alert('Error al actualizar el pedido: ' + updateError.message);
    } else {
      consultarHojaRuta(placaSeleccionada);
      setPedidoParaEvidencia(null);
    }
    setSubiendoPOD(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 max-w-md mx-auto flex flex-col justify-between">
      <div className="space-y-6">
        <div className="text-center border-b border-slate-900 pb-4">
          <span className="text-3xl">🚛</span>
          <h1 className="text-lg font-bold tracking-wider mt-1">LEGALIZACIÓN DE DESPACHOS</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
            Carga de Soporte Técnico POD · Pan Pa Ya
          </p>
        </div>

        {!placaSeleccionada ? (
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <label className="block text-xs font-semibold text-slate-400">
              Seleccione el Vehículo Asignado hoy:
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono font-bold outline-none focus:border-emerald-500"
              onChange={(e) => {
                if (e.target.value) consultarHojaRuta(e.target.value);
              }}
              defaultValue=""
            >
              <option value="" disabled>
                -- Listado de Placas --
              </option>
              {placas.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800">
              <span className="text-xs font-bold font-mono text-emerald-400">
                Placa: {placaSeleccionada}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPlacaSeleccionada('');
                  setPedidos([]);
                }}
                className="text-[11px] text-slate-400 underline"
              >
                Cambiar Vehículo
              </button>
            </div>

            {loading ? (
              <p className="text-center text-xs text-slate-500 py-6">Descargando hoja de ruta...</p>
            ) : pedidos.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6 italic">
                No hay entregas programadas para esta placa hoy.
              </p>
            ) : (
              <div className="space-y-3">
                {pedidos.map((p) => {
                  const completado = p.estado === 'Entregado';
                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-xl border bg-slate-900 transition-all ${
                        completado ? 'border-emerald-500/30 opacity-75' : 'border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-500 font-bold">#{p.codigo_cliente}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            completado
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {p.estado}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-200 mt-1">{p.nombre_cliente}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">📍 {p.direccion}</p>

                      {!completado && (
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => setPedidoParaEvidencia(p)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs font-bold py-2 rounded-lg transition"
                          >
                            📸 Registrar Soporte POD
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {pedidoParaEvidencia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl w-full max-w-xs text-center space-y-4">
            <h3 className="text-sm font-bold">Legalizar Entrega</h3>
            <p className="text-xs text-slate-400">{pedidoParaEvidencia.nombre_cliente}</p>

            <label className="block w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-xs cursor-pointer transition">
              {subiendoPOD ? 'Procesando archivo...' : '📸 Abrir Cámara / Galería'}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                disabled={subiendoPOD}
                onChange={handleSubirEvidencia}
              />
            </label>

            {!subiendoPOD && (
              <button
                type="button"
                onClick={() => setPedidoParaEvidencia(null)}
                className="text-xs text-slate-500 underline block mx-auto"
              >
                Volver
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
