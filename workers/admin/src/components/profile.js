import html from "./html/profile.html?raw";

const DEFAULT_PROFILE = {
  email: "",
  name: "",
};

export default {
  name: "profile",
  html,
  data: () => ({
    DEFAULT_PROFILE,
    profile: {
      ...DEFAULT_PROFILE,
    },

    async get() {
      await this.fetch("GET");
    },

    async save(profile) {
      let response = await this.fetch("POST", profile);
      // todo check for errors.
    },

    async fetch(method, profile) {
      let response = await (
        await fetch("/api/admin/profile", {
          method: method,
          body: profile ? JSON.stringify(profile) : null,
        })
      ).json();
      this.profile = response.profile;
      return response;
    },
  }),
};
