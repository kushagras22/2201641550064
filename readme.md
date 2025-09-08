## URL Shortener (Frontend)

A single-page React application that lets users shorten URLs, optionally choose custom shortcodes, and view basic analytics (click counts and click events). All data is persisted client-side via localStorage. The app also supports path-based redirection by resolving a shortcode from the browser URL and navigating to the original URL.

### Quick start
- **Install**: `cd frontend && npm install`
- **Run dev**: `npm run dev` then open the printed URL
- **Build**: `npm run build`
- **Preview build**: `npm run preview`

### Tech stack and key choices
- **React 19 + Vite**: Fast DX, modern ESM toolchain, instant HMR.
- **No router dependency**: Redirection is implemented via `window.location.pathname` to keep the bundle small and logic explicit for this use case.
- **State in App component**: Centralized state (shortened URLs, active tab) in `App.jsx` keeps data flow simple; props are passed to children.
- **localStorage persistence**: Simple persistence without a backend. Keeps the app offline-capable and stateless server-wise.
- **CSS with a single stylesheet**: `src/index.css` defines design tokens (CSS variables) and component-level classes; keeps styling predictable and framework-agnostic.

### Project structure
```
frontend/
  src/
    components/
      URLShortener.jsx     # Input + generation of shortened URLs
      URLInput.jsx         # Single row for URL + shortcode + validity
      ResultDisplay.jsx    # Shows newly created results, copy button
      Statistics.jsx       # Click counts and per-click details
      TabNavigation.jsx    # Tab switching (Shortener | Statistics)
      Header.jsx, Footer.jsx
    App.jsx                # State owner; persistence; path-based redirect
    main.jsx               # App bootstrap
    index.css              # Styles and tokens
    utils/helper.js        # generateShortCode, isValidUrl
  index.html               # Entry HTML
  vite.config.js           # Vite + React plugin config
```

### Architectural overview
- **Component composition**
  - `App.jsx` is the top-level controller:
    - Owns `activeTab` and `shortenedUrls`.
    - Loads/saves `shortenedUrls` to localStorage via effects.
    - Implements path-based redirection (see Routing strategy).
    - Provides `addShortenedUrl` and `onUrlClick` callbacks to children.
  - `URLShortener` renders a dynamic list of `UrlInput` rows and validates/generates entries on submit. Emits new URL objects up to `App`.
  - `ResultDisplay` lists newly created short URLs and offers a copy-to-clipboard action.
  - `Statistics` shows all shortened URLs with expandable click details and triggers click-count increments when users open a short URL from the list.
  - `TabNavigation`, `Header`, `Footer` are presentational.

- **State and data flow**
  - Top-down data: `App` passes `shortenedUrls` to `Statistics`, and helper callbacks to update counts or add new URLs.
  - Bottom-up events: `URLShortener` calls `addShortenedUrl` for each newly created record; `Statistics` calls `onUrlClick` to increment metrics.
  - Persistence: `shortenedUrls` is serialized to localStorage on every change and rehydrated on load.

- **Validation and constraints**
  - URL validation uses the `URL` constructor (`isValidUrl`).
  - Optional custom shortcode must be alphanumeric; otherwise a random 6-char base62 code is generated.
  - Shortcode uniqueness is enforced against both existing and in-form new entries.
  - Validity is a positive integer in minutes; used to compute `expiryDate`.

### Data model
A shortened URL entry has the following shape:
```json
{
  "originalUrl": "https://example.com/path",
  "shortCode": "abc123",
  "shortUrl": "https://app-host/abc123",
  "creationDate": "2025-01-01T12:00:00.000Z",
  "expiryDate": "2025-01-01T12:30:00.000Z",
  "clicks": 0,
  "clickData": [
    {
      "timestamp": "2025-01-01T12:05:00.000Z",
      "source": "Direct",
      "location": "N/A"
    }
  ]
}
```

- **Key decisions**
  - Store `shortUrl` denormalized for convenience (fast display/copy).
  - Retain `clickData` as an array to allow future enrichment (e.g., geo/IP/user agent) without schema changes.
  - Keep `location` as placeholder (`"N/A"`) due to no external services; can be filled later when integrating a backend.

