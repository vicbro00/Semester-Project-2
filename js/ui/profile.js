import { API_KEY } from "../api/api.js";
import { showLoader, hideLoader } from "./loader.js";

const main = document.querySelector("main");

/**
 * Fetches and displays the user's profile information
 * @returns {Promise<void>} Fetches and displays the user's profile information
 */
export async function fetchProfile() {
    if (!main) return;

    const token = localStorage.getItem("token");
    
    if (!token) {
        main.innerHTML = `<p class="text-danger">You must be logged in to view your profile.</p>`;
        return;
    }

    const username = localStorage.getItem("username");
    const profileURL = `https://v2.api.noroff.dev/auction/profiles/${username}`;

    showLoader();
    try {
        const response = await fetch(profileURL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-Noroff-API-Key": API_KEY,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch profile. Please log in again.");
        }

        const data = await response.json();
        showProfile(data.data);
    } catch (error) {
        console.error("Error fetching profile:", error);
        main.innerHTML = `<p class="text-danger">Error loading profile: ${error.message}</p>`;
    } finally {
        hideLoader();
    }
}

/**
 * shows the profile information in the DOM
 * @param {*} profile 
 */
function showProfile(profile) {
    const profileInfo = document.getElementById("profileInfo");

     profileInfo.innerHTML = `
        <div class="profile-banner mb-3" style="background-image: url('${profile.banner?.url || "/images/default-banner.jpg"}'); height: 200px; background-size: cover; background-position: center;"></div>

        <div class="text-center mb-3">
            <img src="${profile.avatar?.url || "/images/default-avatar.png"}" alt="${profile.avatar?.alt || "User Avatar"}" class="rounded-circle mb-3" width="100" height="100">
            <h2>${profile.name}</h2>
            <p>${profile.bio || "No bio set."}</p>
        </div>

        <div class="text-center">
            <p><strong>Email:</strong> ${profile.email}</p>
            <p><strong>Credits:</strong> ${profile.credits}</p>
        </div>
    `;
}

/**
 * takes the user to the edit profile page
 * @returns {void} creates and appends an "Edit Profile" button to the profile page
 */
export function editProfileButton() {
    const container = document.getElementById("profileEdit");

    if (!container) return;

    const button = document.createElement("button");
    button.textContent = "Edit Profile";
    button.className = "btn btn-primary-custom btn-lg";

    button.addEventListener("click", () => {
        window.location.href = "/Semester-Project-2/profile/update-profile.html";
    });

    container.appendChild(button);
}

/**
 * shows the user's listings when the button is clicked
 * @returns {void} sets up the show listings button functionality
 */
export async function showListings() {
    const btn = document.getElementById("showListingsButton");
    const container = document.getElementById("showListings");

    if (!btn || !container) return;

    let listingsVisible = false;

    btn.addEventListener("click", async () => {
        listingsVisible = !listingsVisible;

        if (listingsVisible) {
            btn.textContent = "Hide My Listings";

            const token = localStorage.getItem("token");
            const username = localStorage.getItem("username");

            if (!token || !username) {
                container.innerHTML = `<p class="text-danger">You must be logged in to view your listings.</p>`;
                return;
            }

            showLoader();
            try {
                const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${username}/listings`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                        "X-Noroff-API-Key": API_KEY,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch listings");
                }

                const data = await response.json();
                const listings = data.data;

                if (!listings || listings.length === 0) {
                    container.innerHTML = "<p>No listings found.</p>";
                    return;
                }

                container.innerHTML = listings.map(listing => {
                    const imageUrl = listing.media?.[0]?.url || "/Semester-Project-2/images/imagePlaceholder.png";
                    const imageAlt = listing.media?.[0]?.alt || "Listing image";

                    return `
                        <div class="col-12 col-md-6">
                            <div class="card h-100 mb-3">
                                <img src="${imageUrl}" alt="${imageAlt}" class="card-img-top">
                                <div class="card-body">
                                    <h5 class="card-title">${listing.title}</h5>
                                    <p class="card-text">${listing.description || "No description"}</p>
                                    <p><strong>Tags:</strong> ${listing.tags.join(", ")}</p>
                                    <p><strong>Ends At:</strong> ${new Date(listing.endsAt).toLocaleDateString()}</p>
                                    <div class="d-flex gap-2">
                                        <button class="btn btn-sm btn-warning edit-listing" data-id="${listing.id}">Edit</button>
                                        <button class="btn btn-sm btn-danger delete-listing" data-id="${listing.id}">Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join("");

                // Attach events for edit and delete buttons
                container.querySelectorAll(".edit-listing").forEach(button => {
                    button.addEventListener("click", (e) => {
                        const listingId = e.target.dataset.id;
                        window.location.href = `/Semester-Project-2/listings/edit-listing.html?id=${listingId}`;
                    });
                });

                container.querySelectorAll(".delete-listing").forEach(button => {
                    button.addEventListener("click", async (e) => {
                        const listingId = e.target.dataset.id;
                        const confirmDelete = confirm("Are you sure you want to delete this listing?");
                        if (!confirmDelete) return;

                        try {
                            const deleteResponse = await fetch(`https://v2.api.noroff.dev/auction/listings/${listingId}`, {
                                method: "DELETE",
                                headers: {
                                    "Authorization": `Bearer ${token}`,
                                    "X-Noroff-API-Key": API_KEY,
                                },
                            });

                            if (!deleteResponse.ok) {
                                throw new Error("Failed to delete listing");
                            }

                            alert("Listing deleted successfully.");
                            e.target.closest(".card").remove();
                        } catch (error) {
                            alert(`Error deleting listing: ${error.message}`);
                        }
                    });
                });

            } catch (error) {
                container.innerHTML = `<p class="text-danger">Error fetching listings: ${error.message}</p>`;
            } finally {
                hideLoader();
            }
        } else {
            btn.textContent = "Show My Listings";
            container.innerHTML = "";
        }
    });
}

