import { defineStore } from "pinia";

import { fetchWrapper } from "@/helpers";
import router from "@/router";

interface IState {
  user: any;
  refreshTokenTimeout: any;
}

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;

export const useAuthStore = defineStore({
  id: "auth",
  state: () =>
    ({
      user: null,
      refreshTokenTimeout: null,
    } as IState),
  actions: {
    async login(username: string, password: string) {
      this.user = await fetchWrapper.post(
        `${baseUrl}/authenticate`,
        { username, password },
        { credentials: "include" }
      );
      this.startRefreshTokenTimer();
    },
    logout() {
      fetchWrapper.post(
        `${baseUrl}/revoke-token`,
        {},
        { credentials: "include" }
      );
      this.stopRefreshTokenTimer();
      this.user = null;
      router.push("/login");
    },
    async refreshToken() {
      this.user = await fetchWrapper.post(
        `${baseUrl}/refresh-token`,
        {},
        { credentials: "include" }
      );
      this.startRefreshTokenTimer();
    },
    startRefreshTokenTimer() {
      // parse json object from base64 encoded jwt token
      const jwtBase64 = this.user.jwtToken.split(".")[1];
      const jwtToken = JSON.parse(atob(jwtBase64));

      // set a timeout to refresh the token a minute before it expires
      const expires = new Date(jwtToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - 60 * 1000;
      this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
    },
    stopRefreshTokenTimer() {
      clearTimeout(this.refreshTokenTimeout);
    },
  },
});
