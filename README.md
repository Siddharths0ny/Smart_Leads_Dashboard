# Smart Leads Dashboard (MERN + TS)

Smart Leads Dashboard is an enterprise-grade, production-ready Full Stack Lead Management Dashboard designed to streamline sales pipelines. Built with the **MERN** stack, **TypeScript (strict mode)**, **TailwindCSS**, **React Query**, and **Zustand**, the application features strict Role-Based Access Control (RBAC), responsive interfaces, and dynamic exports.

---

## 📋 Features

1. **Authentication & RBAC**:
   - Secure sign-up and sign-in validation via JWT bearer headers.
   - Separate roles: `Admin` (full CRUD access on all leads and assignee modifications) and `Sales User` (read/write access only on self-assigned leads).
2. **Interactive Pipeline Dashboard**:
   - High-fidelity visual metrics showing total, new, contacted, and qualified leads.
   - Advanced filters (multiple statuses, multiple sources) and sorting.
   - Text search query with a debounced delay of 300ms to throttle database lookups.
3. **Dynamic CSV Exports**:
   - Server-side CSV generation matching the exact active query filters (search, status, source).
4. **UX & Theme Customization**:
   - Clean, smooth dark/light mode toggle with preference persistence in `localStorage`.
   - Responsive tables for desktops and beautiful grid-cards for mobile views.
   - Centered spinners for page loads and global ErrorBoundary catchers for rendering faults.
5. **Robust Database Integration**:
   - MongoDB database connection with automatic **in-memory database fallback** (`mongodb-memory-server`) if no local database server is available!
   - Database auto-seeding on boot with default sales and administrator credentials.

---

## 🔑 Default Credentials (Seeded Automatically)

Upon startup, the database is automatically seeded with these initial testing credentials:

* **System Administrator**:
  - **Email**: `admin@dashboard.com`
  - **Password**: `Password123`
  - *Privileges*: Full access, assign leads to any sales representative.
* **Sales User**:
  - **Email**: `sales@dashboard.com`
  - **Password**: `Password123`
  - *Privileges*: Read/write own assigned leads only.

---

## 🛠️ Project Structure

```text
assignment/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts                  # App initialization (cors, helmet, routing mount)
│       ├── server.ts               # Server bootstrap & database connect
│       ├── config/
│       │   ├── database.ts         # Database connections with in-memory fallback
│       │   └── seeder.ts           # Automatic default accounts & leads seeder
│       ├── controllers/
│       │   ├── authController.ts   # JWT auth controller handlers
│       │   └── leadController.ts   # CRUD and CSV generators
│       ├── middleware/
│       │   ├── auth.ts             # JWT session validation & role checks
│       │   ├── errorHandler.ts     # Global AppError handler
│       │   └── validation.ts       # Request payload schemas (express-validator)
│       ├── models/
│       │   ├── User.ts             # User schema & password hashing methods
│       │   └── Lead.ts             # Lead schema with compound indexes
│       └── utils/
│           └── errors.ts           # Centralized AppError helper
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx                 # Routes, QueryClientProvider setup
│       ├── main.tsx                # Client mount bootstrap
│       ├── index.css               # Tailwind CSS directives
│       ├── types/
│       │   └── index.ts            # Shared typescript type models
│       ├── store/
│       │   ├── authStore.ts        # Zustand auth token store
│       │   └── uiStore.ts          # Zustand theme & sidebar store
│       ├── services/
│       │   ├── api.ts              # Axios interceptors (bearer header, 401 logout)
│       │   └── leadService.ts      # Leads and CSV download services
│       ├── hooks/
│       │   ├── useAuth.ts          # Register, Login hooks
│       │   ├── useLeads.ts         # React Query queries & cache invalidation
│       │   └── useDebounce.ts      # 300ms search throttle utility
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── DashboardPage.tsx
│       │   └── LeadDetailsPage.tsx
│       └── components/
│           ├── auth/               # LoginForm, RegisterForm validation modules
│           ├── layout/             # DashboardLayout frame
│           ├── common/             # Navbar, Sidebar, LoadingSpinner, ErrorBoundary
│           └── leads/              # LeadTable, LeadCard, LeadFilters, LeadForm
├── docker-compose.yml              # Multi-container orchestration
└── README.md                       # Documentation
```