### Routing strategy and redirection
- There is no React Router. Instead, `App.jsx` inspects `window.location.pathname` on load and whenever `shortenedUrls` changes:
  - If a non-empty path exists, it treats it as a `shortCode`.
  - It looks up the matching entry in `shortenedUrls`.
  - If found, it appends a click event to `clickData`, increments `clicks`, persists, and navigates via `window.location.href = originalUrl`.
- This makes short links like `https://app-host/abc123` portable and static-host-friendly.

### Assumptions and limitations
- **Client-only storage**: All data is local to the browser profile. Short links are not shared across users/devices; clearing storage removes them.
- **Expiry not enforced at redirect**: `expiryDate` is computed and shown, but the current implementation does not block redirection after expiry. Enforcing this would require a check before redirect.
- **No collision across browsers**: Shortcode uniqueness is enforced within the current local dataset only.
- **Security**: The app redirects to any valid URL. In production, a backend would sanitize/verify destinations and apply threat controls.

### Scalability and maintainability
- **Separation of concerns**: Data creation/validation (`URLShortener`) is isolated from presentation (`ResultDisplay`) and analytics (`Statistics`).
- **Extensibility**: The data model supports adding metadata fields without migrations. The redirection logic can be moved to a backend later while preserving the UI.
- **Performance**: The dataset is small and resides in memory; serialization to localStorage is O(n). For larger scales, move persistence and analytics to a backend and page the stats view.
- **Testing**: Logic is mostly pure and can be unit-tested (e.g., helpers, validation, mapping functions). Redirection side effects can be mocked.

### Future enhancements
- Enforce expiry at redirection time and surface status (active/expired).
- Introduce a lightweight router if more pages are added.
- Shareable short links via a backend API, with server-side redirects and analytics.
- Add QR code generation and CSV export for analytics.
- Improve accessibility (labels, focus management, keyboard affordances) and i18n.

### How to work with the code
- Generate URLs in `URLShortener.jsx`; adjust validation or shortcode generation in `utils/helper.js`.
- Redirection and persistence live in `App.jsx`.
- Styles are defined in `src/index.css`; add tokens or component styles there.
- Add new tabs by extending `TabNavigation.jsx` and rendering content in `App.jsx`.

### Logging middleware
This project includes a small HTTP-based logging helper to send structured logs to an external log server.

- **Locations**:
  - Root: `middleware/log.js` (generic, parameterized)
  - Frontend: `frontend/src/middleware/log.js` (browser-ready)

- **Configuration**:
  - Set the log server base URL via one of the following (first non-empty wins):
    - `import.meta.env.VITE_LOG_SERVER_URL`
    - `process.env.VITE_LOG_SERVER_URL`
    - `process.env.LOG_SERVER_URL`
  - Fallback: `https://example-log-server.invalid`
  - Requests are sent to the `POST /log` endpoint with `application/json` and a 4s timeout (Axios).

- **Payload shape**:
```json
{
  "stack": "frontend | backend | worker",
  "level": "debug | info | warn | error",
  "package": "module-or-feature-name",
  "message": "human-readable message",
  "timestamp": "ISO-8601",
  "userAgent": "<browser UA>"
}
```

- **Usage (recommended)**:
```js
import Log from "../middleware/log"; // adjust path as needed

// Send an informational log
await Log("frontend", "info", "ui", "User clicked shorten button");

// Report an error
await Log("frontend", "error", "shortener", error?.message || String(error));
```

- **Behavior**:
  - On failure to reach the log server, a warning is printed to the browser console; the app flow is not blocked.
  - The root helper (`middleware/log.js`) uses the provided arguments. The frontend helper currently posts a sample payload; adapt it to pass through the provided `stack`, `level`, `packageName`, and `message` in production.

- **Assumptions**:
  - The external log service exposes `POST /log` and accepts the payload above.
  - No PII is included by default; callers are responsible for sanitizing messages.
