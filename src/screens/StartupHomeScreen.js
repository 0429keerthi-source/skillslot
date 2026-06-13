// StartupHomeScreen.js
// Dashboard for startup after they log in

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import "./StartupHomeScreen.css";

function StartupHomeScreen() {
  const navigate = useNavigate();
  const [startup, setStartup] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStartup = async () => {
      const user = auth.currentUser;
      if (!user) { navigate("/login"); return; }
      try {
        const docRef = doc(db, "startups", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStartup(docSnap.data());
        }
        // Load this startup's projects
        const pq = query(
          collection(db, "projects"),
          where("startupId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const pSnap = await getDocs(pq);
        setProjects(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error loading startup:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStartup();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-dot"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="startup-home-container">

      {/* Top bar */}
      <div className="sh-topbar">
        <div className="header-logo">
          <div className="logo-dot"></div>
          <span>SkillSlot</span>
        </div>
        <div style={{display:"flex", gap:"8px", alignItems:"center"}}>
          <div className="startup-badge">🏢 Startup</div>
          <button className="icon-btn" onClick={handleLogout}>⚙️</button>
        </div>
      </div>

      <div className="sh-body">

        {/* Welcome card */}
        <div className="sh-welcome">
          <div className="sh-welcome-label">Startup dashboard</div>
          <h2 className="sh-welcome-name">Hey {startup?.founderName?.split(" ")[0]} 👋</h2>
          <p className="sh-welcome-company">{startup?.companyName} · {startup?.sector}</p>
          {!startup?.verified && (
            <div className="verify-notice">
              ⏳ Account under review — we'll verify within 24 hours
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="sh-stats">
          <div className="sh-stat">
            <div className="sh-stat-val">{startup?.projectsPosted || 0}</div>
            <div className="sh-stat-label">Projects posted</div>
          </div>
          <div className="sh-stat">
            <div className="sh-stat-val">{startup?.studentsHired || 0}</div>
            <div className="sh-stat-label">Students hired</div>
          </div>
          <div className="sh-stat">
            <div className="sh-stat-val">₹0</div>
            <div className="sh-stat-label">Total spent</div>
          </div>
        </div>

        {/* Skills looking for */}
        {startup?.lookingFor?.length > 0 && (
          <div className="sh-section">
            <p className="sh-section-title">SKILLS YOU NEED</p>
            <div className="sh-tags">
              {startup.lookingFor.map((skill) => (
                <span key={skill} className="sh-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Empty state — only when no projects */}
        {projects.length === 0 && (
          <div className="sh-empty">
            <span style={{fontSize:"32px"}}>📋</span>
            <h3>No projects posted yet</h3>
            <p>Post your first project and start receiving applications from skilled students across Hyderabad.</p>
            <button className="sh-btn-primary" onClick={() => navigate("/startup/post-project")}>
              + Post a project
            </button>
          </div>
        )}

        {/* Posted projects list */}
        {projects.length > 0 && (
          <div className="sh-section">
            <p className="sh-section-title">YOUR PROJECTS</p>
            {projects.map(project => (
              <div
                key={project.id}
                className="sh-project-card"
                onClick={() => navigate("/startup/applications")}
              >
                <div className="sh-project-top">
                  <span className="sh-project-title">{project.title}</span>
                  <span className={`sh-project-status ${project.status}`}>
                    {project.status === "open" ? "🟢 Open" : "🔴 Closed"}
                  </span>
                </div>
                <div className="sh-project-meta">
                  <span>⏱ {project.duration}</span>
                  <span>👥 {project.applicationsCount || 0} applications</span>
                  <span>₹{project.budgetMin}{project.budgetMax && project.budgetMax !== project.budgetMin ? `–${project.budgetMax}` : ""}</span>
                </div>
              </div>
            ))}
            <button
              className="sh-btn-outline"
              onClick={() => navigate("/startup/post-project")}
            >+ Post another project</button>
          </div>
        )}

        {/* Find students card */}
        <div className="sh-action" onClick={() => navigate("/marketplace")}>
          <div className="sh-action-icon" style={{background:"#E1F5EE"}}>🔍</div>
          <div>
            <div className="sh-action-title">Browse student profiles</div>
            <div className="sh-action-sub">Find verified students by skill and rating</div>
          </div>
          <span className="sh-action-arrow">›</span>
        </div>

        <div className="sh-action" onClick={() => navigate("/startup/post-project")}>
          <div className="sh-action-icon" style={{background:"#EEEDFE"}}>📢</div>
          <div>
            <div className="sh-action-title">Post a project</div>
            <div className="sh-action-sub">Receive applications within hours</div>
          </div>
          <span className="sh-action-arrow">›</span>
        </div>

      </div>

      {/* Bottom nav */}
      <div className="sh-bottom-nav">
        <button className="sh-nav-btn active">
          <span>🏠</span><span>Home</span>
        </button>
        <button className="sh-nav-btn" onClick={() => navigate("/marketplace")}>
          <span>🔍</span><span>Find talent</span>
        </button>
        <button className="sh-nav-btn" onClick={() => navigate("/startup/post-project")}>
          <span>➕</span><span>Post project</span>
        </button>
        <button className="sh-nav-btn" onClick={() => navigate("/startup/applications")}>
          <span>📋</span><span>Applications</span>
        </button>
      </div>

    </div>
  );
}

export default StartupHomeScreen;
