import {
  getDictionary,
  registerDictionary,
  type DialogDictionary,
  type Verb,
} from "@pointclick-engine/engine-core";

/** Claves de i18n propias del motor (renderer). El host puede sobrescribirlas registrando las suyas. */
export const ENGINE_VERB_LABEL_KEYS: Record<Verb, string> = {
  look: "engine.verb.look",
  use: "engine.verb.use",
  talk: "engine.verb.talk",
};

/** Frase generica cuando un hotspot no tiene accion para lo pedido. */
export const ENGINE_NO_ACTION_KEY = "engine.hotspot.noAction";

const DEFAULTS: Record<string, DialogDictionary> = {
  es: {
    [ENGINE_VERB_LABEL_KEYS.look]: { phrases: ["Mirar"] },
    [ENGINE_VERB_LABEL_KEYS.use]: { phrases: ["Usar"] },
    [ENGINE_VERB_LABEL_KEYS.talk]: { phrases: ["Hablar"] },
    [ENGINE_NO_ACTION_KEY]: { phrases: ["No sé qué hacer con eso."] },
  },
  en: {
    [ENGINE_VERB_LABEL_KEYS.look]: { phrases: ["Look"] },
    [ENGINE_VERB_LABEL_KEYS.use]: { phrases: ["Use"] },
    [ENGINE_VERB_LABEL_KEYS.talk]: { phrases: ["Talk"] },
    [ENGINE_NO_ACTION_KEY]: { phrases: ["I don't know what to do with that."] },
  },
};

/**
 * Registra los textos por defecto (es, en) solo para las claves que el host no haya
 * definido ya. Idempotente; se llama al montar la capa de hotspots, no al importar.
 */
export function ensureEngineTexts(): void {
  for (const [locale, defaults] of Object.entries(DEFAULTS)) {
    const existing = getDictionary(locale);
    const missing: DialogDictionary = {};
    for (const [key, entry] of Object.entries(defaults)) {
      if (!existing?.[key]) missing[key] = entry;
    }
    if (Object.keys(missing).length > 0) registerDictionary(locale, missing);
  }
}
