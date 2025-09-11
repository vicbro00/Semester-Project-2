export function showLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.remove("hidden");
}

export function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("hidden");
}

showLoader();
hideLoader();