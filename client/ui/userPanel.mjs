import { UserService } from "../logic/userService.mjs";

class UserPanel extends HTMLElement {
  connectedCallback() {
    this.state = {
      lastUserId: localStorage.getItem("lastUserId") || "",
    };

    this.render();
    this.wire();
    this.updateDebug("Klar.");
  }

  render() {
  const template = document.getElementById("user-panel-template");
  const clone = template.content.cloneNode(true);
  this.appendChild(clone);

  // sett default verdi etterpå
  const userIdEl = this.querySelector("#userId");
  userIdEl.value = this.state.lastUserId;
}

  wire() {
    const $ = (sel) => this.querySelector(sel);

    const displayNameEl = $("#displayName");
    const termsEl = $("#terms");
    const privacyEl = $("#privacy");
    const userIdEl = $("#userId");

    $("#createBtn").addEventListener("click", async () => {
      try {
        const displayName = displayNameEl.value.trim();
        const acceptedTerms = termsEl.checked;
        const acceptedPrivacy = privacyEl.checked;

        const result = await UserService.createUser({
          displayName,
          acceptedTerms,
          acceptedPrivacy,
        });

        const user = result.data;
        userIdEl.value = user.id;
        localStorage.setItem("lastUserId", user.id);

        this.updateDebug(user);
      } catch (err) {
        this.updateDebug({ error: err.message });
      }
    });

    $("#getBtn").addEventListener("click", async () => {
      try {
        const id = userIdEl.value.trim();
        const result = await UserService.getUser(id);
        this.updateDebug(result.data);
      } catch (err) {
        this.updateDebug({ error: err.message });
      }
    });

    $("#updateBtn").addEventListener("click", async () => {
      try {
        const id = userIdEl.value.trim();
        const displayName = displayNameEl.value.trim();

        const result = await UserService.updateUser(id, displayName);
        this.updateDebug(result.data);
      } catch (err) {
        this.updateDebug({ error: err.message });
      }
    });

    $("#deleteBtn").addEventListener("click", async () => {
      try {
        const id = userIdEl.value.trim();
        await UserService.deleteUser(id);

        // Rydde opp lokalt etter sletting
        userIdEl.value = "";
        localStorage.removeItem("lastUserId");

        this.updateDebug({ ok: true, deleted: id });
      } catch (err) {
        this.updateDebug({ error: err.message });
      }
    });
  }

  updateDebug(obj) {
    const pre = this.querySelector("#debug");
    pre.textContent =
      typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
  }
}

customElements.define("user-panel", UserPanel);