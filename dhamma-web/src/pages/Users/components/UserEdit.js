import React from "react";
import "./UserEdit.css";

export default function UserEdit({ user, canUpdate, canDelete, onEdit, onDelete, onBack, onToggleActivities }) {
  if (!user) return null;
  return (
    <div className="useredit-card">
      <div className="useredit-body">
        <div className="useredit-name-section">
          <div className="useredit-name-header">
            <button className="useredit-back-btn" onClick={onBack} title="Back to list">
              ←
            </button>
            <div className="useredit-name-group">
              <div className="useredit-name">{user.FullName}</div>
              <div className={`useredit-status-badge ${user.IsActive ? "status-active" : "status-inactive"}`}>
                {user.IsActive ? "● Active Account" : "○ Inactive Account"}
              </div>
            </div>
          </div>
          
          <div className="useredit-actions">
            {canUpdate ? (
              <button className="useredit-icon-btn" type="button" onClick={() => onEdit(user)} title="Edit User">
                ✏️
              </button>
            ) : null}
            <button className="useredit-icon-btn activities-toggle-btn" type="button" onClick={() => onToggleActivities()} title="Show Activity">
              📋
            </button>
            {canDelete ? (
              <button className="useredit-icon-btn useredit-danger" type="button" onClick={() => onDelete(user)} title="Delete User">
                🗑️
              </button>
            ) : null}
          </div>
        </div>

        <div className="useredit-info-item">
          <span className="useredit-label">User ID</span>
          <span className="useredit-value">{user.UserID}</span>
        </div>

        <div className="useredit-info-item">
          <span className="useredit-label">Email Address</span>
          <span className="useredit-value">{user.Email}</span>
        </div>

        <div className="useredit-info-item">
          <span className="useredit-label">Mobile Number</span>
          <span className="useredit-value">{user.MobileNo}</span>
        </div>

        <div className="useredit-info-item">
          <span className="useredit-label">Assigned Role</span>
          <span className="useredit-value">{user.UserRole?.RoleName || "Normal"}</span>
        </div>
      </div>
    </div>
  );
}
