# Automated Scheduler API

Automated Scheduler API adalah layanan berbasis **REST API** untuk mengelola tugas, penjadwalan otomatis, dan autentikasi berbasis JWT. API ini mendukung fitur untuk signup, login, task management, dan task scheduling menggunakan algoritma Greedy Scheduler.

---

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Auth](#auth)
    - [Sign Up User](#sign-up-user)
    - [Login User](#login-user)
  - [Tasks](#tasks)
    - [Create Task(s)](#create-tasks)
    - [Retrieve All Tasks](#retrieve-all-tasks)
    - [Delete Task by ID](#delete-task-by-id)
    - [Delete All Tasks](#delete-all-tasks)
  - [Schedule](#schedule)
    - [Generate Schedule](#generate-schedule)
    - [Retrieve All Schedules](#retrieve-all-schedules)

---

## Base URL
```plaintext
http://localhost:3000
```

---

## Authentication
Semua endpoint yang dilindungi memerlukan header berikut untuk otentikasi:
```plaintext
Authorization: Bearer <JWT_TOKEN>
```
JWT token diperoleh setelah proses **Sign Up** atau **Login**.

---

## Endpoints

### Auth

#### Sign Up User
- **URL**: `/auth/signup`
- **Method**: `POST`

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
    "token": "<JWT_TOKEN>"
}
```
- **Error (400/500):**
```json
{
    "error": "Error message"
}
```

#### Login User
- **URL**: `/auth/login`
- **Method**: `POST`

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
    "token": "<JWT_TOKEN>"
}
```
- **Error (400/404/500):**
```json
{
    "error": "Error message"
}
```

---

### Tasks

#### Create Task(s)
- **URL**: `/tasks`
- **Method**: `POST`

**Headers:**
```plaintext
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Body (Single Task):**
```json
{
    "task_name": "Task A",
    "deadline": "2025-01-05T10:00:00Z",
    "duration": 120,
    "priority": 1
}
```

**Body (Multiple Tasks):**
```json
[
    {
        "task_name": "Task B",
        "deadline": "2025-01-05T12:00:00Z",
        "duration": 60,
        "priority": 2
    },
    {
        "task_name": "Task C",
        "deadline": "2025-01-05T14:00:00Z",
        "duration": 90,
        "priority": 3
    }
]
```

**Response:**
- **Success (201):**
```json
{
    "message": "Task(s) added successfully",
    "data": [
        {
            "id": "<UUID>",
            "task_name": "Task A",
            "deadline": "2025-01-05T10:00:00Z",
            "duration": 120,
            "priority": 1,
            "user_id": "<USER_ID>",
            "created_at": "2025-01-04T10:00:00Z"
        }
    ]
}
```
- **Error (400/500):**
```json
{
    "error": "Error message"
}
```

#### Retrieve All Tasks
- **URL**: `/tasks`
- **Method**: `GET`

**Headers:**
```plaintext
Authorization: Bearer <JWT_TOKEN>
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
        "priority": 1,
        "user_id": "<USER_ID>",
        "created_at": "2025-01-04T10:00:00Z"
    }
]
```
- **Error (500):**
```json
{
    "error": "Error message"
}
```

#### Delete Task by ID
- **URL**: `/tasks/:id`
- **Method**: `DELETE`

**Headers:**
```plaintext
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- **Success (200):**
```json
{
    "message": "Task deleted successfully"
}
```
- **Error (400/404/500):**
```json
{
    "error": "Error message"
}
```

#### Delete All Tasks
- **URL**: `/tasks/all`
- **Method**: `DELETE`

**Headers:**
```plaintext
Authorization: Bearer <JWT_TOKEN>
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
    "error": "Error message"
}
```

---

### Schedule

#### Generate Schedule
- **URL**: `/schedule/generate`
- **Method**: `POST`

**Headers:**
```plaintext
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- **Success (200):**
```json
{
    "message": "Schedule generated successfully",
    "schedule": [
        {
            "task_id": "<UUID>",
            "task_name": "Task A",
            "start_time": "2025-01-05T08:00:00Z",
            "end_time": "2025-01-05T10:00:00Z"
        }
    ]
}
```
- **Error (400/500):**
```json
{
    "error": "Error message"
}
```

#### Retrieve All Schedules
- **URL**: `/schedule`
- **Method**: `GET`

**Headers:**
```plaintext
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- **Success (200):**
```json
{
    "message": "Schedules retrieved successfully",
    "schedules": [
        {
            "task_id": "<UUID>",
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
- **Error (404/500):**
```json
{
    "error": "Error message"
}