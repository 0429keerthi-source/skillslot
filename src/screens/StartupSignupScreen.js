// StartupSignupScreen.js
// Startup / Business registers here — 3 step flow

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import "./StartupSignupScreen.css";

function StartupSignupScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // tracks which step user is on
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // All form data in one object
  const [form, setForm] = useState({
    // Step 1 — basic details
    companyName: "",
    email: "",
    password: "",
    founderName: "",

    // Step 2 — company details
    sector: "",
    city: "",
    teamSize: "",
    website: "",

    // Step 3 — what they need
    lookingFor: [],
    description: "",
    budgetRange: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Toggle skill needs
  const toggleSkill = (skill) => {
    const current = form.lookingFor;
    if (current.includes(skill)) {
      setForm({ ...form, lookingFor: current.filter((s) => s !== skill) });
    } else {
      setForm({ ...form, lookingFor: [...current, skill] });
    }
  };

  // Move to next step with validation
  const nextStep = () => {
    setError("");
    if (step === 1) {
      if (!form.companyName || !form.email || !form.password || !form.founderName) {
        setError("Please fill all fields");
        return;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
    }
    if (step === 2) {
      if (!form.sector || !form.city) {
        setError("Please fill all fields");
        return;
      }
    }
    setStep(step + 1);
  };

  // Final submission
  const handleSubmit = async () => {
    if (form.lookingFor.length === 0) {
      setError("Please select at least one skill you're looking for");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Step 1 — Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      // Step 2 — Save startup profile in Firestore
      // Saved in "startups" collection (separate from students)
      await setDoc(doc(db, "startups", user.uid), {
        uid: user.uid,
        type: "startup",                    // identifies this as a startup account
        companyName: form.companyName,
        founderName: form.founderName,
        email: form.email,
        sector: form.sector,
        city: form.city,
        teamSize: form.teamSize,
        website: form.website,
        lookingFor: form.lookingFor,
        description: form.description,
        budgetRange: form.budgetRange,
        verified: false,                    // admin verifies startup later
        projectsPosted: 0,
        studentsHired: 0,
        createdAt: new Date().toISOString(),
      });

      // Step 3 — Go to startup dashboard
      navigate("/startup/home");

    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try signing in.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Skills startups can look for
  const skillOptions = [
    { label: "Video editing", emoji: "🎬" },
    { label: "Graphic design", emoji: "🎨" },
    { label: "Content writing", emoji: "✏️" },
    { label: "Web development", emoji: "💻" },
    { label: "Social media", emoji: "📱" },
    { label: "Marketing", emoji: "📢" },
    { label: "Data analysis", emoji: "📊" },
    { label: "Photography", emoji: "📷" },
  ];

  return (
    <div className="startup-signup-container">

      {/* Header */}
      <div className="ss-header">
        <button
          className="back-btn"
          onClick={() => step > 1 ? setStep(step - 1) : navigate("/role-select")}
        >←</button>
        <div className="header-logo">
          <div className="logo-dot"></div>
          <span>SkillSlot</span>
        </div>
      </div>

      {/* Progress steps */}
      <div className="steps">
        <div className={`step ${step >= 1 ? "active" : ""}`}></div>
        <div className={`step ${step >= 2 ? "active" : ""}`}></div>
        <div className={`step ${step >= 3 ? "active" : ""}`}></div>
      </div>

      {/* ── STEP 1 — Basic details ── */}
      {step === 1 && (
        <div className="ss-body">
          <div className="ss-badge">🏢 Startup account</div>
          <h2 className="ss-title">Create account</h2>
          <p className="ss-sub">Step 1 of 3 — basic details</p>

          <div className="field">
            <label>Company / Startup name</label>
            <input type="text" name="companyName" placeholder="e.g. FinPay India" value={form.companyName} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Founder / Contact name</label>
            <input type="text" name="founderName" placeholder="e.g. Rahul Sharma" value={form.founderName} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Work email</label>
            <input type="email" name="email" placeholder="rahul@finpay.in" value={form.email} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" name="password" placeholder="Min 8 characters" value={form.password} onChange={handleChange} />
          </div>

          {error && <p className="error-msg">{error}</p>}
          <button className="btn-primary" onClick={nextStep}>Continue →</button>
        </div>
      )}

      {/* ── STEP 2 — Company details ── */}
      {step === 2 && (
        <div className="ss-body">
          <div className="ss-badge">🏢 Startup account</div>
          <h2 className="ss-title">About your company</h2>
          <p className="ss-sub">Step 2 of 3 — company details</p>

          <div className="field">
            <label>Sector</label>
            <select name="sector" value={form.sector} onChange={handleChange}>
              <option value="">Select sector</option>
              <option>Fintech</option>
              <option>EdTech</option>
              <option>Healthtech</option>
              <option>E-commerce</option>
              <option>SaaS</option>
              <option>Sustainability</option>
              <option>Logistics</option>
              <option>Other</option>
            </select>
          </div>
          <div className="field">
            <label>City</label>
            <select name="city" value={form.city} onChange={handleChange}>
              <option value="">Select city</option>
              <option>Hyderabad</option>
              <option>Bangalore</option>
              <option>Mumbai</option>
              <option>Delhi</option>
              <option>Chennai</option>
              <option>Pune</option>
              <option>Other</option>
            </select>
          </div>
          <div className="field">
            <label>Team size</label>
            <select name="teamSize" value={form.teamSize} onChange={handleChange}>
              <option value="">Select size</option>
              <option>1–5 people</option>
              <option>6–20 people</option>
              <option>21–50 people</option>
              <option>50+ people</option>
            </select>
          </div>
          <div className="field">
            <label>Website (optional)</label>
            <input type="url" name="website" placeholder="https://yourcompany.com" value={form.website} onChange={handleChange} />
          </div>

          {error && <p className="error-msg">{error}</p>}
          <button className="btn-primary" onClick={nextStep}>Continue →</button>
        </div>
      )}

      {/* ── STEP 3 — What they need ── */}
      {step === 3 && (
        <div className="ss-body">
          <div className="ss-badge">🏢 Startup account</div>
          <h2 className="ss-title">What do you need?</h2>
          <p className="ss-sub">Step 3 of 3 — skills you're looking for</p>

          <p className="skill-prompt">Select skills you want to hire students for:</p>
          <div className="skill-grid">
            {skillOptions.map((s) => (
              <div
                key={s.label}
                className={`skill-opt ${form.lookingFor.includes(s.label) ? "sel" : ""}`}
                onClick={() => toggleSkill(s.label)}
              >
                <span className="skill-emoji">{s.emoji}</span>
                <span className="skill-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="field">
            <label>Budget range per project</label>
            <select name="budgetRange" value={form.budgetRange} onChange={handleChange}>
              <option value="">Select range</option>
              <option>Under ₹1,000</option>
              <option>₹1,000 – ₹5,000</option>
              <option>₹5,000 – ₹20,000</option>
              <option>₹20,000+</option>
            </select>
          </div>

          <div className="field">
            <label>Brief description of your startup</label>
            <textarea
              name="description"
              placeholder="Tell students what your startup does and what kind of work you'll offer..."
              value={form.description}
              onChange={handleChange}
              style={{width:"100%", minHeight:"80px", padding:"10px 12px", borderRadius:"10px", border:"1px solid #e0e0e0", fontSize:"13px", fontFamily:"inherit", outline:"none", resize:"none"}}
            />
          </div>

          {error && <p className="error-msg">{error}</p>}
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating account..." : "Create startup account ✓"}
          </button>
        </div>
      )}

    </div>
  );
}

export default StartupSignupScreen;
