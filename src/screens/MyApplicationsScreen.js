// MyApplicationsScreen.js
// Student sees all projects they've applied to and their status

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import "./MyApplicationsScreen.css";

function MyApplicationsScreen() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { label: "All",         value: "all" },
    { label: "Pending",     value: "pending" },
    { label: "Shortlisted", value: "shortlisted" },
    { label: "Hired",       value: "hired" },
    { label: "Rejected",    value: "rejected" },
  ];

  const statusStyle = {
    pending:     { bg: "#FFF8E7", color: "#7A5C00", label: "Pending" },
    shortlisted: { bg: "#EEEDFE", color: "#3C3489", label: "⭐ Shortlisted" },
    hired:       { bg: "#E1F5EE", color: "#085041", label: "🎉 Hired!" },
    rejected:    { bg: "#FEF2F2", color: "#991B1B", label: "Rejected" },
  };

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) { navigate("/login"); return; }
      try {
        const q = query(
          collection(db, "applications"),
          where("studentId", "==", user.uid),
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

  const filtered = applications.filter(a =>
    activeFilter === "all" || a.status === activeFilter
  );

  return (
    <div className="myapps-container">

      {/* Header */}
      <div className="ma-header">
        <button className="back-btn" onClick={() => navigate("/home")}>←</button>
        <div className="header-logo">
          <div className="logo-dot"></div>
          <span>My applications</span>
        </div>
        <div style={{ width: 32 }} />
      </div>

      {/* Filter tabs */}
      <div className="ma-filters">
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

      <div className="ma-body">

        {/* Loading */}
        {loading && (
          <div className="loading-state">
            <div className="loading-dot"></div>
            <p>Loading your applications...</p>
          </div>
        )}

        {/* No applications at all */}
        {!loading && applications.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No applications yet</h3>
            <p>Browse open projects from startups and apply to ones that match your skills.</p>
            <button
              className="btn-primary-sm"
              onClick={() => navigate("/projects")}
            >Browse projects</button>
          </div>
        )}

        {/* No results for this filter */}
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
          return (
            <div key={app.id} className="ma-card">

              {/* Status badge */}
              <div className="ma-card-top">
                <div
                  className="ma-status-badge"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.label}
                </div>
                <div className="ma-date">
                  {new Date(app.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short"
                  })}
                </div>
              </div>

              {/* Project title */}
              <h3 className="ma-project-title">{app.projectTitle}</h3>

              {/* Your pitch */}
              <div className="ma-pitch-box">
                <p className="ma-pitch-label">Your pitch</p>
                <p className="ma-pitch-text">{app.pitch}</p>
              </div>

              {/* Hired message */}
              {app.status === "hired" && (
                <div className="ma-hired-banner">
                  🎉 You got hired! The startup will contact you soon.
                </div>
              )}

              {/* Shortlisted message */}
              {app.status === "shortlisted" && (
                <div className="ma-shortlisted-banner">
                  ⭐ You've been shortlisted! The startup is reviewing final candidates.
                </div>
              )}

            </div>
          );
        })}

      </div>

      {/* Bottom nav */}
      <div className="bottom-nav">
        <button className="nav-btn" onClick={() => navigate("/home")}>
          <span>🏠</span><span>Home</span>
        </button>
        <button className="nav-btn active">
          <span>🏢</span><span>Startups</span>
        </button>
        <button className="nav-btn" onClick={() => navigate("/post-gig")}>
          <span>➕</span><span>Post gig</span>
        </button>
        <button className="nav-btn" onClick={() => navigate("/home")}>
          <span>🏆</span><span>Ranks</span>
        </button>
      </div>

    </div>
  );
}

export default MyApplicationsScreen;
