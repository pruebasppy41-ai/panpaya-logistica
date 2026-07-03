-- Ejecutar SOLO si la tabla asesores ya existe (creación manual previa).
-- Crea la función auxiliar si falta, luego RLS y políticas.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE asesores
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_asesores_cedula ON asesores (cedula);
CREATE INDEX IF NOT EXISTS idx_asesores_correo ON asesores (correo_electronico);

DROP TRIGGER IF EXISTS asesores_updated_at ON asesores;
CREATE TRIGGER asesores_updated_at
  BEFORE UPDATE ON asesores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE asesores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "asesores_select_login" ON asesores;
CREATE POLICY "asesores_select_login" ON asesores
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "asesores_insert_own" ON asesores;
CREATE POLICY "asesores_insert_own" ON asesores
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "asesores_update_own" ON asesores;
CREATE POLICY "asesores_update_own" ON asesores
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);
