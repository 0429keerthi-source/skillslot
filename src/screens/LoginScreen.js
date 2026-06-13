// LoginScreen.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import "./SignupScreen.css";

function LoginScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, form.email, form.password
      );
      const uid = userCredential.user.uid;

      // Check if this user is a student or startup
      // First check students collection
      const studentDoc = await getDoc(doc(db, "students", uid));
      if (studentDoc.exists()) {
        navigate("/home"); // student dashboard
        return;
      }

      // Then check startups collection
      const startupDoc = await getDoc(doc(db, "startups", uid));
      if (startupDoc.exists()) {
        navigate("/startup/home"); // startup dashboard
        return;
      }

      // If neither found — something went wrong
      setError("Account not found. Please sign up first.");

    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setError("No account found with this email. Please sign up first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Wrong password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a few minutes and try again.");
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
        <button className="back-btn" onClick={() => navigate("/")}>←</button>
        <div className="header-logo">
          <div className="logo-dot"></div>
          <span>SkillSlot</span>
        </div>
      </div>

      <h1 className="signup-title">Welcome back</h1>
      <p className="signup-sub">Sign in to your account</p>

      <div className="signup-form">
        <div className="field">
          <label>Email address</label>
          <input
            type="email"
            name="email"
            placeholder="arjun@gmail.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <p style={{textAlign:"right", fontSize:"12px", color:"#1D9E75",
          cursor:"pointer", margin:"0 0 16px"}}>
          Forgot password?
        </p>

        {error && <p className="error-msg">{error}</p>}

        <button
          className="btn-primary"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="login-link">
          New here?{" "}
          <span onClick={() => navigate("/role-select")}>Create account</span>
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;
