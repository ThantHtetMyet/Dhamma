import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../services/supabase";
import ActivityForm from "./ActivityForm";
import ActivityDetail from "./ActivityDetail";
import LoadingOverlay from "../../../components/LoadingOverlay";
import "./ActivityEditPage.css";

const emptyForm = {
  name: "",
  userID: "",
  startDate: "",
  endDate: "",
  remark: "",
};

export default function ActivityEditPage({
  users,
  fetchActivities,
  showModal,
}) {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [mode, setMode] = useState("view"); // "view" or "edit"

  useEffect(() => {
    if (activityId === "new") {
      setMode("edit");
    } else {
      setMode("view");
    }
  }, [activityId]);

  // Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm) in local time
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const fetchActivity = useCallback(async () => {
    if (activityId === "new") {
      setActivity({});
      setFormData(emptyForm);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("Activity")
      .select("*, User:User!FK_Activity_User(FullName)")
      .eq("ID", activityId)
      .eq("IsDeleted", false)
      .single();
    setLoading(false);

    if (error) {
      showModal("error", "Load Failed", error.message || "Unable to load activity.");
      return;
    }

    setActivity(data);
    if (data) {
      setFormData({
        name: data.Name || "",
        userID: data.UserID || "",
        startDate: formatDateForInput(data.StartDate),
        endDate: formatDateForInput(data.EndDate),
        remark: data.Remark || "",
      });
    }
  }, [activityId, showModal]);

  useEffect(() => {
    if (activityId) {
      fetchActivity();
    }
  }, [activityId, fetchActivity]);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();

    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const now = new Date().toISOString();

    const payload = {
      Name: formData.name.trim(),
      UserID: formData.userID,
      StartDate: new Date(formData.startDate).toISOString(),
      EndDate: new Date(formData.endDate).toISOString(),
      Remark: formData.remark.trim(),
      UpdatedDate: now,
      UpdatedBy: storedUser?.ID || null,
    };

    if (activityId === "new") {
      payload.CreatedBy = storedUser?.ID || null;
      payload.CreatedDate = now;
      payload.IsDeleted = false;

      const { error } = await supabase.from("Activity").insert([payload]);
      if (error) {
        showModal("error", "Create Failed", error.message);
        return;
      }
      showModal("success", "Created", "Activity created successfully.");
    } else {
      const { error } = await supabase.from("Activity").update(payload).eq("ID", activityId);
      if (error) {
        showModal("error", "Update Failed", error.message);
        return;
      }
      showModal("success", "Updated", "Activity updated successfully.");
    }

    fetchActivities();
    if (activityId === "new") {
      navigate("/activity");
    } else {
      setMode("view");
      fetchActivity();
    }
  }

  if (loading) return <LoadingOverlay />;
  if (!activity && activityId !== "new") return <div className="activity-card-wrapper p-4 text-center">Activity not found.</div>;

  return (
    <div className="activity-edit-page-container">
      <div className="activity-card-wrapper">
        {mode === "view" && activityId !== "new" ? (
          <ActivityDetail
            activity={activity}
            onEdit={() => setMode("edit")}
            onBack={() => navigate("/activity")}
          />
        ) : (
          <>
            <div className="activity-header">
              <div className="activity-title-group">
                <button className="activity-back-btn" onClick={() => activityId === "new" ? navigate("/activity") : setMode("view")} title="Back">
                  ←
                </button>
                <h3>{activityId === "new" ? "New Activity" : "Edit Activity"}</h3>
              </div>
            </div>
            <ActivityForm
              formData={formData}
              users={users}
              editingActivityId={activityId === "new" ? null : activityId}
              onChange={handleInputChange}
              onSubmit={handleSave}
              onCancel={() => activityId === "new" ? navigate("/activity") : setMode("view")}
            />
          </>
        )}
      </div>
    </div>
  );
}
