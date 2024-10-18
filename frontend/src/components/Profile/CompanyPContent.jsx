import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const CompanyProf = () => {
  const [company, setCompany] = useState({
    logo: "",
    name: "",
    description: "",
    address: "",
    city: "",
    contactNumber: "",
    email: "",
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false); // Single modal state for both edit and password
  const [isEditing, setIsEditing] = useState(true); // Toggle between edit profile and change password
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] =
    useState(false); // Profile picture modal state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // State for logout modal
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("Id");
    const config = {
      method: "get",
      url: `/company/view/${userId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response) {
        const companyData = response.data.data;
        setCompany({
          logo: companyData.profile_picture, // Assuming the logo is returned as a base64 string
          name: companyData.name,
          description: companyData.description,
          address: companyData.address,
          city: companyData.city,
          contactNumber: companyData.contact_number,
          companyEmail: companyData.email,
        });
      })
      .catch(function (error) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      });
  }, []);

  const MAX_FILE_SIZE = 16777215; // 16MB

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      if (file.size <= MAX_FILE_SIZE) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result.split(",")[1];
          setCompany((prevCompany) => ({
            ...prevCompany,
            logo: base64Data,
          }));
        };
        reader.readAsDataURL(file);
        toast.success("Logo uploaded successfully!");
      } else {
        toast.error("File size exceeds 16MB. Please upload a smaller file.");
      }
    } else {
      toast.error("Please upload a jpeg/png file.");
    }
  };

  const handleProfilePictureSubmit = () => {
    const userId = localStorage.getItem("Id");
    const config = {
      method: "put",
      url: `/company/update/picture/${userId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        profile_picture: company.logo,
      },
    };

    axios(config)
      .then(() => {
        toast.success("Profile picture updated successfully!");
        setIsProfilePictureModalOpen(false);
        window.location.reload();
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while updating profile picture."
        );
      });
  };

  const handleChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
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
    setIsModalOpen(true); // Open the modal in edit mode
  };

  const handlePasswordToggle = () => {
    setIsEditing(false);
    setIsModalOpen(true); // Open the modal in password change mode
  };

  const handleUpdate = () => {
    setIsModalOpen(false);

    const updateCompanyProfile = JSON.stringify({
      name: company.name,
      address: company.address,
      city: company.city,
      description: company.description,
      contact_number: company.contactNumber,
      email: company.companyEmail,
    });

    const companyId = localStorage.getItem("Id");
    const config = {
      method: "put",
      url: `/company/update/${companyId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: updateCompanyProfile,
    };

    axios(config)
      .then(function (response) {
        toast.success(response.data.message);
      })
      .catch(function (error) {
        toast.error(error.response.data.message);
      });

    setTimeout(() => {
      window.location.reload();
    }, 2000); // Reload the page after 2 seconds
  };

  const handlePasswordUpdate = () => {
    const companyId = localStorage.getItem("Id");

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
      url: `/company/update/password/${companyId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function () {
        toast.success("Password updated successfully.");
        setIsModalOpen(false);
      })
      .catch(function () {
        toast.error(
          "Failed to update password. Please check your current password."
        );
      });
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true); // Open the modal when logout is clicked
  };

  const confirmLogout = () => {
    localStorage.removeItem("Id");
    localStorage.removeItem("Role");
    localStorage.removeItem("Token");
    navigate("/login");
    toast.success("Logged out successfully!");
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close modal without logging out
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 mb-10 p-8 bg-white rounded-lg shadow-lg">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="relative">
          <img
            src={`data:image/png;base64,${company.logo}`}
            alt="Company Logo"
            className="w-24 h-25 rounded-full border-4 border-blue-700 shadow-lg object-cover"
          />
          <button
            onClick={() => setIsProfilePictureModalOpen(true)}
            className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-1 shadow-md"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>
        <div className="ml-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {company.name}
          </h2>
          <h4 className="text-sm md:text-lg font-bold text-gray-400">
            {company.companyEmail}
          </h4>
          <div className="flex flex-col md:flex-row mt-4">
            <button
              onClick={handleEdit}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center mb-4 md:mb-0 md:mr-4"
            >
              <span className="material-symbols-outlined text-xl mr-2">
                edit
              </span>
              Edit Profile
            </button>

            <button
              onClick={handlePasswordToggle}
              className="w-full md:w-auto px-4 py-2 bg-custom-blue text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition duration-300 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-xl mr-2">
                lock
              </span>
              Change Password
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row mt-4">
          <button
            onClick={handleGoBack}
            className="w-full md:w-auto px-4 py-2 bg-gray-100 text-blue-900 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-300 mb-4 md:mb-0 md:mr-4"
          >
            Back
          </button>
          <button
            onClick={handleLogout}
            className="w-full md:w-auto px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">
              logout
            </span>
            Logout
          </button>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800">About</h3>
        <p className="text-gray-700 mt-2">{company.description}</p>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left text-gray-800">
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="material-symbols-outlined text-xl mr-2">
                business
              </span>
              Name:
            </p>
            <p className="text-gray-600 bg-gray-200 p-5 rounded-lg">
              {company.name}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="material-symbols-outlined text-xl mr-2">
                location_on
              </span>
              Address:
            </p>
            <p className="text-gray-600 bg-gray-200 p-5 rounded-lg">
              {company.address}
            </p>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="material-symbols-outlined text-xl mr-2">
                location_city
              </span>
              City:
            </p>
            <p className="text-gray-600 bg-gray-200 p-5 rounded-lg">
              {company.city}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="material-symbols-outlined text-xl mr-2">
                phone
              </span>
              Contact Number:
            </p>
            <p className="text-gray-600 bg-gray-200 p-5 rounded-lg">
              {company.contactNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Picture Modal */}
      {isProfilePictureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Update Logo
              </h2>
              <button
                onClick={() => setIsProfilePictureModalOpen(false)}
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
                Select a new logo:
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsProfilePictureModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleProfilePictureSubmit}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Update Logo
              </button>
            </div>
          </div>
        </div>
      )}

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
                    Email:
                  </label>
                  <input
                    type="text"
                    name="companyEmail"
                    value={company.companyEmail}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold">
                    Address:
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={company.address}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold">
                    City:
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={company.city}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold">
                    Description:
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={company.description}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold">
                    Contact Number:
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={company.contactNumber}
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

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Logout Confirmation
              </h2>
              <button
                onClick={closeModal}
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

            {/* Modal Body */}
            <div className="mb-6">
              <p className="text-lg text-gray-600">
                Are you sure you want to logout? You will need to log back in to
                view or manage your company profile.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
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

export default CompanyProf;
