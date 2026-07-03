'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import VolverInicio from '@/components/VolverInicio';

interface PedidoResultado {
  id: string;
  codigo_cliente: string;
  nombre_cliente: string;
  direccion: string;
  notas: string | null;
  estado: string;
  foto_url: string | null;
  entregado_at: string | null;
  rutas: {
    nombre_zona: string;
    placa: string;
    conductor: string;
  };
}

function etiquetaEstado(estado: string) {
  if (estado === 'No entregado') return 'Novedad';
  if (estado === 'En camino') return 'En ruta';
  return estado;
}

export default function ConsultaAsesor() {
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [pedidoEncontrado, setPedidoEncontrado] = useState<PedidoResultado | null>(null);
  const [buscado, setBuscado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoBusqueda.trim()) return;

    setLoading(true);
    setErrorMensaje(null);
    setPedidoEncontrado(null);
    setBuscado(true);

    const hoy = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        id, codigo_cliente, nombre_cliente, direccion, notas, estado, foto_url, entregado_at,
        rutas!inner ( nombre_zona, placa, conductor, fecha )
      `)
      .eq('codigo_cliente', codigoBusqueda.trim())
      .eq('rutas.fecha', hoy)
      .maybeSingle();

    if (error) {
      console.error(error);
      setErrorMensaje('Ocurrió un error al consultar la base de datos.');
    } else if (data) {
      setPedidoEncontrado(data as unknown as PedidoResultado);
    } else {
      setPedidoEncontrado(null);
    }
    setLoading(false);
  };

  const estadoVisible = pedidoEncontrado ? etiquetaEstado(pedidoEncontrado.estado) : '';

  return (
    <div className="relative min-h-screen bg-slate-950 text-white p-6 font-sans flex flex-col items-center justify-center">
      <div className="absolute top-4 left-4 z-10">
        <VolverInicio />
      </div>
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-3xl">🍞</span>
          <h1 className="text-xl font-bold tracking-wider">PAN PA YA · CONSULTA DE ASESORES</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            Módulo de Auditoría de Entregas (Solo Lectura)
          </p>
        </div>

        <form
          onSubmit={handleBuscar}
          className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex gap-3"
        >
          <div className="flex-1 relative">
            <span className="absolute left-4 top-3 text-slate-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Digite el número de destinatario (Ej: 102585)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500"
              value={codigoBusqueda}
              onChange={(e) => setCodigoBusqueda(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 transition px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/10 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Consultar'}
          </button>
        </form>

        {errorMensaje && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl text-center">
            {errorMensaje}
          </div>
        )}

        {buscado && !loading && (
          <div className="animate-fade-in">
            {pedidoEncontrado ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-6 p-6">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-blue-400 font-bold">
                      Destinatario #{pedidoEncontrado.codigo_cliente}
                    </span>
                    <h2 className="text-lg font-bold text-white mt-1">
                      {pedidoEncontrado.nombre_cliente}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">📍 {pedidoEncontrado.direccion}</p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                      pedidoEncontrado.estado === 'Entregado'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : pedidoEncontrado.estado === 'No entregado'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        pedidoEncontrado.estado === 'Entregado'
                          ? 'bg-green-500'
                          : pedidoEncontrado.estado === 'No entregado'
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                      }`}
                    />
                    {estadoVisible}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Ruta Asignada:</span>
                    <span className="font-bold text-slate-300">
                      {pedidoEncontrado.rutas.nombre_zona}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Vehículo (Placa):</span>
                    <span className="font-mono font-bold text-slate-300">
                      {pedidoEncontrado.rutas.placa}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Conductor de Calle:</span>
                    <span className="font-bold text-slate-300">
                      {pedidoEncontrado.rutas.conductor}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 block">
                    Evidencia Fotográfica del Transportador:
                  </span>

                  {pedidoEncontrado.foto_url ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pedidoEncontrado.foto_url}
                        alt="Evidencia desde el camión"
                        className="w-full h-auto max-h-72 object-contain mx-auto"
                      />
                      {pedidoEncontrado.entregado_at && (
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-sm p-2 text-center text-[10px] text-slate-400 font-mono">
                          Entregado el:{' '}
                          {new Date(pedidoEncontrado.entregado_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-950 border border-dashed border-slate-800 rounded-xl p-8 text-center text-sm text-slate-500 italic">
                      ⏳ El conductor aún no ha reportado la foto de entrega en este punto.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-sm text-slate-400 italic shadow-xl">
                ❌ No se encontró ningún pedido programado para hoy con el número de destinatario
                &quot;{codigoBusqueda}&quot;. Verifique el código e intente de nuevo.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
