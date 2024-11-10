import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const UserProf = () => {
  const [user, setUser] = useState({
    fullName: "",
    disability: "",
    city: "",
    address: "",
    contactNumber: "",
    gender: "",
    birthdate: "",
    email: "",
    profilePicture: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false); // Controls first warning modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // Controls second password modal
  const [deactivationPassword, setDeactivationPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  const [deactivationPasswordVisible, setDeactivationPasswordVisible] =
    useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [isEditing, setIsEditing] = useState(true);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] =
    useState(false);
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

  const checkUserStatus = async () => {
    const userId = localStorage.getItem("Id");
    try {
      const response = await axios.get(`/user/view/verify/status/${userId}`);
      if (
        response.data.successful &&
        response.data.message === "User is Deactivated"
      ) {
        toast.error("Your account has been deactivated. Logging out.", {
          duration: 5000, // Display the toast for 5 seconds
        });

        // Wait for the toast to finish before logging out HAHAHA
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 3000); // Wait for 5 seconds (the toast duration)
      }
    } catch (error) {
      toast.error("Failed to check user status.");
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("Id");
    const config = {
      method: "get",
      url: `/user/view/${userId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response) {
        const userData = response.data.data;
        setUser({
          firstName: userData.first_name,
          middleInitial: userData.middle_initial || "",
          lastName: userData.last_name,
          disability: userData.type,
          city: userData.city,
          address: userData.address,
          contactNumber: userData.contact_number,
          gender: userData.gender,
          birthdate: new Date(userData.birth_date).toLocaleDateString("en-US"),
          email: userData.email,
          profilePicture: `data:image/png;base64,${userData.formal_picture}`,
        });
      })
      .catch(function (error) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      });

    const interval = setInterval(() => {
      checkUserStatus();
    }, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const MAX_FILE_SIZE = 16777215; // 16MB

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      if (file.size <= MAX_FILE_SIZE) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result.split(",")[1];
          setUser((prevState) => ({
            ...prevState,
            profilePicture: base64Data,
          }));
        };
        reader.readAsDataURL(file);
        toast.success("Profile picture uploaded successfully!");
      } else {
        toast.error("File size exceeds 16MB. Please upload a smaller file.");
      }
    } else {
      toast.error("Please upload a jpeg/png file.");
    }
  };

  const handleProfilePictureEdit = () => {
    setIsProfilePictureModalOpen(true);
  };

  const handleProfilePictureSubmit = () => {
    const userId = localStorage.getItem("Id");
    const config = {
      method: "put",
      url: `/user/update/picture/${userId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        formal_picture: user.profilePicture,
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
    setUser({ ...user, [e.target.name]: e.target.value });
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
  const handleEmailModal = () => {
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handlePasswordUpdate = () => {
    const userId = localStorage.getItem("Id");

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
      url: `/user/update/password/${userId}`,
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

  const handleUpdate = () => {
    setIsModalOpen(false);

    const updateUserProfile = JSON.stringify({
      address: user.address,
      city: user.city,
      contact_number: user.contactNumber,
    });

    const userId = localStorage.getItem("Id");
    const config = {
      method: "put",
      url: `/user/update/${userId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: updateUserProfile,
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

  const [newEmail, setNewEmail] = useState("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleUserEmailUpdate = () => {
    const userId = localStorage.getItem("Id");

    const data = JSON.stringify({
      email: newEmail,
      password: currentPasswordForEmail,
    });

    const config = {
      method: "put",
      url: `/user/update/email/${userId}`,
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

  const handleDeactivateUser = () => {
    const userId = localStorage.getItem("Id");

    // Validate that both passwords match before making the request
    if (deactivationPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please try again.");
      return;
    }

    const config = {
      method: "put",
      url: `/user/update/deactivate/${userId}`,
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
        confirmLogout(); // Log out the user after deactivation
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "Failed to deactivate account.";
        toast.error(errorMessage);
      });
  };

  const handleOpenDeactivateModal = () => {
    setIsDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = () => {
    setIsDeactivateModalOpen(false); // Close warning modal
    setIsPasswordModalOpen(true); // Open password modal
  };

  const closeDeactivateModal = () => {
    setIsDeactivateModalOpen(false);
    setDeactivationPassword(""); // Clear password field
  };
  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setDeactivationPassword("");
    setConfirmPassword("");
    setDeactivationPasswordVisible(false);
    setConfirmPasswordVisible(false);
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
    <div className="max-w-4xl mx-auto mb-10 mt-10 p-8 bg-white rounded-lg shadow-xl">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-8">
        {/* Profile Picture with Edit Button */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-full h-full rounded-full border-4 border-blue-700 shadow-lg object-cover"
          />
          <button
            onClick={handleProfilePictureEdit}
            className="absolute bottom-1 right-1 bg-white border border-gray-300 rounded-full p-1 shadow-md"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>

        {/* User Information and Google Options Button */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {user.firstName &&
              user.lastName &&
              `${
                user.firstName.charAt(0).toUpperCase() +
                user.firstName.slice(1).toLowerCase()
              } ${
                user.middleInitial
                  ? user.middleInitial.charAt(0).toUpperCase() + ". "
                  : ""
              }${
                user.lastName.charAt(0).toUpperCase() +
                user.lastName.slice(1).toLowerCase()
              }`}
          </h2>
          <div className="flex justify-center md:justify-start mt-2">
            <p className="bg-blue-100 text-blue-700 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded">
              Disability:
            </p>
            <p className="text-gray-600">{user.disability}</p>
          </div>
          <button
            onClick={() => setIsOptionsModalOpen(true)}
            className="w-full md:w-auto mt-4 px-3 py-1.5 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-lg mr-1.5">
              settings
            </span>
            Settings
          </button>
        </div>

        {/* Back and Logout Buttons */}
        <div className="flex flex-row md:flex-row md:items-center md:space-x-4 space-x-4 space-y-0 mt-4 md:mt-0">
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

      {/* Profile Details Card */}
      <div className="mt-8 p-8 bg-gray-50 rounded-lg shadow-2xl">
        <h2 className="text-2xl font-bold text-custom-blue mb-6">
          Profile Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left text-gray-800">
          <div>
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="material-symbols-outlined text-xl text-black mr-3">
                  home
                </span>
                Address:
              </p>
              <p className="text-gray-600 bg-gray-200 p-5 rounded-lg shadow-inner capitalize">
                {user.address}
              </p>
            </div>
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="material-symbols-outlined text-xl text-black mr-3">
                  location_city
                </span>
                City:
              </p>
              <p className="text-gray-600 bg-gray-200 p-5 rounded-lg shadow-inner">
                {user.city
                  .split(" ")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ")}
              </p>
            </div>
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="material-symbols-outlined text-xl text-black mr-3">
                  phone
                </span>
                Contact Number:
              </p>
              <p className="text-gray-600 bg-gray-200 p-5 rounded-lg shadow-inner">
                {user.contactNumber}
              </p>
            </div>
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="material-symbols-outlined text-xl text-black mr-3">
                  person
                </span>
                Gender:
              </p>
              <p className="text-gray-600 bg-gray-200 p-5 rounded-lg shadow-inner capitalize">
                {user.gender}
              </p>
            </div>
          </div>
          <div>
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="material-symbols-outlined text-xl text-black mr-3">
                  calendar_today
                </span>
                Birthdate:
              </p>
              <p className="text-gray-600 bg-gray-200 p-5 rounded-lg shadow-inner">
                {user.birthdate}
              </p>
            </div>
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="material-symbols-outlined text-xl text-black mr-3">
                  email
                </span>
                Email:
              </p>
              <p className="text-gray-600 bg-gray-200 p-5 rounded-lg shadow-inner">
                {user.email}
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
                Update Profile Picture
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
                Select a new profile picture:
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
                Update Picture
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
                Enter your current password to confirm account deactivation.
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
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500"
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
                onClick={handleDeactivateUser} // Calls deactivation function
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
                manage your account.
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

      <div>
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full">
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  {isEditing
                    ? "Edit Profile"
                    : isChangingEmail
                    ? "Change Email"
                    : "Change Password"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 focus:outline-none"
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
              <div className="flex justify-between mb-6">
                <button
                  className={`py-2 px-4 rounded-lg font-semibold ${
                    isEditing
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => {
                    setIsEditing(true);
                    setIsChangingEmail(false);
                  }}
                >
                  Edit Profile
                </button>
                <button
                  className={`py-2 px-4 rounded-lg font-semibold ${
                    isChangingEmail
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => {
                    setIsEditing(false);
                    setIsChangingEmail(true);
                  }}
                >
                  Change Email
                </button>
                <button
                  className={`py-2 px-4 rounded-lg font-semibold ${
                    !isEditing && !isChangingEmail
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => {
                    setIsEditing(false);
                    setIsChangingEmail(false);
                  }}
                >
                  Change Password
                </button>
              </div>

              {/* Conditional Content */}
              {isEditing ? (
                // Edit Profile Form
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-gray-600 font-semibold">
                      Address:
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={user.address}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold">
                      City:
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={user.city}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold">
                      Contact Number:
                    </label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={user.contactNumber}
                      onChange={handleChange}
                      pattern="[0-9]{10,11}"
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-inner"
                    />
                  </div>
                </div>
              ) : isChangingEmail ? (
                // Change Email Form
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-gray-600 font-semibold">
                      New Email:
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold">
                      Current Password:
                    </label>
                    <div className="relative">
                      <input
                        type={
                          passwordVisibility.currentPassword
                            ? "text"
                            : "password"
                        }
                        value={currentPasswordForEmail}
                        onChange={(e) =>
                          setCurrentPasswordForEmail(e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-inner"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 text-gray-500"
                        onClick={() =>
                          setPasswordVisibility({
                            ...passwordVisibility,
                            currentPassword:
                              !passwordVisibility.currentPassword,
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
              ) : (
                // Change Password Form
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-gray-600 font-semibold">
                      Current Password:
                    </label>
                    <div className="relative">
                      <input
                        type={
                          passwordVisibility.currentPassword
                            ? "text"
                            : "password"
                        }
                        name="currentPassword"
                        value={passwords.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-inner"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 text-gray-500"
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
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-inner"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 text-gray-500"
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
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-inner"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 text-gray-500"
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
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={
                    isEditing
                      ? handleUpdate
                      : isChangingEmail
                      ? handleUserEmailUpdate
                      : handlePasswordUpdate
                  }
                  className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  {isEditing
                    ? "Update Profile"
                    : isChangingEmail
                    ? "Save New Email"
                    : "Save New Password"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isOptionsModalOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
              {/* Header */}
              <div className="flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-blue-600 text-4xl mr-2">
                  settings
                </span>
                <h2 className="text-3xl font-semibold text-gray-800">
                  Account Settings
                </h2>
              </div>

              {/* Card Container for Option Buttons with Enhanced Inner Shadow */}
              <div
                className="bg-gray-100 p-6 rounded-lg shadow-lg"
                style={{
                  boxShadow: "inset 0 4px 10px rgba(0, 0, 0, 0.2)", // Custom inner shadow
                }}
              >
                <div className="flex flex-col space-y-5">
                  <button
                    onClick={() => {
                      setIsOptionsModalOpen(false);
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
                      setIsOptionsModalOpen(false);
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
                      setIsOptionsModalOpen(false);
                      handleEmailModal();
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
                      setIsOptionsModalOpen(false);
                      setIsDeactivateModalOpen(true); // Open Deactivate Account modal
                    }}
                    className="w-full px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-lg hover:bg-red-600 hover:shadow-xl transition duration-300 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-xl mr-2">
                      warning
                    </span>
                    Deactivate Account
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setIsOptionsModalOpen(false)} // Close options modal
                  className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow hover:bg-gray-400 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Changing Email */}
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

              <div className="grid grid-cols-1 gap-6">
                {/* Email and Password fields */}
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
                  <div className="relative">
                    <input
                      type={
                        passwordVisibility.currentPassword ? "text" : "password"
                      }
                      value={currentPasswordForEmail}
                      onChange={(e) =>
                        setCurrentPasswordForEmail(e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center"
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

              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleUserEmailUpdate}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Save New Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProf;
