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
            <a href="register.html" class="d-block mb-2 text-white text-decoration-none">Register</a>
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
    const offcanvasContainer = document.getElementById("accountInfo");

    if (!navbarContainer && !offcanvasContainer) return;

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!token || !username) {
        const message = `<p class="text-danger">Log in to see account info</p>`;
        if (navbarContainer) navbarContainer.innerHTML = message;
        if (offcanvasContainer) offcanvasContainer.innerHTML = message;
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

        const data = await response.json();
        const content = `
            <button class="btn btn-sm btn-warning mb-1">Your bids</button>
            <span class="nav-text">Account Credit: $${data.data.credits}</span>
        `;

        if (navbarContainer) navbarContainer.innerHTML = content;
        if (offcanvasContainer) offcanvasContainer.innerHTML = content;

    } catch (error) {
        console.error("Error fetching account info:", error);
        const errorMessage = `<p class="text-danger">Error loading account info</p>`;
        if (navbarContainer) navbarContainer.innerHTML = errorMessage;
        if (offcanvasContainer) offcanvasContainer.innerHTML = errorMessage;
    }
}