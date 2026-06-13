// ApplicationsScreen.js
// Startup sees all applications across their posted projects

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import {
  collection, query, where, getDocs,
  doc, updateDoc, orderBy
} from "firebase/firestore";
import "./ApplicationsScreen.css";

function ApplicationsScreen() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const filters = [
    { label: "All",         value: "all" },
    { label: "Pending",     value: "pending" },
    { label: "Shortlisted", value: "shortlisted" },
    { label: "Hired",       value: "hired" },
    { label: "Rejected",    value: "rejected" },
  ];

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) { navigate("/login"); return; }

      try {
        const q = query(
          collection(db, "applications"),
          where("startupId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error loading applications:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const updateStatus = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await updateDoc(doc(db, "applications", appId), { status: newStatus });
      setApplications(prev =>
        prev.map(a => a.id === appId ? { ...a, status: newStatus } : a)
      );
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = applications.filter(a =>
    activeFilter === "all" || a.status === activeFilter
  );

  const statusStyle = {
    pending:     { bg: "#FFF8E7", color: "#7A5C00", label: "Pending" },
    shortlisted: { bg: "#EEEDFE", color: "#3C3489", label: "Shortlisted" },
    hired:       { bg: "#E1F5EE", color: "#085041", label: "Hired ✓" },
    rejected:    { bg: "#FEF2F2", color: "#991B1B", label: "Rejected" },
  };

  return (
    <div className="applications-container">

      {/* Header */}
      <div className="ap-header">
        <button className="back-btn" onClick={() => navigate("/startup/home")}>←</button>
        <div className="header-logo">
          <div className="logo-dot"></div>
          <span>Applications</span>
        </div>
        <div style={{ width: 32 }} />
      </div>

      {/* Filter tabs */}
      <div className="ap-filters">
        {filters.map(f => (
          <button
            key={f.value}
            className={`filter-tab ${activeFilter === f.value ? "active" : ""}`}
            onClick={() => setActiveFilter(f.value)}
          >
            {f.label}
            {f.value !== "all" && (
              <span className="filter-count">
                {applications.filter(a => a.status === f.value).length || ""}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="ap-body">

        {/* Loading */}
        {loading && (
          <div className="loading-state">
            <div className="loading-dot"></div>
            <p>Loading applications...</p>
          </div>
        )}

        {/* No applications at all */}
        {!loading && applications.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No applications yet</h3>
            <p>Once students apply to your projects, they'll appear here.</p>
            <button
              className="sh-btn-primary"
              onClick={() => navigate("/startup/post-project")}
            >+ Post a project</button>
          </div>
        )}

        {/* No results for filter */}
        {!loading && applications.length > 0 && filtered.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No {activeFilter} applications</h3>
            <p>Switch to a different filter to see others.</p>
          </div>
        )}

        {/* Application cards */}
        {!loading && filtered.map(app => {
          const s = statusStyle[app.status] || statusStyle.pending;
          const isUpdating = updatingId === app.id;

          return (
            <div key={app.id} className="app-card">

              {/* Top row */}
              <div className="app-top">
                <div className="app-avatar">
                  {app.studentEmail?.[0]?.toUpperCase() || "S"}
                </div>
                <div className="app-info">
                  <div className="app-student">{app.studentEmail?.split("@")[0]}</div>
                  <div className="app-project">for: {app.projectTitle}</div>
                </div>
                <div
                  className="app-status-badge"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.label}
                </div>
              </div>

              {/* Pitch */}
              <div className="app-pitch">
                <p className="app-pitch-label">Their pitch</p>
                <p className="app-pitch-text">{app.pitch}</p>
              </div>

              {/* Applied date */}
              <div className="app-date">
                Applied {new Date(app.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </div>

              {/* Action buttons — only show if not hired/rejected */}
              {app.status !== "hired" && app.status !== "rejected" && (
                <div className="app-actions">
                  {app.status !== "shortlisted" && (
                    <button
                      className="btn-shortlist"
                      onClick={() => updateStatus(app.id, "shortlisted")}
                      disabled={isUpdating}
                    >
                      ⭐ Shortlist
                    </button>
                  )}
                  <button
                    className="btn-hire"
                    onClick={() => updateStatus(app.id, "hired")}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "..." : "✓ Hire"}
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => updateStatus(app.id, "rejected")}
                    disabled={isUpdating}
                  >
                    ✕ Reject
                  </button>
                </div>
              )}

              {/* Hired state */}
              {app.status === "hired" && (
                <div className="hired-banner">
                  🎉 You hired this student! Reach out at{" "}
                  <strong>{app.studentEmail}</strong>
                </div>
              )}

            </div>
          );
        })}

      </div>

      {/* Bottom nav */}
      <div className="sh-bottom-nav">
        <button className="sh-nav-btn" onClick={() => navigate("/startup/home")}>
          <span>🏠</span><span>Home</span>
        </button>
        <button className="sh-nav-btn" onClick={() => navigate("/marketplace")}>
          <span>🔍</span><span>Find talent</span>
        </button>
        <button className="sh-nav-btn" onClick={() => navigate("/startup/post-project")}>
          <span>➕</span><span>Post project</span>
        </button>
        <button className="sh-nav-btn active">
          <span>📋</span><span>Applications</span>
        </button>
      </div>

    </div>
  );
}

export default ApplicationsScreen;
