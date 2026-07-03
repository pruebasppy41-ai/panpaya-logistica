'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, supabaseConfigOk } from '@/lib/supabase';

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
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 pr-11 text-sm text-white outline-none focus:border-amber-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
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

export default function AuthLogistica() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);

  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [correo, setCorreo] = useState('');
  const [cargo, setCargo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    try {
      if (!supabaseConfigOk) {
        setMensaje({
          tipo: 'error',
          texto: 'Configuración de Supabase incompleta en el servidor.',
        });
        return;
      }

      if (isRegister && password !== confirmPassword) {
        setMensaje({ tipo: 'error', texto: 'Las contraseñas de seguridad no coinciden.' });
        return;
      }

      if (isRegister) {
        const res = await fetch('/api/registrar-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, cedula, correo, cargo, password }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setMensaje({ tipo: 'error', texto: data.error ?? 'No se pudo registrar el administrador.' });
          return;
        }

        setMensaje({
          tipo: 'exito',
          texto: 'Personal administrativo registrado con éxito. Ya puede ingresar.',
        });
        setIsRegister(false);
        setNombre('');
        setCedula('');
        setCorreo('');
        setCargo('');
        setPassword('');
        setConfirmPassword('');
      } else {
        const res = await fetch('/api/login-cedula', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cedula: cedula.trim(),
            password,
            rolRequerido: 'administrador',
          }),
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

        router.push('/logistica');
      }
    } catch {
      setMensaje({
        tipo: 'error',
        texto: 'Error de conexión. Verifique su internet o la configuración en Vercel.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-white font-sans">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-amber-500/20 bg-slate-900/50 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <span className="text-4xl">📁</span>
          <h2 className="mt-3 text-2xl font-bold tracking-wider">PAN PA YA</h2>
          <p className="mt-1 text-xs text-amber-400 uppercase tracking-widest font-mono font-bold">
            {isRegister ? 'Registro de Personal Logístico' : 'Ingreso Administrativo (Cédula)'}
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-amber-500 text-white"
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
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-amber-500 text-white"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Cargo Ejecutivo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Coordinador"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-amber-500 text-white"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Correo Corporativo
                </label>
                <input
                  type="email"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-amber-500 text-white"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
            </>
          )}

          {!isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Cédula del Administrador
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="Digite su número de identificación"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-white font-mono"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-3">
            <CampoPassword
              id="admin-password"
              label="Contraseña Corporativa"
              value={password}
              onChange={setPassword}
            />
            {isRegister && (
              <CampoPassword
                id="admin-confirm-password"
                label="Verificar Contraseña"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 font-bold text-slate-950 py-3 text-sm transition disabled:opacity-50 mt-2 active:scale-[0.99]"
          >
            {loading
              ? 'Validando Privilegios...'
              : isRegister
                ? 'Registrar Administrador'
                : 'Ingresar a Consola Logística'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMensaje(null);
            }}
            className="text-xs text-slate-400 hover:text-amber-400 transition underline decoration-dotted py-2"
          >
            {isRegister
              ? '¿Ya tiene cuenta de administrador? Inicie sesión aquí'
              : '¿Es personal administrativo nuevo? Regístrese aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
