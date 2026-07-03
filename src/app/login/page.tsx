'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthAsesores() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);

  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [codigo, setCodigo] = useState('');
  const [correo, setCorreo] = useState('');
  const [zona, setZona] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    if (isRegister && password !== confirmPassword) {
      setMensaje({ tipo: 'error', texto: 'Las contraseñas no coinciden. Verifique e intente de nuevo.' });
      setLoading(false);
      return;
    }

    if (isRegister) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: correo,
        password: password,
      });

      if (authError) {
        setMensaje({ tipo: 'error', texto: authError.message });
        setLoading(false);
        return;
      }

      if (authData.user) {
        const { error: tablaError } = await supabase.from('asesores').insert({
          id: authData.user.id,
          nombres_apellidos: nombre,
          cedula: cedula.trim(),
          codigo_opcional: codigo.trim() || null,
          correo_electronico: correo.trim(),
          zona: zona,
        });

        if (tablaError) {
          setMensaje({ tipo: 'error', texto: 'Error al guardar el perfil: ' + tablaError.message });
        } else {
          setMensaje({ tipo: 'exito', texto: 'Asesor registrado con éxito. Ya puede iniciar sesión.' });
          setIsRegister(false);
          setNombre('');
          setCedula('');
          setCodigo('');
          setCorreo('');
          setZona('');
          setPassword('');
          setConfirmPassword('');
        }
      }
    } else {
      const { data: profile, error: profileError } = await supabase
        .from('asesores')
        .select('correo_electronico')
        .eq('cedula', cedula.trim())
        .maybeSingle();

      if (profileError || !profile) {
        setMensaje({ tipo: 'error', texto: 'La cédula digitada no está registrada como asesor.' });
        setLoading(false);
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: profile.correo_electronico,
        password: password,
      });

      if (loginError) {
        setMensaje({ tipo: 'error', texto: 'Contraseña incorrecta. Intente de nuevo.' });
      } else {
        router.push('/asesor');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-white font-sans">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <span className="text-4xl">🍞</span>
          <h2 className="mt-3 text-2xl font-bold tracking-wider">PAN PA YA</h2>
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-blue-500"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Cédula</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-blue-500"
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
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-blue-500"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-blue-500"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Zona</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sabana, Centro, Norte"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-blue-500"
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                />
              </div>
            </>
          )}

          {!isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Número de Cédula
              </label>
              <input
                type="text"
                required
                placeholder="Digite su identificación"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
              />
            </div>
          )}

          <div className={isRegister ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Contraseña</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Verificación de Contraseña
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold shadow-lg transition hover:bg-blue-700 disabled:opacity-50 mt-2"
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
            }}
            className="text-xs text-slate-400 hover:text-blue-400 transition underline decoration-dotted"
          >
            {isRegister
              ? '¿Ya tienes cuenta? Inicia Sesión con Cédula'
              : '¿Eres un asesor nuevo? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
