import { updateMobileMenu, setupLogout } from "./js/ui/nav.js";
import { isLoggedIn } from "./js/api/auth.js";
import { fetchListings } from "./js/api/listings.js";
import { searchListings } from "./js/ui/index.js";
import { sortListings } from "./js/api/listings.js";
import { filterDropdown } from "./js/ui/index.js";

updateMobileMenu(isLoggedIn());

setupLogout();

fetchListings();

searchListings();

sortListings();

filterDropdown(sortListings);