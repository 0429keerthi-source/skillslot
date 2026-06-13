// RoleSelectScreen.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./RoleSelectScreen.css";

function RoleSelectScreen() {
  const navigate = useNavigate();

  return (
    <div className="role-container">

      <div className="role-logo">
        <div className="logo-dot"></div>
        <span>SkillSlot</span>
      </div>

      <h2 className="role-title">Who are you?</h2>
      <p className="role-sub">Choose your account type to get started</p>

      {/* Student card */}
      <div className="role-card" onClick={() => navigate("/signup/student")}>
        <div className="role-icon" style={{background:"#E1F5EE"}}>🎓</div>
        <div className="role-text">
          <div className="role-name">I'm a Student</div>
          <div className="role-desc">Post gigs, earn money, build your resume automatically</div>
        </div>
        <span className="role-arrow">›</span>
      </div>

      {/* Startup card */}
      <div className="role-card" onClick={() => navigate("/signup/startup")}>
        <div className="role-icon" style={{background:"#EEEDFE"}}>🏢</div>
        <div className="role-text">
          <div className="role-name">I'm a Startup / Business</div>
          <div className="role-desc">Hire skilled students, post projects, find talent fast</div>
        </div>
        <span className="role-arrow">›</span>
      </div>

      <p className="role-login">
        Already have an account?{" "}
        <span onClick={() => navigate("/login")}>Sign in</span>
      </p>

    </div>
  );
}

export default RoleSelectScreen;
