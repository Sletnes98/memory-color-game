const crypto = require("crypto");

const games = new Map();
const colors = ["red", "green", "blue", "yellow"];

function createGame(player1Id) {
  const game = {
    id: crypto.randomUUID(),
    player1Id,
    player2Id: null,
    sequence: [],
    currentTurn: null,
    status: "waiting",
    winnerId: null,
    createdAt: new Date().toISOString()
  };

  games.set(game.id, game);

  return game;
}

function getGame(gameId) {
  return games.get(gameId) || null;
}

function joinGame(gameId, player2Id) {
  const game = getGame(gameId);

  if (!game) {
    const error = new Error("Game not found");
    error.status = 404;
    throw error;
  }

  if (game.status !== "waiting") {
    const error = new Error("Game is not open for joining");
    error.status = 400;
    throw error;
  }

  if (game.player1Id === player2Id) {
    const error = new Error("Player 1 and Player 2 cannot be the same user");
    error.status = 400;
    throw error;
  }

  game.player2Id = player2Id;
  game.sequence = [];
  game.currentTurn = game.player1Id;
  game.status = "playing";

  return game;
}

function submitMove(gameId, playerId, input) {
  const game = getGame(gameId);

  if (!game) {
    const error = new Error("Game not found");
    error.status = 404;
    throw error;
  }

  if (game.status !== "playing") {
    const error = new Error("Game is not active");
    error.status = 400;
    throw error;
  }

  if (game.currentTurn !== playerId) {
    const error = new Error("It is not this player's turn");
    error.status = 400;
    throw error;
  }

  if (!Array.isArray(input)) {
    const error = new Error("Input must be an array");
    error.status = 400;
    throw error;
  }

  if (input.length !== game.sequence.length + 1) {
    const error = new Error("Input must repeat the sequence and add one new color");
    error.status = 400;
    throw error;
  }

  for (let index = 0; index < game.sequence.length; index += 1) {
    if (input[index] !== game.sequence[index]) {
      game.status = "finished";
      game.winnerId = playerId === game.player1Id ? game.player2Id : game.player1Id;
      return game;
    }
  }

  const newColor = input[input.length - 1];

  if (!colors.includes(newColor)) {
    const error = new Error("Invalid color");
    error.status = 400;
    throw error;
  }

  game.sequence = input;
  game.currentTurn = playerId === game.player1Id ? game.player2Id : game.player1Id;

  return game;
}

module.exports = {
  createGame,
  getGame,
  joinGame,
  submitMove
};