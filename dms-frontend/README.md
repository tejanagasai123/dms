# DocuFlow – DMS Frontend

DocuFlow Frontend is a modern, responsive web application for the DocuFlow Document Management System. Built with **Angular** and styled with **TailwindCSS**, it offers a premium user experience for managing, sharing, and tracking documents.

## Key Features

*   **Authentication**: Clean and secure Login and Registration screens with JWT handling.
*   **Documents Dashboard**: A rich grid view of documents with real-time search, filtering, and tag-based navigation.
*   **Universal Uploads**: Drag-and-drop support for uploading any file type (PDF, images, docs) with metadata.
*   **Document Details**: Dedicated view for document metadata, previews, and full version history.
*   **Permissions UI**: Intuitive interface for sharing documents with specific users.
*   **Responsive Design**: Fully responsive layout that works on desktop and mobile.

## Tech Stack

*   **Framework**: Angular (v21.0.0)
*   **Styling**: TailwindCSS (v3.4.16)
*   **Routing**: Angular Router
*   **HTTP**: Angular HttpClient
*   **Forms**: Reactive Forms
*   **Icons**: Heroicons (via SVG)

## Project Structure

```
dms-frontend/
  src/app/
    core/
      services/
        auth.service.ts       # Authentication logic & state
        document.service.ts   # API calls for documents
      interceptors/
        auth.interceptor.ts   # Adds JWT to headers
      guards/
        auth.guard.ts         # Protects routes
      models/                 # TypeScript interfaces
    auth/
      login/                  # Login component
      register/               # Registration component
    documents/
      document-list/          # Dashboard/Grid view
      document-upload/        # Upload form
      document-detail/        # Details & Version history
    layout/
      navbar/                 # Main navigation
    shared/                   # Reusable components
    app.routes.ts             # Route definitions
    app.component.*           # Root component
```

## UI Overview

*   **Login / Register**: Entry points for the app. Users can create an account or sign in to access their dashboard.
*   **Documents Dashboard**: The main hub. Displays documents as interactive cards. Includes a search bar and tag filters.
*   **Upload Document**: A form to upload new files. Users can add a title, description, and tags.
*   **Document Details**: Shows deep details about a file. Users can download specific versions or upload new ones.
*   **Permissions**: (Integrated into details) Allows owners to grant access to other registered users.

## Theming & Design

The application follows a "Clean SaaS" aesthetic:
*   **Color Palette**: Uses a professional primary blue/indigo scale, with soft grays for backgrounds and borders.
*   **Components**: Custom-styled buttons, inputs, and cards using Tailwind utility classes.
*   **Feedback**: Interactive states (hover, focus) and visual cues (loading spinners, success/error messages).

## Routing

*   `/login`: Sign in page.
*   `/register`: Sign up page.
*   `/documents`: Main dashboard (Guarded).
*   `/documents/upload`: Upload page (Guarded).
*   `/documents/:id`: Document details (Guarded).
*   `/documents/:id/permissions`: Permissions management (Guarded).

*Note: All `/documents` routes are protected by the `AuthGuard`. Unauthenticated users are redirected to `/login`.*

## Authentication Flow

1.  **Login**: User submits credentials. The backend validates and returns a JWT.
2.  **Storage**: The JWT is stored securely (e.g., localStorage) by the `AuthService`.
3.  **Interceptor**: The `AuthInterceptor` automatically attaches the token (`Authorization: Bearer <token>`) to every outgoing HTTP request.
4.  **Guards**: The `AuthGuard` checks for a valid token before allowing navigation to protected routes.

## Environment Configuration

Configuration is managed in `src/environments/`. Ensure the `apiBaseUrl` matches your backend server.

**`environment.ts`**:
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api'
};
```

## Installation & Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd dms-frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Verify Backend**:
    Ensure the `dms-backend` server is running (usually on port 3000).

4.  **Start the Application**:
    ```bash
    npm start
    # OR
    ng serve
    ```

5.  **Access the App**:
    Open your browser and go to `http://localhost:4200`.

## How to Use

1.  **Register**: Create a new account on the Register screen.
2.  **Upload**: Click "Upload Document" in the navbar. Select a file and add tags (e.g., "finance", "report").
3.  **Search**: On the dashboard, type in the search bar to filter documents by title.
4.  **View Details**: Click "View Details" on any card to see its history or download the file.

## Integration with Backend

This frontend is strictly a consumer of the `dms-backend` API. It relies on the backend for:
*   User validation and token issuance.
*   File storage and retrieval.
*   Search logic and permission checks.

## Future Improvements

*   **Dark Mode**: Full dark theme support using Tailwind's `dark:` modifier.
*   **Drag & Drop**: Enhanced upload zone with drag-and-drop support.
*   **File Previews**: In-browser PDF and image rendering.
*   **Admin Panel**: Dedicated UI for system administrators to manage users.
