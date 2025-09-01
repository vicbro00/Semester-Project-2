export const mobileMenu = document.querySelector('#mobileMenu .offcanvas-body');

export function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

export function updateMobileMenu() {
    if (!mobileMenu) return;

    if (isLoggedIn()) {
        mobileMenu.innerHTML = `
            <a href="home.html" class="d-block mb-2 text-white text-decoration-none">Home</a>
            <a href="auctions.html" class="d-block mb-2 text-white text-decoration-none">Auctions</a>
            <a href="/profile/profile.html" class="d-block mb-2 text-white text-decoration-none">Profile</a>
            <a href="#" id="logout" class="d-block mb-2 text-white text-decoration-none">Logout</a>
        `;
        setupLogout();
    } else {
        mobileMenu.innerHTML = `
            <a href="home.html" class="d-block mb-2 text-white text-decoration-none">Home</a>
            <a href="login.html" class="d-block mb-2 text-white text-decoration-none">Login</a>
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