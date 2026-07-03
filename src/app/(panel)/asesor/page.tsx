'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface Pedido {
  id: string;
  codigo_cliente: string;
  nombre_cliente: string;
  direccion: string;
  notas: string | null;
  estado: string;
  foto_url: string | null;
  rutas: {
    nombre_zona: string;
    placa: string;
    conductor: string;
    fecha: string;
  };
}

function etiquetaEstado(estado: string) {
  if (estado === 'No entregado') return 'Novedad';
  if (estado === 'En camino') return 'En ruta';
  return estado;
}

export default function AsesorDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [rutasDisponibles, setRutasDisponibles] = useState<string[]>([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroRuta, setFiltroRuta] = useState('TODAS');
  const [modalFoto, setModalFoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarPedidosHoy = useCallback(async () => {
    setLoading(true);
    const hoy = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        id, codigo_cliente, nombre_cliente, direccion, notas, estado, foto_url,
        rutas!inner ( nombre_zona, placa, conductor, fecha )
      `)
      .eq('rutas.fecha', hoy);

    if (error) {
      console.error('Error cargando pedidos:', error);
      setPedidos([]);
      setRutasDisponibles([]);
    } else if (data) {
      const pedidosFormateados = data as unknown as Pedido[];
      setPedidos(pedidosFormateados);
      const rutasUnicas = Array.from(
        new Set(pedidosFormateados.map((p) => p.rutas.nombre_zona))
      );
      setRutasDisponibles(rutasUnicas);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarPedidosHoy();

    const canalPedidos = supabase
      .channel('cambios-pedidos-asesor')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        () => cargarPedidosHoy()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalPedidos);
    };
  }, [cargarPedidosHoy]);

  const pedidosFiltrados = pedidos.filter((p) => {
    const cumpleTexto =
      p.nombre_cliente.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      p.codigo_cliente.includes(filtroTexto);
    const cumpleRuta =
      filtroRuta === 'TODAS' || p.rutas.nombre_zona === filtroRuta;
    return cumpleTexto && cumpleRuta;
  });

  const total = pedidos.length;
  const entregados = pedidos.filter((p) => p.estado === 'Entregado').length;
  const novedades = pedidos.filter((p) => p.estado === 'No entregado').length;
  const pendientes = pedidos.filter(
    (p) => p.estado === 'Pendiente' || p.estado === 'En camino'
  ).length;

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            PAN PA YA · CONTROL EN TIEMPO REAL
          </h1>
          <p className="text-sm text-gray-500">
            Sincronizado de forma nativa con los conductores en calle
          </p>
        </div>
        <div className="text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 self-start sm:self-center">
          ⚡ Conexión:{' '}
          <span className="font-bold text-green-600">Activa (Realtime)</span>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Hoy</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{total}</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50/50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Entregados</p>
          <p className="mt-2 text-3xl font-bold text-green-700">{entregados}</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Novedades</p>
          <p className="mt-2 text-3xl font-bold text-red-700">{novedades}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pendientes</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{pendientes}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por código o establecimiento..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <select
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
            value={filtroRuta}
            onChange={(e) => setFiltroRuta(e.target.value)}
          >
            <option value="TODAS">Todas las Rutas</option>
            {rutasDisponibles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">
          Cargando base de datos logísticos...
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="text-center py-12 text-gray-400 italic rounded-xl border border-gray-200 bg-white">
          No hay pedidos para hoy. Sube el Excel desde Logística → Cargar Programación.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-slate-800 text-xs text-white uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Ruta / Vehículo</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Dirección</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-center">Evidencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{pedido.rutas.nombre_zona}</div>
                      <div className="text-xs text-gray-500">
                        Placa: <span className="font-mono bg-gray-100 px-1 rounded">{pedido.rutas.placa}</span>
                      </div>
                      <div className="text-xs text-gray-400">Cond: {pedido.rutas.conductor}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-blue-600">#{pedido.codigo_cliente}</div>
                      <div className="font-medium text-slate-800">{pedido.nombre_cliente}</div>
                      {pedido.notas && (
                        <span className="text-xs text-amber-700 bg-amber-50 px-1 rounded">{pedido.notas}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{pedido.direccion}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          pedido.estado === 'Entregado'
                            ? 'bg-green-50 text-green-700'
                            : pedido.estado === 'No entregado'
                              ? 'bg-red-50 text-red-700'
                              : pedido.estado === 'En camino'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {etiquetaEstado(pedido.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {pedido.foto_url ? (
                        <button
                          onClick={() => setModalFoto(pedido.foto_url)}
                          className="border border-gray-300 px-3 py-1.5 rounded-lg text-xs bg-white text-gray-700 font-medium hover:bg-gray-50"
                        >
                          📸 Ver Evidencia
                        </button>
                      ) : (
                        <span className="text-xs italic text-gray-400">Pendiente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalFoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-w-lg w-full bg-white p-2 rounded-2xl shadow-2xl">
            <button
              onClick={() => setModalFoto(null)}
              className="absolute right-4 top-4 bg-black/70 text-white font-bold h-8 w-8 rounded-full"
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={modalFoto}
              alt="Evidencia de entrega"
              className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
