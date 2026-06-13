# Findings

## Research, Discoveries, and Constraints

### 1. Scope Pivot & Architectural Decisions
- **Initial Assumption:** The project was initially conceived as a series of simple, atomic Python scripts placed in a `tools/` directory.
- **Discovery:** Based on the expanded `Objective.md`, the requirement shifted to a **Production-Ready AI-Powered QA Copilot Web Application**. 
- **Chosen Architecture:** We selected **Next.js 15 (App Router)**. This framework perfectly unifies the frontend (React/Tailwind) and the backend (API Routes), eliminating the need for a separate Python backend. ShadCN UI was chosen to replicate the required VWO-inspired enterprise aesthetics.

### 2. Jira Integration & Constraints
- **Authentication Discovery:** Jira's REST API requires Basic Authentication constructed using a base64 encoded string of `email:api_token`.
- **Constraint (CORS):** Direct browser-to-Jira API requests are almost always blocked by Cross-Origin Resource Sharing (CORS) policies. 
- **Solution:** We built a server-side proxy route at `src/app/api/jira/route.ts` to securely fetch the ticket details (`summary`, `description`, `customfield_10000`) without exposing the token to the client browser or triggering CORS errors.

### 3. Groq AI Discoveries
- **Model Selection:** We utilized `llama-3.3-70b-versatile` through the Groq SDK. This model provides the best balance of extremely high-speed inference (crucial for a web app) and deep reasoning required to generate complex test plans.
- **Prefix Error Discovery:** Groq API keys strictly require the `gsk_` prefix. We discovered that the provided key had a custom `Groq-` prefix (`Groq-gsk_...`), resulting in a `401 Unauthorized` Invalid API Key error.
- **Mitigation:** We implemented an automatic sanitization step in `src/app/api/ai/route.ts` that strips the `Groq-` prefix before initializing the Groq client.

### 4. Data Parsing & Export Constraints
- **Test Cases Format:** The `Objective.md` mandated a strict CSV output format with 13 specific columns. Instructing an LLM to output raw CSV strings is notoriously unreliable due to comma escaping and newline issues.
- **Solution:** We instructed the AI to output a strict JSON Array of objects. We then use the `papaparse` library on the client-side to deterministically convert this JSON into a perfectly escaped CSV file (`src/lib/exportUtils.ts`).
- **DOCX Generation:** Converting Markdown to DOCX natively in the browser is challenging. We utilized the `docx` library to programmatically construct paragraphs and headers based on a lightweight Markdown parser built into our utility layer.

### 5. Deployment Constraints
- **Vercel CLI Issue:** Deploying via the non-interactive Vercel CLI failed initially because it required an explicit `--scope` flag when multiple teams are present on the account. 
- **Resolution:** Added `--scope poojha-gupta-s-projects` to successfully deploy the Next.js app to production.

- **DOCX Formatting Upgrade:** Enhanced the `generateDocx` utility to output professionally styled Test Plan documents. Added custom heading colors (Arial, blue/dark blue palette), centralized document titles, and proper line spacing to ensure the exported file matches standard corporate Test Plan layouts instead of plain text.

- **Markdown Table Parsing in DOCX:** Discovered that the LLM occasionally generates Markdown tables with inline HTML `<br>` tags. We built a custom markdown-table-to-docx parser in `src/lib/exportUtils.ts` to natively render `docx.Table` elements complete with header shading, cell margins, and line break parsing for pristine, corporate-ready exports.
