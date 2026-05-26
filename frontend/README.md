# LEXI Frontend

React web frontend for LEXI.

## Quick Start

```bash
npm install
npm run dev
```

By default the app calls the backend at `http://localhost:3000`.
Create `.env` from `.env.example` if you need a different API URL.

## Structure

- `src/api` - HTTP client and backend endpoint wrappers.
- `src/app` - App composition.
- `src/components` - Shared layout and UI components.
- `src/features` - Domain-specific frontend logic.
- `src/pages` - Screen-level components.
- `src/routes` - Route constants.
- `src/types` - TypeScript DTOs for backend responses.
- `src/utils` - Reusable helpers.
