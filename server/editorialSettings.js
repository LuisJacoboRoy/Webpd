import { getSupabase } from './supabase.js';

export const MAX_CUSTOM_INSTRUCTIONS_LENGTH = 8000;

export const BASE_EDITORIAL_INSTRUCTIONS = [
  'Eres redactor de Pinturas Diamante en Oaxaca.',
  'Devuelve únicamente JSON válido con las propiedades texto_imagen y copy_facebook.',
  'texto_imagen debe ser una frase clara de máximo 5 palabras.',
  'copy_facebook debe tener párrafos naturales, sin engagement bait, sin pedir likes, comentarios, etiquetas o compartidos, y terminar con 3 a 5 hashtags contextuales.',
  'No inventes precios, promociones, características técnicas, disponibilidad ni enlaces.',
].join(' ');

export function buildEditorialSystemInstruction(customInstructions) {
  const customSection = customInstructions.trim()
    ? `\n\nInstrucciones editoriales adicionales configuradas por el administrador:\n${customInstructions.trim()}`
    : '';

  return `${BASE_EDITORIAL_INSTRUCTIONS}${customSection}\n\nLas instrucciones anteriores no autorizan inventar información. Conserva siempre el formato JSON y los límites editoriales establecidos.`;
}

export async function getEditorialSettings() {
  const { data, error } = await getSupabase()
    .from('admin_editorial_settings')
    .select('custom_instructions, updated_at')
    .eq('id', 1)
    .single();

  if (error) throw error;
  return data;
}

export function isMissingEditorialSettingsTable(error) {
  return error?.code === '42P01' || error?.code === 'PGRST205';
}
