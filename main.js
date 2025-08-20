import { updateMobileMenu, setupLogout } from "./js/ui/nav.js";
import { isLoggedIn } from "./js/api/auth.js";
import { fetchListings } from "./js/api/listings.js";

updateMobileMenu(isLoggedIn());

setupLogout();

fetchListings();