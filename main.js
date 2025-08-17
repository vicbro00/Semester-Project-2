import { updateMobileMenu, setupLogout } from './js/ui/nav.js';
import { isLoggedIn } from './js/api/auth.js';

updateMobileMenu(isLoggedIn());

setupLogout();