const { users } = require("../data/users");
const crypto = require("crypto");

function requireDisplayName(displayName) {
  if (!displayName || !displayName.trim()) {
    const err = new Error("displayName is required");
    err.status = 400;
    throw err;
  }
}

function requireConsent(consent) {
  if (!consent?.acceptedTerms || !consent?.acceptedPrivacy) {
    const err = new Error("Consent to Terms and Privacy Policy is required");
    err.status = 400;
    throw err;
  }
}

function createUser({ displayName, consent }) {
  requireDisplayName(displayName);
  requireConsent(consent);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const user = {
    id,
    displayName: displayName.trim(),
    createdAt: now,
    acceptedTermsAt: now,
    acceptedPrivacyAt: now,
  };

  users.set(id, user);
  return user;
}

function getUser(id) {
  const user = users.get(id);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return user;
}

function updateUser(id, { displayName }) {
  const user = getUser(id);
  requireDisplayName(displayName);

  const updated = { ...user, displayName: displayName.trim() };
  users.set(id, updated);
  return updated;
}

function deleteUser(id) {
  // bruker getUser for å få 404 hvis den ikke finnes
  getUser(id);
  users.delete(id);
}

module.exports = {
  createUser,
  getUser,
  updateUser,
  deleteUser,
};