import React from "react";
import "./UserForm.css";

export default function UserForm({
  formData,
  editingUserId,
  onChange,
  healthIssueOptions,
  onHealthIssueToggle,
  onSubmit,
  onCancel,
}) {
  return (
    <form className="user-form" onSubmit={onSubmit}>
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
      <div className="form-group health-issues-group">
        <label>Health Information</label>
        <p className="health-issues-subtitle">Select all that apply</p>
        <div className="health-issues-grid">
          {healthIssueOptions.map((issue) => (
            <label
              key={issue}
              className={`health-issue-item ${formData.healthIssues.includes(issue) ? "selected" : ""}`}
            >
              <input
                type="checkbox"
                checked={formData.healthIssues.includes(issue)}
                onChange={() => onHealthIssueToggle(issue)}
              />
              <span className="health-issue-text">{issue}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="remark">Remark</label>
        <textarea
          id="remark"
          name="remark"
          value={formData.remark}
          onChange={onChange}
          rows="3"
          maxLength="500"
          placeholder="Optional note about this user..."
        />
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
