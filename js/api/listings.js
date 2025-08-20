import { API_BASE_URL, options } from "./api.js";

export async function fetchListings() {
    try {
        const response = await fetch(API_BASE_URL, options());
        if (!response.ok) throw new Error("Failed to fetch listings");

        const data = await response.json();
        displayListings(data.data);

    } catch (error) {
        console.error(error);
    }
}

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

        const imageUrl = listing.media?.[0]?.url || "";
        const imageAlt = listing.media?.[0]?.alt || "Listing image";

        const sellerName = listing.seller?.name || "Unknown Seller";

        const bidCount = listing._count?.bids || 0;

        const highestBid = listing._count?.bids || 0;

        const endDate = listing.endsAt ? new Date(listing.endsAt) : null;

        card.innerHTML = `
            <h2 class="card-title">${listing.title}</h2>
            <p class="card-text">${listing.description}</p>
            <img class="card-image" src="${imageUrl}" alt="${imageAlt}" />
            <p class="card-text">Seller: ${sellerName}</p>
            <p class="card-text">Bids: ${bidCount}</p>
            <p class="card-text">Highest bid: $${highestBid}</p>
            <p class="card-text">Ends at: ${endDate ? endDate.toLocaleString() : "Unknown"}</p>
            <button class="btn-primary-custom" onclick="location.href='/listings/bidding.html'">More info</button>
        `;
        col.appendChild(card);
        container.appendChild(col);
    });
}