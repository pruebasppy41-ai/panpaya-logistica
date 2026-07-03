'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, supabaseConfigOk } from '@/lib/supabase';
import { ZONAS_DISTRIBUCION } from '@/lib/zonas';

function CampoPassword({
  label,
  value,
  onChange,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-400 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required
          placeholder="••••••••"
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 pr-11 text-sm outline-none focus:border-blue-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={id.includes('confirm') ? 'new-password' : 'new-password'}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );
}

export default function AuthAsesores() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);

  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [codigo, setCodigo] = useState('');
  const [correo, setCorreo] = useState('');
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>([]);
  const [filtroZona, setFiltroZona] = useState('');
  const [listaZonasAbierta, setListaZonasAbierta] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const zonasFiltradas = useMemo(() => {
    const q = filtroZona.trim().toLowerCase();
    if (!q) return ZONAS_DISTRIBUCION;
    return ZONAS_DISTRIBUCION.filter(
      (z) => z.codigo.toLowerCase().includes(q) || z.nombre.toLowerCase().includes(q)
    );
  }, [filtroZona]);

  const toggleZona = (codigoZona: string) => {
    setZonasSeleccionadas((prev) =>
      prev.includes(codigoZona) ? prev.filter((c) => c !== codigoZona) : [...prev, codigoZona]
    );
  };

  const quitarZona = (codigoZona: string) => {
    setZonasSeleccionadas((prev) => prev.filter((c) => c !== codigoZona));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    try {
      if (!supabaseConfigOk) {
        setMensaje({
          tipo: 'error',
          texto:
            'Configuración incompleta en el servidor. Verifique NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel.',
        });
        return;
      }

      if (isRegister && password !== confirmPassword) {
        setMensaje({ tipo: 'error', texto: 'Las contraseñas no coinciden.' });
        return;
      }

      if (isRegister && zonasSeleccionadas.length === 0) {
        setMensaje({ tipo: 'error', texto: 'Seleccione al menos una zona de supervisión.' });
        return;
      }

      if (isRegister) {
        const res = await fetch('/api/registrar-asesor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            cedula,
            codigo,
            correo,
            password,
            zonas: zonasSeleccionadas,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setMensaje({ tipo: 'error', texto: data.error ?? 'No se pudo completar el registro.' });
          return;
        }

        setMensaje({ tipo: 'exito', texto: 'Asesor registrado con éxito. Ya puede iniciar sesión.' });
        setIsRegister(false);
        setNombre('');
        setCedula('');
        setCodigo('');
        setCorreo('');
        setZonasSeleccionadas([]);
        setFiltroZona('');
        setPassword('');
        setConfirmPassword('');
      } else {
        const res = await fetch('/api/login-cedula', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cedula: cedula.trim(), password, rolRequerido: 'asesor' }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setMensaje({ tipo: 'error', texto: data.error ?? 'No se pudo iniciar sesión.' });
          return;
        }

        if (data.session) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });

          if (sessionError) {
            setMensaje({ tipo: 'error', texto: 'Error al establecer la sesión. Intente de nuevo.' });
            return;
          }
        }

        router.push('/asesor');
      }
    } catch {
      setMensaje({
        tipo: 'error',
        texto: 'Error de conexión. Revise su internet o la URL de Supabase en Vercel (blwzyk, no blwzyrk).',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-3 py-6 sm:px-4 sm:py-8 text-white font-sans">
      <div className="w-full max-w-lg space-y-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-8 shadow-2xl">
        <div className="text-center">
          <span className="text-4xl">🍞</span>
          <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-wider">PAN PA YA</h2>
          <p className="mt-1 text-xs text-slate-400 uppercase tracking-widest">
            {isRegister ? 'Registro de Asesores Comerciales' : 'Ingreso con Cédula'}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nombres y Apellidos
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Cédula</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Código (Opcional)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Correo</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>

              {/* Selector de zonas — móvil primero */}
              <div className="rounded-xl border border-slate-700 bg-slate-950 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setListaZonasAbierta((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 text-left"
                >
                  <span className="text-xs font-semibold text-slate-300">
                    Zonas de supervisión{' '}
                    <span className="text-blue-400">({zonasSeleccionadas.length} elegidas)</span>
                  </span>
                  <span className="text-slate-500 text-sm">{listaZonasAbierta ? '▲' : '▼'}</span>
                </button>

                {zonasSeleccionadas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-slate-800 bg-slate-900/80">
                    {zonasSeleccionadas.map((cod) => {
                      const z = ZONAS_DISTRIBUCION.find((x) => x.codigo === cod);
                      return (
                        <button
                          key={cod}
                          type="button"
                          onClick={() => quitarZona(cod)}
                          className="inline-flex items-center gap-1 text-[11px] bg-blue-600/20 border border-blue-500/30 text-blue-200 px-2 py-1 rounded-full active:scale-95"
                        >
                          {z?.nombre ?? cod}
                          <span className="text-blue-400">×</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {listaZonasAbierta && (
                  <div className="border-t border-slate-800">
                    <div className="sticky top-0 z-10 p-2 bg-slate-950 border-b border-slate-800">
                      <input
                        type="search"
                        placeholder="🔍 Buscar zona..."
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        value={filtroZona}
                        onChange={(e) => setFiltroZona(e.target.value)}
                      />
                    </div>
                    <ul
                      className="max-h-[min(50vh,320px)] overflow-y-auto overscroll-contain p-2 space-y-1"
                      style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                      {zonasFiltradas.length === 0 ? (
                        <li className="text-xs text-slate-500 text-center py-4">Sin resultados</li>
                      ) : (
                        zonasFiltradas.map((z) => {
                          const activa = zonasSeleccionadas.includes(z.codigo);
                          return (
                            <li key={z.codigo}>
                              <button
                                type="button"
                                onClick={() => toggleZona(z.codigo)}
                                className={`w-full text-left rounded-xl px-3 py-3 text-sm transition active:scale-[0.99] ${
                                  activa
                                    ? 'bg-blue-600/25 border border-blue-500/40'
                                    : 'bg-slate-900 border border-transparent hover:bg-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                                      activa
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : 'border-slate-600 text-transparent'
                                    }`}
                                  >
                                    ✓
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-mono text-[11px] text-blue-400">{z.codigo}</p>
                                    <p className="text-slate-200 leading-snug">{z.nombre}</p>
                                  </div>
                                </div>
                              </button>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          {!isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Cédula</label>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="Digite su identificación"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-3">
            <CampoPassword
              id="password"
              label="Contraseña"
              value={password}
              onChange={setPassword}
            />
            {isRegister && (
              <CampoPassword
                id="confirm-password"
                label="Verificar contraseña"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold shadow-lg transition hover:bg-blue-700 disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? 'Procesando...' : isRegister ? 'Registrar Asesor' : 'Ingresar'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMensaje(null);
              setZonasSeleccionadas([]);
              setFiltroZona('');
            }}
            className="text-xs text-slate-400 hover:text-blue-400 transition underline decoration-dotted py-2"
          >
            {isRegister
              ? '¿Ya tienes cuenta? Inicia Sesión'
              : '¿Eres asesor nuevo? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
