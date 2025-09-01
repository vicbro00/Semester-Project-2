import { API_KEY } from "../api/api.js";
import { updateMobileMenu } from "./nav.js";

const loginURL = "https://v2.api.noroff.dev/auth/login";

export function loginUser() {
    const form = document.querySelector("#loginForm");
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");

    if (!form || !emailInput || !passwordInput) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email.endsWith("@stud.noroff.no") && !email.endsWith("@noroff.no")) {
            alert("You must use a valid Noroff email address (stud.noroff.no or noroff.no).");
            return;
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        const userCredentials = { email, password };

        try {
            const response = await fetch(loginURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Noroff-API-Key": API_KEY,
                },
                body: JSON.stringify(userCredentials),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errors?.[0]?.message || "Login failed");
            }

            const data = await response.json();

            const token = data.data?.accessToken;

            if (!token) {
                throw new Error("No token found in response");
            }

            localStorage.setItem("token", token);
            localStorage.setItem("username", data.data?.name || data.name);

            updateMobileMenu();
            alert("Login successful!");
            window.location.href = "/index.html";
        } catch (error) {
            console.error("Error logging in:", error);
            alert("Login failed: " + error.message);
        }
    });
}
