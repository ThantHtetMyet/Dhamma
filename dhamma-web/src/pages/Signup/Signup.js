import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AlertModal from "../../components/AlertModal";
import LoadingOverlay from "../../components/LoadingOverlay";
import { signupRaw } from "../../services/auth";
import dhammaImage from "../../images/dhamma_image.jpg";
import "../Signin/Signin.css";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userID: "",
    fullName: "",
    email: "",
    mobileNo: "",
    loginPassword: "",
    confirmPassword: "",
  });
  const [transparentHeroSrc, setTransparentHeroSrc] = useState(dhammaImage);
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

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const startTime = Date.now();
    const normalizedData = {
      userID: formData.userID.trim(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      mobileNo: formData.mobileNo.trim(),
      loginPassword: formData.loginPassword,
      confirmPassword: formData.confirmPassword,
    };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9+()\s-]{7,20}$/;

    if (!normalizedData.userID || normalizedData.userID.length < 3) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 5000) {
        await new Promise((resolve) => setTimeout(resolve, 5000 - elapsed));
      }
      setLoading(false);
      showModal("error", "Validation Error", "UserID must be at least 3 characters long.");
      return;
    }
    if (!normalizedData.fullName || normalizedData.fullName.length < 3) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 5000) {
        await new Promise((resolve) => setTimeout(resolve, 5000 - elapsed));
      }
      setLoading(false);
      showModal("error", "Validation Error", "Full Name must be at least 3 characters long.");
      return;
    }
    if (!emailPattern.test(normalizedData.email)) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 5000) {
        await new Promise((resolve) => setTimeout(resolve, 5000 - elapsed));
      }
      setLoading(false);
      showModal("error", "Validation Error", "Please enter a valid email address.");
      return;
    }
    if (!phonePattern.test(normalizedData.mobileNo)) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 5000) {
        await new Promise((resolve) => setTimeout(resolve, 5000 - elapsed));
      }
      setLoading(false);
      showModal("error", "Validation Error", "Please enter a valid mobile number.");
      return;
    }
    if (normalizedData.loginPassword !== normalizedData.confirmPassword) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 5000) {
        await new Promise((resolve) => setTimeout(resolve, 5000 - elapsed));
      }
      setLoading(false);
      showModal("error", "Validation Error", "Passwords do not match. Please verify your password.");
      return;
    }
    if (normalizedData.loginPassword.length < 6) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 5000) {
        await new Promise((resolve) => setTimeout(resolve, 5000 - elapsed));
      }
      setLoading(false);
      showModal("error", "Weak Password", "Password must be at least 6 characters long.");
      return;
    }
    try {
      const { res, data } = await signupRaw(normalizedData);
      const elapsed = Date.now() - startTime;
      if (elapsed < 5000) {
        await new Promise((resolve) => setTimeout(resolve, 5000 - elapsed));
      }
      setLoading(false);
      if (!res.ok) {
        const type = res.status === 409 ? "warning" : "error";
        showModal(type, res.status === 409 ? "Account Exists" : "Registration Failed", data?.message || data?.error || "Unable to sign up.");
        return;
      }
      showModal("success", "Account Created", "Your account has been successfully created! You can now sign in.", () => {
        navigate("/signin");
      });
    } catch {
      const elapsed = Date.now() - startTime;
      if (elapsed < 5000) {
        await new Promise((resolve) => setTimeout(resolve, 5000 - elapsed));
      }
      setLoading(false);
      showModal("error", "Connection Error", "Could not connect to the backend server.");
    }
  }

  useEffect(() => {
    let isActive = true;
    const image = new Image();
    image.src = dhammaImage;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }
      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;
      const cornerPixels = [
        0,
        canvas.width - 1,
        (canvas.height - 1) * canvas.width,
        canvas.width * canvas.height - 1,
      ]
        .map((index) => {
          const base = index * 4;
          return [data[base], data[base + 1], data[base + 2]];
        })
        .filter(Boolean);

      const background = cornerPixels.reduce(
        (acc, color) => acc.map((value, idx) => value + color[idx]),
        [0, 0, 0]
      );
      const averageBackground = background.map((value) => value / cornerPixels.length);
      const threshold = 40;

      for (let i = 0; i < data.length; i += 4) {
        const dr = data[i] - averageBackground[0];
        const dg = data[i + 1] - averageBackground[1];
        const db = data[i + 2] - averageBackground[2];
        const distance = Math.sqrt(dr * dr + dg * dg + db * db);
        if (distance < threshold) {
          data[i + 3] = 0;
        }
      }

      context.putImageData(imageData, 0, 0);
      const transparentUrl = canvas.toDataURL("image/png");
      if (isActive) {
        setTransparentHeroSrc(transparentUrl);
      }
    };
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="auth-root">
      <div className="auth-card-container auth-single-column">
        <button type="button" className="auth-close-button" data-label="Back" aria-label="Back" onClick={() => navigate("/signin")}>
          ×
        </button>
        <div className="auth-header-section">
          <div className="auth-hero">
            <img src={transparentHeroSrc} alt="Dhamma" className="auth-hero-image" />
            <h1 className="auth-brand-title">Dhamma</h1>
          </div>
          <div className="auth-wave-container">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="auth-wave-svg">
              <path d="M-0.00,49.85 C150.00,149.60 349.20,-49.85 500.00,49.85 L500.00,149.60 L-0.00,149.60 Z" className="auth-wave-path"></path>
            </svg>
          </div>
        </div>
        <div className="auth-form-section">
          <h1 className="auth-form-title">Create Account</h1>
          <div className="auth-form-container auth-single-form">
            <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
              <div className="auth-form-group">
                <input className="auth-input" type="text" name="userID" placeholder=" " value={formData.userID} onChange={handleChange} required />
                <label className="auth-label">UserID</label>
              </div>
              <div className="auth-form-group">
                <input className="auth-input" type="text" name="fullName" placeholder=" " value={formData.fullName} onChange={handleChange} required />
                <label className="auth-label">Full Name</label>
              </div>
              <div className="auth-form-group">
                <input className="auth-input" type="email" name="email" placeholder=" " value={formData.email} onChange={handleChange} required />
                <label className="auth-label">Email</label>
              </div>
              <div className="auth-form-group">
                <input className="auth-input" type="tel" name="mobileNo" placeholder=" " value={formData.mobileNo} onChange={handleChange} required />
                <label className="auth-label">Mobile No</label>
              </div>
              <div className="auth-form-group">
                <input
                  className="auth-input"
                  type="password"
                  name="loginPassword"
                  placeholder=" "
                  value={formData.loginPassword}
                  onChange={handleChange}
                  required
                />
                <label className="auth-label">Password</label>
              </div>
              <div className="auth-form-group">
                <input
                  className="auth-input"
                  type="password"
                  name="confirmPassword"
                  placeholder=" "
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <label className="auth-label">Confirm Password</label>
              </div>
              <button className="auth-button auth-signin-btn" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
              <div className="auth-footer-links auth-signup-links">
                <Link className="auth-link" to="/signin">
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
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
