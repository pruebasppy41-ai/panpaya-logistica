'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { uploadExcel } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface ArchivoCargado {
  id: string;
  nombreArchivo: string;
  fechaCarga: string;
  rutasDetectadas: number;
  pedidosTotales: number;
  usuario: string;
  estado: 'Exitoso' | 'Error';
}

const HISTORIAL_MOCK: ArchivoCargado[] = [
  {
    id: '1',
    nombreArchivo: '03.07.2026.xlsx',
    fechaCarga: 'Hoy, 04:30 AM',
    rutasDetectadas: 21,
    pedidosTotales: 107,
    usuario: 'Logística Central',
    estado: 'Exitoso',
  },
  {
    id: '2',
    nombreArchivo: '02.07.2026.xlsx',
    fechaCarga: 'Ayer, 04:15 AM',
    rutasDetectadas: 12,
    pedidosTotales: 138,
    usuario: 'Logística Central',
    estado: 'Exitoso',
  },
];

function formatearFechaCarga(iso: string) {
  const fecha = new Date(iso);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);

  const hora = fecha.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (fecha.toDateString() === hoy.toDateString()) return `Hoy, ${hora}`;
  if (fecha.toDateString() === ayer.toDateString()) return `Ayer, ${hora}`;

  return fecha.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function fetchHistorialSupabase(): Promise<ArchivoCargado[]> {
  const { data, error } = await supabase
    .from('rutas')
    .select('archivo_origen, created_at, pedidos(count)')
    .not('archivo_origen', 'is', null)
    .order('created_at', { ascending: false });

  if (error || !data?.length) return [];

  const agrupado = new Map<string, ArchivoCargado>();

  for (const row of data) {
    const archivo = row.archivo_origen as string;
    const countPedidos =
      (row.pedidos as { count: number }[] | null)?.[0]?.count ?? 0;

    if (!agrupado.has(archivo)) {
      agrupado.set(archivo, {
        id: `${archivo}-${row.created_at}`,
        nombreArchivo: archivo,
        fechaCarga: formatearFechaCarga(row.created_at as string),
        rutasDetectadas: 1,
        pedidosTotales: countPedidos,
        usuario: 'Logística Central',
        estado: 'Exitoso',
      });
    } else {
      const entry = agrupado.get(archivo)!;
      entry.rutasDetectadas += 1;
      entry.pedidosTotales += countPedidos;
    }
  }

  return Array.from(agrupado.values());
}

export default function LogisticaCarga() {
  const [dragActive, setDragActive] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [historial, setHistorial] = useState<ArchivoCargado[]>(HISTORIAL_MOCK);

  const cargarHistorial = useCallback(async () => {
    const desdeSupabase = await fetchHistorialSupabase();
    if (desdeSupabase.length > 0) {
      setHistorial(desdeSupabase);
    }
  }, []);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validarYSeleccionar = (file: File) => {
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setArchivoSeleccionado(file);
    } else {
      alert('Por favor, selecciona únicamente archivos de Excel (.xlsx, .xls)');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      validarYSeleccionar(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      validarYSeleccionar(e.target.files[0]);
    }
  };

  const iniciarProcesamiento = async () => {
    if (!archivoSeleccionado) return;

    setProcesando(true);
    setProgreso(0);

    const intervalo = setInterval(() => {
      setProgreso((prev) => (prev < 90 ? prev + 15 : prev));
    }, 200);

    try {
      const result = await uploadExcel(archivoSeleccionado);
      clearInterval(intervalo);
      setProgreso(100);

      setTimeout(() => {
        const nuevoRegistro: ArchivoCargado = {
          id: Date.now().toString(),
          nombreArchivo: archivoSeleccionado.name,
          fechaCarga: 'Ahora mismo',
          rutasDetectadas: result.rutas_creadas,
          pedidosTotales: result.pedidos_creados,
          usuario: 'Logística Central',
          estado: 'Exitoso',
        };
        setHistorial((prev) => [nuevoRegistro, ...prev]);
        setArchivoSeleccionado(null);
        setProcesando(false);
        setProgreso(0);
      }, 500);
    } catch {
      clearInterval(intervalo);
      setProgreso(100);

      setTimeout(() => {
        const registroError: ArchivoCargado = {
          id: Date.now().toString(),
          nombreArchivo: archivoSeleccionado.name,
          fechaCarga: 'Ahora mismo',
          rutasDetectadas: 0,
          pedidosTotales: 0,
          usuario: 'Logística Central',
          estado: 'Error',
        };
        setHistorial((prev) => [registroError, ...prev]);
        setArchivoSeleccionado(null);
        setProcesando(false);
        setProgreso(0);
        alert('Error al procesar el archivo. Verifica la conexión y SUPABASE_SERVICE_ROLE_KEY en .env.local.');
      }, 500);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-800">
          CARGAR PROGRAMACIÓN DIARIA
        </h2>
        <p className="text-sm text-gray-500">
          Importa el archivo de Excel de la transportadora para distribuir las rutas y
          activar la aplicación de los conductores.
        </p>
      </div>

      <div className="max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/40'
              : 'border-slate-300 bg-slate-50/50'
          } ${archivoSeleccionado ? 'border-emerald-400 bg-emerald-50/10' : ''}`}
        >
          <input
            type="file"
            id="excel-upload"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={procesando}
          />

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-2xl">
            {procesando ? '⏳' : archivoSeleccionado ? '📝' : '📁'}
          </div>

          {!archivoSeleccionado && !procesando ? (
            <label htmlFor="excel-upload" className="cursor-pointer group">
              <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition">
                Arrastra el archivo de la transportadora aquí o{' '}
                <span className="text-blue-600 underline">examina tus carpetas</span>
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Formatos admitidos de Excel: .xlsx o .xls
              </p>
            </label>
          ) : archivoSeleccionado && !procesando ? (
            <div className="w-full max-w-md">
              <p className="text-sm font-bold text-slate-800 truncate">
                {archivoSeleccionado.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {(archivoSeleccionado.size / 1024).toFixed(1)} KB · Listo para procesar
              </p>

              <div className="mt-5 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setArchivoSeleccionado(null)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={iniciarProcesamiento}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  ⚙️ Procesar e Inyectar Rutas
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-xs">
              <p className="text-sm font-semibold text-slate-700">
                Analizando matrices y estructurando rutas...
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-blue-600 transition-all duration-200 rounded-full"
                  style={{ width: `${progreso}%` }}
                />
              </div>
              <p className="mt-1 text-right text-[10px] font-mono text-gray-400 font-bold">
                {progreso}%
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
            Historial de Importaciones Recientes
          </h3>
          <p className="text-xs text-gray-400">
            Auditoría de archivos subidos al ecosistema de Pan Pa Ya
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-700">
                <tr>
                  <th className="px-6 py-3.5">Archivo / Programación</th>
                  <th className="px-6 py-3.5">Fecha de Carga</th>
                  <th className="px-6 py-3.5">Rutas Creadas</th>
                  <th className="px-6 py-3.5">Entregas Totales</th>
                  <th className="px-6 py-3.5">Operador</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {historial.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                      {log.nombreArchivo}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {log.fechaCarga}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-100">
                        {log.rutasDetectadas} Rutas
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {log.pedidosTotales} clientes
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{log.usuario}</td>
                    <td className="px-6 py-4 text-center">
                      {log.estado === 'Exitoso' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 border border-green-200">
                          <span className="h-1 w-1 rounded-full bg-green-500" />
                          {log.estado}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
                          <span className="h-1 w-1 rounded-full bg-red-500" />
                          {log.estado}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
