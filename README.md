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
