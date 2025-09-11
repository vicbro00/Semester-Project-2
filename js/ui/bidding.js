import { API_KEY } from "../api/api.js";
import { showLoader, hideLoader } from "./loader.js";

let currentListing = null;

const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

export async function fetchSingleListing() {
    const listingContainer = document.getElementById("listingContainer");
    const bidForm = document.getElementById("bidForm");
    const bidMessage = document.getElementById("bidMessage");

    if (!listingContainer || !bidForm || !bidMessage) return;

    async function fetchListing() {
        showLoader();
        try {
            const response = await fetch(`https://v2.api.noroff.dev/auction/listings/${listingId}?_bids=true`, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Noroff-API-Key": API_KEY,
                }
            });
            if (!response.ok) throw new Error("Failed to fetch listing");

            const { data } = await response.json();
            currentListing = data;

            const imageUrl = data.media?.[0]?.url || "../images/imagePlaceholder.png";
            const imageAlt = data.media?.[0]?.alt || "Listing image";
        
            const highestBid = data.bids && data.bids.length > 0 
                ? Math.max(...data.bids.map(bid => bid.amount)) 
                : 0;

            listingContainer.innerHTML = `
                <h2>${data.title}</h2>
                <p>${data.description || "No description"}</p>
                <img src="${imageUrl}" alt="${imageAlt}" class="img-fluid mb-3">
                <p>Current highest bid: $${highestBid}</p>
                <p>Ends at: ${new Date(data.endsAt).toLocaleString()}</p>
            `;
        } catch (error) {
            listingContainer.innerHTML = `<p class="text-danger">${error.message}</p>`;
        } finally {
            hideLoader();
        }
    }

    bidForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!currentListing) return;

        if (new Date(currentListing.endsAt) < new Date()) {
            bidMessage.innerHTML = `<p class="text-danger">This listing has ended. You cannot place a bid.</p>`;
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            bidMessage.innerHTML = `<p class="text-danger">You must be logged in to place a bid.</p>`;
            return;
        }

        const bidAmount = parseFloat(document.getElementById("bidAmount").value);
        if (isNaN(bidAmount) || bidAmount <= 0) {
            bidMessage.innerHTML = `<p class="text-danger">Enter a valid bid amount.</p>`;
            return;
        }

        const highestBid = currentListing.bids && currentListing.bids.length > 0 
            ? Math.max(...currentListing.bids.map(bid => bid.amount)) 
            : 0;
            
        if (bidAmount <= highestBid) {
            bidMessage.innerHTML = `<p class="text-danger">Your bid must be higher than the current highest bid ($${highestBid}).</p>`;
            return;
        }

        showLoader();
        try {
            const response = await fetch(`https://v2.api.noroff.dev/auction/listings/${listingId}/bids`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "X-Noroff-API-Key": API_KEY
                },
                body: JSON.stringify({ amount: bidAmount })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to place bid");
            }

            bidMessage.innerHTML = `<p class="text-success">Bid of $${bidAmount} placed successfully!</p>`;
            bidForm.reset();
            fetchListing();
        } catch (error) {
            bidMessage.innerHTML = `<p class="text-danger">${error.message}</p>`;
        } finally {
            hideLoader();
        }
    });

    fetchListing();
}