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

  const [newEmail, setNewEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
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
  }, []);

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
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handlePasswordToggle = () => {
    setIsEditing(false);
    setIsModalOpen(true);
  };

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
      })
      .catch(function () {
        toast.error(
          "Failed to update password. Please check your current password."
        );
      });
  };

  const handleUpdate = () => {
    const updateAdminProfile = JSON.stringify({
      first_name: admin.firstName,
      last_name: admin.lastName,
      email: admin.email,
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
        window.location.reload();
      })
      .catch(function (error) {
        toast.error(error.response.data.message || "An error occurred");
      });

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleEmailUpdate = () => {
    const adminId = localStorage.getItem("Id");

    const data = JSON.stringify({
      email: newEmail,
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
        setIsEmailModalOpen(false);
      })
      .catch(function () {
        toast.error("Failed to update email.");
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
            <div className="w-full max-w-4xl mb-10 p-6 sm:p-8 bg-white rounded-lg shadow-lg">
              {/* Header Section */}
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {admin.firstName.charAt(0).toUpperCase() +
                    admin.firstName.slice(1)}{" "}
                  {admin.lastName.charAt(0).toUpperCase() +
                    admin.lastName.slice(1)}
                </h2>

                <p className="text-gray-600 text-lg mt-2">
                  Email: {admin.email}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center md:justify-start">
                <button
                  onClick={handleEdit}
                  className="w-full sm:w-auto px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-xl mr-2">
                    edit
                  </span>
                  Edit Profile
                </button>

                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-xl mr-2">
                    email
                  </span>
                  Change Email
                </button>

                <button
                  onClick={handlePasswordToggle}
                  className="w-full sm:w-auto px-4 py-3 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-yellow-700 transition duration-300 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-xl mr-2">
                    lock
                  </span>
                  Change Password
                </button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6 border-t pt-6 border-gray-300 justify-center md:justify-start">
                <button
                  onClick={() => navigate("/admin/dashboard")}
                  className="w-full sm:w-auto px-4 py-3 bg-gray-300 text-gray-900 font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-gray-400 transition duration-300 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-xl mr-2">
                    arrow_back
                  </span>
                  Back to Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-4 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-red-700 transition duration-300 flex items-center justify-center"
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

      {/* Edit Profile & Change Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {isEditing ? "Edit Profile" : "Change Password"}
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
            <div className="flex justify-between mb-4">
              <button
                className={`py-2 px-4 ${
                  isEditing
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                } rounded-lg`}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
              <button
                className={`py-2 px-4 ${
                  !isEditing
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                } rounded-lg`}
                onClick={() => setIsEditing(false)}
              >
                Change Password
              </button>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-gray-600 font-semibold">
                    First Name:
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={admin.firstName}
                    onChange={handleChange}
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
                    value={admin.lastName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                  />
                </div>
              </div>
            ) : (
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
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
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
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
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
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
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

            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Back
              </button>
              <button
                onClick={isEditing ? handleUpdate : handlePasswordUpdate}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                {isEditing ? "Update Profile" : "Save New Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Change Email
              </h2>
              <button
                onClick={() => setIsEmailModalOpen(false)}
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
            <div className="mb-4">
              <label className="block text-gray-600 font-semibold">
                New Email:
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailUpdate}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Update Email
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