/**
 * Fetches and displays the listings the user has bid on
 * @returns {Promise<void>} shows the listings the user has bid on
 */
export async function showBiddedListings() {
    const container = document.getElementById("biddedListings");

    if (!container) return;

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!token || !username) {
        container.innerHTML = `<p class="text-danger">You must be logged in to view your bidded listings.</p>`;
        return;
    }

    try {
        const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${username}/bids?_listings=true`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-Noroff-API-Key": API_KEY,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch bidded listings");
        }

        const data = await response.json();
        const bids = data.data;

        if (!bids || bids.length === 0) {
            container.innerHTML = "<p>You haven’t placed any bids yet.</p>";
            return;
        }

        container.innerHTML = `
            <h3 class="mt-4">Listings I Have Bid On</h3>
            ${bids.map(bid => {
                if (!bid.listing) {
                    return `
                        <div class="card mb-3">
                            <div class="card-body">
                                <p class="text-muted">Listing unavailable (may have been deleted)</p>
                                <p><strong>Your Bid:</strong> $${bid.amount}</p>
                            </div>
                        </div>
                    `;
                }

                return `
                    <div class="col-12 col-md-6">
                        <div class="card h-100 mb-3">
                            <div class="card-carousel">
                                <button class="carousel-btn left-btn">&lt;</button>
                                <img class="carousel-image" src="${listing.media?.[0]?.url || imagePlaceholder}" 
                                    alt="${listing.media?.[0]?.alt || 'Listing image'}" onerror="this.onerror=null;this.src='${imagePlaceholder}'"/>
                                <button class="carousel-btn right-btn">&gt;</button>
                            </div>
                            <div class="card-body">
                                <h5 class="card-title">${bid.listing.title}</h5>
                                <p class="card-text">${bid.listing.description || "No description"}</p>
                                <p><strong>Your Bid:</strong> $${bid.amount}</p>
                                <p><strong>Ends At:</strong> ${new Date(bid.listing.endsAt).toLocaleDateString()}</p>
                                <a href="/Semester-Project-2/listings/single-listing.html?id=${bid.listing.id}" class="btn btn-sm btn-primary-custom">View Listing</a>
                            </div>
                        </div>
                    </div>
                `;
            }).join("")}
        `;
    } catch (error) {
        console.error("Error fetching bidded listings:", error);
        container.innerHTML = `<p class="text-danger">Error loading bidded listings: ${error.message}</p>`;
    }
}

/**
 * takes the user to the create listing page
 * @returns {void} creates and appends a "Create New Listing" button to the profile page
 */
export function createButton() {
    const container = document.getElementById("createButton");

    if (!container) return;

    const button = document.createElement("button");
    button.textContent = "Create New Listing";
    button.className = "btn mt-4 btn-primary-custom btn-lg";

    button.addEventListener("click", () => {
        window.location.href = "/Semester-Project-2/profile/create.html";
    });

    container.appendChild(button);
}