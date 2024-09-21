import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast"; // Import toast

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

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const userId = sessionStorage.getItem("Id");
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
          fullName: userData.full_name,
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
        console.log(error.response?.data);
        toast.error(errorMessage); // Show error toast instead of alert
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
        toast.success("Profile picture uploaded successfully!"); // Success toast for file upload
      } else {
        toast.error("File size exceeds 16MB. Please upload a smaller file."); // Error toast for large file
      }
    } else {
      toast.error("Please upload a jpeg/png file."); // Error toast for invalid file type
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handlePasswordToggle = () => {
    setIsChangingPassword(!isChangingPassword);
  };

  const handlePasswordUpdate = () => {
    const userId = sessionStorage.getItem("Id");

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      toast.error("New password and confirm new password do not match."); // Error toast for password mismatch
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
      .then(function (response) {
        toast.success("Password updated successfully!"); // Success toast for password update
        console.log(JSON.stringify(response.data));
        setIsChangingPassword(false);
      })
      .catch(function (error) {
        console.log(error);
        toast.error(
          "Failed to update password. Please check your current password."
        ); // Error toast for password update failure
      });
  };

  const handleUpdate = () => {
    setIsEditing(false);

    const updateUserProfile = JSON.stringify({
      address: user.address,
      city: user.city,
      contact_number: user.contactNumber,
      formal_picture: user.profilePicture,
    });

    const userId = sessionStorage.getItem("Id");
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
        toast.success(response.data.message); // Success toast for profile update
      })
      .catch(function (error) {
        console.log(error);
        toast.error(error.response.data.message || "An error occurred"); // Error toast for profile update failure
      });

    setTimeout(() => {
      window.location.reload();
    }, 2000); // Reload the page after 2 seconds
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      sessionStorage.removeItem("Id");
      sessionStorage.removeItem("Role");
      navigate("/login");
      toast.success("Logged out successfully!"); // Success toast for logout
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
      <Toaster position="top-center" reverseOrder={false} />{" "}
      {/* Toaster for showing toast notifications */}
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-blue-700 shadow-lg"
          />
          <div className="ml-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {user.fullName}
            </h2>
            <div className="flex mt-2">
              <p className="bg-blue-100 text-blue-700 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded">
                Disability:
              </p>
              <p className="text-gray-600">{user.disability}</p>
            </div>
            <div className="flex mt-4">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl mr-2 flex-shrink-0">
                  edit
                </span>
                <span className="inline-block">Edit Profile</span>
              </button>

              <button
                onClick={handlePasswordToggle}
                className="ml-4 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition duration-300 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl mr-2">
                  lock
                </span>
                <span>Change Password</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex mt-4">
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-gray-200 text-blue-900 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-300 mr-4"
          >
            Back
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300 flex items-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">
              logout
            </span>
            <span>Logout</span>
          </button>
        </div>
      </div>
      {/* User Details Section */}
      <div className="mt-8 grid grid-cols-2 gap-8 text-left text-gray-800">
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="material-symbols-outlined text-2xl mr-2">
                home
              </span>
              <span>Address:</span>
            </p>
            <p className="text-gray-600 bg-gray-200 p-5 rounded-lg">
              {user.address}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="material-symbols-outlined text-2xl mr-2">
                location_city
              </span>
              <span>City:</span>
            </p>
            <p className="text-gray-600 bg-gray-200 p-5 rounded-lg">
              {user.city}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="material-symbols-outlined text-2xl mr-2">
                phone
              </span>
              <span>Contact Number:</span>
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
              <span>Gender:</span>
            </p>
            <p className="text-gray-600 bg-gray-200 p-5 rounded-lg">
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
              <span>Birthdate:</span>
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
              <span>Email:</span>
            </p>
            <p className="text-gray-600 bg-gray-200 p-5 rounded-md">
              {user.email}
            </p>
          </div>
        </div>
      </div>
      {/* Edit Mode */}
      {isEditing && (
        <div className="mt-8">
          {/* Editable Fields */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
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
              <div className="mb-6">
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
              <div className="mb-6">
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
            <div>
              <div className="mb-6">
                <label className="block text-gray-600 font-semibold">
                  Profile Picture:
                </label>
                <input
                  type="file"
                  name="profilePicture"
                  accept="image/png, image/jpeg"
                  onChange={handleFileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleUpdate}
            className="w-full py-3 mt-6 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300"
          >
            Update Profile
          </button>
        </div>
      )}
      {/* Change Password Section */}
      {isChangingPassword && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Change Password
          </h3>
          <div className="mb-6">
            <label className="block text-gray-600 font-semibold">
              Current Password:
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-600 font-semibold">
              New Password:
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-600 font-semibold">
              Confirm New Password:
            </label>
            <input
              type="password"
              name="confirmNewPassword"
              value={passwords.confirmNewPassword}
              onChange={handlePasswordChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
            />
          </div>
          <button
            onClick={handlePasswordUpdate}
            className="w-full py-3 mt-6 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition duration-300"
          >
            Save New Password
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProf;
