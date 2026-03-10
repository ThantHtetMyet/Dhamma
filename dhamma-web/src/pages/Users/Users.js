import { useCallback, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
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

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    setCurrentUser(storedUser);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("User")
      .select("*, UserRole:UserRole!FK_User_UserRole(RoleName)", { count: "exact" })
      .eq("IsDeleted", false)
      .order(sortConfig.key, { ascending: sortConfig.direction === "asc" })
      .range(from, to);

    setLoading(false);
    if (error) {
      showModal("error", "Error", "Failed to fetch users.");
      return;
    }
    setUsers(data || []);
    setTotalItems(count || 0);
  }, [sortConfig, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig]);

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
    if (!window.confirm(`Are you sure you want to delete "${user.FullName}"?`)) return;

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
  };

  const showModal = (type, title, message) => {
    setModalConfig({ isOpen: true, type, title, message });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const signOut = () => {
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const isAdmin = currentUser?.UserRole?.RoleName === "Admin" || currentUser?.UserRoleID === 2; // Adjust ID based on DB

  return (
    <div className="users-page">
      <NavBar userName={currentUser?.FullName || currentUser?.UserID} onSignOut={signOut} activeMenu="User" />
      
      <div className="users-content" style={{ padding: '40px 24px' }}>
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
      />
      {loading ? <LoadingOverlay /> : null}
    </div>
  );
}
