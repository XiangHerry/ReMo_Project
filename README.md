## Project Overview

The **Books & Libraries Management System** is a full-stack web application that allows users to manage books and libraries efficiently. Users can perform Create, Read, Update, and Delete (CRUD) operations on both books and libraries. The system is built with a React frontend, an Express.js backend, and MongoDB for data storage.

## Features

### Books Management

- **Add New Book**: Add books with details like title, ISBN, and authors.
- **Search Books**: Search for books by title.
- **Edit Book**: Update book information.
- **Delete Book**: Remove books from the database.

### Libraries Management

- **Add New Library**: Add libraries with details like title, material type, and inventory.
- **Search Libraries**: Search for libraries by title.
- **Edit Library**: Update library information.
- **Delete Library**: Remove libraries from the database.

## Demo

The application is live and accessible on Netlify:

- **Frontend (Netlify)**: https://ephemeral-biscotti-5b60bd.netlify.app/
- **Backend (Render.com)**: https://remo-project.onrender.com

## Technologies Used

- **Frontend**:
  - React
  - Axios
  - CSS (Inline Styles)

- **Backend**:
  - Node.js
  - Express.js
  - MongoDB
  - Cors
  - dotenv

- **Deployment**:
  - Netlify (Frontend)
  - Render.com (Backend)

## Architecture

The project follows a **client-server** architecture:

- **Frontend**: Built with React, it provides a user-friendly interface for managing books and libraries.
- **Backend**: An Express.js server that handles API requests, interacts with the MongoDB database, and manages business logic.
- **Database**: MongoDB stores data for books and libraries, enabling efficient data retrieval and manipulation.

## Installation

### Prerequisites

- **Node.js**: Ensure you have Node.js installed. [Download Node.js](https://nodejs.org/)
- **MongoDB**: Set up a MongoDB database. You can use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a cloud-based solution.

### Backend Setup

1. **Clone the Repository**

   git clone https://github.com/XiangHerry/ReMo_Project.git
   cd books-libraries-management/backend

2. **Install Dependencies**
    npm install

3. **Run the Backend**
    node server.js

The backend server will run at http://localhost:5001.

4. **Run the Frontend**
Navigate to the Frontend Directory
cd books-libraries-management/frontend

    npm start
The frontend will run at http://localhost:3000