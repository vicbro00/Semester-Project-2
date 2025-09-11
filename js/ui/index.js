import { displayListings } from "../api/listings.js";
import { API_BASE_URL, options } from "../api/api.js";
import { showLoader, hideLoader } from "./loader.js";

export async function searchListings() {
    showLoader();
    try {
        const response = await fetch(API_BASE_URL, options());
        if (!response.ok) throw new Error("Failed to fetch listings");

        const data = await response.json();
        const allListings = data.data || [];

        const searchInput = document.getElementById("searchInput").value.toLowerCase();

        const filtered = allListings.filter(listing =>
            listing.title?.toLowerCase().includes(searchInput) ||
            listing.description?.toLowerCase().includes(searchInput)
        );

        displayListings(filtered);
    } catch (error) {
        console.error("Error searching listings:", error);
    } finally {
        hideLoader();
    }
}

window.searchListings = searchListings;

// Function to show the dropdown filter list
export function filterDropdown(sortListings) {
    const filterBtn = document.getElementById("filterBtn");
    const filterDropdown = document.getElementById("filterDropdown");

    if (!filterBtn || !filterDropdown) return;

    filterBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        filterDropdown.classList.toggle("d-none");
    });

    document.addEventListener("click", (e) => {
        if (!filterBtn.contains(e.target) && !filterDropdown.contains(e.target)) {
            filterDropdown.classList.add("d-none");
        }
    });

    filterDropdown.addEventListener("click", (e) => {
        const item = e.target.closest(".list-group-item");
        if (item) {
            const sortOrder = item.dataset.sort;
            sortListings(sortOrder);
            filterDropdown.classList.add("d-none");
        }
    });
}