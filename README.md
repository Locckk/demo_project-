# Suit Rental Management System — Frontend

React + Vite + **Bootstrap 5** admin dashboard for a suit rental business.
Runs on seed data so it works standalone; Axios service files are already in
place for the backend.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173

**Demo accounts**

| Role     | Email             | Password |
|----------|-------------------|----------|
| Admin    | admin@srms.com    | admin123 |
| Employee | employee@srms.com | staff123 |

Employees don't see the Users page. Sign in as both to demonstrate role-based
access at the defence.

## Modules

| Page | What it does |
|---|---|
| Login | Email, password, remember me, protected routes |
| Dashboard | 6 stat cards, revenue and category charts, overdue alert, recent rentals |
| Suits | Table, search, category and status filters, add/edit with photo upload, details, delete |
| Customers | Table, search, add/edit, profile with booking and rental history |
| **Bookings** | Reserve a suit for a future date, overlap prevention, confirm, cancel, convert to rental |
| Rentals | New rental with live price quote, mark paid, start, cancel, overdue flags |
| Returns | Open rentals, check-in with late fee and damage charge, deposit refund receipt |
| Reports | Six report tabs, date range, charts, CSV export |
| Users | Staff accounts, roles, active/inactive — admin only |

## How the modules connect

One shared store under `src/store/`, so the pages really talk to each other:

- **Book a suit** → it becomes *Reserved* on the Suits page
- **Book the same suit over the same dates** → rejected, with the clashing
  customer and dates named in the message
- **Convert a booking** → a rental is created, the booking closes as
  *Converted*, the suit becomes *Rented*
- **Check a suit in** → back to *Available*, unless marked *Needs repair*,
  which sends it to *Maintenance*
- **Return late** → late fee from the rate in `config/shop.js`, deducted from the
  deposit, shown on the receipt
- **Cancel** a booking or rental → the suit is released
- **Delete** a suit or customer with something open → blocked with a message

Everything is saved to the browser (localStorage), so it survives a refresh.
An admin can put the sample records back from the profile menu in the top bar
(**Restore demo data**).

Rental rules — default rental length and the late fee per day — live in
`src/config/shop.js` as constants. They change once or twice a year, so a form
for them would have been more surface than the business needed.

## Styling

Bootstrap 5 does the work. `src/index.css` contains four `@import` lines and
nothing else; the rules live in `src/styles/`, split so each developer writes
to their own file:

| File | Contains | Owner |
|---|---|---|
| `styles/tokens.css` | Palette, Bootstrap variable overrides, typography | Dev A |
| `styles/shell.css` | Dark sidebar, top bar, responsive frame | Dev C |
| `styles/ui.css` | Status chips, tables, modals, toasts | Dev B |
| `styles/pages.css` | Stat cards, chalk rule, login rail, focus rings | Dev A |

Overriding Bootstrap's own CSS variables in `tokens.css` means `.btn-primary`,
`.bg-primary` and the rest follow the palette with no per-component overrides.
Vite inlines the imports at build time, so the output is identical to a single
file.

## Folder structure

```
suit-rental-frontend/
├── index.html                  fonts + root div
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                Bootstrap CSS, then index.css, then providers
    ├── App.jsx
    ├── index.css               four @import lines
    ├── styles/                 four owned stylesheets
    │
    ├── components/
    │   ├── Sidebar.jsx         role-filtered menu
    │   ├── Navbar.jsx          profile dropdown, sign out
    │   ├── Footer.jsx
    │   ├── DataTable.jsx       search + filters + pagination
    │   ├── Modal.jsx           React-controlled, not Bootstrap JS
    │   ├── ConfirmDialog.jsx
    │   ├── Toast.jsx
    │   ├── StatCard.jsx
    │   ├── StatusBadge.jsx
    │   ├── PageHeader.jsx
    │   ├── Field.jsx
    │   ├── IconButton.jsx
    │   ├── EmptyState.jsx
    │   ├── ErrorState.jsx
    │   └── Spinner.jsx
    │
    ├── layouts/DashboardLayout.jsx
    │
    ├── auth/
    │   └── AuthContext.jsx     login, logout, user, isAdmin
    │
    ├── store/                  STATE — one owner per slice
    │   ├── DataContext.jsx     composes the slices, declares state
    │   ├── usePersistentState.js  useState that survives refresh
    │   ├── useToast.js         notify()
    │   ├── helpers.js          today, daysBetween, nextId
    │   ├── useSuits.js         inventory operations
    │   ├── useCustomers.js     customer operations
    │   ├── useBookings.js      findConflict, add, confirm, cancel
    │   ├── useRentals.js       rentals, conversion, returns
    │   └── useStaff.js         user accounts
    │
    ├── routes/
    │   ├── AppRoutes.jsx
    │   └── ProtectedRoute.jsx  auth + adminOnly
    │
    ├── pages/                  10 pages
    ├── services/
    │   ├── api.js              Axios instance + interceptors
    │   └── endpoints.js        every backend call
    ├── config/shop.js          shop details and rental rules
    ├── data/dummyData.js       seed records — delete after backend hookup
    └── utils/
        ├── exportCsv.js
        └── formatters.js
```

## Connecting the backend

1. Create `.env`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
2. In `auth/AuthContext.jsx`, replace the dummy `login` body with
   `authService.login()` and store the real token.
3. In each store slice, replace the local state update with the matching call
   from `services/endpoints.js`. The slice files are small and independent, so
   this can be done one module at a time without breaking the others.
4. Delete `src/store/usePersistentState.js` and `src/data/dummyData.js`.

The function signatures in each slice match the service methods deliberately,
so the swap is one line per call.
