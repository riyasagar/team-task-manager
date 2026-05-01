import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [myAssignedTasks, setMyAssignedTasks] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [pRes, tRes, aRes, oRes] = await Promise.all([
        api.get("/projects/my"),
        api.get("/tasks/my"),
        api.get("/tasks/my-assigned"),
        api.get("/tasks/overdue"),
      ]);

      // ✅ FIX
      setProjects(Array.isArray(pRes.data) ? pRes.data : []);
      setAllTasks(Array.isArray(tRes.data) ? tRes.data : []);
      setMyAssignedTasks(Array.isArray(aRes.data) ? aRes.data : []);
      setOverdue(Array.isArray(oRes.data) ? oRes.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ FIXED
  const stats = useMemo(() => {
    if (!Array.isArray(allTasks)) {
      return { total: 0, Todo: 0, "In Progress": 0, Done: 0 };
    }

    const byStatus = { Todo: 0, "In Progress": 0, Done: 0 };

    allTasks.forEach((t) => {
      if (byStatus[t.status] !== undefined) byStatus[t.status]++;
    });

    return {
      total: allTasks.length,
      ...byStatus,
    };
  }, [allTasks]);

  return (
    <div>
      <h2>Dashboard</h2>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <p>Total Tasks: {stats.total}</p>
      <p>Todo: {stats.Todo}</p>
      <p>In Progress: {stats["In Progress"]}</p>
      <p>Done: {stats.Done}</p>
    </div>
  );
}