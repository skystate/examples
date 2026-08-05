# SkyState Requirements V2.13

*(Verified against backend, SDK, CLI, console, and current docs - Last Updated: Friday, May 15, 2026)*

> **Implementation Status Key:** Sections marked **(Shipped)** reflect features implemented and deployed. Sections marked **(Planned)** describe features not yet built.

---

## Verification Ledger **(Shipped/Planned Split)**

This section is the single claim ledger for the May 15, 2026 verification pass. It preserves the accurate product contract while making stale or future-facing claims explicit.

How to read this document:

- The ledger records every major claim category found during review, including stale claims so they are not lost.
- The numbered specification sections below the ledger are the current normative contract.
- Planned sections are retained as roadmap context only; they should not be treated as shipped API, SDK, CLI, or console behavior.

| # | Claim | Status | Verification result |
|---|---|---|---|
| 1 | SkyState is hosted JSON state infrastructure, not a UI component library, game networking engine, or auth provider replacement. | Verified | Keep. Lead with remote config and hosted JSON state; do not imply session sync or multiplayer is shipped. |
| 2 | The product path is public state first, user state next, session/shared state later. | Verified with correction | Public state and user state are shipped; session/shared state remains planned. |
| 3 | The SDK is network-first and does not require `skystate.json` at runtime. | Verified with correction | Runtime config comes from provider/client props and environment variables. Current CLI no longer writes or resolves repo `skystate.json`. |
| 4 | SDK initial public-state load returns fallback/default values while loading. | Verified with correction | Keyed hooks return fallbacks from code; operational status comes from `useStatus().health`. |
| 5 | Progressive plain setter, modifiers, and raw patch escape hatch. | Planned/stale | Current user-state SDK ships top-level keyed `set()`/`clear` behavior only. Modifiers, raw patch arrays, and nested setter routing are future work. |
| 6 | State levels include Project/Public, User, and Session. | Verified with correction | Public/project and user levels are shipped. Session level is planned. |
| 7 | User-state concurrency uses `If-Match` version guards and retries/refetches after conflict. | Verified | Keep. JSON Patch `test` is unsupported. |
| 8 | Built-in auth exists. | Verified with correction | Hosted PKCE auth and `useStatus().auth.loginWithRedirect()` are shipped. A `SkyStateLogin` component is not implemented. BYOA remains planned. |
| 9 | Auth token storage uses a pluggable adapter, default browser `localStorage`, and memory helper. | Verified | Keep. Construction reads storage once; refresh uses in-memory token state. |
| 10 | Refresh-token refresh uses in-memory token state and persists rotations when returned. | Verified with correction | Refresh success updates in-memory `idToken`/claims. If the API returns a rotated `refreshToken`, the SDK persists it through `AuthTokenStorage`; otherwise it keeps the current in-memory refresh token. |
| 11 | API routes use `/{accountSlug}/{projectSlug}/...` and GUID admin routes. | Stale | Replace with `/{accountId}/projects/{projectId}/...`; no GUID-keyed admin URL or `/projects/by-slug/{slug}` bridge is implemented. |
| 12 | `accountId` and `projectId` are canonical route identifiers. | Verified | `accountId` is an `acc_...` account identifier; `projectId` is the canonical slug-like project identifier. |
| 13 | Public-state endpoints are `GET`, `PUT`, `PATCH`, and `GET /versions`. | Verified | Keep with corrected route prefix. |
| 14 | User-state endpoints are end-user `GET/PATCH` plus developer list/get. | Verified with addition | Add implemented developer delete: `DELETE /{accountId}/projects/{projectId}/user-states/{endUserId}`. |
| 15 | Anonymous readonly public-state reads include `Cache-Control` TTLs. | Verified | Development/staging 10s, production/default 900s. |
| 16 | Per-minute rate limits differ by auth type. | Stale | `StandardRateLimit` in every environment: 120 req/min per credential (API key or bearer token). Anonymous auth endpoints (`/v1/auth/*`, `/v1/auth/dev/*`) share one `AuthRateLimit` global bucket of 1000 req/min across all callers. Anonymous requests elsewhere are not rate limited. |
| 17 | Monthly API request quotas are 25,000/250,000/2,000,000. | Verified with correction | Authenticated state routes are metered; hard block happens above the configured block multiplier, currently 1.1. Management and anonymous readonly routes are not metered by that filter. |
| 18 | Version retention is planned/indefinite today. | Stale | Retention pruning is implemented. Configured windows are Free 0 days, Hobby 5 days, Pro 30 days; the latest version is preserved. |
| 19 | JSON Patch supports `add`, `remove`, `replace`; unsupported ops are rejected. | Verified | Keep. Extra operation-object fields are ignored by model binding/operation handling. |
| 20 | Custom `increment`/`decrement` patch ops are implemented. | Planned | Not implemented in backend or SDK. |
| 21 | `QuotaResponse` includes quota code, message, resource, current, limit, resetAt. | Verified with correction | Implemented codes include `QUOTA_API_REQUESTS`, `QUOTA_PROJECTS`, `QUOTA_API_KEYS`, and `QUOTA_END_USERS`; `QUOTA_STORAGE` is not evidenced. |
| 22 | `429` responses are empty. | Stale | Rate-limit rejection returns the JSON `ErrorResponse` envelope (`error: "rate_limited"`, `message: "Rate limit exceeded. Try again later."`) with `Content-Type: application/json` and `Retry-After: 60` in every environment. |
| 23 | `@skystate/core` exports a `ConfigState` class. | Stale | Current core exports `createSkyStateClient()`. |
| 24 | React `SkyStateProvider` requires only `project`. | Stale | React provider requires `account` and `project`; `environment` defaults to `development`. Core client requires `environment`. |
| 25 | Keyed SDK hooks support nested paths like `maintenance.enabled`. | Stale | Current keyed hooks accept top-level keys only; keys cannot contain `/` or `~`. |
| 26 | `usePublicState` and `useUserState` expose no-arg subsystem status hooks. | Stale | The no-arg status hooks were removed; subsystem status now lives on `useStatus().health`. Only keyed overloads remain: keyed `usePublicState` returns `{ value }`; keyed `useUserState` returns `{ value, set, clear, syncStatus, draft }`. |
| 27 | Public-state SDK refetches on `visibilitychange`. | Stale | Not implemented. Public state fetches on init and retries after recoverable load errors. |
| 28 | User-state SDK is planned only. | Stale | User-state SDK is shipped with authenticated load, optimistic queueing, PATCH writes, refresh handling, and conflict replay. |
| 29 | Svelte/Vue SDKs and session-state hooks are shipped. | Planned | Not implemented. |
| 30 | CLI command surface is top-level `skystate init/show/push/diff/promote/projects`. | Stale | Current user-facing command is `sky`; command groups are `sky project ...`, `sky onboarding`, `sky state public ...`, `sky state user ...`, `sky config ...`. |
| 31 | CLI stores credentials in `credentials.json`. | Stale | Developer bearer session is stored in `~/.config/skystate/token.json`; CLI preferences are in `config.json`. |
| 32 | CLI uses repo `skystate.json`, `.env`, `SKYSTATE_DEV_KEY`, and `SKYSTATE_TOKEN`. | Stale | Current API-key auth uses `SKYSTATE_API_KEY` or `.env.local`; state commands require `--project`; no bearer token env var is supported. |
| 33 | API base URL defaults to `https://app.skystate.io/api`. | Stale | CLI and SDK default to `https://api.skystate.io`; React auth front defaults to `https://auth.skystate.io`. |
| 34 | CLI `diff` exits 1 when differences exist. | Stale | It exits with code 3 for detected differences. |
| 35 | CLI `promote` is per-hunk interactive. | Stale | It shows a unified diff and applies all changes after one confirmation, or runs non-interactively with `--yes`/`--dry-run`. |
| 36 | Console comparison is bidirectional per-key PATCH editing. | Stale/partial | Console can compare current state to another env/version in a two-pane view; only the current buffer is editable and save uses full `PUT`. |
| 37 | Project deletion is hard delete. | Verified | Keep. Cascades remove project environments/state/API-key/auth children. |
| 38 | Account deletion is unsupported. | Stale | Account deletion is implemented through `DELETE /account` and console account settings. |
| 39 | `skystate pull` / generated types are shipped. | Planned | Still deferred. |
| 40 | SDK retry/resilience contract exists. | Verified with corrections | Keep current outcome tables, but fix route prefixes, refresh URL, and jitter wording. |

---

## 1. Design Philosophy **(Shipped)**

SkyState is **hosted JSON state for developers**. It is not a UI component library, a game engine networking layer, or an auth provider replacement. The service provides JSON state that clients can fetch, cache, and mutate through a strict API and ergonomic SDKs.

**Core positioning:** SkyState follows a **progressive value model**. It enters codebases as lightweight remote config (feature flags, maintenance banners, kill switches, announcements, environment-specific JSON config), grows into authenticated user state, and leaves shared/session state as the future direction.

### 1.1 The "Network-First" Mandate *(V2.5)* **(Shipped)**

To ensure the Server remains the absolute Source of Truth and to avoid "Ghost Data" bugs, the SDK follows a **Network-First** architecture.

* **Initialization:** Purely code-driven. The React SDK is initialized via `SkyStateProvider`; the core SDK is initialized via `createSkyStateClient()`.
* **No Runtime File Dependency:** A `skystate.json` file on disk is **not** a runtime requirement. The current CLI does not write or resolve it; generated type/config files remain future tooling.
* **The State Machine:**
  1. **Mount:** Keyed hooks return `defaultValue` / fallback from code; subsystem status is `loading` during fetch.
  2. **Fetch:** SDK hits the backend based on the resolved environment and project.
  3. **Resolution (Success):** keyed values update to Server Truth; subsystem status becomes `ready`.
  4. **Resolution (Failure):** keyed values stay on fallback/current optimistic state where applicable; subsystem status becomes `error` with an error object.

### 1.2 Progressive Complexity Model **(Planned)**

* **~80% of use cases (Casual Sync):** Developers pass plain objects to the setter. They get Last-Write-Wins semantics effortlessly.
* **~15% of use cases (Atomic Operations):** Developers import lightweight modifier functions (`increment`, `decrement`) for safe concurrent math without learning RFC 6902.
* **~5% of use cases (Power Users):** Developers write raw JSON Patch arrays for complex state machines using the supported `add`, `remove`, and `replace` operations.

> **Implementation note:** User-level state APIs and SDK hooks are now shipped, but the current SDK setter is narrower than this future model. It supports top-level keyed `set()` behavior, with a public `clear(key)` verb for confirmed keys (backed internally by the untyped `set(key, undefined)` core engine path), and sends one JSON Patch operation per queued keyed intent. Modifier sentinels, raw patch arrays, nested setter routing, and atomic math remain planned.

---

## 2. State Levels & Architecture **(Partially Shipped - Public and User shipped)**

| Level | Writers | Mutability | Storage Model | Concurrency Strategy | Version | Status |
| --- | --- | --- | --- | --- | --- | --- |
| **Public / Project** | Developer bearer or project API key | Read anonymously; write via developer/API-key surfaces | Versioned Blob | `If-Match` guarded PUT/PATCH | V1 | **Shipped** |
| **User** | Authenticated end user; developer inspection | Mutable top-level keyed state | Versioned Blob w/ patch updates | Version-guarded PATCH, optimistic SDK queue, conflict refetch/replay | V2 | **Shipped** |
| **Session** | Multiple users | Mutable Sync | Shared Blob (in-memory/Redis) | LWW, atomic modifier ops | V3 | **Planned** |

**Note on User-level concurrency (V2):** The default User-level behavior is effectively "last PATCH wins" between successful writes. JSON Patch `test` operations are not supported; clients that need conflict protection must use the endpoint version guard and retry against the latest state after a mismatch.

---

## 3. Authentication **(Partially Shipped - hosted auth shipped, BYOA planned)**

SkyState provides a **default hosted authentication path** for developers who don't have an existing auth solution, and will support a **bring-your-own-auth (BYOA) path** in a future release for developers who do.

### 3.1 Default Hosted Auth **(Shipped)**

SkyState ships a hosted sign-in flow built on **Google Cloud Identity Platform (GCIP)**, the managed multi-tenant tier of Firebase Authentication. End-users sign in with **Google or GitHub**, and SkyState issues its own scoped tokens on top. This is the zero-config path for developers who want authenticated user state without running any identity infrastructure of their own. Auth is not required for anonymous public-state reads.

**Identity isolation.** Each SkyState account has its own GCIP tenant, provisioned when the developer enables end-user auth for a project. The sign-in page reads the ready tenant; there is no request-path fallback provisioning. End-users sign in against that tenant, so a sign-in obtained for one account's project cannot be used against another account's. Developer sign-in (console and CLI) and end-user sign-in (SDK) run on separate Firebase projects.

**Branded sign-in page.** The page is SkyState-hosted but per-project branded: the developer sets the project name, a logo, and primary/surface/background colors, and chooses which of Google and GitHub to offer. End-users see the developer's branding.

**How it works:**

1. The developer enables end-user auth for a project, picks the providers (Google, GitHub), sets branding, and registers callback URLs.
2. The app calls `useStatus().auth.loginWithRedirect()` from the React SDK, or the equivalent core SDK token-exchange flow.
3. The browser navigates to SkyState's hosted sign-in page at `{authFrontUrl}/authorize` with `client_id`, `scope=env:{environment}`, and PKCE parameters. The page is a static single-page app served by Firebase Hosting; it reads those parameters from its URL, classifies the flow locally from `client_id` (the developer flow is fetch-free), and for end-user clients fetches `GET /v1/auth/authorize/context` over CORS. The GCIP tenant is provisioned at step 1 and is always ready; the context response supplies it, and the page renders the project's branding and allowed providers.
4. The end-user signs in with Google or GitHub against the account's tenant. The API verifies the resulting Firebase ID token, confirms it carries the account's tenant, and issues a one-time authorization code.
5. The SDK exchanges the code at `/auth/token` for a scoped SkyState access token and a database-backed refresh token, stores the refresh token through its configured `AuthTokenStorage`, and keeps the active session in memory.
6. End-user requests call `/{accountId}/projects/{slug}/user-state/{env}` with `Authorization: Bearer {accessToken}`.
7. The backend validates the SkyState token and scopes access by account, project, environment, and the end-user's opaque id. The same human resolves to a distinct end-user id in each project.

**Developer onboarding:** Create a SkyState project, choose providers and branding, register callback URLs, then call `loginWithRedirect()`. No Firebase or GCIP config on the developer's end, no JWKS registration, no key management, and no custom backend for the hosted path.

#### React Auth Surface **(Shipped)**

The SDK exposes auth through `useStatus().auth`, not a `SkyStateLogin` component. Applications render their own button or menu and call `loginWithRedirect()`.

```tsx
import { useStatus } from '@skystate/react'

function Login() {
  const { auth } = useStatus()

  if (auth.status === 'authenticated') {
    return <button onClick={auth.logout}>Log out</button>
  }

  return <button onClick={() => void auth.loginWithRedirect()}>Log in</button>
}
```

The `SkyStateProvider` accepts `callbackUrl` and `onLoginComplete` for redirect handling.

### 3.2 BYOA Path (V3) **(Planned)**

For developers who already use Clerk, Supabase, or a custom auth stack, SkyState will support direct token validation against the developer's auth provider.

**Planned approach:**

1. The developer registers their auth provider's JWKS URL (or uploads a public key) in the SkyState console.
2. The client passes the provider-issued JWT when connecting to SkyState.
3. SkyState verifies the JWT signature against the registered keys.
4. SkyState extracts a configured `user_id` claim from the token.

