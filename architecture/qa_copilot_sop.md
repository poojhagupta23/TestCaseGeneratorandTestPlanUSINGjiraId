# QA Copilot - Architecture SOP

## The 3-Layer Build
As defined in `BLAST.md`, the architecture strictly separates concerns:

### Layer 1: Architecture & State
- **State Management:** Handled by `src/store/useAppStore.ts` using `zustand/middleware` (persist).
- **Goal:** Maintain User Preferences (API keys) and Generation History across browser sessions securely.

### Layer 2: Navigation (Decision Making)
- **UI Components:** `src/app/page.tsx` (Dashboard), `src/app/settings/page.tsx` (Settings), and `src/app/history/page.tsx` (History).
- **Goal:** Provide a VWO-inspired layout, orchestrating when to call the backend APIs based on user interaction. It sequences the logic: Jira Fetch -> Plan Generation -> Case Generation.

### Layer 3: Tools (API Routes & Utilities)
- **Jira Fetcher:** `src/app/api/jira/route.ts` - Makes authenticated calls to Jira using Basic Auth securely on the server.
- **AI Generator:** `src/app/api/ai/route.ts` - Interfaces with the Groq SDK (`llama-3.3-70b-versatile`). Automatically strips invalid prefixes (`Groq-`) from keys.
- **Export Tools:** `src/lib/exportUtils.ts` - Deterministic script for formatting AI output into `.docx` and `.csv` files.
