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
    this.innerHTML = `
      <section class="card">
        <h2>Bruker</h2>

        <label>
          Visningsnavn
          <input id="displayName" type="text" placeholder="f.eks. Testbruker" />
        </label>

        <label>
          <input id="terms" type="checkbox" />
          Jeg godtar vilkårene (ToS)
        </label>

        <label>
          <input id="privacy" type="checkbox" />
          Jeg godtar personvern (Privacy Policy)
        </label>

        <div class="row">
          <button id="createBtn">Opprett bruker</button>
          <button id="getBtn">Hent bruker</button>
          <button id="updateBtn">Oppdater bruker</button>
          <button id="deleteBtn">Slett bruker</button>
        </div>

        <label>
          User ID
          <input id="userId" type="text" placeholder="lim inn id her" value="${this.state.lastUserId}" />
          <small>Opprett bruker for å få ID.</small>
        </label>
      </section>
    `;
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
    const pre = document.querySelector("#debug");
    pre.textContent =
      typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
  }
}

customElements.define("user-panel", UserPanel);