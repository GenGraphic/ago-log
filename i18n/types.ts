import en from "./locales/en";

type LeafKeys<T, Prev extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? LeafKeys<T[K], `${Prev}${K & string}.`>
    : `${Prev}${K & string}`;
}[keyof T];

export type TranslationKeys = LeafKeys<typeof en>;