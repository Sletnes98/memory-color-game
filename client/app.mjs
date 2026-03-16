console.log("APP FILE LOADED 2");
import { initI18n, translatePage } from "./i18n/i18n.mjs";
import "./ui/userPanel.mjs";

await initI18n();
translatePage();

/*
SERVICE WORKER
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
ELEMENTS
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
STARTUP
*/
const savedUserId = localStorage.getItem("userId");

if (savedUserId) {
  showLobby(savedUserId);
}

/*
LOGIN
*/
loginBtn?.addEventListener("click", async () => {
  const userId = loginUserId.value.trim();

  if (!userId) {
    loginStatus.textContent = "Skriv inn en bruker-ID.";
    return;
  }

  loginStatus.textContent = "Logger inn...";

  try {
    const res = await fetch(`/users/${userId}`);

    if (!res.ok) {
      loginStatus.textContent = "Fant ikke bruker.";
      return;
    }

    const user = await res.json();

    localStorage.setItem("userId", user.id);

    loginStatus.textContent = "Innlogging vellykket.";
    showLobby(user.id);
  } catch (error) {
    loginStatus.textContent = "Kunne ikke logge inn.";
    console.error(error);
  }
});

/*
SHOW LOBBY
*/
function showLobby(userId) {
  lobbySection.hidden = false;
  currentUserText.textContent = "Logged in as: " + userId;
  lobbySection.scrollIntoView({ behavior: "smooth", block: "start" });
}

/*
CREATE GAME
*/
createGameBtn?.addEventListener("click", async () => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    lobbyStatus.textContent = "Du må logge inn først.";
    return;
  }

  lobbyStatus.textContent = "Lager spill...";

  try {
    const res = await fetch("/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player1Id: userId
      })
    });

    if (!res.ok) {
      lobbyStatus.textContent = "Kunne ikke lage spill.";
      return;
    }

    const game = await res.json();

    localStorage.setItem("gameId", game.id);

    lobbyStatus.textContent = "Game created: " + game.id;
    joinGameId.value = game.id;
  } catch (error) {
    lobbyStatus.textContent = "Kunne ikke lage spill.";
    console.error(error);
  }
});

/*
JOIN GAME
*/
joinGameBtn?.addEventListener("click", async () => {
  const gameId = joinGameId.value.trim();
  const userId = localStorage.getItem("userId");

  if (!userId) {
    lobbyStatus.textContent = "Du må logge inn først.";
    return;
  }

  if (!gameId) {
    lobbyStatus.textContent = "Skriv inn game ID.";
    return;
  }

  lobbyStatus.textContent = "Blir med i spill...";

  try {
    const res = await fetch(`/games/${gameId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player2Id: userId
      })
    });

    if (!res.ok) {
      lobbyStatus.textContent = "Kunne ikke bli med i spillet.";
      return;
    }

    const game = await res.json();

    localStorage.setItem("gameId", game.id);

    lobbyStatus.textContent = "Joined game: " + game.id;
  } catch (error) {
    lobbyStatus.textContent = "Kunne ikke bli med i spillet.";
    console.error(error);
  }
});

/*
GO TO GAME
*/
goToGameBtn?.addEventListener("click", () => {
  const gameId = localStorage.getItem("gameId");

  if (!gameId) {
    lobbyStatus.textContent = "Lag eller join et spill først.";
    return;
  }

  window.location.href = "/game.html";
});

/*
LOG OUT
*/
logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("gameId");
  location.reload();
});