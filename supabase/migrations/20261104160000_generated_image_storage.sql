BEGIN;

ALTER TABLE public.publicaciones
  ADD COLUMN IF NOT EXISTS imagen_generada_path text,
  ADD COLUMN IF NOT EXISTS imagen_generada_prompt text,
  ADD COLUMN IF NOT EXISTS imagen_generada_modelo text;

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'admin-generated-images',
  'admin-generated-images',
  false,
  12582912,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMIT;
