# Job Management API

A robust RESTful API built with Express and Mongoose for managing users and job postings. This backend service allows users to handle standard account profiles, create new job listings, and perform advanced searches on available jobs.

## 🚀 Features

* **User Management**: Complete CRUD operations for handling user profiles.
* **Job Management**: Secure creation, updates, and deletion of job listings.
* **Advanced Search**: Filter and search jobs using flexible query parameters.

---

## 🛠️ Tech Stack

* **Runtime Environment**: Node.js
* **Backend Framework**: Express.js
* **Database**: MongoDB
* **ODM (Object Data Modeling)**: Mongoose

## ⚙️ Getting Started

### Prerequisites
* Node.js (v24+ recommended)
* Docker with mongodb server https://hub.docker.com/r/mongodb/mongodb-community-server

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/vovakliuf-source/dobby
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   copy config.env.example to .env.example in config folder: // No idea why course "teacher" not uses .env and update values it's values

4. **Start the server**
   ```bash
   
   # Development mode (with nodemon)
   npm run dev
   ```
   The server will start running at `http://localhost:3000`.

---