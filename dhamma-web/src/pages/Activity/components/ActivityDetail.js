import React from "react";
import "./ActivityEditPage.css";

export default function ActivityDetail({ activity, onEdit, onBack }) {
  if (!activity) return null;

  const calculateDuration = (start, end) => {
    const diffMs = new Date(end) - new Date(start);
    if (diffMs < 0) return "0m";
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="activity-card">
      <div className="activity-detail-body">
        <div className="activity-name-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="activity-back-btn" onClick={onBack} title="Back to list">
              ←
            </button>
            <div className="detail-item-header">
              <span className="detail-label">Activity Name</span>
              <div className="activity-main-name">{activity.Name}</div>
            </div>
          </div>
          
          <div className="activity-actions">
            <button className="activity-icon-btn" type="button" onClick={onEdit} title="Edit Activity">
              ✏️
            </button>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-label">Assigned User</span>
          <span className="detail-value">{activity.User?.FullName || activity.UserID}</span>
        </div>

        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">Start Date & Time</span>
            <span className="detail-value">
              {new Date(activity.StartDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">End Date & Time</span>
            <span className="detail-value">
              {new Date(activity.EndDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-label">Duration</span>
          <span className="detail-value duration-text">
            {calculateDuration(activity.StartDate, activity.EndDate)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Remark</span>
          <p className="detail-remark">{activity.Remark || "-"}</p>
        </div>
      </div>
    </div>
  );
}
