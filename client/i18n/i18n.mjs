let dict = {};
let lang = "en";

function detectLang() {
  const l = (navigator.languages?.[0] || navigator.language || "en").toLowerCase();
  return l.startsWith("nb") || l.startsWith("no") ? "nb" : "en";
}

export async function initI18n() {
  lang = detectLang();

  const res = await fetch(`/i18n/${lang}.json`);
  dict = await res.json();

  document.documentElement.lang = lang;
}

export function t(key) {
  return dict?.[key] ?? key;
}

export function translatePage(root = document) {

  root.querySelectorAll("[data-i18n]").forEach(el =>
    el.textContent = t(el.dataset.i18n)
  );

  root.querySelectorAll("[data-i18n-attr]").forEach(el => {
    const [attr, key] = el.dataset.i18nAttr.split(":");
    el.setAttribute(attr, t(key));
  });

}

export function getLang() {
  return lang;
}