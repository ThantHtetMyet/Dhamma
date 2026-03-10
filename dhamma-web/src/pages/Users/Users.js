import { useCallback, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { clearToken } from "../../services/auth";
import NavBar from "../../components/NavBar";
import UserList from "./components/UserList";
import UserEditPage from "./components/UserEditPage";
import AlertModal from "../../components/AlertModal";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [sortConfig, setSortConfig] = useState({ key: "FullName", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
    actionText: "",
    onAction: null,
    cancelText: "",
    onCancel: null,
    showConfirm: true,
    confirmText: "Confirm",
  });

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    setCurrentUser(storedUser);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;
    const queryText = searchTerm.trim();
    let query = supabase
      .from("User")
      .select("*", { count: "exact" })
      .eq("IsDeleted", false);

    if (queryText) {
      query = query.or(`FullName.ilike.%${queryText}%,MobileNo.ilike.%${queryText}%`);
    }

    const { data, error, count } = await query
      .order(sortConfig.key, { ascending: sortConfig.direction === "asc" })
      .range(from, to);

    if (error) {
      setLoading(false);
      showModal("error", "Error", "Failed to fetch users.");
      return;
    }

    const usersData = data || [];
    const userIds = usersData.map((user) => user.ID).filter(Boolean);
    let activityCountByUser = {};

    if (userIds.length > 0) {
      const { data: activityRows, error: activityError } = await supabase
        .from("Activity")
        .select("UserID")
        .eq("IsDeleted", false)
        .in("UserID", userIds);

      if (activityError) {
        setLoading(false);
        showModal("error", "Error", "Failed to fetch user activities.");
        return;
      }

      activityCountByUser = (activityRows || []).reduce((acc, row) => {
        const key = row.UserID;
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
    }

    const usersWithActivityCount = usersData.map((user) => ({
      ...user,
      ActivityCount: activityCountByUser[user.ID] || 0,
    }));

    setUsers(usersWithActivityCount);
    setTotalItems(count || 0);
    setLoading(false);
  }, [sortConfig, currentPage, pageSize, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDelete = async (user) => {
    showConfirmModal({
      title: "Confirm Delete",
      message: `Are you sure you want to delete "${user.FullName}"?`,
      confirmText: "Delete",
      onConfirm: async () => {
        setLoading(true);
        const { error } = await supabase
          .from("User")
          .update({ IsDeleted: true })
          .eq("ID", user.ID);
        setLoading(false);

        if (error) {
          showModal("error", "Error", "Failed to delete user.");
        } else {
          showModal("success", "Deleted", "User deleted successfully.");
          fetchUsers();
        }
      },
    });
  };

  const showModal = (type, title, message, extra = {}) => {
    setModalConfig({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: null,
      actionText: "",
      onAction: null,
      cancelText: "",
      onCancel: null,
      showConfirm: true,
      confirmText: "Confirm",
      ...extra,
    });
  };

  const showConfirmModal = ({
    title,
    message,
    type = "warning",
    confirmText = "Delete",
    cancelText = "Cancel",
    onConfirm,
  }) => {
    setModalConfig({
      isOpen: true,
      type,
      title,
      message,
      actionText: "",
      onAction: null,
      cancelText,
      onCancel: closeModal,
      showConfirm: true,
      confirmText,
      onConfirm: async () => {
        closeModal();
        if (onConfirm) {
          await onConfirm();
        }
      },
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({
      ...prev,
      isOpen: false,
      onConfirm: null,
      actionText: "",
      onAction: null,
      cancelText: "",
      onCancel: null,
      showConfirm: true,
      confirmText: "Confirm",
    }));
  };

  const signOut = () => {
    sessionStorage.removeItem("user");
    clearToken();
    window.location.hash = "/signin";
    window.location.reload();
  };

  const isAdmin = currentUser?.UserRole?.RoleName === "Admin";

  return (
    <div className="users-page">
      <NavBar userName={currentUser?.FullName || currentUser?.MobileNo} onSignOut={signOut} activeMenu="User" />
      
      <div
        className="users-content"
        style={{
          padding: "clamp(16px, 4vw, 40px) clamp(10px, 3vw, 24px)",
          width: "100%",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <>
                <UserList
                  users={users}
                  loading={loading}
                  canUpdate={isAdmin}
                  canDelete={isAdmin}
                  onView={(user) => navigate(`/users/${user.ID}`)}
                  onEdit={(user) => navigate(`/users/${user.ID}/edit`)}
                  onDelete={handleDelete}
                  onAdd={isAdmin ? () => navigate("/users/new") : null}
                  onRowDoubleClick={(user) => navigate(`/users/${user.ID}`)}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                  searchTerm={searchTerm}
                  onSearchTermChange={setSearchTerm}
                  currentPage={currentPage}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              </>
            }
          />
          <Route
            path=":userId/*"
            element={
              <UserEditPage
                canUpdate={isAdmin}
                canDelete={isAdmin}
                currentUser={currentUser}
                showModal={showModal}
                showConfirmModal={showConfirmModal}
                fetchUsers={fetchUsers}
              />
            }
          />
        </Routes>
      </div>

      <AlertModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        actionText={modalConfig.actionText}
        onAction={modalConfig.onAction}
        cancelText={modalConfig.cancelText}
        onCancel={modalConfig.onCancel}
        showConfirm={modalConfig.showConfirm}
        confirmText={modalConfig.confirmText}
      />
      {loading ? <LoadingOverlay /> : null}
    </div>
  );
}
