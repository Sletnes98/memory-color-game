require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("../client"));

const usersRouter = require("./routes/users");
const gamesRouter = require("./routes/games");


const PORT = 3000;

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// User routes
app.use("/users", usersRouter);
app.use("/games", gamesRouter);

const fs = require("fs");
const path = require("path");

// Terms of Service
app.get("/terms", (req, res) => {
  const filePath = path.join(__dirname, "../../TERMS.md");
  const content = fs.readFileSync(filePath, "utf-8");
  res.type("text/plain").send(content);
});

// Privacy Policy
app.get("/privacy", (req, res) => {
  const filePath = path.join(__dirname, "../../PRIVACY.md");
  const content = fs.readFileSync(filePath, "utf-8");
  res.type("text/plain").send(content);
});

const pool = require("./db");

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY,
      display_name text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      accepted_terms_at timestamptz NOT NULL,
      accepted_privacy_at timestamptz NOT NULL
    );
  `);

  console.log("Users table ready");
}

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});