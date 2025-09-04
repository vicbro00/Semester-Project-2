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
            <a href="auctions.html" class="d-block mb-2 text-white text-decoration-none">Auctions</a>
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
    if (!navbarContainer) return;

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!token || !username) {
        navbarContainer.innerHTML = `<p class="text-danger">Log in to see account info</p>`;
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

        navbarContainer.innerHTML = `
            <button class="btn btn-sm btn-warning mb-1">Your bids</button>
            <span class="nav-text">Account Credit: $${data.data.credits}</span>
        `;
    } catch (error) {
        console.error("Error fetching account info:", error);
        navbarContainer.innerHTML = `<p class="text-danger">Error loading account info</p>`;
    }
}