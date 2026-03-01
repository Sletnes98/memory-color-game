require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../../client")));

const usersRouter = require("./routes/users");
const gamesRouter = require("./routes/games");
const pool = require("./db");

const PORT = process.env.PORT || 3000;

/* -----------------------
   Health check
----------------------- */
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/* -----------------------
   Routes
----------------------- */
app.use("/users", usersRouter);
app.use("/games", gamesRouter);

/* -----------------------
   Terms of Service
----------------------- */
app.get("/terms", (req, res) => {
  const filePath = path.join(__dirname, "../../TERMS.md");
  const content = fs.readFileSync(filePath, "utf-8");
  res.type("text/plain").send(content);
});

/* -----------------------
   Privacy Policy
----------------------- */
app.get("/privacy", (req, res) => {
  const filePath = path.join(__dirname, "../../PRIVACY.md");
  const content = fs.readFileSync(filePath, "utf-8");
  res.type("text/plain").send(content);
});

/* -----------------------
   Database init
----------------------- */
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

/* -----------------------
   DB test endpoint
----------------------- */
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* -----------------------
   Start server
----------------------- */
initDb()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });