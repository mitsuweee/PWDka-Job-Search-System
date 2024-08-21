import { useState, useEffect } from 'react';
import axios from 'axios';

const UserProf = () => {
  const [user, setUser] = useState({
    profilePicture: '',
    fullName: '',
    disability: '',
    location: '',
    contactNumber: '',
    gender: '',
    birthdate: '',
    email: '',
    pictureWithId: '',
    pictureOfId: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
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
        setUser ({
          fullName: response.data.data[0].full_name,
          disability: response.data.data[0].type,
          location: response.data.data[0].Location,
          contactNumber: response.data.data[0].contact_number,
          gender: response.data.data[0].gender,
          birthdate: new Date(response.data.data[0].birth_date).toLocaleDateString('en-US'),
          email: response.data.data[0].email,
          pictureWithId: 'https://via.placeholder.com/150', // change this kapag maayos na
          pictureOfId: 'https://via.placeholder.com/150',
          profilePicture: 'https://via.placeholder.com/150'
        })


      })
      .catch(function (error) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log(error.response?.data);
        alert(errorMessage);
      });
    console.log('Component is ready');
    
    // Any additional logic you want to execute on document ready can go here
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setUser({ ...user, [e.target.name]: URL.createObjectURL(e.target.files[0]) });
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleUpdate = () => {
    setIsEditing(false);
    alert('Profile updated successfully!');
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
          <p className="bg-blue-100 text-blue-700 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded">Disability:</p>
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
            <p className="text-lg font-semibold text-gray-800">Location:</p>
            <p className="text-gray-600">{user.location}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">Contact Number:</p>
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
              <p className="text-lg font-semibold text-gray-800">Picture with ID</p>
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
              <p className="text-lg font-semibold text-gray-800">Picture of ID</p>
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
                <label className="block text-gray-600 font-semibold">Address:</label>
                <input
                  type="text"
                  name="address"
                  value={user.address}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-600 font-semibold">City:</label>
                <input
                  type="text"
                  name="city"
                  value={user.city}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-600 font-semibold">Contact Number:</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={user.contactNumber}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-600 font-semibold">Gender:</label>
                <input
                  type="text"
                  name="gender"
                  value={user.gender}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                  disabled
                />
              </div>
            </div>
            <div>
              <div className="mb-6">
                <label className="block text-gray-600 font-semibold">Birthdate:</label>
                <input
                  type="date"
                  name="birthdate"
                  value={user.birthdate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                  disabled
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-600 font-semibold">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                  disabled
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-600 font-semibold">Password:</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={user.password}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 px-3 text-gray-600 hover:text-gray-800"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-600 font-semibold">Picture with ID:</label>
                <input
                  type="file"
                  name="pictureWithId"
                  accept="image/png, image/jpeg"
                  onChange={handleFileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-600 font-semibold">Picture of ID:</label>
                <input
                  type="file"
                  name="pictureOfId"
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
