const express = require("express");
const router = express.Router();
const { users } = require("../data/users");
const crypto = require("crypto");

// ---------------------
// Opprette bruker (ingen database, bare i minnet)
// ---------------------
router.post("/", (req, res) => {
  const { displayName, consent } = req.body;

  // Litt basic sjekk så vi ikke får tomme/rare brukere
  const cleanName = (displayName || "").trim();
  if (!cleanName) {
    return res.status(400).json({
      error: "displayName is required"
    });
  }

  // Må ha aktivt samtykke til begge
  if (!consent?.acceptedTerms || !consent?.acceptedPrivacy) {
    return res.status(400).json({
      error: "Consent to Terms and Privacy Policy is required"
    });
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const user = {
    id,
    displayName: cleanName,
    createdAt: now,

    // Jeg lagrer bare tidspunkt (dataminimering),
    // og ikke hele consent-objektet.
    acceptedTermsAt: now,
    acceptedPrivacyAt: now
  };

  users.set(id, user);
  res.status(201).json(user);
});

// ---------------------
// Hente én bruker
// ---------------------
router.get("/:id", (req, res) => {
  const { id } = req.params;

  if (!users.has(id)) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(users.get(id));
});

// ---------------------
// Slette bruker
// ---------------------
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  if (!users.has(id)) {
    return res.status(404).json({ error: "User not found" });
  }

  users.delete(id);
  res.status(204).end();
});

module.exports = router;
