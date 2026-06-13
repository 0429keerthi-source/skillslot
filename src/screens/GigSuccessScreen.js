// GigSuccessScreen.js
// Shown after student successfully posts a gig

import React from "react";
import { useNavigate } from "react-router-dom";
import "./GigSuccessScreen.css";

function GigSuccessScreen() {
  const navigate = useNavigate();

  return (
    <div className="success-container">
      <div className="success-content">

        {/* Success icon */}
        <div className="success-circle">✅</div>

        <h2 className="success-title">Gig published!</h2>
        <p className="success-sub">
          Your gig is now live. Businesses and startups can discover and hire you.
        </p>

        {/* Coins earned */}
        <div className="coins-earned">
          <span>🪙</span>
          <span>+50 SkillCoins earned for posting!</span>
        </div>

        {/* Tips */}
        <div className="tips-card">
          <p className="tips-title">💡 Tips to get hired faster</p>
          <div className="tip-row">
            <span className="tip-check">✓</span>
            <span>Share your gig link on Instagram and WhatsApp</span>
          </div>
          <div className="tip-row">
            <span className="tip-check">✓</span>
            <span>Verify your skill to get a trusted badge</span>
          </div>
          <div className="tip-row">
            <span className="tip-check">✓</span>
            <span>Add a work sample to your profile</span>
          </div>
        </div>

        {/* Buttons */}
        <button
          className="btn-primary"
          onClick={() => navigate("/marketplace")}
        >
          Browse marketplace
        </button>
        <button
          className="btn-secondary"
          onClick={() => navigate("/home")}
        >
          Back to dashboard
        </button>

      </div>
    </div>
  );
}

export default GigSuccessScreen;
