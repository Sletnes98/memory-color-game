console.log("NEW VERSION LOADED");
console.log("Game page loaded");

const buttons = document.querySelectorAll(".color-btn");
const status = document.getElementById("status");

const gameId = localStorage.getItem("gameId");
const playerId = localStorage.getItem("userId");

let currentInput = [];
let currentGame = null;

async function loadGame() {
  if (!gameId) {
    status.textContent = "No game found.";
    return;
  }

  const res = await fetch(`/games/${gameId}`);
  const game = await res.json();

  currentGame = game;
  currentInput = [];

  console.log("Game state:", game);

  if (game.status === "finished") {
    status.textContent = "Game finished. Winner: " + game.winnerId;
    return;
  }

  status.textContent =
    "Turn: " + game.currentTurn +
    " | Sequence length: " + game.sequence.length;
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

  if (currentGame.currentTurn !== playerId) {
    status.textContent = "It is not your turn.";
    return;
  }

  currentInput.push(color);

  console.log("Current input:", currentInput);

  status.textContent =
    "Your input: " +
    currentInput.join(", ");

  const requiredLength = currentGame.sequence.length + 1;

  if (currentInput.length === requiredLength) {
    sendMove();
  }
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const color = btn.dataset.color;
    console.log("Clicked:", color);
    handleColorClick(color);
  });
});

loadGame();