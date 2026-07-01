/**
 * Feature Flags Configuration for Livo Homes
 * Toggle application features dynamically.
 */
export const FEATURES = {
  // Toggle the online ordering system (Cart, Checkout, Add to Cart)
  // Set to true to activate ordering, or false to act as a catalog/showroom only.
  enableOrdering: false,

  // Toggle user account registration
  // Set to true to show sign-up links, or false to hide registration.
  enableUserRegistration: false,

  // Toggle user account login/profile access (Vault Access in Navbar)
  // Set to true to allow user logins/profiles, or false to hide them.
  enableUserAccounts: false,
};
