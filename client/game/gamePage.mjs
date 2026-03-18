console.log("Game page loaded");

/*
  Elements
*/
const currentUserEl = document.getElementById("currentUser");
const turnInfoEl = document.getElementById("turnInfo");
const playersEl = document.getElementById("players");
const sequenceOverlay = document.getElementById("sequenceOverlay");
const showSequenceBtn = document.getElementById("showSequenceBtn");
const statusEl = document.getElementById("status");
const colorButtons = document.querySelectorAll(".color-btn");

/*
  Session data
*/
const gameId = sessionStorage.getItem("gameId");
const playerId = sessionStorage.getItem("userId");

/*
  State
*/
let currentGame = null;
let currentInput = [];
let cachedNames = {};

let inputLocked = false;
let showingSequence = false;

let lastShownTurn = null;
let lastShownLength = -1;

/*
  Helpers
*/
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getButtonByColor(color) {
  return document.querySelector(`.color-btn[data-color="${color}"]`);
}

function disableButtons() {
  colorButtons.forEach((button) => {
    button.disabled = true;
  });
}

function enableButtons() {
  colorButtons.forEach((button) => {
    button.disabled = false;
  });
}

function showSequencePrompt() {
  sequenceOverlay.classList.remove("hidden");
}

function hideSequencePrompt() {
  sequenceOverlay.classList.add("hidden");
}

function setStatus(message) {
  statusEl.textContent = message;
}

function clearRoundInput() {
  currentInput = [];
}

async function getUserName(userId) {
  if (!userId) {
    return "Unknown";
  }

  if (cachedNames[userId]) {
    return cachedNames[userId];
  }

  const response = await fetch(`/users/${userId}`);

  if (!response.ok) {
    return userId;
  }

  const user = await response.json();
  const name = user.display_name || userId;

  cachedNames[userId] = name;

  return name;
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

  const clicksNeeded = currentGame.sequence.length + 1;
  const clicksLeft = clicksNeeded - currentInput.length;

  if (clicksLeft > 0) {
    turnInfoEl.textContent = `Clicks left this round: ${clicksLeft}`;
  } else {
    turnInfoEl.textContent = "Checking move...";
  }
}

/*
  Sequence
*/
async function showSequence(sequence) {
  hideSequencePrompt();

  if (sequence.length === 0) {
    showingSequence = false;
    inputLocked = false;

    if (currentGame && currentGame.currentTurn === playerId && currentGame.status === "playing") {
      enableButtons();
    }

    updateTurnInfo();
    return;
  }

  showingSequence = true;
  inputLocked = true;
  disableButtons();
  updateTurnInfo();

  for (const color of sequence) {
    const button = getButtonByColor(color);

    if (!button) {
      continue;
    }

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

/*
  Load game
*/
async function loadGame() {
  if (!gameId) {
    setStatus("No game found.");
    turnInfoEl.textContent = "";
    playersEl.textContent = "";
    return;
  }

  const response = await fetch(`/games/${gameId}`);

  if (!response.ok) {
    setStatus("Game not found or server restarted.");
    turnInfoEl.textContent = "";
    playersEl.textContent = "";
    clearInterval(gameLoop);
    return;
  }

  const game = await response.json();

  const previousTurn = currentGame?.currentTurn;
  const previousLength = currentGame?.sequence.length;
  const previousStatus = currentGame?.status;

  currentGame = game;

  const myName = await getUserName(playerId);
  const player1Name = await getUserName(game.player1Id);
  const player2Name = await getUserName(game.player2Id);
  const currentTurnName = await getUserName(game.currentTurn);
  const winnerName = await getUserName(game.winnerId);

  currentUserEl.textContent = `Logged in as: ${myName}`;
  playersEl.textContent = `Players: ${player1Name} vs ${player2Name}`;

  const turnChanged = previousTurn !== game.currentTurn;
  const sequenceChanged = previousLength !== game.sequence.length;
  const statusChanged = previousStatus !== game.status;

  if (turnChanged || sequenceChanged || statusChanged) {
    clearRoundInput();
    inputLocked = false;
  }

  if (game.status === "waiting") {
    setStatus(`Waiting for player 2... (${player1Name} is ready)`);
    disableButtons();
    hideSequencePrompt();
    updateTurnInfo();
    return;
  }

  if (game.status === "finished") {
    setStatus(`Game finished. Winner: ${winnerName}`);
    disableButtons();
    hideSequencePrompt();
    updateTurnInfo();
    return;
  }

  if (game.currentTurn === playerId) {
    setStatus(`🟢 YOUR TURN | Sequence: ${game.sequence.length}`);
  } else {
    setStatus(`🔴 ${currentTurnName}'s turn | Sequence: ${game.sequence.length}`);
    disableButtons();
    hideSequencePrompt();
  }

  const shouldPrepareSequence =
    game.currentTurn === playerId &&
    !showingSequence &&
    (lastShownTurn !== game.currentTurn || lastShownLength !== game.sequence.length);

  if (shouldPrepareSequence) {
    inputLocked = true;
    disableButtons();

    if (game.sequence.length === 0) {
      showSequenceBtn.textContent = "Start round";
    } else {
      showSequenceBtn.textContent = "Vis sekvens";
    }

    showSequencePrompt();
  } else if (game.currentTurn === playerId && !inputLocked && !showingSequence) {
    enableButtons();
  }

  updateTurnInfo();
}

/*
  Send move
*/
async function sendMove() {
  inputLocked = true;
  disableButtons();
  updateTurnInfo();

  const response = await fetch(`/games/${gameId}/move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      playerId,
      input: currentInput
    })
  });

  if (!response.ok) {
    setStatus("Wrong move or wrong player's turn.");
    clearRoundInput();
    inputLocked = false;

    if (currentGame?.currentTurn === playerId && !showingSequence) {
      enableButtons();
    }

    updateTurnInfo();
    return;
  }

  const updatedGame = await response.json();

  currentGame = updatedGame;
  clearRoundInput();
  inputLocked = false;

  loadGame();
}

/*
  Click handling
*/
function handleColorClick(color) {
  if (!currentGame) {
    return;
  }

  if (inputLocked || showingSequence) {
    return;
  }

  if (currentGame.status === "finished") {
    setStatus("Game finished.");
    return;
  }

  if (currentGame.status === "waiting") {
    setStatus("Waiting for player 2...");
    return;
  }

  if (currentGame.currentTurn !== playerId) {
    setStatus("It is not your turn.");
    return;
  }

  const clicksNeeded = currentGame.sequence.length + 1;

  if (currentInput.length >= clicksNeeded) {
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

  setStatus(`Your input: ${currentInput.join(", ")}`);
  updateTurnInfo();

  if (currentInput.length === clicksNeeded) {
    inputLocked = true;
    disableButtons();
    updateTurnInfo();
    sendMove();
  }
}

/*
  Events
*/
showSequenceBtn.addEventListener("click", async () => {
  if (!currentGame) {
    return;
  }

  if (currentGame.currentTurn !== playerId) {
    return;
  }

  lastShownTurn = currentGame.currentTurn;
  lastShownLength = currentGame.sequence.length;

  await showSequence(currentGame.sequence);
});

colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const color = button.dataset.color;
    handleColorClick(color);
  });
});

/*
  Start
*/
loadGame();
const gameLoop = setInterval(loadGame, 1000);