export const API_KEY = "244fa6c4-339f-48fa-8050-beb609f94e12";
export const API_BASE_URL = "https://v2.api.noroff.dev/auction/listings";

export const JWT_TOKEN = localStorage.getItem("JWT_TOKEN");

export function options(accessToken = JWT_TOKEN) {
    return {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "X-Noroff-API-Key": API_KEY,
        }
    };
}