# Research Connect

An enterprise-grade, production-ready **AI-Powered Research Discovery & Collaboration Platform** built using the MERN Stack (React, Node.js, Express, MongoDB). Designed with a clean **Feature-First Architecture**, strict design systems, and modern SaaS aesthetics.

This documentation describes the foundation structure, system architecture, database models, and setup procedures established through **Phase 1**.

### 📖 Technical Documentation Guides

For in-depth explanations of specific features, refer to:

- [Architecture Guide](file:///c:/Users/codew/Downloads/Research.connect/docs/architecture_guide.md) — System layers, security mechanisms, and background jobs.
- [Folder Guide](file:///c:/Users/codew/Downloads/Research.connect/docs/folder_guide.md) — Codebase layouts and file conventions.
- [Coding Standards & Guidelines](file:///c:/Users/codew/Downloads/Research.connect/docs/coding_standards.md) — Coding conventions, repository, and service rules.
- [Installation Guide](file:///c:/Users/codew/Downloads/Research.connect/docs/installation_guide.md) — Local environment installation and setup steps.
- [Development Guide](file:///c:/Users/codew/Downloads/Research.connect/docs/development_guide.md) — Instructions for writing new routes and services.
- [Database Schema Guide](file:///c:/Users/codew/Downloads/Research.connect/database_schema.md) — Collection definitions and schema details.

---

## 🎨 Design System & Color Palette

Research Connect utilizes a premium light-theme design system. All interface elements, components, and layouts strictly adhere to the following color tokens:

### Color Tokens

| UI Element             | Color Code | Purpose / Usage                               |
| :--------------------- | :--------- | :-------------------------------------------- |
| 🔵 **Primary Blue**    | `#2563EB`  | Primary buttons, active sidebar, links, icons |
| 🔷 **Blue Hover**      | `#1D4ED8`  | Button hover, active states                   |
| 🟣 **Indigo**          | `#4F46E5`  | Highlights, badges, charts                    |
| 🟢 **Success Green**   | `#22C55E`  | Success status, citations, completed items    |
| 🟠 **Orange**          | `#F59E0B`  | Warnings, pending states, metrics             |
| 🔴 **Red**             | `#EF4444`  | Notifications, errors, alerts                 |
| ⚪ **Page Background** | `#F8FAFC`  | Main website background                       |
| 🤍 **Card Background** | `#FFFFFF`  | Cards, profile sections, widgets              |
| ⚫ **Primary Text**    | `#0F172A`  | Headings & important text                     |
| ⚫ **Secondary Text**  | `#475569`  | Description & body text                       |
| ⚪ **Border**          | `#E2E8F0`  | Card borders, inputs, dividers                |
| 🔹 **Light Blue**      | `#DBEAFE`  | Metric cards, tags, badges background         |
| 🟢 **Light Green**     | `#DCFCE7`  | Success metric background                     |
| 🟠 **Light Orange**    | `#FEF3C7`  | Warning metric background                     |
| 🟣 **Light Purple**    | `#EDE9FE`  | Research tags, AI sections                    |

### Gradients

- **Primary Gradient**: `#2563EB` ➔ `#4F46E5` (Primary Blue to Indigo)
- **Hero Background Gradient**: Radial-gradient (`#F8FAFC` ➔ `#FFFFFF`)

---

## 📂 Project Directory Structure

The project is structured with exactly two root folders, maintaining a strict separation between client and server, utilizing **Feature-First** localization.

### 💻 Frontend (Client-side)

```text
frontend/                 # React.js (Vite) Client
├── .vscode/
│   └── settings.json     # Custom CSS linter rules for Tailwind
├── public/
├── src/
│   ├── api/
│   │   └── axiosInstance.js # Axios instance with interceptors and toast prompts
│   ├── components/
│   │   └── common/           # Reusable Atomic UI elements
│   │       ├── buttons/      # Spinners-enabled buttons
│   │       ├── cards/        # Glassmorphic elevation-hover cards
│   │       ├── forms/        # Form wrappers
│   │       ├── inputs/       # Custom inputs, checkboxes, and selectors
│   │       ├── loaders/      # Page spinners and content skeletons
│   │       ├── modals/       # Dialog drawers with backdrop locks
│   │       └── tables/       # Pagination trackers and tables
│   ├── layouts/
│   │   ├── AuthLayout/       # Layout wrapper for registration & login pages
│   │   ├── DashboardLayout/  # Sidebar-enabled wrapper for authenticated routes
│   │   ├── LandingLayout/    # Layout shell for marketing landing views
│   │   ├── Footer/           # Responsive page footer
│   │   ├── Navbar/           # Responsive header bar
│   │   └── Sidebar/          # Left navigation drawer
│   ├── routes/
│   │   ├── AppRoutes.jsx     # Router configuration (Landing, Auth, Protected Gates)
│   │   ├── ProtectedRoute.jsx# Block unauthenticated sessions (redirects to /login)
│   │   └── PublicRoute.jsx   # Prevents authenticated users from seeing auth pages
│   ├── redux/                # Combined Redux Toolkit Store
│   │   ├── slices/
│   │   │   ├── appSlice.js    # Mobile menus & general loading state
│   │   │   ├── authSlice.js   # Session authentication states
│   │   │   ├── loadingSlice.js# Global loading spinner overlay
│   │   │   ├── notificationSlice.js # Global alerts tracking
│   │   │   ├── sessionSlice.js# Active device session configurations
│   │   │   ├── themeSlice.js  # Theme toggles and cache
│   │   │   └── userSlice.js   # User information models
│   │   └── index.js           # Combined store entry point
│   ├── services/             # Async API client calling files
│   │   ├── auth.service.js   # Login, registration, OTP client logic
│   │   └── profile.service.js# Bio and user updates API client
│   ├── styles/
│   │   └── index.css          # Tailwind directives and CSS variables
│   ├── modules/               # Feature-First Modules
│   │   ├── landing/           # Landing page feature components and pages
│   │   ├── auth/              # Auth pages (Login, Register, OTP verification, Reset)
│   │   ├── dashboard/         # Dashboard UI, analytics graphs, and activity tracking
│   │   ├── profile/           # Academic bio profile editor & scholar view
│   │   ├── feed/              # Social media style research feed
│   │   └── project/           # Collaborative workspace projects
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

<br />

### ⚙️ Backend (Server-side)

```text
backend/                  # Node.js + Express.js Server
├── src/
│   ├── config/           # Setup and module configurations
│   │   ├── database/     # Mongoose connections, indexes, and seeders
│   │   ├── app.js        # Express app constants
│   │   ├── cors.js       # CORS headers configuration
│   │   ├── environment.js# Environment variable validation schema
│   │   ├── logger.js     # Winston configurations
│   │   ├── mongodb.js    # Database host validation
│   │   ├── rateLimiter.js# Security rate limits mapping
│   │   └── server.js     # Express connection parameters
│   ├── common/           # Reusable base logic and utilities
│   │   ├── errors/       # AppError hierarchy
│   │   ├── logger/       # Winston daily rotating logging manager
│   │   ├── responses/    # ApiResponse formatter
│   │   ├── repository/   # BaseRepository class (Generic CRUD Engine)
│   │   ├── service/      # BaseService class (Generic CRUD logic layer)
│   │   ├── middlewares/  # Security, request ID, logger, validators, error handlers
│   │   └── utils/        # JWT, bcrypt, OTP, and email (Nodemailer) helpers
│   ├── models/           # Mongoose schemas (46 schemas including User, Profile, Session, etc.)
│   ├── modules/          # Feature-First Isolated Modules
│   │   ├── landing/      # Landing endpoints
│   │   ├── authentication/# Register, verify, login, 2FA OTP, token refresh
│   │   ├── profile/      # Bio updates & user synchronization
│   │   ├── scholar/      # SerpAPI Google Scholar import background job workers
│   │   └── feed/         # Feeds, publication CRUD, comments, follows, bookmarks
│   ├── app.js            # Express app setup and middleware routing
│   ├── server.js         # Server port listener and graceful shutdowns
│   └── index.js          # Startup script
├── .env.example
├── .env
└── package.json
```

---

## 🏛️ Permanent Coding Standards & Guidelines

Refer to [.agents/AGENTS.md](file:///c:/Users/codew/Downloads/Research.connect/.agents/AGENTS.md) for full project constraints. Key guidelines include:

1. **Strict Separation of Concerns**: Routes map directly to Controllers. Controllers sanitize parameters, call Services, and output structured DTOs. Services host all transaction logic. Repositories communicate with Mongoose.
2. **Standardized Responses**:
   - **Success (HTTP 200-299)**:
     ```json
     {
       "success": true,
       "message": "Action completed successfully",
       "data": {},
       "error": null
     }
     ```
   - **Failure (HTTP 400-599)**:
     ```json
     {
       "success": false,
       "message": "Error description",
       "error": { "code": "ERROR_CODE", "details": {} }
     }
     ```
3. **Mongoose Collections**: Must support audit logging (`createdAt`, `updatedAt`), soft-delete properties (`isDeleted`, `deletedAt`), and normalized `ObjectId` references.

---

## 🗄️ Database Schemas & Collection Blueprints

For a complete breakdown of all 46 Mongoose collections, refer to the [Database Schema Documentation](file:///c:/Users/codew/Downloads/Research.connect/database_schema.md). Key collections include:

- **`users`**: Auth credentials, account status, role flags.
- **`profiles`**: Biography, social links, institutional affiliations.
- **`google_scholar_profiles`**: Cached Google Scholar API metrics (citations, h-index, etc.).
- **`publications`**: Academic publications, citations, and abstracts.
- **`sessions`**: Active device and browser logins.
- **`security_logs`**: Critical events auditing (failed logins, token refreshes, blocked accounts).
- **`bookmarks`**: Foldered research bookmarks.

---

## ⚙️ Generic CRUD Repository Engine

All repositories inherit from `BaseRepository` ([base.repository.js](file:///c:/Users/codew/Downloads/Research.connect/backend/src/common/repository/base.repository.js)), which provides standard database controls:

- `create(data)` & `bulkInsert(dataArray)`
- `findById(id, populate, select)` & `findOne(filter, populate, select)`
- `find(filter, queryOptions, populate)` (supports sorting, pagination, and regex search)
- `update(id, updateData, options)` & `updateMany(filter, updateData, options)`
- `delete(id)` (hard delete) & `softDelete(id, deletedBy)` (toggles `isDeleted`, sets timestamp)
- `aggregate(pipeline)` & `count(filter)`
- `bulkUpdate(operations)` (uses Mongoose `bulkWrite` transactions)

Similarly, all business services can inherit from `BaseService` ([base.service.js](file:///c:/Users/codew/Downloads/Research.connect/backend/src/common/service/base.service.js)) for standard validation, transaction wrappers, and response mapping.

---

## 🚀 Installation & Quickstart

### Prerequisites

- Node.js (v18+)
- MongoDB (Local instance or Atlas connection string)

### 1. Configure Environment Variables

Create a `.env` file in the `backend/` directory using the keys in `.env.example`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
MONGO_URI=mongodb://localhost:27017/research_connect
JWT_SECRET=supersecretjwtkeyforresearchconnect
JWT_REFRESH_SECRET=supersecretjwtrefreshkeyforresearchconnect
EMAIL_USER=demo@researchconnect.org
EMAIL_PASS=demopassword
SERP_API_KEY=your_serp_api_key_here
```

### 2. Install Packages

```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 3. Seed Database

Run the seeder script to initialize default indices and load testing profile data:

```bash
cd ../backend
npm run seed
```

### 4. Run Development Servers

```bash
# Launch backend (from backend/)
npm run dev

# Launch frontend (from frontend/)
npm run dev
```

---

## 🔬 API Endpoint Routes Summary

All system details are accessible using versioned endpoints under `/api`:

### 1. Public Base Endpoints (`/api/*`)

- **GET `/api`**: Welcome message, check online state.
- **GET `/api/health`**: Server health metrics and system uptime.
- **GET `/api/database`**: MongoDB connection status and pool size.
- **GET `/api/stats`**: Aggregated researcher, university, and publication counts.
- **GET `/api/categories`**: Lists active academic disciplines and paper distributions.

### 2. Authentication Endpoints (`/api/v1/auth/*`)

- **POST `/register`**: Creates a pending account, hashes password, and triggers email verification OTP.
- **POST `/send-registration-otp`**: Resends email verification code (60s cooldown limit).
- **POST `/verify-registration-otp`**: Verifies registration code, activates account, and issues access & refresh tokens.
- **POST `/login`**: Validates credentials, checks brute-force limit (blocks account on 5 failures), and triggers login 2FA OTP.
- **POST `/send-login-otp`**: Resends login verification code.
- **POST `/verify-login-otp`**: Verifies 2FA login code and logs a device session.
- **POST `/forgot-password`**: Triggers password recovery OTP.
- **POST `/reset-password`**: Verifies recovery code, hashes new password, and revokes all active sessions & refresh tokens.
- **POST `/refresh-token`**: Performs Refresh Token Rotation (RTR). Revokes all active user tokens if reuse is detected.
- **POST `/logout`**: Revokes current device refresh token.
- **POST `/logout-all`**: Revokes all active refresh tokens and sessions for the user.
- **GET `/me`**: Returns current logged-in user details and profile.

### 3. Profile Endpoints (`/api/v1/profile/*`)

- **GET `/`**: Returns current authenticated researcher's profile.
- **PUT `/` or PATCH `/`**: Updates profile bio, skills, social links, and affiliation, recalculating `profileCompletion` score.
- **DELETE `/`**: Soft deletes profile and user record.

### 4. Google Scholar Integration Endpoints (`/api/v1/*`)

- **POST `/research-identity`**: Saves research identity profiles (e.g. ORCID, Google Scholar, ResearchGate, LinkedIn, GitHub).
- **POST `/scholar/import`**: Enqueues a background job via SerpAPI to import Google Scholar metrics and publications (rate-limited).
- **POST `/scholar/reimport`**: Forces a fresh re-import of Google Scholar profile metrics.
- **POST `/scholar/sync`**: Syncs existing imported Scholar profile with the latest online metrics.
- **GET `/scholar/import-status`** or `/scholar/import/status/:jobId`: Get import queue job status.
- **GET `/scholar/profile`**: Get synced Google Scholar profile metrics.
- **GET `/scholar/publications`**: Get imported publications list.
- **GET `/scholar/coauthors`**: Get synced academic co-authors network.
- **GET `/scholar/citations`**: Get citation graphs.
- **GET `/scholar/analytics`**: Get citation trends and research area distribution.

### 5. Research Feed & Social Endpoints (`/api/v1/*`)

- **GET `/feed`**: Returns personalized research publication feed.
- **GET `/feed/trending` / `/feed/recommended` / `/feed/latest` / `/feed/following`**: Feeds filtered by citation rate, AI recommendation models, recent date, and followed users.
- **GET `/home`**: Summary view of feed, suggested profiles, and trending analytics.
- **POST `/publication`**: Creates a manual research publication entry.
- **PUT `/publication/:id`**: Edits a publication.
- **DELETE `/publication/:id`**: Soft-deletes a publication.
- **POST `/publication/like`**: Likes or unlikes a publication.
- **POST `/publication/bookmark`**: Bookmarks a publication into a specific folder.
- **POST `/bookmark/move`**: Moves bookmark to a different folder.
- **GET `/bookmark/folders`**: Get all bookmarks folder list.
- **POST `/publication/share`**: Records paper sharing metrics.
- **POST `/publication/recommend`**: Recommends a publication.
- **POST `/publication/comment`**: Adds a comment/reply to a publication.
- **GET `/publication/:publicationId/comments`**: Retrieves the comment thread for a paper.
- **POST `/follow/:userId`**: Follows or unfollows a researcher.
- **GET `/suggested-researchers`**: Get platform suggestions of researchers to follow.
- **GET `/publication/:id/similar`**: Fetch structurally or semantically similar publications.
- **POST `/publication/ai-summary`**: Generates an AI-powered summary of the publication.
- **GET `/search`**: Global text search across publications, users, and tags.

### 6. Message Endpoints (`/api/v1/messages/*`)

- **POST `/messages/conversations`**: Creates a direct conversation with another researcher.
- **GET `/messages/conversations`**: Lists the authenticated user's conversations.
- **GET `/messages/conversations/:conversationId/messages`**: Retrieves message history for a conversation.
- **POST `/messages/conversations/:conversationId/messages`**: Sends a new message in a conversation.
- **POST `/messages/conversations/:conversationId/read`**: Marks all unread messages in a conversation as read.
- **GET `/messages/unread-count`**: Returns the count of unread messages for the authenticated user.
- **DELETE `/messages/:messageId`**: Deletes a sent message.
