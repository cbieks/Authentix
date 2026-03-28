# Authentix

Collectibles marketplace (Lego, trading cards, antiques, etc.) with a Spring Boot backend and React frontend.

## Project structure

- **`backend/`** – Spring Boot API (Java 21, Maven). Run from this folder.
- **`frontend/`** – React app (Vite). Run `npm run dev` from this folder.

## Docker + Flyway (shared DB for the team)

Use this when you want the **same schema and demo data** as everyone else (MySQL in Docker + Flyway migrations).

1. **Install Docker Desktop** (or Docker Engine + Compose).
2. From the **repo root**, copy `.env.example` → `.env` and set `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, and `MYSQL_PASSWORD` (defaults in `.env.example` work for local dev).
3. **Backend config:** Copy `backend/src/main/resources/application-docker.properties.example` → `application-docker.properties` in the same folder. Set `spring.datasource.password` to the same value as `MYSQL_PASSWORD` in `.env`. That file is gitignored.
4. From the **repo root**, start MySQL:
   ```bash
   docker compose up -d
   ```
   Compose maps the container to host port **3307** (so a local MySQL on 3306 can still run). If you change the mapping in `docker-compose.yml`, update `spring.datasource.url` in `application-docker.properties` to match.
5. **Run the backend** with the `docker` profile (Flyway applies `backend/src/main/resources/db/migration/*.sql`, then Hibernate **validates** the schema):
   - Windows (PowerShell): `$env:SPRING_PROFILES_ACTIVE="docker"; .\mvnw.cmd spring-boot:run` (from `backend/`)
6. **Seeded logins:** `V3` creates seller **id 2** (see `V3__seed_demo_user.sql` for email—used for listings **1–5**). `V7` adds **`demo@authentix.local`** (user **id 3**) for listings **6–44**. `V8` sets that demo user’s password to the literal **`password`** (BCrypt). Change or remove in production.

Migrations are versioned: `V1` (tables), `V2`–`V4` (categories, users, listings), `V6` (`listing_images`), `V7` (team demo seller + listings 6–44), `V8` (demo password). If Flyway reports a **checksum mismatch** after pulling an edited migration, use **repair** or fix `flyway_schema_history` as needed. New schema changes = higher version numbers only.

**Local MySQL without Docker (optional):** use `SPRING_PROFILES_ACTIVE=local` and create `application-local.properties` (gitignored) with your JDBC URL, user, and password. Flyway stays **disabled** by default (`spring.flyway.enabled=false` in `application.properties`); schema is managed by Hibernate `ddl-auto` unless you enable Flyway yourself.

---

## Local development (your machine)

1. **Database:** For most of the team, use **Docker + Flyway** above. If you use your own MySQL instead, create database `authentix` (and a user if you prefer). No secrets go in git.
2. **Backend config:** For Docker, use `application-docker.properties` from `application-docker.properties.example` as in the Docker section. For a non-Docker local DB, create `backend/src/main/resources/application-local.properties` with `spring.datasource.*` (and optional Stripe keys); that file is gitignored.
3. **Run backend:** From `backend/` run with the right profile (`docker` or `local`):
   - Docker (PowerShell): `$env:SPRING_PROFILES_ACTIVE="docker"; .\mvnw.cmd spring-boot:run`
   - Local MySQL (PowerShell): `$env:SPRING_PROFILES_ACTIVE="local"; .\mvnw.cmd spring-boot:run`
   - Or: `.\mvnw.cmd spring-boot:run "-Dspring.profiles.active=docker"` (or `local`)
   - API at http://localhost:8080.
4. **Frontend:** From `frontend/` run `npm install` then `npm run dev`. App at http://localhost:5173. The dev server proxies `/api` to the backend.
5. **Stripe (optional):** For seller payouts and checkout, set `stripe.secret-key`, `stripe.webhook-secret`, `stripe.connect.success-url`, and `stripe.connect.refresh-url` in `application-docker.properties` or `application-local.properties`. In the frontend, set `VITE_STRIPE_PUBLISHABLE_KEY` (e.g. in `.env.local`) so the Buy flow works.

## Production (Vercel + Railway)

- **Backend + database (Railway):** Create a MySQL service and a Spring Boot service. In the backend service, set **environment variables** in the Railway UI (e.g. `SPRING_DATASOURCE_*`, `JWT_SECRET`, `app.cors.allowed-origins` with your Vercel URL; for Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `stripe.connect.success-url`, `stripe.connect.refresh-url`). No secrets in repo or in `application.properties`.
- **Frontend (Vercel):** Set `VITE_API_URL` to your Railway backend URL and `VITE_STRIPE_PUBLISHABLE_KEY` for checkout.

See `authentix_marketplace_plan_2b667dc1.plan.md` for the full feature plan.
