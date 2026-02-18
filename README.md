# Authentix

Collectibles marketplace (Lego, trading cards, antiques, etc.) with a Spring Boot backend and React frontend.

## Project structure

- **`backend/`** – Spring Boot API (Java 21, Maven). Run from this folder.
- **`frontend/`** – React app (Vite). Run `npm run dev` from this folder.

## Local development (your machine)

1. **Database:** Create a MySQL database named `authentix` (and a user if you prefer). No secrets go in git.
2. **Backend config:** Copy the example local config and add your real password:
   - `backend/src/main/resources/application-local.properties.example` → `application-local.properties`
   - Edit `application-local.properties` and set `spring.datasource.password` to your local MySQL password.
   - `application-local.properties` is gitignored and will never be committed.
3. **Run backend:** From `backend/` run with the `local` profile so it loads that file:
   - Windows (PowerShell): `$env:SPRING_PROFILES_ACTIVE="local"; .\mvnw.cmd spring-boot:run`
   - Or: `.\mvnw.cmd spring-boot:run "-Dspring.profiles.active=local"`
   - API at http://localhost:8080.
4. **Frontend:** From `frontend/` run `npm install` then `npm run dev`. App at http://localhost:5173. The dev server proxies `/api` to the backend.
5. **Stripe (optional):** For seller payouts and checkout, set in `application-local.properties`: `stripe.secret-key`, `stripe.webhook-secret`, `stripe.connect.success-url`, `stripe.connect.refresh-url`. In the frontend, set `VITE_STRIPE_PUBLISHABLE_KEY` (e.g. in `.env.local`) so the Buy flow works.

## Production (Vercel + Railway)

- **Backend + database (Railway):** Create a MySQL service and a Spring Boot service. In the backend service, set **environment variables** in the Railway UI (e.g. `SPRING_DATASOURCE_*`, `JWT_SECRET`, `app.cors.allowed-origins` with your Vercel URL; for Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `stripe.connect.success-url`, `stripe.connect.refresh-url`). No secrets in repo or in `application.properties`.
- **Frontend (Vercel):** Set `VITE_API_URL` to your Railway backend URL and `VITE_STRIPE_PUBLISHABLE_KEY` for checkout.

See `authentix_marketplace_plan_2b667dc1.plan.md` for the full feature plan.
