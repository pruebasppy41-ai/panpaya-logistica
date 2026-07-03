-- Perfiles de asesores comerciales (vinculados a auth.users)

CREATE TABLE asesores (
  id                  UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  nombres_apellidos   TEXT NOT NULL,
  cedula              TEXT NOT NULL UNIQUE,
  codigo_opcional     TEXT,
  correo_electronico  TEXT NOT NULL UNIQUE,
  zona                TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_asesores_cedula ON asesores (cedula);
CREATE INDEX idx_asesores_correo ON asesores (correo_electronico);

CREATE TRIGGER asesores_updated_at
  BEFORE UPDATE ON asesores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE asesores ENABLE ROW LEVEL SECURITY;

-- Lectura pública de cédula→correo para login (solo correo expuesto en select del cliente)
CREATE POLICY "asesores_select_login" ON asesores
  FOR SELECT TO anon, authenticated
  USING (true);

-- El usuario autenticado puede insertar su propio perfil al registrarse
CREATE POLICY "asesores_insert_own" ON asesores
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- El usuario puede actualizar su propio perfil
CREATE POLICY "asesores_update_own" ON asesores
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);
