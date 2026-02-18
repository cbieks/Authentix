---
name: Authentix Marketplace Plan
overview: "Plan for building Authentix: a collectibles marketplace with a Spring Boot + MySQL backend, Node.js (React) frontend, and Stripe Connect for marketplace payments. Covers auth, explorer homepage, user profiles/listings, and optional feature ideas."
todos: []
isProject: false
---

# Authentix – Collectibles Marketplace Plan

## Tech stack summary


| Layer    | Choice                      | Notes                                                  |
| -------- | --------------------------- | ------------------------------------------------------ |
| Backend  | Spring Boot 3.x (Java 17+)  | REST API, Spring Security, Spring Data JPA             |
| Frontend | Node.js + React (e.g. Vite) | `npm run dev` for local development, calls backend API |
| Database | MySQL 8                     | Persistent storage for users, listings, categories     |
| Payments | Stripe Connect              | Marketplace: platform collects, then pays sellers      |


Frontend and backend run as separate processes: frontend on e.g. `http://localhost:5173`, backend on e.g. `http://localhost:8080`. Frontend uses environment variables for the API base URL so you can point to local or deployed backend.

---

## Project structure (recommended)

- `**authentix-backend/**` – Spring Boot app (Maven or Gradle), main package and config.
- `**authentix-frontend/**` – Node app (package.json, Vite + React), consumes backend API.
- `**README.md**` at root with setup for both (MySQL, env vars, `npm run dev` + running the backend).

No need for a monorepo tool (Nx/Turborepo) initially; two folders and two commands are enough.

---

## Database (MySQL) – core entities

- **Users** – id, email, password_hash, display_name, profile_photo_url, bio, contact_info (email/phone), contact_visible (boolean), stripe_connect_account_id (nullable, for sellers), created_at, updated_at.
- **Listings** – id, seller_id (FK), category_id (FK), title, description, price, currency, condition, images (JSON or separate table), status (draft/active/sold/removed), **verification_status** (UNVERIFIED | PENDING | VERIFIED), **shipping_option** (SHIP | LOCAL_PICKUP), created_at, updated_at.
- **Categories** – id, name, slug, parent_id (optional, for subcategories), e.g. “Lego”, “Trading cards”, “Antiques”, “Pokemon”, “Sports cards”.
- **Orders** – id, buyer_id, listing_id, stripe_payment_intent_id, amount, platform_fee (6% of amount), seller_payout, status, created_at.
- **Watchlist** – user_id (FK), listing_id (FK), created_at; unique (user_id, listing_id). Makes explore/listing pages feel “real” with one simple table.
- **Messages** (inbox lite) – id, listing_id (FK), sender_id (FK), receiver_id (FK), body (text), read (boolean), created_at. Buyer can “Send question” to seller; simple inbox per user.

Indexes: user email (unique), listing status + category + shipping_option + verification_status, seller_id, created_at; watchlist (user_id, listing_id); messages (receiver_id, created_at).

---

## Backend (Spring Boot) – main pieces

1. **Security and auth**
  - JWT-based auth: login returns access (and optionally refresh) token; frontend sends `Authorization: Bearer <token>`.
  - Endpoints: `POST /api/auth/register`, `POST /api/auth/login`; optional `POST /api/auth/refresh`, `GET /api/auth/me`.
  - Password encoding (e.g. BCrypt), validation, and secure storage of tokens (no secrets in JWT payload).
2. **User and profile**
  - `GET/PATCH /api/users/me` – current user profile (photo, bio, contact info, contact_visible).
  - `GET /api/users/:id` – public profile: only show contact if `contact_visible` is true; always show display name, photo, bio, and public listing count.
3. **Listings and explorer**
  - `GET /api/listings` – explorer/home: paginated, filter by category, condition, price range, search query; sort by date or price.
  - `GET /api/listings/:id` – single listing (with seller public info).
  - `POST/PATCH/DELETE /api/listings` – create/update/delete (seller only); support image upload (e.g. to cloud storage or stored paths in DB).
4. **Categories**
  - `GET /api/categories` – tree or flat list for filters and navigation.
5. **Stripe Connect (see section below)**
  - Endpoints for onboarding sellers (create Connect account, link to user), creating payment intents for checkout, and (if using webhooks) handling `payment_intent.succeeded` and payouts.

Use DTOs for API request/response; keep entities internal. Add CORS config so the Node frontend (e.g. localhost:5173) can call the backend.

---

## Frontend (Node + React) – main pieces

1. **Setup**
  - Vite + React, React Router, and a simple way to call the API (fetch or axios) with a base URL from env (e.g. `VITE_API_URL=http://localhost:8080`).
  - Auth: store token (e.g. memory + localStorage or only httpOnly cookie if you later move to cookie-based auth); send token on every API request; redirect to login when 401.
