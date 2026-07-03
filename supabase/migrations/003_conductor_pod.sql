-- Acceso para conductores (sin login) + bucket de evidencias POD

-- Lectura de rutas y pedidos del día
DROP POLICY IF EXISTS "rutas_select_anon" ON rutas;
CREATE POLICY "rutas_select_anon" ON rutas
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "pedidos_select_anon" ON pedidos;
CREATE POLICY "pedidos_select_anon" ON pedidos
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "pedidos_update_conductor" ON pedidos;
CREATE POLICY "pedidos_update_conductor" ON pedidos
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Bucket público para fotos POD
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidencias-entrega', 'evidencias-entrega', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "evidencias_public_read" ON storage.objects;
CREATE POLICY "evidencias_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'evidencias-entrega');

DROP POLICY IF EXISTS "evidencias_anon_upload" ON storage.objects;
CREATE POLICY "evidencias_anon_upload" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'evidencias-entrega');

DROP POLICY IF EXISTS "evidencias_anon_update" ON storage.objects;
CREATE POLICY "evidencias_anon_update" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'evidencias-entrega');
