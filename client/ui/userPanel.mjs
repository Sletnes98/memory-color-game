import { t } from "../i18n/i18n.mjs";
import { UserService } from "../logic/userService.mjs";

class UserPanel extends HTMLElement {
  connectedCallback() {
    this.state = {
      lastUserId: localStorage.getItem("lastUserId") || ""
    };

    this.render();
    this.wire();
    this.updateDebug(t("debug.ready"));
  }

  render() {
    this.innerHTML = "";

    const template = document.getElementById("user-panel-template");
    const clone = template.content.cloneNode(true);

    this.appendChild(clone);

    const userIdEl = this.querySelector("#userId");
    userIdEl.value = this.state.lastUserId;
  }

  wire() {
    const get = (selector) => this.querySelector(selector);

    const displayNameEl = get("#displayName");
    const termsEl = get("#terms");
    const privacyEl = get("#privacy");
    const userIdEl = get("#userId");

    get("#createBtn").addEventListener("click", async () => {
      try {
        const displayName = displayNameEl.value.trim();
        const acceptedTerms = termsEl.checked;
        const acceptedPrivacy = privacyEl.checked;

        const result = await UserService.createUser({
          displayName,
          acceptedTerms,
          acceptedPrivacy
        });

        const user = result.data;

        userIdEl.value = user.id;
        localStorage.setItem("lastUserId", user.id);

        this.updateDebug(user);
      } catch (error) {
        this.updateDebug({ error: error.message });
      }
    });

    get("#getBtn").addEventListener("click", async () => {
      try {
        const id = userIdEl.value.trim();
        const result = await UserService.getUser(id);

        this.updateDebug(result.data);
      } catch (error) {
        this.updateDebug({ error: error.message });
      }
    });

    get("#updateBtn").addEventListener("click", async () => {
      try {
        const id = userIdEl.value.trim();
        const displayName = displayNameEl.value.trim();

        const result = await UserService.updateUser(id, displayName);

        this.updateDebug(result.data);
      } catch (error) {
        this.updateDebug({ error: error.message });
      }
    });

    get("#deleteBtn").addEventListener("click", async () => {
      try {
        const id = userIdEl.value.trim();

        await UserService.deleteUser(id);

        userIdEl.value = "";
        localStorage.removeItem("lastUserId");

        this.updateDebug({ ok: true, deleted: id });
      } catch (error) {
        this.updateDebug({ error: error.message });
      }
    });
  }

  updateDebug(value) {
    const debugEl = this.querySelector("#debug");
    debugEl.textContent =
      typeof value === "string" ? value : JSON.stringify(value, null, 2);
  }
}

customElements.define("user-panel", UserPanel);