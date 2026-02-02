// src/routes/games.js
const express = require("express");
const router = express.Router();
const { games } = require("../data/games");
const crypto = require("crypto");

// ---------------------
// GET /games
// Returnerer alle spill (scaffold)
// ---------------------
router.get("/", (req, res) => {
  res.json(Array.from(games.values()));
});

// ---------------------
// POST /games
// Lager et nytt spill (scaffold)
// ---------------------
router.post("/", (req, res) => {
  // Foreløpig: veldig enkelt spill-objekt
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const game = {
    id,
    createdAt: now,
    status: "waiting" // typisk startstatus
  };

  games.set(id, game);

  res.status(201).json(game);
});

// ---------------------
// GET /games/:id
// Henter ett spill (scaffold)
// ---------------------
router.get("/:id", (req, res) => {
  const { id } = req.params;

  if (!games.has(id)) {
    return res.status(404).json({ error: "Game not found" });
  }

  res.json(games.get(id));
});

module.exports = router;