2. **Pages**
  - **Login / Register** – forms calling backend auth endpoints; redirect after success.
  - **Home / Explorer** – grid or list of listings; filters (category, price, condition, search); links to listing detail and seller profile.
  - **Listing detail** – title, description, images, price, seller card (name, photo, link to profile); “Buy” or “Contact” (if contact visible) or “Make offer” when you add that flow.
  - **Account (authenticated)**
    - **My listings** – list of current user’s listings with edit/delete.
    - **Profile** – edit profile photo, bio, contact info, and **“Hide contact on public profile”** toggle (maps to `contact_visible`).
3. **UI**
  - Responsive layout; consistent header with nav (Home, Categories, Login/Account); use of existing component library (e.g. shadcn/ui) is optional but speeds things up.
4. **Course integrations (see section below)**
  - **Google Analytics:** GA4 script in root HTML/layout; `VITE_GA_MEASUREMENT_ID`; load only when set.
  - **Google AdSense:** AdSense script in root HTML; one ad unit (e.g. explorer sidebar or listing detail); `VITE_ADSENSE_CLIENT_ID`.

---

## How Stripe will work (marketplace)

Authentix is a **marketplace**: buyers pay the platform; the platform pays sellers and can keep a fee. Stripe supports this with **Stripe Connect**.

### High-level flow

1. **Platform account** – You have one Stripe account for Authentix (platform).
2. **Seller onboarding** – Each seller who wants to receive payouts connects a **Connect** account:
  - **Express accounts** are a good fit: Stripe hosts onboarding (identity, bank details), you redirect to Stripe and back; less compliance burden for you.
  - You store `stripe_connect_account_id` on the User (or a separate SellerProfile) and use it when creating payments.
3. **When a buyer pays**:
  - You create a **PaymentIntent** (or Checkout Session) for the listing price.
  - Money is charged to the buyer and lands in **your platform balance**.
  - You then **transfer** (or use destination charges) to the seller’s Connect account, minus your **application fee**. Authentix uses a **6% transaction fee**: e.g. buyer pays $100, platform keeps $6, seller receives $94 (before Stripe processing fees; fee logic is in your backend).
4. **Payouts to sellers** – Stripe automatically pays out from their Connect balance to their bank on a schedule (e.g. daily); you can also offer instant payouts for a fee.

So: **one-time setup** (Connect onboarding) per seller; **per-order flow** (create payment → capture → transfer to Connect account minus fee). No need to implement escrow or multi-party charges yourself; Stripe handles that.

### Backend integration outline

