import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const AdminSignup = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // Logout confirmation modal state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const navigate = useNavigate();

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
    } catch {
      console.error("Failed to check user status.");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      checkAdminStatus();
    }, 5000);
    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  const [tokenValid, setTokenValid] = useState(false); // New state for token validation
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        // Only show the error message if there is a specific message
        const errorMessage = error.response?.data?.message;
        if (errorMessage) {
          toast.error(errorMessage); // Show the server-specific error message
        }
      });
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match", { position: "top-center" });
      return;
    }

    setLoading(true); // Show loading state

    // Axios request config
    const config = {
      method: "POST",
      url: "/admin/register", // Adjust to your actual endpoint
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
      },
    };

    // Send request with Axios
    axios(config)
      .then((response) => {
        if (response.data.successful) {
          toast.success("Signup successful!", { position: "top-center" });
          navigate("/admin/dashboard"); // Navigate to dashboard on success
        } else {
          toast.error(response.data.message || "Signup failed", {
            position: "top-center",
          });
        }
      })
      .catch((error) => {
        // Handle error response
        const errorMessage =
          error.response?.data?.message || "An error occurred during signup.";
        toast.error(errorMessage, { position: "top-center" });
      })
      .finally(() => {
        setLoading(false); // Reset loading state in both success and error cases
      });
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("Id");
    localStorage.removeItem("Role");
    localStorage.removeItem("Token");
    toast.success("Logged out successfully", { position: "top-center" });
    navigate("/login");
    setIsLogoutModalOpen(false);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  const renderAdminSignupForm = () => (
    <div className="flex justify-center items-center min-h-screen bg-custom-bg px-4 sm:px-0">
      <div className="bg-white p-6 sm:p-10 shadow-2xl rounded-3xl w-full max-w-md sm:max-w-3xl">
        {/* Form Header */}
        <h1 className="text-2xl sm:text-4xl font-bold text-center text-blue-600 mb-6 sm:mb-10 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl sm:text-5xl mr-2 sm:mr-4">
            shield_person
          </span>
          Admin Signup
        </h1>

        {/* Signup Form */}
        <form
          className="grid grid-cols-12 gap-x-4 gap-y-6 sm:gap-6"
          onSubmit={handleSubmit}
        >
          {/* First Name */}
          <div className="col-span-12 sm:col-span-6">
            <label
              htmlFor="firstName"
              className="flex items-center text-sm sm:text-lg font-semibold text-gray-700"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl mr-2 sm:mr-4 text-blue-500">
                person
              </span>
              First Name<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="mt-1 w-full h-10 sm:h-12 text-sm sm:text-base text-gray-600 bg-gray-100 p-2 sm:p-3 rounded-lg shadow-inner border border-gray-300 focus:border-blue-500 focus:outline-none transition duration-300"
                required
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="col-span-12 sm:col-span-6">
            <label
              htmlFor="lastName"
              className="flex items-center text-sm sm:text-lg font-semibold text-gray-700"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl mr-2 sm:mr-4 text-blue-500">
                person
              </span>
              Last Name<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="mt-1 w-full h-10 sm:h-12 text-sm sm:text-base text-gray-600 bg-gray-100 p-2 sm:p-3 rounded-lg shadow-inner border border-gray-300 focus:border-blue-500 focus:outline-none transition duration-300"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="col-span-12 sm:col-span-6">
            <label
              htmlFor="email"
              className="flex items-center text-sm sm:text-lg font-semibold text-gray-700"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl mr-2 sm:mr-4 text-blue-500">
                email
              </span>
              Email<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 w-full h-10 sm:h-12 text-sm sm:text-base text-gray-600 bg-gray-100 p-2 sm:p-3 rounded-lg shadow-inner border border-gray-300 focus:border-blue-500 focus:outline-none transition duration-300"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="col-span-12 sm:col-span-6">
            <label
              htmlFor="password"
              className="flex items-center text-sm sm:text-lg font-semibold text-gray-700"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl mr-2 sm:mr-4 text-blue-500">
                lock
              </span>
              Password<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 w-full h-10 sm:h-12 text-sm sm:text-base text-gray-600 bg-gray-100 p-2 sm:p-3 rounded-lg shadow-inner border border-gray-300 focus:border-blue-500 focus:outline-none transition duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-2 sm:px-3 flex items-center text-gray-400 hover:text-blue-500"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="col-span-12 sm:col-span-6">
            <label
              htmlFor="confirm_password"
              className="flex items-center text-sm sm:text-lg font-semibold text-gray-700"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl mr-2 sm:mr-4 text-blue-500">
                lock
              </span>
              Confirm Password<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                className="mt-1 w-full h-10 sm:h-12 text-sm sm:text-base text-gray-600 bg-gray-100 p-2 sm:p-3 rounded-lg shadow-inner border border-gray-300 focus:border-blue-500 focus:outline-none transition duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 px-2 sm:px-3 flex items-center text-gray-400 hover:text-blue-500"
              >
                <span className="material-symbols-outlined">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="col-span-12">
            <button
              type="submit"
              className={`w-full py-2 sm:py-3 text-sm sm:text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-all focus:outline-none ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Sidebar */}
      <aside
        className={`bg-custom-blue w-full md:w-[300px] lg:w-[250px] p-4 flex flex-col items-center md:relative fixed top-0 left-0 min-h-screen h-full transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-50 md:z-auto overflow-y-auto `}
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
            {admin.firstName.charAt(0).toUpperCase() + admin.firstName.slice(1)}{" "}
            {admin.lastName.charAt(0).toUpperCase() + admin.lastName.slice(1)}
          </span>
          !
        </h2>

        {/* Dashboard Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Dashboard
        </h2>
        <hr className="border-white border-1 w-full mb-4" />

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
        <hr className="border-white border-1 w-full mb-4" />

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
        <hr className="border-white border-1 w-full mb-4" />

        <a
          href="/admin/dashboard/ViewUsers"
          className={`${
            window.location.pathname === "/admin/dashboard/ViewUsers"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
        >
          <span className="material-symbols-outlined text-xl mr-4">group</span>
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
        <hr className="border-white border-1 w-full mb-4" />

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

      {/* Mobile Toggle Button */}
      <button
        className={`md:hidden bg-custom-blue text-white p-4 fixed top-4 left-4 z-50 rounded-xl mt-11 transition-transform ${
          isSidebarOpen ? "hidden" : ""
        }`}
        onClick={() => setIsSidebarOpen(true)}
      >
        &#9776;
      </button>

      {/* Main Content */}
      <main className="flex-grow p-8 bg-custom-bg">
        <div className="flex justify-between items-center"></div>
        <div className="mt-4">{renderAdminSignupForm()}</div>
      </main>
    </div>
  );
};

export default AdminSignup;
