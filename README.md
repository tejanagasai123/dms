# Document Management System (DMS)

This project consists of a Node.js/Express backend and an Angular frontend.

## Prerequisites

- **Node.js**: v18+ recommended
- **Angular CLI**: v21.0.1 (as per package.json)
- **Express**: v5.1.0
- **MongoDB**: Ensure MongoDB is running locally on port `27017` or update `.env` with your URI.

## Setup

### 1. Backend Setup

Navigate to the backend folder and install dependencies:

```bash
cd dms-backend
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Ensure `.env` has the following configuration (default):
```properties
PORT=3000
MONGO_URI=mongodb://localhost:27017/dms_db
JWT_SECRET=supersecretkey_change_this_in_production
UPLOAD_DIR=uploads
```

### 2. Frontend Setup

Navigate to the frontend folder and install dependencies:

```bash
cd dms-frontend
npm install
```

## Running the Application

You will need two terminal windows.

### Terminal 1: Start Backend

```bash
cd dms-backend
npm start
```
The backend will run on `http://localhost:3000`.

### Terminal 2: Start Frontend

```bash
cd dms-frontend
npm start
```
The frontend will open automatically at `http://localhost:4200`.

## Testing the Flow

1.  **Register**: Go to `/register` and create a new account.
2.  **Login**: Log in with your new credentials.
3.  **Upload**: Click "Upload Document" to add a file (PDF, image, etc.).
4.  **View**: Click on a document to view details.
5.  **Versions**: In document details, upload a new version of the file.
6.  **Permissions**: If you are the owner, click "Manage Permissions" to share access.

## Troubleshooting

- **CORS Errors**: Ensure the backend is running on port 3000 and the frontend on port 4200.
- **Connection Refused**: Ensure MongoDB is running.
