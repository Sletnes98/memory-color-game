// server/src/i18n/errors.js

const MESSAGES = {
  en: {
    DISPLAYNAME_REQUIRED: "Display name is required",
    CONSENT_REQUIRED: "Consent to Terms of Service and Privacy Policy is required",
    USER_NOT_FOUND: "User not found",
    GENERIC: "Something went wrong"
  },

  nb: {
    DISPLAYNAME_REQUIRED: "Visningsnavn er påkrevd",
    CONSENT_REQUIRED: "Du må godta vilkår og personvern",
    USER_NOT_FOUND: "Fant ikke bruker",
    GENERIC: "Noe gikk galt"
  }
};

// Leser språk fra browser header
function getLang(req) {
  const header = (req.headers["accept-language"] || "").toLowerCase();

  if (header.includes("nb") || header.includes("no")) {
    return "nb";
  }

  return "en";
}

// Henter riktig melding
function msg(req, code) {
  const lang = getLang(req);
  return MESSAGES[lang][code] || MESSAGES[lang].GENERIC;
}

module.exports = {
  msg,
  getLang
};