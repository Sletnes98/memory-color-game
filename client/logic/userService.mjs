import { api } from "../data/api.mjs";

export const UserService = {
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

  async updateUser(id, displayName) {
  return api(`/users/${id}`, {
    method: "PUT",
    body: { displayName }
  });
}
};