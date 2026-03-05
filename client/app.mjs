import { initI18n, t } from "./i18n/i18n.mjs";
import "./ui/userPanel.mjs";

await initI18n();

document.title = t("app.title");