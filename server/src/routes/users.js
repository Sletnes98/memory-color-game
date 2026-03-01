const express = require("express");
const router = express.Router();

const UserService = require("../services/userService");

function requireConsent(consent) {
  if (!consent?.acceptedTerms || !consent?.acceptedPrivacy) {
    const err = new Error("Consent to Terms and Privacy Policy is required");
    err.status = 400;
    throw err;
  }
}

// Opprette bruker
router.post("/", async (req, res) => {
  try {
    const { displayName, consent } = req.body;

    requireConsent(consent);

    const now = new Date().toISOString();

    const user = await UserService.createUser({
      displayName,
      acceptedTermsAt: now,
      acceptedPrivacyAt: now,
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Hente én bruker
router.get("/:id", async (req, res) => {
  try {
    const user = await UserService.getUser(req.params.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Oppdatere bruker
router.put("/:id", async (req, res) => {
  try {
    // tillat enten { displayName: "..." } eller bare "..." hvis du vil
    const displayName = req.body?.displayName ?? req.body;

    const user = await UserService.updateUser(req.params.id, displayName);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Slette bruker
router.delete("/:id", async (req, res) => {
  try {
    await UserService.deleteUser(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;