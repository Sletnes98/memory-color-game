import { initI18n, translatePage } from "./i18n/i18n.mjs";
import "./ui/userPanel.mjs";

await initI18n();
translatePage();

console.log("App loaded");

/*
  Service worker
*/
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/sw.js");
      console.log("Service worker registered");
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  });
}

/*
  Elements
*/
const loginBtn = document.getElementById("loginBtn");
const loginUserId = document.getElementById("loginUserId");
const loginStatus = document.getElementById("loginStatus");

const lobbySection = document.getElementById("lobbySection");
const currentUserText = document.getElementById("currentUserText");
const createGameBtn = document.getElementById("createGameBtn");
const joinGameBtn = document.getElementById("joinGameBtn");
const goToGameBtn = document.getElementById("goToGameBtn");
const logoutBtn = document.getElementById("logoutBtn");
const joinGameId = document.getElementById("joinGameId");
const lobbyStatus = document.getElementById("lobbyStatus");

/*
  Session helpers
*/
function getUserId() {
  return sessionStorage.getItem("userId");
}

function getGameId() {
  return sessionStorage.getItem("gameId");
}

function saveUserId(userId) {
  sessionStorage.setItem("userId", userId);
}

function saveGameId(gameId) {
  sessionStorage.setItem("gameId", gameId);
}

function clearSession() {
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("gameId");
}

/*
  UI helpers
*/
function showLobby(userId) {
  lobbySection.hidden = false;
  currentUserText.textContent = "Logged in as: " + userId;
  lobbySection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showLoginMessage(message) {
  loginStatus.textContent = message;
}

function showLobbyMessage(message) {
  lobbyStatus.textContent = message;
}

/*
  Startup
*/
const savedUserId = getUserId();

if (savedUserId) {
  showLobby(savedUserId);
}

/*
  Login
*/
loginBtn?.addEventListener("click", async () => {
  const userId = loginUserId.value.trim();

  if (!userId) {
    showLoginMessage("Skriv inn en bruker-ID.");
    return;
  }

  showLoginMessage("Logger inn...");

  try {
    const response = await fetch(`/users/${userId}`);

    if (!response.ok) {
      showLoginMessage("Fant ikke bruker.");
      return;
    }

    const user = await response.json();

    saveUserId(user.id);
    showLoginMessage("Innlogging vellykket.");
    showLobby(user.id);
  } catch (error) {
    showLoginMessage("Kunne ikke logge inn.");
    console.error(error);
  }
});

/*
  Create game
*/
createGameBtn?.addEventListener("click", async () => {
  const userId = getUserId();

  if (!userId) {
    showLobbyMessage("Du må logge inn først.");
    return;
  }

  showLobbyMessage("Lager spill...");

  try {
    const response = await fetch("/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player1Id: userId
      })
    });

    if (!response.ok) {
      showLobbyMessage("Kunne ikke lage spill.");
      return;
    }

    const game = await response.json();

    saveGameId(game.id);
    joinGameId.value = game.id;
    showLobbyMessage("Game created: " + game.id);
  } catch (error) {
    showLobbyMessage("Kunne ikke lage spill.");
    console.error(error);
  }
});

/*
  Join game
*/
joinGameBtn?.addEventListener("click", async () => {
  const userId = getUserId();
  const gameId = joinGameId.value.trim();

  if (!userId) {
    showLobbyMessage("Du må logge inn først.");
    return;
  }

  if (!gameId) {
    showLobbyMessage("Skriv inn game ID.");
    return;
  }

  showLobbyMessage("Blir med i spill...");

  try {
    const response = await fetch(`/games/${gameId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player2Id: userId
      })
    });

    if (!response.ok) {
      showLobbyMessage("Kunne ikke bli med i spillet.");
      return;
    }

    const game = await response.json();

    saveGameId(game.id);
    showLobbyMessage("Joined game: " + game.id);
  } catch (error) {
    showLobbyMessage("Kunne ikke bli med i spillet.");
    console.error(error);
  }
});

/*
  Go to game
*/
goToGameBtn?.addEventListener("click", () => {
  const gameId = getGameId();

  if (!gameId) {
    showLobbyMessage("Lag eller join et spill først.");
    return;
  }

  window.location.href = "/game.html";
});

/*
  Log out
*/
logoutBtn?.addEventListener("click", () => {
  clearSession();
  location.reload();
});