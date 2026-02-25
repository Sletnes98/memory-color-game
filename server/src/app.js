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


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
