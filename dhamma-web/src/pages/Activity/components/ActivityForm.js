import React from "react";
import "./ActivityForm.css";

export default function ActivityForm({
  formData,
  users,
  editingActivityId,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form className="activity-form" onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="name">Activity Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
          required
          placeholder="Enter activity name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="userID">Assign To User</label>
        <select
          id="userID"
          name="userID"
          value={formData.userID}
          onChange={onChange}
          required
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.ID} value={user.ID}>
              {user.FullName} ({user.UserID})
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={onChange}
            required
          />
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
          placeholder="Optional remarks..."
          maxLength="200"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {editingActivityId ? "Update Activity" : "Create Activity"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
