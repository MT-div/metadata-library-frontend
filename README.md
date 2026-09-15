# Metadata Library

A role-based web application for organising, discovering, and circulating library resources. The interface supports public catalogue browsing alongside dedicated workspaces for administrators and librarians.

## Highlights

- Browse and search catalogue items, inspect item details, and save favourites.
- Filter catalogue results by type, publication year, language, and sort order.
- Email/password and Google sign-in flows with token-based session handling.
- Protected role-based dashboards for administrators and librarians.
- Administrator tools for users, media, metadata, templates, item sets, items, vocabularies, properties, and settings.
- Librarian workflows for circulation, patrons, copies, active loans, and circulation history.
- Responsive, library-focused visual design.

## Tech Stack

- React 19 and TypeScript
- Vite
- React Router
- Zustand
- Axios
- Tailwind CSS
- Lucide icons

## Getting Started

### Prerequisites

- Node.js 20 or later
- A running compatible backend API (the current client is configured for `https://localhost:7206`)

### Installation

```bash
git clone <your-repository-url>
cd metadata-library-frontend
npm install
npm run dev
```

Open the local address printed by Vite, normally `http://localhost:5173`.

## Available Scripts

```bash
npm run dev      # Start the development server
npm run build    # Type-check and create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build locally
```

## Project Structure

```text
src/
├── components/  # Shared UI and route-protection components
├── features/    # Feature pages grouped by domain and user role
├── hooks/       # Data-fetching and feature logic hooks
├── layouts/     # Public, admin, and librarian layouts
├── services/    # API clients and endpoint services
├── store/       # Client-side authentication state
├── types/       # TypeScript domain models
└── utils/       # Theme and helper utilities
```

## Roles and Access

| Area | Access |
| --- | --- |
| Public catalogue | All visitors |
| Favourites | Authenticated users |
| Administration | Administrators |
| Circulation desk | Librarians and administrators |

## API Configuration

The Axios client is defined in `src/services/api.ts`. Update its `baseURL` to point to the deployed API when running outside local development. The client attaches a stored bearer token to protected requests and handles expired sessions.

## License

This project is intended for educational and portfolio use. Add a license file before distributing it publicly.
