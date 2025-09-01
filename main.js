import { updateMobileMenu, setupLogout } from "./js/ui/nav.js";
import { isLoggedIn } from "./js/api/auth.js";
import { fetchListings, getListing, sortListings } from "./js/api/listings.js";
import { searchListings } from "./js/ui/index.js";
import { filterDropdown } from "./js/ui/index.js";
import { registerUser } from "./js/ui/register.js";
import { loginUser } from "./js/ui/login.js";

updateMobileMenu(isLoggedIn());

setupLogout();

fetchListings();

sortListings();

filterDropdown(sortListings);

const path = window.location.pathname;

if (path.includes("index.html")) {
    searchListings();
}

if (path.includes("single-listing.html")) {
    getListing();
}

if (path.includes("register.html")) {
    registerUser();
}

if (path.includes("login.html")) {
    loginUser();
}