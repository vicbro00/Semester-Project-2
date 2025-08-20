export const API_KEY = '9407e53e-8858-42df-97d0-b19e7d052e97';
export const API_BASE_URL = 'https://v2.api.noroff.dev/auction/listings';

export const JWT_TOKEN = localStorage.getItem('JWT_TOKEN');

export function options(accessToken = JWT_TOKEN) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-Noroff-API-Key': API_KEY,
        }
    };
}