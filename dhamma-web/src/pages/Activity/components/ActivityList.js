import React, { useState } from "react";
import "./ActivityList.css";
import Pagination from "../../../components/Pagination";

export default function ActivityList({
  activities,
  loading,
  canUpdate,
  canDelete,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onRowDoubleClick,
  onSort,
  sortConfig,
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  const isSorted = (key) => sortConfig.key === key;
  const getSortIcon = (key) => {
    if (!isSorted(key)) return "↕️";
    return sortConfig.direction === "asc" ? "🔼" : "🔽";
  };

  const handleSort = (key) => {
    onSort(key);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <section className="activitylist-card">
      <div className="activitylist-header">
        <div className="header-left">
          <h2>Activities</h2>
          {loading ? <span className="activitylist-loading">Loading...</span> : null}
        </div>
        <button className="btn-add-new" onClick={onAdd}>
          + New Activity
        </button>
      </div>
      <div className="activitylist-table-wrapper">
        <table className="activitylist-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("Name")} style={{ cursor: 'pointer' }}>
                Name {getSortIcon("Name")}
              </th>
              <th onClick={() => handleSort("UserID")} style={{ cursor: 'pointer' }}>
                User {getSortIcon("UserID")}
              </th>
              <th onClick={() => handleSort("StartDate")} style={{ cursor: 'pointer' }}>
                Start Date {getSortIcon("StartDate")}
              </th>
              <th onClick={() => handleSort("EndDate")} style={{ cursor: 'pointer' }}>
                End Date {getSortIcon("EndDate")}
              </th>
              <th>Duration</th>
              <th>Remark</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.ID} onDoubleClick={() => onRowDoubleClick(activity)}>
                <td className="font-bold">{activity.Name}</td>
                <td>{activity.User?.FullName || activity.UserID}</td>
                <td>{new Date(activity.StartDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td>{new Date(activity.EndDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td className="duration-col">{calculateDuration(activity.StartDate, activity.EndDate)}</td>
                <td className="remark-col">{activity.Remark || "-"}</td>
                <td>
                  <div className="activitylist-actions">
                    <button className="activitylist-icon-btn" type="button" onClick={() => onView(activity)} title="View Detail">
                      👁️
                    </button>
                    {canUpdate ? (
                      <button className="activitylist-icon-btn" type="button" onClick={() => onEdit(activity)} title="Edit Activity">
                        ✏️
                      </button>
                    ) : null}
                    {canDelete ? (
                      <button className="activitylist-icon-btn activitylist-danger" type="button" onClick={() => onDelete(activity)} title="Delete Activity">
                        🗑️
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {activities.length === 0 && !loading && (
              <tr>
                <td colSpan="7" className="no-data-cell">No activities found.</td>
              </tr>
            )}
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
    </section>
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
