import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseAdmin';
import { ZONAS_DISTRIBUCION, nombresZonasPorCodigos } from '@/lib/zonas';

const CODIGOS_VALIDOS = new Set(ZONAS_DISTRIBUCION.map((z) => z.codigo));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nombre,
      cedula,
      codigo,
      correo,
      password,
      zonas,
    }: {
      nombre?: string;
      cedula?: string;
      codigo?: string;
      correo?: string;
      password?: string;
      zonas?: string[];
    } = body;

    if (!nombre?.trim() || !cedula?.trim() || !correo?.trim() || !password) {
      return NextResponse.json({ error: 'Complete todos los campos obligatorios.' }, { status: 400 });
    }

    if (!zonas?.length) {
      return NextResponse.json({ error: 'Seleccione al menos una zona.' }, { status: 400 });
    }

    const zonasInvalidas = zonas.filter((z) => !CODIGOS_VALIDOS.has(z));
    if (zonasInvalidas.length > 0) {
      return NextResponse.json({ error: 'Una o más zonas seleccionadas no son válidas.' }, { status: 400 });
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
    const nombresZona = Array.from(new Set(nombresZonasPorCodigos(zonas)));

    const { error: perfilError } = await admin.from('asesores').insert({
      id: userId,
      nombres_apellidos: nombre.trim(),
      cedula: cedula.trim(),
      codigo_opcional: codigo?.trim() || null,
      correo_electronico: email,
      zona: nombresZona.join(' | '),
      rol: 'asesor',
    });

    if (perfilError) {
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Error al guardar perfil: ' + perfilError.message },
        { status: 400 }
      );
    }

    const { error: zonasError } = await admin.from('asesor_zonas').insert(
      zonas.map((codigo_zona) => ({ asesor_id: userId, codigo_zona }))
    );

    if (zonasError) {
      await admin.from('asesores').delete().eq('id', userId);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Error al asignar zonas: ' + zonasError.message },
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
            'Falta SUPABASE_SERVICE_ROLE_KEY en Vercel. Agréguela en Environment Variables y haga Redeploy.',
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
