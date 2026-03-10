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
  searchTerm,
  onSearchTermChange,
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
      <div className="userlist-filters">
        <input
          className="userlist-search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="Search username or mobile no"
        />
      </div>
      <div className="userlist-table-wrapper">
        <table className="userlist-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("FullName")} style={{ cursor: 'pointer' }}>
                Full Name {getSortIcon("FullName")}
              </th>
              <th onClick={() => handleSort("MobileNo")} style={{ cursor: 'pointer' }}>
                Mobile No {getSortIcon("MobileNo")}
              </th>
              <th>Total Activity</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.ID} onDoubleClick={() => onRowDoubleClick(user)}>
                <td>{user.FullName}</td>
                <td className="font-bold">{user.MobileNo}</td>
                <td>{user.ActivityCount || 0}</td>
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
                <td colSpan="4" className="no-data-cell">No users found.</td>
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
