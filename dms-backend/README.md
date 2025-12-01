# DocuFlow – DMS Backend

DocuFlow is a robust Document Management System (DMS) backend built with Node.js, Express, and MongoDB. It provides secure authentication, document storage with version control, and a flexible permissions system. This API serves as the core for the DocuFlow frontend.

## Key Features

*   **Authentication & Authorization**: Secure user registration and login using JSON Web Tokens (JWT). Supports role-based access control (Admin, User).
*   **Document Upload & Storage**: Handles file uploads (PDFs, images, etc.) using Multer. Files are stored locally (configurable), with metadata and paths saved in MongoDB.
*   **Tagging & Search**: Documents can be tagged for easy categorization. Includes search functionality to find documents by title or tags.
*   **Permissions Model**: Granular control over who can view or edit specific documents.
*   **Version Control**: Maintains a history of document versions. Each update creates a new `DocumentVersion`, preserving the integrity of previous files.

## Tech Stack

*   **Runtime**: Node.js (v18+)
*   **Framework**: Express.js (v5.1.0)
*   **Database**: MongoDB (with Mongoose ODM v9.0.0)
*   **File Handling**: Multer
*   **Authentication**: JSON Web Tokens (JWT)
*   **Utilities**: `bcryptjs` (hashing), `cors` (cross-origin requests), `dotenv` (env vars), `helmet` (security headers), `morgan` (logging).

## Project Structure

```
dms-backend/
  src/
    config/
      db.js                 # Database connection logic
    models/
      User.js               # User schema
      Document.js           # Document metadata schema
      DocumentVersion.js    # Schema for specific file versions
    controllers/
      authController.js     # Logic for login/register
      documentController.js # Logic for CRUD, upload, and versions
    routes/
      authRoutes.js         # Routes for /api/auth
      documentRoutes.js     # Routes for /api/documents
    middleware/
      authMiddleware.js     # Protects routes, verifies JWT
      roleMiddleware.js     # Checks user roles (e.g., admin)
      errorHandler.js       # Global error handling
    utils/
      fileUpload.js         # Multer configuration
    app.js                  # Express app setup and middleware
    server.js               # Server entry point
  uploads/                  # Directory for uploaded files (gitignored)
  .env.example              # Example environment variables
  package.json              # Dependencies and scripts
```

## Data Models

*   **User**: Stores user credentials (hashed password), email, name, and role (`user` or `admin`).
*   **Document**: Represents the "container" for a file. Stores the `title`, `description`, `tags`, `owner`, `allowedUsers` (permissions), and a reference to the `currentVersion`.
*   **DocumentVersion**: Represents a specific iteration of a file. Stores the `filePath`, `fileSize`, `mimeType`, `versionNumber`, and upload timestamp.
    *   *Versioning Concept*: When a document is updated, a new `DocumentVersion` is created and linked to the parent `Document`. The `Document`'s `currentVersion` field is updated to point to the new version.

## API Overview

### Auth
*   `POST /api/auth/register`: Register a new user.
*   `POST /api/auth/login`: Authenticate and receive a JWT.

### Documents
*   `POST /api/documents`: Upload a new document (multipart/form-data).
*   `GET /api/documents`: List all documents (supports search/filter).
*   `GET /api/documents/:id`: Get details of a specific document.
*   `PUT /api/documents/:id`: Update document metadata or upload a new version.
*   `DELETE /api/documents/:id`: Delete a document and its versions.

### Versions
*   `GET /api/documents/:id/versions`: Get the version history of a document.
*   `GET /api/documents/:id/versions/:versionId/download`: Download a specific version.

## Authentication & Authorization

*   **JWT**: Upon successful login, the server issues a signed JWT.
*   **Usage**: Clients must send this token in the `Authorization` header for protected routes:
    ```
    Authorization: Bearer <your_token_here>
    ```
*   **Middleware**: The `protect` middleware verifies the token and attaches the user to `req.user`. The `admin` middleware checks if `req.user.role === 'admin'`.

## Environment Variables

Create a `.env` file in the root directory. Use `.env.example` as a reference:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/docuflow
JWT_SECRET=your_super_secret_jwt_key_change_this
UPLOAD_DIR=uploads
NODE_ENV=development
```

## Installation & Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd dms-backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Copy `.env.example` to `.env` and update the values (especially `MONGO_URI` if using Atlas).
    ```bash
    cp .env.example .env
    ```

4.  **Start MongoDB**:
    Ensure your local MongoDB instance is running, or have your Atlas connection string ready.

5.  **Run the Server**:
    *   Development (with nodemon):
        ```bash
        npm run dev
        ```
    *   Production:
        ```bash
        npm start
        ```

The API will be available at `http://localhost:3000/api` (default).

## Running in Development

*   **Logs**: Server logs (requests, errors) will appear in the terminal via `morgan`.
*   **Testing**: Use tools like **Postman** or **Insomnia** to test endpoints. Import the collection (if available) or create requests against `http://localhost:3000/api`.
*   **Uploads**: Uploaded files will appear in the `uploads/` folder.

## Integration with Frontend

The backend is designed to work seamlessly with the **DocuFlow Frontend** (`dms-frontend`). The frontend proxies requests to the backend API. Ensure both servers are running for the full application experience.

## Future Improvements

*   **Cloud Storage**: Integrate AWS S3 or Google Cloud Storage for scalable file hosting.
*   **Advanced Search**: Implement full-text search using ElasticSearch or MongoDB Atlas Search.
*   **Audit Logs**: Track every view and download action for compliance.
*   **File Previews**: Generate thumbnails or PDF previews on upload.
