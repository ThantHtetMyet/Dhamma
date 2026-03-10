import React from "react";
import "./UserEdit.css";

export default function UserEdit({ user, canUpdate, canDelete, canGenerateQr, onEdit, onDelete, onBack, onGenerateQr }) {
  if (!user) return null;
  return (
    <div className="useredit-card">
      <div className="useredit-body">
        <div className="useredit-name-section">
          <div className="useredit-top-row">
            <button className="useredit-back-btn" onClick={onBack} title="Back to list">
              ←
            </button>
            <div className="useredit-actions">
              {canGenerateQr ? (
                <button
                  className="useredit-icon-btn action-qr"
                  type="button"
                  onClick={() => onGenerateQr(user)}
                  title="Generate QR"
                  aria-label="Generate QR"
                >
                  QR
                </button>
              ) : null}
              {canUpdate ? (
                <button
                  className="useredit-icon-btn action-edit"
                  type="button"
                  onClick={() => onEdit(user)}
                  title="Edit User"
                  aria-label="Edit User"
                >
                  ✎
                </button>
              ) : null}
              {canDelete ? (
                <button
                  className="useredit-icon-btn action-delete"
                  type="button"
                  onClick={() => onDelete(user)}
                  title="Delete User"
                  aria-label="Delete User"
                >
                  🗑
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="useredit-info-item">
          <span className="useredit-label">User Name</span>
          <span className="useredit-value">{user.FullName}</span>
        </div>

        <div className="useredit-info-item">
          <span className="useredit-label">Mobile Number</span>
          <span className="useredit-value">{user.MobileNo}</span>
        </div>

        <div className="useredit-info-item">
          <span className="useredit-label">Health Information</span>
          <span className="useredit-value">
            {Array.isArray(user.HealthIssues) && user.HealthIssues.length > 0 ? user.HealthIssues.join(", ") : "None"}
          </span>
        </div>

        <div className="useredit-info-item">
          <span className="useredit-label">Remark</span>
          <span className="useredit-value">{user.Remark || "-"}</span>
        </div>
      </div>
    </div>
  );
}
