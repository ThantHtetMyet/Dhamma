import { Link } from "react-router-dom";
import "./NavBar.css";
import dhammaIcon from "../images/dhamma_nav_icon.png";

export default function NavBar({ userName, onSignOut, activeMenu = "User" }) {
  return (
    <nav className="nav-bar">
      <div className="nav-left">
        <Link to="/" className="nav-brand">
          <img src={dhammaIcon} alt="Dhamma" className="nav-icon" />
        </Link>
        <div className="nav-links">
          <Link to="/users" className={`nav-link ${activeMenu === "User" ? "nav-link-active" : ""}`}>
            User
          </Link>
          <Link to="/activity" className={`nav-link ${activeMenu === "Activity" ? "nav-link-active" : ""}`}>
            Activity
          </Link>
        </div>
      </div>
      <div className="nav-actions">
        <span className="nav-user">{userName}</span>
        <button className="nav-signout" type="button" onClick={onSignOut} title="Sign Out">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
