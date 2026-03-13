const crypto = require("crypto");

const games = new Map();

const colors = ["red", "green", "blue", "yellow"];

function randomColor() {
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
}

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
    const err = new Error("Game not found");
    err.status = 404;
    throw err;
  }

  if (game.status !== "waiting") {
    const err = new Error("Game is not open for joining");
    err.status = 400;
    throw err;
  }

  if (game.player1Id === player2Id) {
    const err = new Error("Player 1 and Player 2 cannot be the same user");
    err.status = 400;
    throw err;
  }

  game.player2Id = player2Id;
  game.sequence = [randomColor()];
  game.currentTurn = game.player1Id;
  game.status = "playing";

  return game;
}

function submitMove(gameId, playerId, input) {
  const game = getGame(gameId);

  if (!game) {
    const err = new Error("Game not found");
    err.status = 404;
    throw err;
  }

  if (game.status !== "playing") {
    const err = new Error("Game is not active");
    err.status = 400;
    throw err;
  }

  if (game.currentTurn !== playerId) {
    const err = new Error("It is not this player's turn");
    err.status = 400;
    throw err;
  }

  if (!Array.isArray(input)) {
    const err = new Error("Input must be an array");
    err.status = 400;
    throw err;
  }

  if (input.length !== game.sequence.length + 1) {
    const err = new Error("Input must repeat the sequence and add one new color");
    err.status = 400;
    throw err;
  }

  for (let i = 0; i < game.sequence.length; i += 1) {
    if (input[i] !== game.sequence[i]) {
      game.status = "finished";
      game.winnerId = playerId === game.player1Id ? game.player2Id : game.player1Id;
      return game;
    }
  }

  const lastColor = input[input.length - 1];

  if (!colors.includes(lastColor)) {
    const err = new Error("Invalid color");
    err.status = 400;
    throw err;
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