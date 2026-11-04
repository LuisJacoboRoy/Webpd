SELECT
  to_regprocedure('public.validar_lote()') IS NOT NULL AS funcion_existe,
  has_function_privilege('service_role', 'public.validar_lote()', 'EXECUTE')
    AS service_role_puede_ejecutar,
  has_function_privilege('anon', 'public.validar_lote()', 'EXECUTE')
    AS anon_puede_ejecutar,
  has_function_privilege('authenticated', 'public.validar_lote()', 'EXECUTE')
    AS authenticated_puede_ejecutar;
