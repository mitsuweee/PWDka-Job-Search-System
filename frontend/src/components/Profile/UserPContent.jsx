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

  //deactivation modals
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false); // Controls first warning modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // Controls second password modal
  const [deactivationPassword, setDeactivationPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deactivationPasswordVisible, setDeactivationPasswordVisible] =
    useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  //edit profile, change email and change password modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [isEmailChanging, setIsEmailChanging] = useState(false);
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

  const [newEmail, setNewEmail] = useState("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");

  // Toggle to edit profile
  const handleEdit = () => {
    setIsEditing(true);
    setIsPasswordChanging(false);
    setIsEmailChanging(false);
    setIsModalOpen(true);
  };

  // Toggle to change password
  const handlePasswordToggle = () => {
    setIsEditing(false);
    setIsPasswordChanging(true);
    setIsEmailChanging(false);
    setIsModalOpen(true);
  };

  // Toggle to change email
  const handleEmailToggle = () => {
    setIsEditing(false);
    setIsPasswordChanging(false);
    setIsEmailChanging(true);
    setIsModalOpen(true);
  };

  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] =
    useState(false);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

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
    <div className="max-w-4xl mx-auto mb-10 mt-10 p-8 bg-white rounded-lg shadow-lg">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="relative w-32 h-32">
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

        <div className="ml-6">
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
          <div className="flex mt-2">
            <p className="bg-blue-100 text-blue-700 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded">
              Disability:
            </p>
            <p className="text-gray-600">{user.disability}</p>
          </div>
          <div className="flex flex-col md:flex-row mt-4 space-y-2 md:space-y-0 md:space-x-4">
            <button
              onClick={handleEdit}
              className="w-full md:w-auto px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg mr-2">
                edit
              </span>
              Edit Profile
            </button>

            <button
              onClick={handlePasswordToggle}
              className="w-full md:w-auto px-5 py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition duration-200 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg mr-2">
                lock
              </span>
              Change Password
            </button>

            <button
              onClick={() => setIsDeactivateModalOpen(true)}
              className="w-full md:w-auto px-5 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-200 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg mr-2">
                cancel
              </span>
              Deactivate Account
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

      {/* Profile Details */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left text-gray-800">
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="material-symbols-outlined text-2xl mr-2">
                home
              </span>
              Address:
            </p>
            <p className="text-gray-600 bg-gray-200 p-5 rounded-lg capitalize">
              {user.address}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="material-symbols-outlined text-2xl mr-2">
                location_city
              </span>
              City:
            </p>
            <p className="text-gray-600 bg-gray-200 p-5 rounded-lg">
              {user.city
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
              <span className="material-symbols-outlined text-2xl mr-2">
                phone
              </span>
              Contact Number:
            </p>
            <p className="text-gray-600 bg-gray-200 p-5 rounded-lg">
              {user.contactNumber}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="material-symbols-outlined text-2xl mr-2">
                person
              </span>
              Gender:
            </p>
            <p className="text-gray-600 bg-gray-200 p-5 rounded-lg capitalize">
              {user.gender}
            </p>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="material-symbols-outlined text-2xl mr-2">
                calendar_today
              </span>
              Birthdate:
            </p>
            <p className="text-gray-600 bg-gray-200 p-5 rounded-lg">
              {user.birthdate}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="material-symbols-outlined text-2xl mr-2">
                email
              </span>
              Email:
            </p>
            <p className="text-gray-600 bg-gray-200 p-5 rounded-md">
              {user.email}
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
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 leading-snug">
                Are you sure you want to deactivate your account?
              </h2>
              <p className="text-lg text-gray-600 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsDeactivateModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeactivate}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
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
                    value={user.address}
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
                    value={user.city}
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
                    value={user.contactNumber}
                    onChange={handleChange}
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
                    : handleUserEmailUpdate
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
    </div>
  );
};

export default UserProf;
