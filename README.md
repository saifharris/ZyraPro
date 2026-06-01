# Counselor Student Action Center

A small full-stack application that helps school counselors quickly understand a student's current priorities, pending tasks, unread messages, and overall urgency level.

## Tech Stack

### Frontend

* React
* TypeScript
* Vite

### Backend

* Node.js
* Express
* TypeScript

### Styling

* Plain CSS

---

## Running the Project

### Prerequisites

* Node.js 18 or higher

### Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Start the Backend

```bash
cd backend
npm run dev
```

The backend runs on:

```text
http://localhost:3001
```

### Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

Open the application in your browser and use the student tabs at the top of the page to switch between students.

---

# API Contract

## GET /students/:id/action-center

Returns all information required to display a student's action center.

### Example

```http
GET /students/stu_001/action-center
```

### Success Response

```json
{
  "student": {
    "id": "stu_001",
    "name": "Maya Patel",
    "email": "maya.patel@school.edu",
    "grade": 11,
    "gpa": 3.2,
    "enrollmentStatus": "at_risk"
  },
  "tasks": [...],
  "messages": {
    "items": [...],
    "unreadCount": 2
  },
  "urgencyLevel": "high",
  "taskSummary": {
    "total": 5,
    "pending": 4,
    "completed": 1,
    "urgent": 2,
    "overdue": 1
  }
}
```

### Error Response

```json
{
  "error": "STUDENT_NOT_FOUND",
  "message": "Student 'stu_999' not found"
}
```

---

## PATCH /tasks/:taskId/status

Updates the status of an existing task.

### Example

```http
PATCH /tasks/tsk_001/status
```

### Request Body

```json
{
  "status": "in_progress"
}
```

Allowed values:

* todo
* in_progress
* completed

### Success Response

Returns the updated task object.

### Error Responses

```json
{
  "error": "INVALID_STATUS",
  "message": "Status must be one of: todo, in_progress, completed"
}
```

```json
{
  "error": "TASK_NOT_FOUND",
  "message": "Task 'tsk_999' not found"
}
```

---

# Architecture

The project is organized as a simple monorepo containing separate frontend and backend applications.

## Backend

The backend exposes two REST endpoints:

* `GET /students/:id/action-center`
* `PATCH /tasks/:taskId/status`

Mock data is stored in memory and acts as the application's source of truth. The action center response is generated dynamically, including task summaries and urgency calculations.

Error handling is centralized through Express middleware, keeping route handlers focused on business logic.

## Frontend

The frontend is built using React and TypeScript.

A custom hook is responsible for fetching action center data and handling task status updates. Components are split into small, reusable pieces such as:

* Student Profile
* Task List
* Task Item
* Message List
* Priority Badge
* Status Badge
* Urgency Banner

State management is intentionally kept local since the application is small and does not require a global store.

---

# Assumptions

* Data is stored in memory and will reset when the server restarts.
* Authentication and authorization are outside the scope of this assessment.
* The frontend performs optimistic updates when task statuses change.
* The dataset is intentionally small, so no database layer is required.

---

 Performance Decisions and Tradeoffs
 
 Structured logging with Pino
Pino is used instead of `morgan` or `console.log` because it writes serialised JSON to a single stream with minimal overhead — benchmarks consistently show it 5–10x faster than Winston or Morgan under load. JSON output also integrates directly with log aggregation tools (Datadog, Grafana Loki, Elastic) without a parsing step.

Tradeoff raw JSON is harder to read in a terminal during development. This is normally solved by piping output through `pino-pretty` in dev (`npm run dev | pino-pretty`) without changing the production log format.


 Request IDs for traceability
Every request receives a UUID attached to the `X-Request-ID` header (generated via Node's built-in `crypto.randomUUID()` — no extra dependency). The same ID is included in all pino log entries for that request and in every error response body.

This means a counselor reporting `requestId: ced37e0e-...` in a bug report maps directly to a single log line in production, making debugging fast even without a full distributed tracing system.

Tradeoff
 UUIDs add ~36 bytes to every response body. Negligible at this scale.


 In-memory data store
The mock data lives in a module-level mutable array. Reads are O(n) array filters with no I/O, making response times < 5 ms in testing. The route layer is intentionally thin so swapping in a real database (e.g. PostgreSQL via Prisma) only requires changing `data/mockData.ts` and the two route handlers.

Tradeoff
 all state is lost on restart. Concurrent writes are not safe (no locking). Acceptable for a single-process demo; production would need a database.


 Optimistic task status updates on the frontend
When a counselor changes a task's status via the dropdown, the UI immediately reflects the change returned by the server (`PATCH` → merge updated task into local state) without a full refetch of the action center. This eliminates a round trip and keeps the UI feeling instant.

Tradeoff
 if the server rejects the update after a partial response, the UI shows an inline error but does not auto-revert the select value. A production implementation would also revert the optimistic state on failure.

Vite dev proxy
In development, Vite forwards `/students` and `/tasks` to `http://localhost:3001`, so the browser makes same-origin requests and CORS preflight is never triggered. The backend still sets CORS headers for deployments where the API is on a separate origin.

Testing strategy
Backend
`supertest` integration tests hit the real Express app with the real in-memory data layer. This catches route-level bugs, middleware ordering errors (e.g. requestId must precede pino-http), and business logic edge cases without mocking the internals.

Frontend 
 `vitest` + `@testing-library/react` tests render components in a `jsdom` environment. Tests are behaviour-focused (what the user sees and what happens on interaction) rather than implementation-focused, so they remain valid after internal refactors.
