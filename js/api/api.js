export const API_KEY = '9407e53e-8858-42df-97d0-b19e7d052e97';
export const API_BASE_URL = 'https://v2.api.noroff.dev/';
export const JWT_TOKEN = localStorage.getItem('JWT_TOKEN');

function options(accessToken = null) {
  const options = {
    headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiVmljQiIsImVtYWlsIjoidmljYnJvMDI0NThAc3R1ZC5ub3JvZmYubm8iLCJpYXQiOjE3NTU0NzMwODl9.g5m-eMcq0x6cfzoVmPTDvxpySl__N_AljuQYBn9XzIM',
        'X-Noroff-API-Key': '9407e53e-8858-42df-97d0-b19e7d052e97'
    }
    };

  if (accessToken) {
    options.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return options;
}