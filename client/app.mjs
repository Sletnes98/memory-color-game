import { initI18n, translatePage } from "./i18n/i18n.mjs";

await initI18n();

// oversett hele siden
translatePage();

import "./ui/userPanel.mjs";