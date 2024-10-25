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

  const handleEdit = () => {
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handlePasswordToggle = () => {
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
      .catch(function () {
        toast.error(
          "Failed to update password. Please check your current password."
        );
      });
  };

  const handleUpdate = () => {
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
    <div className="max-w-4xl mx-auto mb-10 mt-10 p-8 bg-white rounded-lg shadow-lg">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="relative w-24 h-24">
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-full h-full rounded-full border-4 border-blue-700 shadow-lg object-cover"
          />
          <button
            onClick={handleProfilePictureEdit}
            className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 bg-white border border-gray-300 rounded-full p-2 shadow-md"
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
    </div>
  );
};

export default UserProf;
