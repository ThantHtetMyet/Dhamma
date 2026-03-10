import { useCallback, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import NavBar from "../../components/NavBar";
import ActivityList from "./components/ActivityList";
import ActivityEditPage from "./components/ActivityEditPage";
import AlertModal from "../../components/AlertModal";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function Activities() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [sortConfig, setSortConfig] = useState({ key: "StartDate", direction: "desc" });
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

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("Activity")
      .select("*, User:User!FK_Activity_User(FullName)", { count: "exact" })
      .eq("IsDeleted", false)
      .order(sortConfig.key, { ascending: sortConfig.direction === "asc" })
      .range(from, to);

    setLoading(false);
    if (error) {
      showModal("error", "Error", "Failed to fetch activities.");
      return;
    }
    setActivities(data || []);
    setTotalItems(count || 0);
  }, [sortConfig, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig]);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from("User")
      .select("ID, UserID, FullName")
      .eq("IsDeleted", false);
    if (!error) setUsers(data || []);
  }, []);

  useEffect(() => {
    fetchActivities();
    fetchUsers();
  }, [fetchActivities, fetchUsers]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDelete = async (activity) => {
    if (!window.confirm(`Are you sure you want to delete "${activity.Name}"?`)) return;

    setLoading(true);
    const { error } = await supabase
      .from("Activity")
      .update({ IsDeleted: true })
      .eq("ID", activity.ID);
    setLoading(false);

    if (error) {
      showModal("error", "Error", "Failed to delete activity.");
    } else {
      showModal("success", "Deleted", "Activity deleted successfully.");
      fetchActivities();
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

  const isAdmin = currentUser?.UserRole?.RoleName === "Admin" || currentUser?.UserRoleID === 2;

  return (
    <div className="activities-page">
      <NavBar userName={currentUser?.FullName || currentUser?.UserID} onSignOut={signOut} activeMenu="Activity" />
      
      <div className="activities-content" style={{ padding: '40px 24px' }}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <ActivityList
                  activities={activities}
                  loading={loading}
                  canUpdate={isAdmin}
                  canDelete={isAdmin}
                  onView={(act) => navigate(`/activity/${act.ID}`)}
                  onEdit={(act) => navigate(`/activity/${act.ID}`)} // This will default to view mode first, user can click edit pencil
                  onDelete={handleDelete}
                  onAdd={isAdmin ? () => navigate("/activity/new") : null}
                  onRowDoubleClick={(act) => navigate(`/activity/${act.ID}`)} // Goes to Details (view mode)
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
            path=":activityId/*"
            element={
              <ActivityEditPage
                canUpdate={isAdmin}
                canDelete={isAdmin}
                currentUser={currentUser}
                users={users}
                fetchActivities={fetchActivities}
                showModal={showModal}
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
