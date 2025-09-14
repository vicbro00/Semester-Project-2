import { API_KEY } from "../api/api.js";
import { showLoader, hideLoader } from "./loader.js";

const username = localStorage.getItem("username");
const updateProfileURL = `https://v2.api.noroff.dev/auction/profiles/${username}`;
const form = document.querySelector("#updateProfileForm");

/**
 * the users profile forms are populated with current data
 * @returns {Promise<void>} populates the profile form with current user data
 */
export async function populateProfileForm() {
    if (!form) return;

    const token = localStorage.getItem("token");
    if (!token || !username) return;

    showLoader();
    try {
        const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${username}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-Noroff-API-Key": API_KEY,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch profile data.");

        const data = await response.json();
        const profile = data.data;

        document.querySelector("#bio").value = profile.bio || "";
        document.querySelector("#avatarUrl").value = profile.avatar?.url || "";
        document.querySelector("#bannerUrl").value = profile.banner?.url || "";

    } catch (error) {
        console.error("Error fetching profile data:", error);
        alert("Could not load profile data: " + error.message);
    } finally {
        hideLoader();
    }
}

/**
 * updates the user's profile information
 * @returns {void} updates the user's profile information
 */
export async function updateProfile() {
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const token = localStorage.getItem("token");

        if (!token || !username) {
            alert("You must be logged in to update your profile.");
            return;
        }

        const bio = document.querySelector("#bio").value.trim();
        const avatarUrl = document.querySelector("#avatarUrl").value.trim();
        const bannerUrl = document.querySelector("#bannerUrl").value.trim();

        const body = {};
        if (bio) body.bio = bio;
        if (avatarUrl) body.avatar = { url: avatarUrl, alt: "" };
        if (bannerUrl) body.banner = { url: bannerUrl, alt: "" };

        if (Object.keys(body).length === 0) {
            alert("You must provide at least one field to update.");
            return;
        }

        showLoader();
        try {
            const response = await fetch(updateProfileURL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "X-Noroff-API-Key": API_KEY,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errors?.[0]?.message || "Failed to update profile");
            }

            const data = await response.json();
            alert("Profile updated successfully!");
            console.log("Updated profile:", data.data);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile: " + error.message);
        } finally {
            hideLoader();
        }
    });
}