This path is **not shipped**. The current token validation layer is backed by Google Cloud Identity Platform; arbitrary external JWKS validation remains planned.

### 3.3 SDK Token Storage **(Shipped)**

The SDK uses a pluggable `AuthTokenStorage` adapter for refresh-token persistence. The default in-browser adapter writes to `localStorage`; consumers may pass a custom adapter (for example for React Native, Node, or test harnesses). A `createMemoryStorage()` helper exists for tests.

**Storage policy.** Durable storage is preferred but not required for an active session.

- **Reads.** Storage is read once at SDK construction. Refresh and authenticated-request paths use the in-memory token; storage is not read on every refresh.
- **Writes.** Storage is written when a refresh token is created or replaced (PKCE exchange, `setAuthTokens()`, and refresh-token rotation). If a refresh response omits a replacement refresh token, the SDK keeps the current in-memory refresh token and does not write storage.
- **Construction-time read failure.** If the storage read at construction throws or returns no token, the SDK starts unauthenticated. The SDK does not fabricate an in-memory session out of nothing.
- **Write failure during token set.** If `setAuthTokens()` (or PKCE) cannot persist, the SDK still updates in-memory state so the active tab keeps working. A failed token-persist is not an error: it does not reach `onError` or the health facet (there is no `storage_write_failed` code), and instead the authenticated auth snapshot reports `sessionPersisted: false`. Reload or a new tab requires re-authentication.
- **Logout.** `clearAuthTokens()` clears in-memory state and best-effort removes the storage row; storage exceptions on clear are swallowed.

This keeps user-state and other authenticated operations available even when localStorage is blocked (private mode, quota exceeded, custom adapter rejects). The `sessionPersisted: false` flag on the authenticated auth snapshot signals that the session will not survive a reload.

**Threat profile.** `localStorage` is JS-readable, so any XSS in the consumer app can read the refresh token. This matches the default Firebase Web SDK threat profile and is acceptable for the current SkyState target audience (developer tooling and pre-production apps). Consumers who need a higher bar can supply their own `AuthTokenStorage`.

**Cookie-backed refresh (deferred).** A future storage/transport mode could move the refresh token to an `HttpOnly; Secure; SameSite` cookie, removing JS read access. Deferred because:

- The SkyState SDK is consumed from arbitrary app origins calling `api.skystate.io`. Cross-site cookie support is increasingly restricted by browsers (third-party cookie blocking).
- Cookie-backed refresh requires either a per-app backend-for-frontend, per-consumer custom domains, or fetch credentials plus CORS configuration, plus CSRF protection. None of that fits the zero-config developer story today.
- Refresh-token rotation, reuse detection, and short lifetimes are related hardening levers. The current SDK can adopt and persist rotated refresh tokens, but cookie-backed refresh remains deferred.

When SkyState gains a hosted auth subdomain that is same-site with consumer apps, cookie-backed refresh becomes a realistic addition.

---

## 4. API (Server-Side) **(Partially Shipped - public and user state shipped)**
tagline: the API is honest, the SDK is ergonomic.

### 4.0 Route Organization **(Shipped)**

Routes are grouped by authentication boundary. The canonical route shape is `/{accountId}/projects/{projectId}/...` for project-scoped authenticated endpoints and `/readonly/{accountId}/projects/{projectId}/...` for anonymous readonly endpoints.

#### Route groups

| Prefix | Auth | Consumers |
|---|---|---|
| `/{accountId}/projects/{projectId}/public-state` | Developer bearer or API key | CLI, console, API-key scripts |
| `/{accountId}/projects/{projectId}/user-state` | End-user bearer | SDK end-user reads and writes |
| `/{accountId}/projects/{projectId}/user-states` | Developer bearer | Console/CLI user-state inspection and delete |
| `/readonly/{accountId}/projects/{projectId}/public-state/{env}` | Anonymous | SDK public-state reads |
| `/readonly/{accountId}/projects/{projectId}/auth/end-user/config` | Anonymous | Hosted auth page configuration |
| `/{accountId}/projects`, `/account`, `/billing` | Developer bearer | Console, CLI |
| `/api-key` | API key | SDK metadata lookups |
| `/auth/*` | Anonymous | Token exchange, PKCE, refresh |
| `/webhooks/creem` | HMAC-SHA256 (`creem-signature` header, Creem dashboard webhook secret) | Creem |
| `/health` | Anonymous | Infrastructure |

#### Identifiers

The API no longer uses GUID-keyed project admin routes or separate account/project slug route pairs.

- **Account identifier:** `accountId` is the public account route identifier and must match `acc_[0-9A-Za-z]+`.
- **Project identifier:** `projectId` is the canonical slug-like project identifier used in SDK configuration and API paths.
- **Slug uniqueness:** Project slugs are unique per account, not globally; two accounts may each own a project with the same slug. `POST /{accountId}/projects` with a slug already used in the same account returns `400 { error: "validation_error", message: "A project with this slug already exists" }`.
- **Project management:** Project list/create/show/delete and API-key/auth settings live under `/{accountId}/projects`.
- **No GUID bridge:** There is no implemented `/projects/by-slug/{slug}` backend endpoint.

The console and CLI may display a human-facing `slug`, but API calls use the account route identifier plus canonical project identifier.

#### Public state endpoints

Base: `/{accountId}/projects/{projectId}/public-state`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/{env}` | Fetch latest state with version, comment, size. |
| `PUT` | `/{env}` | Full replace. Requires `If-Match`. |
| `PATCH` | `/{env}` | JSON Patch apply. Requires `If-Match`. |
| `GET` | `/{env}/versions` | List version history. |

#### User state endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/{accountId}/projects/{projectId}/user-state/{env}` | End-user | Fetch caller's state. |
| `PATCH` | `/{accountId}/projects/{projectId}/user-state/{env}` | End-user | Apply JSON Patch to caller's state. |
| `GET` | `/{accountId}/projects/{projectId}/user-states/{env}` | Developer | List end-user states (paged). |
| `GET` | `/{accountId}/projects/{projectId}/user-states/{env}/{endUserId}` | Developer | Fetch one end-user's state. |
| `DELETE` | `/{accountId}/projects/{projectId}/user-states/{endUserId}` | Developer | Delete all environments for one end user in the project. |

#### Rationale

Anonymous reads live under `/readonly/` so response shape, `Cache-Control`, and rate-limit treatment (anonymous reads are not rate limited) stay cleanly split from authenticated traffic. The prefix is also CDN-ready: fronting `/readonly/` with a CDN later is a URL-map change, not a code change.

Future V2/V3 additions (`/session/*`, end-user WebSocket channels) are planned but not shipped.

### 4.1 Environment Resolution *(Revised in V2.10)* **(Shipped - simplified)**

The SDK accepts the target environment as a direct string prop rather than a resolver function.

**Shipped API:**

```tsx
// Core SDK
const client = createSkyStateClient({
  account: 'my-account',
  project: 'my-app',
  environment: 'production',
});

// React SDK
<SkyStateProvider account="my-account" project="my-app" environment="production">
  <App />
</SkyStateProvider>
```

**Original spec (not shipped):**

The original design called for a resolver pattern where the core SDK accepts `resolveEnvironment: () => 'development' | 'staging' | 'production'` as a required option, and framework SDKs provide built-in default resolvers. This was simplified during implementation to a direct string prop.

### 4.2 Public State (V1) **(Shipped)**

The project-level public-state layer ships under `/{accountId}/projects/{projectId}/public-state`. See Section 4.0 for routes and Section 4.7 for the full contract matrix.

**Environments.** Fixed enum, same across tiers:

| Tier | Environments |
|------|--------------|
| Free, Hobby, Pro | `development`, `staging`, `production` |

**Cache-Control on anonymous reads:**

| Environment | TTL |
|---|---|
| `development` | 10s |
| `staging` | 10s |
| `production` | 900s (15 min) |

**Per-minute rate limits** (every environment; blocked requests return `429` before handler execution):

| Auth / request shape | Limit | Partition |
|---|---|---|
| Anonymous auth endpoints (`/v1/auth/*`, `/v1/auth/dev/*`) | 1000 req/min shared | One global bucket for all callers |
| Anonymous or unrecognized auth scheme elsewhere | Not rate limited | None |
| API key | 120 req/min | API key token |
| Bearer token | 120 req/min | Bearer token |

Rate-limit rejections return the JSON `ErrorResponse` envelope with
`error: "rate_limited"` and `message: "Rate limit exceeded. Try again later."`. The response has
`Content-Type: application/json` and `Retry-After: 60`.

**Monthly quota** (metered per account/project on authenticated state route groups, separate from per-minute limits; `402 Payment Required` on exceed):

| Tier | API requests / month |
|---|---|
| Free | 25,000 |
| Hobby | 250,000 |
| Pro | 2,000,000 |

Hard blocking currently occurs when `request_count > limit * BlockThresholdMultiplier`; the configured multiplier is `1.1`. Management routes and anonymous readonly routes are not metered by `MeteringEndpointFilter`.

**JSON Patch support.** PATCH accepts a `{ ops: [...], comment? }` body whose `ops` entries use the RFC 6902 operation shape (`op`, `path`, `value`) with a restricted op set. The body is SkyState's own envelope, not a bare RFC 6902 patch document. The batch is atomic: if any op fails validation or application, none are applied.

| Op | Supported? | Notes |
|---|---|---|
| `add` | Yes | Creates or replaces object members; inserts or appends array items; root add replaces the whole state object. |
| `remove` | Yes | Target must exist; array removal shifts later items; root remove is rejected. |
| `replace` | Yes | Target must exist; root replace replaces the whole state object. |
| `move`, `copy`, `test` | No | Rejected with `400 { error: "patch_unsupported_operation", message: "Unsupported operation ..." }`. |
| `increment`, `decrement` | Planned (V2+) | See Section 4.5. |

**Version guard.** Creating writes use `If-None-Match: *`; updates use `If-Match` with a quoted positive integer that must match the current server version exactly. `If-Match: "0"` never represents a resource version and returns `412 Precondition Failed`. A false precondition returns `412` with `{ message }`; clients updating stale state must refetch the latest state before retrying. `ETag: "N"` is returned on GET and on every write response.

**Strict writes.** Every passing PATCH writes a new version. An `If-None-Match: *` patch on a project with no stored state applies its operations to `{}`, creates version 1, and returns `200 { version: 1, ... }`. A patch against existing state at version `N` creates version `N+1` and returns `200 { version: N+1, ... }`. A lost precondition race returns `412`. There is no `204` path on PATCH; every successful PATCH returns a JSON body with the new version and an `ETag` header.

**Version retention by tier** **(Shipped):**

| Tier | Retention |
|---|---|
| Free | 0 days |
| Hobby | 5 days |
| Pro | 30 days |

At least the latest version is always retained. A background pruner runs daily and prunes eligible public-state and user-state history by tier. A payment-failure grace period is not evidenced in the current backend implementation.

SSE streaming was considered and rejected for V1 on infrastructure-cost grounds. Browser `Cache-Control` handles freshness for the read path.

### 4.3 User Level (V2) **(Partially Shipped)**

Shipped:

* `GET /{accountId}/projects/{projectId}/user-state/{env}` - Fetch the authenticated end user's latest state.
* `PATCH /{accountId}/projects/{projectId}/user-state/{env}` - Apply a restricted JSON Patch array to the authenticated end user's state.
* `GET /{accountId}/projects/{projectId}/user-states/{env}` - Developer list of end-user states, paged.
* `GET /{accountId}/projects/{projectId}/user-states/{env}/{endUserId}` - Developer fetch for one end-user state.
* `DELETE /{accountId}/projects/{projectId}/user-states/{endUserId}` - Developer delete for all environments for one end user in a project.

Planned:

* Batched key fetch such as `GET /user/state?keys=a,b,c`.
* WebSocket user-state stream.

### 4.4 Session Level (V3) **(Planned)**

* `GET /session/:id/state` - Fetch the current snapshot of the session state.
* `WebSocket wss://api.skystate.../session/:id` - Bi-directional stream for routing JSON Patches in real-time.

### 4.5 Custom Operations (V2+) **(Planned)**

The backend JSON Patch parser is planned to extend RFC 6902 with the following custom operations:

* `increment` - Atomically adds a numeric value at the target path.
* `decrement` - Atomically subtracts a numeric value at the target path.

**Edge case behavior for `increment`/`decrement`:**

* If the target path **does not exist**, the server initializes the value to `0` before applying the operation.
* If the target path holds a **non-numeric value**, the server rejects the operation with a `400 Bad Request`.

### 4.6 Error Responses **(Shipped)**

