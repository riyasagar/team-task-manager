import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function ProjectDetails() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/tasks/project/${projectId}`),
      ]);

      // ✅ FIX
      setProject(pRes.data || {});
      setMembers(Array.isArray(pRes.data?.members) ? pRes.data.members : []);
      setTasks(Array.isArray(tRes.data) ? tRes.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [projectId]);

  // ✅ FIXED
  const counts = useMemo(() => {
    if (!Array.isArray(tasks)) {
      return { Todo: 0, "In Progress": 0, Done: 0 };
    }

    const c = { Todo: 0, "In Progress": 0, Done: 0 };

    tasks.forEach((t) => {
      if (c[t.status] !== undefined) c[t.status]++;
    });

    return c;
  }, [tasks]);

  return (
    <div>
      <h2>Project Details</h2>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <p>Total Tasks: {tasks.length}</p>
      <p>Todo: {counts.Todo}</p>
      <p>In Progress: {counts["In Progress"]}</p>
      <p>Done: {counts.Done}</p>
    </div>
  );
}