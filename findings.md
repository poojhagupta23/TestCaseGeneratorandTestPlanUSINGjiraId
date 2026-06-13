# Findings

## Research, Discoveries, and Constraints
- **Scope Pivot:** Transitioned from basic atomic Python scripts to a full-fledged "Production-ready AI-powered QA Copilot web application".
- **Tech Stack Chosen:** Next.js 15 (App Router), TypeScript, Tailwind CSS, ShadCN UI.
- **LLM Provider:** Groq API using `llama-3.3-70b-versatile` for extremely rapid inference.
- **API Key Issue:** Groq keys starting with `Groq-` cause a 401 Unauthorized error. Added logic in the backend to automatically strip this prefix before sending it to the Groq SDK.
- **Core Workflow:**
  1. User inputs JIRA ID (e.g., SCRUM-7)
  2. Fetch from Jira (Server-side API route)
  3. AI Analysis via Groq (Server-side API route)
  4. Generate Test Plan (DOCX export via `docx` library)
  5. Generate Test Cases (CSV export via `papaparse` library)
- **State Management:** User settings and history are persisted seamlessly using Zustand local storage.
