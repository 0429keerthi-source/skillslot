// ProjectsListScreen.js
// Students browse all open startup projects and apply

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import {
  collection, getDocs, addDoc, query,
  orderBy, where, doc, updateDoc, increment
} from "firebase/firestore";
import "./ProjectsListScreen.css";

function ProjectsListScreen() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [appliedIds, setAppliedIds] = useState([]); // projects this student already applied to
  const [applyingId, setApplyingId] = useState(null); // which card is mid-submit
  const [pitchMap, setPitchMap] = useState({}); // projectId → pitch text
  const [openPitchId, setOpenPitchId] = useState(null); // which card shows pitch box

  const filters = [
    { label: "All",     value: "all" },
    { label: "Video",   value: "video" },
    { label: "Design",  value: "design" },
    { label: "Writing", value: "writing" },
    { label: "Dev",     value: "webdev" },
    { label: "Social",  value: "social" },
    { label: "Marketing", value: "marketing" },
  ];

  const categoryEmoji = {
    video: "🎬", design: "🎨", writing: "✏️",
    webdev: "💻", social: "📱", marketing: "📢",
    photo: "📷", data: "📊",
  };

  const categoryLabel = {
    video: "Video editing", design: "Graphic design",
    writing: "Content writing", webdev: "Web development",
    social: "Social media", marketing: "Marketing",
    photo: "Photography", data: "Data analysis",
  };

  // Load projects + check which ones this student already applied to
  useEffect(() => {
    const load = async () => {
      try {
        const user = auth.currentUser;

        // Load all open projects
        const q = query(
          collection(db, "projects"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProjects(list);

        // Load this student's applications to mark already-applied
        if (user) {
          const appQ = query(
            collection(db, "applications"),
            where("studentId", "==", user.uid)
          );
          const appSnap = await getDocs(appQ);
          setAppliedIds(appSnap.docs.map(d => d.data().projectId));
        }
      } catch (err) {
        console.error("Error loading projects:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApply = async (project) => {
    const user = auth.currentUser;
    if (!user) { navigate("/login"); return; }

    const pitch = pitchMap[project.id] || "";
    if (!pitch.trim()) {
      setOpenPitchId(project.id);
      return;
    }

    setApplyingId(project.id);
    try {
      // Save application
      await addDoc(collection(db, "applications"), {
        projectId: project.id,
        projectTitle: project.title,
        startupId: project.startupId,
        studentId: user.uid,
        studentEmail: user.email,
        pitch: pitch.trim(),
        status: "pending",  // pending | shortlisted | rejected | hired
        createdAt: new Date().toISOString(),
      });

      // Increment applicationsCount on the project
      await updateDoc(doc(db, "projects", project.id), {
        applicationsCount: increment(1),
      });

      setAppliedIds(prev => [...prev, project.id]);
      setOpenPitchId(null);
    } catch (err) {
      console.error("Error applying:", err);
    } finally {
      setApplyingId(null);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.skillsNeeded?.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = activeFilter === "all" || p.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="projects-container">

      {/* Header */}
      <div className="pl-header">
        <button className="back-btn" onClick={() => navigate("/home")}>←</button>
        <div className="header-logo">
          <div className="logo-dot"></div>
          <span>Open projects</span>
        </div>
        <div style={{ width: 32 }} />
      </div>

      <div className="pl-body">

        {/* Search */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search projects, skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-btn" onClick={() => setSearch("")}>×</button>
          )}
        </div>

        {/* Filters */}
        <div className="filter-tabs">
          {filters.map(f => (
            <button
              key={f.value}
              className={`filter-tab ${activeFilter === f.value ? "active" : ""}`}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-state">
            <div className="loading-dot"></div>
            <p>Loading projects...</p>
          </div>
        )}

        {/* No projects at all */}
        {!loading && projects.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No projects yet</h3>
            <p>Startups haven't posted any projects yet. Check back soon!</p>
          </div>
        )}

        {/* No search results */}
        {!loading && projects.length > 0 && filteredProjects.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No results found</h3>
            <p>Try a different search or category</p>
            <button
              className="btn-primary-sm"
              onClick={() => { setSearch(""); setActiveFilter("all"); }}
            >Clear filters</button>
          </div>
        )}

        {/* Project cards */}
        {!loading && filteredProjects.map(project => {
          const alreadyApplied = appliedIds.includes(project.id);
          const isApplying = applyingId === project.id;
          const showPitch = openPitchId === project.id;

          return (
            <div key={project.id} className="project-card">

              {/* Card top */}
              <div className="pc-top">
                <div className="pc-category-badge">
                  {categoryEmoji[project.category]} {categoryLabel[project.category]}
                </div>
                <div className="pc-location">
                  {project.locationType === "remote" ? "🌐 Remote" : "📍 On-site"}
                </div>
              </div>

              {/* Title */}
              <h3 className="pc-title">{project.title}</h3>
              <p className="pc-desc">{project.description}</p>

              {/* Skills needed */}
              {project.skillsNeeded?.length > 0 && (
                <div className="pc-skills">
                  {project.skillsNeeded.map(s => (
                    <span key={s} className="pc-skill-tag">{s}</span>
                  ))}
                </div>
              )}

              {/* Meta row */}
              <div className="pc-meta">
                <span className="pc-meta-item">⏱ {project.duration}</span>
                <span className="pc-meta-item">
                  👥 {project.applicationsCount || 0} applied
                </span>
              </div>

              {/* Footer */}
              <div className="pc-footer">
                <div>
                  <span className="pc-price">
                    ₹{project.budgetMin}
                    {project.budgetMax && project.budgetMax !== project.budgetMin
                      ? `–${project.budgetMax}` : ""}
                  </span>
                  <span className="pc-price-type">
                    {" "}· {project.budgetType === "fixed" ? "fixed" : "range"}
                  </span>
                </div>

                {alreadyApplied ? (
                  <div className="applied-badge">✓ Applied</div>
                ) : (
                  <button
                    className="apply-btn"
                    onClick={() => setOpenPitchId(showPitch ? null : project.id)}
                  >
                    Apply →
                  </button>
                )}
              </div>

              {/* Pitch box — expands when Apply is clicked */}
              {showPitch && !alreadyApplied && (
                <div className="pitch-box">
                  <p className="pitch-label">Write a short pitch (why are you a good fit?)</p>
                  <textarea
                    className="pitch-input"
                    placeholder="e.g. I've done similar projects for 3 brands. Here's what I'll deliver..."
                    value={pitchMap[project.id] || ""}
                    onChange={e => setPitchMap(prev => ({
                      ...prev, [project.id]: e.target.value
                    }))}
                    maxLength={300}
                  />
                  <div className="pitch-footer">
                    <span className="pitch-count">
                      {(pitchMap[project.id] || "").length}/300
                    </span>
                    <button
                      className="submit-btn"
                      onClick={() => handleApply(project)}
                      disabled={isApplying || !(pitchMap[project.id] || "").trim()}
                    >
                      {isApplying ? "Submitting..." : "Submit application"}
                    </button>
                  </div>
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
          <span>📋</span><span>Projects</span>
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

export default ProjectsListScreen;
