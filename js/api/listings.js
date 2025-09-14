import { showLoader, hideLoader } from "../ui/loader.js";
import { API_BASE_URL, options } from "./api.js";

let cachedListings = [];

/**
 * Function to fetch listings from API
 * If listings are already cached, returns the cached data.
 * @returns {Array} Array of listings
 */
export async function fetchListingsOnce() {
    if (cachedListings.length) {
        return cachedListings;
    }

    showLoader();
    try {
        const response = await fetch(`${API_BASE_URL}?_bids=true&sort=created&sortOrder=desc`, options());
        if (!response.ok) {
            console.error("fetchListingsOnce: API returned status", response.status);
            throw new Error("Failed to fetch listings");
        }

        const data = await response.json();
        cachedListings = data.data || [];
        displayListings(cachedListings);
        return cachedListings;
    } catch (error) {
        return [];
    } finally {
        hideLoader();
    }
}

/**
 * Function to display listings on the page
 * @param {Array} listings - Array of listing objects to display
 */
export async function displayListings(listings) {
    const container = document.getElementById("cardsContainer");
    if (!container) {
        console.warn("No container found with id 'cardsContainer'");
        return;
    }

    container.innerHTML = "";

    if (!Array.isArray(listings) || listings.length === 0) {
        console.info("No listings to display");
        container.innerHTML = "<p>No listings found.</p>";
        return;
    }

    listings.forEach(listing => {
        const col = document.createElement("div");
        col.classList.add("col-10", "col-md-6", "col-lg-4", "mb-4", "mt-4");

        const card = document.createElement("div");
        card.classList.add("card", "h-100", "d-flex", "flex-column", "align-items-center", "text-center");

        const imagePlaceholder = "/Semester-Project-2/images/imagePlaceholder.png";

        card.innerHTML = `
            <div class="card-carousel">
                <button class="carousel-btn left-btn">&lt;</button>
                <img class="carousel-image" src="${listing.media?.[0]?.url || imagePlaceholder}" 
                    alt="${listing.media?.[0]?.alt || 'Listing image'}" onerror="this.onerror=null;this.src='${imagePlaceholder}'"/>
                <button class="carousel-btn right-btn">&gt;</button>
            </div>
            <h2 class="card-title">${listing.title}</h2>
            <p class="card-text">Ends at: ${new Date(listing.endsAt).toLocaleDateString()}</p>
            <button class="btn-primary-custom" onclick="location.href='/Semester-Project-2/listings/single-listing.html?id=${listing.id}'">More info</button>
        `;

        col.appendChild(card);
        container.appendChild(col);

        const carousel = card.querySelector(".card-carousel");
        const imgElement = carousel.querySelector(".carousel-image");
        const leftBtn = carousel.querySelector(".left-btn");
        const rightBtn = carousel.querySelector(".right-btn");

        let currentIndex = 0;

        leftBtn.addEventListener("click", () => {
            if (!listing.media || listing.media.length === 0) return;
            currentIndex = (currentIndex - 1 + listing.media.length) % listing.media.length;
            imgElement.src = listing.media[currentIndex].url;
            imgElement.alt = listing.media[currentIndex].alt || 'Listing image';
        });

        rightBtn.addEventListener("click", () => {
            if (!listing.media || listing.media.length === 0) return;
            currentIndex = (currentIndex + 1) % listing.media.length;
            imgElement.src = listing.media[currentIndex].url;
            imgElement.alt = listing.media[currentIndex].alt || 'Listing image';
        });
    });
}

/**
 * Get a single id listing
 * Displays detailed info in the single listing container
 */
export async function getListing() {
    const params = new URLSearchParams(window.location.search);
    const listingId = params.get("id");

    if (!listingId) {
        console.error("No listing ID found in URL");
        return;
    }

    const token = localStorage.getItem("token");

    showLoader();
    try {
        const response = await fetch(`${API_BASE_URL}/${listingId}?_bids=true`);
        if (!response.ok) {
            console.error(`Failed to fetch listing with ID ${listingId}, status:`, response.status);
            throw new Error("Failed to fetch listing");
        }
        const { data: listing } = await response.json();

        const container = document.getElementById("singleListingContainer");
        if (!container) return;

        container.innerHTML = "";

        const col = document.createElement("div");
        col.classList.add("col-10", "col-md-6", "col-lg-4", "mb-4", "mt-4");

        const card = document.createElement("div");
        card.classList.add("card", "h-100", "d-flex", "flex-column", "align-items-center", "text-center");
        card.dataset.created = listing.created;

        const imagePlaceholder = window.location.pathname.includes("index.html") || window.location.pathname === "/Semester-Project-2/"
            ? "/Semester-Project-2/images/imagePlaceholder.png"
            : "../images/imagePlaceholder.png";

        const description = listing.description || "No description available.";
        const bidCount = listing._count?.bids || 0;
        const highestBid = bidCount > 0
            ? Math.max(...listing.bids.map(bid => bid.amount))
            : 0;

        const placeBidButton = token
            ? `<button class="btn btn-primary-custom mb-2" onclick="location.href='/Semester-Project-2/listings/bidding.html?id=${listing.id}'">Place Bid</button>`
            : "";

        card.innerHTML = `
            <div class="card-carousel">
                <button class="carousel-btn left-btn">&lt;</button>
                <img class="carousel-image" src="${listing.media?.[0]?.url || imagePlaceholder}" 
                    alt="${listing.media?.[0]?.alt || 'Listing image'}" onerror="this.onerror=null;this.src='${imagePlaceholder}'"/>
                <button class="carousel-btn right-btn">&gt;</button>
            </div>
            <h2 class="card-title">${listing.title}</h2>
            <p class="card-text">Bids: ${bidCount}</p>
            <p class="card-text">Highest bid: $${highestBid}</p>
            <p class="card-text">Ends at: ${new Date(listing.endsAt).toLocaleDateString()}</p>
            <p class="card-text">${description}</p>
            ${placeBidButton}
        `;

        col.appendChild(card);
        container.appendChild(col);

    } catch (error) {
        console.error("Error fetching listing:", error);
    } finally {
        hideLoader();
    }
}

/**
 * Filters the listings from newest or oldest
 * @param {string} order - "newest" or "oldest"
 */
export async function sortListings(order) {
    const container = document.getElementById("cardsContainer");
    if (!container) {
        console.warn("sortListings: No container found");
        return;
    }

    const listings = Array.from(container.children).map(col => {
        const createdDate = new Date(col.querySelector(".card")?.dataset.created || 0);
        return { element: col, createdDate };
    });

    if (!listings.length) console.info("sortListings: No listings to sort");

    listings.sort((a, b) => {
        return order === "newest"
            ? b.createdDate - a.createdDate
            : a.createdDate - b.createdDate;
    });

    container.innerHTML = "";
    listings.forEach(item => container.appendChild(item.element));
}