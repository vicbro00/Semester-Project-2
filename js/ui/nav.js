import { API_KEY } from "../api/api.js";

export const mobileMenu = document.querySelector('#mobileMenu .offcanvas-body');

export function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

/**
 * Updates navigation menus based on user authentication status
 * @returns {Promise<void>} updates the DOM with appropriate menu items and user info
 */
export async function updateMenus() {
    const mobileMenuContainer = document.querySelector('#mobileMenu .offcanvas-body');
    const desktopMenuContainer = document.getElementById('desktopMenu');
    const accountInfoDesktop = document.getElementById('accountInfoDesktop');
    const accountInfoMobile = document.getElementById('accountInfoNavbar');

    const loggedIn = isLoggedIn();
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    const linksLoggedIn = [
        { href: "/Semester-Project-2/index.html", text: "Home" },
        { href: "/Semester-Project-2/profile/profile.html", text: "Profile" },
        { href: "#", id: "logout", text: "Logout" }
    ];

    const linksLoggedOut = [
        { href: "/Semester-Project-2/index.html", text: "Home" },
        { href: "/Semester-Project-2/profile/login.html", text: "Login" },
        { href: "/Semester-Project-2/profile/register.html", text: "Register" }
    ];

    const menuLinks = loggedIn ? linksLoggedIn : linksLoggedOut;

    if (mobileMenuContainer) {
        mobileMenuContainer.innerHTML = menuLinks.map(link => {
            return `<a href="${link.href}" class="d-block mb-2 text-white text-decoration-none"${link.id ? ` id="${link.id}"` : ""}>${link.text}</a>`;
        }).join('');
        if (loggedIn) setupLogout('logout');
    }

    if (desktopMenuContainer) {
        desktopMenuContainer.innerHTML = menuLinks.map(link => {
            return `<a href="${link.href}" class="nav-link"${link.id ? ` id="${link.id}-desktop"` : ""}>${link.text}</a>`;
        }).join('');
        if (loggedIn) setupLogout('logout-desktop');
    }

    if (loggedIn && token && username) {
        fetch(`https://v2.api.noroff.dev/auction/profiles/${username}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-Noroff-API-Key": API_KEY
            }
        })
        .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch profile"))
        .then(({ data }) => {
            const content = `
                <a href="/Semester-Project-2/profile/profile.html">
                    <img src="${data.avatar?.url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}" 
                        alt="${data.avatar?.alt || username}" 
                        class="rounded-circle" 
                        style="width: 40px; height: 40px; object-fit: cover;">
                </a>
                <span>Account Credit: $${data.credits}</span>
            `;
            if (accountInfoDesktop) accountInfoDesktop.innerHTML = content;
            if (accountInfoMobile) accountInfoMobile.innerHTML = content;
        })
        .catch(() => {
            if (accountInfoDesktop) accountInfoDesktop.innerHTML = "";
            if (accountInfoMobile) accountInfoMobile.innerHTML = "";
        });
    } else {
        if (accountInfoDesktop) accountInfoDesktop.innerHTML = "";
        if (accountInfoMobile) accountInfoMobile.innerHTML = "";
    }
}

/**
 * Sets up the logout functionality for a given button ID
 * @param {string} id - The ID of the logout button
 */
export function setupLogout(id = 'logout') {
    const logoutBtn = document.getElementById(id) || document.getElementById(`${id}-desktop`);
    if (logoutBtn) {
        logoutBtn.addEventListener('click', e => {
            e.preventDefault();
            localStorage.removeItem('token');
            location.reload();
        });
    }
}