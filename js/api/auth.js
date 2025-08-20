export function isLoggedIn() {
    return localStorage.getItem("token") !== null;
}

export function getAccessToken() {
    return localStorage.getItem("token");
}