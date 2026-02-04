// --------------------
// Data (API-klient)
// --------------------
async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 har ingen body
  if (res.status === 204) return { ok: true, status: 204, data: null };

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // Støtter både: { error: "..." } og { error: { message: "..." } }
    const msg =
      (typeof data?.error === "string" && data.error) ||
      data?.error?.message ||
      data?.message ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return { ok: true, status: res.status, data };
}

// --------------------
// Logic (bruker-handlinger)
// --------------------
const UserService = {
  async createUser({ displayName, acceptedTerms, acceptedPrivacy }) {
    return api("/users", {
      method: "POST",
      body: {
        displayName,
        consent: {
          acceptedTerms,
          acceptedPrivacy,
        },
      },
    });
  },

  async getUser(id) {
    return api(`/users/${id}`);
  },

  async deleteUser(id) {
    return api(`/users/${id}`, { method: "DELETE" });
  },
};

// --------------------
// UI (Web Component)
// --------------------
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
          <button id="deleteBtn">Slett bruker</button>
        </div>

        <label>
          User ID
          <input id="userId" type="text" placeholder="lim inn id her" value="${this.state.lastUserId}" />
          <small>Tips: Opprett bruker først, så lagres ID her automatisk.</small>
        </label>
      </section>

      <pre id="debug" class="debug"></pre>
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
        if (!id) return this.updateDebug({ error: "Lim inn en User ID først." });

        const result = await UserService.getUser(id);
        this.updateDebug(result.data);
      } catch (err) {
        this.updateDebug({ error: err.message });
      }
    });

    $("#deleteBtn").addEventListener("click", async () => {
      try {
        const id = userIdEl.value.trim();
        if (!id) return this.updateDebug({ error: "Lim inn en User ID først." });

        await UserService.deleteUser(id);

        // rydde lokalt
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
    if (!pre) return;

    pre.textContent =
      typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
  }
}

customElements.define("user-panel", UserPanel);