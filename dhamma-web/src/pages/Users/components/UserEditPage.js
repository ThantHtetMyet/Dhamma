import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import AlertModal from "../../../components/AlertModal";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { supabase } from "../../../services/supabase";
import UserEdit from "./UserEdit";
import UserForm from "./UserForm";
import UserActivities from "./UserActivities";
import "./UserEditPage.css";

const emptyForm = {
  userID: "",
  fullName: "",
  email: "",
  mobileNo: "",
  loginPassword: "",
  roleId: "1", // Default to Normal role
  isActive: true,
};

export default function UserEditPage({
  canUpdate,
  canDelete,
  currentUser,
  fetchUsers,
  showModal,
}) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [mode, setMode] = useState("view");

  useEffect(() => {
    if (location.pathname.endsWith("/edit") || userId === "new") {
      setMode("edit");
    } else {
      setMode("view");
    }
  }, [location.pathname, userId]);

  const [isFlipped, setIsFlipped] = useState(false);
  const [roles, setRoles] = useState([]);
  const [actCurrentPage, setActCurrentPage] = useState(1);
  const [actPageSize, setActPageSize] = useState(5); // Smaller page size for the flip card
  const [actTotalItems, setActTotalItems] = useState(0);

  const fetchRoles = useCallback(async () => {
    const { data, error } = await supabase
      .from("UserRole")
      .select("*")
      .order("RoleName");
    if (!error) {
      setRoles(data || []);
    }
  }, []);

  const fetchUserActivities = useCallback(async () => {
    if (userId === "new") return;
    
    const from = (actCurrentPage - 1) * actPageSize;
    const to = from + actPageSize - 1;

    const { data, error, count } = await supabase
      .from("Activity")
      .select("*", { count: "exact" })
      .eq("UserID", userId)
      .eq("IsDeleted", false)
      .order("StartDate", { ascending: false })
      .range(from, to);
    if (!error) {
      setActivities(data || []);
      setActTotalItems(count || 0);
    }
  }, [userId, actCurrentPage, actPageSize]);

  useEffect(() => {
    setActCurrentPage(1);
  }, [userId]);

  const fetchUser = useCallback(async () => {
    if (userId === "new") {
      setUser({ FullName: "New User" }); // Placeholder for the header box
      setFormData(emptyForm);
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("User")
      .select("*, UserRole:UserRole!FK_User_UserRole(RoleName)")
      .eq("ID", userId)
      .eq("IsDeleted", false)
      .single();
    
    if (error) {
      setLoading(false);
      showModal("error", "Load Failed", error.message || "Unable to load user.");
      return;
    }
    
    setUser(data);
    
    // Initialize form data if in edit mode
    if (data) {
      setFormData({
        userID: data.UserID || "",
        fullName: data.FullName || "",
        email: data.Email || "",
        mobileNo: data.MobileNo || "",
        loginPassword: "",
        roleId: data.UserRoleID || "1",
        isActive: Boolean(data.IsActive),
      });
    }

    await fetchUserActivities();
    setLoading(false);
  }, [userId, showModal, fetchUserActivities]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId, fetchUser]);

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!canUpdate) return;

    const payload = {
      userID: formData.userID.trim(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      mobileNo: formData.mobileNo.trim(),
      loginPassword: formData.loginPassword,
      roleId: formData.roleId,
      isActive: formData.isActive,
    };

    if (!payload.userID || payload.userID.length < 3) {
      showModal("error", "Validation Error", "UserID must be at least 3 characters long.");
      return;
    }
    if (!payload.fullName || payload.fullName.length < 3) {
      showModal("error", "Validation Error", "Full Name must be at least 3 characters long.");
      return;
    }
    if (!payload.email) {
      showModal("error", "Validation Error", "Email is required.");
      return;
    }
    if (!payload.mobileNo) {
      showModal("error", "Validation Error", "Mobile No is required.");
      return;
    }
    if (!payload.roleId) {
      showModal("error", "Validation Error", "Role is required.");
      return;
    }
    if (payload.loginPassword && payload.loginPassword.length < 6) {
      showModal("error", "Validation Error", "Password must be at least 6 characters long.");
      return;
    }

    // Check if UserID is already taken by another user
    if (payload.userID !== user.UserID) {
      setLoading(true);
      const { data: existingUser, error: checkError } = await supabase
        .from("User")
        .select("ID")
        .eq("UserID", payload.userID)
        .eq("IsDeleted", false)
        .maybeSingle();
      setLoading(false);

      if (checkError) {
        showModal("error", "Check Failed", "Unable to verify UserID uniqueness.");
        return;
      }

      if (existingUser) {
        showModal("error", "Duplicate UserID", `The UserID "${payload.userID}" is already taken by another user.`);
        return;
      }
    }

    const now = new Date().toISOString();
    const saveObj = {
      UserRoleID: payload.roleId,
      UserID: payload.userID,
      FullName: payload.fullName,
      Email: payload.email,
      MobileNo: payload.mobileNo,
      IsActive: payload.isActive,
      UpdatedDate: now,
      UpdatedBy: currentUser?.ID || null,
    };

    if (payload.loginPassword) {
      saveObj.LoginPassword = payload.loginPassword;
    }

    let response;
    if (userId === "new") {
      saveObj.CreatedDate = now;
      saveObj.CreatedBy = currentUser?.ID || null;
      saveObj.LastLogin = now; // Initialize with current time for non-null constraint
      saveObj.IsDeleted = false;
      response = await supabase.from("User").insert([saveObj]).select();
    } else {
      response = await supabase.from("User").update(saveObj).eq("ID", userId).select();
    }

    if (response.error) {
      showModal("error", "Save Failed", response.error.message || "Unable to save user.");
      return;
    }

    const savedId = response.data?.[0]?.ID || userId;

    fetchUsers();
    showModal("success", "Save Successful", `User ${userId === "new" ? "created" : "updated"} successfully.`);
    navigate(`/users/${savedId}`);
  }

  async function handleDeleteUser(userToDelete) {
    if (!canDelete) return;
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("User")
      .update({ IsDeleted: true, UpdatedDate: now, UpdatedBy: currentUser?.ID || null })
      .eq("ID", userToDelete.ID);
    if (error) {
      showModal("error", "Delete Failed", error.message || "Unable to delete user.");
      return;
    }
    fetchUsers();
    showModal("success", "Delete Successful", "User deleted successfully.");
    navigate("/users", { replace: true });
  }

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div className="user-detail-page-container">
      {mode === "view" ? (
        <div className={`user-detail-flip-wrapper ${isFlipped ? 'flipped' : ''}`}>
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <UserEdit
                user={user}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onEdit={() => navigate(`/users/${userId}/edit`)}
                onToggleActivities={() => setIsFlipped(true)}
                onDelete={handleDeleteUser}
                onBack={() => navigate("/users")}
              />
            </div>
            <div className="flip-card-back">
              <UserActivities 
                activities={activities} 
                onBackToProfile={() => setIsFlipped(false)}
                onViewActivity={(act) => navigate(`/activity/${act.ID}`)}
                currentPage={actCurrentPage}
                totalItems={actTotalItems}
                pageSize={actPageSize}
                onPageChange={setActCurrentPage}
                onPageSizeChange={setActPageSize}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="user-edit-form-container">
          <div className="useredit-header">
             <div className="useredit-title-group">
                <button className="useredit-back-btn" onClick={() => navigate(`/users/${userId}`)} title="Back to details">
                  ←
                </button>
                <h3>{userId === "new" ? "New User" : "Edit User"}</h3>
              </div>
          </div>
          <UserForm
            formData={formData}
            roles={roles}
            editingUserId={userId === "new" ? null : userId}
            onChange={handleInputChange}
            onSubmit={handleSave}
            onCancel={() => navigate(`/users/${userId}`)}
          />
        </div>
      )}
    </div>
  );
}