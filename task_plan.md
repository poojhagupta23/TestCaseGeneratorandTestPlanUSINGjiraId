# Task Plan

## Phases, Goals, and Checklists

### Phase 1: Blueprint (Approved)
- [x] Analyze updated `Objective.md` (Web App pivot)
- [x] Update Project Memory (`gemini.md`, `findings.md`)
- [x] Receive approval on the new Implementation Plan for Next.js

### Phase 2: Link (Connectivity)
- [x] Rename `env` to `.env.local`
- [x] Build minimal API routes in Next.js to verify Jira connection
- [x] Build minimal API route to verify Groq connection

### Phase 3: Architect (The 3-Layer Build adapted for Next.js)
- [x] Initialize Next.js 15 App (`npx create-next-app`)
- [x] Setup ShadCN UI & Tailwind
- [x] Build API Routes: `/api/jira`, `/api/ai`
- [x] Build Client Services: API clients, LocalStorage History manager
- [x] Create Technical SOPs in `architecture/qa_copilot_sop.md`

### Phase 4: Stylize (Refinement & UI)
- [x] Implement VWO-inspired Dashboard UI layout (Sidebar, Header, Theme Toggle)
- [x] Implement Settings Page (API Key management)
- [x] Implement Main Workflow components (Jira Input, Requirement Summary, AI Insights)
- [x] Implement DOCX and CSV Generator modules

### Phase 5: Trigger (Deployment)
- [x] Finalize Performance (Load times, UI states, Loaders)
- [x] Update Maintenance Log in `gemini.md`
