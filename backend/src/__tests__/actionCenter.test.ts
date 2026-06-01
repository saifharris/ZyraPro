import request from "supertest";
import app from "../app";
import { resetData } from "../data/mockData";

beforeEach(() => {
  resetData();
});

// ── GET /students/:id/action-center ─────────────────────────────────────────

describe("GET /students/:id/action-center", () => {
  it("returns 200 with the correct top-level shape", async () => {
    const res = await request(app).get("/students/stu_001/action-center");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      student: expect.objectContaining({ id: "stu_001", name: "Maya Patel" }),
      tasks: expect.any(Array),
      messages: expect.objectContaining({ items: expect.any(Array), unreadCount: expect.any(Number) }),
      urgencyLevel: expect.any(String),
      taskSummary: expect.objectContaining({
        total: expect.any(Number),
        pending: expect.any(Number),
        completed: expect.any(Number),
        urgent: expect.any(Number),
        overdue: expect.any(Number),
      }),
    });
  });

  it("returns only tasks belonging to the requested student", async () => {
    const res = await request(app).get("/students/stu_002/action-center");

    expect(res.status).toBe(200);
    const taskIds: string[] = res.body.tasks.map((t: { studentId: string }) => t.studentId);
    expect(taskIds.every((id) => id === "stu_002")).toBe(true);
  });

  it("returns tasks sorted by priority — urgent first", async () => {
    const res = await request(app).get("/students/stu_001/action-center");

    const priorities: string[] = res.body.tasks.map((t: { priority: string }) => t.priority);
    const urgentIdx = priorities.indexOf("urgent");
    const lowIdx = priorities.indexOf("low");

    // If both exist, urgent must appear before low
    if (urgentIdx !== -1 && lowIdx !== -1) {
      expect(urgentIdx).toBeLessThan(lowIdx);
    }
  });

  it("computes the correct unreadCount", async () => {
    const res = await request(app).get("/students/stu_001/action-center");

    expect(res.status).toBe(200);
    // stu_001 has msg_001 and msg_002 unread
    expect(res.body.messages.unreadCount).toBe(2);
  });

  it("computes taskSummary totals correctly for stu_001", async () => {
    const res = await request(app).get("/students/stu_001/action-center");
    const { taskSummary } = res.body;

    // stu_001 has 5 tasks: 1 completed, 4 active (2 urgent)
    expect(taskSummary.total).toBe(5);
    expect(taskSummary.completed).toBe(1);
    expect(taskSummary.pending).toBe(4);
    expect(taskSummary.urgent).toBe(2);
  });

  it("sets the X-Request-ID response header", async () => {
    const res = await request(app).get("/students/stu_001/action-center");

    expect(res.headers["x-request-id"]).toBeDefined();
    expect(typeof res.headers["x-request-id"]).toBe("string");
  });

  it("echoes a client-supplied X-Request-ID", async () => {
    const clientId = "test-req-abc-123";
    const res = await request(app)
      .get("/students/stu_001/action-center")
      .set("X-Request-ID", clientId);

    expect(res.headers["x-request-id"]).toBe(clientId);
  });

  it("returns 404 with error code for an unknown student", async () => {
    const res = await request(app).get("/students/stu_999/action-center");

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      error: "STUDENT_NOT_FOUND",
      requestId: expect.any(String),
    });
  });
});

// ── PATCH /tasks/:taskId/status ──────────────────────────────────────────────

describe("PATCH /tasks/:taskId/status", () => {
  it("updates a task status and returns the updated task", async () => {
    const res = await request(app)
      .patch("/tasks/tsk_004/status")
      .send({ status: "in_progress" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: "tsk_004", status: "in_progress" });
  });

  it("persists the update within the same process lifetime", async () => {
    await request(app)
      .patch("/tasks/tsk_004/status")
      .send({ status: "completed" });

    const res = await request(app).get("/students/stu_001/action-center");
    const task = res.body.tasks.find((t: { id: string }) => t.id === "tsk_004");

    expect(task.status).toBe("completed");
  });

  it("sets updatedAt to a recent ISO timestamp after update", async () => {
    const before = Date.now();
    const res = await request(app)
      .patch("/tasks/tsk_001/status")
      .send({ status: "completed" });

    const updatedAt = new Date(res.body.updatedAt).getTime();
    expect(updatedAt).toBeGreaterThanOrEqual(before);
  });

  it("returns 400 with INVALID_STATUS for an unrecognised status value", async () => {
    const res = await request(app)
      .patch("/tasks/tsk_001/status")
      .send({ status: "unknown" });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: "INVALID_STATUS",
      requestId: expect.any(String),
    });
  });

  it("returns 400 when the status field is missing from the body", async () => {
    const res = await request(app).patch("/tasks/tsk_001/status").send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID_STATUS");
  });

  it("returns 404 with TASK_NOT_FOUND for an unknown task", async () => {
    const res = await request(app)
      .patch("/tasks/tsk_999/status")
      .send({ status: "completed" });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      error: "TASK_NOT_FOUND",
      requestId: expect.any(String),
    });
  });
});

// ── GET /health ──────────────────────────────────────────────────────────────

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
