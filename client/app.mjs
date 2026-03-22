import { initI18n, translatePage, t } from "./i18n/i18n.mjs";
import "./ui/userPanel.mjs";

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

function setLoginStatus(message) {
  loginStatus.textContent = message;
}

function setLobbyStatus(message) {
  lobbyStatus.textContent = message;
}

function showLobby(userId) {
  lobbySection.hidden = false;
  currentUserText.textContent = `${t("lobby.loggedInAs")} ${userId}`;
  lobbySection.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.error(error);
  }
}

async function handleLogin() {
  const userId = loginUserId.value.trim();

  if (!userId) {
    setLoginStatus(t("login.enterUserId"));
    return;
  }

  setLoginStatus(t("login.loggingIn"));

  try {
    const response = await fetch(`/users/${userId}`);

    if (!response.ok) {
      setLoginStatus(t("login.userNotFound"));
      return;
    }

    const user = await response.json();

    saveUserId(user.id);
    setLoginStatus(t("login.success"));
    showLobby(user.id);
  } catch (error) {
    setLoginStatus(t("login.failed"));
    console.error(error);
  }
}

async function handleCreateGame() {
  const userId = getUserId();

  if (!userId) {
    setLobbyStatus(t("lobby.loginFirst"));
    return;
  }

  setLobbyStatus(t("lobby.creatingGame"));

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
      setLobbyStatus(t("lobby.createGameFailed"));
      return;
    }

    const game = await response.json();

    saveGameId(game.id);
    joinGameId.value = game.id;
    setLobbyStatus(`${t("lobby.gameCreated")} ${game.id}`);
  } catch (error) {
    setLobbyStatus(t("lobby.createGameFailed"));
    console.error(error);
  }
}

async function handleJoinGame() {
  const userId = getUserId();
  const gameId = joinGameId.value.trim();

  if (!userId) {
    setLobbyStatus(t("lobby.loginFirst"));
    return;
  }

  if (!gameId) {
    setLobbyStatus(t("lobby.enterGameId"));
    return;
  }

  setLobbyStatus(t("lobby.joiningGame"));

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
      setLobbyStatus(t("lobby.joinGameFailed"));
      return;
    }

    const game = await response.json();

    saveGameId(game.id);
    setLobbyStatus(`${t("lobby.joinedGame")} ${game.id}`);
  } catch (error) {
    setLobbyStatus(t("lobby.joinGameFailed"));
    console.error(error);
  }
}

function handleGoToGame() {
  const gameId = getGameId();

  if (!gameId) {
    setLobbyStatus(t("lobby.createOrJoinFirst"));
    return;
  }

  window.location.href = "/game.html";
}

function handleLogout() {
  clearSession();
  location.reload();
}

await initI18n();
translatePage();
await registerServiceWorker();

const savedUserId = getUserId();

if (savedUserId) {
  showLobby(savedUserId);
}

loginBtn?.addEventListener("click", handleLogin);
createGameBtn?.addEventListener("click", handleCreateGame);
joinGameBtn?.addEventListener("click", handleJoinGame);
goToGameBtn?.addEventListener("click", handleGoToGame);
logoutBtn?.addEventListener("click", handleLogout);