<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Running in the Base44 sandbox

```bash
docker compose -f docker-compose.base44.yml up -d      # web (Next dev) + local Supabase backend
docker compose -f docker-compose.base44.yml ps
docker compose -f docker-compose.base44.yml logs -f web
```

App: <http://localhost:3000> (the preview serves port 3000). The Supabase-compatible API is on host
port 8000 — the browser calls it directly, so it must be a *public* port host, not an internal one.

### The app needs Supabase, so a local one is provided

`src/lib/data/supabase.ts`, `src/utils/supabase/*` and `src/lib/domain/finance.ts` all talk to Supabase
(Auth + Postgres REST). Instead of a managed project, `docker-compose.base44.yml` runs a local
Supabase-compatible backend, so the sandbox needs no third-party credentials:

| service | image | role |
|---|---|---|
| `db` | `supabase/postgres` | Postgres + Supabase roles/auth schema |
| `auth` | `supabase/gotrue` | `/auth/v1` (email + password sessions) |
| `rest` | `postgrest/postgrest` | `/rest/v1` (the data API) |
| `api` | `nginx:alpine` | one API origin on port 8000, CORS for the preview origin |
| `db-init` | `postgres` | applies `.base44/supabase/init.sql` (schema + grants) |
| `seed-admin` | `node:22` | creates the admin account (mirrors `create_admin.js`) |
| `web` | `node:22` | `next dev`, source bind-mounted, `npm ci` on start |

Local development login: **richaimb@gmail.com / SuperPassword123!** (same account as `create_admin.js`).
`mustChangePassword` is false for it, so it goes straight to the dashboard.

To point the app at Supabase Cloud instead, set `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` (the service-role key is required:
several server actions use `supabaseAdmin`) and drop the local services.

### Non-obvious things this setup had to solve

- **Service-role passwords:** the `supabase/postgres` image creates `authenticator` and
  `supabase_auth_admin` but does not apply `POSTGRES_PASSWORD` to them, so `.base44/supabase/init.sql`
  sets their passwords to match the connection strings in the compose file. That script must connect as
  `supabase_admin` (the image's superuser) — the `postgres` role is not a superuser and cannot alter
  those roles ("is a reserved role, only superusers can modify it").
- **GoTrue migrates the `auth` schema itself** on startup; table creation for the app's own tables is the
  separate `db-init` one-shot service.
- **PostgREST's image is distroless** (no shell/wget/curl), so it cannot have a healthcheck. The `api`
  gateway probe covers it and prints which backend (GoTrue or PostgREST) is failing.
- **Next dev behind the preview proxy:** the proxy forwards the request with the *sandbox* Host header
  while the browser's origin is the public preview origin. Next therefore rejects both dev asset
  requests and Server Action POSTs. `next.config.ts` allow-lists the preview host in
  `allowedDevOrigins` *and* `experimental.serverActions.allowedOrigins`, guarded by
  `BASE44_PREVIEW_MODE === "1"` (both lists stay empty/unset otherwise). Symptom if this regresses:
  clicking "Se connecter" does nothing and `web` logs
  `` `x-forwarded-host` header ... does not match `origin` header ... Aborting the action `` with
  `POST /login 500`.
- **The database starts empty** except for one `organization` row (`CJEP`, opening balance 500 000
  FCFA) from `supabase_schema.sql`. Contributor/student/expense lists are legitimately empty.
- `migrate.js` uses a `exec_sql` RPC that does not exist locally; schema changes here belong in
  `.base44/supabase/init.sql` instead.

### How to verify the app works

1. `curl -sI http://localhost:3000/login` → 200, and `docker compose ... ps` shows `db`, `auth`, `api`,
   `web` healthy.
2. Sign in at `/login` with the account above → lands on `/tableau-de-bord`, whose KPI cards show the
   opening balance read from the database (proves auth *and* data access).
3. `curl -H "apikey: <anon key>" https://8000-$BASE44_PUBLIC_HOST_SUFFIX/rest/v1/organization` →
   the seed row, i.e. the public API origin works for browser calls too.
