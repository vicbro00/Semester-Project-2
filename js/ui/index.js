import { displayListings } from "../api/listings.js";
import { API_BASE_URL, options } from "../api/api.js";
import { showLoader, hideLoader } from "./loader.js";

export let currentPage = 1;
export let currentSearchTerm = "";
export let lastPage = 1;
const listingsPerPage = 100;
const pageIndicator = document.getElementById("pageIndicator");
export const prevBtn = document.getElementById("prevPage");
export const nextBtn = document.getElementById("nextPage");
const searchInput = document.getElementById("searchInput");

/**
 * Searches listings based on user input in the search field
 * @returns {void} Filters listings based on search input and updates the DOM
 */
/**
 * Fetch listings from API (with optional search term and page)
 */
export async function fetchListings(page = 1, searchTerm = "") {
    showLoader();
    try {
        let url = `${API_BASE_URL}?_bids=true&sort=created&sortOrder=desc&page=${page}&limit=${listingsPerPage}`;
        if (searchTerm) url += `&q=${encodeURIComponent(searchTerm)}`;

        const response = await fetch(url, options());
        if (!response.ok) throw new Error("Failed to fetch listings");

        const data = await response.json();
        const listings = data.data || [];
        currentPage = data.meta?.currentPage || page;
        lastPage = data.meta?.pageCount || 1;

        displayListings(listings);

        pageIndicator.textContent = `Page ${currentPage} of ${lastPage}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === lastPage;
    } catch (error) {
        console.error(error);
        displayListings([]);
        pageIndicator.textContent = "Page 0 of 0";
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    } finally {
        hideLoader();
    }
}

/**
 * Handles search input
 */
export async function setupSearch() {
    if (!searchInput) return;
    searchInput.addEventListener("input", () => {
        currentSearchTerm = searchInput.value.trim();
        fetchListings(1, currentSearchTerm);
    });
}

/**
 * filterDropdown sets up the filter dropdown functionality
 * @param {*} sortListings 
 * @returns 
 */
export async function filterDropdown(sortListings) {
    const filterBtn = document.getElementById("filterBtn");
    const filterDropdown = document.getElementById("filterDropdown");

    if (!filterBtn || !filterDropdown) {
        console.error("Filter button or dropdown not found");
        return;
    }

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
            try {
                sortListings(sortOrder);
            } catch (error) {
                console.error("Error sorting listings:", error, "Sort order:", sortOrder);
            }
            filterDropdown.classList.add("d-none");
        }
    });
}