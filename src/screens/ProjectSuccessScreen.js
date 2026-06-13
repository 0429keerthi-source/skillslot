// ProjectSuccessScreen.js
// Shown after startup successfully posts a project

import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectSuccessScreen.css";

function ProjectSuccessScreen() {
  const navigate = useNavigate();

  return (
    <div className="psuccess-container">
      <div className="psuccess-content">

        <div className="psuccess-circle">🚀</div>

        <h2 className="psuccess-title">Project posted!</h2>
        <p className="psuccess-sub">
          Your project is live. Students matching your skills will start applying soon.
        </p>

        <div className="psuccess-highlight">
          <span>⚡</span>
          <span>Most projects receive their first application within 2 hours</span>
        </div>

        <div className="tips-card">
          <p className="tips-title">📋 What happens next</p>
          <div className="tip-row">
            <span className="tip-check">1</span>
            <span>Students browse and apply with a short pitch</span>
          </div>
          <div className="tip-row">
            <span className="tip-check">2</span>
            <span>You review applicants and their profiles</span>
          </div>
          <div className="tip-row">
            <span className="tip-check">3</span>
            <span>Hire the best fit and get started</span>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate("/startup/applications")}
        >
          View applications
        </button>
        <button
          className="btn-secondary"
          onClick={() => navigate("/startup/home")}
        >
          Back to dashboard
        </button>

      </div>
    </div>
  );
}

export default ProjectSuccessScreen;
