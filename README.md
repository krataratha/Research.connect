# Research Connect

An enterprise-grade, production-ready **AI-powered Research Discovery & Collaboration Platform** built using the MERN Stack (React, Node.js, Express, MongoDB). Designed with a clean **Feature-First Architecture**, strict design systems, and modern SaaS aesthetics.

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
| 🟠 **Orange**          | `#F59E0B`  | i10-index, warning metrics                    |
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
- **Hero Background Gradient**: `#F8FAFC` ➔ `#FFFFFF` (Page Background to Card Background)
- **Success Gradient**: `#22C55E` ➔ `#10B981` (Success Green to Emerald)

---

## 📂 Project Directory Structure

The project is structured with exactly two root folders, maintaining a strict separation between client and server.

### 💻 Frontend (Client-side)

```text
frontend/                 # React.js (Vite) Client
├── public/
├── src/
│   ├── api/              # Axios configurations & interceptors
│   ├── components/       # Reusable global UI components (e.g., ProtectedRoute)
│   ├── hooks/            # Reusable global React hooks
│   ├── layouts/          # Global layouts
│   ├── store/            # Redux Toolkit store & slice definitions
│   │   ├── slices/       # Redux slices (e.g., authSlice)
│   │   └── index.js      # Store configuration
│   ├── utils/            # Shared utilities
│   ├── modules/          # Feature-First Modules
│   │   ├── authentication/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── context/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── styles/
│   │   │   ├── utils/
│   │   │   └── index.js  # Module entry point
│   │   ├── landing/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── index.js
│   │   └── dashboard/
│   │       ├── pages/
│   │       └── index.js
│   ├── index.css         # Tailwind & global styles
│   └── main.jsx          # App entry point with router & providers
├── index.html
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

<br />

### ⚙️ Backend (Server-side)

```text
backend/                  # Node.js + Express.js Server
├── src/
│   ├── database/         # Database Configuration
│   │   ├── models/       # Shared database models
│   │   ├── connection.js # Mongoose connection helper
│   │   ├── indexes.js    # Index audit utilities
│   │   └── seed.js       # Local database seeder
│   ├── modules/          # Feature-First Modules
│   │   └── authentication/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       ├── routes/
│   │       ├── validator/
│   │       ├── middleware/
│   │       ├── helper/
│   │       ├── dto/
│   │       └── index.js  # Module entry point
│   └── server.js         # Express application entry point
├── .env
└── .env.example
```

---

## 🏛️ Architecture Rules & Patterns

### 1. Feature-First Architecture

- Every feature must live inside a self-contained module folder under `modules/` in both frontend and backend.
- Frontend modules contain components, pages, hooks, services, validators, and an `index.js` entry point.
- Backend modules contain controllers, services, repositories, routes, validators, middlewares, helpers, DTOs, and an `index.js` entry point.
- **Module Name Matching**: Frontend and backend module names must always match exactly (e.g., `authentication`, `publication`, `dashboard`).

### 2. Separation of Concerns (Backend)

- **Routes**: Define endpoints and map them directly to controllers. No business logic.
- **Controllers**: Validate request payloads (using Zod), map parameters, call services, and return standardized JSON responses.
- **Services**: Contain all business logic, transactions, and calculations.
- **Repositories**: Encapsulate Mongoose queries and database mutations.
- **DTOs (Data Transfer Objects)**: Sanitize database documents before sending them in responses.

### 3. Standardized API Responses

All API responses must follow these exact JSON structures:

#### Success Response

```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": {},
  "error": null
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### 4. Naming Conventions

- **Folders**: lowercase (e.g., `publication`, `researcher`, `dashboard`).
- **React Components**: PascalCase (e.g., `PublicationCard.jsx`).
- **React Hooks**: camelCase starting with `use` (e.g., `usePublication.js`).
- **Services**: `*.service.js` (e.g., `auth.service.js`).
- **Controllers**: `*.controller.js` (e.g., `auth.controller.js`).
- **Routes**: `*.routes.js` (e.g., `auth.routes.js`).
- **Models**: PascalCase (e.g., `User.js`).

