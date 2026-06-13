// App.js — connects ALL screens together

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Shared
import SplashScreen from "./screens/SplashScreen";
import RoleSelectScreen from "./screens/RoleSelectScreen";
import LoginScreen from "./screens/LoginScreen";

// Student screens
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import PostGigScreen from "./screens/PostGigScreen";
import GigSuccessScreen from "./screens/GigSuccessScreen";
import MarketplaceScreen from "./screens/MarketplaceScreen";
import PostProjectScreen from "./screens/PostProjectScreen";
import ProjectSuccessScreen from "./screens/ProjectSuccessScreen";
import ProjectsListScreen from "./screens/ProjectsListScreen";
import ApplicationsScreen from "./screens/ApplicationsScreen";
import MyApplicationsScreen from "./screens/MyApplicationsScreen";
// Startup screens
import StartupSignupScreen from "./screens/StartupSignupScreen";
import StartupHomeScreen from "./screens/StartupHomeScreen";

import "./App.css";

// Catches any crash and shows helpful error
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:"30px", fontFamily:"sans-serif",
          maxWidth:"420px", margin:"0 auto"}}>
          <div style={{background:"#FEF2F2", border:"1px solid #FCA5A5",
            borderRadius:"12px", padding:"20px"}}>
            <h2 style={{color:"#DC2626", marginBottom:"12px"}}>⚠️ App Error</h2>
            <p style={{color:"#7F1D1D", fontSize:"14px", marginBottom:"16px"}}>
              Something crashed. Most likely cause:{" "}
              <strong>Firebase config not set up correctly.</strong>
            </p>
            <div style={{background:"white", borderRadius:"8px",
              padding:"14px", marginBottom:"16px"}}>
              <p style={{fontSize:"13px", color:"#444", marginBottom:"8px"}}>
                <strong>Error:</strong>
              </p>
              <code style={{fontSize:"12px", color:"#DC2626", wordBreak:"break-all"}}>
                {this.state.error?.message || "Unknown error"}
              </code>
            </div>
            <button
              onClick={() => window.location.href = "/"}
              style={{padding:"10px 20px", background:"#1D9E75",
                color:"white", border:"none", borderRadius:"8px",
                cursor:"pointer", fontSize:"14px", fontWeight:"500"}}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Shared */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/role-select" element={<RoleSelectScreen />} />
          <Route path="/login" element={<LoginScreen />} />

          {/* Student flow */}
          <Route path="/signup/student" element={<SignupScreen />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/post-gig" element={<PostGigScreen />} />
          <Route path="/gig-success" element={<GigSuccessScreen />} />
          <Route path="/marketplace" element={<MarketplaceScreen />} />
          <Route path="/projects" element={<ProjectsListScreen />} /> 
          <Route path="/my-applications" element={<MyApplicationsScreen />} />npm  
          {/* Startup flow */}
          <Route path="/signup/startup" element={<StartupSignupScreen />} />
          <Route path="/startup/home" element={<StartupHomeScreen />} />
          <Route path="/startup/post-project" element={<PostProjectScreen />} />      {/* ← add */}
          <Route path="/startup/project-success" element={<ProjectSuccessScreen />} /> {/* ← add */}
          <Route path="/startup/applications" element={<ApplicationsScreen />} />  
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
