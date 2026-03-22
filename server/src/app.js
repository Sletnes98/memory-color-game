require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");

const usersRouter = require("./routes/users");
const gamesRouter = require("./routes/games");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../../client")));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get("/terms", (req, res) => {
  const filePath = path.join(__dirname, "../../TERMS.md");
  const content = fs.readFileSync(filePath, "utf-8");
  res.type("text/plain").send(content);
});

app.get("/privacy", (req, res) => {
  const filePath = path.join(__dirname, "../../PRIVACY.md");
  const content = fs.readFileSync(filePath, "utf-8");
  res.type("text/plain").send(content);
});

app.use("/users", usersRouter);
app.use("/games", gamesRouter);

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
}

async function startServer() {
  try {
    await initDb();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
}

startServer();