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
    if (!container) return;

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

        card.innerHTML = `
            <h2 class="card-title">${listing.title}</h2>
            <p class="card-text">${description}</p>
            <img class="card-image" src="${imageUrl}" alt="${imageAlt}" onerror="this.onerror=null;this.src='${imagePlaceholder}'" />
            <p class="card-text">Bids: ${bidCount}</p>
            <p class="card-text">Highest bid: $${highestBid}</p>
            <p class="card-text">Ends at: ${new Date(listing.endsAt).toLocaleDateString()}</p>
            <button class="btn-primary-custom" onclick="location.href='/listings/single-listing.html?id=${listing.id}'">More info</button>
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

    try {
        const response = await fetch(`${API_BASE_URL}/${listingId}`);
        if (!response.ok) throw new Error("Failed to fetch listing");
        const { data: listing } = await response.json();

        const container = document.getElementById("singleListingContainer");
        if (!container) return;

        container.innerHTML = "";

        const col = document.createElement("div");
        col.classList.add("col-12", "col-md-6", "col-lg-4", "mb-4");

        const card = document.createElement("div");
        card.classList.add("card", "h-100");
        card.dataset.created = listing.created;

        const imagePlaceholder = "../images/imagePlaceholder.png";
        const imageUrl = listing.media?.[0]?.url || imagePlaceholder;
        const imageAlt = listing.media?.[0]?.alt || "Listing image";

        const description = listing.description || "No description available.";
        const bidCount = listing._count?.bids || 0;
        const highestBid = listing._count?.bids || 0;

        card.innerHTML = `
            <h2 class="card-title">${listing.title}</h2>
            <p class="card-text">${description}</p>
            <img class="card-image" src="${imageUrl}" alt="${imageAlt}" onerror="this.onerror=null;this.src='${imagePlaceholder}'" />
            <p class="card-text">Bids: ${bidCount}</p>
            <p class="card-text">Highest bid: $${highestBid}</p>
            <p class="card-text">Ends at: ${new Date(listing.endsAt).toLocaleDateString()}</p>
            <button class="btn btn-primary-custom mb-2" onclick="location.href='/listings/bidding.html?id=${listing.id}'">Place Bid</button>
        `;

        // --- Add "Show Bidding History" button ---
        const historyBtn = document.createElement("button");
        historyBtn.textContent = "Show Bidding History";
        historyBtn.className = "btn btn-secondary-custom";

        let historyVisible = false;
        let historyContainer;

        historyBtn.addEventListener("click", async () => {
            historyVisible = !historyVisible;

            if (historyVisible) {
                historyBtn.textContent = "Hide Bidding History";

                if (!historyContainer) {
                    historyContainer = document.createElement("div");
                    historyContainer.classList.add("mt-3");
                    card.appendChild(historyContainer);

                    await biddingHistory(listing.id, historyContainer);
                } else {
                    historyContainer.style.display = "block";
                }
            } else {
                historyBtn.textContent = "Show Bidding History";
                if (historyContainer) historyContainer.style.display = "none";
            }
        });

        card.appendChild(historyBtn);

        col.appendChild(card);
        container.appendChild(col);

    } catch (error) {
        console.error("Error fetching listing:", error);
    }
}

async function biddingHistory(listingId, container) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_BASE_URL}/${listingId}?_bids=true`, {
            headers: {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` }),
            },
        });

        if (!response.ok) throw new Error("Failed to fetch bidding history");

        const { data: listing } = await response.json();
        const bids = listing.bids || [];

        if (bids.length === 0) {
            container.innerHTML = "<p>No bids have been placed on this listing yet.</p>";
            return;
        }

        const list = document.createElement("ul");
        list.classList.add("list-group");

        bids
            .sort((a, b) => new Date(b.created) - new Date(a.created))
            .forEach(bid => {
                const item = document.createElement("li");
                item.classList.add("list-group-item");
                item.textContent = `User: ${bid.bidder?.name || "Unknown"} — $${bid.amount} (${new Date(bid.created).toLocaleString()})`;
                list.appendChild(item);
            });

        container.innerHTML = "<h4>Bidding History</h4>";
        container.appendChild(list);

    } catch (error) {
        console.error("Error fetching bidding history:", error);
        container.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
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