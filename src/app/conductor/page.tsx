'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

const ZONAS_CONTINGENCIA = ['SABANA', 'CENTRO', 'NORTE', 'SUR', 'OCCIDENTE', 'REVENTA'];

export default function ConductorContingenciaPOD() {
  const [placas, setPlacas] = useState<string[]>([]);
  const [placaSeleccionada, setPlacaSeleccionada] = useState('');
  const [esPlacaManual, setEsPlacaManual] = useState(false);

  const [placaManualInput, setPlacaManualInput] = useState('');
  const [zonaManualInput, setZonaManualInput] = useState('');

  const [pedidos, setPedidos] = useState<PedidoRuta[]>([]);
  const [loading, setLoading] = useState(false);

  const [pedidoParaEvidencia, setPedidoParaEvidencia] = useState<PedidoRuta | null>(null);
  const [subiendoPOD, setSubiendoPOD] = useState(false);

  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const obtenerPlacasHoy = async () => {
      const { data } = await supabase.from('rutas').select('placa').eq('fecha', hoy);
      if (data) {
        setPlacas(Array.from(new Set(data.map((r) => r.placa as string))));
      }
    };
    obtenerPlacasHoy();
  }, [hoy]);

  const consultarHojaRuta = useCallback(
    async (placaTarget: string, esManual: boolean) => {
      setLoading(true);

      let placaConsulta = placaTarget.trim().toUpperCase();

      if (esManual) {
        if (!placaManualInput.trim() || !zonaManualInput) {
          alert('Para vehículos de contingencia, debe ingresar la placa y la zona de forma obligatoria.');
          setLoading(false);
          return;
        }
        placaConsulta = placaManualInput.trim().toUpperCase();
        setPlacaSeleccionada(placaConsulta);
      } else {
        setPlacaSeleccionada(placaConsulta);
      }

      const { data } = await supabase
        .from('pedidos')
        .select(
          'id, codigo_cliente, nombre_cliente, direccion, notas, estado, foto_url, rutas!inner(placa, fecha)'
        )
        .eq('rutas.placa', placaConsulta)
        .eq('rutas.fecha', hoy);

      setPedidos((data as unknown as PedidoRuta[]) ?? []);
      setLoading(false);
    },
    [hoy, placaManualInput, zonaManualInput]
  );

  const handleSelectorPlaca = (valor: string) => {
    if (valor === 'MANUAL') {
      setEsPlacaManual(true);
      setPlacaSeleccionada('');
      setPedidos([]);
    } else {
      setEsPlacaManual(false);
      setPlacaManualInput('');
      setZonaManualInput('');
      if (valor) consultarHojaRuta(valor, false);
    }
  };

  const handleSubirEvidencia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !pedidoParaEvidencia) return;

    setSubiendoPOD(true);
    const file = e.target.files[0];
    const extension = file.name.split('.').pop() ?? 'jpg';

    const nombreArchivo = `${hoy}/${placaSeleccionada}_${pedidoParaEvidencia.codigo_cliente}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('evidencias-entrega')
      .upload(nombreArchivo, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      alert('Error crítico de almacenamiento: ' + uploadError.message);
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
      consultarHojaRuta(placaSeleccionada, esPlacaManual);
      setPedidoParaEvidencia(null);
    }
    setSubiendoPOD(false);
  };

  const volverASelector = () => {
    setPlacaSeleccionada('');
    setEsPlacaManual(false);
    setPlacaManualInput('');
    setZonaManualInput('');
    setPedidos([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 max-w-md mx-auto flex flex-col justify-between">
      <div className="space-y-6">
        <div className="text-center border-b border-slate-900 pb-4">
          <span className="text-3xl">🚛</span>
          <h1 className="text-lg font-bold tracking-wider mt-1">LEGALIZACIÓN DE DESPACHOS</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
            Control y Captura de Evidencias POD
          </p>
        </div>

        {!placaSeleccionada ? (
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Seleccione el Vehículo Asignado:
              </label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono font-bold outline-none focus:border-emerald-500 cursor-pointer"
                onChange={(e) => handleSelectorPlaca(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  -- Listado de Placas de Hoy --
                </option>
                {placas.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value="MANUAL" className="text-amber-400 font-bold">
                  ⚠️ OTRO (Ingreso Manual)
                </option>
              </select>
            </div>

            {esPlacaManual && (
              <div className="space-y-3 pt-3 border-t border-slate-800 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-semibold text-amber-400 mb-1 uppercase tracking-wider">
                    Placa del Vehículo (Apoyo/Contingencia):
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Ej: JUZ117"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono uppercase font-bold text-white outline-none focus:border-amber-500"
                    value={placaManualInput}
                    onChange={(e) => setPlacaManualInput(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-400 mb-1 uppercase tracking-wider">
                    Zona de Operación Obligatoria:
                  </label>
                  <select
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white font-bold outline-none focus:border-amber-500 cursor-pointer"
                    value={zonaManualInput}
                    onChange={(e) => setZonaManualInput(e.target.value)}
                  >
                    <option value="" disabled>
                      -- Seleccione Zona --
                    </option>
                    {ZONAS_CONTINGENCIA.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => consultarHojaRuta(placaManualInput, true)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl uppercase tracking-wider transition"
                >
                  Confirmar y Buscar Ruta
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 shadow-md">
              <div className="flex flex-col">
                <span className="text-xs font-bold font-mono text-emerald-400">
                  VEHÍCULO: {placaSeleccionada}
                </span>
                {esPlacaManual && (
                  <span className="text-[10px] text-amber-400 font-bold uppercase">
                    Modo Contingencia ({zonaManualInput})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={volverASelector}
                className="text-[11px] text-slate-400 underline hover:text-white transition"
              >
                Volver
              </button>
            </div>

            {loading ? (
              <p className="text-center text-xs text-slate-500 py-6">Estructurando hoja de ruta...</p>
            ) : pedidos.length > 0 ? (
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
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs font-bold py-2.5 rounded-lg transition"
                          >
                            📸 Registrar Soporte POD
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400 italic">
                ℹ️ No se encontraron pedidos precargados para la placa &quot;{placaSeleccionada}&quot; en
                el sistema de hoy.
                {esPlacaManual && (
                  <p className="mt-2 text-amber-400/80 not-italic">
                    Modo contingencia: la placa debe existir en logística o cargarse desde el Excel del
                    día.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {pedidoParaEvidencia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl w-full max-w-xs text-center space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Legalizar Entrega POD
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2">{pedidoParaEvidencia.nombre_cliente}</p>

            <label className="block w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-xs cursor-pointer transition shadow-lg shadow-blue-600/10">
              {subiendoPOD ? 'Subiendo evidencia al sistema...' : '📸 Abrir Cámara del Teléfono'}
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
                className="text-xs text-slate-500 hover:text-slate-300 underline block mx-auto"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
