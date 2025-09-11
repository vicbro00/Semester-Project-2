import { API_KEY } from "../api/api.js";
import { showLoader, hideLoader } from "./loader.js";

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
        const image = document.getElementById("image").value.trim();
        const endsAt = document.getElementById("endDate").value;

        if (!title || !image || !endsAt) {
            message.innerHTML = `<p class="text-danger">Please fill in all required fields.</p>`;
            return;
        }

        const listingData = {
            title,
            description,
            media: [{ url: image, alt: title }],
            endsAt: new Date(endsAt).toISOString()
        };

        showLoader();
        try {
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