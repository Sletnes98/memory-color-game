const express = require("express");
const UserService = require("../services/userService");

const router = express.Router();

function requireConsent(consent) {
  if (!consent?.acceptedTerms || !consent?.acceptedPrivacy) {
    const error = new Error("Consent to Terms and Privacy Policy is required");
    error.status = 400;
    throw error;
  }
}

router.post("/", async (req, res) => {
  try {
    const { displayName, consent } = req.body;

    requireConsent(consent);

    const now = new Date().toISOString();

    const user = await UserService.createUser({
      displayName,
      acceptedTermsAt: now,
      acceptedPrivacyAt: now
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserService.getUser(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const displayName = req.body?.displayName ?? req.body;

    const user = await UserService.updateUser(id, displayName);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await UserService.deleteUser(id);
    res.status(204).end();
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

module.exports = router;