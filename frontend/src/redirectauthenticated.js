import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RedirectAuthenticated = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("Token");

  useEffect(() => {
    if (token) {
      // Redirect to the user's appropriate dashboard based on their role
      const role = localStorage.getItem("Role");
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "company") {
        navigate("/dashc");
      } else if (role === "user") {
        navigate("/joblist");
      }
    }
  }, [token, navigate]);

  return !token ? children : null; // Only render the login/admin login page if no token is found
};

export default RedirectAuthenticated;
