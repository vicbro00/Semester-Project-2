import { showLoader, hideLoader } from "../ui/loader.js";
import { API_BASE_URL, options } from "./api.js";

// Function to fetch listings from API
export async function fetchListings() {
    showLoader();
    try {
        const response = await fetch(`${API_BASE_URL}?_bids=true&sort=created&sortOrder=desc`, options());
        if (!response.ok) throw new Error("Failed to fetch listings");

        const data = await response.json();
        displayListings(Array.isArray(data.data) ? data.data : [data.data]);
    } catch (error) {
        console.error(error);
    } finally {
        hideLoader();
    }
}

// Function to display listings on the page
export async function displayListings(listings) {
    const container = document.getElementById("cardsContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(listings) || listings.length === 0) {
        container.innerHTML = "<p>No listings found.</p>";
        return;
    }

    listings.forEach(listing => {
        const col = document.createElement("div");
        col.classList.add("col-10", "col-md-6", "col-lg-4", "mb-4", "mt-4");

        const card = document.createElement("div");
        card.classList.add("card", "h-100", "d-flex", "flex-column", "align-items-center", "text-center");
        card.dataset.created = listing.created;

        card.dataset.created = listing.created;

        const imagePlaceholder = "./images/imagePlaceholder.png";

        const imageUrl = isValidUrl(listing.media?.[0]?.url) ? listing.media[0].url : imagePlaceholder;
        const imageAlt = listing.media?.[0]?.alt || "Listing image";

        const bidCount = listing.bids?.length || 0;

        const highestBid = bidCount > 0
            ? Math.max(...listing.bids.map(bid => bid.amount))
            : 0;

        card.innerHTML = `
            <img class="card-image" src="${imageUrl}" alt="${imageAlt}" onerror="this.onerror=null;this.src='${imagePlaceholder}'"/>
            <h2 class="card-title">${listing.title}</h2>
            <p class="card-text">Ends at: ${new Date(listing.endsAt).toLocaleDateString()}</p>
            <button id="makeBidBtn" class="btn-primary-custom" onclick="location.href='/listings/single-listing.html?id=${listing.id}'">More info</button>
        `;
        col.appendChild(card);
        container.appendChild(col);
    });

    // Function to validate the image URLs
    function isValidUrl(url) {
        if (!url) return false;
        try {
            new URL(url);
            if (url.includes("uhdwallpapers.org") || url.includes("i.imgur.com")) return false;
            return true;
        } catch {
            return false;
        }
    }
}

// Get a single id listing
export async function getListing() {
    const params = new URLSearchParams(window.location.search);
    const listingId = params.get("id");

    if (!listingId) {
        console.error("No listing ID found in URL");
        return;
    }

    showLoader();
    try {
        const response = await fetch(`${API_BASE_URL}/${listingId}?_bids=true`);
        if (!response.ok) throw new Error("Failed to fetch listing");
        const { data: listing } = await response.json();

        const container = document.getElementById("singleListingContainer");
        if (!container) return;

        container.innerHTML = "";

        const col = document.createElement("div");
        col.classList.add("col-10", "col-md-6", "col-lg-4", "mb-4", "mt-4");

        const card = document.createElement("div");
        card.classList.add("card", "h-100", "d-flex", "flex-column", "align-items-center", "text-center");
        card.dataset.created = listing.created;

        const imagePlaceholder = "../images/imagePlaceholder.png";
        const imageUrl = listing.media?.[0]?.url || imagePlaceholder;
        const imageAlt = listing.media?.[0]?.alt || "Listing image";

        const description = listing.description || "No description available.";
        const bidCount = listing._count?.bids || 0;
        const highestBid = bidCount > 0
            ? Math.max(...listing.bids.map(bid => bid.amount))
            : 0;

        card.innerHTML = `
            <img class="card-image" src="${imageUrl}" alt="${imageAlt}" onerror="this.onerror=null;this.src='${imagePlaceholder}'"/>
            <h2 class="card-title">${listing.title}</h2>
            <p class="card-text">Bids: ${bidCount}</p>
            <p class="card-text">Highest bid: $${highestBid}</p>
            <p class="card-text">Ends at: ${new Date(listing.endsAt).toLocaleDateString()}</p>
            <p class="card-text">${description}</p>
            <button class="btn btn-primary-custom mb-2" onclick="location.href='/listings/bidding.html?id=${listing.id}'">Place Bid</button>
        `;

        col.appendChild(card);
        container.appendChild(col);

    } catch (error) {
        console.error("Error fetching listing:", error);
    } finally {
        hideLoader();
    }
}

// Filters the listings from newest or oldest
export async function sortListings(order) {
    const container = document.getElementById("cardsContainer");
    if (!container) return;

    const listings = Array.from(container.children).map(col => {
        const createdDate = new Date(col.querySelector(".card")?.dataset.created || 0);
        return { element: col, createdDate };
    });

    listings.sort((a, b) => {
        return order === "newest"
            ? b.createdDate - a.createdDate
            : a.createdDate - b.createdDate;
    });

    container.innerHTML = "";
    listings.forEach(item => container.appendChild(item.element));
}