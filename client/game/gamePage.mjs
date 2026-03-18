console.log("Game page loaded");

const currentUserEl = document.getElementById("currentUser");
const turnInfoEl = document.getElementById("turnInfo");
const buttons = document.querySelectorAll(".color-btn");
const status = document.getElementById("status");

const gameId = sessionStorage.getItem("gameId") || localStorage.getItem("gameId");
const playerId = sessionStorage.getItem("userId") || localStorage.getItem("userId");

let currentInput = [];
let currentGame = null;
let userNames = {};
let inputLocked = false;
let showingSequence = false;
let lastShownTurn = null;
let lastShownLength = -1;

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

function updateTurnInfo() {
  if (!currentGame) {
    turnInfoEl.textContent = "";
    return;
  }

  if (currentGame.status === "waiting") {
    turnInfoEl.textContent = "Waiting for another player...";
    return;
  }

  if (currentGame.status === "finished") {
    turnInfoEl.textContent = "";
    return;
  }

  if (showingSequence) {
    turnInfoEl.textContent = "Watch the sequence...";
    return;
  }

  if (currentGame.currentTurn !== playerId) {
    turnInfoEl.textContent = "Wait for your turn.";
    return;
  }

  const requiredLength = currentGame.sequence.length + 1;
  const remaining = requiredLength - currentInput.length;

  if (remaining > 0) {
    turnInfoEl.textContent = `Clicks left this round: ${remaining}`;
  } else {
    turnInfoEl.textContent = "Checking move...";
  }
}

function disableButtons() {
  buttons.forEach((btn) => {
    btn.disabled = true;
  });
}

function enableButtons() {
  buttons.forEach((btn) => {
    btn.disabled = false;
  });
}

function getButtonByColor(color) {
  return document.querySelector(`.color-btn[data-color="${color}"]`);
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function showSequence(sequence) {
  if (!sequence.length) {
    return;
  }

  showingSequence = true;
  inputLocked = true;
  disableButtons();
  updateTurnInfo();

  for (const color of sequence) {
    const button = getButtonByColor(color);

    if (!button) continue;

    button.classList.add("active");
    await wait(600);
    button.classList.remove("active");
    await wait(250);
  }

  showingSequence = false;
  inputLocked = false;

  if (currentGame && currentGame.currentTurn === playerId && currentGame.status === "playing") {
    enableButtons();
  }

  updateTurnInfo();
}

async function loadGame() {
  if (!gameId) {
    status.textContent = "No game found.";
    turnInfoEl.textContent = "";
    return;
  }

  const res = await fetch(`/games/${gameId}`);

  if (!res.ok) {
    status.textContent = "Game not found or server restarted.";
    turnInfoEl.textContent = "";
    clearInterval(gameLoop);
    return;
  }

  const game = await res.json();

  const previousTurn = currentGame?.currentTurn;
  const previousLength = currentGame?.sequence.length;
  const previousStatus = currentGame?.status;

  currentGame = game;

  const me = await getUserName(playerId);
  currentUserEl.textContent = `Logged in as: ${me}`;

  const player1Name = await getUserName(game.player1Id);
  const player2Name = await getUserName(game.player2Id);
  const currentTurnName = await getUserName(game.currentTurn);
  const winnerName = await getUserName(game.winnerId);

  const turnChanged = previousTurn !== game.currentTurn;
  const sequenceChanged = previousLength !== game.sequence.length;
  const statusChanged = previousStatus !== game.status;

  if (turnChanged || sequenceChanged || statusChanged) {
    currentInput = [];
    inputLocked = false;
  }

  if (game.status === "waiting") {
    status.textContent = `Waiting for player 2... (${player1Name} is ready)`;
    disableButtons();
    updateTurnInfo();
    return;
  }

  if (game.status === "finished") {
    status.textContent = `Game finished. Winner: ${winnerName}`;
    disableButtons();
    updateTurnInfo();
    return;
  }

  if (game.currentTurn === playerId) {
    status.textContent = `🟢 YOUR TURN | Sequence: ${game.sequence.length}`;
  } else {
    status.textContent = `🔴 ${currentTurnName}'s turn | Sequence: ${game.sequence.length}`;
    disableButtons();
  }

  const shouldShowSequence =
    game.currentTurn === playerId &&
    !showingSequence &&
    (lastShownTurn !== game.currentTurn || lastShownLength !== game.sequence.length);

  if (shouldShowSequence) {
    lastShownTurn = game.currentTurn;
    lastShownLength = game.sequence.length;
    await showSequence(game.sequence);
  } else if (game.currentTurn === playerId && !inputLocked && !showingSequence) {
    enableButtons();
  }

  updateTurnInfo();
}

async function sendMove() {
  inputLocked = true;
  disableButtons();
  updateTurnInfo();

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
    inputLocked = false;

    if (currentGame?.currentTurn === playerId && !showingSequence) {
      enableButtons();
    }

    updateTurnInfo();
    return;
  }

  const updatedGame = await res.json();

  console.log("Move result:", updatedGame);

  currentGame = updatedGame;
  currentInput = [];
  inputLocked = false;
  loadGame();
}

function handleColorClick(color) {
  if (!currentGame) return;
  if (inputLocked) return;
  if (showingSequence) return;

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

  const requiredLength = currentGame.sequence.length + 1;

  if (currentInput.length >= requiredLength) {
    inputLocked = true;
    disableButtons();
    updateTurnInfo();
    return;
  }

  currentInput.push(color);

  const button = getButtonByColor(color);
  if (button) {
    button.classList.add("active");
    setTimeout(() => {
      button.classList.remove("active");
    }, 180);
  }

  console.log("Current input:", currentInput);

  status.textContent = `Your input: ${currentInput.join(", ")}`;
  updateTurnInfo();

  if (currentInput.length === requiredLength) {
    inputLocked = true;
    disableButtons();
    updateTurnInfo();
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
const gameLoop = setInterval(loadGame, 1000);