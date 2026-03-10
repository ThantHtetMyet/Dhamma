import { useEffect } from "react";
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Signin from './pages/Signin/Signin';
import Signup from './pages/Signup/Signup';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Users from "./pages/Users/Users";
import Activities from "./pages/Activity/Activities";
import { themeColors } from "./theme/colors";

function App() {
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, []);

  const isAuthed = Boolean(sessionStorage.getItem("user"));

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to={isAuthed ? "/users" : "/signin"} replace />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/sign-in" element={<Navigate to="/signin" replace />} />
        <Route path="/sign-up" element={<Navigate to="/signup" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/users/*" element={<Users />} />
        <Route path="/activity/*" element={<Activities />} />
        <Route path="*" element={<Navigate to={isAuthed ? "/users" : "/signin"} replace />} />
      </Routes>
    </div>
  );
}

export default App;