- **Env**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_CLIENT_ID` (for Express onboarding).
- **Onboarding**: endpoint that creates an Express Connect account (or account link) and redirects user to Stripe; after return, Stripe sends an event or you fetch the account and save `stripe_connect_account_id` to the user.
- **Checkout**: endpoint that creates a PaymentIntent with `transfer_data.destination = seller’s stripe_connect_account_id` and `application_fee_amount` = 6% of the charge (or use separate **charge + transfer** after payment succeeds).
- **Webhooks**: handle `payment_intent.succeeded` (and optionally `account.updated`) to update order status and any internal “balance” or notifications.

You’ll need a minimal “seller onboarding” flow in the UI (e.g. “Set up payouts” in account settings) and a checkout page that calls your backend to create the PaymentIntent and then confirms it with Stripe.js on the frontend.

---

## High demo value / low complexity (in scope)

These are included in the plan; all are good fits for Authentix and stay simple to implement.


| Feature                                 | Assessment                                                                                                                                                                          | Implementation                                                                                                                                                                                                                  |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Watchlist / Favorites**               | Strong yes. One table `watchlist(user_id, listing_id)`; “Save” on listing card/detail; “My watchlist” in account. Explore and listing pages feel instantly like a real marketplace. | Table + `POST/DELETE /api/listings/:id/watchlist`, `GET /api/users/me/watchlist`; filter or badge “In your watchlist” on explorer.                                                                                              |
| **Messaging lite**                      | Strong yes. “Send question” to seller from listing page; simple inbox (conversations per listing or flat list). No need for real-time or threading at first.                        | Table `messages`; `POST /api/listings/:id/message`, `GET /api/users/me/inbox` (with listing context); inbox UI shows thread per listing/seller.                                                                                 |
| **Listing verification / authenticity** | Strong yes, very on-brand for collectibles. `verification_status`: UNVERIFIED → PENDING (seller requests) → VERIFIED (admin approves). Badge on listing and in explorer.            | Column on Listings; “Request verification” in seller’s listing actions; simple admin view (e.g. `/admin/listings?verification=PENDING`) with Approve/Reject; fake admin (e.g. role or hardcoded user) is fine for a class demo. |
| **Shipping vs local pickup**            | Strong yes. Common expectation; enables “local only” or “ship only” filters.                                                                                                        | Column `shipping_option` (SHIP                                                                                                                                                                                                  |


---

## Course requirements: AdSense, Analytics, Recommendation engine

These satisfy the professor’s checklist (Google AdSense, Google Analytics, Recommendation engine).

### Recommendation engine

- **Purpose:** “Recommendations” so the site clearly has a recommendation feature (e.g. “Similar listings”, “Recommended for you”).
- **Backend:** One endpoint, e.g. `GET /api/listings/recommended`. Optional query: `?listingId=...` for “similar to this listing”, or no param for “for you”.
  - **Similar to this listing:** Same `category_id` (and optionally similar price range), exclude current listing, limit 6–8, order by recent or relevance.
  - **For you (logged-in):** If user has watchlist, recommend other active listings in the same categories as watchlist items; else “popular” or “recently listed” (e.g. same category as last viewed, or global recent).
  - **Anonymous:** Return “popular” or “recently listed” (e.g. most recent active listings, or by category if you track category view in session/cookie later).
- **Frontend:**
  - **Home / Explorer:** A “Recommended for you” or “Trending / Popular” section that calls `GET /api/listings/recommended`.
  - **Listing detail page:** A “Similar listings” section that calls `GET /api/listings/recommended?listingId=<id>`.
- **Data:** No new tables; use existing Listings + Categories + Watchlist. Optional: a “view” or “click” count per listing later for “popular” ordering.

### Google Analytics (GA4)

- **Purpose:** Track traffic and behavior for the “Google Analytics” requirement.
- **Frontend:** Add the GA4 script (gtag.js) in the app’s root HTML or root layout (e.g. `index.html` in Vite, or a shared `App`/layout component that renders a script tag).
- **Config:** Use an env var for the Measurement ID (e.g. `VITE_GA_MEASUREMENT_ID`). In dev or when unset, don’t load the script so local runs stay clean.
- **Docs:** Get the Measurement ID from Google Analytics (GA4 property); paste into env in Vercel for production.

### Google AdSense

- **Purpose:** Integrate advertising for the “Google AdSense” requirement.
- **Frontend:** Add the AdSense script (e.g. from AdSense “Get code” snippet) in the root HTML. Add one or two ad units where they fit:
  - **Placement ideas:** Sidebar on the explorer page; or a horizontal unit above/below the listing grid; or a unit on the listing detail page (e.g. below description). One placement is enough to demonstrate integration.
- **Config:** Use env var for publisher ID (e.g. `VITE_ADSENSE_CLIENT_ID`) so you can leave it blank in dev. AdSense often won’t show on localhost; it will need a deployed domain and AdSense approval to show real ads.
- **Note:** For the project, “integration” = script + placeholder or real ad unit; approval and revenue are separate.

---

## Extra feature ideas (optional / later)

- **Search** – Full-text search on title/description; price/condition filters (already in explorer).
- **Ratings and reviews** – After purchase, rate seller; show on profile and listing.
- **Email notifications** – New message, sale, payout (e.g. SendGrid or Resend).

---

## Implementation order (suggested)

1. **Project scaffold** – Backend and frontend folders, DB schema (Users, Categories, Listings at least), run both locally.
2. **Auth** – Register, login, JWT, `GET /api/users/me`; frontend login/register and protected routes.
3. **Profile and visibility** – `PATCH /api/users/me`, public `GET /api/users/:id` with `contact_visible`; frontend profile edit and “hide contact” toggle.
4. **Listings and explorer** – CRUD listings, image upload; explorer API and homepage UI; listing detail and seller link.
5. **Categories** – Seed categories; filters on explorer and in create-listing form.
6. **Stripe Connect** – Seller onboarding (Express), store `stripe_connect_account_id`; checkout with **6% application fee** (PaymentIntent + transfer); webhook; “Buy” flow in UI.
7. **Watchlist** – Watchlist table and API; “Save” / “Remove” on listing; “My watchlist” page.
8. **Messaging lite** – Messages table; “Send question” from listing; inbox page (threads per listing or seller).
9. **Verification flow** – `verification_status` on listings; seller “Request verification”; admin view (fake admin) to approve/reject; verified badge on listing and explorer.
10. **Shipping option** – `shipping_option` on listings (SHIP | LOCAL_PICKUP); create/edit form; filter on explore.
11. **Recommendation engine** – Backend `GET /api/listings/recommended` (similar-by-category, for-you from watchlist or popular/recent); “Recommended for you” on explorer, “Similar listings” on listing detail.
12. **Google Analytics** – GA4 script in frontend root; `VITE_GA_MEASUREMENT_ID` env; load only when set (e.g. production).
13. **Google AdSense** – AdSense script in frontend root; one ad unit (e.g. explorer sidebar or listing detail); `VITE_ADSENSE_CLIENT_ID` env; optional in dev.

If you tell me your preferred frontend (e.g. “Vite + React” or “Next.js”) and whether you want to start with auth or with explorer, I can break any of these into step-by-step tasks (e.g. exact API contracts and file names) next.