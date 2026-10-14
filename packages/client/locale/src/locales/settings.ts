/** `settings.locale` namespace dictionaries (the Language row's copy). */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'language.title': '语言',
} satisfies Record<string, string>

/** The settings.locale namespace key union. */
export type SettingsLocaleKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'language.title': 'Language',
} satisfies Record<SettingsLocaleKey, string>

/** Traditional Chinese (Taiwan), checked against the existing dictionary keys. */
export const zhTW = {
  'language.title': '語言',
} satisfies Record<keyof typeof zh, string>
