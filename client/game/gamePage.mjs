console.log("Game page loaded");

const buttons = document.querySelectorAll(".color-btn");
const status = document.getElementById("status");

const gameId = sessionStorage.getItem("gameId") || localStorage.getItem("gameId");
const playerId = sessionStorage.getItem("userId") || localStorage.getItem("userId");

let currentInput = [];
let currentGame = null;
let userNames = {};

async function getUserName(userId) {
  if (!userId) return "Unknown";
  if (userNames[userId]) return userNames[userId];

  const res = await fetch(`/users/${userId}`);

  if (!res.ok) {
    return userId;
  }

  const user = await res.json();
  userNames[userId] = user.display_name || userId;

  return userNames[userId];
}

async function loadGame() {
  if (!gameId) {
    status.textContent = "No game found.";
    return;
  }

  const res = await fetch(`/games/${gameId}`);

  if (!res.ok) {
    status.textContent = "Could not load game.";
    return;
  }

  const game = await res.json();
  currentGame = game;

  const player1Name = await getUserName(game.player1Id);
  const player2Name = await getUserName(game.player2Id);
  const currentTurnName = await getUserName(game.currentTurn);
  const winnerName = await getUserName(game.winnerId);

  if (game.status === "waiting") {
    status.textContent = `Waiting for player 2... (${player1Name} is ready)`;
    return;
  }

  if (game.status === "finished") {
    status.textContent = `Game finished. Winner: ${winnerName}`;
    return;
  }

  status.textContent =
    `Turn: ${currentTurnName} | Sequence length: ${game.sequence.length} | Players: ${player1Name} vs ${player2Name}`;
}

async function sendMove() {
  const res = await fetch(`/games/${gameId}/move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      playerId,
      input: currentInput
    })
  });

  if (!res.ok) {
    status.textContent = "Wrong move or wrong player's turn.";
    currentInput = [];
    return;
  }

  const updatedGame = await res.json();

  console.log("Move result:", updatedGame);

  currentInput = [];
  loadGame();
}

function handleColorClick(color) {
  if (!currentGame) return;

  if (currentGame.status === "finished") {
    status.textContent = "Game finished.";
    return;
  }

  if (currentGame.status === "waiting") {
    status.textContent = "Waiting for player 2...";
    return;
  }

  if (currentGame.currentTurn !== playerId) {
    status.textContent = "It is not your turn.";
    return;
  }

  currentInput.push(color);

  console.log("Current input:", currentInput);

  status.textContent = `Your input: ${currentInput.join(", ")}`;

  const requiredLength = currentGame.sequence.length + 1;

  if (currentInput.length === requiredLength) {
    sendMove();
  }
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const color = btn.dataset.color;
    handleColorClick(color);
  });
});

loadGame();
setInterval(loadGame, 1000);