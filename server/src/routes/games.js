const express = require("express");
const GameService = require("../services/gameService");
const attachUser = require("../middleware/attachUser");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.post("/", attachUser, requireAuth, (req, res, next) => {
  try {
    const { player1Id } = req.body;

    if (!player1Id) {
      const error = new Error("player1Id is required");
      error.status = 400;
      throw error;
    }

    const game = GameService.createGame(player1Id);

    res.status(201).json(game);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/join", attachUser, requireAuth, (req, res, next) => {
  try {
    const { id } = req.params;
    const { player2Id } = req.body;

    if (!player2Id) {
      const error = new Error("player2Id is required");
      error.status = 400;
      throw error;
    }

    const game = GameService.joinGame(id, player2Id);

    res.json(game);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    const { id } = req.params;
    const game = GameService.getGame(id);

    if (!game) {
      const error = new Error("Game not found");
      error.status = 404;
      throw error;
    }

    res.json(game);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/move", attachUser, requireAuth, (req, res, next) => {
  try {
    const { id } = req.params;
    const { playerId, input } = req.body;

    const game = GameService.submitMove(id, playerId, input);

    res.json(game);
  } catch (error) {
    next(error);
  }
});

module.exports = router;