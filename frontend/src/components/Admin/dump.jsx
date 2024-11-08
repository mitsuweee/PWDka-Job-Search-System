import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const AdminProf = () => {
  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [newEmail, setNewEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <div className="max-w-4xl mx-auto mb-10 mt-10 p-8 bg-white rounded-lg shadow-lg">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="ml-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          {admin.firstName} {admin.lastName}
        </h2>
        <div className="flex mt-2">
          <p className="text-gray-600">Email: {admin.email}</p>
        </div>
        <div className="flex flex-col md:flex-row mt-4">
          <button
            onClick={handleEdit}
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center mb-4 md:mb-0 md:mr-4"
          >
            <span className="material-symbols-outlined text-xl mr-2">edit</span>
            Edit Profile
          </button>

          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center mb-4 md:mb-0 md:mr-4"
          >
            <span className="material-symbols-outlined text-xl mr-2">
              email
            </span>
            Change Email
          </button>

          <button
            onClick={handlePasswordToggle}
            className="w-full md:w-auto px-4 py-2 bg-custom-blue text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition duration-300 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">lock</span>
            Change Password
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <button
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg shadow-md hover:shadow-xl hover:bg-red-500 transition-all duration-200 ease-in-out"
          onClick={handleLogout}
        >
          Logout
        </button>
        <button
          className="w-full bg-gray-300 text-gray-900 py-2 px-4 rounded-lg shadow-md hover:bg-gray-400 transition-all duration-200 ease-in-out"
          onClick={handleBack}
        >
          Back to Dashboard
        </button>
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
    </div>
  );
};

export default AdminProf;
