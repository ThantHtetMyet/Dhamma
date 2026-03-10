import React from "react";
import "./UserForm.css";

export default function UserForm({
  formData,
  roles,
  editingUserId,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form className="user-form" onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="userID">User ID</label>
        <input
          type="text"
          id="userID"
          name="userID"
          value={formData.userID}
          onChange={onChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="fullName">Full Name</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={onChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="mobileNo">Mobile No</label>
        <input
          type="text"
          id="mobileNo"
          name="mobileNo"
          value={formData.mobileNo}
          onChange={onChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="loginPassword">Password</label>
        <input
          type="password"
          id="loginPassword"
          name="loginPassword"
          value={formData.loginPassword}
          onChange={onChange}
          required={!editingUserId}
        />
        {editingUserId && (
          <p className="password-hint">Leave blank to keep current password</p>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="roleId">Role</label>
        <select
          id="roleId"
          name="roleId"
          value={formData.roleId}
          onChange={onChange}
          required
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.ID} value={role.ID}>
              {role.RoleName}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group checkbox-group">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={onChange}
        />
        <label htmlFor="isActive">Is Active</label>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {editingUserId ? "Update" : "Create"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
