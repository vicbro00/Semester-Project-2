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
    main.innerHTML = `
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