# Student Class Management

A full-stack application to manage students and their classes.

- Backend: Laravel REST API with MySQL
- Frontend: React + TypeScript (Vite)
- Database: MySQL 8 running in Docker

Built for the Intern Coding Test: Laravel API + React/Vue, Student Class Management.

---

## Table of Contents

1. Overview
2. Tech Stack
3. Architecture and Design Decisions
4. Project Structure
5. Prerequisites
6. Backend Setup
7. Frontend Setup
8. Environment Variables
9. API Reference
10. Validation Rules
11. Testing
12. Screenshots
13. Available Scripts
14. Notes for Reviewers

---

## 1. Overview

This project implements a Student Class Management system with full CRUD for students, class listing and creation, search, filtering, pagination, client and server-side validation, loading states, error handling, and delete confirmation.

The repository is organized as a monorepo:
student-management/
backend/ Laravel API
frontend/ React + TypeScript app
docker-compose.yml MySQL service
README.md

---

## 2. Tech Stack

### Backend

| Concern | Choice | Reason |
|---|---|---|
| Framework | Laravel 11 | Required by the test, batteries included, strong validation and API tooling |
| Language | PHP 8.2+ | Modern typed features, required by Laravel 11 |
| Database | MySQL 8 (Docker) | Required by the test, isolated and reproducible |
| ORM | Eloquent | Clean relationships, easy pagination |
| Validation | Form Requests | Keeps controllers thin, single source of truth |
| API Shape | API Resources | Consistent JSON, easy relation embedding |
| Testing | Pest (on PHPUnit) | Expressive syntax, faster to write than raw PHPUnit |
| DB in Tests | SQLite in-memory | Fast, no external dependency, runs anywhere |

### Frontend

| Concern | Choice | Reason |
|---|---|---|
| Framework | React 18 | Most requested in job listings, candidate chose React |
| Language | TypeScript | Type safety, better DX, fewer runtime bugs |
| Build Tool | Vite | Instant HMR, fast builds, minimal config |
| Styling | Tailwind CSS v3 | Utility-first, consistent design, fast to iterate |
| Routing | React Router v6 | Standard client-side routing |
| Server State | TanStack Query v5 | Caching, retries, loading/error states out of the box |
| HTTP Client | Axios | Interceptors, typed responses, wide adoption |
| Forms | React Hook Form | Minimal re-renders, simple API, great TS support |
| Schema Validation | Zod | Reusable schema, runtime + compile-time types |
| UI Primitives | Headless UI | Accessible modal for delete confirmation |
| Notifications | Sonner | Lightweight toasts |
| Icons | Lucide React | Clean, tree-shakeable icons |
| Formatting | Prettier | Consistent code style |
| Linting | ESLint | Catch issues early |

---

## 3. Architecture and Design Decisions

### Backend

- **Form Requests for validation.** Each write endpoint has a dedicated request class (`StoreStudentRequest`, `UpdateStudentRequest`, `StoreClassRequest`). This keeps controllers focused on orchestration and makes validation rules easy to locate and test.
- **API Resources for responses.** `StudentResource` and `ClassResource` produce a stable JSON contract. The student resource embeds the related class when loaded via `whenLoaded`, so the frontend never needs a second request to display the class name.
- **Separate `classes` table.** Although the PDF lists only `students`, the validation requires `class_id` to exist and a class name to be present. A dedicated `classes` table with a foreign key and `onDelete('cascade')` satisfies both requirements cleanly.
- **Model name `SchoolClass`.** `Class` is a reserved word in PHP, so the model is named `SchoolClass` with `protected $table = 'classes'`. This avoids parse conflicts while keeping the table name natural.
- **Pagination, search, filter on the index endpoint.** `GET /api/students` accepts `page`, `search` (name or email), and `class_id` query parameters. This keeps the endpoint flexible without adding new routes.
- **Feature tests with Pest.** CRUD paths, validation failures, unique email, non-existent `class_id`, search, and filter are all covered. SQLite in-memory keeps tests fast and dependency-free.
- **Seeders and factories.** Running `php artisan migrate --seed` produces realistic demo data for screenshots and manual testing.

### Frontend

