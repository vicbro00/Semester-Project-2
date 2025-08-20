import { API_BASE_URL, options } from "./api.js";

// Function to fetch listings from API
export async function fetchListings() {
    try {
        const response = await fetch(API_BASE_URL, options());
        if (!response.ok) throw new Error("Failed to fetch listings");

        const data = await response.json();
        displayListings(Array.isArray(data.data) ? data.data : [data.data]);
    } catch (error) {
        console.error(error);
    }
}

// Function to display listings on the page
export async function displayListings(listings) {
    const container = document.getElementById("cardsContainer");
    container.innerHTML = "";

    if (!Array.isArray(listings) || listings.length === 0) {
        container.innerHTML = "<p>No listings found.</p>";
        return;
    }

    listings.forEach(listing => {
        const col = document.createElement("div");
        col.classList.add("col-12", "col-md-6", "col-lg-4", "mb-4");

        const card = document.createElement("div");
        card.classList.add("card", "h-100");

        card.dataset.created = listing.created;

        const imagePlaceholder = "./images/imagePlaceholder.png";

        const imageUrl = isValidUrl(listing.media?.[0]?.url) ? listing.media[0].url : imagePlaceholder;
        const imageAlt = listing.media?.[0]?.alt || "Listing image";

        const description = listing.description || "No description available.";

        const bidCount = listing._count?.bids || 0;

        const highestBid = listing._count?.bids || 0;

        const endDate = listing.endsAt ? new Date(listing.endsAt) : null;

        card.innerHTML = `
            <h2 class="card-title">${listing.title}</h2>
            <p class="card-text">${description}</p>
            <img class="card-image" src="${imageUrl}" alt="${imageAlt}" onerror="this.onerror=null;this.src='${imagePlaceholder}'" />
            <p class="card-text">Bids: ${bidCount}</p>
            <p class="card-text">Highest bid: $${highestBid}</p>
            <p class="card-text">Ends at: ${new Date(listing.endsAt).toLocaleDateString()}</p>
            <button class="btn-primary-custom" onclick="location.href='/listings/bidding.html'">More info</button>
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

// Filters the listings from newest or oldest
export async function sortListings(order) {
    const container = document.getElementById("cardsContainer");

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