# Water Network Editor

A production-quality React application built for managing and editing water networks. It features a robust Role-Based Access Control (RBAC) system, an Edit Approval Workflow, and interactive map capabilities.

This project was built without a backend, utilizing Zustand with `localStorage` persistence.

## 🚀 Setup Instructions

1. **Clone the repository / Extract the folder**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. **Access the application:**
   Open `http://localhost:5173` in your browser.

## 👤 User Credentials

Authentication in this app simulates a real environment by selecting hardcoded users. No passwords are required.
- **Alice (Admin)**: Views network, pending edits, approves/rejects, publishes, adds comments.
- **Bob (Editor)**: Views network, edits properties, adds/deletes elements, assigns tasks, submits for approval.
- **Charlie (Operator)**: Views network, views assigned tasks, fills field verification form.

_On the login screen, simply click the role you want to simulate._

## 🏗️ Project Architecture

The application is structured to be modular, scalable, and interview-ready:
- **State Management**: Centralized using `Zustand` with `persist` middleware for data persistence across reloads. The state is treated as the single source of truth for UI, network elements, and audit logs.
- **Map Layer**: Uses `react-leaflet` to render GeoJSON data onto an interactive map. Modifications to the map (e.g. Add Junction/Pipe) interact directly with the state management layer.
- **Role-Based Access Control (RBAC)**: Enforced deep within the component logic and store layer. Buttons, actions, and views are conditionally rendered based on the active role.
- **Edit Workflow**: Rather than directly modifying the map, changes create `Draft` edits which traverse through an assigned workflow (`Draft` -> `Assigned` -> `Pending Approval` -> `Approved`/`Rejected`).

## 📂 Folder Structure

```text
src/
├── components/       # Reusable UI components (Sidebar, MapWidget, Panels)
├── data/             # Initial mocked GeoJSON network data
├── pages/            # Top-level Page components (Login, Dashboard)
├── store/            # Zustand global store configuration
├── types/            # TypeScript interfaces and types
├── utils/            # Business logic (e.g., Pipe splitting logic)
├── App.tsx           # Application route handling and theme provider
├── index.css         # Global styles
└── main.tsx          # Application entry point
```

## ✨ Features

- **Interactive Map**: Pan, zoom, click on elements to view properties. Editors can insert new junctions and endpoints.
- **Property Panel**: View details of nodes/pipes. Form handled by `react-hook-form`.
- **Edit Workflow**: Edits are stored as isolated changesets instead of mutating the "published" network until approved by an admin.
- **Operator Tasks**: Editors can assign property verification tasks to Operators in the field.
- **Threaded Conversations**: Each edit contains isolated comments allowing communication between Admins, Editors, and Operators.
- **Audit Logging**: Every action (Edit Creation, Approval, Deletion) logs a timestamped event.
- **Pipe Splitting**: Business logic that functionally splits a pipe object into two new pipes when a new junction is added.

## 🤔 Assumptions

- **Pipe Connections**: When adding pipes, we assume a simple start and end coordinate for demonstration. The "Split Pipe" logic simulates inserting a node in the center of an existing pipe.
- **Offline Persistence**: The database is simulated via Browser `localStorage`. Clearing browser caches will reset the app state.
- **Concurrent Editing**: Optimistic lock/conflict resolution for concurrent editors is out-of-scope for the assignment.

## 🚀 Future Improvements

- **Backend Integration**: Replace the Zustand persist layer with an API wrapper (Axios/React Query) pointing to a Node.js/PostgreSQL backend capable of handling PostGIS network topographies.
- **Auth Provider**: Introduce JWT based real authentication (e.g., Auth0, Firebase).
- **Proximity Snapping**: Implement geospatial snapping on the Map widget so pipes correctly align to junction endpoints using geospatial indexes (e.g., turf.js).
