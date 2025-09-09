import { API_KEY } from "../api/api.js";

export async function editListing() {
    const form = document.getElementById("editListingForm");
    const titleInput = document.getElementById("title");
    const descriptionInput = document.getElementById("description");
    const tagsInput = document.getElementById("tags");
    const endsAtInput = document.getElementById("endsAt");

    const params = new URLSearchParams(window.location.search);
    const listingId = params.get("id");

    const token = localStorage.getItem("token");

    if (!listingId || !token) {
        alert("Missing listing ID or not logged in.");
        return;
    }

    try {
        const response = await fetch(`https://v2.api.noroff.dev/auction/listings/${listingId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-Noroff-API-Key": API_KEY,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch listing");

        const { data } = await response.json();

        titleInput.value = data.title || "";
        descriptionInput.value = data.description || "";
        tagsInput.value = data.tags?.join(", ") || "";
        endsAtInput.value = data.endsAt ? new Date(data.endsAt).toISOString().slice(0, 16) : "";
    } catch (error) {
        console.error("Error fetching listing:", error);
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const updatedListing = {
            title: titleInput.value,
            description: descriptionInput.value,
            tags: tagsInput.value.split(",").map(tag => tag.trim()).filter(Boolean),
            endsAt: new Date(endsAtInput.value).toISOString(),
        };

        try {
            const response = await fetch(`https://v2.api.noroff.dev/auction/listings/${listingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "X-Noroff-API-Key": API_KEY,
                },
                body: JSON.stringify(updatedListing),
            });

            if (!response.ok) throw new Error("Failed to update listing");

            alert("Listing updated successfully!");
            window.location.href = `/profile/profile.html`;
        } catch (error) {
            alert(`Error updating listing: ${error.message}`);
        }
    });
}
