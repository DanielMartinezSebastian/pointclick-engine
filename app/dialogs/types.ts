export type Locale = "es" | "en";

export type DialogKey = string;

export type DialogEntry = {
  /** Una o varias frases. Se elegirá una aleatoriamente cuando haya múltiples. */
  phrases: string[];
};

export type DialogDictionary = Record<string, DialogEntry>;

export type DialogLocales = Record<Locale, DialogDictionary>;
