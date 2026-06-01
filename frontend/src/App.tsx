import { useState } from "react";
import { ActionCenter } from "./pages/ActionCenter";

const STUDENTS = [
  { id: "stu_001", name: "Maya Patel" },
  { id: "stu_002", name: "Jordan Lee" },
  { id: "stu_003", name: "Carlos Rivera" },
];

export default function App() {
  const [selectedId, setSelectedId] = useState(STUDENTS[0].id);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <h1 className="app-header__title">Counselor Action Center</h1>
          <nav className="student-nav">
            {STUDENTS.map((s) => (
              <button
                key={s.id}
                className={`student-nav__btn ${selectedId === s.id ? "student-nav__btn--active" : ""}`}
                onClick={() => setSelectedId(s.id)}
              >
                {s.name}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="app-main">
        <ActionCenter key={selectedId} studentId={selectedId} />
      </main>
    </div>
  );
}
