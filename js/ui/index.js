import { displayListings } from "../api/listings.js";
import { API_BASE_URL, options } from "../api/api.js";
import { showLoader, hideLoader } from "./loader.js";

let cachedListings = [];
let currentPage = 1;
let lastPage = 1;
const listingsPerPage = 100;
const pageIndicator = document.getElementById("pageIndicator");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");

/**
 * Searches listings based on user input in the search field
 * @returns {void} Filters listings based on search input and updates the DOM
 */
export async function searchListings() {
    showLoader();
    try {
        const searchInput = document.getElementById("searchInput").value.toLowerCase().trim();

        if (!searchInput) {
            cachedListings = [];
            loadPage(1);
            return;
        }

        const response = await fetch(API_BASE_URL, options());
        if (!response.ok) {
            console.error("Failed to fetch listings for search", response.status, response.statusText);
            throw new Error("Failed to fetch listings");
        }

        const data = await response.json();
        let filtered = data.data || [];

        filtered = filtered.filter(listing =>
            listing.title?.toLowerCase().trim().includes(searchInput) ||
            listing.description?.toLowerCase().trim().includes(searchInput)
        );

        filtered.sort((a, b) => new Date(b.created) - new Date(a.created));

        currentPage = 1;
        lastPage = Math.ceil(filtered.length / listingsPerPage);
        cachedListings = filtered;

        displayListings(cachedListings.slice(0, listingsPerPage));

        pageIndicator.textContent = `Page ${currentPage} of ${lastPage}`;
        prevBtn.disabled = true;
        nextBtn.disabled = lastPage <= 1;

    } catch (error) {
        console.error("Error searching listings:", error);
    } finally {
        hideLoader();
    }
}

window.searchListings = searchListings;

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

/**
 * Loads the listings for a specific page, handles pagination
 * @param {*} page 
 */
async function loadPage(page) {
    showLoader();
    try {
        if (cachedListings.length) {
            currentPage = page;
            lastPage = Math.ceil(cachedListings.length / listingsPerPage);

            const start = (currentPage - 1) * listingsPerPage;
            const end = start + listingsPerPage;

            displayListings(cachedListings.slice(start, end));
        } else {
            const response = await fetch(`${API_BASE_URL}?_bids=true&sort=created&sortOrder=desc&page=${page}&limit=${listingsPerPage}`, options());
            if (!response.ok) {
                console.error("Failed to fetch listings for page", response.status, response.statusText, "Page:", page);
                throw new Error("Failed to fetch listings");
            }

            const data = await response.json();

            if (!data || !data.data) {
                console.error("Unexpected response structure while loading page:", data);
                throw new Error("Invalid response structure");
            }

            displayListings(data.data || []);

            currentPage = data.meta.currentPage;
            lastPage = data.meta.pageCount;
        }

        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage === lastPage;
        if (pageIndicator) pageIndicator.textContent = `Page ${currentPage} of ${lastPage}`;

        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        console.error(error);
    } finally {
        hideLoader();
    }
}

if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            loadPage(currentPage - 1).catch(err => console.error("Failed to load previous page:", err));
        }
    });
    nextBtn.addEventListener("click", () => {
        if (currentPage < lastPage) {
            loadPage(currentPage + 1).catch(err => console.error("Failed to load next page:", err));
        }
    });
}

loadPage(1);