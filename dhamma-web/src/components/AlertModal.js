import ReactDOM from "react-dom";
import "./AlertModal.css";

export default function AlertModal({
  isOpen,
  type = "info",
  title,
  message,
  onClose,
  onConfirm,
  actionText,
  onAction,
  cancelText,
  onCancel,
  showConfirm = true,
  confirmText = "Confirm",
}) {
  if (!isOpen) return null;

  let icon = "ℹ️";
  if (type === "error") icon = "❌";
  if (type === "warning") icon = "⚠️";
  if (type === "success") icon = "✅";

  const confirmHandler = onConfirm || onClose;

  return ReactDOM.createPortal(
    <div className="alert-modal-overlay">
      <div className={`alert-modal-content alert-type-${type}`}>
        <div className="alert-modal-header">
          <div className="alert-modal-title">
            <span className="alert-icon">{icon}</span>
            <h2>{title}</h2>
          </div>
          <button className="alert-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="alert-modal-body">
          {typeof message === "string" || typeof message === "number" ? <p>{message}</p> : message}
        </div>
        <div className="alert-modal-footer">
          {actionText ? (
            <button className="alert-btn alert-btn-action" onClick={onAction}>
              {actionText}
            </button>
          ) : null}
          {cancelText ? (
            <button className="alert-btn alert-btn-cancel" onClick={onCancel}>
              {cancelText}
            </button>
          ) : null}
          {showConfirm ? (
            <button className={`alert-btn alert-btn-${type}`} onClick={confirmHandler}>
              {confirmText}
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
