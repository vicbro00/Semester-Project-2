import { updateMobileMenu, setupLogout } from './js/ui/nav.js';
import { isLoggedIn } from './js/api/auth.js';
import { fetchListings, displayListings } from './js/api/listings.js';

updateMobileMenu(isLoggedIn());

setupLogout();

fetchListings();

displayListings();