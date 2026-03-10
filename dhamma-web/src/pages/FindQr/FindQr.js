import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertModal from "../../components/AlertModal";
import QRCode from "qrcode";
import { supabase } from "../../services/supabase";
import "./FindQr.css";

export default function FindQr() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mobileNo, setMobileNo] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [qrTargetUrl, setQrTargetUrl] = useState("");
  const [qrUserName, setQrUserName] = useState("");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });

  function closeModal() {
    if (modalConfig.onConfirm) modalConfig.onConfirm();
    setModalConfig((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
  }

  function showModal(type, title, message, onConfirm = null) {
    setModalConfig({ isOpen: true, type, title, message, onConfirm });
  }

  function getQrFileName() {
    const source = (qrUserName || mobileNo || "user-qr").trim();
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

  async function handleGenerateQr(e) {
    e.preventDefault();
    const trimmedMobileNo = mobileNo.trim();
    if (!trimmedMobileNo) {
      showModal("error", "Mobile Required", "Please enter mobile number.");
      return;
    }

    setLoading(true);
    setQrImageUrl("");
    setQrTargetUrl("");
    setQrUserName("");
    setIsQrModalOpen(false);

    const { data, error } = await supabase
      .from("User")
      .select("ID, FullName, MobileNo")
      .eq("MobileNo", trimmedMobileNo)
      .eq("IsDeleted", false)
      .limit(1);

    if (error) {
      setLoading(false);
      showModal("error", "Find QR Failed", "Could not find user by this mobile number.");
      return;
    }

    if (!data || data.length === 0) {
      setLoading(false);
      showModal("warning", "Not Found", "No user found for this mobile number.");
      return;
    }

    const user = data[0];
    const profileUrl = getPublicProfileUrl(user.ID);

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
      setQrUserName(user.FullName || user.MobileNo || "");
      setIsQrModalOpen(true);
    } catch {
      showModal("error", "QR Generate Failed", "Could not generate QR code.");
    }
    setLoading(false);
  }

  return (
    <div className="fq-container">
      <div className="fq-card">
        <button type="button" className="fq-close-button" data-label="Back" aria-label="Back" onClick={() => navigate("/signin")}>
          ×
        </button>
        <div className="fq-wave">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="fq-wave-svg">
            <path d="M-0.00,49.85 C150.00,149.60 349.20,-49.85 500.00,49.85 L500.00,149.60 L-0.00,149.60 Z" className="fq-wave-path"></path>
          </svg>
        </div>
        <div className="fq-header">
          <h2>Find QR</h2>
          <p>Enter mobile number to generate profile QR.</p>
        </div>
        <form onSubmit={handleGenerateQr} className="fq-form" autoComplete="off">
          <div className="fq-form-group fq-floating-label">
            <input type="tel" id="fq-mobile" value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} placeholder=" " required />
            <label htmlFor="fq-mobile">Mobile Number</label>
          </div>
          <button type="submit" className="fq-submit" disabled={loading}>
            {loading ? "Generating..." : "Generate"}
          </button>
        </form>
        <div className="fq-footer">
          <button className="fq-back-link" type="button" onClick={() => navigate("/signin")}>
            Back to Sign In
          </button>
        </div>
      </div>
      {isQrModalOpen ? (
        <div className="fq-qr-modal-backdrop" onClick={() => setIsQrModalOpen(false)}>
          <div className="fq-qr-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="fq-qr-modal-close" aria-label="Close QR modal" onClick={() => setIsQrModalOpen(false)}>
              ×
            </button>
            <h3 className="fq-qr-modal-title">User QR</h3>
            <div className="fq-result">
              <img src={qrImageUrl} alt="User Profile QR" className="fq-image" />
              <p className="fq-user">{qrUserName}</p>
              <div className="fq-qr-actions">
                <a className="fq-save-btn" href={qrImageUrl} download={getQrFileName()} aria-label="Download QR" title="Download QR">
                  <svg viewBox="0 0 24 24" className="fq-save-icon" aria-hidden="true">
                    <path
                      d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.29a1 1 0 1 1 1.4 1.41l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.41L11 12.59V4a1 1 0 0 1 1-1Zm-7 13a1 1 0 0 1 1 1v2h12v-2a1 1 0 1 1 2 0v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
                <a
                  className="fq-whatsapp-share-btn"
                  href={getWhatsappShareUrl()}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share profile via WhatsApp"
                  title="Share via WhatsApp"
                >
                  <svg viewBox="0 0 32 32" className="fq-whatsapp-icon" aria-hidden="true">
                    <path
                      d="M16.08 4.5c-6.34 0-11.48 5.08-11.48 11.35 0 2.03.54 4 1.56 5.73L4.5 27.5l6.09-1.61a11.5 11.5 0 0 0 5.49 1.39c6.34 0 11.48-5.08 11.48-11.35S22.42 4.5 16.08 4.5Zm0 20.83c-1.77 0-3.5-.47-5.02-1.35l-.36-.21-3.61.95.97-3.5-.23-.36a9.77 9.77 0 0 1-1.53-5.23c0-5.39 4.42-9.77 9.86-9.77S25.94 10.24 25.94 15.63s-4.42 9.7-9.86 9.7Zm5.41-7.27c-.3-.15-1.78-.87-2.05-.97-.27-.1-.47-.15-.67.15s-.77.97-.95 1.17c-.17.2-.35.22-.65.07-.3-.15-1.27-.46-2.42-1.47-.9-.79-1.5-1.76-1.67-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.52 0 1.5 1.07 2.93 1.22 3.14.15.2 2.1 3.35 5.19 4.56.74.32 1.32.5 1.77.64.74.24 1.42.2 1.95.12.6-.1 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.12-.27-.2-.57-.35Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </div>
              <a className="fq-profile-link" href={qrTargetUrl} target="_blank" rel="noreferrer">
                Open Profile Link
              </a>
            </div>
          </div>
        </div>
      ) : null}
      <AlertModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={closeModal}
      />
    </div>
  );
}
