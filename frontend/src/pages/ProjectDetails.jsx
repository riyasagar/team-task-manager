import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { toArray } from "../utils/safe";

export default function ProjectDetails() {
  const { projectId } = useParams();

  const [project, setProject] = useState({});
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

      // ✅ SAFE SET
      setProject(pRes.data || {});
      setMembers(toArray(pRes.data?.members));
      setTasks(toArray(tRes.data));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load project");

      // 🔥 IMPORTANT: reset to safe values on error
      setProject({});
      setMembers([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      load();
    }
  }, [projectId]);

  // ✅ SAFE COUNTS
  const counts = useMemo(() => {
    const list = toArray(tasks);

    const c = {
      Todo: 0,
      "In Progress": 0,
      Done: 0,
    };

    list.forEach((t) => {
      if (t && c[t.status] !== undefined) {
        c[t.status]++;
      }
    });

    return c;
  }, [tasks]);

  return (
    <div>
      <h2>Project Details</h2>

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* Error */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Safe render */}
      {!loading && !error && (
        <>
          <p><strong>Project:</strong> {project?.title || "N/A"}</p>

          <p><strong>Total Tasks:</strong> {toArray(tasks).length}</p>

          <p>Todo: {counts.Todo}</p>
          <p>In Progress: {counts["In Progress"]}</p>
          <p>Done: {counts.Done}</p>

          <p><strong>Members:</strong> {toArray(members).length}</p>
        </>
      )}
    </div>
  );
}