- **TanStack Query for server state.** No Redux, no manual caching. Queries handle loading, error, retry, and cache invalidation automatically. Mutations invalidate the relevant query keys so lists and detail views stay fresh after create, update, or delete.
- **Typed API layer.** `src/api/*.ts` wraps Axios and returns typed data. Components never call Axios directly, which keeps the transport layer swappable and testable.
- **Zod schema shared between form and types.** `studentSchema` drives React Hook Form validation and produces `StudentFormValues`, so form shape and validation can never drift apart.
- **Server-side 422 errors mapped to form fields.** `applyApiErrors` inspects Laravel's `{ message, errors }` payload and pushes each message onto the corresponding React Hook Form field. Non-field errors surface as a general banner. Users see the same validation behavior whether the rule lives on the client or the server.
- **Debounced search.** `useDebouncedValue` waits 300 ms before firing a request, reducing chatty calls while typing.
- **Optimistic-feeling pagination.** `keepPreviousData` from TanStack Query keeps the current page visible while the next page loads, so the table does not flash empty.
- **Accessible delete confirmation.** Headless UI's `Dialog` provides focus trapping, escape handling, and ARIA attributes. The confirm button shows a spinner while the mutation runs and disables both buttons to prevent double submission.
- **Consistent UX states.** Every async surface has explicit loading, empty, error, and success states: skeleton rows for the table, spinner on the edit page, empty state with a call to action, error card with a retry path, and toasts for mutation results.
- **Path alias `@/`.** Keeps imports short and refactor-friendly.
- **Tailwind design tokens.** A `brand` color scale in `tailwind.config.js` gives the UI a consistent accent without a component library.

### Cross-cutting

- **Docker for MySQL only.** The database runs in Docker for reproducibility, while Laravel and Vite run natively for fast iteration and simple debugging.
- **Monorepo layout.** Backend and frontend live side by side, so reviewers can clone once and run both.
- **Environment parity.** `.env.example` files are committed for both sides. Real `.env` files are gitignored.

---

## 4. Project Structure
student-management/
backend/
app/
Http/
Controllers/Api/
ClassController.php
StudentController.php
Requests/
StoreClassRequest.php
StoreStudentRequest.php
UpdateStudentRequest.php
Resources/
ClassResource.php
StudentResource.php
Models/
SchoolClass.php
Student.php
database/
factories/
SchoolClassFactory.php
StudentFactory.php
migrations/
..._create_classes_table.php
..._create_students_table.php
seeders/
DatabaseSeeder.php
routes/
api.php
tests/
Feature/
StudentApiTest.php
ClassApiTest.php
.env.example
frontend/
src/
api/
axios.ts
classes.ts
students.ts
components/
ConfirmDialog.tsx
EmptyState.tsx
FormField.tsx
Layout.tsx
LoadingSpinner.tsx
Pagination.tsx
StudentForm.tsx
StudentTable.tsx
TableSkeleton.tsx
hooks/
useClasses.ts
useCreateStudent.ts
useDebouncedValue.ts
useDeleteStudent.ts
useStudent.ts
useStudents.ts
useUpdateStudent.ts
lib/
errorMapping.ts
validators.ts
pages/
StudentCreatePage.tsx
StudentEditPage.tsx
StudentListPage.tsx
types/
index.ts
App.tsx
main.tsx
index.css
.env.example
docker-compose.yml
README.md

text

---

## 5. Prerequisites

- PHP 8.2 or newer with extensions: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`
- Composer 2
- Node.js 18 or newer and npm
- Docker Desktop (for MySQL)
- Optional: a MySQL client such as TablePlus, DBeaver, or the MySQL CLI

Verify:

```bash
php -v
composer -V
node -v
npm -v
docker -v
6. Backend Setup
From the repository root:

bash
# 1. Start MySQL
docker compose up -d

# 2. Install PHP dependencies
cd backend
composer install

# 3. Copy environment file
cp .env.example .env

# 4. Generate application key
php artisan key:generate

# 5. Run migrations and seed demo data
php artisan migrate --seed

# 6. Serve the API
php artisan serve
The API is available at http://127.0.0.1:8000/api.

Default database credentials (from docker-compose.yml):

Setting	Value
Host	127.0.0.1
Port	3306
Database	student_management
Username	laravel
Password	secret
Root password	root
To reset the database:

bash
php artisan migrate:fresh --seed
7. Frontend Setup
In a new terminal:

bash
cd frontend

# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start the dev server
npm run dev
The app runs at http://localhost:5173.

Both servers must be running for the app to work: Laravel on 8000 and Vite on 5173.

8. Environment Variables
backend/.env (relevant keys)
text
APP_NAME="Student Management"
APP_ENV=local
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=student_management
DB_USERNAME=laravel
DB_PASSWORD=secret
frontend/.env
text
VITE_API_URL=http://127.0.0.1:8000/api
Both repositories include .env.example files with the same keys.

