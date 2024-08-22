import { useState, useEffect } from "react";
import axios from "axios";

const UserProf = () => {
  const [user, setUser] = useState({
    profilePicture: "",
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
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        console.log(response.data.data);
        setUser({
          fullName: response.data.data[0].full_name,
          disability: response.data.data[0].type,
          city: response.data.data[0].city,
          address: response.data.data[0].address,
          contactNumber: response.data.data[0].contact_number,
          gender: response.data.data[0].gender,
          birthdate: new Date(
            response.data.data[0].birth_date
          ).toLocaleDateString("en-US"),
          email: response.data.data[0].email,
          pictureWithId: "https://via.placeholder.com/150",
          pictureOfId: "https://via.placeholder.com/150",
          profilePicture: "https://via.placeholder.com/150",
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

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: URL.createObjectURL(e.target.files[0]),
    });
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
      formal_picture: user.profilePicture,
    });
    const userId = sessionStorage.getItem("Id");
    var config = {
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

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
      {/* Header Section */}
      <div className="flex items-center">
        <img
          src={user.profilePicture}
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-blue-700 shadow-lg"
        />
        <div className="ml-6">
          <h2 className="text-3xl font-bold text-gray-900">{user.fullName}</h2>
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

      {/* User Details Section */}
      <div className="mt-8 grid grid-cols-2 gap-8 text-left text-gray-800">
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">Address:</p>
            <p className="text-gray-600">{user.address}</p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">City:</p>
            <p className="text-gray-600">{user.city}</p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">
              Contact Number:
            </p>
            <p className="text-gray-600">{user.contactNumber}</p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">Gender:</p>
            <p className="text-gray-600">{user.gender}</p>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">Birthdate:</p>
            <p className="text-gray-600">{user.birthdate}</p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">Email:</p>
            <p className="text-gray-600">{user.email}</p>
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
