import { setAuthTokenGetter } from "@workspace/api-client-react";

export function getToken() {
  return sessionStorage.getItem("admin_token");
}

export function setToken(token: string) {
  sessionStorage.setItem("admin_token", token);
}

export function clearToken() {
  sessionStorage.removeItem("admin_token");
}

// Initialize the API client with the token getter
setAuthTokenGetter(() => {
  return getToken();
});
