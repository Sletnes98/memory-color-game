// --------------------------------------------------
// Henter det vi trenger
// --------------------------------------------------
const express = require("express");
const crypto = require("crypto");

// --------------------------------------------------
// Starter express-appen
// --------------------------------------------------
const app = express();
const PORT = 3000;

// --------------------------------------------------
// Gjør at vi kan lese JSON i POST-requests
// --------------------------------------------------
app.use(express.json());

// --------------------------------------------------
// Enkel in-memory lagring av brukere
// (forsvinner når serveren stoppes)
// --------------------------------------------------
const users = new Map();

// --------------------------------------------------
// Lager en enkel og unik bruker-id
// --------------------------------------------------
function makeUserId() {
  return "u_" + crypto.randomUUID();
}

// --------------------------------------------------
// Health check for å se at serveren kjører
// --------------------------------------------------
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// --------------------------------------------------
// POST /users
// Lager en ny bruker hvis consent er gitt
// --------------------------------------------------
app.post("/users", (req, res) => {
  const displayName = req.body.displayName;
  const consent = req.body.consent;

  // sjekker at bruker har akseptert vilkår og personvern
  const acceptedTerms =
    consent && consent.acceptedTerms === true;

  const acceptedPrivacy =
    consent && consent.acceptedPrivacy === true;

  if (!acceptedTerms || !acceptedPrivacy) {
    return res.status(400).json({
      error: {
        code: "CONSENT_REQUIRED",
        message:
          "You must accept Terms of Service and Privacy Policy to create an account."
      }
    });
  }

  // displayName er valgfritt, men hvis det finnes må det være gyldig
  if (displayName !== undefined) {
    if (typeof displayName !== "string") {
      return res.status(400).json({
        error: {
          code: "INVALID_DISPLAY_NAME",
          message: "displayName must be a string."
        }
      });
    }

    const trimmed = displayName.trim();

    if (trimmed.length < 1 || trimmed.length > 30) {
      return res.status(400).json({
        error: {
          code: "INVALID_DISPLAY_NAME",
          message: "displayName must be 1–30 characters."
        }
      });
    }
  }

  // lager selve brukeren
  const now = new Date().toISOString();
  const id = makeUserId();

  const user = {
    id: id,
    displayName: displayName ? displayName.trim() : undefined,
    createdAt: now,
    acceptedTermsAt: now,
    acceptedPrivacyAt: now
  };

  users.set(id, user);

  return res.status(201).json(user);
});

// --------------------------------------------------
// GET /users/:id
// Henter en bruker basert på id
// --------------------------------------------------
app.get("/users/:id", (req, res) => {
  const id = req.params.id;
  const user = users.get(id);

  if (!user) {
    return res.status(404).json({
      error: {
        code: "USER_NOT_FOUND",
        message: "No user with that id."
      }
    });
  }

  res.json(user);
});

// --------------------------------------------------
// DELETE /users/:id
// Sletter en bruker (rett til sletting)
// --------------------------------------------------
app.delete("/users/:id", (req, res) => {
  const id = req.params.id;
  const existed = users.delete(id);

  if (!existed) {
    return res.status(404).json({
      error: {
        code: "USER_NOT_FOUND",
        message: "No user with that id."
      }
    });
  }

  res.status(204).send();
});

// --------------------------------------------------
// Starter serveren
// --------------------------------------------------
app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
