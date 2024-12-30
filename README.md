# Application Overview

This is a web application built with a vanilla JavaScript frontend and a Node.js backend. It uses PostgreSQL for data storage, with the database managed through a Docker container.

## Features

- **Frontend**: Vanilla JavaScript served using the http-server package.
- **Backend**: Node.js API.
- **Database**: PostgreSQL managed with Docker Compose (or an alternative setup).
- **Environment Configuration**: `.env` file for managing application variables.

## Prerequisites

- **Node.js**: Install Node.js (>= 14.x recommended).

  - [Download Node.js](https://nodejs.org/)

- **Docker**: Install Docker and Docker Compose.

  - [Install Docker](https://www.docker.com/get-started)

- **PostgreSQL Client** (optional, for manual database inspection): Use a tool like psql, **DBeaver**, or pgAdmin.

- **http-server**: Install http-server globally to serve the frontend.
  ```bash
  npm install -g http-server
  ```

# Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Start the Database with Docker Compose (or Alternative)

#### Option 1: Using Docker Compose

Ensure Docker is running, then execute:

```bash
docker-compose up -d
```

This will:

- Start a PostgreSQL container with the specified credentials.
- Expose the database on `localhost:5432`.

### Option 2: Without Docker (Alternative)

If you prefer not to use Docker, you can manually set up PostgreSQL by:

Installing PostgreSQL locally.
Creating a database named `postgres` and configuring the connection settings according to the `.env` file.

### 4. Install Backend Dependencies

Navigate to the backend directory and install dependencies:

```bash
npm install
```

### 5. Start the Backend Server

Run the Node.js API server:

```bash
node server.js
```

The API will be available at `http://localhost:5000`.

### 6. Serve the Frontend

Navigate to the directory containing your frontend files (e.g., public or client) and start the server:

```bash
http-server -p 8080
```

The frontend will be accessible at `http://localhost:8080`.

### Additional Notes

To stop the Docker container, use:

```bash
docker-compose down
```

If you use VSCode Live Server for the client, it refreshes the page on some form submissions.

### Important Notes:

- **Password for any user of the system is** : `hashed_password1`
- There will be no files initially for demonstration, you 'll have to manually upload in each case.

- Recommended users for presentation:
  **Instructor**: Jane Smith
  **Student**: John Doe
  **Secretariat**: Jake Wilson
