import { API_KEY } from "../api/api.js";

const main = document.querySelector("main");

export async function fetchProfile() {
    if (!main) return;

    const token = localStorage.getItem("token");
    
    if (!token) {
        main.innerHTML = `<p class="text-danger">You must be logged in to view your profile.</p>`;
        return;
    }

    const username = localStorage.getItem("username");
    const profileURL = `https://v2.api.noroff.dev/auction/profiles/${username}`;

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
    }
}

function showProfile(profile) {
    const profileInfo = document.getElementById("profileInfo");

    profileInfo.innerHTML = `
        <div class="profile-banner mb-3" style="background-image: url('${profile.banner?.url || "/images/default-banner.jpg"}'); height: 200px; background-size: cover; background-position: center;"></div>
        <div class="d-flex align-items-center mb-3">
            <img src="${profile.avatar?.url || "/images/default-avatar.png"}" alt="${profile.avatar?.alt || "User Avatar"}" class="rounded-circle me-3" width="100" height="100">
            <div>
                <h2>${profile.name}</h2>
                <p>${profile.bio || "No bio set."}</p>
            </div>
        </div>
        <div>
            <p><strong>Email:</strong> ${profile.email}</p>
            <p><strong>Credits:</strong> ${profile.credits}</p>
        </div>
    `;
}

export function editProfileButton() {
    const container = document.getElementById("profileEdit");

    if (!container) return;

    const button = document.createElement("button");
    button.textContent = "Edit Profile";
    button.className = "btn btn-primary-custom btn-lg";

    button.addEventListener("click", () => {
        window.location.href = "/profile/update-profile.html";
    });

    container.appendChild(button);
}

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

                container.innerHTML = listings.map(listing => `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">${listing.title}</h5>
                            <p class="card-text">${listing.description || "No description"}</p>
                            <p><strong>Tags:</strong> ${listing.tags.join(", ")}</p>
                            <p><strong>Ends At:</strong> ${new Date(listing.endsAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                `).join("");

            } catch (error) {
                container.innerHTML = `<p class="text-danger">Error fetching listings: ${error.message}</p>`;
            }
        } else {
            btn.textContent = "Show My Listings";
            container.innerHTML = "";
        }
    });
}

export function createButton() {
    const container = document.getElementById("createButton");

    if (!container) return;

    const button = document.createElement("button");
    button.textContent = "Create New Listing";
    button.className = "btn btn-primary-custom btn-lg";

    button.addEventListener("click", () => {
        window.location.href = "/profile/create.html";
    });

    container.appendChild(button);
}