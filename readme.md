# CivicSync Backend

This is the backend API service for the CivicSync application, a platform for reporting and managing community issues. It handles user authentication, issue creation, retrieval, updates, deletion, voting, and status management.

Built with Node.js, Express, TypeScript, and MongoDB (Mongoose).

## Features

*   User Registration and Login (JWT-based authentication)
*   User Profile Retrieval
*   Create, Read, Update, Delete (CRUD) community issues
*   Update Issue Status (Pending -> In Progress -> Resolved) - restricted to issue creator
*   Vote/Support issues
*   List all issues with pagination and filtering (by category, status)
*   List issues created by the logged-in user
*   Proper API structure with controllers, services, models, routes, and middleware.
*   TypeScript for static typing and better code maintainability.

## Technology Stack

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Language:** TypeScript
*   **Database:** MongoDB
*   **ODM:** Mongoose
*   **Authentication:** JSON Web Tokens (JWT)
*   **Password Hashing:** bcryptjs
*   **Environment Variables:** dotenv
*   **CORS:** cors

## Prerequisites

*   [Node.js](https://nodejs.org/) (v16 or higher recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   [MongoDB](https://www.mongodb.com/try/download/community) (running instance, local or remote)

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root of the backend project directory. Copy the contents of `.env.example` (if provided) or add the following variables:

    ```.env
    # Port for the server to run on
    PORT=5000

    # MongoDB connection string
    MONGO_URI=mongodb://localhost:27017/civicsync

    # JWT secret key (use a strong, random string for production)
    JWT_SECRET=your_very_strong_secret_civicsync_key_replace_this
    ```
    **Important:** Use a complex, unpredictable `JWT_SECRET` in production and **do not** commit your `.env` file to version control.

## Running the Application

1.  **Development Mode (with auto-reloading):**
    Uses `ts-node-dev` to run TypeScript directly and automatically restart the server on file changes.
    ```bash
    npm run dev
    # or
    yarn dev
    ```

2.  **Build for Production:**
    Compiles TypeScript to JavaScript in the `dist/` directory.
    ```bash
    npm run build
    # or
    yarn build
    ```

3.  **Production Mode:**
    Runs the compiled JavaScript code from the `dist/` directory. Make sure you've run the build step first.
    ```bash
    npm start
    # or
    yarn start
    ```

## API Endpoints

The base URL depends on your host and port (e.g., `http://localhost:5000`).

### Authentication (`/api/auth`)

*   **`POST /register`**
    *   **Description:** Registers a new user.
    *   **Protection:** Public
    *   **Body:** `{ "name": "string", "email": "string", "password": "string" }`
    *   **Response (201):** `{ "token": "string", "user": { ...userObject } }`

*   **`POST /login`**
    *   **Description:** Logs in an existing user.
    *   **Protection:** Public
    *   **Body:** `{ "email": "string", "password": "string" }`
    *   **Response (200):** `{ "token": "string", "user": { ...userObject } }`

*   **`GET /profile`**
    *   **Description:** Gets the profile of the currently logged-in user.
    *   **Protection:** Auth Required (Bearer Token)
    *   **Response (200):** `{ ...userObject }`

### Issues (`/api/issues`)

*   **`POST /`**
    *   **Description:** Creates a new issue.
    *   **Protection:** Auth Required (Bearer Token)
    *   **Body:** `{ "title": "string", "description": "string", "category": "string", "location": { "lat": number, "lng": number, "address"?: "string" }, "imageUrl"?: "string" }`
    *   **Response (201):** `{ ...issueObject }` (populated `createdBy`)

*   **`GET /`**
    *   **Description:** Gets a paginated list of issues. Supports filtering.
    *   **Protection:** Public
    *   **Query Params:** `page` (number, default: 1), `limit` (number, default: 10), `category` (string), `status` (string: 'Pending', 'In Progress', 'Resolved')
    *   **Response (200):** `{ "items": [{...issueObject}], "total": number, "page": number, "totalPages": number, "hasMore": boolean }`

*   **`GET /:id`**
    *   **Description:** Gets details of a specific issue by its ID.
    *   **Protection:** Public
    *   **Response (200):** `{ ...issueObject }` (populated `createdBy`)

*   **`PUT /:id`**
    *   **Description:** Updates an existing issue (Title, Description, Category, Location, Image). Only allowed by the creator and only if the status is 'Pending'.
    *   **Protection:** Auth Required (Bearer Token)
    *   **Body:** (Partial Issue Data) `{ "title"?: "string", "description"?: "string", ... }`
    *   **Response (200):** `{ ...updatedIssueObject }`

*   **`PATCH /:id/status`**
    *   **Description:** Updates the status of an issue (to 'In Progress' or 'Resolved'). Only allowed by the creator. Cannot change status away from 'Resolved'.
    *   **Protection:** Auth Required (Bearer Token)
    *   **Body:** `{ "status": "In Progress" | "Resolved" }`
    *   **Response (200):** `{ ...updatedIssueObject }`

*   **`DELETE /:id`**
    *   **Description:** Deletes an issue. Only allowed by the creator and only if the status is 'Pending'.
    *   **Protection:** Auth Required (Bearer Token)
    *   **Response (200):** `{ "message": "Issue deleted successfully" }`

*   **`POST /:id/vote`**
    *   **Description:** Adds the current user's vote to an issue. Prevents double voting.
    *   **Protection:** Auth Required (Bearer Token)
    *   **Response (200):** `{ ...updatedIssueObject }` (with incremented votes and user added to `votedBy`)

### Users (`/api/users`)

*   **`GET /my-issues`**
    *   **Description:** Gets all issues created by the currently logged-in user.
    *   **Protection:** Auth Required (Bearer Token)
    *   **Response (200):** `[{...issueObject}]`

## Project Structure
    src/
    ├── app.ts # Express app configuration (middleware, routes)
    ├── server.ts # Server entry point (starts listening)
    ├── config/
    │ └── db.ts # MongoDB connection logic
    ├── controllers/
    │ ├── auth.controller.ts # Logic for authentication routes
    │ └── issue.controller.ts # Logic for issue-related routes
    ├── middleware/
    │ └── auth.middleware.ts # JWT authentication verification
    ├── models/
    │ ├── issue.model.ts # Mongoose schema and model for Issues
    │ └── user.model.ts # Mongoose schema and model for Users
    ├── routes/
    │ ├── auth.routes.ts # Defines authentication API endpoints
    │ ├── issue.routes.ts # Defines issue API endpoints
    │ └── user.routes.ts # Defines user-specific API endpoints (e.g., my-issues)
    ├── types/ # TypeScript type definitions
    │ ├── express/ # Express Request extension
    │ │ └── index.d.ts
    │ └── models.types.ts # Interfaces for Mongoose models
    └── utils/
    └── jwt.ts # JWT signing and verification utilities