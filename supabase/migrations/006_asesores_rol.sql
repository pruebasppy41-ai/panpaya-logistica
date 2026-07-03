-- Rol de usuario en tabla asesores (asesor | administrador)

ALTER TABLE asesores
  ADD COLUMN IF NOT EXISTS rol TEXT NOT NULL DEFAULT 'asesor';

ALTER TABLE asesores DROP CONSTRAINT IF EXISTS asesores_rol_check;
ALTER TABLE asesores ADD CONSTRAINT asesores_rol_check
  CHECK (rol IN ('asesor', 'administrador'));

-- Ejemplo: promover un usuario a administrador de logística
-- UPDATE asesores SET rol = 'administrador' WHERE correo_electronico = 'admin@panpaya.com';
