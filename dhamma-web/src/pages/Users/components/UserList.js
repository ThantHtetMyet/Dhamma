import React from "react";
import "./UserList.css";
import Pagination from "../../../components/Pagination";

export default function UserList({
  users,
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
    <section className="userlist-card">
      <div className="userlist-header">
        <div className="header-left">
          <h2>System Users</h2>
          {loading ? <span className="userlist-loading">Loading...</span> : null}
        </div>
        <button className="btn-add-new" onClick={onAdd}>
          + New User
        </button>
      </div>
      <div className="userlist-table-wrapper">
        <table className="userlist-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("UserID")} style={{ cursor: 'pointer' }}>
                User ID {getSortIcon("UserID")}
              </th>
              <th onClick={() => handleSort("FullName")} style={{ cursor: 'pointer' }}>
                Full Name {getSortIcon("FullName")}
              </th>
              <th>Role</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.ID} onDoubleClick={() => onRowDoubleClick(user)}>
                <td className="font-bold">{user.UserID}</td>
                <td>{user.FullName}</td>
                <td>{user.UserRole?.RoleName || "Normal User"}</td>
                <td>
                  <span className={`status-text ${user.IsActive ? "active" : "inactive"}`}>
                    {user.IsActive ? "● Active" : "○ Inactive"}
                  </span>
                </td>
                <td>
                  <div className="userlist-actions">
                    <button className="userlist-icon-btn" type="button" onClick={() => onView(user)} title="View Detail">
                      👁️
                    </button>
                    {canUpdate ? (
                      <button className="userlist-icon-btn" type="button" onClick={() => onEdit(user)} title="Edit User">
                        ✏️
                      </button>
                    ) : null}
                    {canDelete ? (
                      <button className="userlist-icon-btn userlist-danger" type="button" onClick={() => onDelete(user)} title="Delete User">
                        🗑️
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="no-data-cell">No users found.</td>
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
