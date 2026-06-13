// PostProjectScreen.js
// Startup posts a project — students can see and apply

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { collection, addDoc, doc, updateDoc, increment } from "firebase/firestore";
import "./PostProjectScreen.css";

function PostProjectScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    skillsNeeded: [],
    budgetMin: "",
    budgetMax: "",
    budgetType: "fixed",
    duration: "1 week",
    locationType: "remote",
    city: "Hyderabad",
  });

  const categories = [
    { label: "Video editing",   emoji: "🎬", value: "video" },
    { label: "Graphic design",  emoji: "🎨", value: "design" },
    { label: "Content writing", emoji: "✏️",  value: "writing" },
    { label: "Web development", emoji: "💻", value: "webdev" },
    { label: "Social media",    emoji: "📱", value: "social" },
    { label: "Marketing",       emoji: "📢", value: "marketing" },
    { label: "Photography",     emoji: "📷", value: "photo" },
    { label: "Data analysis",   emoji: "📊", value: "data" },
  ];

  const skillOptions = {
    video:     ["Premiere Pro", "After Effects", "CapCut", "DaVinci Resolve", "YouTube Shorts"],
    design:    ["Figma", "Canva", "Illustrator", "Photoshop", "Logo design"],
    writing:   ["Blog writing", "Copywriting", "SEO content", "Product descriptions", "Scriptwriting"],
    webdev:    ["React", "HTML/CSS", "Node.js", "WordPress", "Flutter"],
    social:    ["Instagram", "LinkedIn", "Twitter/X", "Reels", "Content calendar"],
    marketing: ["Google Ads", "Meta Ads", "Email marketing", "SEO", "Growth hacking"],
    photo:     ["Product photography", "Event photography", "Editing", "Reels shooting"],
    data:      ["Excel", "Python", "Power BI", "SQL", "Market research"],
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skillsNeeded: prev.skillsNeeded.includes(skill)
        ? prev.skillsNeeded.filter((s) => s !== skill)
        : [...prev.skillsNeeded, skill],
    }));
  };

  const nextStep = () => {
    setError("");
    if (step === 1 && !form.category) {
      setError("Please select a category"); return;
    }
    if (step === 2) {
      if (!form.title.trim()) { setError("Please enter a project title"); return; }
      if (!form.description.trim()) { setError("Please describe the project"); return; }
      if (form.skillsNeeded.length === 0) { setError("Select at least one skill needed"); return; }
    }
    setStep(step + 1);
  };

  const handlePublish = async () => {
    if (!form.budgetMin || Number(form.budgetMin) <= 0) {
      setError("Please enter a valid budget"); return;
    }
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) { navigate("/login"); return; }

      // Save project to Firestore
      await addDoc(collection(db, "projects"), {
        startupId: user.uid,
        startupEmail: user.email,
        category: form.category,
        title: form.title,
        description: form.description,
        skillsNeeded: form.skillsNeeded,
        budgetMin: Number(form.budgetMin),
        budgetMax: form.budgetMax ? Number(form.budgetMax) : Number(form.budgetMin),
        budgetType: form.budgetType,
        duration: form.duration,
        locationType: form.locationType,
        city: form.locationType === "remote" ? "Remote" : form.city,
        applicationsCount: 0,
        status: "open",
        createdAt: new Date().toISOString(),
      });

      // Increment startup's projectsPosted count
      await updateDoc(doc(db, "startups", user.uid), {
        projectsPosted: increment(1),
      });

      navigate("/startup/project-success");

    } catch (err) {
      console.error("Error posting project:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCatSkills = skillOptions[form.category] || [];

  return (
    <div className="postproject-container">

      {/* Header */}
      <div className="pp-header">
        <button
          className="back-btn"
          onClick={() => step > 1 ? setStep(step - 1) : navigate("/startup/home")}
        >←</button>
        <div className="header-logo">
          <div className="logo-dot"></div>
          <span>Post a project</span>
        </div>
        <button className="cancel-btn" onClick={() => navigate("/startup/home")}>
          Cancel
        </button>
      </div>

      {/* Progress steps */}
      <div className="steps">
        <div className={`step ${step >= 1 ? "active" : ""}`}></div>
        <div className={`step ${step >= 2 ? "active" : ""}`}></div>
        <div className={`step ${step >= 3 ? "active" : ""}`}></div>
      </div>

      {/* ── STEP 1 — Category ── */}
      {step === 1 && (
        <div className="pp-body">
          <h2 className="pp-title">What do you need?</h2>
          <p className="pp-sub">Step 1 of 3 — choose a category</p>

          <div className="cat-grid">
            {categories.map((cat) => (
              <div
                key={cat.value}
                className={`cat-card ${form.category === cat.value ? "selected" : ""}`}
                onClick={() => setForm({ ...form, category: cat.value, skillsNeeded: [] })}
              >
                <span className="cat-emoji">{cat.emoji}</span>
                <span className="cat-label">{cat.label}</span>
              </div>
            ))}
          </div>

          {error && <p className="error-msg">{error}</p>}
          <button className="btn-primary" onClick={nextStep}>Continue →</button>
        </div>
      )}

      {/* ── STEP 2 — Description + Skills ── */}
      {step === 2 && (
        <div className="pp-body">
          <h2 className="pp-title">Describe your project</h2>
          <p className="pp-sub">Step 2 of 3 — what needs to be done?</p>

          <div className="field">
            <label>Project title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Create 10 Instagram reels for our launch"
              value={form.title}
              onChange={handleChange}
              maxLength={80}
            />
            <span className="char-count">{form.title.length}/80</span>
          </div>

          <div className="field">
            <label>Project description</label>
            <textarea
              name="description"
              placeholder="Describe the project in detail — what you need, references, timeline expectations, any tools required..."
              value={form.description}
              onChange={handleChange}
              maxLength={600}
            />
            <span className="char-count">{form.description.length}/600</span>
          </div>

          <div className="field">
            <label>Skills needed</label>
            <div className="skill-chips">
              {selectedCatSkills.map((skill) => (
                <div
                  key={skill}
                  className={`skill-chip ${form.skillsNeeded.includes(skill) ? "selected" : ""}`}
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Timeline</label>
            <select name="duration" value={form.duration} onChange={handleChange}>
              <option value="2-3 days">2–3 days</option>
              <option value="1 week">1 week</option>
              <option value="2 weeks">2 weeks</option>
              <option value="1 month">1 month</option>
              <option value="Ongoing">Ongoing / recurring</option>
            </select>
          </div>

          {error && <p className="error-msg">{error}</p>}
          <button className="btn-primary" onClick={nextStep}>Continue →</button>
        </div>
      )}

      {/* ── STEP 3 — Budget + Location ── */}
      {step === 3 && (
        <div className="pp-body">
          <h2 className="pp-title">Budget & location</h2>
          <p className="pp-sub">Step 3 of 3 — what's your budget?</p>

          {/* Budget type toggle */}
          <div className="toggle-row">
            <button
              className={`toggle-btn ${form.budgetType === "fixed" ? "active" : ""}`}
              onClick={() => setForm({ ...form, budgetType: "fixed" })}
            >Fixed price</button>
            <button
              className={`toggle-btn ${form.budgetType === "range" ? "active" : ""}`}
              onClick={() => setForm({ ...form, budgetType: "range" })}
            >Budget range</button>
          </div>

          {form.budgetType === "fixed" ? (
            <div className="field">
              <label>Budget (₹)</label>
              <input
                type="number"
                name="budgetMin"
                placeholder="e.g. 2000"
                value={form.budgetMin}
                onChange={handleChange}
                min="100"
              />
            </div>
          ) : (
            <div className="price-row">
              <div className="field" style={{ flex: 1 }}>
                <label>Min (₹)</label>
                <input
                  type="number"
                  name="budgetMin"
                  placeholder="500"
                  value={form.budgetMin}
                  onChange={handleChange}
                  min="100"
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Max (₹)</label>
                <input
                  type="number"
                  name="budgetMax"
                  placeholder="2000"
                  value={form.budgetMax}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Location */}
          <div className="field">
            <label>Work location</label>
            <div className="toggle-row">
              <button
                className={`toggle-btn ${form.locationType === "remote" ? "active" : ""}`}
                onClick={() => setForm({ ...form, locationType: "remote" })}
              >🌐 Remote</button>
              <button
                className={`toggle-btn ${form.locationType === "onsite" ? "active" : ""}`}
                onClick={() => setForm({ ...form, locationType: "onsite" })}
              >📍 On-site</button>
            </div>
          </div>

          {/* Preview card */}
          {form.budgetMin && (
            <div className="preview-card">
              <p className="preview-label">Preview — what students will see</p>
              <p className="preview-title">{form.title}</p>
              <div className="preview-tags">
                {form.skillsNeeded.slice(0, 3).map((s) => (
                  <span key={s} className="preview-cat">{s}</span>
                ))}
              </div>
              <div className="preview-footer">
                <span className="preview-cat">
                  {form.locationType === "remote" ? "🌐 Remote" : "📍 On-site"}
                  {" · "}{form.duration}
                </span>
                <span className="preview-price">
                  ₹{form.budgetMin}
                  {form.budgetType === "range" && form.budgetMax ? `–${form.budgetMax}` : ""}
                </span>
              </div>
            </div>
          )}

          {error && <p className="error-msg">{error}</p>}
          <button
            className="btn-primary"
            onClick={handlePublish}
            disabled={loading}
          >
            {loading ? "Posting..." : "Post project 🚀"}
          </button>
        </div>
      )}

    </div>
  );
}

export default PostProjectScreen;
