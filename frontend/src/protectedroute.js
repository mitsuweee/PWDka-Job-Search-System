const ProtectedRoute = ({ children, role }) => {
  const userRole = localStorage.getItem("Role");
  const token = localStorage.getItem("Token");

  // Check if the user has a valid token and the required role
  if (token && userRole === role) {
    return children;
  } else {
    alert(
      "Access Denied: You cannot access this page without the required permissions."
    );
    // Navigate back to the previous page
    window.history.back();

    return null; // To ensure no children component is rendered
  }
};

export default ProtectedRoute;
