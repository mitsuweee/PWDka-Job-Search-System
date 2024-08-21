import { useState } from 'react';

const CompanyProf = () => {
  const [company, setCompany] = useState({
    logo: 'https://via.placeholder.com/150',  // Placeholder image URL
    name: 'Tech Innovators Inc.',
    email: 'info@techinnovators.com',
    description: 'Leading company in the tech industry, providing cutting-edge solutions and services worldwide.',
    address: '123 Innovation Way',
    city: 'Silicon Valley',
    contactNumber: '+1 800 123 4567',
    password: 'SecureP@ssw0rd',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setCompany({ ...company, logo: URL.createObjectURL(e.target.files[0]) });
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleUpdate = () => {
    setIsEditing(false);
    alert('Company profile updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
      {/* Header Section */}
      <div className="flex items-center">
        <img
          src={company.logo}
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
            <p className="text-lg font-semibold text-gray-800">Email:</p>
            <p className="text-gray-600">{company.email}</p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">Address:</p>
            <p className="text-gray-600">{company.address}</p>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">City:</p>
            <p className="text-gray-600">{company.city}</p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">Contact Number:</p>
            <p className="text-gray-600">{company.contactNumber}</p>
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
                <label className="block text-gray-600 font-semibold">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={company.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-600 font-semibold">Address:</label>
                <input
                  type="text"
                  name="address"
                  value={company.address}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                />
              </div>
            </div>
            <div>
              <div className="mb-6">
                <label className="block text-gray-600 font-semibold">City:</label>
                <input
                  type="text"
                  name="city"
                  value={company.city}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-600 font-semibold">Contact Number:</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={company.contactNumber}
                  onChange={handleChange}
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

export default CompanyProf;
