import { updateMenus, setupLogout } from "./js/ui/nav.js";
import { getListing, sortListings } from "./js/api/listings.js";
import { filterDropdown } from "./js/ui/index.js";
import { registerUser } from "./js/ui/register.js";
import { loginUser } from "./js/ui/login.js";
import { fetchProfile, createButton, editProfileButton, showListings, showBiddedListings } from "./js/ui/profile.js";
import { updateProfile, populateProfileForm } from "./js/ui/update-profile.js";
import { createListing } from "./js/ui/create-listing.js";
import { fetchSingleListing } from "./js/ui/bidding.js";
import { editListing } from "./js/ui/edit-listing.js";

setupLogout();

updateMenus();

createButton();

const path = window.location.pathname;

if (path.includes("index.html")) {
    setupSearch();
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentPage > 1) fetchListings(currentPage - 1, currentSearchTerm);
        });
        nextBtn.addEventListener("click", () => {
            if (currentPage < lastPage) (currentPage + 1, currentSearchTerm);
        });
    }

    filterDropdown(sortListings);
    sortListings();
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
    populateProfileForm();
}
if (path.endsWith("profile.html")) {
    fetchProfile();
    editProfileButton();
    showListings();
    showBiddedListings();
}
if (path.includes("create.html")) {
    createListing();
}
if (path.includes("bidding.html")) {
    fetchSingleListing();
}
if (path.includes("edit-listing.html")) {
    editListing();
}