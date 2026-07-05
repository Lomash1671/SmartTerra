# SmartTerra
# Water Network Editor

A React + TypeScript application implementing a **Role-Based Water Network Editor** with a complete **Edit Approval Workflow** for managing water distribution networks.

This project was developed as part of the **SmartTerra Full Stack Engineer Assignment**. It is a browser-only application with no backend, using **Zustand** for state management and persistence.

---

## 🚀 Features

### Authentication & RBAC
- Hardcoded authentication with three user roles:
  - **Alice** – Admin
  - **Bob** – Editor
  - **Charlie** – Operator
- Role-Based Access Control enforced in both the **UI** and **state logic**.
- Unauthorized actions cannot be executed even if invoked programmatically.

### Interactive Network Map
- Interactive map built with **React Leaflet**
- Display water network elements:
  - Junctions
  - Pipes
  - Valves
  - Reservoirs
- Select any element to inspect its properties.

### Network Editing
Editors can:

- Modify element properties
- Add new elements
- Delete existing elements
- Split an existing pipe by inserting a junction
- Automatically cascade-delete connected pipes when a junction is removed

Changes are stored as isolated **Drafts** and never modify the published network directly.

### Edit Approval Workflow

Every network modification follows the workflow below:

```text
Editor
   │
   ▼
Draft Edit
   │
Assign Task
   ▼
Operator Verification
   │
Submit Field Form
   ▼
Pending Approval
   │
Admin Review
 ┌──────────────┴──────────────┐
 ▼                             ▼
Approved                  Rejected
 ▼                             ▼
Published Network      Returned to Editor
```

### Operator Field Verification

Operators can:

- View assigned tasks
- Record observed values
- Record field conditions
- Add notes/comments

Field submissions are attached to the corresponding Edit for review.

### Discussion Threads

Each Edit contains a dedicated discussion thread where:

- Admins
- Editors
- Operators

can collaborate through timestamped comments.

### Audit Trail

Every significant action is recorded, including:

- Edit Creation
- Property Updates
- Assignment
- Field Submission
- Submission for Approval
- Approval
- Rejection
- Publishing
- Deletion

Each audit entry records:

- User
- Role
- Timestamp
- Action performed

---

# 🛠 Tech Stack

- React
- TypeScript
- Vite
- Zustand
- Zustand Persist
- React Leaflet
- React Hook Form
- Material UI
- Turf.js (Geometry calculations)

---

# 📂 Project Structure

```text
src/
├── components/
│   ├── Map
│   ├── Panels
│   ├── Sidebar
│   └── Common
│
├── pages/
│   ├── Login
│   └── Dashboard
│
├── store/
│   ├── auth
│   ├── network
│   ├── edits
│   └── audit
│
├── data/
│   └── network.ts
│
├── types/
│
├── utils/
│   ├── pipeSplit.ts
│   ├── geometry.ts
│   └── helpers.ts
│
├── App.tsx
├── main.tsx
└── index.css
```

---

# 🔐 Seeded Users

No passwords are required.

| User | Role | Responsibilities |
|------|------|------------------|
| Alice | Admin | Reviews, approves/rejects edits, publishes changes |
| Bob | Editor | Creates and edits network elements, assigns operator tasks |
| Charlie | Operator | Completes field verification tasks |

Simply select a user on the login screen to begin.

---

# ⚙️ Installation

Clone the repository:

```bash
git clone <repository-url>
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

# ✅ Assignment Requirements Covered

- ✔ Hardcoded Authentication
- ✔ Role-Based Access Control
- ✔ Interactive Network Map
- ✔ Property Editing
- ✔ Add/Delete Network Elements
- ✔ Pipe Splitting
- ✔ Cascading Deletions
- ✔ Draft-based Editing
- ✔ Operator Task Assignment
- ✔ Field Verification Form
- ✔ Approval Workflow
- ✔ Published Network Layer
- ✔ Conversation Threads
- ✔ Audit Trail
- ✔ Browser Persistence
- ✔ TypeScript Implementation

---

# 🧠 Architecture

The application follows a centralized state management approach.

- Zustand serves as the single source of truth.
- Published network and pending edits remain isolated.
- Workflow state is maintained independently from map rendering.
- Browser persistence is handled using Zustand Persist (`localStorage`).

The architecture emphasizes:

- Separation of concerns
- Predictable state transitions
- Strong role enforcement
- Modular components
- Maintainable business logic

---

# 📋 Assumptions

- Authentication is simulated using hardcoded users.
- Browser `localStorage` acts as the application's persistence layer.
- Network geometry is simplified for demonstration purposes.
- Concurrent editing and conflict resolution are out of scope.
- No hydraulic simulation is performed.

---

# 🚀 Future Improvements

Potential enhancements include:

- Backend integration (Node.js + PostgreSQL/PostGIS)
- JWT Authentication
- Real-time collaboration
- Undo/Redo
- Search & Filtering
- Network Import/Export
- Photo attachments for field tasks
- Map overlay for pending edits
- Diff viewer for comparing published vs draft changes

---

# 🎥 Suggested Demo Flow

1. Login as **Bob (Editor)**
2. Select or create a network element
3. Modify properties
4. Assign a task to **Charlie (Operator)**
5. Login as Charlie and complete the field form
6. Login back as Bob and submit the edit
7. Login as **Alice (Admin)**
8. Review discussion, audit log, and field report
9. Approve the edit
10. Verify the updated published network

---

# 📌 Notes

This project was intentionally designed as a frontend-only application, following the constraints of the SmartTerra assignment.

The focus is on:

- Clean state management
- Correct role-based authorization
- Workflow modeling
- Maintainable architecture
- Code quality
- User experience
