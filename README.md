# Counselor Student Action Center

A full-stack feature that helps a school counselor quickly understand a student's priorities, tasks, unread messages, and urgency level.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Styling | Plain CSS custom properties |

---

## Setup & Run

### Prerequisites
- Node.js ≥ 18

### 1 — Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2 — Start the backend

```bash
cd backend
npm run dev
# → http://localhost:3001
```

### 3 — Start the frontend

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173). Use the student tabs in the header to switch between students.

---

## API Contract

### `GET /students/:id/action-center`

Returns a student's full action center payload.

**Path params**
- `id` — student ID (e.g. `stu_001`)

**Response `200`**
```json
{
  "student": {
    "id": "stu_001",
    "name": "Maya Patel",
    "email": "maya.patel@school.edu",
    "grade": 11,
    "gpa": 3.2,
    "counselorId": "csl_001",
    "enrollmentStatus": "at_risk"
  },
  "tasks": [
    {
      "id": "tsk_001",
      "studentId": "stu_001",
      "title": "Submit FAFSA application",
      "description": "...",
      "status": "todo",
      "priority": "urgent",
      "dueDate": "2026-06-05",
      "createdAt": "2026-05-13T14:00:00Z",
      "updatedAt": "2026-05-13T14:00:00Z"
    }
  ],
  "messages": {
    "items": [ ... ],
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

**Error `404`**
```json
{ "error": "STUDENT_NOT_FOUND", "message": "Student 'stu_999' not found" }
```

---

### `PATCH /tasks/:taskId/status`

Updates the status of a task.

**Path params**
- `taskId` — task ID (e.g. `tsk_001`)

**Request body**
```json
{ "status": "in_progress" }
```

Valid values: `"todo"` | `"in_progress"` | `"completed"`

**Response `200`** — the updated task object.

**Error `400`**
```json
{ "error": "INVALID_STATUS", "message": "Status must be one of: todo, in_progress, completed" }
```

**Error `404`**
```json
{ "error": "TASK_NOT_FOUND", "message": "Task 'tsk_999' not found" }
```

---

## Architecture Note

The project is a monorepo with two independent packages: `backend/` and `frontend/`.

### Backend

```
backend/src/
├── data/mockData.ts        ← Single source of truth for all mock data (mutable in-process)
├── types/index.ts          ← Shared domain types (Student, Task, Message, etc.)
├── middleware/
│   └── errorHandler.ts     ← Centralised error class + Express error middleware
├── routes/
│   ├── students.ts         ← GET /students/:id/action-center
│   └── tasks.ts            ← PATCH /tasks/:taskId/status
└── index.ts                ← Express app bootstrap
```

The action-center endpoint computes `urgencyLevel` and `taskSummary` on the fly from the in-memory data — no denormalisation needed with a small dataset. Tasks are sorted by priority weight (urgent → low) before being returned so the frontend can render them in order without extra logic.

### Frontend

```
frontend/src/
├── types/index.ts          ← Mirror of backend domain types (kept in sync manually)
├── services/api.ts         ← Thin fetch wrapper with typed return values
├── hooks/
│   └── useActionCenter.ts  ← Data-fetching hook that also owns optimistic task updates
├── components/
│   ├── StudentProfile.tsx  ← Header card: avatar, enrollment badge, GPA, stat grid
│   ├── UrgencyBanner.tsx   ← Contextual banner driven by urgencyLevel enum
│   ├── TaskList.tsx        ← Active tasks + collapsible completed section
│   ├── TaskItem.tsx        ← Individual task card with inline status select
│   ├── MessageList.tsx     ← Message list with unread dot indicator
│   ├── PriorityBadge.tsx   ← Colour-coded priority pill
│   └── StatusBadge.tsx     ← Colour-coded status pill
├── pages/
│   └── ActionCenter.tsx    ← Page-level component: loading / error / data states
└── App.tsx                 ← Root: student switcher nav + renders ActionCenter
```

State management is intentionally local — `useActionCenter` holds the server data and handles status mutations (PATCH → merge updated task into local state). No external state library is needed at this scale.

The Vite dev proxy forwards `/students` and `/tasks` requests to the backend, so the frontend makes same-origin requests in development and no CORS configuration is needed on the client side.
