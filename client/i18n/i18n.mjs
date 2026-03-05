let dict = {};
let lang = "en";

function detectLang() {
  const l = (navigator.languages?.[0] || navigator.language || "en").toLowerCase();

  if (l.startsWith("nb") || l.startsWith("no")) {
    return "nb";
  }

  return "en";
}

export async function initI18n() {
  lang = detectLang();

  const res = await fetch(`/i18n/${lang}.json`);
  dict = await res.json();

  document.documentElement.lang = lang;
}

export function t(key) {
  return dict[key] || key;
}

export function getLang() {
  return lang;
}