# API Documentation

Base URL (local): `http://127.0.0.1:8000/api`
Base URL (production): `https://<your-backend>.onrender.com/api`

All requests must send:
```
Accept: application/json
Content-Type: application/json   (for POST/PUT)
```

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Errors](#2-errors)
3. [Students](#3-students)
   - [List students](#31-list-students)
   - [Get a student](#32-get-a-student)
   - [Create a student](#33-create-a-student)
   - [Update a student](#34-update-a-student)
   - [Delete a student](#35-delete-a-student)
4. [Classes](#4-classes)
   - [List classes](#41-list-classes)
   - [Create a class](#42-create-a-class)
5. [Data Models](#5-data-models)

---

## 1. Conventions

- All responses are JSON.
- Timestamps are ISO 8601 UTC strings.
- Paginated lists use Laravel's paginator shape: `data`, `meta`, `links`.
- Successful `POST` returns `201 Created`.
- Successful `PUT` / `GET` return `200 OK`.
- Successful `DELETE` returns `200 OK` with a `message` field.
- Unknown resource IDs return `404 Not Found`.

---

## 2. Errors

### Validation error — `422 Unprocessable Entity`
Returned when the request body fails validation.

```json
{
  "message": "The email has already been taken. (and 1 more error)",
  "errors": {
    "email": ["The email has already been taken."],
    "class_id": ["The selected class id is invalid."]
  }
}
```

Each key in `errors` matches a form field. The frontend maps them back to inputs.

### Not found — `404 Not Found`
```json
{ "message": "No query results for model [App\\Models\\Student] 9999" }
```

### Server error — `500 Internal Server Error`
```json
{ "message": "Server Error" }
```

---

## 3. Students

### 3.1 List students

```http
GET /api/students
```

**Query parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `page` | integer | no | Page number (default `1`) |
| `search` | string | no | Case-insensitive match on `name` or `email` |
| `class_id` | integer | no | Filter by class |

**Example**
```bash
curl "http://127.0.0.1:8000/api/students?page=1&search=aung&class_id=2" \
  -H "Accept: application/json"
```

**Response — `200 OK`**
```json
{
  "data": [
    {
      "id": 1,
      "class_id": 2,
      "name": "Aung Aung",
      "email": "aung@example.com",
      "phone": "09123456789",
      "class": { "id": 2, "name": "Computer Science" },
      "created_at": "2026-09-21T10:00:00.000000Z",
      "updated_at": "2026-09-21T10:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 48
  },
  "links": {
    "first": "http://127.0.0.1:8000/api/students?page=1",
    "last":  "http://127.0.0.1:8000/api/students?page=5",
    "prev":  null,
    "next":  "http://127.0.0.1:8000/api/students?page=2"
  }
}
```

---

### 3.2 Get a student

```http
GET /api/students/{id}
```

**Path parameters**

| Name | Type | Description |
|---|---|---|
| `id` | integer | Student ID |

**Example**
```bash
curl http://127.0.0.1:8000/api/students/1 \
  -H "Accept: application/json"
```

**Response — `200 OK`**
```json
{
  "data": {
    "id": 1,
    "class_id": 2,
    "name": "Aung Aung",
    "email": "aung@example.com",
    "phone": "09123456789",
    "class": { "id": 2, "name": "Computer Science" },
    "created_at": "2026-09-21T10:00:00.000000Z",
    "updated_at": "2026-09-21T10:00:00.000000Z"
  }
}
```

**Errors**
- `404 Not Found` if the student doesn't exist.

---

### 3.3 Create a student

```http
POST /api/students
```

**Request body**

| Field | Type | Required | Rules |
|---|---|---|---|
| `class_id` | integer | yes | Must exist in `classes.id` |
| `name` | string | yes | Max 255 |
| `email` | string | yes | Valid email, unique in `students` |
| `phone` | string | no | Max 20 |

**Example**
```bash
curl -X POST http://127.0.0.1:8000/api/students \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "class_id": 1,
    "name": "Aung Aung",
    "email": "aung@example.com",
    "phone": "09123456789"
  }'
```

**Response — `201 Created`**
```json
{
  "data": {
    "id": 51,
    "class_id": 1,
    "name": "Aung Aung",
    "email": "aung@example.com",
    "phone": "09123456789",
    "class": { "id": 1, "name": "Computer Science" },
    "created_at": "2026-09-21T10:00:00.000000Z",
    "updated_at": "2026-09-21T10:00:00.000000Z"
  }
}
```

**Errors**
- `422 Unprocessable Entity` on validation failure.

---

### 3.4 Update a student

```http
PUT /api/students/{id}
```

**Path parameters**

| Name | Type | Description |
|---|---|---|
| `id` | integer | Student ID |

**Request body** — same rules as create, except the unique email check ignores the current student's ID.

**Example**
```bash
curl -X PUT http://127.0.0.1:8000/api/students/51 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "class_id": 2,
    "name": "Aung Aung Updated",
    "email": "aung@example.com",
    "phone": "0999999999"
  }'
```

**Response — `200 OK`**
```json
{
  "data": {
    "id": 51,
    "class_id": 2,
    "name": "Aung Aung Updated",
    "email": "aung@example.com",
    "phone": "0999999999",
    "class": { "id": 2, "name": "Information Technology" },
    "created_at": "2026-09-21T10:00:00.000000Z",
    "updated_at": "2026-09-21T10:30:00.000000Z"
  }
}
```

**Errors**
- `404 Not Found` if the student doesn't exist.
- `422 Unprocessable Entity` on validation failure.

---

### 3.5 Delete a student

```http
DELETE /api/students/{id}
```

**Example**
```bash
curl -X DELETE http://127.0.0.1:8000/api/students/51 \
  -H "Accept: application/json"
```

**Response — `200 OK`**
```json
{ "message": "Student deleted successfully" }
```

**Errors**
- `404 Not Found` if the student doesn't exist.

---

## 4. Classes

### 4.1 List classes

```http
GET /api/classes
```

Returns all classes. Used to populate the class dropdown on the student form and filter.

**Example**
```bash
curl http://127.0.0.1:8000/api/classes \
  -H "Accept: application/json"
```

**Response — `200 OK`**
```json
{
  "data": [
    { "id": 1, "name": "Computer Science" },
    { "id": 2, "name": "Information Technology" }
  ]
}
```

---

### 4.2 Create a class

```http
POST /api/classes
```

**Request body**

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | yes | Max 255 |

**Example**
```bash
curl -X POST http://127.0.0.1:8000/api/classes \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{ "name": "Data Science" }'
```

**Response — `201 Created`**
```json
{ "data": { "id": 3, "name": "Data Science" } }
```

**Errors**
- `422 Unprocessable Entity` if `name` is missing or exceeds 255 chars.

---

## 5. Data Models

### Student
| Field | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `class_id` | integer | FK → `classes.id` |
| `name` | string | |
| `email` | string | Unique |
| `phone` | string \| null | Optional |
| `class` | object | Embedded `Class` when loaded |
| `created_at` | string (ISO 8601) | |
| `updated_at` | string (ISO 8601) | |

### Class
| Field | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `name` | string | Max 255 |

---

## Quick Reference

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/students` | List students |
| POST | `/api/students` | Create student |
| GET | `/api/students/{id}` | Show student |
| PUT | `/api/students/{id}` | Update student |
| DELETE | `/api/students/{id}` | Delete student |
| GET | `/api/classes` | List classes |
| POST | `/api/classes` | Create class |

---

## Postman / Insomnia

Import a collection by creating a new collection and adding these seven requests with the base URL set to `{{base_url}}` = `http://127.0.0.1:8000/api`. No auth headers are required.