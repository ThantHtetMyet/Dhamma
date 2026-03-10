import { useState } from "react";
import UserEditPage from "../Users/components/UserEditPage";
import AlertModal from "../../components/AlertModal";

export default function PublicUserPage() {
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

  return (
    <>
      <UserEditPage
        canUpdate={true}
        canDelete={true}
        currentUser={null}
        fetchUsers={() => {}}
        showModal={showModal}
        showConfirmModal={showConfirmModal}
        basePath="/public-users"
      />
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
    </>
  );
}
