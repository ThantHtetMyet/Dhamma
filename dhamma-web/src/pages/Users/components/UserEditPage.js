import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import LoadingOverlay from "../../../components/LoadingOverlay";
import QRCode from "qrcode";
import { supabase } from "../../../services/supabase";
import UserEdit from "./UserEdit";
import UserForm from "./UserForm";
import UserActivities from "./UserActivities";
import "./UserEditPage.css";

const emptyForm = {
  fullName: "",
  mobileNo: "",
  healthIssues: [],
  remark: "",
};

const emptyActivityForm = {
  id: null,
  name: "",
  startDate: "",
  endDate: "",
  remark: "",
};

const healthIssueOptions = [
  "ဆီးချို",
  "သွေးတိုး",
  "နှလုံးရောဂါ",
  "ပန်းနာရင်ကျပ်",
  "ကျောက်ကပ်ရောဂါ",
  "Allergy",
  "အဆစ်အမြစ်ရောင်",
];

export default function UserEditPage({
  canUpdate,
  canDelete,
  currentUser,
  fetchUsers,
  showModal,
  showConfirmModal,
  basePath = "/users",
}) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [mode, setMode] = useState("view");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [qrTargetUrl, setQrTargetUrl] = useState("");

  useEffect(() => {
    if (location.pathname.endsWith("/edit") || userId === "new") {
      setMode("edit");
    } else {
      setMode("view");
    }
  }, [location.pathname, userId]);

  const [actCurrentPage, setActCurrentPage] = useState(1);
  const [actPageSize, setActPageSize] = useState(5);
  const [actTotalItems, setActTotalItems] = useState(0);
  const [activityFormMode, setActivityFormMode] = useState("none");
  const [activityFormData, setActivityFormData] = useState(emptyActivityForm);
  const isPublicMode = basePath === "/public-users";
  const [isPatternLockModalOpen, setIsPatternLockModalOpen] = useState(false);
  const [patternLockTitle, setPatternLockTitle] = useState("");
  const [patternSequence, setPatternSequence] = useState([]);
  const [patternError, setPatternError] = useState("");
  const [isPatternInvalid, setIsPatternInvalid] = useState(false);
  const [isPatternShaking, setIsPatternShaking] = useState(false);
  const [isPatternChecking, setIsPatternChecking] = useState(false);
  const patternResolverRef = useRef(null);
  const patternResetTimerRef = useRef(null);

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
      setUser({ FullName: "New User" });
      setFormData(emptyForm);
      setActivities([]);
      setActivityFormMode("none");
      setActivityFormData(emptyActivityForm);
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
        fullName: data.FullName || "",
        mobileNo: data.MobileNo || "",
        healthIssues: Array.isArray(data.HealthIssues) ? data.HealthIssues : [],
        remark: data.Remark || "",
      });
    }

    await fetchUserActivities();
    setLoading(false);
  }, [userId, showModal, fetchUserActivities]);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId, fetchUser]);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleHealthIssueToggle(issue) {
    setFormData((prev) => ({
      ...prev,
      healthIssues: prev.healthIssues.includes(issue)
        ? prev.healthIssues.filter((item) => item !== issue)
        : [...prev.healthIssues, issue],
    }));
  }

  function handleActivityFormChange(e) {
    const { name, value } = e.target;
    setActivityFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleCreateActivity() {
    if (!canUpdate) return;
    setActivityFormMode("create");
    setActivityFormData({
      ...emptyActivityForm,
      startDate: formatDateForInput(new Date()),
      endDate: formatDateForInput(new Date()),
    });
  }

  function handleEditActivity(activity) {
    if (!canUpdate) return;
    setActivityFormMode("edit");
    setActivityFormData({
      id: activity.ID,
      name: activity.Name || "",
      startDate: formatDateForInput(activity.StartDate),
      endDate: formatDateForInput(activity.EndDate),
      remark: activity.Remark || "",
    });
  }

  function handleCancelActivityForm() {
    setActivityFormMode("none");
    setActivityFormData(emptyActivityForm);
  }

  function openPatternLockModal() {
    setPatternLockTitle("Pattern Lock");
    setPatternSequence([]);
    setPatternError("");
    setIsPatternInvalid(false);
    setIsPatternShaking(false);
    setIsPatternChecking(false);
    setIsPatternLockModalOpen(true);
    return new Promise((resolve) => {
      patternResolverRef.current = resolve;
    });
  }

  function closePatternLockModalWithResult(result) {
    if (patternResetTimerRef.current) {
      clearTimeout(patternResetTimerRef.current);
      patternResetTimerRef.current = null;
    }
    if (patternResolverRef.current) {
      patternResolverRef.current(result);
      patternResolverRef.current = null;
    }
    setIsPatternLockModalOpen(false);
    setPatternSequence([]);
    setPatternError("");
    setIsPatternInvalid(false);
    setIsPatternShaking(false);
    setIsPatternChecking(false);
  }

  async function checkAdminPatternLock(patternValue) {
    const { data: adminRoles, error: roleError } = await supabase
      .from("UserRole")
      .select("ID")
      .eq("RoleName", "Admin")
      .eq("IsDeleted", false);

    if (roleError || !adminRoles?.length) {
      return { valid: false, systemError: true, message: roleError?.message || "Admin role was not found." };
    }

    const adminRoleIds = adminRoles.map((role) => role.ID);
    const { data: adminUser, error: userError } = await supabase
      .from("User")
      .select("ID")
      .in("UserRoleID", adminRoleIds)
      .eq("PatternLock", patternValue)
      .eq("IsDeleted", false)
      .eq("IsActive", true)
      .limit(1)
      .maybeSingle();

    if (userError) {
      return { valid: false, systemError: true, message: userError.message || "Unable to verify pattern lock." };
    }

    if (!adminUser) {
      return { valid: false, systemError: false, message: "Wrong password" };
    }

    return { valid: true, systemError: false, message: "" };
  }

  async function handlePatternNodeClick(nodeNumber) {
    if (isPatternChecking) return;

    const currentPattern = patternSequence;
    let nextPattern = currentPattern;
    if (currentPattern.includes(nodeNumber)) {
      nextPattern = [nodeNumber];
    } else if (currentPattern.length < 4) {
      nextPattern = [...currentPattern, nodeNumber];
    }
    setPatternSequence(nextPattern);
    setPatternError("");

    if (nextPattern.length === 4) {
      setIsPatternChecking(true);
      const verifyResult = await checkAdminPatternLock(nextPattern.join(""));
      setIsPatternChecking(false);

      if (verifyResult.valid) {
        closePatternLockModalWithResult(true);
        return;
      }

      if (verifyResult.systemError) {
        closePatternLockModalWithResult(false);
        showModal("error", "Pattern Lock Check Failed", verifyResult.message);
        return;
      }

      setPatternError("Wrong password");
      setIsPatternInvalid(true);
      setIsPatternShaking(true);
      if (patternResetTimerRef.current) {
        clearTimeout(patternResetTimerRef.current);
      }
      patternResetTimerRef.current = setTimeout(() => {
        setPatternSequence([]);
        setPatternError("");
        setIsPatternInvalid(false);
        setIsPatternShaking(false);
        patternResetTimerRef.current = null;
      }, 3000);
    }
  }

  function handlePatternClear() {
    setPatternSequence([]);
    setPatternError("");
  }

  function handlePatternCancel() {
    closePatternLockModalWithResult(null);
  }

  async function verifyPatternLockForPublicEdit(actionLabel) {
    if (!isPublicMode) return true;

    const enteredPattern = await openPatternLockModal();
    return Boolean(enteredPattern);
  }

  async function handleSaveActivity(e) {
    e.preventDefault();
    if (!canUpdate) return;
    if (!activityFormData.name.trim()) {
      showModal("error", "Validation Error", "Activity name is required.");
      return;
    }
    if (!activityFormData.startDate || !activityFormData.endDate) {
      showModal("error", "Validation Error", "Start date and end date are required.");
      return;
    }

    const start = new Date(activityFormData.startDate);
    const end = new Date(activityFormData.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      showModal("error", "Validation Error", "Please provide valid start and end dates.");
      return;
    }
    if (end < start) {
      showModal("error", "Validation Error", "End date must be later than start date.");
      return;
    }

    const hasAccess = await verifyPatternLockForPublicEdit(activityFormMode === "create" ? "save activity" : "update activity");
    if (!hasAccess) return;

    const now = new Date().toISOString();
    const payload = {
      Name: activityFormData.name.trim(),
      UserID: userId,
      StartDate: start.toISOString(),
      EndDate: end.toISOString(),
      Remark: activityFormData.remark.trim() || null,
      UpdatedDate: now,
      UpdatedBy: currentUser?.ID || null,
    };

    if (activityFormMode === "create") {
      payload.CreatedDate = now;
      payload.CreatedBy = currentUser?.ID || null;
      payload.IsDeleted = false;
      const { error } = await supabase.from("Activity").insert([payload]);
      if (error) {
        showModal("error", "Create Failed", error.message || "Unable to create activity.");
        return;
      }
      showModal("success", "Created", "Activity created successfully.");
    } else {
      const { error } = await supabase
        .from("Activity")
        .update(payload)
        .eq("ID", activityFormData.id)
        .eq("UserID", userId)
        .eq("IsDeleted", false);
      if (error) {
        showModal("error", "Update Failed", error.message || "Unable to update activity.");
        return;
      }
      showModal("success", "Updated", "Activity updated successfully.");
    }

    handleCancelActivityForm();
    await fetchUserActivities();
  }

  async function handleDeleteActivity(activity) {
    if (!canDelete) return;
    showConfirmModal({
      title: "Confirm Delete",
      message: `Are you sure you want to delete activity "${activity.Name}"?`,
      confirmText: "Delete",
      onConfirm: async () => {
        const hasAccess = await verifyPatternLockForPublicEdit("delete activity");
        if (!hasAccess) return;
        const now = new Date().toISOString();
        const { error } = await supabase
          .from("Activity")
          .update({ IsDeleted: true, UpdatedDate: now, UpdatedBy: currentUser?.ID || null })
          .eq("ID", activity.ID)
          .eq("UserID", userId);
        if (error) {
          showModal("error", "Delete Failed", error.message || "Unable to delete activity.");
          return;
        }
        showModal("success", "Deleted", "Activity deleted successfully.");
        await fetchUserActivities();
      },
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!canUpdate) return;

    const payload = {
      fullName: formData.fullName.trim(),
      mobileNo: formData.mobileNo.trim(),
      healthIssues: formData.healthIssues,
      remark: formData.remark.trim(),
    };

    if (!payload.fullName || payload.fullName.length < 3) {
      showModal("error", "Validation Error", "Full Name must be at least 3 characters long.");
      return;
    }
    if (!payload.mobileNo) {
      showModal("error", "Validation Error", "Mobile No is required.");
      return;
    }
    const phonePattern = /^[0-9+()\s-]{7,20}$/;
    if (!phonePattern.test(payload.mobileNo)) {
      showModal("error", "Validation Error", "Please enter a valid mobile number.");
      return;
    }

    if (payload.mobileNo !== user.MobileNo) {
      setLoading(true);
      const { data: existingUser, error: checkError } = await supabase
        .from("User")
        .select("ID")
        .eq("MobileNo", payload.mobileNo)
        .eq("IsDeleted", false)
        .maybeSingle();
      setLoading(false);

      if (checkError) {
        showModal("error", "Check Failed", "Unable to verify mobile number uniqueness.");
        return;
      }

      if (existingUser && existingUser.ID !== userId) {
        showModal("error", "Duplicate Mobile No", `The mobile number "${payload.mobileNo}" is already used by another user.`);
        return;
      }
    }

    if (userId !== "new") {
      const hasAccess = await verifyPatternLockForPublicEdit("update user profile");
      if (!hasAccess) return;
    }

    const now = new Date().toISOString();
    const saveObj = {
      FullName: payload.fullName,
      MobileNo: payload.mobileNo,
      HealthIssues: payload.healthIssues,
      Remark: payload.remark || null,
      UpdatedDate: now,
      UpdatedBy: currentUser?.ID || null,
    };

    let response;
    if (userId === "new") {
      const { data: defaultRole, error: roleError } = await supabase
        .from("UserRole")
        .select("ID, RoleName")
        .in("RoleName", ["user", "Normal"])
        .eq("IsDeleted", false);

      if (roleError) {
        showModal("error", "Save Failed", roleError.message || "Unable to load default role.");
        return;
      }
      const preferredRole =
        defaultRole?.find((role) => role.RoleName?.toLowerCase() === "user") ||
        defaultRole?.find((role) => role.RoleName?.toLowerCase() === "normal");
      if (!preferredRole?.ID) {
        showModal("error", "Save Failed", 'Default role "user" was not found.');
        return;
      }

      saveObj.UserRoleID = preferredRole.ID;
      saveObj.LoginPassword = "P@ssw0rd";
      saveObj.IsActive = true;
      saveObj.CreatedDate = now;
      saveObj.CreatedBy = currentUser?.ID || null;
      saveObj.LastLogin = now; // Initialize with current time for non-null constraint
      saveObj.IsDeleted = false;
      saveObj.PatternLock = null;
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
    navigate(`${basePath}/${savedId}`);
  }

  async function handleDeleteUser(userToDelete) {
    if (!canDelete) return;
    showConfirmModal({
      title: "Confirm Delete",
      message: `Are you sure you want to delete "${userToDelete.FullName}"?`,
      confirmText: "Delete",
      onConfirm: async () => {
        const hasAccess = await verifyPatternLockForPublicEdit("delete user profile");
        if (!hasAccess) return;
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
        navigate(basePath, { replace: true });
      },
    });
  }

  async function handleGenerateUserQr(userData) {
    if (!userData?.ID) return;
    setLoading(true);
    setIsQrModalOpen(false);
    const profileUrl = getPublicProfileUrl(userData.ID);
    try {
      const qrDataUrl = await QRCode.toDataURL(profileUrl, {
        width: 220,
        margin: 2,
        color: {
          dark: "#5d4037",
          light: "#ffffff",
        },
      });
      setQrImageUrl(qrDataUrl);
      setQrTargetUrl(profileUrl);
      setIsQrModalOpen(true);
    } catch {
      showModal("error", "QR Generate Failed", "Could not generate QR code.");
    }
    setLoading(false);
  }

  function getQrFileName() {
    const source = (user?.FullName || user?.MobileNo || "user-qr").trim();
    const safeName = source.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    return `${safeName || "user-qr"}.png`;
  }

  function getWhatsappShareUrl() {
    const shareText = `User profile: ${qrTargetUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  }

  function getPublicProfileUrl(userId) {
    const rawPublicUrl = (process.env.PUBLIC_URL || "").trim().replace(/\/+$/, "");
    const appBaseUrl = rawPublicUrl
      ? /^https?:\/\//i.test(rawPublicUrl)
        ? rawPublicUrl
        : `${window.location.origin}${rawPublicUrl.startsWith("/") ? rawPublicUrl : `/${rawPublicUrl}`}`
      : `${window.location.origin}${window.location.pathname.replace(/\/+$/, "")}`;
    return `${appBaseUrl}/#/public-users/${encodeURIComponent(userId)}`;
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
        <div className="user-detail-view-wrapper">
          <UserEdit
            user={user}
            canUpdate={canUpdate}
            canDelete={canDelete}
            canGenerateQr={userId !== "new"}
            onEdit={() => navigate(`${basePath}/${userId}/edit`)}
            onDelete={handleDeleteUser}
            onBack={() => navigate(basePath)}
            onGenerateQr={handleGenerateUserQr}
          />
          <UserActivities
            activities={activities}
            canUpdate={canUpdate}
            canDelete={canDelete}
            activityFormMode={activityFormMode}
            activityFormData={activityFormData}
            onActivityFormChange={handleActivityFormChange}
            onCreateActivity={handleCreateActivity}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            onSaveActivity={handleSaveActivity}
            onCancelActivityForm={handleCancelActivityForm}
            currentPage={actCurrentPage}
            totalItems={actTotalItems}
            pageSize={actPageSize}
            onPageChange={setActCurrentPage}
            onPageSizeChange={setActPageSize}
          />
        </div>
      ) : (
        <div className="user-edit-form-container">
          <div className="useredit-header">
             <div className="useredit-title-group">
                <button
                  className="useredit-back-btn"
                  onClick={() => navigate(userId === "new" ? basePath : `${basePath}/${userId}`)}
                  title="Back to details"
                >
                  ←
                </button>
                <h3>{userId === "new" ? "New User" : "Edit User"}</h3>
              </div>
          </div>
          <UserForm
            formData={formData}
            editingUserId={userId === "new" ? null : userId}
            onChange={handleInputChange}
            healthIssueOptions={healthIssueOptions}
            onHealthIssueToggle={handleHealthIssueToggle}
            onSubmit={handleSave}
            onCancel={() => navigate(userId === "new" ? basePath : `${basePath}/${userId}`)}
          />
        </div>
      )}
      {isQrModalOpen ? (
        <div className="user-qr-modal-backdrop" onClick={() => setIsQrModalOpen(false)}>
          <div className="user-qr-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="user-qr-modal-close" aria-label="Close QR modal" onClick={() => setIsQrModalOpen(false)}>
              ×
            </button>
            <h5 className="user-qr-modal-title">User QR</h5>
            <div className="user-qr-content">
              <img src={qrImageUrl} alt="User Profile QR" className="user-qr-image" />
              <p className="user-qr-user">{user?.FullName || user?.MobileNo || ""}</p>
              <div className="user-qr-actions">
                <a className="user-qr-save-btn" href={qrImageUrl} download={getQrFileName()} aria-label="Download QR" title="Download QR">
                  <svg viewBox="0 0 24 24" className="user-qr-save-icon" aria-hidden="true">
                    <path
                      d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.29a1 1 0 1 1 1.4 1.41l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.41L11 12.59V4a1 1 0 0 1 1-1Zm-7 13a1 1 0 0 1 1 1v2h12v-2a1 1 0 1 1 2 0v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
                <a
                  className="user-qr-whatsapp-btn"
                  href={getWhatsappShareUrl()}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share profile via WhatsApp"
                  title="Share via WhatsApp"
                >
                  <svg viewBox="0 0 32 32" className="user-qr-whatsapp-icon" aria-hidden="true">
                    <path
                      d="M16.08 4.5c-6.34 0-11.48 5.08-11.48 11.35 0 2.03.54 4 1.56 5.73L4.5 27.5l6.09-1.61a11.5 11.5 0 0 0 5.49 1.39c6.34 0 11.48-5.08 11.48-11.35S22.42 4.5 16.08 4.5Zm0 20.83c-1.77 0-3.5-.47-5.02-1.35l-.36-.21-3.61.95.97-3.5-.23-.36a9.77 9.77 0 0 1-1.53-5.23c0-5.39 4.42-9.77 9.86-9.77S25.94 10.24 25.94 15.63s-4.42 9.7-9.86 9.7Zm5.41-7.27c-.3-.15-1.78-.87-2.05-.97-.27-.1-.47-.15-.67.15s-.77.97-.95 1.17c-.17.2-.35.22-.65.07-.3-.15-1.27-.46-2.42-1.47-.9-.79-1.5-1.76-1.67-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.52 0 1.5 1.07 2.93 1.22 3.14.15.2 2.1 3.35 5.19 4.56.74.32 1.32.5 1.77.64.74.24 1.42.2 1.95.12.6-.1 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.12-.27-.2-.57-.35Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </div>
              <a className="user-qr-profile-link" href={qrTargetUrl} target="_blank" rel="noreferrer">
                Open Profile Link
              </a>
            </div>
          </div>
        </div>
      ) : null}
      {isPatternLockModalOpen ? (
        <div className="user-pattern-modal-backdrop" onClick={handlePatternCancel}>
          <div className={`user-pattern-modal ${isPatternInvalid ? "invalid" : ""} ${isPatternShaking ? "shake" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="user-pattern-modal-header">
              <h5 className="user-pattern-modal-title">{patternLockTitle}</h5>
              <div className="user-pattern-icon-actions">
                <button type="button" className="user-pattern-icon-btn" onClick={handlePatternClear} aria-label="Clear pattern" title="Clear pattern">
                  ↺
                </button>
                <button type="button" className="user-pattern-icon-btn" onClick={handlePatternCancel} aria-label="Close pattern lock" title="Close">
                  ×
                </button>
              </div>
            </div>
            <p className="user-pattern-modal-subtitle">Tap 4 points</p>
            <div className="user-pattern-grid" role="group" aria-label="Pattern lock grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((node) => (
                <button
                  key={node}
                  type="button"
                  className={`user-pattern-node ${patternSequence.includes(node) ? "active" : ""}`}
                  onClick={() => handlePatternNodeClick(node)}
                  disabled={isPatternChecking}
                >
                  {node}
                </button>
              ))}
            </div>
            <p className="user-pattern-preview">{patternSequence.length === 4 ? patternSequence.join(" → ") : "• • • •"}</p>
            {patternError ? <p className="user-pattern-error">{patternError}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
