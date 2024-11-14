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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false); // New state for deactivate modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [deactivationPassword, setDeactivationPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deactivationPasswordVisible, setDeactivationPasswordVisible] =
    useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const checkCompanyStatus = async () => {
    try {
      let token = localStorage.getItem("Token");
      if (!token) {
        toast.error("No token found. Please log in again.");
        navigate("/login");
        return;
      }

      // Verify token with backend
      const tokenResponse = await axios.post("/token/auth", { token });

      if (!tokenResponse.data.successful) {
        // If token verification fails, try refreshing it
        token = await refreshAuthToken();
        if (!token) return; // If token could not be refreshed, exit
      }

      // Use the (new or existing) valid token to check company status
      const companyId = localStorage.getItem("Id");
      const response = await axios.get(
        `/company/view/verify/status/${companyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (
        response.data.successful &&
        response.data.message === "Company is Deactivated"
      ) {
        toast.error("Your account has been deactivated. Logging out.", {
          duration: 4000,
        });
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 5000);
      }
    } catch (error) {
      console.error("Error checking company status:", error.message);
      toast.error("An error occurred while verifying your session.");
    }
  };

  const refreshAuthToken = async () => {
    try {
      const userId = localStorage.getItem("Id");
      const userRole = localStorage.getItem("Role");

      const response = await axios.get("/get/token", {
        params: { userId, userRole },
      });

      if (response.data.successful) {
        const newToken = response.data.refresh_token;
        localStorage.setItem("Token", newToken); // Update token in local storage
        toast.success("Token refreshed successfully.");
        return newToken; // Return the new token for further requests
      } else {
        toast.error(response.data.message || "Failed to refresh token.");
        navigate("/login"); // Redirect to login if refreshing fails
      }
    } catch (error) {
      console.error("Error refreshing token:", error.message);
      toast.error("Failed to refresh token. Please log in again.");
      navigate("/login");
    }
  };

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
    const interval = setInterval(() => {
      checkCompanyStatus();
    }, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleDeactivateCompany = () => {
    const userId = localStorage.getItem("Id");

    // Validate that both passwords match before making the request
    if (deactivationPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please try again.");
      return;
    }

    const config = {
      method: "put",
      url: `/company/update/deactivate/${userId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        password: deactivationPassword,
        confirm_password: confirmPassword,
      },
    };

    axios(config)
      .then(() => {
        toast.success("Account deactivated successfully!");

        setIsPasswordModalOpen(false);

        // Add a delay before logging out
        setTimeout(() => {
          confirmLogout(); // Log out the user after deactivation
        }, 5000);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "Failed to deactivate account.";
        toast.error(errorMessage);
      });
  };

  const closeCompSettings = () => {
    setIsModalOpen(false);
    setIsSettingsModalOpen(true);
    setNewEmail(""); // Reset email field
    setCurrentPasswordForEmail("");
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    }); // Reset password fields
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setDeactivationPassword("");
    setConfirmPassword("");
    setDeactivationPasswordVisible(false);
    setConfirmPasswordVisible(false);
  };

  const closeDeactivateModal = () => {
    setIsDeactivateModalOpen(false);
  };

  const handleConfirmDeactivate = () => {
    setIsDeactivateModalOpen(false); // Close warning modal
    setIsPasswordModalOpen(true); // Open password modal
  };

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
      <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-8">
        {/* Company Logo with Edit Button */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <img
            src={`data:image/png;base64,${company.logo}`}
            alt="Company Logo"
            className="w-full h-full rounded-full border-4 border-blue-700 shadow-lg object-cover"
          />
          <button
            onClick={() => setIsProfilePictureModalOpen(true)}
            className="absolute bottom-1 right-1 bg-white border border-gray-300 rounded-full p-1 shadow-md"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>

        {/* Company Information and Settings Button */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {company.name}
          </h2>
          <h4 className="text-sm md:text-lg font-bold text-gray-400 mt-1">
            {company.email}
          </h4>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-full md:w-auto mt-4 px-3 py-1.5 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-lg mr-1.5">
              settings
            </span>
            Settings
          </button>
        </div>

        {/* Back and Logout Buttons */}
        <div className="flex flex-row md:flex-row md:items-center space-x-4 space-y-0 mt-4 md:mt-0">
          <button
            onClick={handleGoBack}
            className="w-1/2 md:w-auto px-4 py-2 bg-gray-100 text-blue-900 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-300"
          >
            Back
          </button>
          <button
            onClick={handleLogout}
            className="w-1/2 md:w-auto px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300 flex items-center justify-center"
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
      <div className="mt-8 p-8 bg-gray-50 rounded-lg shadow-2xl">
        <h2 className="text-2xl font-bold text-custom-blue mb-6">
          Company Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left text-gray-800">
          <div>
            <div className="mb-4">
              <p className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="material-symbols-outlined text-xl mr-2">
                  business
                </span>
                Name:
              </p>
              <p className="text-gray-600 bg-gray-200 p-5 rounded-lg shadow-inner">
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
              <p className="text-gray-600 bg-gray-200 p-5 rounded-lg shadow-inner">
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
              <p className="text-gray-600 bg-gray-200 p-5 rounded-lg shadow-inner">
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
              <p className="text-gray-600 bg-gray-200 p-5 rounded-lg shadow-inner">
                {company.contactNumber}
              </p>
            </div>
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

      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-center mb-8  ">
              <span className="material-symbols-outlined text-blue-600 text-4xl mr-2">
                settings
              </span>
              <h2 className="text-2xl font-semibold text-gray-800">
                Company Account Settings
              </h2>
            </div>

            {/* Action Buttons */}
            <div
              className="bg-gray-100 p-6 rounded-lg shadow-lg"
              style={{ boxShadow: "inset 0 4px 10px rgba(0, 0, 0, 0.2)" }}
            >
              <div className="flex flex-col space-y-5">
                <button
                  onClick={() => {
                    setIsSettingsModalOpen(false);
                    handleEdit(); // Open Edit Profile modal
                  }}
                  className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition duration-300 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-xl mr-2">
                    edit
                  </span>
                  Edit Profile
                </button>

                <button
                  onClick={() => {
                    setIsSettingsModalOpen(false);
                    handlePasswordToggle(); // Open Change Password modal
                  }}
                  className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-yellow-600 hover:shadow-xl transition duration-300 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-xl mr-2">
                    lock
                  </span>
                  Change Password
                </button>

                <button
                  onClick={() => {
                    setIsSettingsModalOpen(false);
                    handleEmailToggle();
                  }}
                  className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-yellow-600 hover:shadow-xl transition duration-300 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-xl mr-2">
                    mail
                  </span>
                  Change Email
                </button>

                <button
                  onClick={() => {
                    setIsSettingsModalOpen(false);
                    setIsDeactivateModalOpen(true); // Open Deactivate Account modal
                  }}
                  className="w-full px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-lg hover:bg-red-600 hover:shadow-xl transition duration-300 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-xl mr-2">
                    cancel
                  </span>
                  Deactivate Account
                </button>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow hover:bg-gray-400 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 ">
            {/* Header Section */}
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                {isEditing
                  ? "Edit Profile"
                  : isEmailChanging
                  ? "Change Email"
                  : "Change Password"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-red-500 transition duration-200"
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
            <div className="flex justify-around mb-6">
              <button
                className={`py-2 px-5 ${
                  isEditing
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                } rounded-lg shadow-lg transition-all duration-200 hover:bg-blue-500`}
                onClick={() => {
                  setIsEditing(true);
                  setIsEmailChanging(false);
                  setIsPasswordChanging(false);
                }}
              >
                Edit Profile
              </button>
              <button
                className={`py-2 px-5 ${
                  isEmailChanging
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700"
                } rounded-lg shadow-lg transition-all duration-200 hover:bg-green-500`}
                onClick={() => {
                  setIsEditing(false);
                  setIsEmailChanging(true);
                  setIsPasswordChanging(false);
                }}
              >
                Change Email
              </button>
              <button
                className={`py-2 px-5 ${
                  isPasswordChanging
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 text-gray-700"
                } rounded-lg shadow-lg transition-all duration-200 hover:bg-yellow-400`}
                onClick={() => {
                  setIsEditing(false);
                  setIsEmailChanging(false);
                  setIsPasswordChanging(true);
                }}
              >
                Change Password
              </button>
            </div>

            {/* Edit Profile Form */}
            {isEditing && (
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold">
                    Address:
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={company.address}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold">
                    City:
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={company.city}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold">
                    Description:
                  </label>
                  <textarea
                    name="description"
                    value={company.description}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold">
                    Contact Number:
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={company.contactNumber}
                    onChange={handleChange}
                    pattern="[0-9]{10,11}"
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Change Email Form */}
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

            {/* Change Password Form */}
            {isPasswordChanging && (
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold">
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
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
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
                  <label className="block text-gray-700 font-semibold">
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
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
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
                  <label className="block text-gray-700 font-semibold">
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
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
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
                onClick={closeCompSettings}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg transition duration-200 shadow-md"
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
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg transition duration-200 shadow-md transform hover:scale-105"
              >
                {isEditing
                  ? "Update Profile"
                  : isEmailChanging
                  ? "Save New Email"
                  : "Save New Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivation Modal */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-10 rounded-xl shadow-2xl max-w-lg w-full relative">
            {/* Icon Background */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full shadow-lg">
                <span className="material-symbols-outlined text-red-600 text-5xl">
                  warning
                </span>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mt-10 mb-6">
              <h2 className="text-3xl font-semibold text-gray-800 leading-snug">
                Are you sure?
              </h2>
              <p className="text-gray-600 mt-4 text-md">
                Deactivating your account is permanent and cannot be undone.
              </p>
            </div>

            {/* Button Section */}
            <div className="flex justify-center space-x-4 mt-8">
              <button
                onClick={() => setIsDeactivateModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeactivate}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Confirmation Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 leading-snug">
                Account Deactivation
              </h2>
              <p className="text-lg text-gray-600 mt-2">
                Enter your password to confirm account deactivation.
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={deactivationPasswordVisible ? "text" : "password"}
                  value={deactivationPassword}
                  onChange={(e) => setDeactivationPassword(e.target.value)}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  onClick={() =>
                    setDeactivationPasswordVisible(!deactivationPasswordVisible)
                  }
                >
                  <span className="material-symbols-outlined">
                    {deactivationPasswordVisible
                      ? "visibility"
                      : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-gray-600 font-medium mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  onClick={() =>
                    setConfirmPasswordVisible(!confirmPasswordVisible)
                  }
                >
                  <span className="material-symbols-outlined">
                    {confirmPasswordVisible ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={closePasswordModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateCompany} // Calls deactivation function
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Confirm Deactivation
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