9. API Reference
Base URL: http://127.0.0.1:8000/api

Students
Method	Endpoint	Description
GET	/students	List students (paginated)
POST	/students	Create a student
GET	/students/{id}	Get a single student
PUT	/students/{id}	Update a student
DELETE	/students/{id}	Delete a student
Query parameters for GET /students:

Parameter	Type	Description
page	integer	Page number, defaults to 1
search	string	Matches name or email
class_id	integer	Filter by class
Classes
Method	Endpoint	Description
GET	/classes	List all classes
POST	/classes	Create a class
Sample Request
bash
curl -X POST http://127.0.0.1:8000/api/students \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "class_id": 1,
    "name": "Aung Aung",
    "email": "aung@example.com",
    "phone": "09123456789"
  }'
Sample Response
json
{
  "data": {
    "id": 1,
    "class_id": 1,
    "name": "Aung Aung",
    "email": "aung@example.com",
    "phone": "09123456789",
    "class": {
      "id": 1,
      "name": "Computer Science"
    },
    "created_at": "2026-09-21T10:00:00.000000Z",
    "updated_at": "2026-09-21T10:00:00.000000Z"
  }
}
Paginated List Response
json
{
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 48
  },
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": "..."
  }
}
Validation Error Response (HTTP 422)
json
{
  "message": "The email has already been taken. (and 1 more error)",
  "errors": {
    "email": ["The email has already been taken."],
    "class_id": ["The selected class id is invalid."]
  }
}
10. Validation Rules
Student
Field	Rules
class_id	required, integer, exists in classes.id
name	required, string, max 255
email	required, valid email, unique in students
phone	optional, string, max 20
On update, the unique email rule ignores the current student's ID.

Class
Field	Rules
name	required, string, max 255
Client-side rules mirror these using Zod. Server-side rules remain authoritative.

11. Testing
Backend tests use Pest with SQLite in-memory.

bash
cd backend
php artisan test
Coverage includes:

List students with pagination metadata

Show a single student with embedded class

404 for missing student

Create a valid student

Reject missing required fields

Reject invalid email

Reject duplicate email on create

Reject non-existent class_id

Update a student

Allow updating without changing email

Reject duplicate email on update for another student

Delete a student

Filter by search

Filter by class_id

Class list and create

Class name required and max length

To run with coverage (requires Xdebug or PCOV):

bash
php artisan test --coverage
12. Screenshots
Place screenshots in docs/screenshots/ and reference them here.

Recommended set:

Student list with seeded data

Create form with validation errors visible

Edit form prefilled

Delete confirmation modal

Empty state

Mobile view

Example:

markdown
![Student list](docs/screenshots/student-list.png)
![Create form](docs/screenshots/student-create.png)
![Edit form](docs/screenshots/student-edit.png)
![Delete confirmation](docs/screenshots/student-delete.png)
![Empty state](docs/screenshots/empty-state.png)
13. Available Scripts
Backend
Command	Description
php artisan serve	Start the API server
php artisan migrate	Run migrations
php artisan migrate:fresh --seed	Reset database and seed demo data
php artisan db:seed	Seed demo data
php artisan test	Run the test suite
php artisan route:list	List registered routes
Frontend
Command	Description
npm run dev	Start Vite dev server
npm run build	Type-check and build for production
npm run preview	Preview production build
npm run lint	Run ESLint
npm run format	Format with Prettier
14. Notes for Reviewers
All required endpoints from the test are implemented and match the specified paths.

The classes table and endpoints exist to satisfy the requirement that class_id must reference an existing record and that class name is validated.

Client and server validation run in parallel. Server errors are mapped back to the exact form field that failed.

Loading states, empty states, error states, and delete confirmation are present on every relevant screen.

Tests cover both happy paths and validation failures.

The app is responsive and works on mobile viewports.

License
This project was built as a coding test submission and is provided as-is for evaluation purposes.

text

---

Next steps, in order of impact for submission quality:

1. Add the `docs/screenshots/` folder and take the 5 screenshots listed above.
2. Push to GitHub and update the `your-username` placeholder if you add a repository link anywhere.
3. Add a short "Live demo" or "Walkthrough" section if you record a Loom video (optional but strong).

Want me to write the **GitHub Actions CI workflow** next, or help you do a final **polish pass** on the UI before you take screenshots?
