CREATE OR REPLACE FUNCTION public.validar_lote()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active_count integer;
  v_unique_days integer;
  v_approved_count integer;
  v_max_future_date date;
  v_next_date date;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('public.publicaciones.admin_campaign'));

  SELECT count(*), count(DISTINCT dia_campana)
    INTO v_active_count, v_unique_days
  FROM public.publicaciones
  WHERE dia_campana BETWEEN 1 AND 10;

  IF v_active_count <> 10 OR v_unique_days <> 10 THEN
    RAISE EXCEPTION 'El lote activo debe contener exactamente los días 1 a 10';
  END IF;

  SELECT count(*)
    INTO v_approved_count
  FROM public.publicaciones
  WHERE dia_campana BETWEEN 1 AND 10
    AND estado = 'aprobado';

  IF v_approved_count = 0 THEN
    RAISE EXCEPTION 'Aprueba al menos una publicación antes de validar el lote';
  END IF;

  SELECT MAX(fecha_programada)
    INTO v_max_future_date
  FROM public.publicaciones
  WHERE fecha_programada >= CURRENT_DATE;

  IF v_max_future_date IS NULL THEN
    v_next_date := CURRENT_DATE + 1;
  ELSE
    v_next_date := v_max_future_date + 1;
  END IF;

  WITH approved AS (
    SELECT id, (row_number() OVER (ORDER BY dia_campana) - 1)::integer AS day_offset
    FROM public.publicaciones
    WHERE dia_campana BETWEEN 1 AND 10
      AND estado = 'aprobado'
  )
  UPDATE public.publicaciones AS publication
  SET fecha_programada = v_next_date + approved.day_offset,
      dia_campana = NULL
  FROM approved
  WHERE publication.id = approved.id;

  UPDATE public.publicaciones
  SET dia_campana = NULL
  WHERE dia_campana BETWEEN 1 AND 10;

  INSERT INTO public.publicaciones (
    dia_campana,
    texto_imagen,
    color_fondo,
    copy_facebook,
    estado
  )
  SELECT day_number, 'Nuevo contenido', '#16a34a', 'Borrador de publicación', 'borrador'
  FROM generate_series(1, 10) AS days(day_number);

  RETURN jsonb_build_object(
    'aprobadas_agendadas', v_approved_count,
    'primer_dia_agendado', v_next_date,
    'nuevo_lote_creado', 10
  );
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_usuario_unique
  ON public.usuarios (usuario);

REVOKE ALL ON FUNCTION public.validar_lote() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validar_lote() TO service_role;

INSERT INTO public.publicaciones (
  dia_campana,
  texto_imagen,
  color_fondo,
  copy_facebook,
  estado
)
SELECT days.day_number, 'Nuevo contenido', '#16a34a', 'Borrador de publicación', 'borrador'
FROM generate_series(1, 10) AS days(day_number)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.publicaciones AS publication
  WHERE publication.dia_campana = days.day_number
);
