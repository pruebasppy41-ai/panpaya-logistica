import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nombre,
      cedula,
      correo,
      cargo,
      password,
    }: {
      nombre?: string;
      cedula?: string;
      correo?: string;
      cargo?: string;
      password?: string;
    } = body;

    if (!nombre?.trim() || !cedula?.trim() || !correo?.trim() || !cargo?.trim() || !password) {
      return NextResponse.json({ error: 'Complete todos los campos obligatorios.' }, { status: 400 });
    }

    const admin = createSupabaseAdmin();
    const email = correo.trim().toLowerCase();

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      const msg = authError.message.includes('already')
        ? 'Este correo ya está registrado. Intente iniciar sesión.'
        : authError.message;
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const userId = authData.user.id;

    const { error: perfilError } = await admin.from('asesores').insert({
      id: userId,
      nombres_apellidos: nombre.trim(),
      cedula: cedula.trim(),
      correo_electronico: email,
      cargo: cargo.trim(),
      rol: 'administrador',
      zona: 'ADMINISTRACION',
    });

    if (perfilError) {
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Error al registrar perfil: ' + perfilError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error interno del servidor';
    if (msg.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return NextResponse.json(
        {
          error:
            'Falta SUPABASE_SERVICE_ROLE_KEY en Vercel. Agréguela y haga Redeploy.',
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
