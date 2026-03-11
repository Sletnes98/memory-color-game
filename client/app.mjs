import { initI18n, translatePage } from "./i18n/i18n.mjs";

await initI18n();

// oversett hele siden
translatePage();

import "./ui/userPanel.mjs";

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