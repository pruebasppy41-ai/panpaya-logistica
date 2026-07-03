import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseAdmin } from '@/lib/supabaseAdmin';
import { supabaseUrl } from '@/lib/supabase';

function resolveAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cedula,
      password,
      rolRequerido,
    }: {
      cedula?: string;
      password?: string;
      rolRequerido?: 'asesor' | 'administrador';
    } = body;

    if (!cedula?.trim() || !password) {
      return NextResponse.json({ error: 'Cédula y contraseña son obligatorias.' }, { status: 400 });
    }

    const admin = createSupabaseAdmin();
    const cedulaNorm = cedula.trim();

    const { data: perfil, error: perfilError } = await admin
      .from('asesores')
      .select('correo_electronico, rol')
      .eq('cedula', cedulaNorm)
      .maybeSingle();

    if (perfilError) {
      return NextResponse.json(
        { error: 'Error al consultar la base de datos: ' + perfilError.message },
        { status: 500 }
      );
    }

    if (!perfil) {
      return NextResponse.json(
        { error: 'La cédula no está registrada. Verifique el número o regístrese primero.' },
        { status: 404 }
      );
    }

    if (rolRequerido) {
      const rolEfectivo = perfil.rol ?? 'asesor';
      if (rolEfectivo !== rolRequerido) {
      const msg =
        rolRequerido === 'administrador'
          ? 'Acceso denegado: Esta cédula no tiene permisos administrativos.'
          : 'Esta cédula pertenece a un administrador. Use el módulo de Logística para ingresar.';
      return NextResponse.json({ error: msg }, { status: 403 });
    }

    const anonKey = resolveAnonKey();
    if (!anonKey) {
      return NextResponse.json({ error: 'Falta NEXT_PUBLIC_SUPABASE_ANON_KEY en el servidor.' }, { status: 500 });
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: authData, error: loginError } = await authClient.auth.signInWithPassword({
      email: perfil.correo_electronico,
      password,
    });

    if (loginError) {
      return NextResponse.json({ error: 'Contraseña incorrecta. Intente de nuevo.' }, { status: 401 });
    }

    if (!authData.session) {
      return NextResponse.json({ error: 'No se pudo iniciar sesión. Intente de nuevo.' }, { status: 500 });
    }

    return NextResponse.json({
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      },
      rol: perfil.rol,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error interno del servidor';
    if (msg.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return NextResponse.json(
        { error: 'Falta SUPABASE_SERVICE_ROLE_KEY en Vercel. Agréguela y haga Redeploy.' },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
