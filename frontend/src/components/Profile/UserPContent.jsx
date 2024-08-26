import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    pictureWithId: "",
    pictureOfId: "",
    profilePicture: "",
  });

  const [isEditing, setIsEditing] = useState(false);
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
        console.log(userData);

        setUser({
          fullName: userData.full_name,
          disability: userData.type,
          city: userData.city,
          address: userData.address,
          contactNumber: userData.contact_number,
          gender: userData.gender,
          birthdate: new Date(userData.birth_date).toLocaleDateString("en-US"),
          email: userData.email,
          pictureWithId: "https://via.placeholder.com/150",
          pictureOfId: "https://via.placeholder.com/150",
          profilePicture: userData.formal_picture || "", // Ensure it's a valid base64 string or set to an empty string
        });
      })
      .catch(function (error) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log(error.response?.data);
        alert(errorMessage);
      });
    console.log("Component is ready");
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      if (file.size <= 16777215) {
        // 16MB
        const reader = new FileReader();
        reader.onloadend = () => {
          // Convert file to base64 string and update the user state
          setUser({
            ...user,
            [e.target.name]: reader.result.split(",")[1], // Store the base64 string without the prefix
          });
        };
        reader.readAsDataURL(file); // Read file as base64 string
      } else {
        alert("File size exceeds 16MB. Please upload a smaller image.");
        setUser({
          ...user,
          [e.target.name]: null,
        });
      }
    } else {
      alert("Please upload a PNG or JPEG image file.");
      setUser({
        ...user,
        [e.target.name]: null,
      });
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdate = () => {
    setIsEditing(false);

    const updateUserProfile = JSON.stringify({
      address: user.address,
      city: user.city,
      contact_number: user.contactNumber,
      formal_picture: user.profilePicture, // This now contains the base64 string
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
        console.log(JSON.stringify(response.data));
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
            src={
              user.profilePicture
                ? `data:image/png;base64,${user.profilePicture}`
                : "https://via.placeholder.com/150"
            }
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
            <button
              onClick={handleEdit}
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              Edit Profile
            </button>
          </div>
        </div>
        <button
          onClick={handleGoBack}
          className="mt-4 px-4 py-2 bg-gray-200 text-blue-900 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-300"
        >
          Back
        </button>
      </div>

      {/* User Details Section */}
      <div className="mt-8 grid grid-cols-2 gap-8 text-left text-gray-800">
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">Address:</p>
            <p className="text-gray-600 bg-gray-400 p-5 rounded-lg">
              {user.address}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">City:</p>
            <p className="text-gray-600 bg-gray-400 p-5 rounded-lg">
              {user.city}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">
              Contact Number:
            </p>
            <p className="text-gray-600 bg-gray-400 p-5 rounded-lg">
              {user.contactNumber}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">Gender:</p>
            <p className="text-gray-600 bg-gray-400 p-5 rounded-lg">
              {user.gender}
            </p>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">Birthdate:</p>
            <p className="text-gray-600 bg-gray-400 p-5 rounded-lg">
              {user.birthdate}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">Email:</p>
            <p className="text-gray-600 bg-gray-400 p-5 rounded-md">
              {user.email}
            </p>
          </div>

          <div className="flex justify-between mt-6">
            <div className="w-1/2 pr-2">
              <p className="text-lg font-semibold text-gray-800">
                Picture with ID
              </p>
              {user.pictureWithId ? (
                <img
                  src={user.pictureWithId}
                  alt="Picture with ID"
                  className="rounded-lg shadow-md mt-2"
                />
              ) : (
                <div className="bg-gray-100 text-gray-600 py-6 rounded-lg mt-2">
                  Picture with ID
                </div>
              )}
            </div>
            <div className="w-1/2 pl-2">
              <p className="text-lg font-semibold text-gray-800">
                Picture of ID
              </p>
              {user.pictureOfId ? (
                <img
                  src={user.pictureOfId}
                  alt="Picture of ID"
                  className="rounded-lg shadow-md mt-2"
                />
              ) : (
                <div className="bg-gray-100 text-gray-600 py-6 rounded-lg mt-2">
                  Picture of ID
                </div>
              )}
            </div>
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
    </div>
  );
};

export default UserProf;
