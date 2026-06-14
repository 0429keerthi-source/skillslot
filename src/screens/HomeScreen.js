// HomeScreen.js — Student dashboard
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import "./HomeScreen.css";

function HomeScreen() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Wait for Firebase to confirm login status
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        const docRef = doc(db, "students", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStudent(docSnap.data());
        } else {
          // User exists in Auth but not in students collection
          // Could be a startup — redirect to startup dashboard
          navigate("/startup/home");
        }
      } catch (err) {
        console.error("Error loading student:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-dot"></div>
        <p>Loading SkillSlot...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-topbar">
        <div className="header-logo">
          <div className="logo-dot"></div>
          <span>SkillSlot</span>
        </div>
        <div style={{display:"flex", gap:"8px", alignItems:"center"}}>
          <div className="coin-badge">🪙 {student?.skillCoins || 200}</div>
          <div style={{position:"relative"}}>
            <button className="icon-btn" onClick={() => setShowMenu(!showMenu)} title="Settings">⚙️</button>
            {showMenu && (
              <>
                <div
                  style={{position:"fixed", inset:0, zIndex:99}}
                  onClick={() => setShowMenu(false)}
                />
                <div className="settings-menu">
                  <div className="settings-menu-header">
                    <div className="settings-name">{student?.name || "Student"}</div>
                    <div className="settings-email">{auth.currentUser?.email}</div>
                  </div>
                  <button className="settings-item" onClick={() => { setShowMenu(false); navigate("/post-gig"); }}>
                    ➕ Post a gig
                  </button>
                  <button className="settings-item" onClick={() => { setShowMenu(false); navigate("/my-applications"); }}>
                    📋 My applications
                  </button>
                  <div className="settings-divider" />
                  <button className="settings-item danger" onClick={handleLogout}>
                    🚪 Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="home-body">
        <div className="welcome-card">
          <p className="welcome-label">Welcome back</p>
          <h2 className="welcome-name">
            Hey {student?.name?.split(" ")[0] || "Student"} 👋
          </h2>
          <p className="welcome-sub">Complete your profile to get discovered faster</p>
          <div className="progress-row">
            <span className="progress-label">Profile complete</span>
            <span className="progress-pct">{student?.profileComplete || 40}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill"
              style={{width:`${student?.profileComplete || 40}%`}}>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-val">₹{student?.totalEarned || 0}</div>
            <div className="stat-label">Total earned</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{student?.jobsDone || 0}</div>
            <div className="stat-label">Jobs done</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{student?.rating || "—"}</div>
            <div className="stat-label">Rating</div>
          </div>
        </div>

        <div className="empty-state">
          <span className="empty-icon">💼</span>
          <h3>No gigs yet</h3>
          <p>Post your first gig and start earning. Takes under 3 minutes.</p>
          <button className="btn-primary-sm" onClick={() => navigate("/post-gig")}>+ Post first gig</button>
        </div>

        <div className="action-card" onClick={() => navigate("/projects")} style={{cursor:"pointer"}}>
          <div className="action-icon" style={{background:"#EEEDFE"}}>🏢</div>
          <div className="action-text">
            <div className="action-title">4 startups are hiring</div>
            <div className="action-sub">Matching your skills right now</div>
          </div>
          <span className="action-arrow">›</span>
        </div>

        <div className="action-card" onClick={() => navigate("/my-applications")} style={{cursor:"pointer"}}>
          <div className="action-icon" style={{background:"#FFF8E7"}}>📋</div>
          <div className="action-text">
            <div className="action-title">My applications</div>
            <div className="action-sub">Track your project applications</div>
          </div>
          <span className="action-arrow">›</span>
        </div>

        <div className="action-card" onClick={() => navigate("/marketplace")} style={{cursor:"pointer"}}>
          <div className="action-icon" style={{background:"#E1F5EE"}}>🛒</div>
          <div className="action-text">
            <div className="action-title">Browse marketplace</div>
            <div className="action-sub">Find gigs from local businesses</div>
          </div>
          <span className="action-arrow">›</span>
        </div>
      </div>

      <div className="bottom-nav">
        <button className="nav-btn active">
          <span>🏠</span><span>Home</span>
        </button>
        <button className="nav-btn" onClick={() => navigate("/my-applications")}>
          <span>🏢</span><span>Startups</span>
        </button>
        <button className="nav-btn" onClick={() => navigate("/post-gig")}>
          <span>➕</span><span>Post gig</span>
        </button>
        <button className="nav-btn">
          <span>🏆</span><span>Ranks</span>
        </button>
      </div>
    </div>
  );
}

export default HomeScreen;
