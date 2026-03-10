import React from "react";
import "./UserEdit.css";
import Pagination from "../../../components/Pagination";

export default function UserActivities({ 
  activities = [], 
  onBackToProfile, 
  onViewActivity,
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange
}) {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="useredit-card user-activities-container">
      <div className="useredit-activities-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="useredit-back-btn" onClick={onBackToProfile} title="Back to Profile">
            ←
          </button>
          <h4>Activity History</h4>
        </div>
      </div>
      
      {activities.length > 0 ? (
        <>
          <div className="useredit-activities-table-wrapper">
            <table className="useredit-activities-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                  <th>Remark</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => {
                  const duration = calculateDuration(activity.StartDate, activity.EndDate);
                  return (
                    <tr 
                      key={activity.ID} 
                      onDoubleClick={() => onViewActivity(activity)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="font-semibold">{activity.Name}</td>
                      <td>{new Date(activity.StartDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td>{new Date(activity.EndDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td className="duration-col">{duration}</td>
                      <td className="remark-col">{activity.Remark || "-"}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="useredit-table-btn" 
                          onClick={() => onViewActivity(activity)}
                          title="View Details"
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      ) : (
        <div className="no-activity-placeholder">
          <div className="no-activity-icon">📅</div>
          <p>No activity recorded for this user.</p>
        </div>
      )}
    </div>
  );
}

function calculateDuration(start, end) {
  const diffMs = new Date(end) - new Date(start);
  if (diffMs < 0) return "0m";
  
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
