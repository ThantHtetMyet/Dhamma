import React from "react";
import "./UserEdit.css";
import Pagination from "../../../components/Pagination";

export default function UserActivities({ 
  activities = [],
  canUpdate,
  canDelete,
  activityFormMode,
  activityFormData,
  onActivityFormChange,
  onCreateActivity,
  onEditActivity,
  onDeleteActivity,
  onSaveActivity,
  onCancelActivityForm,
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
        <h4>Activity History</h4>
        {canUpdate ? (
          <button className="btn-add-new user-activity-add-btn" type="button" onClick={onCreateActivity}>
            + Add Activity
          </button>
        ) : null}
      </div>

      {activityFormMode !== "none" ? (
        <div className="user-activity-modal-backdrop">
          <div className="user-activity-modal">
            <div className="user-activity-modal-header">
              <h5>{activityFormMode === "create" ? "New Activity" : "Edit Activity"}</h5>
              <button
                type="button"
                className="user-activity-modal-close"
                onClick={onCancelActivityForm}
                aria-label="Close activity form"
                title="Close"
              >
                ✕
              </button>
            </div>
            <form className="user-activity-form" onSubmit={onSaveActivity}>
              <div className="user-activity-form-grid">
                <div className="form-group">
                  <label htmlFor="activity-name">Activity Name</label>
                  <input
                    id="activity-name"
                    type="text"
                    name="name"
                    value={activityFormData.name}
                    onChange={onActivityFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="activity-startDate">Start Date</label>
                  <input
                    id="activity-startDate"
                    type="datetime-local"
                    name="startDate"
                    value={activityFormData.startDate}
                    onChange={onActivityFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="activity-endDate">End Date</label>
                  <input
                    id="activity-endDate"
                    type="datetime-local"
                    name="endDate"
                    value={activityFormData.endDate}
                    onChange={onActivityFormChange}
                    required
                  />
                </div>
                <div className="form-group user-activity-remark-group">
                  <label htmlFor="activity-remark">Remark</label>
                  <textarea
                    id="activity-remark"
                    name="remark"
                    rows="2"
                    maxLength="200"
                    value={activityFormData.remark}
                    onChange={onActivityFormChange}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {activityFormMode === "create" ? "Create Activity" : "Update Activity"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={onCancelActivityForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

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
                    <tr key={activity.ID}>
                      <td className="font-semibold">{activity.Name}</td>
                      <td>{new Date(activity.StartDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td>{new Date(activity.EndDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td className="duration-col">{duration}</td>
                      <td className="remark-col">{activity.Remark || "-"}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="user-activity-row-actions">
                          {canUpdate ? (
                            <button
                              className="useredit-table-btn"
                              type="button"
                              onClick={() => onEditActivity(activity)}
                              title="Edit Activity"
                            >
                              ✎
                            </button>
                          ) : null}
                          {canDelete ? (
                            <button
                              className="useredit-table-btn useredit-delete-table-btn"
                              type="button"
                              onClick={() => onDeleteActivity(activity)}
                              title="Delete Activity"
                            >
                              🗑
                            </button>
                          ) : null}
                        </div>
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
