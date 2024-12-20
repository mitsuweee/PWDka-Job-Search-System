import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const AdminProf = () => {
  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [tempAdmin, setTempAdmin] = useState({
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
  });

  const [newEmail, setNewEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [isEmailChanging, setIsEmailChanging] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const [tokenValid, setTokenValid] = useState(false); // New state for token validation

  const checkAdminStatus = async () => {
    const adminId = localStorage.getItem("Id");
    try {
      const response = await axios.get(`/admin/view/verify/status/${adminId}`);
      if (
        response.data.successful &&
        response.data.message === "User is Deactivated"
      ) {
        toast.error("Your admin account has been deactivated. Logging out.", {
          duration: 4000, // Display the toast for 5 seconds
        });

        // Wait for the toast to finish before logging out
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 5000); // Wait for 3 seconds before redirecting
      }
    } catch (error) {
      console.error("Failed to check admin status.");
    }
  };

  useEffect(() => {
    const adminId = localStorage.getItem("Id");
    const config = {
      method: "get",
      url: `/admin/view/${adminId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response) {
        const adminData = response.data.data;
        setAdmin({
          firstName: adminData.first_name,
          lastName: adminData.last_name,
          email: adminData.email,
        });
        setNewEmail(adminData.email);
      })
      .catch(function (error) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      });

    const interval = setInterval(() => {
      checkAdminStatus(); // Calls the function that verifies admin status
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const verifyToken = async () => {
    const token = localStorage.getItem("Token"); // Retrieve the token from localStorage
    const userId = localStorage.getItem("Id"); // Retrieve the userId from localStorage
    const userRole = localStorage.getItem("Role"); // Retrieve the userRole from localStorage

    if (!token) {
      toast.error("No token found in local storage");
      return;
    }

    try {
      console.log("Token:", token);

      // Send a POST request with the token, userId, and userRole in the body
      const response = await axios.post(
        "/verification/token/auth",
        {
          token: token,
          userId: userId,
          userRole: userRole,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "Refresh token retrieved successfully") {
        console.log("Changed Refresh Token");
        localStorage.setItem("Token", response.data.refresh_token);
      }

      if (response.data.successful) {
        setTokenValid(true); // Set token as valid
        console.log("Token verified successfully");
      } else {
        toast.error(response.data.message);

        // If token expired, show a toast message and attempt to retrieve a refresh token
        if (
          response.data.message === "Invalid refresh token, token has expired"
        ) {
          console.log("Token expired. Attempting to retrieve refresh token.");
          await retrieveRefreshToken(); // Retrieve a new refresh token and retry verification
        }
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data.message === "Unauthorized! Invalid token"
      ) {
        console.log(
          "Token expired or invalid. Attempting to retrieve refresh token."
        );
        await retrieveRefreshToken(); // Retrieve a new refresh token and retry verification
      } else {
        toast.error("Session expired, logging out");
        console.error("Error verifying token:", error.message);
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 5000);
      }
    }
  };

  // Function to retrieve refresh token using the same API endpoint
  const retrieveRefreshToken = async () => {
    const userId = localStorage.getItem("Id");
    const userRole = localStorage.getItem("Role");

    try {
      const response = await axios.post(
        "/verification/token/auth",
        {
          token: "", // No access token is provided in this case
          userId: userId,
          userRole: userRole,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.successful) {
        // Store the new refresh token in local storage
        localStorage.setItem("Token", response.data.refresh_token);
        console.log(
          "Refresh token retrieved and updated in local storage:",
          response.data.refresh_token
        );
        toast.success("Session refreshed successfully.");

        // Retry verification with the new token
        await verifyToken();
      } else {
        // If retrieving the refresh token fails, show a toast message and redirect to login
        toast.error("Token expired, please log in again");
        window.location.href = "/login"; // Redirect to login page
      }
    } catch (error) {
      toast.error("Token expired, please log in again");
      console.error("Error retrieving refresh token:", error.message);
      window.location.href = "/login"; // Redirect to login page if refresh fails
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  useEffect(() => {
    const adminId = localStorage.getItem("Id");
    const config = {
      method: "get",
      url: `/admin/view/${adminId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response) {
        const adminData = response.data.data;
        setAdmin({
          firstName: adminData.first_name,
          lastName: adminData.last_name,
          email: adminData.email,
        });
        setNewEmail(adminData.email);
      })
      .catch(function (error) {
        // Only show the error message if there is a specific message
        const errorMessage = error.response?.data?.message;
        if (errorMessage) {
          toast.error(errorMessage); // Show the server-specific error message
        }
      });
  }, []);

  const handleTempChange = (e) => {
    setTempAdmin({ ...tempAdmin, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleEdit = () => {
    setTempAdmin({ firstName: admin.firstName, lastName: admin.lastName });
    setIsEditing(true);
    setIsPasswordChanging(false);
    setIsEmailChanging(false);
    setIsModalOpen(true);
  };

  const handlePasswordToggle = () => {
    setIsEditing(false);
    setIsPasswordChanging(true);
    setIsEmailChanging(false);
    setIsModalOpen(true);
  };
  const handleEmailToggle = () => {
    setIsEditing(false);
    setIsPasswordChanging(false);
    setIsEmailChanging(true);
    setCurrentPasswordForEmail("");
    setNewEmail("");
    setIsModalOpen(true);
  };

  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");

  const handlePasswordUpdate = () => {
    const adminId = localStorage.getItem("Id");

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      toast.error("New password and confirm new password do not match.");
      return;
    }

    const data = JSON.stringify({
      password: passwords.currentPassword,
      new_password: passwords.newPassword,
      confirm_password: passwords.confirmNewPassword,
    });

    const config = {
      method: "put",
      url: `/admin/update/password/${adminId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function () {
        toast.success("Password updated successfully!");
        setIsModalOpen(false);
        // Clear the password fields
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      })
      .catch(function () {
        toast.error(
          "Failed to update password. Please check your current password."
        );
      });
  };

  const handleUpdate = () => {
    // Ensure that email is included in the update by merging it with admin.email
    setAdmin((prevAdmin) => ({
      ...tempAdmin,
      email: prevAdmin.email,
    }));

    const updateAdminProfile = JSON.stringify({
      first_name: tempAdmin.firstName,
      last_name: tempAdmin.lastName,
    });

    const adminId = localStorage.getItem("Id");
    const config = {
      method: "put",
      url: `/admin/update/details/${adminId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: updateAdminProfile,
    };

    axios(config)
      .then(function (response) {
        toast.success(response.data.message);
        setIsModalOpen(false);
      })
      .catch(function (error) {
        toast.error(error.response.data.message || "An error occurred");
      });
  };

  const handleEmailUpdate = () => {
    const adminId = localStorage.getItem("Id");

    const data = JSON.stringify({
      email: newEmail,
      password: currentPasswordForEmail, // Include current password in request
    });

    const config = {
      method: "put",
      url: `/admin/update/email/${adminId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function () {
        toast.success("Email updated successfully.");
        setIsModalOpen(false);

        // Reload the page to reflect the updated email
        setTimeout(() => {
          window.location.reload();
        }, 1000); // Optional delay of 1 second for a smoother experience
      })
      .catch(function (error) {
        toast.error(error.response?.data?.message || "Failed to update email.");
      });
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("Id");
    localStorage.removeItem("Role");
    localStorage.removeItem("Token");
    toast.success("Logged out successfully!");
    navigate("/login");
    setIsLogoutModalOpen(false);
  };

  const closeAdminSettings = () => {
    setIsModalOpen(false);
    setNewEmail(""); // Reset email field
    setCurrentPasswordForEmail("");
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    }); // Reset password fields
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  const handleBack = () => {
    navigate("/admin/dashboard");
  };
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Layout Container */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside
          className={`bg-custom-blue w-full md:w-[300px] lg:w-[250px] p-4 flex flex-col items-center md:relative fixed top-0 left-0 min-h-screen h-full transition-transform transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 z-50 md:z-auto ${
            isSidebarOpen ? "overflow-y-auto" : "" // Apply overflow-y-auto only when sidebar is open
          }`}
          style={{
            maxHeight: isSidebarOpen ? "100vh" : "none", // Set max height only when sidebar is open
          }}
        >
          {/* Logo Section */}
          <div className="w-full flex justify-center items-center mb-6 p-2 bg-white rounded-lg">
            <img
              src="/imgs/LOGO PWDKA.png" // Replace with the actual path to your logo
              alt="Logo"
              className="w-26 h-19 object-contain"
            />
          </div>

          <button
            className="text-white md:hidden self-end size-10"
            onClick={() => setIsSidebarOpen(false)}
          >
            &times;
          </button>

          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Welcome,{" "}
            <span className="text-2xl md:text-3xl font-bold">
              {admin.firstName.charAt(0).toUpperCase() +
                admin.firstName.slice(1)}{" "}
              {admin.lastName.charAt(0).toUpperCase() + admin.lastName.slice(1)}
            </span>
            !
          </h2>

          {/* Dashboard Section */}
          <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
            Dashboard
          </h2>
          <hr className="border-gray-400 w-full mb-4" />

          <a
            href="/admin/dashboard"
            className={`${
              window.location.pathname === "/admin/dashboard"
                ? "bg-blue-900 text-gray-200" // Active style
                : "bg-gray-200 text-blue-900"
            } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
            style={{
              boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
            }}
          >
            <span className="material-symbols-outlined text-xl mr-4">
              dashboard
            </span>
            <span className="flex-grow text-center">Dashboard</span>
          </a>

          {/* Verification Section */}
          <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
            Verification
          </h2>
          <hr className="border-gray-400 w-full mb-4" />

          <a
            href="/admin/dashboard/VerifyUsers"
            className={`${
              window.location.pathname === "/admin/dashboard/VerifyUsers"
                ? "bg-blue-900 text-gray-200"
                : "bg-gray-200 text-blue-900"
            } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
          >
            <span className="material-symbols-outlined text-xl mr-4">
              how_to_reg
            </span>
            <span className="flex-grow text-center">Verify Applicants</span>
          </a>

          <a
            href="/admin/dashboard/VerifyComps"
            className={`${
              window.location.pathname === "/admin/dashboard/VerifyComps"
                ? "bg-blue-900 text-gray-200"
                : "bg-gray-200 text-blue-900"
            } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
          >
            <span className="material-symbols-outlined text-xl mr-4">
              apartment
            </span>
            <span className="flex-grow text-center">Verify Companies</span>
          </a>

          {/* View Section */}
          <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
            View Records
          </h2>
          <hr className="border-gray-400 w-full mb-4" />

          <a
            href="/admin/dashboard/ViewUsers"
            className={`${
              window.location.pathname === "/admin/dashboard/ViewUsers"
                ? "bg-blue-900 text-gray-200"
                : "bg-gray-200 text-blue-900"
            } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
          >
            <span className="material-symbols-outlined text-xl mr-4">
              group
            </span>
            <span className="flex-grow text-center">View All Applicants</span>
          </a>

          <a
            href="/admin/dashboard/ViewCompany"
            className={`${
              window.location.pathname === "/admin/dashboard/ViewCompany"
                ? "bg-blue-900 text-gray-200"
                : "bg-gray-200 text-blue-900"
            } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
          >
            <span className="material-symbols-outlined text-xl mr-4">
              source_environment
            </span>
            <span className="flex-grow text-center">View All Companies</span>
          </a>

          <a
            href="/admin/dashboard/ViewJobs"
            className={`${
              window.location.pathname === "/admin/dashboard/ViewJobs"
                ? "bg-blue-900 text-gray-200"
                : "bg-gray-200 text-blue-900"
            } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
          >
            <span className="material-symbols-outlined text-xl mr-4">work</span>
            <span className="flex-grow text-center">View All Job Listings</span>
          </a>

          {/* Account Section */}
          <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
            Account
          </h2>
          <hr className="border-gray-400 w-full mb-4" />

          <a
            href="/admin/dashboard/viewadmin"
            className={`${
              window.location.pathname === "/admin/dashboard/viewadmin"
                ? "bg-blue-900 text-gray-200"
                : "bg-gray-200 text-blue-900"
            } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
          >
            <span className="material-symbols-outlined text-xl mr-4">
              manage_accounts
            </span>
            <span className="flex-grow text-center">Admin Management</span>
          </a>

          <a
            href="/adminprofile"
            className={`${
              window.location.pathname === "/adminprofile"
                ? "bg-blue-900 text-gray-200"
                : "bg-gray-200 text-blue-900"
            } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
          >
            <span className="material-symbols-outlined text-xl mr-4">
              server_person
            </span>
            <span className="flex-grow text-center">Profile</span>
          </a>

          <button
            className="bg-red-600 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out mt-6"
            onClick={handleLogout}
          >
            Logout
          </button>
        </aside>

        {/* Mobile Toggle Button */}
        <button
          className={`md:hidden bg-custom-blue text-white p-4 fixed top-4 left-4 z-50 rounded-xl transition-transform ${
            isSidebarOpen ? "hidden" : ""
          }`}
          onClick={() => setIsSidebarOpen(true)}
        >
          &#9776;
        </button>

        {/* Main Content */}
        <main className="flex-grow p-4 sm:p-8 w-full max-w-6xl mx-auto mt-0 md:mt-10 md:ml-[300px]">
          {/* Center Container */}
          <div className="flex flex-col items-center md:items-start">
            {/* Profile Card */}
            <div className="w-full max-w-4xl mb-10 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl transition duration-300 hover:shadow-2xl">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row items-center md:items-start mb-6 space-y-4 md:space-y-0 md:space-x-6">
                {/* Profile Icon */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-blue-200 text-blue-600 rounded-full flex items-center justify-center text-5xl font-bold shadow-inner">
                    {admin.firstName.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {`${
                      admin.firstName.charAt(0).toUpperCase() +
                      admin.firstName.slice(1)
                    } ${
                      admin.lastName.charAt(0).toUpperCase() +
                      admin.lastName.slice(1)
                    }`}
                  </h2>
                  <p className="text-gray-600 text-lg mt-2">
                    <span className="font-medium text-gray-700">Email:</span>{" "}
                    {admin.email}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center md:justify-start border-t border-gray-300 pt-4">
                <button
                  onClick={handleEdit}
                  className="w-full sm:w-auto px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-xl mr-2">
                    edit
                  </span>
                  Edit Profile
                </button>

                <button
                  onClick={handleEmailToggle}
                  className="w-full sm:w-auto px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-xl mr-2">
                    email
                  </span>
                  Change Email
                </button>

                <button
                  onClick={handlePasswordToggle}
                  className="w-full sm:w-auto px-5 py-3 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-yellow-700 transition duration-300 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-xl mr-2">
                    lock
                  </span>
                  Change Password
                </button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 border-t pt-6 border-gray-300 justify-center md:justify-start">
                <button
                  onClick={() => navigate("/admin/dashboard")}
                  className="w-full sm:w-auto px-5 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-gray-300 transition duration-300 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-xl mr-2">
                    arrow_back
                  </span>
                  Back to Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-5 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-red-700 transition duration-300 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-xl mr-2">
                    logout
                  </span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Profile, Change Email & Change Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {isEditing
                  ? "Edit Profile"
                  : isEmailChanging
                  ? "Change Email"
                  : "Change Password"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 transition duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Toggle Buttons */}
            <div className="flex justify-between mb-4">
              <button
                className={`py-2 px-4 ${
                  isEditing
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                } rounded-lg`}
                onClick={() => {
                  setIsEditing(true);
                  setIsEmailChanging(false);
                  setIsPasswordChanging(false);
                }}
              >
                Edit Profile
              </button>
              <button
                className={`py-2 px-4 ${
                  isEmailChanging
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                } rounded-lg`}
                onClick={() => {
                  setIsEditing(false);
                  setIsEmailChanging(true);
                  setIsPasswordChanging(false);
                }}
              >
                Change Email
              </button>
              <button
                className={`py-2 px-4 ${
                  isPasswordChanging
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                } rounded-lg`}
                onClick={() => {
                  setIsEditing(false);
                  setIsEmailChanging(false);
                  setIsPasswordChanging(true);
                }}
              >
                Change Password
              </button>
            </div>

            {/* Content Sections */}
            {isEditing && (
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-gray-600 font-semibold">
                    First Name:
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={tempAdmin.firstName}
                    onChange={handleTempChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold">
                    Last Name:
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={tempAdmin.lastName}
                    onChange={handleTempChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                  />
                </div>
              </div>
            )}

            {isEmailChanging && (
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold">
                    New Email:
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold">
                    Current Password:
                  </label>
                  <div className="relative">
                    <input
                      type={
                        passwordVisibility.currentPassword ? "text" : "password"
                      }
                      value={currentPasswordForEmail}
                      onChange={(e) =>
                        setCurrentPasswordForEmail(e.target.value)
                      }
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                      onClick={() =>
                        setPasswordVisibility({
                          ...passwordVisibility,
                          currentPassword: !passwordVisibility.currentPassword,
                        })
                      }
                    >
                      <span className="material-symbols-outlined">
                        {passwordVisibility.currentPassword
                          ? "visibility"
                          : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isPasswordChanging && (
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-gray-600 font-semibold">
                    Current Password:
                  </label>
                  <div className="relative">
                    <input
                      type={
                        passwordVisibility.currentPassword ? "text" : "password"
                      }
                      name="currentPassword"
                      value={passwords.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center"
                      onClick={() =>
                        togglePasswordVisibility("currentPassword")
                      }
                    >
                      <span className="material-symbols-outlined">
                        {passwordVisibility.currentPassword
                          ? "visibility"
                          : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold">
                    New Password:
                  </label>
                  <div className="relative">
                    <input
                      type={
                        passwordVisibility.newPassword ? "text" : "password"
                      }
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center"
                      onClick={() => togglePasswordVisibility("newPassword")}
                    >
                      <span className="material-symbols-outlined">
                        {passwordVisibility.newPassword
                          ? "visibility"
                          : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold">
                    Confirm New Password:
                  </label>
                  <div className="relative">
                    <input
                      type={
                        passwordVisibility.confirmNewPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmNewPassword"
                      value={passwords.confirmNewPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center"
                      onClick={() =>
                        togglePasswordVisibility("confirmNewPassword")
                      }
                    >
                      <span className="material-symbols-outlined">
                        {passwordVisibility.confirmNewPassword
                          ? "visibility"
                          : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={closeAdminSettings}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Back
              </button>
              <button
                onClick={
                  isEditing
                    ? handleUpdate
                    : isEmailChanging
                    ? handleEmailUpdate
                    : handlePasswordUpdate
                }
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                {isEditing
                  ? "Update Profile"
                  : isEmailChanging
                  ? "Update Email"
                  : "Save New Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Logout Confirmation
              </h2>
              <button
                onClick={closeLogoutModal}
                className="text-gray-500 hover:text-gray-800 transition duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <p className="text-lg text-gray-600">
                Are you sure you want to log out?
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={closeLogoutModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProf;
