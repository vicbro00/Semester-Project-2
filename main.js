import { updateMobileMenu, setupLogout } from "./js/ui/nav.js";
import { fetchListings, getListing, sortListings } from "./js/api/listings.js";
import { searchListings } from "./js/ui/index.js";
import { filterDropdown } from "./js/ui/index.js";
import { registerUser } from "./js/ui/register.js";
import { loginUser } from "./js/ui/login.js";
import { fetchProfile, createButton, editProfileButton, showListings } from "./js/ui/profile.js";
import { updateProfile } from "./js/ui/update-profile.js";

updateMobileMenu();

setupLogout();

fetchListings();
sortListings();
filterDropdown(sortListings);

createButton();

const path = window.location.pathname;

if (path.includes("index.html")) {
    searchListings();
    fetchListings();
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
if (path.includes("update-profile.html")) {
    updateProfile();
}

if (path.endsWith("/profile.html")) {
    fetchProfile();
    editProfileButton();
    showListings();
}