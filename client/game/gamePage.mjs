console.log("Game page loaded");

const buttons = document.querySelectorAll(".color-btn");
const status = document.getElementById("status");

const gameId = localStorage.getItem("gameId");
const playerId = localStorage.getItem("userId");

async function loadGame() {
  if (!gameId) {
    status.textContent = "No game found.";
    return;
  }

  const res = await fetch(`/games/${gameId}`);
  const game = await res.json();

  console.log("Game state:", game);

  if (game.status === "finished") {
    status.textContent = "Game finished. Winner: " + game.winnerId;
    return;
  }

  status.textContent =
    "Turn: " + game.currentTurn +
    " | Sequence length: " + game.sequence.length;
}

async function sendMove(color) {
  const res = await fetch(`/games/${gameId}/move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      playerId,
      input: [color]
    })
  });

  const game = await res.json();

  console.log("Move result:", game);

  loadGame();
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const color = btn.dataset.color;
    console.log("Clicked:", color);
    sendMove(color);
  });
});

loadGame();