For the SDK-level mapping of HTTP statuses to error codes and drain behavior, see [Section 8.5 SDK Error Model](#85-sdk-error-model-shipped).

Server response status summary:

| Status | Condition |
|---|---|
| `400` | Missing or malformed `If-Match`, invalid JSON body, unsupported JSON Patch op, state > 256 KB, invalid route format |
| `401` | Missing, malformed, or expired auth token |
| `402` | Monthly API request quota exceeded, or resource tier limit exceeded |
| `403` | Caller is authenticated but not allowed to access this resource |
| `404` | URL path did not resolve: unknown account, unknown project, missing resource, or route not found. Also returned for owner-blind cross-account resources. |
| `408` | Client failed the request-body timeout / minimum data rate while the body was being read, on endpoints whose body reader does not handle the timeout error itself; body is `{ error: "request_timeout", message: "Request body was not received in time" }`. Exception: `POST /v1/auth/token` reads its form itself and catches the timeout error, answering an RFC 6749 `400` `invalid_request` OAuth body, never this `408`. |
| `412` | `If-Match` precondition failed (version mismatch, stale, or ahead) |
| `413` | Request body exceeds the server's request-size limit, on endpoints whose body reader does not handle the oversize error itself; body is `{ error: "payload_too_large", message: "Request body too large" }`. Exception: `POST /v1/auth/token` reads its form itself and catches the oversize error, answering an RFC 6749 `400` `invalid_request` OAuth body, never this `413`. |
| `415` | Request `Content-Type` is not `application/json` on a JSON-bound endpoint; body is `{ error: "unsupported_media_type", message: "Content-Type must be application/json" }`. Exception: `POST /v1/auth/token` accepts `application/x-www-form-urlencoded` per RFC 6749 and answers a JSON `Content-Type` with a `400` OAuth error body, never this `415`. |
| `429` | Per-minute rate limit exceeded |
| `5xx` | Server error |

**`QuotaResponse` body (402):**

| Field | Type | Notes |
|---|---|---|
| `code` | `string` | `QUOTA_API_REQUESTS`, `QUOTA_PROJECTS`, `QUOTA_API_KEYS`, `QUOTA_END_USERS` |
| `message` | `string` | Human-readable. |
| `resource` | `string` | `api_requests`, `projects`, `api_keys`, `end_users` |
| `current` | `long` | Current count. |
| `limit` | `long` | Effective cap. |
| `resetAt` | `string?` | ISO 8601 for monthly quotas; null for resource limits. |

Project API key creation is capped at 5 active keys per project. Revoked keys do not count toward the cap. Creating a 6th active key returns `402 Payment Required` with `code: "QUOTA_API_KEYS"`, `resource: "api_keys"`, `current: 5`, `limit: 5`, and `resetAt: null`.

204 No Content is used for read success with no row yet (empty state) and is not an error. See Section 4.7.

**`ErrorResponse` body (400, 404, and selected 4xx/5xx responses):**

| Field | Type | Notes |
|---|---|---|
| `error` | `string` | Machine-readable lower-snake error code, for example `validation_error`, `patch_path_not_found`, or `webhook_invalid`. |
| `message` | `string` | Human-readable description for logs and UI copy. |

### 4.7 Endpoint Response Matrix **(Shipped)**

Authoritative request/response permutations per endpoint. Rows assume auth and rate-limit checks passed; for those, see Section 4.6.

Common auth/slug resolution errors apply to every authenticated endpoint below:

| Auth | accountId | projectId | Status |
|---|---|---|---|
| Bearer or API key | mismatch (not caller's account) | * | `404` |
| Bearer | valid | does not exist | `404` |
| Bearer or API key | valid | exists, wrong account | `404` |
| API key | valid | same account, wrong key scope | `403` |
| API key | valid | does not exist | `404` |
| Bearer or API key | valid | invalid env | `400` at route-format filter for malformed/unknown env; service-level invalid env maps to `404` where reached |

#### GET `/{accountId}/projects/{projectId}/public-state/{env}`

| Server state | Status | Body | Headers |
|---|---|---|---|
| No row | `204` | | |
| Has state vN | `200` | `{ version, state, comment, createdAt, stateSizeBytes }` | `ETag: "N"` |

#### PUT `/{accountId}/projects/{projectId}/public-state/{env}`

Body: `{ state: {...}, comment? }`. `state` must be a JSON object. Enforced max size: 256 KB.

Raw API callers use `If-None-Match: *` for create-only writes and a quoted positive `If-Match` version for updates.

| Write precondition | Server state | Status | Body | Headers |
|---|---|---|---|---|
| absent | * | `400` | `{ error: "validation_error", message: "If-Match or If-None-Match header is required" }` | |
| any (`Content-Type` not `application/json`) | * | `415` | `{ error: "unsupported_media_type", message: "Content-Type must be application/json" }` | |
| `If-None-Match: *` | no row | `200` | `{ version: 1, state, comment, createdAt, stateSizeBytes }` | `ETag: "1"` |
| `If-None-Match: *` | has state vN | `412` | `{ message: "State already exists ..." }` | |
| `If-Match: "N"` (N > 0) | has state vN | `200` | `{ version: N+1, ... }` | `ETag: "N+1"` |
| `If-Match: "0"` | * | `412` | `{ message }` | |
| `If-Match: "N"` (stale or ahead) | has state vM, M != N | `412` | `{ message: "State modified since version N" }` | |
| `If-Match: "N"` (N > 0) | no row | `412` | `{ message: "No state exists at version N" }` | |
| valid | race: concurrent write | `412` | `{ message: "State modified ..." }` | |
| `If-Match: "abc"`, `"-1"`, or `"*"` | * | `400` | `{ error: "validation_error", message: "If-Match must be a non-negative integer" }` | |
| valid | * | `400` | `{ error: "validation_error", message: "State must be a JSON object..." }` (body state not an object, null, or array) | |
| any | * | `400` | `{ error: "validation_error", message: "Request body must be an object..." }` | |
| valid | * | `400` | `{ error: "validation_error", message: "Config value exceeds the maximum size..." }` | |

#### PATCH `/{accountId}/projects/{projectId}/public-state/{env}`

Body: `{ ops: [...], comment? }` where each `ops` entry uses the RFC 6902 operation shape (`op`, `path`, `value`) restricted to `add`, `remove`, `replace`. The body is SkyState's own envelope, not a bare RFC 6902 patch document. Batch is atomic; result size capped at 256 KB.

| Write precondition | Ops | Server state | Status | Body | Headers |
|---|---|---|---|---|---|
| absent | * | * | `400` | `{ error: "validation_error", message: "If-Match or If-None-Match header is required" }` | |
| any (`Content-Type` not `application/json`) | * | * | `415` | `{ error: "unsupported_media_type", message: "Content-Type must be application/json" }` | |
| `If-Match: "abc"`, `"-1"`, or `"*"` | * | * | `400` | `{ error: "validation_error", message: "If-Match must be a non-negative integer" }` | |
| any | not a JSON object | * | `400` | `{ error: "validation_error", message: "Request body must be an object..." }` | |
| valid | ops fail engine validation | * | `400` | `{ error: "patch_*", message: <engine validation error> }` | |
| valid | ops fail at apply time | * | `400` | `{ error: "patch_*", message: <engine apply error> }` | |
| valid | valid | result > 256 KB | `400` | `{ error: "patch_state_too_large", message: "State value exceeds the maximum size..." }` | |
| `If-None-Match: *` | valid | no row | `200` | `{ version: 1, state, comment, createdAt, stateSizeBytes }` | `ETag: "1"` |
| `If-None-Match: *` | * | has state vN | `412` | `{ message: "State already exists ..." }` | |
| `If-Match: "N"` (N > 0) | valid | has state vN | `200` | `{ version: N+1, ... }` | `ETag: "N+1"` |
| `If-Match: "0"` | * | * | `412` | `{ message }` | |
| `If-Match: "N"` stale/ahead | * | vM, M != N | `412` | `{ message: "State modified ..." }` | |
| `If-Match: "N"` (N > 0) | * | no row | `412` | `{ message: "No state exists at version N" }` | |
| valid | valid | race: concurrent write | `412` | `{ message: "State modified ..." }` | |

**JSON Patch op semantics** (applies to PATCH on both public and user state):

SkyState supports the RFC 6902 operation envelope with a restricted, lowercase op set: `add`, `remove`, and `replace`. Unsupported RFC operations (`move`, `copy`, `test`), unknown operations, and uppercase or mixed-case operation names are rejected with `400`; they are never ignored. Extra fields on operation objects are ignored.

Operations are applied sequentially to a working copy and committed atomically. If any operation fails validation or application, the entire PATCH returns `400` and the persisted state remains unchanged. After all operations apply, the persisted SkyState root must be a JSON object. A patch whose final root is an array, scalar, or `null` is rejected.

Paths use JSON Pointer semantics:

| Path form | Meaning |
|---|---|
| `""` | The document root. |
| `/` | The root object's empty-string member. |
| `/a//b` | Consecutive slashes are valid and include an empty member segment. |
| `/a~1b` | Member name `a/b`. |
| `/a~0b` | Member name `a~b`. |

Malformed paths are rejected. A non-empty path must start with `/`; `~` may only appear as `~0` or `~1`; any other escape such as `~2`, `~`, or `~~` is invalid.

Object member behavior:

| Op | Path | Initial state | Result |
|---|---|---|---|
| `add` | `/key` | `{}` | `{ key: v }` |
| `add` | `/key` | `{ key: old }` | `{ key: v }` |
| `add` | `/parent/key` | `{ parent: {...} }` | `parent.key = v` |
| `add` | `/parent/key` | `{ a: 1 }` (no `/parent`) | `400 "Parent path /parent does not exist..."` |
| `remove` | `/key` | `{ key: v }` | `{}` |
| `remove` | `/nonexistent` | `{ a: 1 }` | `400 "Path /nonexistent not found..."` |
| `replace` | `/key` | `{ key: v1 }` | `{ key: v2 }` |
| `replace` | `/nonexistent` | `{ a: 1 }` | `400 "Path /nonexistent not found..."` |
| `add` | `/a/b` | `{ a: 42 }` | `400 "Parent path does not exist..."` |

Array behavior:

| Op | Path | Initial state | Result |
|---|---|---|---|
| `add` | `/arr/0` | `{ arr: ["b"] }` | `{ arr: [v, "b"] }` |
| `add` | `/arr/1` | `{ arr: ["a"] }` | `{ arr: ["a", v] }` |
| `add` | `/arr/-` | `{ arr: ["a"] }` | `{ arr: ["a", v] }` |
| `add` | `/arr/2` | `{ arr: ["a"] }` | `400 "Array index 2 out of bounds..."` |
| `remove` | `/arr/0` | `{ arr: ["a", "b"] }` | `{ arr: ["b"] }` |
| `replace` | `/arr/0` | `{ arr: ["a"] }` | `{ arr: [v] }` |
| `replace` | `/arr/-` | `{ arr: ["a"] }` | `400` (`-` is only valid for `add`) |
| `remove` | `/arr/-` | `{ arr: ["a"] }` | `400` (`-` is only valid for `add`) |
| `add` | `/arr/01` | `{ arr: [] }` | `400` (array indexes must be `0` or a non-zero digit followed by digits) |
| `add` | `/arr/-1` | `{ arr: [] }` | `400` (negative indexes are invalid) |
| `add` | `/arr/0` | `{ arr: "string" }` | `400 "Parent path does not exist..."` |

Array indexes are zero-based. `add` inserts before an existing element, appends at index equal to the array length, and also appends with `-`. `replace` and `remove` require an existing numeric index.

Root behavior:

| Op | Path | Initial state | Result |
|---|---|---|---|
| `add` | `""` | `{ a: 1 }` -> `{ b: 2 }` | `{ b: 2 }` (wholesale replacement) |
| `replace` | `""` | `{ a: 1 }` -> `{ b: 2 }` | `{ b: 2 }` (wholesale replacement) |
| `remove` | `""` | `{ a: 1 }` | `400 "Cannot remove document root"` |
| `add` / `replace` | `""` | `{ a: 1 }` -> `[1, 2, 3]` or `"x"` | `400 "Patch result must be a JSON object..."` |

Op validation errors (pre-apply):

| Case | Error message |
|---|---|
| Empty operations array | `Operations array must not be empty` |
| Unsupported op (`test`, `move`, `copy`, unknown) | `Unsupported operation 'X'. Supported operations: add, remove, replace` |
| Uppercase or mixed-case op (`ADD`, `Replace`) | `Unsupported operation 'X'. Supported operations: add, remove, replace` |
| Path null or non-empty without leading `/` | `Path must start with '/' but got 'X'` |
| `add` without value | `Operation 'add' requires a value` |
| `replace` without value | `Operation 'replace' requires a value` |

#### GET `/{accountId}/projects/{projectId}/public-state/{env}/versions`

| Server state | Status | Body |
|---|---|---|
| No row | `200` | `[]` |
| Has state | `200` | `[{ version, state, comment, createdAt, stateSizeBytes }, ...]` descending |

#### GET `/readonly/{accountId}/projects/{projectId}/public-state/{env}` (anonymous)

| Server state | Status | Body | `Cache-Control` |
|---|---|---|---|
| Has state vN | `200` | `{ version, lastModified, state }` | `public, max-age=900` (prod) / `max-age=10` (dev, staging) |
| No row | `204` | | |
| Invalid route format | `400` | `{ error: "validation_error", message }` | |
| Unknown account or project | `404` | `{ error: "not_found", message: "Resource not found" }` | |

#### GET `/readonly/{accountId}/projects/{projectId}/auth/end-user/config` (anonymous)

| Server config | Status | Body |
|---|---|---|
| End-user auth row exists, `Enabled = true` | `200` | `{ project_name, logo_data?, logo_media_type?, primary_color, surface_color, bg_color, allowed_idps }` |
| End-user auth row exists, `Enabled = false` | `404` | `{ error: "not_found", message: "Auth configuration not found" }` |
| No end-user auth row | `404` | `{ error: "not_found", message: "Auth configuration not found" }` |
| Invalid route format | `400` | `{ error: "validation_error", message }` |
| Unknown account or project | `404` | `{ error: "not_found", message: "Auth configuration not found" }` |

#### GET `/{accountId}/projects/{projectId}/user-state/{env}` (end-user bearer)

| Resolution | Server state | Status | Body | Headers |
|---|---|---|---|---|
| Account/project/env route scope resolves | No row for userId | `204` | | |
| Account/project/env route scope resolves | Has state | `200` | `{ version, state }` | `ETag: "N"` |
| Account/project/env route scope does not resolve | * | `404` | `{ error: "not_found", message: "Resource not found" }` | |
| No / invalid auth | * | `401` | | |

#### PATCH `/{accountId}/projects/{projectId}/user-state/{env}` (end-user bearer)

Same write-precondition contract and JSON Patch op set as public PATCH. Response body is `{ version, state }` only (no `comment`, `stateSizeBytes`).

| Write precondition | Ops | Server state | Status | Body | Headers |
|---|---|---|---|---|---|
| absent / malformed / not object | * | * | `400` | `{ error, message }` | |
| any (`Content-Type` not `application/json`) | * | * | `415` | `{ error: "unsupported_media_type", message: "Content-Type must be application/json" }` | |
| `If-None-Match: *` | valid | no row | `200` | `{ version, state }` | `ETag: "1"` |
| `If-None-Match: *` | * | has state vN | `412` | `{ message }` | |
| `If-Match: "N"` (N > 0) | valid | has state vN | `200` | `{ version, state }` | `ETag: "N+1"` |
| `If-Match: "0"` | * | * | `412` | `{ message }` | |
| mismatch | * | * | `412` | `{ message }` | |

#### GET `/{accountId}/projects/{projectId}/user-states/{env}` (developer bearer)

Paged listing of end-user states. Query params: `limit`, `cursor`.

| limit | cursor | Server state | Status | Body |
|---|---|---|---|---|
| absent | absent | No rows | `200` | `{ items: [], cursor: null, hasMore: false }` |
| absent | absent | Fits in one page | `200` | `{ items: [{ endUserId, version, state, updatedAt }, ...], cursor: null, hasMore: false }` |
| absent | absent | Multi-page | `200` | `{ items: [...], cursor: "<opaque>", hasMore: true }` |
| `n` | `<opaque from prior page>` | Next page exists | `200` | `{ items: [...], cursor: "<opaque or null>", hasMore: <bool> }` |
| * | malformed | * | `400` | `{ error: "validation_error", message: "<cursor parse error>" }` |

#### GET `/{accountId}/projects/{projectId}/user-states/{env}/{endUserId}` (developer bearer)

| User state | Status | Body | Headers |
|---|---|---|---|
| No row for userId | `204` | | |
| Has state | `200` | `{ version, state }` | `ETag: "N"` |

#### DELETE `/{accountId}/projects/{projectId}/user-states/{endUserId}` (developer bearer)

Deletes all environments for one end user inside the project.

| User state | Status | Body |
|---|---|---|
| One or more rows deleted | `204` | |
| No rows for userId | `404` | `{ error: "not_found", message }` |
| Invalid external user id | `400` | `{ error: "validation_error", message }` |

---

## 5. SDK Design **(Partially Shipped - Core + React public/user state shipped)**

### 5.1 Cross-Platform Principle **(Shipped)**

Because the protocol is standard HTTP, WebSockets, and JSON, SDKs can be built for any language. Each SDK wraps the same wire protocol with the host platform's native reactivity or event model.

However, a good SDK is far more than JSON serialization. Each platform requires meaningful engineering for connection lifecycle management, reconnection with backoff, optimistic update buffering, and thread marshalling (e.g., Unity must dispatch WebSocket callbacks to the main thread). These are not trivial to port.

### 5.2 SDK Roadmap

**React SDK - Public State** **(Shipped)**

Keyed public-state hooks return `{ value }`; operational loading and error state are exposed via `useStatus().health`.

```tsx
// App.tsx
<SkyStateProvider account="acc_example" project="my-app" environment="production">
  <App />
</SkyStateProvider>
```

```tsx
// Component.tsx
const { value } = usePublicState<boolean>('maintenance', false);
const { health } = useStatus();

if (health.status === 'loading') {
  return <Spinner />;
}

if (health.status === 'error') {
  return <ErrorMessage error={health.error} />;
}
```

Public-state SDK reads are anonymous and read-only. Writes happen through the console, CLI, or authenticated/API-key API calls. The current SDK fetches on initialization and retries after recoverable load errors; it does not implement an explicit `visibilitychange` refetch listener.

**React SDK - User State** **(Shipped)**

Keyed user-state hooks return `{ value, set, clear, syncStatus, draft }`. Operational loading/error status comes from `useStatus().health`, and auth status plus login/logout actions come from `useStatus().auth`.

* `clear()` removes the key; the displayed value reverts to the fallback passed to the hook.
* `syncStatus` is the origin of the displayed value: `'unset'` means the caller's default is showing, `'syncing'` means a write is queued but not yet confirmed by the server, `'synced'` means the server has confirmed the current value.

```tsx
const { auth, health } = useStatus()
const { value: theme, set: setTheme, clear: clearTheme, syncStatus, draft } = useUserState<string>('theme', 'dark')

if (auth.status !== 'authenticated') {
  return <button onClick={() => void auth.loginWithRedirect()}>Log in</button>
}

if (health.status === 'loading') {
  return <Spinner />
}
```

Current setter behavior is intentionally narrow:

* Keys are top-level state keys only. They must be non-empty strings and cannot contain `/` or `~`.
* `set(value)` enqueues an optimistic update and sends a single `add` operation for that key.
* The public `clear(key)` verb (`userState.clear(key)` in `@skystate/core`, the hook's `clear()` in `@skystate/react`) clears a confirmed key and enqueues a `remove` operation. No typed public setter signature accepts `undefined`; the core engine's untyped `set(key, undefined)` clear path stays internal, reachable only through `clear()`.
* The SDK sends `{ ops: [op] }` with `If-Match` and drains queued intents in order.
* `draft` exposes `displayValue`, `isPending`, `set`, `save`, and `discard` for local staged edits.
* `412` conflicts trigger refetch/replay. A write failure retries forever with capped jittered backoff unless the server returns one of three legible verdicts: a content verdict (`400` with a recognized `patch_*` body) drops that intent and moves to the next queued write; an identity verdict (`401`/`403` after a token refresh) resets - the queue, optimistic value, and drafts are cleared, the identity epoch bumps, and the state snapshot goes `unloaded`; a billing verdict (`402`) keeps all queued work and paces retries at a slower quota interval without resetting.
* A `2xx` PATCH response is never resent or rolled back once committed. If its body cannot be trusted (malformed JSON, a non-object root, or a missing `ETag`), the SDK still preserves the optimistic value - it bakes the already-sent operation into its local copy of server state, clears the stored version so the next write forces a `412` and reconciles the real version lazily, surfaces a `protocol` error, and marks the key's `syncStatus` as `synced`.

**SDK v1 value-only metadata contract** **(Shipped)**

SDK consumers receive value-facing state, not server metadata:

* `@skystate/core` snapshots expose `status`, `data`, and `error` for public/user state.
* keyed `usePublicState(key, fallback?)` returns `{ value }`.
* keyed `useUserState(key, fallback?)` returns `{ value, set, clear, syncStatus, draft }`. `syncStatus` (`'unset' | 'syncing' | 'synced'`) is a client-side derived origin for the key's currently displayed value - it distinguishes the caller's fallback, an unconfirmed local write, and the last server-confirmed value. This is a different concept from server-side write provenance: it carries no information about who wrote the value, when, or through which channel.
* SDK v1 does not expose server-side write provenance, `version`, `meta`, ETags, or history APIs.

Version/provenance/history metadata remains internal to API responses, cache headers, ETags, conflict handling, console inspection, and CLI/API workflows.

Planned setter expansion:

* Modifier sentinels (`increment`, `decrement`).
* Mixed plain/modifier payload routing.
* Raw JSON Patch array escape hatch.
* Nested path setter routing.

**V2: Vanilla JS/TS Core Extraction** **(Shipped as `@skystate/core`)**

`@skystate/core` ships as a standalone package exposing `createSkyStateClient()`. `@skystate/react` is a wrapper over it. WebSocket lifecycle, batched key fetch, modifier routing, and raw patch routing remain planned.

**V2: Svelte SDK** **(Planned)**

Thin wrapper over the vanilla core using Svelte's reactive primitives (runes/stores). Targets an underserved, enthusiastic community with strong use-case alignment.

**V2: Vue SDK** **(Planned)**

Composable wrappers over the vanilla core. Low incremental effort after Svelte.

**V3: React/Svelte/Vue - Session-Level State** **(Planned)**

```ts
const [board, setBoard, { isLoading, error }] = useSessionState('room-1', { score: 0 })
```

#### Optional Conflict Handler (V3) **(Planned)**

```ts
const [board, setBoard, { isLoading, error }] = useSessionState(
  'room-1',
  { score: 0 },
  {
    onConflict: (serverState, attemptedPatch) => {
      // Developer decides: retry, notify user, merge, etc.
    }
  }
)
```

**Default behavior when `onConflict` is not provided:**

1. Roll back the local optimistic update to the last known server state.
2. Populate the `error` field in the hook metadata (e.g., `{ type: 'CONFLICT', serverState, attemptedPatch }`).

**Future (unscoped):**

* Godot (GDScript) - Autoload singleton, event-based. Targets indie turn-based/card game community.
* Unity (C#) - .dll package, event-based with main-thread marshalling.
* Python - Lightweight client for server-side state manipulation, IoT, or admin tooling.

---

## 6. Action Modifiers & CLI **(Partially Shipped - CLI shipped, modifiers planned)**

### 6.1 Action Modifiers (V2+) **(Planned)**

Modifiers are lightweight sentinel objects that developers import and pass into the standard setter. They abstract away JSON Patch syntax while keeping the SDK fully headless.

```ts
import { increment, decrement } from '@skystate/react' // planned export surface
```

| Modifier | Generated Patch Op | Example |
| --- | --- | --- |
| `increment(n)` | `{ op: 'increment', path, value: n }` | `setProfile({ score: increment(1) })` |
| `decrement(n)` | `{ op: 'decrement', path, value: n }` | `setProfile({ lives: decrement(1) })` |

**Modifier composition:** Modifiers can be mixed with plain values in a single setter call. The SDK generates a combined patch array containing both `replace` and atomic ops, applied as one atomic batch on the server.

```ts
// This produces a single patch array:
// [
//   { op: 'increment', path: '/score', value: 1 },
//   { op: 'replace', path: '/status', value: 'playing' }
// ]
setProfile({ score: increment(1), status: 'playing' })
```

### 6.2 Wire Format **(Planned)**

Modifier translation happens **client-side in the SDK**. By the time a message reaches the SkyState backend, it is always a standard JSON Patch array (with the custom `increment`/`decrement` ops). The backend never sees sentinel objects - it only parses one format.

This means each future SDK must reimplement the sentinel-to-patch transformation, but it keeps the backend simple and the wire protocol universal.

### 6.3 CLI Commands *(Verified V2.13)* **(Shipped)**

The CLI surface is centered on the `sky` binary. The package may still expose a `skystate` binary alias, but help text and docs should use `sky`.

| Command | Purpose | Status |
|---|---|---|
| `login` | Authenticate with the hosted developer auth flow. Stores the developer bearer session in `~/.config/skystate/token.json`. | **Shipped** |
| `logout` | Clear stored credentials. | **Shipped** |
| `status` | Account overview: account info, subscription tier, usage/billing (projects, API requests). | **Shipped** |
| `onboarding` | Guided setup and snippets. It can select/create a project and show API-key/setup instructions; it does not write repo files. | **Shipped** |
| `project list/create/show/delete` | Manage projects for the authenticated account. | **Shipped** |
| `project keys list/create/revoke` | Manage project API keys. | **Shipped** |
| `project auth ...` | Manage end-user auth settings, callback URLs, and providers. | **Shipped** |
| `state public show` | Display public-state JSON for an environment. Requires `--project <project>` and `--env <env>`. | **Shipped** |
| `state public push` | Full replace public-state JSON from file, inline JSON, or stdin. | **Shipped** |
| `state public edit` | Open current public state in `$EDITOR` and save with full replace if changed. | **Shipped** |
| `state public patch` | Update one public-state path by generating a restricted JSON Patch request. | **Shipped** |
| `state public remove` | Remove one public-state path idempotently. | **Shipped** |
| `state public diff` | Non-interactive comparison between two environments. Exits with code 3 if differences found. CI-friendly. | **Shipped** |
| `state public promote` | Copy the full diff from one environment to another after review/confirmation, via PATCH + version guard. | **Shipped** |
| `state user list/show/delete` | Developer inspection and deletion for end-user state. | **Shipped** |
| `config` | Manage CLI preferences (`set`, `get`, `list`). | **Shipped** |
| `examples` | Render SDK/API examples. | **Shipped** |
| `terms` | Accept or inspect terms/agreement state. | **Shipped** |

Commands that produce structured output accept `--format table|json|plain` where supported.

**CLI configuration and credential locations:**

| Location | Contents | Committed to repo? |
|---|---|---|
| `~/.config/skystate/token.json` | Developer bearer session written by `sky login` | No (per-developer) |
| `~/.config/skystate/config.json` | CLI preferences such as `api_url`, `default_env`, and `format` | No (per-developer) |
| `SKYSTATE_API_KEY` environment variable | Project API key for state operations and CI | No |
| `<repo>/.env.local` | Optional project API key fallback read from the current working directory | No (gitignored) |

The API base URL defaults to `https://api.skystate.io` and can be overridden via the `SKYSTATE_API_URL` environment variable or hidden `--api-url` flag. The developer token is account-scoped: a developer authenticates once and can manage projects/state for that account without re-logging in. Non-interactive API-key auth uses `SKYSTATE_API_KEY`; a bearer-token `SKYSTATE_TOKEN` environment variable is not supported.

**Project resolution:** State and project-scoped commands require or accept `--project <project>`. The current CLI does not resolve a project from repo `skystate.json`.

**Non-interactive mode:** Commands that would prompt require explicit flags in non-TTY environments. For `state public promote`, `--yes` applies all changes, `--keys <key1,key2>` filters top-level keys, and `--dry-run` shows the diff without writing.

#### `sky login` / `sky logout` **(Shipped)**

`login` opens the hosted developer auth flow in the browser, receives tokens, and stores the developer bearer session in `~/.config/skystate/token.json`. `logout` clears the stored session.

#### `sky status` **(Shipped)**

Displays the authenticated account's usage information - similar to the console usage tab. Provides a single-command snapshot of "what's my situation?" without needing to visit the console.

```
$ sky status

  email         you@example.com
  name          Your Name
  slug          your-slug
  sso provider  github
  tier          free
  projects      0/3
  api requests  0/25,000
```

#### `sky project` **(Shipped)**

Manages projects owned by the authenticated account.

```
$ sky project list

  name          My App
  slug          my-app
```

Supports `--format json` for machine-readable output.

#### `sky state public show` **(Shipped)**

Displays config keys/values as JSON for a given environment. Requires `--env <env>`. Output is JSON only - pipeable, scriptable, and unambiguous.

```
$ sky state public show --project my-app --env dev

{
  "maintenance_mode": false,
  "hero_text": "Welcome!",
  "discount_rate": 0.15
}
```

**Auth scope:** `show` uses an authenticated state endpoint and can authenticate via developer bearer or project API key, depending on the resolved state session.

#### `sky onboarding` **(Shipped)**

Guided setup. Authenticates the developer if needed, lets the developer create/select a project, and prints framework/API snippets. It does not write `skystate.json`, `.env`, `.env.local`, `.gitignore`, or app source files.

```
$ sky onboarding
✓ Authenticated as john@example.com
? Select project: my-app
✓ Project selected: my-app
```

#### `sky state public promote` *(Verified V2.13)* **(Shipped)**

Copying of public-state differences between any two environments. Promotion is **omni-directional** - any environment can be the source or target (e.g., `dev -> prod`, `prod -> staging`, `staging -> dev`).

**Safe by default.** The command shows the diff and requires confirmation unless `--yes` is passed. Every write is guarded by `If-Match` optimistic concurrency.

**Scope:** `promote` applies to project-level public state only. User-level and session-level state are scoped to users and sessions and don't promote between environments.

**Flow:**

1. CLI fetches source and target environments. It captures the target version at this point.
2. It computes a unified diff. `--keys` can restrict the diff to selected top-level keys.
3. In interactive mode it shows the unified diff and asks one confirmation to apply all computed changes.
4. In non-interactive mode, `--yes` applies all computed changes and `--dry-run` prints the diff without writing.
5. **Pessimistic write guard:** At write time, the CLI sends the captured target version back via `If-Match`. If the target environment changed since the diff was fetched, the server returns `412 Precondition Failed`. The CLI aborts with a clear message and the developer must re-run `promote` to get a fresh diff.
6. Changes are sent as a single `PATCH` request (JSON Patch array). The PATCH is atomic (see Section 4.2).

**Diff format:** Primitives and short strings use a single-line inline format: `[n/N] TYPE: 'key' → value`. Objects and long values use multi-line `+`/`-` notation. Nested object changes are shown as a single hunk. Long or deeply nested values are truncated with `...` for scannability.

```
$ sky state public promote --project my-app --from dev --to prod

--- development
+++ production

[1/2] UPDATE: 'maintenance_mode'
- false
+ true

[2/2] NEW: 'summer_sale_active' -> true

Apply all changes to production? [y/N] y

Promotion successful.
```

**CI/CD usage:**

```bash
sky state public promote --project my-app --from dev --to prod --keys summer_sale_active,discount_rate --yes --dry-run
# Preview what would change, then remove --dry-run to apply.
```

### 6.4 Console - Environment Diff Editor *(Verified V2.13)* **(Shipped)**

The console includes a public-state editor with a side-by-side diff view. It lets the developer compare the current edit buffer against another environment or version while editing the current environment.

**How it works:**

1. Pick a target environment/version to compare against the active environment.
2. The view displays two panes: the current editable buffer and a readonly comparison pane.
3. The developer edits the current buffer and saves the whole state document.
4. Saves use full `PUT` with the same `If-Match` version guard used by other public-state writes.

**What this replaces:**

* **Console promote/rollback workflows:** There is no separate console promote or rollback command. A developer can compare against another environment or prior version, then edit and save the current environment.
* **CLI promote:** Unaffected. The CLI command remains optimized for scripted promotion flows and terminal-first developers.

**Why:** A single comparison/editor flow keeps the console focused on visual inspection and explicit edits. Developers see what differs before saving the current public-state document.

#### `sky state public diff` *(Verified V2.13)* **(Shipped)**

Non-interactive, read-only comparison between two environments. Designed for CI pipelines and quick terminal checks.

```
$ sky state public diff --project my-app --from dev --to prod

[1/2] UPDATE: 'maintenance_mode'
- false
+ true

[2/2] NEW: 'summer_sale_active' → true
```

**Flags:**

| Flag | Description |
|---|---|
| `--from <env>` | Source environment (required). Accepts aliases: `dev`, `stg`, `prod`. |
| `--to <env>` | Target environment (required). Accepts aliases: `dev`, `stg`, `prod`. |
| `--keys <key1,key2>` | Compare only the specified top-level keys. |
| `--format json` | Output hunks as JSON array instead of ANSI-colored text. |

**Exit codes:** `0` if no differences, `3` if differences are found. This enables CI checks like `sky state public diff --project my-app --from staging --to prod || echo "Environments out of sync"`.

**Relationship to `promote`:** `diff` is the read-only counterpart to `promote`. Use `diff` to check; use `promote` to act. `promote --dry-run` provides similar output while exercising the promote command path without writing.

---

#### `sky state public pull` / type generation - Deferred **(Planned)**

Type generation (`skystate.d.ts`) is deferred to a later version. `sky state public show` provides visibility into current public state.

---

## 7. Concurrency & Conflict Resolution **(Partially Shipped)**

Conflicts are handled via the following hierarchy:

1. **Last-Write-Wins (LWW):** For standard successful writes that pass the version guard, the newest persisted version becomes server truth. Current SDK keyed setters generate `add` for a top-level key; future setter routing may generate `replace` for known existing paths.

2. **Optimistic Concurrency Control (OCC):** PUT/PATCH endpoints use the `If-Match` version guard (see Section 4.2). JSON Patch `test` operations are unsupported and rejected, so conflict-aware clients must retry after fetching the current version. The user-state SDK does this with refetch/replay for queued intents.

3. **Atomic Math:** The `increment`/`decrement` modifiers are planned and not implemented today.

---

## 8. Frontend SDK - Internal Mechanics **(Partially Shipped)**

### 8.1 Local Cache & Pub/Sub **(Partially Shipped)**

* **Single Source of Truth:** One shared internal cache instance per `SkyState` provider.
* **Granular Subscriptions:** Components subscribe to top-level keys. `usePublicState('maintenance')` and `useUserState('theme')` update from the core snapshot without forcing every consumer to read the whole state object.
* **Fetch Model:** The core SDK performs an HTTP fetch on initialization and caches the result in memory. Browser `Cache-Control` can prevent redundant network requests at the fetch layer, but the SDK does not currently implement explicit visibility-based refetch.
* **Implementation Note:** React hooks use `useSyncExternalStore` to subscribe to the core client instead of pushing all state through React context. This avoids context-wide re-renders and gives React concurrent-mode compatibility.

### 8.2 Network Optimization (V2+) **(Planned)**

* **Request Batching:** Planned. Collect all `useUserState` key requests within a small mount window to fire a single batched `GET` request.
* **Optimistic Updates:** Shipped. On setter call, update the local cache immediately, re-render subscribers, then send PATCH to the server if the net effect differs from the latest server-confirmed state (see §8.3 drain-time gate).
* **Rollbacks / replay:** Partially shipped. A `400` with a recognized `patch_*` body drops the rejected intent; `412` conflicts refetch and replay; every other failure - including `404`, an unexpected status, and a malformed `2xx` - keeps the optimistic queue and retries with backoff. `402` quota keeps all queued work too, pacing retries at a slower interval rather than resetting. Only an identity verdict (`401`/`403` after a token refresh) resets the queue, optimistic state, and drafts and bumps the identity epoch; there is no later resume. `onConflict` remains planned.

### 8.3 User-State Queue and Drain Contract **(Shipped)**

The core user-state controller owns a single ordered queue of top-level keyed intents.

**Queue lifecycle:**

* `set(key, value)` validates the key and JSON-serializability before enqueue.
* Signed-out writes publish one `SkyStateError('authentication', ..., 401, key)` snapshot and return without optimistic state or queue entry.
* A drain-time net-effect gate drops a value-form intent (`set` or `clear`) whose result equals the current server-confirmed state before the write is sent; no wire round-trip, no new server version, no usage counted. The gate re-evaluates on every 412-replay so post-refetch duplicates are also dropped. Same-value sets and clear-missing-key intents are dropped by this gate. The updater/apply form is excluded: it always sends, because it re-resolves against the cached `serverState` which can be stale (ordinary writes do not arm a refetch), so a result that merely looks equal to the cached base is not a server no-op; the server, at the latest version, decides.
* Accepted writes apply to `localState` immediately, append one intent, publish `ready`, and call `startDrain()`.
* `rebuildLocalState()` always derives optimistic display state by applying the current queue over `serverState`.

**Drain mode invariants:**

* Drain mode is one of `open`, `running(epoch, runId)`, or `disposed`.
* `startDrain()` starts work only when mode is `open`, the controller is not disposed, and the queue is non-empty.
* At most one `drainQueue(epoch)` run is active for the current controller epoch.
* `finishDrain(runId)` only reopens the exact run that finished and only if its epoch still matches `resetEpoch`.
* If the queue still has work after a run finishes, `finishDrain()` starts the next run.
* Every async load/write/refresh path checks the epoch; stale work exits without publishing or mutating current state.

**Retry and reset rules:**

* Failures are temporary until the server legibly proves otherwise. Retryable failures - network errors, an unexpected HTTP status (including `404`), a malformed `2xx` load response, a `400` PATCH whose body is unparseable or carries an unrecognized code, and a `retry`-disposition refresh failure - keep the head intent, publish an error snapshot, sleep (`backoffDelay()`, or `rateLimitDelay()`/`quotaBackoffDelay()` where applicable), and retry indefinitely until success, reset, or dispose.
* `402` quota publishes an error and paces retries at `quotaBackoffDelay()` without resetting; the queue is preserved and keeps draining once the pace allows.
* A stale fetch (superseded epoch, or a request with no credential to speak for it) exits the current run without publishing or resetting.
* An identity verdict - an `identity-dead` refresh disposition (a dead/replayed refresh credential), or a data-plane `401`/`403` after a token refresh whose sent idToken is still the session's current credential - resets: the queue, optimistic state, and drafts are cleared, the identity epoch bumps, and the drain exits to `open` against the stale (pre-bump) epoch it was running under. There is no later resume; a subsequent `load()` or `set()` starts a fresh drain from empty. An `identity-dead` refresh failure additionally clears tokens and resets identity state on the client auth path. A data-plane `401`/`403` whose sent idToken is no longer the current credential's (a sibling tab adopted a newer same-subject token while the request was in flight) is dropped by the session reducer as stale: no error is published, no reset, and it retries the same head intent with whatever credential is now current.
* A content verdict (a `400` PATCH response with a recognized `patch_*` body) removes the failed intent, rebuilds optimistic state, publishes the error, and continues with the next queued intent.
* A malformed `2xx` PATCH response (`committed-unverified`) is never rolled back: the write already committed server-side, so the drain bakes the already-sent operation into `serverState`, clears `version` to `null` so the next write forces a `412` reconcile, publishes a `protocol` error, removes the head intent, and continues.

**Conflict replay:**

* `412` is normal optimistic-concurrency machinery; no consumer-visible error snapshot is published for an auto-recovered conflict.
* The controller refetches user state with the same epoch and retry behavior, retrying transient, quota, protocol, and `404` refetch failures indefinitely.
* On successful refetch, `serverState` and `version` are replaced, `localState` is rebuilt by replaying the whole queue, and the head intent is retried with the new `If-Match`.
* The replay refetch stops only on an identity verdict (`401`/`403`, or a dead refresh credential) - which resets (queue, optimistic state, and drafts cleared, epoch bumped) - or a stale epoch/no-credential fetch, which exits the current run without touching drain state.

**Reset and dispose invariants:**

* `resetForIdentityChange()` increments `resetEpoch`, clears queue/version/server/local/error state, resets drain mode to `open`, cancels sleepers, replaces session draft storage, force-fires keyed subscribers, and publishes `unloaded`.
* Replacing the session draft `WeakMap` structurally clears every live handle's draft slot without iterating handles.
* `dispose()` is idempotent. It sets disposed state, increments `resetEpoch`, clears runtime state, marks drain mode `disposed`, clears key subscriptions, and prevents future publishes.
* Draft-handle `dispose()` is idempotent and only removes handle listeners/key forwarders; it does not clear the draft slot unless identity reset replaces the session draft storage.

### 8.4 Payload Routing (V2+) **(Planned)**

Planned future logic for object payload setters:

1. If `payload` is an **Array**, treat it as a raw JSON Patch array and send it directly.
2. If `payload` is an **Object**, iterate over its keys:
   * If a value is a **modifier sentinel** (e.g., `increment(1)`), generate the corresponding custom op.
   * If a value is a **plain value**, generate a `replace` op.
   * Combine all generated ops into a single atomic patch array.

Current shipped logic is top-level keyed: `set(value)` on a keyed hook enqueues one `add` op at `/<key>`; the public `clear(key)` verb enqueues one `remove` op for a confirmed key.

---

### 8.5 SDK Error Model **(Shipped)**

This section is the canonical reference for the SDK error type system. The retry scenario tables in [SDK Retries & Resilience](#sdk-retries--resilience) and the HTTP response reference in [Section 4.6](#46-error-responses-shipped) link here rather than restate these rows.

#### Error codes (`SkyStateErrorCode`)

The published `SkyStateError` is a discriminated union of leaf types that a consumer narrows on `.code`; the same name is also the runtime error class, so `err instanceof SkyStateError` works and `SkyStateErrorCode` is `SkyStateError['code']`. Every leaf carries `message: string`. Server-origin leaves carry a required `httpStatus: number`; `AuthenticationError` carries `httpStatus: number | null` (null when the failure had no HTTP origin - PKCE prep, fetch threw). `RateLimitError` adds `retryAfter: number | null`. The write-adjacent leaves (`ResponseError`, `RateLimitError`, `AuthenticationError`, `TransportError`) carry `path: string | null` - the failing user-state key on a keyed write, null on a non-keyed load; `WriteError.path` is always a non-null `string`. There is no single optional `status?`/`path?` field.

The codes group by facet - health (operational, surfaces on `useStatus().health`), auth (surfaces on the auth facet), write (keyed write rejects, `onError` only), and usage (programmer misuse: misuse detected synchronously throws at the call site and stays off both surfaces; the one asynchronously-detected case - a drain-time updater validation failure - surfaces via `onError` plus a permanent health pin, see the usage-codes table below).

**Operational-health codes** (`SkyStateHealthError`) - constructed by SDK code on a load/write failure:

| Code | When emitted | `httpStatus` |
|---|---|---|
| `configuration` | `slug-http-errors.ts:23` - 404 only (unknown account/project, retried, never terminal). Every other non-2xx, including 400, falls through `classifyUnexpectedStatus` as `protocol` | 404 |
| `quota` | `fetch-outcomes.ts:280-285` - shared `classifyErrorStatus` 402 branch, used by both user-state load/patch and public-state load; paced via `quotaBackoffDelay()`, never resets | 402 |
| `rate_limited` | `fetch-outcomes.ts:158-161` - 429, shared by user-state load/patch, public-state, and the token endpoint; carries `retryAfter` | 429 |
| `server_unavailable` | `fetch-outcomes.ts:163-165` - any 5xx (transient, retried) | 5xx |
| `protocol` | `fetch-outcomes.ts:167` - unexpected non-2xx (retried); `fetch-outcomes.ts:325-369` - malformed success root or missing ETag on load (retried) or on PATCH (`committed-unverified`, write already committed); `fetch-outcomes.ts:380-416` - patch 400 whose body is unparseable or carries an unrecognized error code (`retry`-tagged, on a keyed write, so `path` = the key); `public-state-loader.ts:84-86,89-93` - malformed JSON success or invalid state root (retried) | the HTTP status |
| `no_response` | `user-state.ts:615,923`, `public-state-loader.ts:106` - fetch threw (offline, DNS, reset, timeout, CORS); no HTTP response arrived | none |
| `unsupported_media_type` | `fetch-outcomes.ts:447-456` - PATCH 415, classified from the status alone (the body is never read, so a bodyless 415 from an old server or a proxy-injected one classifies identically). A `WriteError` (`rejected` verdict, write dropped from the queue) that is nonetheless health-visible: a deterministic 415 signals system degradation (e.g. a broken proxy), not a per-request defect | 415 |

**Auth code** (`AuthenticationError`, surfaces on the auth facet / `onError`):

| Code | When emitted | `httpStatus` |
|---|---|---|
| `authentication` | `fetch-outcomes.ts:287-298` - user-state load/patch 401 or 403 (resets); `fetch-outcomes.ts:204-222` - identity-dead token refresh or exchange failure, body-only (OAuth body `invalid_grant`/`invalid_client`; a bare, body-less 401 no longer qualifies and retries instead); `user-state.ts:1019-1021` - write attempted while signed out | 401/403, or `null` for a non-HTTP origin |

**Write codes** (`WriteError`, keyed write outcomes; `path` always non-null). The `patch_*` codes surface only via `onError`; `unsupported_media_type` is the one write code that is also health-visible (see the operational-health codes table above):

| Code | When emitted |
|---|---|
| `patch_*` | server-echoed 400 patch codes (see the next table); a legible code is a `rejected`-tagged `PatchResult`, dropped from the queue |
| `unsupported_media_type` | PATCH 415, minted by SDK code from the status alone (`classifyPatchResponse`, never from a 400 body); a `rejected`-tagged `PatchResult`, dropped from the queue, and health-visible |

An unparseable or unrecognized 400 body is not a legible content verdict - it is indistinguishable from a transient proxy/gateway 400 - so it does not mint a write code at all; it mints `protocol` (see the operational-health codes table above), a `retry`-tagged `PatchResult` that keeps the intent queued and visible on `useStatus().health`.

**Usage codes** (`UsageError`, no `httpStatus`). Misuse detected synchronously throws at the call site and never touches the health or `onError` surfaces. Misuse detectable only asynchronously - a deferred functional updater that throws or resolves to a non-JSON value when re-resolved at the drain head, where there is no call site to throw at - is instead published as an `invalid_path` error snapshot (so `onError` fires) AND pinned as a permanent client-lifetime health error: `ClientSnapshot.misuse` (typed `AsyncMisuseError`, always carrying the failing key in `path`) is set once (`client.ts:204-212`) and never cleared or clobbered by later successes; only dispose/remount starts clean (nothing is persisted). The pin is a deliberate separate lane - `isHealthError` still excludes every usage code, so the sync throw path can never reach the facets:

| Code | When emitted |
|---|---|
| `missing_config` | `client.ts:35,39,43` - missing account/project/environment at construction; `auth-session.ts:81-87` - `setAuthTokens` with an idToken that fails JWT/sub validation (core-direct misuse only; the PKCE exchange call site in `index.tsx` rewraps this one as `protocol`, since there the bad token is server-issued, not programmer misuse); `auth-session.ts:348` - `setAuthTokens` without a refreshToken |
| `invalid_path` | `user-state-utils.ts:34,40` - invalid state-key format; `pointer.ts:24` - invalid JSON pointer; `user-state.ts:1035,1060` - non-JSON-serializable value (synchronous throw from `set()`); `user-state.ts:718-748` - drain-time updater validation failure (async-detected misuse: `onError` + permanent health pin, see above) |
| `missing_provider` | react - hook used outside `SkyStateProvider`, or `loginWithRedirect()` before browser init |
| `disposed` | any API call after `dispose()` |

A keyed user-state write that fails with a write-adjacent code (`authentication`, `quota`, `rate_limited`, `no_response`) is rewrapped by the `drainQueue` loop in `user-state.ts` with `path = intent.key` before publishing, so a consumer narrowing on `.code` can read which key rejected. The same code arising on a non-keyed load carries `path: null`. A `configuration` (404) constructed in `slug-http-errors.ts` carries no key at its construction site but gains one when surfaced through a user-state write.

**Server-echoed patch codes** - these appear as a `WriteError.code` on a `rejected` drain result but are never constructed by SDK code directly. The server returns them in a `400` body `{ error, message }`, and `fetch-outcomes.ts:391-416` validates the `error` field against the `patchErrorCodes` set (`fetch-outcomes.ts:105-114`) before echoing it. If the body is missing or the code is not in the set, the SDK falls back to `protocol`, which retries rather than dropping the write. This body-validation path is not the only write-code minting site: `unsupported_media_type` is minted status-only from a `415` in `classifyPatchResponse` and is deliberately absent from the `patchErrorCodes` set, so it can never be minted from a `400` body.

| Code | Server condition |
|---|---|
| `patch_invalid` | Generic patch validation failure |
| `patch_unsupported_operation` | Unsupported or unknown op |
| `patch_invalid_path` | Path does not start with `/` or fails pointer syntax |
| `patch_missing_value` | `add` or `replace` op missing `value` field |
| `patch_path_untraversable` | Path traverses through a non-object/non-array node |
| `patch_invalid_array_index` | Array index out of bounds or malformed |
| `patch_invalid_state_root` | Resulting root is not a JSON object |
| `patch_state_too_large` | Resulting state exceeds the 256 KB limit |

`patch_path_not_found` (a 400 on removing an already-absent key) is classified separately from the `patchErrorCodes` set, into an internal-only `noop` verdict tag that carries no error at all (`fetch-outcomes.ts:396-398`): the drain treats it as a benign idempotent no-op and never surfaces it, so it is not part of the published union.

#### Subsystem statuses

The `status` field on the core `PublicStateSnapshot` and `UserStateSnapshot` is a four-variant union, and the `error` variant carries a `SkyStateError`. `@skystate/react` does not re-expose per-subsystem status: the keyed hooks return value-only results, and `useStatus().health` collapses both subsystems' operational-health errors into one merged facet (`SkyStateHealthError`, or the permanent `AsyncMisuseError` pin from `ClientSnapshot.misuse`, which wins over every later loading/ok/error state; see the facet split above).

| Status | Meaning |
|---|---|
| `unloaded` | Not yet initialized or identity reset in progress |
| `loading` | Initial load in flight |
| `ready` | Data confirmed from server; subsequent writes may briefly republish `ready` with optimistic state |
| `error` | Last operation failed; `error` field carries a `SkyStateError` |

See Section 1.1 for the full lifecycle description and how the statuses transition.

#### Drain-result behavior

When the user-state queue drains, each head intent goes through `drainQueue` (`user-state.ts:712`). The table below covers both the `classifyPatchResponse` switch (`fetch-outcomes.ts:432-460`) and the narrowed `FetchResult` grammar (`fetch-outcomes.ts:19-21`) the authenticated-fetch wrapper returns before the patch response is classified.

`FetchResult`'s tags and `classifyPatchResponse`'s tags are variants of one constrained verdict union (`StateVerdict`/`RefreshVerdict`, `fetch-outcomes.ts:45-96`): each tag's error field is narrowed to exactly the codes legible for it, so a classifier cannot label a content-verdict code with a retryable tag or vice versa - the label/disposition contradiction is a compile error, not a runtime possibility. Consumers (the tables below) switch on the tag only and never re-derive a disposition from the error's code.

**`FetchResult` tags** (`authenticated-fetch.ts`, applied before HTTP classification):

| Tag | Condition | Drain behavior |
|---|---|---|
| `stale` | Generation mismatch (an identity reset already fired, so the epoch check downstream would exit anyway), or the refresh had no credential to speak for (a signed-out background nudge) | Exit current run: GET returns `'stop'`, PATCH returns without publishing |
| `auth-retry` | Refresh verdict tag `retry` (a bare `401`, `429`, `5xx`, unexpected 4xx, or the fetch itself throwing) | Publish `rate_limited`/`server_unavailable`/`protocol`/`no_response` error, backoff and retry (honoring `Retry-After` for `rate_limited`); the drain stays open and keeps using the credential |
| `ok` | Successful fetch with HTTP response | Continue to HTTP classification |

A refresh verdict tag `identity-dead` never reaches this grammar as a live-epoch `FetchResult`: the reducer dispatch that mints it resets synchronously and bumps the identity epoch, so the wrapper's post-refresh generation check already returns `stale` before any death verdict could be observed downstream.

**Patch HTTP classification** (applied when `FetchResult` is `ok`):

| Tag | HTTP trigger | Drain behavior | Error code | Queue change |
|---|---|---|---|---|
| `conflict` | `412` | Refetch user state with retry; on success rebuild local state from queue and retry head intent; no consumer error published on auto-recovery | none | Head stays |
| `rejected` | `400` with a legible `patch_*` body | Drop head intent, rebuild optimistic state, publish error, continue to next intent | `patch_*` | Head removed |
| `noop` | `400` `patch_path_not_found` (removing an already-absent key) | Server confirmed the key was already absent: drop head intent, rebuild optimistic state, no error published, continue to next intent | none (internal-only tag, no error field) | Head removed |
| `committed-unverified` | `2xx` whose body/ETag cannot be trusted (bad JSON, non-object root, missing ETag) | The write already committed server-side: bake the sent op into `serverState`, clear `version` to `null` (forces a `412` reconcile on the next write), drop head intent, rebuild optimistic state, publish error, nudge cross-tab peers, continue | `protocol` | Head removed |
| `quota` | `402` | Publish `quota` error, pace retries at `quotaBackoffDelay()`; does not reset | `quota` | Head stays |
| `authz` | `401` / `403` | The session reducer accepts the rejection only when the idToken the request was sent with is still the session's current credential's: publish `authentication` error, reset (queue, optimistic state, and drafts cleared, identity epoch bumped; no later resume). When that idToken is no longer current (a sibling tab adopted a newer same-subject token while the request was in flight), the reducer drops the rejection as stale: no error published, no reset, and the drain retries the head intent with the now-current credential | `authentication` (real only) | Head stays (stale case); cleared (real case) |
| `retry` | `404`; `400` with an unparseable or unrecognized body; unexpected non-2xx; `429`; `5xx` | Publish error, backoff and retry; the intent stays queued | `configuration` (404), `protocol` (illegible 400 or unexpected non-2xx), `rate_limited` (429), `server_unavailable` (5xx) | Head stays |
| `success` | `200` | Update server state and version, drop head intent, rebuild optimistic state, publish ready | none | Head removed |

**Drain-time poisoned `apply` head** (`user-state.ts:718-748`): if the `apply` fn throws or resolves to a non-JSON value against `serverState`, the SDK drops the head intent, rebuilds optimistic state, and publishes an `invalid_path` error with `path` = the failing key - the queue behavior matches the `rejected` row above (the drain continues; health is a signal, not a circuit breaker). Because this is async-detected misuse with no call site to throw at, the same error is also reported to the client, which pins it permanently on `ClientSnapshot.misuse` (see the usage-codes table in [Section 8.5](#85-sdk-error-model-shipped)).

#### HTTP status to result tag

**Load path** (`classifyLoadResponse`, `fetch-outcomes.ts:417-430`):

| HTTP status | `LoadResult` tag | Error code |
|---|---|---|
| `204` | `empty` | none |
| `200` (valid body) | `ready` | none |
| `402` | `quota` | `quota` |
| `401` / `403` | `authz` | `authentication` |
| `404` | `retry` | `configuration` |
| `429` | `retry` | `rate_limited` |
| `5xx` | `retry` | `server_unavailable` |
| `200` (invalid root, malformed JSON, or missing ETag) | `retry` | `protocol` |
| other non-2xx | `retry` | `protocol` |

There is no `terminal` tag: every load failure other than `quota`/`authz` retries indefinitely with backoff.

**Patch path** (`classifyPatchResponse`, `fetch-outcomes.ts:432-460`):

| HTTP status | `PatchResult` tag | Error code | Notes |
|---|---|---|---|
| `200` (valid body) | `success` | none | |
| `400` (legible patch error body) | `rejected` | `patch_*` | Dropped from the queue |
| `400` (`patch_path_not_found`) | `noop` | none | Benign; dropped from the queue with no error |
| `400` (unparseable or unrecognized body) | `retry` | `protocol` | Stays queued, retried; health-visible |
| `402` | `quota` | `quota` | Paced retry; does not reset |
| `401` / `403` | `authz` | `authentication` | Resets (real disposition only); queue cleared |
| `404` | `retry` | `configuration` | Stays queued, retried |
| `412` | `conflict` | none | Patch-path only; triggers refetch/replay |
| `415` | `rejected` | `unsupported_media_type` | Deterministic content verdict, classified from the status alone (body never read); dropped from the queue; health-visible |
| `429` | `retry` | `rate_limited` | |
| `5xx` | `retry` | `server_unavailable` | |
| `200` (invalid root, malformed JSON, or missing ETag) | `committed-unverified` | `protocol` | Write already committed; value baked into `serverState`, never rolled back; `version` cleared to `null` to force a `412` reconcile |
| other non-2xx (except `415`) | `retry` | `protocol` | Stays queued, retried |

The key differences from the load path: `412` maps to `conflict` (patch-path only), `400` splits into `rejected` (legible body, dropped), `noop` (`patch_path_not_found`, dropped with no error), and `retry` (illegible body, code `protocol`, kept queued), `415` is a status-only `rejected` content verdict (`unsupported_media_type`, dropped, health-visible), and a malformed `2xx` maps to `committed-unverified` instead of `retry` - the write already landed server-side, so it is never rolled back.

#### Error scenario matrix (consumer-facing) *(New; verified 2026-07-09)* **(Shipped)**

Every error scenario a consumer of `@skystate/react` / `@skystate/core` can face, grouped by class, describing current behavior only. Where a row's mechanics are already normative elsewhere (refresh outcomes, drain behavior, backoff), the row stays one line and the detailed table governs: see [Drain-result behavior](#drain-result-behavior) above and [SDK Retries & Resilience](#sdk-retries--resilience).

**Usage errors (programmer mistakes)**

| Scenario | Behavior | Source |
|---|---|---|
| Hook used outside `SkyStateProvider` | synchronous throw `missing_provider` at render | `index.tsx:735-738` |
| `loginWithRedirect()` without a `window` (SSR) | resolves as a no-op; no error | `index.tsx:531-534` |
| `loginWithRedirect()` before provider init built the browser config | rejects `missing_provider` | `index.tsx:536-539` |
| `createSkyStateClient` missing account/project/environment | synchronous throw `missing_config` | `client.ts:35,39,43` |
| `init`/`setAuthTokens`/`clearAuthTokens`/`logout`/`beginAuthenticate` after `dispose()` | throw `disposed` | `client.ts:285,335,368,375,382` |
| Reads, `subscribe`, `set`, `load`, `draft.set` after `dispose()` | no-op; reads return the fallback | `client.ts:390,401,405`, `user-state.ts:940-942,1011-1013,1139` |
| `set()` with a non-JSON value (NaN, Infinity, function result, cycle) | synchronous throw `invalid_path` | `user-state.ts:1024-1062` |
| `draft.set()` with a non-JSON value | accepted and staged without validation; the later `push()` throws synchronously and the draft slot is already discarded by then | `user-state.ts:1138-1154,1156-1191` |
| Updater function passed to `set(key, fn)` throws | exception propagates synchronously to the caller; state unchanged | `user-state.ts:1030` |
| Deferred updater fails validation at the drain head (throws, or resolves to a non-JSON value, when re-resolved against refetched server state) | no call site to throw at: an `invalid_path` error with `path` = key is published (`onError` fires), the write is dropped and the queue keeps draining other keys, and a permanent client-lifetime health error is pinned on `ClientSnapshot.misuse` / `useStatus().health` - never cleared by later successes, only by dispose/remount | `user-state.ts:718-748`, `client.ts:204-212`, `index.tsx` (`buildSkyStateHealth`) |
| Invalid state key (non-string, empty, contains `/` or `~`) | synchronous throw `invalid_path` from keyed hooks, `get`, `set`, `subscribe` | `user-state-utils.ts:31`, `client.ts:391`, `user-state.ts:952,989,1015` |
| Changing `account`/`project`/`environment`/`apiUrl`/`callbackUrl` props after mount | ignored; the client is built once and remount-with-key is the documented contract | `index.tsx:506,598` |
| Consumer subscribe callback throws | remaining listeners in that notify microtask are skipped; the error is unhandled | `subscribe.ts:18-23` |
| `apiKey` / `debug` provider props | accepted and currently unused | `index.tsx:520-521` |
| Core `setAuthTokens` with an empty refreshToken or an idToken without a `sub` claim | synchronous throw `missing_config` | `auth-session.ts:345,347-348` |

**Configuration and authorization**

| Scenario | Behavior | Source |
|---|---|---|
| Unknown account/project (or deleted project) on public-state load (404) | `configuration` error, retried indefinitely with standard backoff (never terminal); `useStatus().health` and `onError` observe every attempt; keyed reads keep returning the fallback with no signal | `public-state-loader.ts:71-74`, `fetch-outcomes.ts:269-274`, `slug-http-errors.ts:23` |
| Same misconfiguration via user-state 404 | `configuration` error, retried indefinitely with standard backoff (never terminal) | `fetch-outcomes.ts:269-274` |
| User-state 401/403 (token refused / scope mismatch) | `authentication` error; resets synchronously (queue, optimistic state, and drafts cleared, identity epoch bumped); no later resume, only a fresh `load()`/`set()` | `fetch-outcomes.ts:287-298`, `client.ts:180-205` |
| Sign-in service rejects the account/environment (unknown account, end-user auth disabled, unregistered callback URL, unknown environment; 404/400) | handled entirely by the hosted auth-front page's `authorize/context` fetch, which renders a not-found or fatal sign-in error; `loginWithRedirect()` only redirects the browser to `/authorize`, so nothing is written to the SDK's auth snapshot and `onError` does not fire | `index.tsx:674`, `auth-front/app/src/api.ts:83-95` |
| Wrong `apiUrl` | every request fails as `no_response` and retries; never classified `configuration` | `public-state-loader.ts:105-107` |

**Session (authentication)**

| Scenario | Behavior | Source |
|---|---|---|
| Refresh credential confirmed dead (OAuth body `invalid_grant`/`invalid_client` at any status) | permanent: tokens cleared; `useStatus().auth` becomes `unauthenticated` with `detail.reason === 'expired'` and the auth verdict in `detail.error` (full matrix in [Token refresh](#token-refresh)) | `fetch-outcomes.ts:204-222`, `auth-session.ts:214-222`, `auth-state.ts:356-367`, `client.ts:125-147` |
| No refresh token in memory when a refresh is requested | not a death verdict: `requestTokenRefresh` returns `'no-credential'` with no request made; no reducer dispatch, no generation bump, no reset, no `expiredError` - auth is already credential-less and stays that way | `auth-session.ts:236-243` |
| Malformed successful (`2xx`) refresh body (unparseable JSON, non-object root, missing/empty `access_token`, or an access token that fails JWT/sub validation) | also permanent (identity-dead, not retry - the endpoint already answered `2xx` and may have rotated the refresh token server-side): tokens cleared; `useStatus().auth` becomes `unauthenticated` with `detail.reason === 'signed_out'` and no `detail.error` since the error is `protocol`-coded, not an auth verdict; the triggering drain surfaces that error through `useStatus().health` and `onError` so the sign-out has an explanation (full matrix in [Token refresh](#token-refresh)) | `auth-session.ts:263-306`, `auth-state.ts:356-367`, `client.ts:125-147` |
| Refresh verdict tag `retry` (a bare 401, network failure, 5xx, 429, or unexpected 4xx) | single attempt per trigger; tokens preserved and auth stays `authenticated` with no auth error; the triggering drain publishes the retry error through `useStatus().health` and `onError`, keeps using the credential, and retries with backoff (full matrix in [Token refresh](#token-refresh)) | `fetch-outcomes.ts:204-222`, `auth-session.ts:166-339`, `auth-state.ts:350-355`, `client.ts:145-147` |
| Token exchange failure at the callback (non-ok, or 2xx body missing tokens) | `onError` fires with the classified error; `clearAuthTokens()` (no error argument) always runs, clearing tokens and returning auth to `unauthenticated` regardless of which code fired (full matrix in [Token exchange (PKCE)](#token-exchange-pkce)) | `index.tsx:517-577` |
| Callback with corrupt or missing PKCE session state (new tab, cleared storage, replayed link, nonce mismatch) | dev-build warning only; login silently no-ops and auth stays `unauthenticated` | `index.tsx:388-429` |
| PKCE preparation failure (crypto unavailable, insecure context, sessionStorage write throw) | `loginWithRedirect()` rejects `authentication` | `index.tsx:541-556` |
| Hosted sign-in page `authorize/context` fetch throws (offline/CORS) or returns bad params | the auth-front page classifies it as a transient (network) or fatal (bad params/redirect_uri) sign-in error and re-renders; the React SDK only redirected, so it observes nothing | `auth-front/app/src/api.ts:83-95` |
| End-user cap exhausted for the account | sign-in itself succeeds (auth routes are not metered); the over-cap user's first user-state write returns 402 `QUOTA_END_USERS` and surfaces as `quota` | `AuthExchangeEndpoints_Anonymous.cs:16-20`, `UserStateService.cs` (`CheckEndUserLimitAsync`), `fetch-outcomes.ts:279-285` |
| `set()` while signed out | no throw; one `authentication` error snapshot, no optimistic apply, no queue entry | `user-state.ts:1019-1022` |
| `draft.save()` while signed out | same error snapshot, and the draft slot is discarded | `user-state.ts:1156-1191` |
| Callback lands on a path that differs from the `callbackUrl` pathname | the PKCE code is ignored (dev-build warning only) | `index.tsx:378-385` |
| Exchange succeeds but the returned idToken has no `sub` | `setAuthTokens` throws `missing_config` after `beginAuthenticate`; the exchange call site rewraps it as `protocol`; `onError` fires and `clearAuthTokens()` returns auth to `unauthenticated` | `index.tsx:516,562-572`, `auth-session.ts:81-87,348` |
| Post-exchange cleanup fails (completed-marker sessionStorage write) | the session is established, but `onLoginComplete` is skipped and the URL keeps `?code`; `onError` fires | `index.tsx:475-481` |
| Stored tokens corrupt or unreadable at construction or via a cross-tab storage event | silently `unauthenticated`; the bad stored value is cleared | `auth-session.ts:428-445,447-456`, `auth-state.ts:242-262` |
| `onLoginComplete` callback throws | unhandled rejection (fire-and-forget initializer) | `index.tsx:697,709` |

**Transient (network and storage)**

| Scenario | Behavior | Source |
|---|---|---|
| Public initial load network/5xx/429 | subsystem `error` plus indefinite standard-backoff retry; keyed reads serve the fallback meanwhile | `public-state-loader.ts:71-74,104-138`, `retry.ts:6-11` |
| User-state load network/5xx | same indefinite retry | `user-state.ts:599-601,608-618` |
| User-state load 400 (and any other unexpected non-2xx) | classified `protocol`, retried indefinitely with standard backoff; public-state's 400/unexpected-status behaves the same way (also `protocol`, retried - no credential is ever sent, so there is no distinct configuration verdict) | `fetch-outcomes.ts:263-300` |
| Patch offline/5xx | a `no_response` error (transport) or `server_unavailable` error (5xx), `path` = key, is published on each attempt and the write retries with backoff; the keyed hook keeps showing the optimistic value with no per-key signal | `user-state.ts:867-876,916-927` |
| Token persist fails (private mode, storage quota) | session continues in-memory and the authenticated auth arm reports `sessionPersisted: false`; no error is emitted (there is no `storage_write_failed` code). A rotation-persist failure clears storage but keeps memory, so the session does not survive reload | `auth-session.ts`, `storage.ts` |
| Malformed success payload on load (non-object state root, missing ETag, unparseable JSON) | `protocol` error, retried indefinitely (never terminal) | `fetch-outcomes.ts:325-369` |
| Malformed success payload on PATCH (same conditions) | `committed-unverified`: the write already committed server-side, so the sent op is baked into `serverState`, `version` is cleared to `null` (forces a `412` reconcile), and a `protocol` error is published; the value is never rolled back | `fetch-outcomes.ts:325-369,458`, `user-state.ts:896-912` |
| 429 or 5xx from the hosted sign-in page's `authorize/context` fetch | the auth-front page treats it as transient and renders a retryable sign-in-service error; it never reaches the React SDK's `onError` | `auth-front/app/src/api.ts:87-92` |
| 429 on token exchange | classified `rate_limited`, `retryAfter` carried when present; no retry (one-shot exchange, full matrix in [Token exchange (PKCE)](#token-exchange-pkce)) | `fetch-outcomes.ts:204-222`, `index.tsx:531-535` |
| Endpoint returns 401 again after a successful refresh retry | the retried 401 is classified `authentication` and resets (a single refresh is spent per trigger) | `authenticated-fetch.ts:42-61`, `fetch-outcomes.ts:287-298` |
| Public-state 401/403 (infra/proxy misconfiguration; the endpoint is anonymous) | classified `protocol`, retried indefinitely (no credential was sent, so this cannot be a verdict; unlike user-state's `authz`, it does not reset) | `fetch-outcomes.ts:263-300` |

**Quota**

| Scenario | Behavior | Source |
|---|---|---|
| 402 on user-state load or patch | `quota` error published; the drain paces retries at `quotaBackoffDelay()` (5m-30m, jittered) without resetting - queued writes and the refetch both keep retrying at that pace; the 402 `QuotaResponse` body, including `resetAt`, is not read | `user-state.ts:596-598,867-876`, `fetch-outcomes.ts:280-285`, `retry.ts:16-21,44-52` |
| 402 on public-state load | the SDK maps it to `quota` with the same quota backoff, but the anonymous readonly route is not metered server-side, so this path is unreachable in production | `public-state-loader.ts:72,114`, `EndpointExtensions.cs:48-53` |

**Per-key write rejections**

| Scenario | Behavior | Source |
|---|---|---|
| Server rejects a patch with a `patch_*` code | error with `path` = key on the whole-subsystem snapshot; the intent is dropped and the optimistic value rolled back; keyed hooks expose no per-key field | `user-state.ts:839-844`, `fetch-outcomes.ts:399-408` |
| Patch 400 with an unparseable or unrecognized body code | retried indefinitely as `protocol` rather than dropped (indistinguishable from a transient proxy/gateway 400); the intent stays queued and the failure is now visible on `useStatus().health` | `fetch-outcomes.ts:380-383` |
| Server's `patch_path_untraversable` | in the SDK echo allowlist, so it surfaces as a `patch_path_untraversable` write error | `PatchModels.cs:16`, `fetch-outcomes.ts:105-114` |

**Handled internally (no consumer signal, by design)**

| Scenario | Behavior | Source |
|---|---|---|
| 412 write conflict | automatic refetch and queue replay; last write wins | `user-state.ts:806-828`, `fetch-outcomes.ts:433-435` |
| Logout server-revoke failure | best-effort and swallowed; local sign-out already completed | `auth-session.ts:148-164` |
| No localStorage available (SSR) | silent degrade to in-memory behavior | `storage.ts:84-99` |
| Remove of an already-absent key racing to a `patch_path_not_found` 400 | treated as a benign idempotent no-op (the internal-only `noop` verdict tag) | `user-state.ts:829-838` |

**Cross-cutting**

- Without an `onError` prop, snapshot-channel errors reach only `devWarn`, which is a no-op outside dev builds; throw-channel errors still propagate. `index.tsx:288,38`
- Keyed reads expose no per-key error or loading signal. For `usePublicState` this stays fully opaque: fallback-because-loading, fallback-because-missing, and fallback-because-broken are indistinguishable. For `useUserState`, the `syncStatus` field distinguishes a key with no stored value (`'unset'`) from a confirmed stored value (`'synced'`) and an in-flight write (`'syncing'`), but does not distinguish why a key reads `'unset'` - still loading, confirmed absent, and blocked by a broken subsystem all read as `'unset'`. `index.tsx:1027-1038`
- An `onError` handler that itself throws is not guarded. `index.tsx:279`

---

## 9. Explicitly Out of Scope (V1) **(Shipped - these remain out of scope)**

By choosing JSON Patch over Event Sourcing and CRDTs, the following use cases are unsupported by design:

* **Real-time Push (V1):** SSE/WebSocket streaming for project-level public state is out of scope for V1 due to infrastructure costs. The polling + Cache-Control model provides sufficient freshness for public-state use cases. May be revisited in future versions if demand warrants.
* **Configurable Environments:** Environments are a fixed set (development/staging/production), not user-configurable. This simplifies the data model and enables tier-based caching/rate-limiting.
* **CDN (V1):** No CDN in front of the public-state API in V1. Browser Cache-Control headers provide client-side caching. CDN is a future optimization.
* **ETag-based Conditional GETs (V1):** No `If-None-Match` / `304 Not Modified` on GET requests in V1. Full JSON response on every cache miss. Deferred to when CDN is introduced. (Note: ETags *are* used for write concurrency on the PATCH endpoint - see Section 4.2.)
* **True Offline-First Collaboration:** Long-term offline edits will overwrite online progress upon reconnection.
* **Real-time Text Editing:** Concurrent character-by-character typing in the same text field (requires CRDTs).
* **Concurrent Deep Array Reordering:** Simultaneous drag-and-drop actions on the exact same nested array elements may result in index shifting or dropped patches.
* **UI Components:** SkyState does not currently ship rendered SDK UI components. Auth is exposed through hooks/actions (`useStatus().auth`, `loginWithRedirect`, `logout`) rather than a `SkyStateLogin` component.
* **Physics / High-Frequency Sync:** SkyState is not designed for 30–60fps positional updates. WebSocket + JSON Patch introduces too much latency and bandwidth overhead for real-time physics. Developers needing this should use dedicated Netcode solutions alongside SkyState for their lobby/inventory/turn state.
* **CLI Type Generation (V1):** Generated `skystate.d.ts` type output is deferred. `sky state public show` provides visibility into current public state.

### Size Guidance

Session state blobs (V3) should be kept reasonably small. Large blobs (500KB+) will degrade performance on reconnection (full snapshot transfer) and increase patch application overhead. If your session state approaches this range, consider splitting it across multiple session keys or moving infrequently-changing data to the User level. Formal size limits will be established based on beta usage patterns.

### Data Lifecycle *(New in V2.12)* **(Partially Shipped)**

* **Project deletion:** Hard delete. All environments, public-state versions, user state, API keys, and hosted-auth settings for the project are permanently removed via cascading database delete. This is immediate and irreversible.
* **Account deletion:** Implemented via `DELETE /account` and console account settings. The API issues an immediate `POST /v1/subscriptions/{id}/cancel` to Creem before touching local data; if the remote cancellation fails, the endpoint returns 502 and local deletion does not proceed. On success, projects and account are deleted; cascades remove dependent data.
* **Subscription downgrade / limits:** New resource creation is blocked with `402 Payment Required` if the user exceeds the lower tier's limits. Existing resources and configs remain accessible. The retention pruner applies the account tier's configured retention window to version history. A 7-day payment-failure grace period is not evidenced in the current backend implementation.

---

## 10. Release Phasing

### V1 - Public State **(Shipped)**

* **Backend:** Public-state API with Cache-Control-based anonymous reads. Fixed environments (development/staging/production), per-credential per-minute rate limiting plus a shared global limit on the anonymous auth endpoints, monthly metering for authenticated state routes, and `If-Match` integer version guards on PUT/PATCH.
* **SDK:** `@skystate/core` (`createSkyStateClient`) and `@skystate/react` (`SkyStateProvider`, keyed `usePublicState`, keyed `useUserState`, and `useStatus` for the consolidated auth + health facets). Public-state SDK reads are anonymous and fetch on initialization/retry; no explicit visibility refetch is implemented.
* **Console:** Project creation, side-by-side environment comparison editor (Section 6.4), usage monitoring, account settings.
* **CLI:** `sky login`/`logout`, `status`, `onboarding`, `project ...`, `project keys ...`, `state public show|push|edit|patch|remove|diff|promote`, `config`, `examples`. Type generation deferred.
* **Use cases:** Feature flags, maintenance banners, kill switches, A/B config, remote announcements.

### V2 - User State & Hosted Auth **(Partially Shipped)**

* **Backend:** User-state APIs are shipped for end-user `GET/PATCH` and developer list/get/delete. Batched key GET, WebSockets, and custom `increment`/`decrement` ops are not implemented.
* **Auth:** Hosted PKCE auth and SkyState/Firebase-backed token exchange/refresh are shipped. BYOA remains planned.
* **SDK:** React `useStatus` and `useUserState` are shipped. Svelte and Vue SDKs remain planned.
* **Use cases:** User preferences, saved progress, inventory, profile data, persistent user state.

### V3 - Session Sync & BYOA **(Planned)**

* **Backend:** Session-level state APIs. WebSocket session sync. BYOA token validation.
* **SDK:** `useSessionState` across all frameworks. Optimistic updates, rollback, `onConflict`.
* **Auth:** BYOA support for Clerk, Supabase, custom JWTs.
* **Use cases:** Casual multiplayer, turn-based games, lobbies, collaborative app state, shared scoreboards.

### Not Scoped

* Non-web SDKs (Godot, Unity, Python).
* Modifier expansion beyond `increment`/`decrement`.
* Formal blob size limits or throttling policies.
* Self-hosted deployment option.
* CLI type generation.



## SDK Retries & Resilience

Contract surface for every SDK wrapping `@skystate/core`. For the canonical HTTP-status-to-result-tag mapping and error codes, see [Section 8.5 SDK Error Model](#85-sdk-error-model-shipped). This section covers the retry/reset rules, token refresh scenarios, lifecycle events, PKCE exchange, and backoff schedule.

### Public state load

URL: `GET {base}/v1/readonly/{accountId}/projects/{projectId}/public-state/{env}`, no auth header.

On `200` with valid body: snapshot becomes `ready`. On `204`: snapshot becomes `ready` with empty data. On `402`, `404`, `401`/`403`, malformed JSON, an invalid state root, network failure, or an unexpected status: snapshot becomes `error` with the corresponding code from [Section 8.5](#85-sdk-error-model-shipped), and the retry loop keeps polling - there is no terminal outcome on this path. `402` paces at `quotaBackoffDelay()`; every other failure uses standard `backoffDelay()` (honoring `Retry-After` for `429`) until a `200`/`204` succeeds.

### User state initial load

URL: `GET {base}/v1/{accountId}/projects/{projectId}/user-state/{env}`, `Authorization: Bearer {idToken}`.

On `200` with valid body: snapshot becomes `ready` with state. On `204`: snapshot becomes `ready` with null state. On `401`: the SDK attempts a token refresh; see the Token Refresh section below for the `identity-dead`/`retry` outcomes. A data-plane `401`/`403` reached after a refresh (or when no refresh was needed) is the `authz` verdict; the session reducer dispatches it as a data-plane rejection carrying the idToken the request actually sent. When that idToken is still the session's current credential's, the rejection is real: the client resets synchronously with the dispatch (queue, optimistic state, and drafts cleared, identity epoch bumped), and the final snapshot is `unloaded`, with the error surfaced once via the auth facet's `expiredError`. There is no later resume; a subsequent `load()` or `set()` starts a fresh drain from empty. When the sent idToken is no longer current (a sibling tab adopted a newer same-subject token while the request was in flight), the reducer drops the rejection as stale: no error is published, no reset, and it retries with the now-current credential. On `402`: snapshot becomes `error` and the drain paces retries at `quotaBackoffDelay()` without resetting. On `404`: retried indefinitely as a `configuration` error, no reset. On network, `5xx`, or any other unexpected status: retry with standard backoff. For error codes, see [Section 8.5](#85-sdk-error-model-shipped).

### Token refresh

URL: `POST {base}/v1/auth/token`, `application/x-www-form-urlencoded` body: `grant_type=refresh_token`, `client_id={account_id}.{slug}`, `refresh_token`.

When there is no refresh token in memory (or the client is disposed) at the start of a refresh, `requestTokenRefresh` returns `'no-credential'` without making a request. This is not a death verdict - there is no credential to pronounce dead - so it does not dispatch to the session reducer: no generation bump, no reset, no `expiredError` (`auth-session.ts:211-243`).

Otherwise, refresh failures classify into two dispositions. A non-ok response goes through `classifyTokenEndpointFailure` (`fetch-outcomes.ts:204-222`, the same helper the PKCE exchange uses): `identity-dead` - an OAuth body `invalid_grant`/`invalid_client` at any HTTP status - clears stored tokens and transitions auth to `unauthenticated`. Every other non-ok failure - a bare `401` with no matching OAuth body, `429`, `5xx`, any other unexpected 4xx, or the fetch itself throwing - is `retry`: tokens are preserved, the drain keeps using the credential, and it retries indefinitely with capped backoff and jitter, honoring the server's `Retry-After` header for `429` via `rateLimitDelay`. A bare `401` is no longer treated as identity-dead: the API's only genuine credential-rejection path (a bad `previous_access_token`) always carries an `invalid_grant` body, so a body-less `401` is an infrastructure fault (proxy/LB/gateway), not a verdict on the credential. A malformed `2xx` body is classified separately, directly in `auth-session.ts` - `classifyTokenEndpointFailure` is never reached once the endpoint has already answered `2xx` - and is `identity-dead`, not `retry` (see the table below). See also section 3.3 for storage semantics.

A successful `200` response includes `access_token`, `token_type`, `expires_in`, and `refresh_token`. When the response includes a non-empty `refresh_token`, the SDK adopts and persists that rotated refresh token. If no replacement is returned, the SDK keeps the current in-memory refresh token.

| Scenario | Server response | Outcome | Disposition | Auto-clears tokens? |
|---|---|---|---|---|
| No refresh token in memory | (no request made) | not a death verdict: no dispatch, no generation bump, no reset, no `expiredError`; auth is already credential-less and stays that way | no-credential | No |
| Refresh succeeds without rotation | `200 { access_token }` | in-memory `idToken`/`claims` updated; current refresh token kept; operation retried | - | No |
| Refresh succeeds with rotation | `200 { access_token, refresh_token }` | in-memory `idToken`/`claims` and refresh token updated; rotated refresh token persisted; operation retried | - | No |
| Refresh fails with an OAuth body `invalid_grant`/`invalid_client`, at any HTTP status | e.g. `400 {"error":"invalid_grant"}`, or `401` with that body | stored and in-memory tokens cleared; auth transitions to `unauthenticated` with an `authentication` error | identity-dead | Yes |
| Refresh bare `401` with no matching OAuth body | `401` | tokens preserved; `protocol` error on the health facet; drain keeps using the credential and retries with backoff | retry | No |
| Refresh `429` | `429` | tokens preserved; `rate_limited` error (retryAfter carried) on the health facet; drain retries honoring `Retry-After` | retry | No |
| Refresh `5xx` | `5xx` | tokens preserved; `server_unavailable` error on the health facet; drain retries with backoff | retry | No |
| Refresh network failure | no response | tokens preserved; `no_response` error on the health facet; drain retries with backoff | retry | No |
| Refresh unexpected 4xx with no matching OAuth code, including an unparseable or over-limit form body | e.g. `400 {"error":"invalid_request","error_description":"..."}`, `403`, `408`, `409` | tokens preserved; `protocol` error on the health facet; drain keeps using the credential and retries with backoff | retry | No |
| Malformed successful payload (missing/empty `access_token`, unparseable JSON body, non-object root, or an access token that fails JWT/sub validation) | `200` | stored and in-memory tokens cleared; auth transitions to `unauthenticated`; health-facet error keeps its `protocol` code (the body broke contract - it is not a proven-dead credential): the endpoint already answered `2xx` and may have rotated the refresh token server-side, so retrying the token held locally would trip the backend's strict-replay family revocation | identity-dead | Yes |

The retry-disposition rows surface their error on the operational health facet (reaching `onError`) via the drain that triggered the refresh, not on the auth snapshot: `refresh-failed-transient` leaves the auth snapshot's `error` untouched (`auth-state.ts` `nextExpiredError` returns `null` for it).

**API response contract.** The token endpoint returns RFC 6749 §5.2 JSON error bodies (`{"error": "...", "error_description": "..."}`) for all client errors: `400` with `invalid_grant` for a bad or expired refresh token or authorization code, `400` with `invalid_client` for an unknown `client_id`, and `400` with `invalid_request` for a malformed body (wrong `Content-Type`, missing `client_id`, or an unparseable or over-limit form body). Form-parser rejections use this OAuth shape rather than the shared `ErrorResponse` envelope. The SDK classification is unchanged: `invalid_request` is a `protocol` error, so refresh preserves the tokens and retries. The API's `previous_access_token` rejection path also returns `401` with an `invalid_grant` body, so it classifies as `identity-dead` through the same body check - classification is body-only, never status-only; a `401` without that body is treated as a transient infrastructure fault and retries. There is no `mode` parameter; the client is identified by `client_id` in the form body. Session classification lives entirely in the API's `ExchangeCodeService`.

### User state mutations (PATCH)

URL: `PATCH {base}/v1/{accountId}/projects/{projectId}/user-state/{env}`, `Authorization: Bearer {idToken}`.

For the per-response-tag drain behavior (queue changes, optimistic state, reset vs. continue), see [Section 8.5 Drain-result behavior](#85-sdk-error-model-shipped). Key behavioral rules summarized here:

- `200`: intent confirmed, server state and version updated, drain continues.
- `2xx` with an untrustworthy body (bad JSON, non-object root, missing ETag): `committed-unverified` - the write already landed server-side, so the SDK bakes the sent op into `serverState`, clears `version` to `null` (forces a `412` reconcile on the next write), publishes a `protocol` error, and continues; never rolled back.
- `412` conflict: refetch with retry, replay intent on success; no consumer error published on auto-recovery.
- `401`: attempt token refresh (a credential-less start instead returns `'no-credential'` with no request, no dispatch, and no reset); `identity-dead` (body-only OAuth `invalid_grant`/`invalid_client`) clears tokens and resets identity; every other refresh outcome (`retry`) preserves tokens and keeps using the credential, retrying with backoff and honoring `Retry-After` for `rate_limited`.
- `401` / `403` authorization failure on the data plane (after a refresh, or when no refresh was needed): the session reducer dispatches the rejection carrying the idToken the request actually sent. When that idToken is still the session's current credential's, the rejection is real: publish `authentication` error, reset synchronously (queue, optimistic state, and drafts cleared, identity epoch bumped); no later resume. When it is no longer current (a sibling tab adopted a newer same-subject token while the request was in flight), the reducer drops the rejection as stale: no error published, no reset, and the drain retries the head intent with the now-current credential.
- `400` with a legible `patch_*` body: publish the echoed error, drop intent, continue to next.
- `400` with an unparseable or unrecognized body: publish `protocol` error, keep the intent queued, backoff and retry.
- `402` quota: publish `quota` error, pace retries at `quotaBackoffDelay()`; does not reset, head intent kept.
- `404`: publish `configuration` error, keep the intent queued, backoff and retry.
- `5xx`: publish `server_unavailable` error; transport failure (offline, fetch threw): publish `no_response` error; unexpected non-2xx: publish `protocol` error; all three keep the intent queued, backoff and retry.

Signed-out writes (no `idToken` in snapshot): publish `authentication` error immediately; no optimistic state, no queue entry.

### Lifecycle events

| Scenario | Trigger | Optimistic state | Queue | Errors | Version |
|---|---|---|---|---|---|
| Different-subject identity change | `client.setAuthTokens()` (a different subject than the last authenticated one) / `client.clearAuthTokens()` | Rolled back | Discarded | All cleared | Reset to null |
| Same-subject re-auth after credential loss | `client.setAuthTokens()` arriving into a credential-less session (e.g. re-authenticating after a data-plane authz reset, or completing a PKCE redirect) | Rolled back | Discarded - a same subject re-authenticating from a credential-less state is treated as a new identity; queued/optimistic writes from before the loss are never resumed (documented non-guarantee, owner decision PR #603 `r3567104657`) | All cleared, then a fresh `load()` runs | Reset to null, then reloaded |
| Dispose | `client.dispose()` | Rolled back | Discarded | * | Reset |

### Token exchange (PKCE)

URL: `POST {base}/v1/auth/token`, one-shot exchange of a PKCE authorization code for tokens.

Token exchange is a one-shot operation and is entirely separate from refresh recovery. A failed exchange does not enter any retry loop; the consumer must restart the PKCE flow.

| Scenario | Server response | Outcome |
|---|---|---|
| Exchange succeeds | `200 { access_token, token_type, expires_in, refresh_token, scope }` | Both tokens stored; auth transitions to `authenticated` |
| Exchange fails with an OAuth body `invalid_grant`/`invalid_client`, at any HTTP status | e.g. `400 {"error":"invalid_grant"}`, or `401` with that body | Classified `authentication`; auth stays `unauthenticated` |
| Exchange `429` | `429` | Classified `rate_limited` (retryAfter carried); auth stays `unauthenticated` |
| Exchange `5xx` | `5xx` | Classified `server_unavailable`; auth stays `unauthenticated` |
| Exchange network failure (fetch throws) | no response | Classified `no_response`; auth stays `unauthenticated` |
| Exchange unexpected 4xx with no matching OAuth code, including an unparseable or over-limit form body and a bare `401` | e.g. `400 {"error":"invalid_request","error_description":"..."}`, a bare `401`, `403`, `409` | Classified `protocol`; auth stays `unauthenticated` |
| Malformed `2xx` body (missing/empty `access_token`/`refresh_token`, unparseable JSON, or an access token that fails JWT/sub validation) | `200` | Classified `protocol`; auth stays `unauthenticated` |

Every non-success row above throws inside `exchangePkceCallback`, and a single catch calls `clearAuthTokens()` (no error argument) before rethrowing to `onError`, so auth always lands on `unauthenticated` regardless of which code fired; there is no retry loop, and recovery means restarting the PKCE flow.

Exchange failures are independent from the refresh classification above, though both now share `classifyTokenEndpointFailure`. A `4xx` on `/auth/token` does not permanently clear any stored tokens beyond what `clearAuthTokens()` already clears (there is no established session yet at exchange time). Refresh recovery applies only to subsequent `/auth/token` calls with `grant_type=refresh_token` after a session is established.

### Backoff schedule

| Type | Delays | Used when |
|---|---|---|
| Standard (`backoffDelay`) | For attempt `n` (clamped to at least 0), compute `2s × 2^n`, then sample uniformly between separately capped bounds: `min(50% × exponential, 2.5m)` and `min(250% × exponential, 5m)`, rounded to the nearest ms. Steady state spans 2.5-5m with a hard 5m ceiling | network (`no_response`), `5xx` (`server_unavailable`), `404`/unexpected status/illegible-body PATCH (`configuration`/`protocol`), auth retry-disposition failures (non-`429`), conflict |
| Rate limit (`rateLimitDelay`) | Honors the response's `Retry-After` (seconds) when present and positive, capped at 30 minutes (`QUOTA_MAX_DELAY_MS`); falls back to standard backoff otherwise | `429` on user-state load/patch, public-state load, and the token endpoint (refresh and exchange) |
| Quota (`quotaBackoffDelay`) | Base 5m, 10m, 20m, ... capped at 30m, multiplied by 50-100% jitter | `402` on user-state load/patch and public-state load; paces retries without resetting the drain |

`requestTokenRefresh()` makes a single attempt per call. The user-state drain is the sole retry layer for `retry`-disposition refresh failures.

React also throws when `set()` is called during render.



---

## 11. Open Questions

1. ~~**Vanilla core extraction timing**~~ **Resolved:** `@skystate/core` is shipped as the framework-agnostic SDK package.
2. **Modifier expansion (V3+):** Should the modifier set grow beyond `increment`/`decrement`? Candidates include `arrayAppend`, `arrayRemove`, `setIfNull`, `max`, `min`. To be evaluated based on developer demand during beta.
3. **Ordering guarantees (V3):** The exact interleaving semantics between local optimistic patches and incoming WebSocket patches from other clients needs to be specified in the Cache Manager design. What happens when a local optimistic `increment` is in flight and a remote `replace` arrives for the same path?
4. **Session lifecycle (V3):** How are sessions created and destroyed? Time-based expiry? Explicit teardown? What happens to session state when all clients disconnect - is it persisted, and for how long?
5. **Rate limiting & abuse:** ~~What per-connection or per-project patch rate limits should be enforced to prevent abuse?~~ **Partially resolved:** A 120 req/min standard policy partitioned per credential (API key or bearer token) runs in every environment, the anonymous auth endpoints share one 1000 req/min global bucket, anonymous requests elsewhere are unlimited, plus monthly metering for authenticated state routes. V3 abuse prevention (game loop scenarios) remains open.
6. **Reconnection semantics (V3):** When a WebSocket reconnects after a drop, does the client receive a full snapshot, a delta since last known state, or just resume the patch stream? Full snapshot is simplest but scales poorly for large state blobs.
7. **BYOA scope (V3):** Should BYOA support arbitrary JWKS URLs (maximum flexibility) or a curated list of providers (Clerk, Supabase, Auth0) with pre-built validation? Curated is less work and better documented; arbitrary is more flexible but harder to support.
8. ~~**V1 config push semantics**~~ **Resolved:** V1 uses full blob replace on every config publish. Granular patching available via PATCH endpoint (V2.7).
9. ~~**V1 delivery model**~~ **Resolved:** V1 uses HTTP polling with browser Cache-Control headers. SSE rejected due to infrastructure costs.
10. **Global Default Injection:** Should the `SkyStateProvider` allow a `globalDefaults` object to avoid repeating defaults in every hook?
11. **The "Wait for Truth" Flag:** Should the SDK support a mode that suspends rendering until the first network fetch completes?
12. **CLI Type Depth:** Should generated types be flat strings (`'a.b.c'`) or nested objects? (Deferred with `pull`.)
13. ~~*(New in V2.7)* **Dev-mode SDK auth mechanism**~~ **Resolved:** Project API keys use `SKYSTATE_API_KEY` or `.env.local`. Current state commands require `--project`; the old `skystate init` / `SKYSTATE_DEV_KEY` path is stale.
14. ~~*(New in V2.7)* **`show` command auth scope**~~ **Resolved:** `sky state public show` uses the authenticated public-state route and may authenticate via developer bearer or project API key.
15. ~~*(New in V2.8)* **`SkyStateLogin` prop surface**~~ **Resolved:** No `SkyStateLogin` component is shipped. React apps render their own UI and call `useStatus().auth.loginWithRedirect()`.
