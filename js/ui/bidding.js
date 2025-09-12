import { API_KEY, API_BASE_URL } from "../api/api.js";
import { showLoader, hideLoader } from "./loader.js";

/**
 * Fetches a single listing and displays it with the listing id
 * @returns {void} updates the DOM with listing details
 */
export async function fetchSingleListing() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const listingContainer = document.getElementById("listingContainer");
    const bidForm = document.getElementById("bidForm");
    const bidMessage = document.getElementById("bidMessage");

    if (!listingContainer) return;

    showLoader();
    try {
        const params = new URLSearchParams(window.location.search);
        const listingId = params.get("id");
        if (!listingId) throw new Error("No listing ID found in URL");

        const response = await fetch(`${API_BASE_URL}/${listingId}?_bids=true`, {
            headers: {
                "Content-Type": "application/json",
                "X-Noroff-API-Key": API_KEY,
                ...(token && { "Authorization": `Bearer ${token}` })
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch listing with ID ${listingId} (status: ${response.status})`);
        }

        const { data: listing } = await response.json();
        if (!listing) throw new Error(`No data returned for listing with ID ${listingId}`);

        const isOwner = listing.seller?.username === username;

        listingContainer.innerHTML = "";

        const col = document.createElement("div");
        col.classList.add("col-10", "col-md-6", "col-lg-4", "mb-4", "mt-4");

        const card = document.createElement("div");
        card.classList.add("card", "h-100", "d-flex", "flex-column", "align-items-center", "text-center");
        card.dataset.created = listing.created;

        const imagePlaceholder = "../images/imagePlaceholder.png";

        const description = listing.description || "No description available.";
        const bidCount = listing._count?.bids || 0;
        const highestBid = bidCount > 0
            ? Math.max(...listing.bids.map(bid => bid.amount))
            : 0;

        card.innerHTML = `
            <div class="card-images">
                ${listing.media?.map(img => `
                    <img class="card-image-thumb" src="${img.url}" alt="${img.alt || 'Listing image'}"
                        onerror="this.onerror=null;this.src='${imagePlaceholder}'"/>
                `).join("") || `<img class="card-image-thumb" src="${imagePlaceholder}" alt="Placeholder"/>`}
            </div>
            <h2 class="card-title">${listing.title}</h2>
            <p class="card-text">Bids: ${bidCount}</p>
            <p class="card-text">Highest bid: $${highestBid}</p>
            <p class="card-text">Ends at: ${new Date(listing.endsAt).toLocaleDateString()}</p>
            <p class="card-text">${description}</p>
        `;

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
        listingContainer.appendChild(col);

        if (bidForm) {
            if (!token) {
                bidForm.style.display = "none";
            } else if (isOwner) {
                bidForm.style.display = "none";
                bidMessage.textContent = "You cannot bid on your own listing.";
            } else {
                bidForm.style.display = "block";
                bidForm.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    bidMessage.textContent = "";

                    const bidAmount = parseFloat(document.getElementById("bidAmount").value);
                    if (bidAmount <= highestBid) {
                        bidMessage.textContent = `Your bid must be higher than the current highest bid of $${highestBid}.`;
                        return;
                    }

                    showLoader();
                    try {
                        const bidResponse = await fetch(`${API_BASE_URL}/${listingId}/bids`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                                "X-Noroff-API-Key": API_KEY
                            },
                            body: JSON.stringify({ amount: bidAmount })
                        });

                        if (!bidResponse.ok) {
                            const errorData = await bidResponse.json();
                            throw new Error(errorData.errors?.[0].message || "Failed to place bid");
                        }

                        bidMessage.textContent = "Bid placed successfully!";
                        bidForm.reset();
                        fetchSingleListing();
                    } catch (err) {
                        bidMessage.textContent = `Error: ${err.message}`;
                    } finally {
                        hideLoader();
                    }
                });
            }
        }

    } catch (error) {
        listingContainer.innerHTML = `<p class="text-danger">${error.message}</p>`;
    } finally {
        hideLoader();
    }
}

/**
 * Shows the bidding history for a single listing when button is clicked
 * @param {*} listingId The ID of the listing
 * @param {*} container The container to render the history into
 * @returns {void} updates the DOM with bidding history
 */
async function biddingHistory(listingId, container) {
    const token = localStorage.getItem("token");

    showLoader();
    try {
        const response = await fetch(`${API_BASE_URL}/${listingId}?_bids=true`, {
            headers: {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` }),
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch bidding history for listing ID ${listingId} (status: ${response.status})`);
        }

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
    } finally {
        hideLoader();
    }
}