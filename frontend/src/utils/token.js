const TOKEN_KEY = "token";

export function saveToken(accessToken) {
  localStorage.setItem(TOKEN_KEY, accessToken);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
