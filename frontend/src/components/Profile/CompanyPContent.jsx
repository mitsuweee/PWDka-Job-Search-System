import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CompanyProf = () => {
  const [company, setCompany] = useState({
    logo: "",
    name: "",
    description: "",
    address: "",
    city: "",
    contactNumber: "",
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
      url: `/company/view/${userId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response) {
        const companyData = response.data.data;

        setCompany({
          profile_picture: companyData.profile_picture, // Assuming the logo is returned as a base64 string
          name: companyData.name,
          description: companyData.description,
          address: companyData.address,
          city: companyData.city,
          contactNumber: companyData.contact_number,
        });
      })
      .catch(function (error) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        alert(errorMessage);
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
      } else {
        alert("File size exceeds 16MB. Please upload a smaller file.");
      }
    } else {
      alert("Please upload a jpeg/png file.");
    }
  };

  const handleChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
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

  const handleUpdate = () => {
    setIsEditing(false);

    const updateCompanyProfile = JSON.stringify({
      name: company.name,
      address: company.address,
      city: company.city,
      description: company.description,
      contact_number: company.contactNumber,
      profile_picture: company.logo,
    });

    const companyId = sessionStorage.getItem("Id");
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
        alert(response.data.message);
      })
      .catch(function (error) {
        alert(error.response.data.message);
      });
    window.location.reload();
  };

  const handlePasswordUpdate = () => {
    const companyId = sessionStorage.getItem("Id");

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      alert("New password and confirm new password do not match.");
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
        alert("Password updated successfully.");
        setIsChangingPassword(false);
      })
      .catch(function () {
        alert("Failed to update password. Please check your current password.");
      });
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
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={`data:image/png;base64,${company.profile_picture}`}
            alt="Company Logo"
            className="w-24 h-24 rounded-full border-4 border-blue-700 shadow-lg"
          />
          <div className="ml-6">
            <h2 className="text-3xl font-bold text-gray-900">{company.name}</h2>
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

      {/* Company Description */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800">About</h3>
        <p className="text-gray-700 mt-2">{company.description}</p>
      </div>

      {/* Company Details Section */}
      <div className="mt-8 grid grid-cols-2 gap-8 text-left text-gray-800">
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="material-symbols-outlined text-xl mr-2">
                business
              </span>
              <span>Name:</span>
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
              <span>Address:</span>
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
              <span>City:</span>
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
              <span>Contact Number:</span>
            </p>
            <p className="text-gray-600 bg-gray-200 p-5 rounded-lg">
              {company.contactNumber}
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
                  value={company.address}
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
                  value={company.city}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                />
              </div>
            </div>
            <div>
              <div className="mb-6">
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
              <div className="mb-6">
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
              <div className="mb-6">
                <label className="block text-gray-600 font-semibold">
                  Logo:
                </label>
                <input
                  type="file"
                  name="logo"
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

export default CompanyProf;
