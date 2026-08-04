/**
 * Shop configuration.
 * OWNER: Dev A — nobody else edits this file.
 *
 * These values were previously editable on a Settings page. They change once
 * or twice a year at most, so a form for them was more surface than the
 * business needed. They live here as constants instead.
 *
 * When the backend arrives, replace this export with a fetch from
 * GET /api/settings — every page already reads it through useData().shop,
 * so nothing else changes.
 */
const shop = {
  name: "Suit Rental Hargeisa",
  phone: "+252 63 4000000",
  email: "info@srms.com",
  address: "Road No.1, Hargeisa, Somaliland",
  currency: "USD",

  /** Pre-fills the return date on a new booking or rental. */
  defaultDays: 7,

  /** Charged per day past the expected return date. */
  lateFeePerDay: 5,
};

export default shop;
