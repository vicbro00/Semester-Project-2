import { API_KEY } from "../api/api.js";
import { showLoader, hideLoader } from "./loader.js";

const registerURL = "https://v2.api.noroff.dev/auth/register";

export function registerUser() {
    const form = document.querySelector("form");

    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.querySelector("#username").value.trim();
        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value.trim();

        if (!email.endsWith("@stud.noroff.no") && !email.endsWith("@noroff.no")) {
            alert("You must use a valid Noroff email address (stud.noroff.no or noroff.no).");
            return;
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        if (!/^[A-Za-z0-9_]+$/.test(username)) {
            alert("Username can only contain letters, numbers, and underscores (_).");
            return;
        }

        const newUser = {
            name: username,
            email: email,
            password: password,
            bio: "This is my profile bio",
        };

        showLoader();
        try {
            const response = await fetch(registerURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Noroff-API-Key": API_KEY,
                },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errors?.[0]?.message || "Registration failed");
            }

            const data = await response.json();
            console.log("User registered!", data);
            alert("Registration successful!");

            window.location.href = "login.html";
        } catch (error) {
            console.error("Error registering user:", error);
            alert("Registration failed: " + error.message);
        } finally {
            hideLoader();
        }
    });
}