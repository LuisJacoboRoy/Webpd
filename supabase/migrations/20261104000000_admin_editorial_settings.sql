BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_editorial_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  custom_instructions text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_editorial_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.admin_editorial_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_editorial_settings TO service_role;

INSERT INTO public.admin_editorial_settings (id, custom_instructions)
VALUES (1, '')
ON CONFLICT (id) DO NOTHING;

COMMIT;
