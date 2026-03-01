const pool = require("../db");
const crypto = require("crypto");

function requireDisplayName(displayName) {
  if (!displayName || !displayName.trim()) {
    const err = new Error("displayName is required");
    err.status = 400;
    throw err;
  }
}

async function createUser({ displayName, acceptedTermsAt, acceptedPrivacyAt }) {
  requireDisplayName(displayName);

  const id = crypto.randomUUID();

  const result = await pool.query(
    `
    INSERT INTO users (id, display_name, accepted_terms_at, accepted_privacy_at)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
    `,
    [id, displayName.trim(), acceptedTermsAt, acceptedPrivacyAt]
  );

  return result.rows[0];
}

async function getUser(id) {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function updateUser(id, displayName) {
  requireDisplayName(displayName);

  const result = await pool.query(
    `
    UPDATE users
    SET display_name = $1
    WHERE id = $2
    RETURNING *;
    `,
    [displayName.trim(), id]
  );

  return result.rows[0] || null;
}

async function deleteUser(id) {
  await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
}

module.exports = {
  createUser,
  getUser,
  updateUser,
  deleteUser,
};