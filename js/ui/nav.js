import { API_KEY } from "../api/api.js";

export const mobileMenu = document.querySelector('#mobileMenu .offcanvas-body');

export function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

export function updateMobileMenu() {
    if (!mobileMenu) return;

    if (isLoggedIn()) {
        mobileMenu.innerHTML = `
            <a href="/index.html" class="d-block mb-2 text-white text-decoration-none">Home</a>
            <a href="/profile/profile.html" class="d-block mb-2 text-white text-decoration-none">Profile</a>
            <a href="#" id="logout" class="d-block mb-2 text-white text-decoration-none">Logout</a>
        `;
        setupLogout();
    } else {
        mobileMenu.innerHTML = `
            <a href="/index.html" class="d-block mb-2 text-white text-decoration-none">Home</a>
            <a href="/profile/login.html" class="d-block mb-2 text-white text-decoration-none">Login</a>
            <a href="/profile/register.html" class="d-block mb-2 text-white text-decoration-none">Register</a>
        `;
    }
}

export function setupLogout() {
    const logoutBtn = document.querySelector('#logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            location.reload();
        });
    }
}

export async function accountInfo() {
    const navbarContainer = document.getElementById("accountInfoNavbar");

    if (!navbarContainer) return;

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!token || !username) {
        navbarContainer.innerHTML = "";
        return;
    }

    const profileURL = `https://v2.api.noroff.dev/auction/profiles/${username}`;

    try {
        const response = await fetch(profileURL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-Noroff-API-Key": API_KEY
            }
        });

        if (!response.ok) throw new Error("Failed to fetch profile");

        const { data } = await response.json();

        const avatarUrl = data.avatar?.url || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
        const avatarAlt = data.avatar?.alt || `${username}'s profile picture`;

        const content = `
            <div class="d-flex flex-column align-items-center">
                <a href="/profile/profile.html">
                    <img src="${avatarUrl}" alt="${avatarAlt}" 
                        class="rounded-circle mb-1" 
                        style="width: 40px; height: 40px; object-fit: cover;">
                </a>
                <span class="nav-text">Account Credit: $${data.credits}</span>
            </div>
        `;

        navbarContainer.innerHTML = content;

    } catch (error) {
        console.error("Error fetching account info:", error);
        navbarContainer.innerHTML = "";
    }
}