---

## 🗄️ Database Schema Design

### 1. User Model (`User.js`)

Stores account credentials, role details, and authentication/verification states.

```javascript
{
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['researcher', 'admin'], default: 'researcher' },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshToken: { type: String, select: false }
}
```

### 2. Researcher Profile Model (`ResearcherProfile.js`)

Stores professional details, institution details, publication metrics, and social handles.

```javascript
{
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  title: { type: String, default: '' },
  bio: { type: String, maxlength: 500, default: '' },
  institution: { type: String, default: '' },
  department: { type: String, default: '' },
  skills: [{ type: String }],
  socialLinks: {
    orcid: { type: String, default: '' },
    googleScholar: { type: String, default: '' },
    researchGate: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  stats: {
    views: { type: Number, default: 0 },
    citations: { type: Number, default: 0 },
    reads: { type: Number, default: 0 },
    hIndex: { type: Number, default: 0 }
  },
  publications: [{ type: Schema.Types.ObjectId, ref: 'Publication' }],
  coAuthors: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}
```

---

## 🚀 Quickstart & Installation

### Prerequisites

- Node.js (v18+)
- MongoDB (Local instance or Atlas cluster URI)

### Setup Instructions

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd Research.connect
    ```

2.  **Configure Environment Variables**:
    Create a `.env` file in the `backend/` directory based on the following template:

    ```env
    PORT=5000
    NODE_ENV=development
    MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/research_connect
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRE=15m
    JWT_REFRESH_SECRET=your_refresh_secret
    JWT_REFRESH_EXPIRE=7d
    CLIENT_URL=http://localhost:5174
    EMAIL_USER=your_gmail@gmail.com
    EMAIL_PASS="your_gmail_app_password"
    ```

3.  **Install dependencies**:

    ```bash
    # Install backend dependencies
    cd backend
    npm install

    # Install frontend dependencies
    cd ../frontend
    npm install
    ```

4.  **Seed the database**:

    ```bash
    cd ../backend
    node src/database/seed.js
    ```

5.  **Start local development servers**:

    ```bash
    # Run backend (from backend/)
    npm run dev

    # Run frontend (from frontend/)
    npm run dev
    ```

---

## 🚀 Development Roadmap

Below is the complete 16-phase implementation roadmap for **Research Connect**, detailing the dependencies and execution order.

### 🟢 Phase 1 — Foundation & Project Setup
* **Objective**: Establish the core architecture, configurations, and boilerplate.
* **Status**: `[x] Completed`
* **Modules**:
  - `[x]` Project Setup & Folder Structure
  - `[x]` Git & Branch Configurations
  - `[x]` Environment variables (`.env`)
  - `[x]` MongoDB connection pools
  - `[x]` Express server boilerplate
  - `[x]` React + Vite client setup
  - `[x]` Tailwind CSS v4 & Theme configuration
  - `[x]` Global Redux Store (Redux Toolkit + Redux Persist)
  - `[x]` Axios API client with interceptors
  - `[x]` Global React Hot Toast system
  - `[x]` Global `ProtectedRoute` component
  - `[x]` Landing Page (Navbar, Hero, Stats, Features, Categories, FAQ, Footer)

### 🔐 Phase 2 — Authentication & Authorization
* **Objective**: Secure user authentication and role-based route guarding.
* **Status**: `[x] Completed`
* **Modules**:
  - `[x]` User registration with secure password hashing
  - `[x]` Login with JWT access & refresh token generation
  - `[x]` Silent token refresh cycles (`httpOnly` cookies)
  - `[x]` Email verification with token expiration
  - `[x]` Forgot Password & Reset Password flows
  - `[x]` Role-based authorization middleware (`protect`, `authorize`)
  - `[x]` Remember Me session management
  - `[x]` Safe logout (invalidating refresh tokens in DB)

### 👤 Phase 3 — Researcher Profile
* **Objective**: Complete academic and professional profile management.
* **Status**: `[ ] Pending`
* **Modules**:
  - `[ ]` Personal Information (Biography, Designation, Department)
  - `[ ]` Academic Details & Institutional affiliation
  - `[ ]` Profile & Cover photo uploads
  - `[ ]` Education & Professional experience timelines
  - `[ ]` Social & Research Links (ORCID, Google Scholar, Scopus, ResearchGate, LinkedIn)
  - `[ ]` Research Metrics (Views, Citations, Reads, h-Index)
  - `[ ]` Dynamic Profile Completion meter

### 📄 Phase 4 — Publication Management
* **Objective**: Implement research papers upload, indexing, and management.
* **Status**: `[ ] Pending`
* **Modules**:
  - `[ ]` Upload Publication (PDF, DOI, Abstract, Authors, Journal, Conference, Publisher)
  - `[ ]` Edit & Delete publication metadata
  - `[ ]` PDF parsing & metadata extraction
  - `[ ]` Citation count tracking
  - `[ ]` Publication type categorization (Journal, Conference, Book, Preprint)
  - `[ ]` Advanced search and filtering (by author, date, journal)

### 🏷️ Phase 5 — Research Areas & Keywords
* **Objective**: Define academic expertise and keyword indexing.
* **Status**: `[ ] Pending`
* **Modules**:
  - `[ ]` Research Areas categorization
  - `[ ]` Academic Keywords indexing
  - `[ ]` AI-powered keyword extraction suggestions (Gemini API Integration)
  - `[ ]` Trending keywords analysis
  - `[ ]` Research tag management

### 🔍 Phase 6 — Search Engine
* **Objective**: Implement a high-performance global search engine.
* **Status**: `[ ] Pending`
* **Modules**:
  - `[ ]` Global unified search
  - `[ ]` Researcher search (by name, skill, institution)
  - `[ ]` Publication search (by title, abstract, DOI)
  - `[ ]` Institutional directory search
  - `[ ]` Advanced filters (country, department, journal impact)
  - `[ ]` Server-side pagination & sorting

### 🤝 Phase 7 — Collaboration System
* **Objective**: Connect researchers for co-authoring and joint projects.
* **Status**: `[ ] Pending`
* **Modules**:
  - `[ ]` Collaboration Profile toggles ("Open for Collaboration", "Looking for Co-author")
  - `[ ]` Collaboration Request (Send, Accept, Reject, Withdraw)
  - `[ ]` Matching preferences (preferred countries, domains)
  - `[ ]` Active and historical collaborations tracker

### 📊 Phase 8 — Dashboard
* **Objective**: Personal workspace for researchers to monitor metrics and actions.
* **Status**: `[ ] Pending`
* **Modules**:
  - `[ ]` Dashboard overview with key metrics (h-index, citations, views)
  - `[ ]` Interactive charts for publication growth and citation trends
  - `[ ]` Publications & Citations widget
  - `[ ]` Active collaborations & pending requests widget
  - `[ ]` Recent activities timeline & quick actions panel

### 🌍 Phase 9 — Discovery Dashboard
* **Objective**: Community explorer feed.
* **Status**: `[ ] Pending`
* **Modules**:
  - `[ ]` Recommended researchers to follow
  - `[ ]` Trending research areas and popular keywords
  - `[ ]` Top performing institutions
  - `[ ]` Recently joined researchers list
  - `[ ]` Popular and trending publications
  - `[ ]` Open collaborations board

### 🤖 Phase 10 — AI Recommendation System
* **Objective**: Implement intelligent recommendation engines.
* **Status**: `[ ] Pending`
* **Modules**:
  - `[ ]` Similar Researcher recommendation engine
  - `[ ]` Similar Publication recommender
  - `[ ]` Semantic matching based on abstract analysis (Gemini embeddings)
  - `[ ]` Common interests and co-author path matching
  - `[ ]` Recommendation scoring and match percentage displays

### 📈 Phase 11 — Analytics
* **Objective**: In-depth analytics of research impact.
* **Status**: `[ ] Pending`
* **Modules**:
  - `[ ]` Profile views, paper views, and download counts tracking
  - `[ ]` Citation analytics over time
  - `[ ]` Research area distribution charts
  - `[ ]` Collaboration network graphs
  - `[ ]` Monthly PDF impact report generation

### 📰 Phase 12 — Research Feed
* **Objective**: Academic social feed.
* **Status**: `[ ] Pending`
* **Modules**:
  - `[ ]` Create posts with text, links, or file attachments
  - `[ ]` Share publications directly to the feed
  - `[ ]` Social interactions (Like, Comment, Share)
  - `[ ]` Institutional announcements and research updates

### ⚙️ Phase 13 — Settings
* **Objective**: Account and preference management.
* **Status**: `[ ] Pending`
* **Modules**:
  - `[ ]` Account settings (email change, profile URL)
  - `[ ]` Security settings (password change, 2FA)
  - `[ ]` Privacy controls (profile visibility, metrics sharing)
  - `[ ]` Dark / Light theme toggle
  - `[ ]` Notification preferences (email & push)
  - `[ ]` Account deletion / deactivation

### 📧 Phase 14 — Email System
* **Objective**: Transactional and notification email automation.
* **Status**: `[ ] Pending`
* **Modules**:
  - `[ ]` Welcome email on registration
  - `[ ]` Verification & password reset templates
  - `[ ]` Collaboration request & acceptance emails
  - `[ ]` Weekly digest (citation updates, recommended papers)

### 📂 Phase 15 — File Management
* **Objective**: Scalable file upload and hosting system.
* **Status**: `[ ] Pending`
* **Modules**:
  - `[ ]` Profile and cover photo uploads (Cloudinary)
  - `[ ]` PDF publication uploads (Cloudinary / S3)
  - `[ ]` File validations (size, mime-type, malware scan)
  - `[ ]` Certificate and dataset uploads

### 🌐 Phase 16 — Public API & Documentation
* **Objective**: Standardized public API for external integrations.
* **Status**: `[ ] Pending`
* **Modules**:
  - `[ ]` API versioning (`/api/v1`)
  - `[ ]` Swagger / OpenAPI documentation
  - `[ ]` API rate limiting & request throttling
  - `[ ]` API request logging and audit trails

---

## 📋 Final Development Order

| Phase | Module | Depends On | Status |
| :---: | :--- | :--- | :---: |
| **1** | **Foundation & Landing** | — | `🟢 Completed` |
| **2** | **Authentication** | Phase 1 | `🟢 Completed` |
| **3** | **Researcher Profile** | Phase 2 | `🟡 Pending` |
| **4** | **Publication Management** | Phase 3 | `🟡 Pending` |
| **5** | **Research Areas & Keywords** | Phase 4 | `🟡 Pending` |
| **6** | **Search Engine** | Phase 5 | `🟡 Pending` |
| **7** | **Collaboration System** | Phase 6 | `🟡 Pending` |
| **8** | **Dashboard** | Phase 7 | `🟡 Pending` |
| **9** | **Discovery Dashboard** | Phase 8 | `🟡 Pending` |
| **10** | **AI Recommendation** | Phase 9 | `🟡 Pending` |
| **11** | **Analytics** | Phase 10 | `🟡 Pending` |
| **12** | **Research Feed** | Phase 11 | `🟡 Pending` |
| **13** | **Settings** | Phase 12 | `🟡 Pending` |
| **14** | **Email System** | Phase 13 | `🟡 Pending` |
| **15** | **File Management** | Phase 14 | `🟡 Pending` |
| **16** | **Public API & Documentation** | Phase 15 | `🟡 Pending` |
