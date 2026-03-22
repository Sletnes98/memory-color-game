let dict = {};
let lang = "en";

function detectLang() {
  const value = (navigator.languages?.[0] || navigator.language || "en").toLowerCase();
  return value.startsWith("nb") || value.startsWith("no") ? "nb" : "en";
}

export async function initI18n() {
  lang = detectLang();

  const response = await fetch(`/i18n/${lang}.json`);
  dict = await response.json();

  document.documentElement.lang = lang;
}

export function t(key) {
  return dict[key] ?? key;
}

export function translatePage(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    const [attr, key] = element.dataset.i18nAttr.split(":");
    element.setAttribute(attr, t(key));
  });
}

export function getLang() {
  return lang;
}