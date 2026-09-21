# Project Report

**Project:** Student Class Management
**Type:** Intern Coding Test — Laravel API + React
**Author:** <Your Name>
**Date:** <Month Year>
**Repository:** <GitHub URL>
**Live Demo:** <Frontend URL> · <Backend API URL>

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Objectives](#2-objectives)
3. [Scope](#3-scope)
4. [Requirements Traceability](#4-requirements-traceability)
5. [System Architecture](#5-system-architecture)
6. [Database Design](#6-database-design)
7. [Backend Implementation](#7-backend-implementation)
8. [Frontend Implementation](#8-frontend-implementation)
9. [Validation Strategy](#9-validation-strategy)
10. [Testing](#10-testing)
11. [CI/CD and Deployment](#11-cicd-and-deployment)
12. [Challenges and Solutions](#12-challenges-and-solutions)
13. [Evaluation Against Requirements](#13-evaluation-against-requirements)
14. [Future Improvements](#14-future-improvements)
15. [Conclusion](#15-conclusion)

---

## 1. Executive Summary

This report documents the design, implementation, testing, and deployment of a full-stack **Student Class Management** application built for the Intern Coding Test.

The application delivers a Laravel 11 REST API backed by MySQL and a React 18 + TypeScript single-page frontend. It supports complete CRUD for students, class listing and creation, search, filtering, pagination, dual-layer validation, loading and error states, and delete confirmation.

Beyond the base requirements, the project includes automated feature tests, a three-workflow CI/CD pipeline, Dockerized production images, and automatic deployment to Render via Docker Hub and deploy hooks.

All functional requirements in the test brief are implemented and verified.

---

## 2. Objectives

The primary objectives were:

1. Build a Laravel REST API exposing the five student endpoints specified in the brief.
2. Enforce the specified validation rules on the server.
3. Build a React frontend that consumes the API and covers the required UX features.
4. Provide database migrations and a working local development setup.
5. Deliver a repository with a clear README and screenshots.
6. Demonstrate production-grade practices beyond the minimum: tests, CI/CD, containerization, and automated deploys.

Secondary objectives (self-imposed, to demonstrate engineering maturity):

- Type safety across the frontend.
- Consistent, accessible UI primitives.
- A stable JSON API contract via Laravel API Resources.
- Reproducible production builds via multi-stage Docker images.

---

## 3. Scope

### In scope

- Student CRUD (create, read, update, delete)
- Class listing and creation
- Server-side validation matching the brief
- Client-side validation mirroring server rules
- Search by name/email, filter by class, pagination
- Loading, empty, and error states
- Delete confirmation
- Automated tests, CI, container images, and deployment
- Documentation: README, API reference, project report

### Out of scope

- Authentication and authorization
- Multi-tenancy
- File uploads
- Real-time updates
- Class editing/deletion via UI (only list + create exposed)
- Internationalization

These are noted in the [Future Improvements](#14-future-improvements) section.

---

## 4. Requirements Traceability

| # | Requirement (from brief) | Where implemented | Status |
|---|---|---|---|
| 1 | `students` table with required columns | `database/migrations/*_create_students_table.php` | ✅ |
| 2 | `GET /api/students` | `StudentController@index` | ✅ |
| 3 | `POST /api/students` | `StudentController@store` | ✅ |
| 4 | `GET /api/students/{id}` | `StudentController@show` | ✅ |
| 5 | `PUT /api/students/{id}` | `StudentController@update` | ✅ |
| 6 | `DELETE /api/students/{id}` | `StudentController@destroy` | ✅ |
| 7 | CRUD from the frontend | `StudentListPage`, `StudentCreatePage`, `StudentEditPage` | ✅ |
| 8 | Show name, email, phone, class | `StudentTable.tsx` | ✅ |
| 9 | Validate required fields, show API errors | Zod + `applyApiErrors` | ✅ |
| 10 | Frontend connects to Laravel API | `src/api/*.ts` | ✅ |
| 11 | Loading states | Skeleton, spinner, disabled buttons | ✅ |
| 12 | Delete confirmation | `ConfirmDialog.tsx` (Headless UI) | ✅ |
| 13 | Class name: required, string, max 255 | `StoreClassRequest` | ✅ |
| 14 | `class_id`: required, must exist | `StoreStudentRequest` / `UpdateStudentRequest` | ✅ |
| 15 | Student name: required | Same | ✅ |
| 16 | Email: required, valid, unique | Same (unique ignores self on update) | ✅ |
| 17 | Phone: optional | Same | ✅ |
| 18 | GitHub repository | Delivered | ✅ |
| 19 | Migrations | Delivered | ✅ |
| 20 | README with setup instructions | `README.md` | ✅ |
| 21 | Screenshots | `docs/screenshots/` | ✅ |

---

## 5. System Architecture

### 5.1 High-level diagram

```
┌─────────────────────────┐        HTTPS        ┌──────────────────────────┐
│  React SPA (nginx)      │ ───────────────────▶│  Laravel API (nginx +    │
│  Static bundle served   │                     │  PHP-FPM + supervisord)  │
│  from Docker image      │◀─────────────────── │  JSON over HTTP          │
└─────────────────────────┘                     └───────────┬──────────────┘
                                                            │ PDO/MySQL
                                                            ▼
                                                ┌──────────────────────────┐
                                                │  MySQL 8 database        │
                                                └──────────────────────────┘
```

### 5.2 Runtime components

| Component | Responsibility |
|---|---|
| React SPA | Renders UI, manages client state, calls API |
| nginx (frontend) | Serves the built SPA, SPA fallback routing |
| nginx (backend) | Serves Laravel `public/`, proxies PHP to FPM |
| PHP-FPM | Executes Laravel app |
| supervisord | Runs nginx + FPM in one container |
| MySQL 8 | Persists classes and students |

### 5.3 Local development

For developer velocity, MySQL runs in Docker while Laravel and Vite run natively. This avoids container rebuild cycles during iteration and keeps debugging straightforward.

For production, both apps ship as self-contained Docker images (backend: nginx + FPM + supervisord; frontend: nginx serving static assets).

---

## 6. Database Design

### 6.1 Entity-relationship

```
classes (1) ────< students (N)
```

### 6.2 `classes`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT UNSIGNED | PK, auto-increment |
| `name` | VARCHAR(255) | NOT NULL |
| `created_at`, `updated_at` | TIMESTAMP | nullable |

### 6.3 `students`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT UNSIGNED | PK, auto-increment |
| `class_id` | BIGINT UNSIGNED | FK → `classes.id`, `ON DELETE CASCADE` |
| `name` | VARCHAR(255) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `phone` | VARCHAR(255) | NULL |
| `created_at`, `updated_at` | TIMESTAMP | nullable |

### 6.4 Design decisions

- **Separate `classes` table.** The brief only lists `students`, but validation requires `class_id` to exist and class names to be validated. A dedicated table is the cleanest way to satisfy both.
- **Cascade delete.** Removing a class removes its students, keeping referential integrity without manual cleanup.
- **Model name `SchoolClass`.** `Class` is a PHP reserved word, so the model uses `SchoolClass` while `protected $table = 'classes'` keeps the table name natural.
- **Unique email at the DB level.** Enforced both in validation and via a unique index, so the invariant survives direct inserts.

---

## 7. Backend Implementation

### 7.1 Stack

- Laravel 11, PHP 8.3
- Eloquent ORM
- Form Requests for validation
- API Resources for responses
- Pest for tests

### 7.2 Routes

```php
Route::apiResource('students', StudentController::class);
Route::apiResource('classes', ClassController::class)->only(['index', 'store']);
```

### 7.3 Controllers

`StudentController` implements `index`, `store`, `show`, `update`, `destroy`.

- `index` supports `page`, `search` (LIKE on name or email), and `class_id` filtering, returning a paginated `StudentResource` collection.
- `store` and `update` accept validated input from Form Requests and return a single `StudentResource`.
- `destroy` returns a JSON message.

`ClassController` implements `index` and `store`.

### 7.4 Validation

Encapsulated in Form Requests:

- `StoreStudentRequest` — required `class_id` (exists), `name` (max 255), `email` (valid, unique), optional `phone` (max 20).
- `UpdateStudentRequest` — same as store, except the email unique check ignores the current student's ID.
- `StoreClassRequest` — required `name`, string, max 255.

### 7.5 Resources

- `StudentResource` — includes `class` when `schoolClass` is loaded via `whenLoaded`, avoiding an extra request from the frontend.
- `ClassResource` — `{ id, name }`.

### 7.6 Seeding

`DatabaseSeeder` creates 5 classes and 10 students per class (50 students total). This gives the frontend realistic pagination and filter data out of the box.

---

## 8. Frontend Implementation

### 8.1 Stack

React 18 + TypeScript + Vite + Tailwind CSS + React Router + TanStack Query + Axios + React Hook Form + Zod + Headless UI + Sonner.

### 8.2 Structure

- `src/api/*` — typed HTTP layer (never touched directly by components)
- `src/hooks/*` — TanStack Query hooks for each operation
- `src/components/*` — reusable UI (form, table, modal, pagination, skeleton, empty state)
- `src/pages/*` — route-level views
- `src/lib/*` — Zod schemas and error mapping helpers
- `src/types/*` — shared TypeScript types

### 8.3 State management

Server state is owned entirely by TanStack Query. Mutations invalidate the relevant query keys (`['students']`, `['student', id]`), so lists and detail views stay fresh after writes. No global client-state library is used.

### 8.4 Forms

React Hook Form + Zod provide client-side validation. On submit, the payload is posted to the API. If the server returns `422`, `applyApiErrors` maps Laravel's `errors` object to the corresponding form field, so the same validation message surfaces whether the rule lives on the client or the server.

### 8.5 UX states

Every async surface has explicit states:

- Table: skeleton rows while loading, empty state with CTA when no results, error card with a retry path.
- Edit page: spinner while fetching, error card on failure.
- Buttons: disabled + spinner while pending.
- Global: toast on mutation success or failure.

### 8.6 Accessibility

The delete confirmation uses Headless UI's `Dialog`, which provides focus trapping, `Escape` to close, and correct ARIA attributes.

---

## 9. Validation Strategy

Validation is enforced on both sides deliberately:

| Layer | Tool | Purpose |
|---|---|---|
| Client | Zod via React Hook Form | Immediate feedback, reduced server round-trips |
| Server | Laravel Form Requests | Authoritative enforcement, protects the API |
| Database | Column constraints | Last-resort integrity (unique email, FK) |

Errors from the server are mapped to the field that failed. This pattern ensures that any rule the client cannot know (e.g. uniqueness) still surfaces in the correct place in the UI.

---

## 10. Testing

### 10.1 Approach

Backend feature tests written in Pest, running against **SQLite in-memory** for speed and zero external dependencies. Each test uses `RefreshDatabase`, so state is isolated.

### 10.2 Coverage

- List students with pagination metadata
- Show single student with embedded class
- 404 for missing student
- Create a valid student
- Reject missing required fields
- Reject invalid email
- Reject duplicate email on create
- Reject duplicate email on update for another student
- Allow updating without changing email
- Reject non-existent `class_id`
- Update a student
- Delete a student
- Filter by `search`
- Filter by `class_id`
- Class list
- Class create + validation (required, max length)

### 10.3 Running

```bash
cd backend
php artisan test
```

### 10.4 Results

All tests pass on every push via the backend CI workflow.

---

## 11. CI/CD and Deployment

### 11.1 Pipeline

Three GitHub Actions workflows:

| Workflow | Trigger | Purpose |
|---|---|---|
| `backend-ci.yml` | Backend changes | MySQL service + migrations + `php artisan test` |
| `frontend-ci.yml` | Frontend changes | `npm ci`, `tsc --noEmit`, lint, `npm run build` |
| `publish.yml` | Push to `main` | Build both images, push to Docker Hub, trigger Render deploy |

### 11.2 Images

- **Backend:** multi-stage — Composer install in one stage, PHP-FPM + nginx + supervisord in the runtime stage. `.env` baked from build args (all sourced from GitHub Secrets). Entrypoint runs migrations, caches config/routes/views, and hands off to supervisord.
- **Frontend:** multi-stage — Vite build with `VITE_API_URL` as a build arg, then static assets served by nginx with SPA fallback and long-lived asset caching.

### 11.3 Deployment flow

```
push to main
  → GitHub Actions builds & pushes images to Docker Hub
  → curl Render deploy hooks
  → Render pulls :latest and redeploys both services
```

Environment changes are made by updating GitHub Secrets and re-running the publish workflow. No secrets live in the repo or in any Dockerfile.

### 11.4 Local production smoke test

Both Dockerfiles can be built locally to verify the images before pushing.

---

## 12. Challenges and Solutions

**1. Model name conflict with PHP reserved word `Class`.**
Resolved by naming the model `SchoolClass` and setting `protected $table = 'classes'`.

**2. `class_id` must exist, but the brief only lists a `students` table.**
Introduced a `classes` table with a foreign key. This satisfies the `exists` rule and the class-name validation requirement without weakening the schema.

**3. Mapping Laravel 422 errors to React Hook Form fields.**
Built `applyApiErrors`, which inspects the `errors` object and calls `setError(field, ...)` for each known field. Unmapped errors fall back to a general banner.

**4. Keeping pagination smooth when changing pages.**
Used TanStack Query's `keepPreviousData` so the table doesn't flash empty between pages.

**5. Running nginx and PHP-FPM in one Render container.**
Render exposes a single port and expects HTTP, but PHP-FPM speaks FastCGI. Added nginx in front of FPM and supervised both with supervisord. The entrypoint patches the nginx config to listen on `$PORT`.

**6. Baked env vars vs runtime env.**
Per project requirements, secrets are baked into the backend image at build time via Docker build args populated from GitHub Secrets. This is simpler to operate (no env injection at container start) at the cost of needing a rebuild when a secret changes. This trade-off is documented.

---

## 13. Evaluation Against Requirements

| Requirement | Met | Notes |
|---|---|---|
| Student CRUD via REST | ✅ | All five endpoints implemented |
| Display name, email, phone, class | ✅ | Embedded class via API Resource |
| Validate required fields | ✅ | Client + server |
| Show API errors | ✅ | Mapped to the exact form field |
| Frontend connects to API | ✅ | Typed Axios layer |
| Loading states | ✅ | Skeletons, spinners, disabled buttons |
| Delete confirmation | ✅ | Accessible modal |
| Migrations | ✅ | `classes`, `students` |
| README + setup | ✅ | `README.md` |
| Screenshots | ✅ | `docs/screenshots/` |
| **Extras** | | |
| Automated tests | ✅ | Pest, feature-level |
| CI pipeline | ✅ | Backend + frontend workflows |
| Containerized production | ✅ | Multi-stage Dockerfiles |
| Automated deployment | ✅ | Docker Hub → Render deploy hooks |
| API documentation | ✅ | `docs/API.md` |

---

## 14. Future Improvements

Given more time, the following would be prioritized:

1. **Authentication** — Sanctum tokens or session auth, with per-user student ownership.
2. **Class management UI** — edit and delete classes, with safeguards for classes that still have students.
3. **Policies and authorization** — role-based access (admin vs teacher vs viewer).
4. **Frontend tests** — Vitest + React Testing Library for components and hooks.
5. **E2E tests** — Playwright covering create → edit → delete flows.
6. **Search + sort** — sortable columns, richer search (phone, class name).
7. **Soft deletes and audit log** — recover deleted students, track who changed what.
8. **Bulk actions** — multi-select delete, class reassignment.
9. **Observability** — structured logs, Sentry, uptime monitoring.
10. **Rate limiting** — throttle write endpoints.
11. **Runtime env for backend** — move from baked `.env` to runtime injection via a secrets manager, avoiding image rebuilds on secret rotation.
12. **Internationalization** — support for additional locales.

---

## 15. Conclusion

The application fully satisfies the intern coding test requirements and demonstrates production-oriented engineering beyond the minimum:

- A clean, well-structured Laravel API with explicit validation and a stable JSON contract.
- A typed, accessible React frontend with robust UX states and dual-layer validation.
- Automated tests and a three-workflow CI/CD pipeline that builds, publishes, and deploys both services.
- Clear documentation for reviewers and future maintainers.

The project reflects a pragmatic approach: meet the specification precisely, then add the engineering practices that make the result reliable and reviewable.

---

## Appendix A — Key Files

| Path | Purpose |
|---|---|
| `backend/app/Http/Controllers/Api/StudentController.php` | Student CRUD |
| `backend/app/Http/Requests/*` | Validation |
| `backend/app/Http/Resources/*` | JSON shaping |
| `backend/tests/Feature/StudentApiTest.php` | Student feature tests |
| `frontend/src/pages/StudentListPage.tsx` | List + search + filter + delete |
| `frontend/src/components/StudentForm.tsx` | Shared create/edit form |
| `frontend/src/lib/errorMapping.ts` | 422 → form field mapping |
| `.github/workflows/*.yml` | CI/CD |
| `backend/Dockerfile`, `frontend/Dockerfile` | Production images |

## Appendix B — Running the Tests

```bash
cd backend
php artisan test
```

## Appendix C — Deploying

1. Push to `main`.
2. Wait for `publish.yml` to finish.
3. Render auto-deploys via deploy hooks.

See `README.md` for details.

---

*End of report.*