# ResearchConnect 🔬🌐

ResearchConnect is a production-ready, enterprise-grade Full Stack MERN (MongoDB, Express, React, Node) application built from scratch to connect researchers, facilitate collaboration, and streamline academic and scientific research workflows.

## 📁 Repository Directory Structure

```
Research-Connect/
├── .editorconfig
├── .gitignore
├── LICENSE
├── README.md
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── Backend/                     # Node.js + Express.js + Mongoose
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       │   ├── db.js            # MongoDB database client wrapper
│       │   └── env.js           # Env validator and exporter
│       ├── controllers/         # Request handlers (MVC)
│       │   └── health.controller.js
│       ├── middleware/          # Security, validation, handlers
│       │   └── errorHandler.js
│       ├── models/              # Mongoose schemas (12 initial collections)
│       │   ├── User.js
│       │   ├── Profile.js
│       │   ├── Publication.js
│       │   ├── Project.js
│       │   ├── Research.js
│       │   ├── Message.js
│       │   ├── Notification.js
│       │   ├── Community.js
│       │   ├── Event.js
│       │   ├── SavedResearch.js
│       │   ├── Follow.js
│       │   └── Collaboration.js
│       ├── routes/              # Express Router mapping (/api/v1)
│       │   ├── index.js
│       │   └── health.routes.js
│       ├── services/            # Business logic layer
│       ├── utils/               # AppError classes & utility scripts
│       │   └── AppError.js
│       ├── validations/         # express-validator schemas
│       └── uploads/             # File storage destination (multer)
│
└── Frontend/                    # React.js (Vite) + Tailwind CSS v4
    ├── .env
    ├── .env.example
    ├── .eslintrc.json
    ├── .prettierrc
    ├── index.html
    ├── jsconfig.json            # Absolute path alias config (@/*)
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx             # React entry point
        ├── App.jsx              # Routing and Provider root
        ├── index.css            # Tailwind directive configuration
        ├── assets/              # Static media files
        ├── components/          # Reusable view components
        │   └── common/
        │       ├── Button.jsx
        │       ├── Card.jsx
        │       ├── ErrorBoundary.jsx
        │       ├── Input.jsx
        │       └── Loading.jsx
        ├── context/             # React Context Providers (e.g. AuthContext)
        ├── hooks/               # Custom React hooks (e.g. useAuth)
        ├── layouts/             # Grid templates (MainLayout, AuthLayout)
        │   ├── AuthLayout.jsx
        │   └── MainLayout.jsx
        ├── pages/               # Views / Route destinations
        │   ├── Auth/
        │   │   ├── Login.jsx
        │   │   └── Register.jsx
        │   ├── Home/
        │   │   └── Home.jsx
        │   └── NotFound/
        │       └── NotFound.jsx
        ├── routes/              # Centralized route definitions
        │   └── AppRoutes.jsx
        ├── services/            # API interaction layer (Axios)
        │   └── api.js
        ├── styles/              # Supplemental stylesheets
        ├── utils/               # Formatting and general utility files
        └── constants/           # Constant API links, page URLs
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas cluster connection string)

### Setup & Installation

Follow these instructions to get the application up and running on your local machine.

#### 1. Clone the repository and navigate inside:
```bash
git clone <repository-url>
cd Research-Connect
```

#### 2. Backend Setup
1. Open a terminal and navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Duplicate the `.env.example` file and name it `.env`
   - Fill in your local database connection URI, JWT secret, and port details:
     ```env
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/research_connect
     JWT_SECRET=your_jwt_secret_here_make_it_long
     CLIENT_URL=http://localhost:5173
     NODE_ENV=development
     ```
4. Start the backend server:
   - For development (with auto-reload using `nodemon`):
     ```bash
     npm run dev
     ```
   - For production launch:
     ```bash
     npm start
     ```

#### 3. Frontend Setup
1. Open a new terminal and navigate to the `Frontend` directory:
   ```bash
   cd ../Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Duplicate the `.env.example` file and name it `.env`
   - Configure the target API base URL:
     ```env
     VITE_API_URL=http://localhost:5000/api/v1
     ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client application should now be accessible at `http://localhost:5173`.*

---

## 🏛️ Architectural Standards & Best Practices

### Backend Architecture
- **MVC & Service Decoupling**: Controllers handle API routing and HTTP request/response mappings. The Service layer isolates raw business logic from the HTTP requests.
- **RESTful API**: Standardized JSON responses for consistency and seamless integration:
  ```json
  {
    "success": true,
    "message": "Detailed description of results",
    "data": {},
    "error": null
  }
  ```
- **Error Handling**: A robust global error handler catches and normalizes exceptions (validation issues, MongoDB failures, token expiry) avoiding process crashes.
- **Security Headers**: Secured via `helmet` and standard CORS settings.

### Frontend Architecture
- **Tailwind CSS v4**: Built with `@tailwindcss/vite` integration, completely eliminating verbose configuration scripts.
- **Path Aliasing**: Enables absolute imports using `@/*` mapping directly to `src/*`, avoiding brittle relative paths (`../../../components`).
- **Client routing**: Controlled via `react-router-dom` with layout wrappers.
- **Error Boundaries**: Uses React Error Boundary components to contain runtime failures without breaking the entire client experience.

## 🤝 Branching Strategy

To keep the development workflow structured and clean:
- `main`: Production-ready branch. Direct commits are restricted.
- `development`: Main integration branch where tested features are combined.
- `frontend`: Feature development branch specifically for the UI.
- `backend`: Feature development branch specifically for servers and schemas.
