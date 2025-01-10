# Automated Scheduler API

Automated Scheduler API adalah layanan berbasis **REST API** untuk mengelola tugas, penjadwalan otomatis, dan autentikasi berbasis JWT. API ini menyediakan fitur untuk pendaftaran pengguna, autentikasi, pengelolaan tugas, dan penjadwalan menggunakan algoritma Greedy Scheduler.

---

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Auth](#auth)
    - [Sign Up User](#sign-up-user)
    - [Login User](#login-user)
    - [OAuth Authentication](#oauth-authentication)
  - [Tasks](#tasks)
    - [Create Task(s)](#create-tasks)
    - [Retrieve All Tasks](#retrieve-all-tasks)
    - [Update Task by ID](#update-task-by-id)
    - [Delete Task(s)](#delete-tasks)
    - [Delete All Tasks](#delete-all-tasks)
  - [Schedule](#schedule)
    - [Generate Schedule](#generate-schedule)
    - [Retrieve All Schedules](#retrieve-all-schedules)
    - [Generate External Schedule](#generate-external-schedule)

---

## Base URL
```plaintext
https://api.taskly.web.id
```

---

## Authentication
Semua endpoint yang dilindungi memerlukan header berikut:
```plaintext
Authorization: Bearer <YOUR_JWT_TOKEN>
```

JWT token diperoleh melalui proses **Sign Up**, **Login**, atau **OAuth Authentication**.

---

## Endpoints

### Auth

#### Sign Up User
- **URL**: `/auth/signup`
- **Method**: `POST`
- **Deskripsi**: Mendaftarkan pengguna baru.

**Headers:**
```plaintext
Content-Type: application/json
```

**Body:**
```json
{
    "username": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

**Response:**
- **Success (201):**
```json
{
    "message": "User signed up successfully",
    "token": "<YOUR_JWT_TOKEN>"
}
```
- **Error (400):**
  - Missing Fields:
  ```json
  {
      "error": "Missing required fields: username, email, or password"
  }
  ```
  - Weak Password:
  ```json
  {
      "error": "Password must be at least 8 characters long"
  }
  ```
  - Duplicate Email:
  ```json
  {
      "error": "Email already registered."
  }
  ```
- **Error (500):**
```json
{
    "error": "Error inserting new user"
}
```

#### Login User
- **URL**: `/auth/login`
- **Method**: `POST`
- **Deskripsi**: Login pengguna untuk mendapatkan token JWT.

**Headers:**
```plaintext
Content-Type: application/json
```

**Body:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response:**
- **Success (200):**
```json
{
    "message": "Login successful",
    "token": "<YOUR_JWT_TOKEN>"
}
```
- **Error (400):**
```json
{
    "error": "Missing required fields: email or password"
}
```
- **Error (404):**
```json
{
    "error": "User not found."
}
```
- **Error (401):**
```json
{
    "error": "Invalid password"
}
```
- **Error (500):**
```json
{
    "error": "Internal Server Error"
}
```

#### OAuth Authentication
- **URL**: `/auth/oauth`
- **Method**: `POST`
- **Deskripsi**: Autentikasi menggunakan OAuth untuk mendapatkan token akses.

**Headers:**
```plaintext
Content-Type: application/json
```

**Body:**
```json
{
    "provider": "google",
    "access_token": "<PROVIDER_ACCESS_TOKEN>"
}
```

**Response:**
- **Success (200):**
```json
{
    "message": "OAuth authentication successful",
    "token": "<YOUR_JWT_TOKEN>"
}
```
- **Error (400):**
```json
{
    "error": "Access token is missing"
}
```
- **Error (500):**
```json
{
    "error": "Internal Server Error"
}
```

---

### Tasks

#### Create Task(s)
- **URL**: `/tasks`
- **Method**: `POST`
- **Deskripsi**: Menambahkan satu atau beberapa tugas baru.

**Headers:**
```plaintext
Content-Type: application/json
Authorization: Bearer <YOUR_JWT_TOKEN>
```

**Body:**
```json
[
    {
        "task_name": "Task A",
        "deadline": "2025-01-05T10:00:00Z",
        "duration": 120,
        "priority": 1
    }
]
```

**Response:**
- **Success (201):**
```json
{
    "message": "Tasks added successfully",
    "data": [
        {
            "id": "<UUID>",
            "task_name": "Task A",
            "deadline": "2025-01-05T10:00:00Z",
            "duration": 120,
            "priority": 1
        }
    ]
}
```
- **Error (400):**
  - Invalid Input:
  ```json
  {
      "error": "Invalid input, an array of tasks is required"
  }
  ```
  - Missing Fields:
  ```json
  {
      "error": "Missing required fields in one or more tasks"
  }
  ```
- **Error (500):**
```json
{
    "error": "Internal Server Error"
}
```

#### Retrieve All Tasks
- **URL**: `/tasks`
- **Method**: `GET`
- **Deskripsi**: Mengambil semua tugas pengguna yang diautentikasi.

**Headers:**
```plaintext
Authorization: Bearer <YOUR_JWT_TOKEN>
```

**Response:**
- **Success (200):**
```json
[
    {
        "id": "<UUID>",
        "task_name": "Task A",
        "deadline": "2025-01-05T10:00:00Z",
        "duration": 120,
        "priority": 1
    }
]
```
- **Error (500):**
```json
{
    "error": "Internal Server Error"
}
```

#### Update Task by ID
- **URL**: `/tasks/:id`
- **Method**: `PUT`
- **Deskripsi**: Memperbarui tugas berdasarkan ID.

**Headers:**
```plaintext
Content-Type: application/json
Authorization: Bearer <YOUR_JWT_TOKEN>
```

**Body:**
```json
{
    "task_name": "Updated Task",
    "deadline": "2025-01-06T10:00:00Z",
    "duration": 60,
    "priority": 2
}
```

**Response:**
- **Success (200):**
```json
{
    "message": "Task updated successfully"
}
```
- **Error (400):**
```json
{
    "error": "Missing required fields"
}
```
- **Error (404):**
```json
{
    "error": "Task not found or unauthorized"
}
```
- **Error (500):**
```json
{
    "error": "Failed to update task"
}
```

#### Delete Task(s)
- **URL**: `/tasks`
- **Method**: `DELETE`
- **Deskripsi**: Menghapus satu atau lebih tugas berdasarkan ID.

**Headers:**
```plaintext
Content-Type: application/json
Authorization: Bearer <YOUR_JWT_TOKEN>
```

**Body:**
```json
{
    "ids": ["<UUID1>", "<UUID2>"]
}
```

**Response:**
- **Success (200):**
```json
{
    "message": "Tasks deleted successfully",
    "deletedIds": ["<UUID1>", "<UUID2>"]
}
```
- **Error (400):**
  - Invalid Input:
  ```json
  {
      "error": "Invalid input, an array of IDs is required"
  }
  ```
  - Invalid ID Format:
  ```json
  {
      "error": "Invalid ID format: <ID>"
  }
  ```
- **Error (404):**
```json
{
    "error": "No tasks found to delete or not authorized"
}
```
- **Error (500):**
```json
{
    "error": "Internal Server Error"
}
```

#### Delete All Tasks
- **URL**: `/tasks/all`
- **Method**: `DELETE`
- **Deskripsi**: Menghapus semua tugas pengguna yang diautentikasi.

**Headers:**
```plaintext
Authorization: Bearer <YOUR_JWT_TOKEN>
```

**Response:**
- **Success (200):**
```json
{
    "message": "All tasks deleted successfully"
}
```
- **Error (500):**
```json
{
    "error": "Failed to delete tasks"
}
```

---

### Schedule

#### Generate Schedule
- **URL**: `/schedule/generate`
- **Method**: `POST`
- **Deskripsi**: Membuat jadwal otomatis berdasarkan tugas pengguna atau permintaan layanan.

**Headers:**
```plaintext
Authorization: Bearer <YOUR_JWT_TOKEN>
```

**Body (Service Request):**
```json
{
    "userId": "<USER_ID>"
}
```

**Response:**
- **Success (200):**
```json
{
    "message": "Schedule generated successfully",
    "scheduledTasks": [
        {
            "task_id": "<TASK_ID>",
            "start_time": "2025-01-05T08:00:00Z",
            "end_time": "2025-01-05T10:00:00Z"
        }
    ],
    "unscheduledTasks": []
}
```
- **Error (400):**
  - Missing User ID (for service request):
  ```json
  {
      "error": "Missing userId for service request"
  }
  ```
  - No Tasks to Schedule:
  ```json
  {
      "error": "No tasks available to schedule"
  }
  ```
- **Error (403):**
```json
{
    "error": "Invalid authentication type"
}
```
- **Error (500):**
```json
{
    "error": "Failed to delete old schedule"
}
```

#### Retrieve All Schedules
- **URL**: `/schedule`
- **Method**: `GET`
- **Deskripsi**: Mengambil semua jadwal pengguna yang diautentikasi.

**Headers:**
```plaintext
Authorization: Bearer <YOUR_JWT_TOKEN>
```

**Response:**
- **Success (200):**
```json
{
    "message": "Schedules retrieved successfully",
    "schedules": [
        {
            "task_id": "<TASK_ID>",
            "start_time": "2025-01-05T08:00:00Z",
            "end_time": "2025-01-05T10:00:00Z",
            "tasks": {
                "task_name": "Task A",
                "priority": 1,
                "deadline": "2025-01-05T10:00:00Z"
            }
        }
    ]
}
```
- **Error (500):**
```json
{
    "error": "Internal Server Error"
}
```

#### Generate External Schedule
- **URL**: `/schedule/external`
- **Method**: `POST`
- **Deskripsi**: Membuat jadwal berdasarkan tugas yang dikirimkan oleh layanan eksternal.

**Headers:**
```plaintext
Authorization: Bearer <YOUR_SERVICE_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
    "tasks": [
        {
            "task_name": "Task A",
            "deadline": "2025-01-05T10:00:00Z"
        }
    ]
}
```

**Response:**
- **Success (200):**
```json
{
    "message": "Schedule generated successfully",
    "scheduledTasks": [
        {
            "task_name": "Task A",
            "start_time": "2025-01-05T08:00:00Z",
            "end_time": "2025-01-05T10:00:00Z"
        }
    ],
    "unscheduledTasks": []
}
```
- **Error (400):**
  - Missing or Invalid Tasks:
  ```json
  {
      "error": "Tasks are required"
  }
  ```
  - Invalid Task Fields:
  ```json
  {
      "error": "One or more tasks have invalid or missing fields: task_name and deadline are required."
  }
  ```
- **Error (500):**
```json
{
    "error": "Internal Server Error"
}
```

