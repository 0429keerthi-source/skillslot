// MarketplaceScreen.js
// Browse all gigs posted by students

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import {
  collection, getDocs, addDoc, query,
  orderBy, where, doc, updateDoc, increment
} from "firebase/firestore";
import "./MarketplaceScreen.css";

function MarketplaceScreen() {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [appliedIds, setAppliedIds] = useState([]);
  const [applyingId, setApplyingId] = useState(null);
  const [pitchMap, setPitchMap] = useState({});
  const [openPitchId, setOpenPitchId] = useState(null);

  const filters = [
    { label: "All",     value: "all" },
    { label: "Video",   value: "video" },
    { label: "Design",  value: "design" },
    { label: "Writing", value: "writing" },
    { label: "Dev",     value: "webdev" },
    { label: "Social",  value: "social" },
  ];

  const categoryEmoji = {
    video: "🎬", design: "🎨", writing: "✏️",
    webdev: "💻", social: "📱", marketing: "📢",
    photo: "📷", data: "📊"
  };

  const categoryLabel = {
    video: "Video editing", design: "Graphic design",
    writing: "Content writing", webdev: "Web development",
    social: "Social media", marketing: "Marketing",
    photo: "Photography", data: "Data analysis"
  };

  // Load all gigs from Firestore (excluding the current user's own gigs)
  useEffect(() => {
    const loadGigs = async () => {
      try {
        const user = auth.currentUser;

        const q = query(
          collection(db, "gigs"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const gigList = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(gig => !user || gig.studentId !== user.uid);
        setGigs(gigList);

        // Load gigs this student already applied to
        if (user) {
          const appQ = query(
            collection(db, "gigApplications"),
            where("studentId", "==", user.uid)
          );
          const appSnap = await getDocs(appQ);
          setAppliedIds(appSnap.docs.map(d => d.data().gigId));
        }
      } catch (err) {
        console.error("Error loading gigs:", err);
      } finally {
        setLoading(false);
      }
    };
    loadGigs();
  }, []);

  const handleApply = async (gig) => {
    const user = auth.currentUser;
    if (!user) { navigate("/login"); return; }

    const pitch = pitchMap[gig.id] || "";
    if (!pitch.trim()) {
      setOpenPitchId(gig.id);
      return;
    }

    setApplyingId(gig.id);
    try {
      await addDoc(collection(db, "gigApplications"), {
        gigId: gig.id,
        gigTitle: gig.title,
        gigOwnerId: gig.studentId,
        studentId: user.uid,
        studentEmail: user.email,
        pitch: pitch.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      await updateDoc(doc(db, "gigs", gig.id), {
        applicationsCount: increment(1),
      });

      setAppliedIds(prev => [...prev, gig.id]);
      setOpenPitchId(null);
    } catch (err) {
      console.error("Error applying to gig:", err);
    } finally {
      setApplyingId(null);
    }
  };

  // Filter gigs based on search and category
  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = gig.title?.toLowerCase()
      .includes(search.toLowerCase()) ||
      gig.description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "all" ||
      gig.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="marketplace-container">

      {/* Header */}
      <div className="mp-header">
        <div className="header-logo">
          <div className="logo-dot"></div>
          <span>Marketplace</span>
        </div>
        <button className="back-btn" onClick={() => navigate("/home")}>←</button>
      </div>

      <div className="mp-body">

        {/* Search bar */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search skills — video, design, writing..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-btn" onClick={() => setSearch("")}>×</button>
          )}
        </div>

        {/* Filter tabs */}
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

        {/* Loading state */}
        {loading && (
          <div className="loading-state">
            <div className="loading-dot"></div>
            <p>Loading gigs...</p>
          </div>
        )}

        {/* Empty state — no gigs at all */}
        {!loading && gigs.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🛒</span>
            <h3>No gigs yet</h3>
            <p>Be the first to post a gig and start earning!</p>
            <button
              className="btn-primary-sm"
              onClick={() => navigate("/post-gig")}
            >
              + Post first gig
            </button>
          </div>
        )}

        {/* Empty state — no search results */}
        {!loading && gigs.length > 0 && filteredGigs.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No results found</h3>
            <p>Try a different search term or category</p>
            <button
              className="btn-primary-sm"
              onClick={() => { setSearch(""); setActiveFilter("all"); }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Gig cards */}
        {!loading && filteredGigs.map(gig => {
          const alreadyApplied = appliedIds.includes(gig.id);
          const isApplying = applyingId === gig.id;
          const showPitch = openPitchId === gig.id;

          return (
            <div key={gig.id} className="gig-card">
              <div className="gig-header">
                <div className="gig-avatar">
                  {gig.studentEmail?.[0]?.toUpperCase() || "S"}
                </div>
                <div className="gig-meta">
                  <div className="gig-student">{gig.studentEmail?.split("@")[0]}</div>
                  <div className="gig-rating">
                    {gig.reviewCount > 0
                      ? `⭐ ${gig.rating} · ${gig.reviewCount} reviews`
                      : "New seller"}
                  </div>
                </div>
                <div className="gig-category-badge">
                  {categoryEmoji[gig.category]} {categoryLabel[gig.category]}
                </div>
              </div>

              <h3 className="gig-title">{gig.title}</h3>
              <p className="gig-desc">{gig.description}</p>

              <div className="gig-footer">
                <div className="gig-details">
                  <span className="gig-detail">⏱ {gig.deliveryDays}d delivery</span>
                  <span className="gig-detail">🔄 {gig.revisions === 99 ? "∞" : gig.revisions} revisions</span>
                </div>
                <div className="gig-price-row">
                  <span className="gig-price">₹{gig.price}</span>
                  <span className="gig-unit">/{gig.priceUnit}</span>
                  {alreadyApplied ? (
                    <div className="applied-badge">✓ Applied</div>
                  ) : (
                    <button
                      className="hire-btn"
                      onClick={() => setOpenPitchId(showPitch ? null : gig.id)}
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>

              {/* Pitch box */}
              {showPitch && !alreadyApplied && (
                <div className="pitch-box">
                  <p className="pitch-label">Write a short pitch (why should they pick you?)</p>
                  <textarea
                    className="pitch-input"
                    placeholder="e.g. I've completed 5 similar projects. Here's what I'll bring..."
                    value={pitchMap[gig.id] || ""}
                    onChange={e => setPitchMap(prev => ({
                      ...prev, [gig.id]: e.target.value
                    }))}
                    maxLength={300}
                  />
                  <div className="pitch-footer">
                    <span className="pitch-count">
                      {(pitchMap[gig.id] || "").length}/300
                    </span>
                    <button
                      className="submit-btn"
                      onClick={() => handleApply(gig)}
                      disabled={isApplying || !(pitchMap[gig.id] || "").trim()}
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
          <span>🛒</span><span>Explore</span>
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

export default MarketplaceScreen;
