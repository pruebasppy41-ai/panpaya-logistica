'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Pedido {
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

export default function DashboardAsesor() {
  const [perfilAsesor, setPerfilAsesor] = useState<{ nombres_apellidos: string; zona: string } | null>(
    null
  );

  const [pedidosDelDia, setPedidosDelDia] = useState<Pedido[]>([]);
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [pedidoBuscado, setPedidoBuscado] = useState<Pedido | null>(null);
  const [realizoBusqueda, setRealizoBusqueda] = useState(false);

  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [modalFoto, setModalFoto] = useState<string | null>(null);

  const hoy = new Date().toISOString().split('T')[0];
  const perfilRef = useRef(perfilAsesor);
  const codigoRef = useRef(codigoBusqueda);

  useEffect(() => {
    perfilRef.current = perfilAsesor;
  }, [perfilAsesor]);

  useEffect(() => {
    codigoRef.current = codigoBusqueda;
  }, [codigoBusqueda]);

  const cargarPedidosPorZona = useCallback(
    async (zonaAsesor: string) => {
      setLoadingPedidos(true);

      const { data } = await supabase
        .from('pedidos')
        .select(`
          id, codigo_cliente, nombre_cliente, direccion, notas, estado, foto_url, entregado_at,
          rutas!inner ( nombre_zona, placa, conductor, fecha )
        `)
        .eq('rutas.fecha', hoy)
        .ilike('rutas.nombre_zona', `%${zonaAsesor}%`);

      setPedidosDelDia((data as unknown as Pedido[]) ?? []);
      setLoadingPedidos(false);
    },
    [hoy]
  );

  const ejecutarBusquedaDirecta = useCallback(
    async (codigo?: string) => {
      const termino = (codigo ?? codigoRef.current).trim();
      if (!termino) return;

      setLoadingBusqueda(true);
      setRealizoBusqueda(true);

      const { data } = await supabase
        .from('pedidos')
        .select(`
          id, codigo_cliente, nombre_cliente, direccion, notas, estado, foto_url, entregado_at,
          rutas!inner ( nombre_zona, placa, conductor, fecha )
        `)
        .eq('codigo_cliente', termino)
        .eq('rutas.fecha', hoy)
        .maybeSingle();

      setPedidoBuscado(data ? (data as unknown as Pedido) : null);
      setLoadingBusqueda(false);
    },
    [hoy]
  );

  useEffect(() => {
    const obtenerPerfilYPedidos = async () => {
      setLoadingPerfil(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: perfil } = await supabase
          .from('asesores')
          .select('nombres_apellidos, zona')
          .eq('id', user.id)
          .single();

        if (perfil) {
          setPerfilAsesor(perfil);
          await cargarPedidosPorZona(perfil.zona);
        }
      }
      setLoadingPerfil(false);
    };

    obtenerPerfilYPedidos();

    const canalRealtime = supabase
      .channel('cambios-logistica-asesor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        if (perfilRef.current) cargarPedidosPorZona(perfilRef.current.zona);
        if (codigoRef.current.trim()) ejecutarBusquedaDirecta();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canalRealtime);
    };
  }, [cargarPedidosPorZona, ejecutarBusquedaDirecta]);

  const handleBuscarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    await ejecutarBusquedaDirecta(codigoBusqueda);
  };

  if (loadingPerfil) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-mono text-xs">
        Validando credenciales logísticas de asesor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-900 pb-5 gap-4">
          <div>
            <p className="text-xs text-blue-400 font-mono uppercase tracking-widest font-bold">
              Bienvenido al Sistema
            </p>
            <h1 className="text-xl font-bold tracking-tight text-white mt-1">
              Asesor: {perfilAsesor?.nombres_apellidos}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Zona de Supervisión Asignada:{' '}
              <span className="text-slate-200 font-bold uppercase">{perfilAsesor?.zona}</span>
            </p>
          </div>
          <div className="text-xs bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-400 font-mono">
            📅 Distribución de Hoy: <span className="text-emerald-400 font-bold">{hoy}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Auditoría Rápida de Destinatario
            </h2>
            <p className="text-xs text-slate-500">
              Consulte el estado y la foto POD de un cliente específico ingresando su código de 6
              dígitos.
            </p>
          </div>

          <form onSubmit={handleBuscarCodigo} className="flex gap-3 max-w-xl">
            <input
              type="text"
              maxLength={6}
              placeholder="Ej: 102585"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 outline-none focus:border-blue-500"
              value={codigoBusqueda}
              onChange={(e) => setCodigoBusqueda(e.target.value)}
            />
            <button
              type="submit"
              disabled={loadingBusqueda}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
            >
              {loadingBusqueda ? 'Buscando...' : 'Buscar Cliente'}
            </button>
          </form>

          {realizoBusqueda && !loadingBusqueda && (
            <div className="pt-4 border-t border-slate-800/60 animate-fade-in">
              {pedidoBuscado ? (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                      Destinatario #{pedidoBuscado.codigo_cliente}
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1.5">
                      {pedidoBuscado.nombre_cliente}
                    </h4>
                    <p className="text-xs text-slate-400">
                      📍 {pedidoBuscado.direccion} ({pedidoBuscado.rutas.nombre_zona})
                    </p>
                  </div>
                  <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start border-t border-slate-800 pt-3 sm:pt-0 sm:border-none">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        pedidoBuscado.estado === 'Entregado'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {pedidoBuscado.estado}
                    </span>
                    {pedidoBuscado.foto_url ? (
                      <button
                        type="button"
                        onClick={() => setModalFoto(pedidoBuscado.foto_url)}
                        className="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition border border-slate-700"
                      >
                        📸 Ver Foto POD
                      </button>
                    ) : (
                      <span className="text-xs italic text-slate-500">Sin foto aún</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-400 italic">
                  ❌ No se encontró ningún cliente con el código &quot;{codigoBusqueda}&quot;
                  programado para el día de hoy.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Monitoreo General de la Zona: {perfilAsesor?.zona}
            </h2>
            <p className="text-xs text-slate-500">
              Listado automático de todas las entregas asignadas a sus rutas de distribución hoy.
            </p>
          </div>

          {loadingPedidos ? (
            <p className="text-xs text-slate-500 italic">Actualizando registros de zona...</p>
          ) : pedidosDelDia.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pedidosDelDia.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-blue-400 font-bold">#{p.codigo_cliente}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          p.estado === 'Entregado'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {p.estado}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-200 line-clamp-1">
                      {p.nombre_cliente}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">📍 {p.direccion}</p>
                    <div className="text-[11px] text-slate-500 font-mono pt-1">
                      Ruta: <span className="text-slate-300">{p.rutas.nombre_zona}</span> | Placa:{' '}
                      <span className="text-slate-300">{p.rutas.placa}</span>
                    </div>
                    {p.notas && (
                      <p className="text-[11px] bg-amber-500/10 text-amber-400 p-1.5 rounded border border-amber-500/10">
                        ⚠️ {p.notas}
                      </p>
                    )}
                  </div>

                  {p.foto_url && (
                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setModalFoto(p.foto_url)}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
                      >
                        📸 Revisar Prueba POD →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500 italic">
              ☕ No hay pedidos programados ni cargados por Logística para la zona &quot;
              {perfilAsesor?.zona}&quot; el día de hoy.
            </div>
          )}
        </div>
      </div>

      {modalFoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl w-full max-w-md relative">
            <button
              type="button"
              onClick={() => setModalFoto(null)}
              className="absolute right-4 top-4 bg-black/70 text-white font-bold h-8 w-8 rounded-full shadow-lg transition hover:bg-black"
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={modalFoto}
              alt="Evidencia de entrega"
              className="w-full h-auto max-h-[75vh] object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
