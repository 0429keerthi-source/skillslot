// PostGigScreen.js
// Student posts a gig here — title, category, price, description

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import "./PostGigScreen.css";

function PostGigScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    price: "",
    priceUnit: "project",
    deliveryDays: "2",
    revisions: "2",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const categories = [
    { label: "Video editing",   emoji: "🎬", value: "video" },
    { label: "Graphic design",  emoji: "🎨", value: "design" },
    { label: "Content writing", emoji: "✏️", value: "writing" },
    { label: "Web development", emoji: "💻", value: "webdev" },
    { label: "Social media",    emoji: "📱", value: "social" },
    { label: "Marketing",       emoji: "📢", value: "marketing" },
    { label: "Photography",     emoji: "📷", value: "photo" },
    { label: "Data analysis",   emoji: "📊", value: "data" },
  ];

  const nextStep = () => {
    setError("");
    if (step === 1 && !form.category) {
      setError("Please select a category"); return;
    }
    if (step === 2) {
      if (!form.title) { setError("Please enter a gig title"); return; }
      if (!form.description) { setError("Please enter a description"); return; }
    }
    setStep(step + 1);
  };

  const handlePublish = async () => {
    if (!form.price || form.price <= 0) {
      setError("Please enter a valid price"); return;
    }
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) { navigate("/login"); return; }

      // Save gig to Firestore "gigs" collection
      await addDoc(collection(db, "gigs"), {
        studentId: user.uid,
        studentEmail: user.email,
        category: form.category,
        title: form.title,
        description: form.description,
        price: Number(form.price),
        priceUnit: form.priceUnit,
        deliveryDays: Number(form.deliveryDays),
        revisions: Number(form.revisions),
        rating: 0,
        reviewCount: 0,
        ordersCompleted: 0,
        status: "active",
        createdAt: new Date().toISOString(),
      });

      navigate("/gig-success");

    } catch (err) {
      console.error("Error posting gig:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="postgig-container">

      {/* Header */}
      <div className="pg-header">
        <button
          className="back-btn"
          onClick={() => step > 1 ? setStep(step - 1) : navigate("/home")}
        >←</button>
        <div className="header-logo">
          <div className="logo-dot"></div>
          <span>Post a gig</span>
        </div>
        <button className="cancel-btn" onClick={() => navigate("/home")}>
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
        <div className="pg-body">
          <h2 className="pg-title">What's your skill?</h2>
          <p className="pg-sub">Step 1 of 3 — choose a category</p>

          <div className="cat-grid">
            {categories.map((cat) => (
              <div
                key={cat.value}
                className={`cat-card ${form.category === cat.value ? "selected" : ""}`}
                onClick={() => setForm({ ...form, category: cat.value })}
              >
                <span className="cat-emoji">{cat.emoji}</span>
                <span className="cat-label">{cat.label}</span>
              </div>
            ))}
          </div>

          {error && <p className="error-msg">{error}</p>}
          <button className="btn-primary" onClick={nextStep}>
            Continue →
          </button>
        </div>
      )}

      {/* ── STEP 2 — Description ── */}
      {step === 2 && (
        <div className="pg-body">
          <h2 className="pg-title">Describe your gig</h2>
          <p className="pg-sub">Step 2 of 3 — tell clients what you offer</p>

          <div className="field">
            <label>Gig title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. I will edit short reels for your brand"
              value={form.title}
              onChange={handleChange}
              maxLength={80}
            />
            <span className="char-count">{form.title.length}/80</span>
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe what you'll deliver, tools you use, what client needs to provide..."
              value={form.description}
              onChange={handleChange}
              maxLength={500}
            />
            <span className="char-count">{form.description.length}/500</span>
          </div>

          <div className="field">
            <label>Delivery time</label>
            <select name="deliveryDays" value={form.deliveryDays} onChange={handleChange}>
              <option value="1">1 day</option>
              <option value="2">2 days</option>
              <option value="3">3 days</option>
              <option value="5">5 days</option>
              <option value="7">1 week</option>
              <option value="14">2 weeks</option>
            </select>
          </div>

          {error && <p className="error-msg">{error}</p>}
          <button className="btn-primary" onClick={nextStep}>
            Continue →
          </button>
        </div>
      )}

      {/* ── STEP 3 — Pricing ── */}
      {step === 3 && (
        <div className="pg-body">
          <h2 className="pg-title">Set your price</h2>
          <p className="pg-sub">Step 3 of 3 — how much do you charge?</p>

          <div className="price-row">
            <div className="field" style={{flex:2}}>
              <label>Price (₹)</label>
              <input
                type="number"
                name="price"
                placeholder="e.g. 400"
                value={form.price}
                onChange={handleChange}
                min="50"
              />
            </div>
            <div className="field" style={{flex:1}}>
              <label>Per</label>
              <select name="priceUnit" value={form.priceUnit} onChange={handleChange}>
                <option value="project">project</option>
                <option value="reel">reel</option>
                <option value="logo">logo</option>
                <option value="post">post</option>
                <option value="hour">hour</option>
                <option value="month">month</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Revisions included</label>
            <select name="revisions" value={form.revisions} onChange={handleChange}>
              <option value="1">1 revision</option>
              <option value="2">2 revisions</option>
              <option value="3">3 revisions</option>
              <option value="5">5 revisions</option>
              <option value="99">Unlimited</option>
            </select>
          </div>

          {/* Preview card */}
          {form.price && (
            <div className="preview-card">
              <p className="preview-label">Preview — what clients will see</p>
              <p className="preview-title">{form.title}</p>
              <div className="preview-footer">
                <span className="preview-cat">
                  {categories.find(c => c.value === form.category)?.emoji}{" "}
                  {categories.find(c => c.value === form.category)?.label}
                </span>
                <span className="preview-price">
                  Starting ₹{form.price}/{form.priceUnit}
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
            {loading ? "Publishing..." : "Publish gig 🚀"}
          </button>
        </div>
      )}

    </div>
  );
}

export default PostGigScreen;
