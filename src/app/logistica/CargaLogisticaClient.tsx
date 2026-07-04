'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { uploadExcel } from '@/lib/api';
import VolverInicio from '@/components/VolverInicio';

export default function CargaLogisticaClient() {
  const router = useRouter();
  const [esAdmin, setEsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [archivoExcel, setArchivoExcel] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    const verificarPermisosAdministrador = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/logistica/login');
        return;
      }

      const { data: perfil } = await supabase
        .from('asesores')
        .select('rol')
        .eq('id', user.id)
        .maybeSingle();

      if (perfil?.rol === 'administrador') {
        setEsAdmin(true);
      } else {
        alert(
          '⛔ Acceso Denegado: Este módulo está reservado exclusivamente para el personal de administración logística de Pan Pa Ya.'
        );
        router.replace('/');
        return;
      }

      setLoading(false);
    };

    verificarPermisosAdministrador();
  }, [router]);

  const handleProcesarExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivoExcel) return;

    setSubiendo(true);
    setMensaje(null);

    try {
      const result = await uploadExcel(archivoExcel);
      setMensaje({
        tipo: 'exito',
        texto: `Programación procesada: ${result.rutas_creadas} rutas y ${result.pedidos_creados} pedidos cargados.`,
      });
      setArchivoExcel(null);
    } catch (err) {
      setMensaje({
        tipo: 'error',
        texto: err instanceof Error ? err.message : 'Error al procesar el archivo Excel.',
      });
    } finally {
      setSubiendo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-mono text-xs">
        🔒 Validando credenciales de seguridad informática...
      </div>
    );
  }

  if (!esAdmin) return null;

  return (
    <div className="relative min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans flex items-center justify-center">
      <div className="absolute top-4 left-4 z-10">
        <VolverInicio />
      </div>
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center border-b border-slate-800 pb-4">
          <span className="text-3xl">📁</span>
          <h1 className="text-lg font-bold tracking-wider mt-2">SISTEMA CENTRAL DE LOGÍSTICA</h1>
          <p className="text-[10px] text-amber-400 uppercase tracking-widest font-mono font-bold">
            Consola Restringida: Nivel Administrador
          </p>
        </div>

        {mensaje && (
          <div
            className={`rounded-xl p-3 text-xs font-medium border ${
              mensaje.tipo === 'exito'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleProcesarExcel} className="space-y-5">
          <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 rounded-xl p-8 text-center transition cursor-pointer relative">
            <input
              type="file"
              accept=".xlsx,.xls"
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={subiendo}
              onChange={(e) => {
                if (e.target.files?.[0]) setArchivoExcel(e.target.files[0]);
              }}
            />
            <span className="text-2xl block mb-2">📊</span>
            <p className="text-xs font-semibold text-slate-300">
              {archivoExcel
                ? `Archivo seleccionado: ${archivoExcel.name}`
                : 'Arrastre o seleccione la programación diaria de rutas de hoy (.xlsx)'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              Formato aceptado: Matriz de Despacho Pan Pa Ya
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold py-3 rounded-xl transition"
            >
              Volver al Inicio
            </button>
            <button
              type="submit"
              disabled={!archivoExcel || subiendo}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-xs font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/10"
            >
              {subiendo ? 'Procesando Matriz...' : 'Procesar Programación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
