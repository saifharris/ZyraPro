import { useState, useEffect, useCallback } from "react";
import { ActionCenterData, TaskStatus } from "../types";
import { api } from "../services/api";

interface UseActionCenterResult {
  data: ActionCenterData | null;
  loading: boolean;
  error: string | null;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  refetch: () => void;
}

export function useActionCenter(studentId: string): UseActionCenterResult {
  const [data, setData] = useState<ActionCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getActionCenter(studentId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      const updatedTask = await api.updateTaskStatus(taskId, status);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        };
      });
    },
    []
  );

  return { data, loading, error, updateTaskStatus, refetch: fetchData };
}
