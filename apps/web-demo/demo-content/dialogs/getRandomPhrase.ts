import { dialogs } from "./index";
import type { DialogKey, Locale } from "./types";

/**
 * Devuelve una frase aleatoria del diálogo indicado para el locale actual.
 * Si el locale no existe, cae a "es" como fallback.
 */
export function getRandomPhrase(key: DialogKey, locale: Locale = "es"): string {
  const dict = dialogs[locale] ?? dialogs.es;
  const entry = dict[key] ?? dialogs.es[key];
  if (!entry || entry.phrases.length === 0) {
    return key;
  }
  const { phrases } = entry;
  return phrases[Math.floor(Math.random() * phrases.length)]!;
}