---

## 📖 API Documentation

All API endpoints are prefixed with `/api`. Authenticated requests require a `Authorization: Bearer <token>` header.

### 🔑 Authentication Routes
#### `POST /api/auth/register`
*   **Description**: Registers a new user.
*   **Request Body**:
    ```json
    {
      "name": "John Doe",
      "email": "john@company.com",
      "password": "Password123",
      "role": "sales_user" // Or "admin"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "data": {
        "token": "eyJhbGciOi...",
        "user": {
          "id": "60d21b4f...",
          "name": "John Doe",
          "email": "john@company.com",
          "role": "sales_user"
        }
      }
    }
    ```

#### `POST /api/auth/login`
*   **Description**: Authenticates a user and returns a token.
*   **Request Body**:
    ```json
    {
      "email": "john@company.com",
      "password": "Password123"
    }
    ```
*   **Response (200 OK)**: (Same structure as registration response)

---

### 📈 Leads Routes (Protected)
*Required Header: `Authorization: Bearer <JWT_TOKEN>`*

#### `GET /api/leads`
*   **Description**: Retrieves paginated leads (default 10 per page), filtered by search text, status, or source.
*   **Query Parameters**:
    *   `page`: number (default: 1)
    *   `limit`: number (default: 10)
    *   `search`: string (filters by name/email)
    *   `status`: comma-separated string (e.g. `new,contacted`)
    *   `source`: comma-separated string (e.g. `website,referral`)
    *   `sort`: `latest` or `oldest` (default: `latest`)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [ ... ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 12,
        "pages": 2,
        "hasNext": true,
        "hasPrev": false
      }
    }
    ```

#### `GET /api/leads/export`
*   **Description**: Generates and downloads a CSV export file of filtered leads.
*   **Query Parameters**: (Same filters and sort fields as `GET /api/leads`)
*   **Response (200 OK)**: Returns standard file stream with `Content-Type: text/csv` and filename headers.

#### `GET /api/leads/:id`
*   **Description**: Retrieves details for a single lead.
*   **Response (200 OK)**: Returns lead record.

#### `POST /api/leads`
*   **Description**: Creates a new lead.
*   **Request Body**:
    ```json
    {
      "name": "Jane Lead",
      "email": "jane@gmail.com",
      "status": "new",
      "source": "website",
      "notes": "Interested in premium tier.",
      "assignedTo": "60d21b4f..." // Optional. Admin can assign to any user, Sales User will auto-assign to themselves.
    }
    ```

#### `PUT /api/leads/:id`
*   **Description**: Updates a lead.
*   **Access Rules**: `Admin` can update all fields/assignees. `Sales User` can only update leads assigned to them and cannot re-assign them to others.

#### `DELETE /api/leads/:id`
*   **Description**: Deletes a lead.
*   **Access Rules**: `Admin` can delete any lead. `Sales User` can only delete leads assigned to them.

---

## 🚀 Running Locally (Without Docker)

If you don't have Docker installed, the project is configured to run locally out of the box by automatically spinning up an in-memory MongoDB server instance.

### Prerequisites
* Node.js v18 or later
* npm package manager

### Steps

1. **Clone and open project directory**:
   ```bash
   cd assignment
   ```

2. **Run Backend API Server**:
   ```bash
   cd backend
   # Install dependencies
   npm install
   # Build/Compile typescript code
   npm run build
   # Start the server (will automatically download & spin up in-memory MongoDB)
   npm start
   ```
   *The server runs at: `http://localhost:5000`*

3. **Run Frontend Client Dev Server**:
   Open a separate terminal window:
   ```bash
   cd assignment/frontend
   # Install dependencies
   npm install
   # Run Vite development server
   npm run dev
   ```
   *The client dashboard loads at: `http://localhost:3000`*

---

## 🐳 Running with Docker

If you have Docker and Docker Compose installed:

1. Navigate to the project root directory:
   ```bash
   cd assignment
   ```
2. Build and run containers:
   ```bash
   docker-compose up --build
   ```
3. The frontend application is served at `http://localhost:3000`. The backend API is exposed at `http://localhost:5000`. A persistent MongoDB container is wired on port `27017`.
