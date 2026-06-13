// SignupScreen.js — Student signup
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import "./SignupScreen.css";

function SignupScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", college: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password || !form.college) {
      setError("Please fill all fields"); return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters"); return;
    }
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, form.email, form.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "students", user.uid), {
        uid: user.uid,
        type: "student",
        name: form.name,
        email: form.email,
        college: form.college,
        skills: [],
        bio: "",
        city: "",
        rating: 0,
        jobsDone: 0,
        totalEarned: 0,
        skillCoins: 200,
        profileComplete: 40,
        createdAt: new Date().toISOString(),
      });

      navigate("/home");

    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try signing in.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-header">
        <button className="back-btn" onClick={() => navigate("/role-select")}>←</button>
        <div className="header-logo">
          <div className="logo-dot"></div>
          <span>SkillSlot</span>
        </div>
      </div>

      <div className="steps">
        <div className="step active"></div>
        <div className="step"></div>
        <div className="step"></div>
      </div>

      <h1 className="signup-title">Create account</h1>
      <p className="signup-sub">Step 1 of 3 — basic details</p>

      <div className="signup-form">
        <div className="field">
          <label>Full name</label>
          <input type="text" name="name" placeholder="e.g. Arjun Kumar"
            value={form.name} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Email address</label>
          <input type="email" name="email" placeholder="arjun@gmail.com"
            value={form.email} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" name="password" placeholder="Min 8 characters"
            value={form.password} onChange={handleChange} />
        </div>
        <div className="field">
          <label>College / University</label>
          <input type="text" name="college" placeholder="e.g. JNTU Hyderabad"
            value={form.college} onChange={handleChange} />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="btn-primary" onClick={handleSignup} disabled={loading}>
          {loading ? "Creating account..." : "Continue →"}
        </button>

        <p className="login-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

export default SignupScreen;
