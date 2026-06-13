# Project Constitution (gemini.md)

## Data Schemas
**Input Schema:**
- Jira Issue Payload (REST API): Summary, Description, AC, Comments, Labels.
- Settings Configuration: `JIRA_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `GROQ_API_KEY`.

**Output Schema:**
- Test Plan: `.docx` format generated programmatically.
- Test Cases: `.csv` format with strict columns (`Scenario`, `TID`, `Test Data`, `TestCase Description`, `PreCondition`, `TestSteps`, `Expected Result`, `Actual Result`, `Steps to Execute`, `Expected Result_2`, `Actual Result_2`, `Status`, `Executed QA Name`).

## Behavioral Rules
- Be concise.
- Output high-quality positive, negative, boundary, UI, accessibility, and API test cases.
- UI must be Modern SaaS, VWO-inspired, minimalistic, and enterprise-ready.

## Architectural Invariants
1. **Source of Truth:** Jira API is the sole source for requirements.
2. **Tech Stack:** Next.js 15, TypeScript, TailwindCSS, ShadCN UI, Lucide Icons.
3. **LLM Provider:** Groq API for ultra-fast generation.
4. **State Management:** LocalStorage for History module and Settings persistence.

## Maintenance Log (Phase 5)
- **2026-06-13**: Initialized version 1.0 of the Next.js QA Copilot application. 
- **2026-06-13**: Fixed `Groq-` prefix error in Groq API Key parsing (`route.ts`).
- **2026-06-13**: Application fully functional and documentation fully aligned with `BLAST.md`.
