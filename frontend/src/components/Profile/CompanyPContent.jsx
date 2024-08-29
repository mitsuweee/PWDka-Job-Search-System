import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CompanyProf = () => {
  const [company, setCompany] = useState({
    logo: "",
    name: "",
    email: "",
    description: "",
    address: "",
    city: "",
    contactNumber: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false); // State for changing password
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
          email: companyData.email,
          description: companyData.description,
          address: companyData.address,
          city: companyData.city,
          contactNumber: companyData.contact_number,
        });
        console.log(companyData);
      })
      .catch(function (error) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log(error.response?.data);
        alert(errorMessage);
      });
    console.log("Component is ready");
  }, []);

  const MAX_FILE_SIZE = 16777215; // 16,777,215 bytes (16MB)

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      if (file.size <= MAX_FILE_SIZE) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result.split(",")[1]; // Remove the prefix
          console.log(base64Data);
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
      profile_picture: company.logo, // This now contains the base64 string
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
        console.log(JSON.stringify());
        alert(response.data.message);
      })
      .catch(function (error) {
        console.log(error);
        alert(error.response.data.message);
      });
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page
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
            <button
              onClick={handleEdit}
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              Edit Profile
            </button>
            <button
              onClick={handlePasswordToggle}
              className="mt-4 ml-4 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition duration-300"
            >
              Change Password
            </button>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-gray-200 text-blue-900 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-300"
          >
            Back
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
            <p className="text-lg font-semibold text-gray-800">Name:</p>
            <p className="text-gray-600 bg-gray-400 p-5 rounded-lg">
              {company.name}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">Address:</p>
            <p className="text-gray-600 bg-gray-400 p-5 rounded-lg">
              {company.address}
            </p>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">City:</p>
            <p className="text-gray-600 bg-gray-400 p-5 rounded-lg">
              {company.city}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">
              Contact Number:
            </p>
            <p className="text-gray-600 bg-gray-400 p-5 rounded-lg">
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
                  Email:
                </label>
                <input
                  type="text"
                  name="name"
                  value={company.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                />
              </div>
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
          <button className="w-full py-3 mt-6 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition duration-300">
            Save New Password
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyProf;
