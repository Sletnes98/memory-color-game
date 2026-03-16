const express = require("express");
const GameService = require("../services/gameService");
const attachUser = require("../middleware/attachUser");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.post("/", attachUser, requireAuth, (req, res, next) => {
  try {
    const { player1Id } = req.body;

    if (!player1Id) {
      const err = new Error("player1Id is required");
      err.status = 400;
      throw err;
    }

    const game = GameService.createGame(player1Id);

    res.status(201).json(game);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/join", attachUser, requireAuth, (req, res, next) => {
  try {
    const { player2Id } = req.body;
    const { id } = req.params;

    if (!player2Id) {
      const err = new Error("player2Id is required");
      err.status = 400;
      throw err;
    }

    const game = GameService.joinGame(id, player2Id);

    res.json(game);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    const game = GameService.getGame(req.params.id);

    if (!game) {
      const err = new Error("Game not found");
      err.status = 404;
      throw err;
    }

    res.json(game);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/move", attachUser, requireAuth, (req, res, next) => {
  try {
    const { playerId, input } = req.body;
    const { id } = req.params;

    const game = GameService.submitMove(id, playerId, input);

    res.json(game);
  } catch (err) {
    next(err);
  }
});

module.exports = router;