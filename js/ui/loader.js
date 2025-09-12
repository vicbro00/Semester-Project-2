/**
 * Loader UI functions
 * @module ui/loader
 */
export function showLoader() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.classList.remove("hidden");
    } else {
        console.error("Loader element not found in the DOM.");
    }
}

/**
 * Hides the loader element
 * @returns {void}
 */
export function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.classList.add("hidden");
    } else {
        console.error("Loader element not found in the DOM.");
    }
}

try {
    showLoader();
} catch (error) {
    console.error("Error calling showLoader:", error);
}

try {
    hideLoader();
} catch (error) {
    console.error("Error calling hideLoader:", error);
}