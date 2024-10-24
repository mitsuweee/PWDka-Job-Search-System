import React, { useState } from "react";
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
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match", { position: "top-center" });
      return;
    }

    setLoading(true); // Show loading state

    // Prepare Axios request config
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
    <form className="mt-8 grid grid-cols-12 gap-6" onSubmit={handleSubmit}>
      <div className="col-span-12">
        <h1 className="text-3xl font-bold text-custom-blue">Admin Signup</h1>
      </div>

      <div className="col-span-12 md:col-span-6">
        <label
          htmlFor="firstName"
          className="block text-lg font-medium text-gray-700"
        >
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-2.5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
          required
        />
      </div>

      <div className="col-span-12 md:col-span-6">
        <label
          htmlFor="lastName"
          className="block text-lg font-medium text-gray-700"
        >
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-2.5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
          required
        />
      </div>

      <div className="col-span-12 md:col-span-6">
        <label
          htmlFor="email"
          className="block text-lg font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-2.5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
          required
        />
      </div>

      <div className="col-span-12 md:col-span-6">
        <label
          htmlFor="password"
          className="block text-lg font-medium text-gray-700"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-2.5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-blue-500"
          >
            <span className="material-symbols-outlined">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>

      <div className="col-span-12 md:col-span-6">
        <label
          htmlFor="confirm_password"
          className="block text-lg font-medium text-gray-700"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirm_password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleInputChange}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-2.5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-blue-500"
          >
            <span className="material-symbols-outlined">
              {showConfirmPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>

      <div className="col-span-12">
        <button
          type="submit"
          className={`w-full py-1.5 px-3 text-lg font-medium text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 transition-all focus:outline-none ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Sidebar */}
      <aside
        className={`bg-custom-blue w-full md:w-[300px] lg:w-[250px] p-4 flex flex-col items-center md:relative fixed top-0 left-0 min-h-screen h-full transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-50 md:z-auto`}
      >
        <button
          className="text-white md:hidden self-end size-10"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>
        <a
          href="/admin/dashboard"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">home</span>
          <span className="flex-grow text-center">Home</span>
        </a>

        <a
          href="/admin/dashboard/VerifyUsers"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
        >
          <span className="material-symbols-outlined text-xl mr-4">
            group_add
          </span>
          <span className="flex-grow text-center">Verify Applicants</span>
        </a>

        <a
          href="/admin/dashboard/VerifyComps"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
        >
          <span className="material-symbols-outlined text-xl mr-4">
            apartment
          </span>
          <span className="flex-grow text-center">Verify Companies</span>
        </a>

        <a
          href="/admin/dashboard/ViewUsers"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
        >
          <span className="material-symbols-outlined text-xl mr-4">group</span>
          <span className="flex-grow text-center">View All Applicants</span>
        </a>

        <a
          href="/admin/dashboard/ViewCompany"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
        >
          <span className="material-symbols-outlined text-xl mr-4">
            source_environment
          </span>
          <span className="flex-grow text-center">View All Companies</span>
        </a>

        <a
          href="/admin/dashboard/ViewJobs"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
        >
          <span className="material-symbols-outlined text-xl mr-4">work</span>
          <span className="flex-grow text-center">View All Job Listings</span>
        </a>

        <a
          href="/admin/dashboard/AdminSignup"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
        >
          <span className="material-symbols-outlined text-xl mr-4">draw</span>
          <span className="flex-grow text-center">Sign Up</span>
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
