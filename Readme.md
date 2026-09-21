# Student Class Management

Full-stack student management app built for the **Intern Coding Test: Laravel API + React/Vue**.

- **Backend:** Laravel 11 REST API + MySQL
- **Frontend:** React 18 + TypeScript (Vite)
- **Database:** MySQL 8 (Docker for local dev)
- **Tests:** PEST tests on PHP Units
- **CI/CD:** GitHub Actions → Docker Hub → Render (auto-deploy on push)
- **Deployment:** Students and Classes >>GENERATED RANDOM<<
- **Application link** https://student-management-frontend-lert.onrender.com/students

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Highlights](#3-architecture-highlights)
4. [Project Structure](#4-project-structure)
5. [Local Setup](#5-local-setup)
6. [Environment Variables](#6-environment-variables)
7. [API Reference](#7-api-reference)
8. [Validation Rules](#8-validation-rules)
9. [Testing](#9-testing)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Deployment](#11-deployment)
12. [Screenshots](#12-screenshots)
13. [Scripts](#13-scripts)

---

## 1. Overview

A monorepo with a Laravel API and a React SPA covering full student CRUD, class listing, search, filtering, pagination, client + server validation, loading/empty/error states, and delete confirmation.

```
student-management/
├── backend/            Laravel API
├── frontend/           React + TypeScript (Vite)
├── docker-compose.yml  MySQL for local dev
└── .github/workflows/  CI + publish pipelines
```

---

## 2. Tech Stack

### Backend
| Concern | Choice | Why |
|---|---|---|
| Framework | Laravel 11 | Required by test, batteries included |
| Language | PHP 8.3 | Typed features, modern Laravel |
| Database | MySQL 8 | Required by test |
| ORM | Eloquent | Clean relations + pagination |
| Validation | Form Requests | Thin controllers, single source of truth |
| API shape | API Resources | Stable JSON contract |
| Tests | Pest on PHPUnit | Concise syntax, fast to write |
| Test DB | SQLite in-memory | No external dependency |

### Frontend
| Concern | Choice | Why |
|---|---|---|
| Framework | React 18 | Most in-demand, chosen for this test |
| Language | TypeScript | Type safety, fewer runtime bugs |
| Build | Vite | Instant HMR, fast prod builds |
| Styling | Tailwind CSS v3 | Fast iteration, consistent design |
| Routing | React Router v6 | Standard client routing |
| Server state | TanStack Query v5 | Caching, loading/error, retries |
| HTTP | Axios | Typed responses + interceptors |
| Forms | React Hook Form | Minimal re-renders |
| Validation | Zod | Reusable schema + inferred types |
| Modal | Headless UI | Accessible delete confirmation |
| Toasts | Sonner | Lightweight notifications |
| Icons | Lucide React | Tree-shakeable |

### DevOps
| Concern | Choice |
|---|---|
| Container DB (local) | Docker Compose |
| Prod images | Multi-stage Dockerfiles |
| Registry | Docker Hub |
| CI | GitHub Actions (test + build) |
| CD | GitHub Actions → Render deploy hooks |

---

## 3. Architecture Highlights

**Backend**
- **Form Requests** (`StoreStudentRequest`, `UpdateStudentRequest`, `StoreClassRequest`) own all validation. Controllers only orchestrate.
- **API Resources** (`StudentResource`, `ClassResource`) embed the related class via `whenLoaded`, so the frontend never makes a second request for class names.
- **Separate `classes` table** with FK + `onDelete('cascade')` — required because `class_id` must exist and class name is validated.
- **Model named `SchoolClass`** (with `protected $table = 'classes'`) because `Class` is a PHP reserved word.
- **Index endpoint supports `page`, `search`, `class_id`** — no extra routes needed for filtering.
- **Pest feature tests** cover CRUD, validation failures, unique email, invalid class_id, search, and filter.

**Frontend**
- **TanStack Query** owns all server state. Mutations invalidate the right query keys so lists stay fresh after create/update/delete.
- **Typed API layer** (`src/api/*.ts`) — components never touch Axios directly.
- **Zod schema shared** between React Hook Form and TypeScript types, so form shape and validation can’t drift.
- **Laravel 422 errors are mapped to the exact failing form field** via `applyApiErrors`. Non-field errors become a banner.
- **Debounced search** (`useDebouncedValue`, 300 ms) to avoid chatty requests.
- **`keepPreviousData`** on pagination so the table doesn’t flash empty when changing pages.
- **Accessible delete modal** (Headless UI `Dialog`) with focus trap and spinner while pending.
- **Explicit UX states everywhere:** skeleton rows, spinner on edit, empty state with CTA, error card, toasts.

---

## 4. Project Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/{Student,Class}Controller.php
│   │   ├── Requests/{Store,Update}StudentRequest.php, StoreClassRequest.php
│   │   └── Resources/{Student,Class}Resource.php
│   └── Models/{Student,SchoolClass}.php
├── database/{factories,migrations,seeders}/
├── routes/api.php
├── tests/Feature/{StudentApiTest,ClassApiTest}.php
├── docker/{nginx.conf,supervisord.conf,entrypoint.sh}
├── Dockerfile
└── .env.example

frontend/
├── src/
│   ├── api/{axios,students,classes}.ts
│   ├── components/{ConfirmDialog,EmptyState,FormField,Layout,
│   │               LoadingSpinner,Pagination,StudentForm,
│   │               StudentTable,TableSkeleton}.tsx
│   ├── hooks/{useStudents,useStudent,useClasses,
│   │          useCreateStudent,useUpdateStudent,
│   │          useDeleteStudent,useDebouncedValue}.ts
│   ├── lib/{errorMapping.ts,validators.ts}
│   ├── pages/{StudentListPage,StudentCreatePage,StudentEditPage}.tsx
│   ├── types/index.ts
│   ├── App.tsx
│   └── main.tsx
├── Dockerfile
├── nginx.conf
└── .env.example

.github/workflows/
├── backend-ci.yml
├── frontend-ci.yml
└── publish.yml
```

---

## 5. Local Setup

**Prerequisites:** PHP 8.3+, Composer 2, Node 20+, Docker Desktop.

```bash
# 1. Start MySQL
docker compose up -d

# 2. Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve            # http://127.0.0.1:8000

# 3. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev                  # http://localhost:5173
```

Default local DB: `student_management` / user `laravel` / pass `secret`.

---

## 6. Environment Variables

**`backend/.env` (local)**
```
APP_NAME="Student Management"
APP_ENV=local
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=student_management
DB_USERNAME=laravel
DB_PASSWORD=secret

FRONTEND_URL=http://localhost:5173
```

**`frontend/.env` (local)**
```
VITE_API_URL=http://127.0.0.1:8000/api
```

**Production:** all values live in **GitHub Secrets** and are baked into the images at build time (see [CI/CD](#10-cicd-pipeline)).

---

## 7. API Reference

Base URL: `http://127.0.0.1:8000/api`

### Students
| Method | Endpoint | Description |
|---|---|---|
| GET | `/students` | List (paginated) |
| POST | `/students` | Create |
| GET | `/students/{id}` | Show |
| PUT | `/students/{id}` | Update |
| DELETE | `/students/{id}` | Delete |

Query params for `GET /students`: `page`, `search` (name/email), `class_id`.

### Classes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/classes` | List all |
| POST | `/classes` | Create |

### Example
```bash
curl -X POST http://127.0.0.1:8000/api/students \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"class_id":1,"name":"Aung Aung","email":"aung@example.com","phone":"09123456789"}'
```

**Paginated response**
```json
{
  "data": [ /* StudentResource[] */ ],
  "meta": { "current_page": 1, "last_page": 5, "per_page": 10, "total": 48 },
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." }
}
```

**Validation error (422)**
```json
{
  "message": "The email has already been taken.",
  "errors": { "email": ["The email has already been taken."] }
}
```

---

## 8. Validation Rules

| Field | Rules |
|---|---|
| `class_id` | required, integer, `exists:classes,id` |
| `name` | required, string, max 255 |
| `email` | required, valid email, unique (ignores current ID on update) |
| `phone` | optional, string, max 20 |
| class `name` | required, string, max 255 |

Client-side Zod schema mirrors these rules. Server is authoritative.

---

## 9. Testing

Backend feature tests use **Pest** with **SQLite in-memory**.

```bash
cd backend
php artisan test
```

Coverage:
- List with pagination metadata
- Show single student with embedded class
- 404 for missing student
- Create valid student
- Reject missing required fields
- Reject invalid email
- Reject duplicate email (create + update)
- Reject non-existent `class_id`
- Update student (including unchanged email)
- Delete student
- Filter by `search` and `class_id`
- Class list + create
- Class name required + max length

---

## 10. CI/CD Pipeline

Three workflows under `.github/workflows/`:

### `backend-ci.yml`
Runs on backend changes:
- Spins up MySQL 8 service container
- Installs Composer deps (cached)
- Runs migrations
- Runs `php artisan test`

### `frontend-ci.yml`
Runs on frontend changes:
- Node 20 + npm cache
- `npm ci`
- `tsc --noEmit` (type check)
- `npm run lint`
- `npm run build`

### `publish.yml`
Runs on push to `main`:
1. Builds `backend` image (multi-stage: Composer → PHP-FPM + nginx + supervisord)
2. Builds `frontend` image (multi-stage: Node build → nginx static)
3. Pushes both to Docker Hub (`:latest` and `:<git-sha>`)
4. Hits Render deploy hooks → Render pulls new images and redeploys

**All secrets live in GitHub Secrets:**
`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `APP_KEY`, `APP_URL`, `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `FRONTEND_URL`, `VITE_API_URL`, `RENDER_DEPLOY_HOOK_BACKEND`, `RENDER_DEPLOY_HOOK_FRONTEND`.

Backend env vars are baked into the image at build time. Frontend `VITE_API_URL` is baked at build time (Vite compiles it into the bundle).

---

## 11. Deployment

**Render setup (per service):**
1. New → Web Service → Existing Image
2. Image: `docker.io/<user>/student-management-{backend,frontend}:latest`
3. Backend: port `10000`, health check `/up`
4. Frontend: nginx serves on port 80, Render maps it
5. Copy the **Deploy Hook URL** into GitHub Secrets

**Push to main → automatic:**
```
GitHub Actions builds → pushes to Docker Hub → triggers Render hook → Render pulls + redeploys
```

To change any env var: update the GitHub Secret → re-run the publish workflow.

---

## 12. Screenshots

Place under `docs/screenshots/`.

```markdown
![Student list](docs/screenshots/student-list.png)
![Create form with validation](docs/screenshots/student-create.png)
![Edit form](docs/screenshots/student-edit.png)
![Delete confirmation](docs/screenshots/student-delete.png)
![Empty state](docs/screenshots/empty-state.png)
```

Recommended set: list, create with errors, edit, delete modal, empty state, mobile view.

---

## 13. Scripts

**Backend**
| Command | Description |
|---|---|
| `php artisan serve` | Run API |
| `php artisan migrate --seed` | Migrate + seed |
| `php artisan migrate:fresh --seed` | Reset DB |
| `php artisan test` | Run tests |
| `php artisan route:list` | List routes |

**Frontend**
| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Type-check + prod build |
| `npm run preview` | Preview prod build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## Notes for Reviewers

- All required endpoints from the test are implemented with the exact paths specified.
- The `classes` table + endpoints exist because `class_id` must reference an existing record and class name is validated.
- Client and server validation run in parallel; server 422 errors are mapped to the exact failing field.
- Loading, empty, error, and confirmation states exist on every relevant screen.
- Tests cover happy paths and validation failures.
- Fully responsive down to mobile.