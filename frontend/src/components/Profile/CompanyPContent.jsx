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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] =
    useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState(""); // New state for email change

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(true);
  const [isEmailChanging, setIsEmailChanging] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [newEmail, setNewEmail] = useState("");
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
          logo: companyData.profile_picture,
          name: companyData.name,
          description: companyData.description,
          address: companyData.address,
          city: companyData.city,
          contactNumber: companyData.contact_number,
          email: companyData.email,
        });
      })
      .catch(function (error) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      });
  }, []);

  const MAX_FILE_SIZE = 16777215;

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
    setIsPasswordChanging(false);
    setIsEmailChanging(false);
    setIsModalOpen(true);
  };

  const handleEmailToggle = () => {
    setIsEditing(false);
    setIsPasswordChanging(false);
    setIsEmailChanging(true);
    setIsModalOpen(true);
  };

  const handlePasswordToggle = () => {
    setIsEditing(false);
    setIsPasswordChanging(true);
    setIsEmailChanging(false);
    setIsModalOpen(true);
  };

  const handleUpdate = () => {
    setIsModalOpen(false);

    const updateCompanyProfile = JSON.stringify({
      name: company.name,
      address: company.address,
      city: company.city,
      description: company.description,
      contact_number: company.contactNumber,
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
    }, 2000);
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
        toast.success("Password updated successfully!");
        setIsModalOpen(false);
      })
      .catch(function (error) {
        const errorMessage =
          error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : "Failed to update password. Please check your current password.";
        toast.error(errorMessage);
      });
  };

  const handleEmailUpdate = () => {
    const companyId = localStorage.getItem("Id");

    const data = JSON.stringify({
      email: newEmail,
      password: currentPasswordForEmail, // Include password in the request
    });

    const config = {
      method: "put",
      url: `/company/update/email/${companyId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function () {
        toast.success("Email updated successfully.");
        setIsEmailModalOpen(false);
        window.location.reload();
      })
      .catch(function (error) {
        // Display the specific error message from the backend
        const errorMessage =
          error.response?.data?.message || "Failed to update email.";
        toast.error(errorMessage);
      });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("Id");
    localStorage.removeItem("Role");
    localStorage.removeItem("Token");
    navigate("/login");
    toast.success("Logged out successfully!");
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 mb-10 p-8 bg-white rounded-lg shadow-lg">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="relative w-32 h-32 rounded-full border-4 border-blue-700 shadow-lg overflow-hidden">
          <img
            src={`data:image/png;base64,${company.logo}`}
            alt="Company Logo"
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => setIsProfilePictureModalOpen(true)}
            className="absolute bottom-1 right-1 bg-white border border-gray-300 rounded-full p-2 shadow-md"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>

        <div className="ml-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {company.name}
          </h2>
          <h4 className="text-sm md:text-lg font-bold text-gray-400">
            {company.email}
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
              {company.city
                .split(" ")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" ")}
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

      {/* Edit Profile, Change Password & Change Email Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 ">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {isEditing
                  ? "Edit Profile"
                  : isPasswordChanging
                  ? "Change Password"
                  : "Change Email"}
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

            {/* Modal Navigation */}
            <div className="flex flex-col md:flex-row mt-4 justify-center">
              <button
                onClick={handleEdit}
                className={`w-full md:w-auto px-2 py-1 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center mb-2 md:mb-0 md:mr-2 ${
                  isEditing && "bg-blue-700"
                }`}
              >
                <span className="material-symbols-outlined text-base mr-1">
                  edit
                </span>
                Edit Profile
              </button>

              <button
                onClick={handleEmailToggle}
                className={`w-full md:w-auto px-2 py-1 bg-green-500 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300 flex items-center justify-center mb-2 md:mb-0 md:mr-2 ${
                  isEmailChanging && "bg-green-600"
                }`}
              >
                <span className="material-symbols-outlined text-base mr-1">
                  mail
                </span>
                Change Email
              </button>

              <button
                onClick={handlePasswordToggle}
                className={`w-full md:w-auto px-2 py-1 bg-custom-blue text-white text-sm font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition duration-300 flex items-center justify-center ${
                  isPasswordChanging && "bg-yellow-600"
                }`}
              >
                <span className="material-symbols-outlined text-base mr-1">
                  lock
                </span>
                Change Password
              </button>
            </div>

            {/* Edit Profile Form */}
            {isEditing && (
              <div className="grid grid-cols-1 gap-6 mt-6 ">
                <div>
                  <label className="block text-gray-600 font-semibold">
                    Address:
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={company.address}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      // Allow only letters, numbers, and spaces
                      const regex = /^[a-zA-Z0-9\s]*$/;
                      if (
                        !regex.test(e.key) &&
                        e.key !== "Backspace" &&
                        e.key !== "Delete"
                      ) {
                        e.preventDefault();
                      }
                    }}
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
                  <textarea
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
                    pattern="[0-9]{10,11}"
                    onKeyDown={(e) => {
                      // Allow only numbers and basic navigation keys
                      const allowedKeys = [
                        "Backspace",
                        "Delete",
                        "ArrowLeft",
                        "ArrowRight",
                        "Tab",
                      ];
                      if (
                        !/[0-9]/.test(e.key) &&
                        !allowedKeys.includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Change Password Form */}
            {isPasswordChanging && (
              <div className="grid grid-cols-1 gap-6 mt-6">
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

            {/* Change Email Form */}
            {isEmailChanging && (
              <div className="grid grid-cols-1 gap-6 mt-6">
                <div>
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

                <div>
                  <label className="block text-gray-600 font-semibold">
                    Current Password:
                  </label>
                  <input
                    type={
                      passwordVisibility.currentPassword ? "text" : "password"
                    }
                    value={currentPasswordForEmail}
                    onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPasswordVisibility((prev) => ({
                        ...prev,
                        currentPassword: !prev.currentPassword,
                      }))
                    }
                    className="text-blue-500 mt-1"
                  >
                    {passwordVisibility.currentPassword ? "Hide" : "Show"}
                  </button>
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
                onClick={
                  isEditing
                    ? handleUpdate
                    : isPasswordChanging
                    ? handlePasswordUpdate
                    : handleEmailUpdate
                }
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                {isEditing
                  ? "Update Profile"
                  : isPasswordChanging
                  ? "Save New Password"
                  : "Update Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
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
                Are you sure you want to logout? You will need to log back in to
                view or manage your company profile.
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

export default CompanyProf;
