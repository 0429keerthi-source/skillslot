// SplashScreen.js
import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import "./SplashScreen.css";

function SplashScreen() {
  const navigate = useNavigate();

  return (
    <div className="splash-container">

      <div className="splash-logo">
        <Logo size="lg" />
      </div>

      <p className="splash-tagline">
        Earn from your skills.<br />
        Get discovered by startups.
      </p>

      <div className="traction-grid">
        <div className="traction-card">
          <div className="traction-number">12k+</div>
          <div className="traction-label">Students earning</div>
        </div>
        <div className="traction-card">
          <div className="traction-number">850+</div>
          <div className="traction-label">Startups hiring</div>
        </div>
        <div className="traction-card">
          <div className="traction-number">₹2.4Cr</div>
          <div className="traction-label">Paid to students</div>
        </div>
        <div className="traction-card">
          <div className="traction-number">4.8★</div>
          <div className="traction-label">Avg rating</div>
        </div>
      </div>

      <div className="splash-buttons">
        <button
          className="btn-primary"
          onClick={() => navigate("/role-select")}
        >
          Get started free
        </button>
        <button
          className="btn-secondary"
          onClick={() => navigate("/login")}
        >
          Sign in
        </button>
        <p className="startup-link">
          For startups —{" "}
          <span onClick={() => navigate("/role-select")}>post a project</span>
        </p>
      </div>

    </div>
  );
}

export default SplashScreen;
