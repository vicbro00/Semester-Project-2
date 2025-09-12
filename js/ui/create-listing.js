import { API_KEY } from "../api/api.js";
import { showLoader, hideLoader } from "./loader.js";

/**
 * Creates a new listing.
 * Handles form submission, validation, and API interaction.
 * @returns {void} updates the DOM with success or error messages
 */
export function createListing() {
    const form = document.getElementById("createListingForm");
    const message = document.getElementById("message");

    if (!form || !message) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            message.innerHTML = `<p class="text-danger">You must be logged in to create a listing.</p>`;
            return;
        }

        const title = document.getElementById("title").value.trim();
        const description = document.getElementById("description").value.trim();
        const imagesInput = document.getElementById("images").value.trim();
        const endsAt = document.getElementById("endDate").value;

        if (!title || !imagesInput || !endsAt) {
            message.innerHTML = `<p class="text-danger">Please fill in all required fields.</p>`;
            return;
        }

        const urls = imagesInput
            .split(/[\n,]+/)
            .map(url => url.trim())
            .filter(url => url.length > 0);

        const media = [];
        for (const url of urls) {
            try {
                new URL(url); // throws if invalid
                media.push({ url, alt: title });
            } catch {
                message.innerHTML = `<p class="text-danger">Invalid image URL: ${url}</p>`;
                return;
            }
        }

        const listingData = {
            title,
            description,
            media,
            endsAt: new Date(endsAt).toISOString()
        };

        try {
            showLoader();
            const response = await fetch("https://v2.api.noroff.dev/auction/listings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "X-Noroff-API-Key": API_KEY
                },
                body: JSON.stringify(listingData)
            });

            if (!response.ok) {
                throw new Error("Failed to create listing. Check your input.");
            }

            const data = await response.json();
            message.innerHTML = `<p class="text-success">Listing "${data.data.title}" created successfully!</p>`;
            form.reset();

        } catch (error) {
            message.innerHTML = `<p class="text-danger">${error.message}</p>`;
        } finally {
            hideLoader();
        }
    });
}