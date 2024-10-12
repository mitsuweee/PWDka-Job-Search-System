import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
  const [user, setUser] = useState(null); // Store the specific user to view
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Control sidebar visibility for mobile
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all users
    const config = {
      method: "get",
      url: "http://localhost:8080/admin/view/users", // Fetch users from your API
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        const userDataArray = response.data.data;
        setUsers(userDataArray);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  // Fetch and show user details in the modal
  const handleViewUser = (userId) => {
    const config = {
      method: "get",
      url: `http://localhost:8080/user/view/${userId}`, // Fetch specific user by ID
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        const userData = response.data.data; // Assuming the user object is returned
        setUser(formatUserData(userData)); // Set the user details
        setIsModalOpen(true); // Open the modal
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Helper function to format user data
  const formatUserData = (userData) => {
    return {
      id: userData.id,
      fullName: userData.full_name,
      disability: userData.type,
      address: userData.address,
      city: userData.city,
      birthdate: new Date(userData.birth_date).toLocaleDateString("en-US"),
      contactNumber: userData.contact_number,
      email: userData.email,
      profilePicture: `data:image/png;base64,${userData.formal_picture}`,
      pictureWithId: `data:image/png;base64,${userData.picture_with_id}`,
      pictureOfPwdId: `data:image/png;base64,${userData.picture_of_pwd_id}`,
    };
  };

  // Handle delete user
  const handleDeleteUser = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (confirmed) {
      const config = {
        method: "delete",
        url: `http://localhost:8080/admin/delete/user/${id}`, // Use appropriate API endpoint for deleting a user
        headers: {
          "Content-Type": "application/json",
        },
      };

      axios(config)
        .then((response) => {
          alert("User deleted successfully!");
          // Remove the deleted user from the state to update the UI
          setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        })
        .catch((error) => {
          console.error(error);
          alert("An error occurred while deleting the user.");
        });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setUser(null); // Clear the user details
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      {/* Sidebar */}
      <aside
        className={`bg-custom-blue w-full md:w-[300px] lg:w-[250px] p-4 flex flex-col items-center md:relative fixed top-0 left-0 min-h-screen h-full transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-50 md:z-auto`}
      >
        <button
          className="text-white md:hidden self-end size-10"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>

        {/* Sidebar Content */}
        <a
          href="/admin/dashboard"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">home</span>
          <span className="flex-grow text-center">Home</span>
        </a>

        <a
          href="/admin/dashboard/VerifyUsers"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            group_add
          </span>
          <span className="flex-grow text-center">Verify Applicants</span>
        </a>

        <a
          href="/admin/dashboard/VerifyComps"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            apartment
          </span>
          <span className="flex-grow text-center">Verify Companies</span>
        </a>

        <a
          href="/admin/dashboard/ViewUsers"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">group</span>
          <span className="flex-grow text-center">View All Applicants</span>
        </a>

        <a
          href="/admin/dashboard/ViewCompany"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            source_environment
          </span>
          <span className="flex-grow text-center">View All Companies</span>
        </a>

        <a
          href="/admin/dashboard/ViewJobs"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">work</span>
          <span className="flex-grow text-center">View All Job Listings</span>
        </a>

        <button
          className="bg-red-600 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out mt-6"
          onClick={() => {
            sessionStorage.removeItem("Id");
            sessionStorage.removeItem("Role");
            sessionStorage.removeItem("Token");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        className={`md:hidden bg-custom-blue text-white p-4 fixed top-4 left-4 z-50 rounded-xl mt-11 transition-transform ${
          isSidebarOpen ? "hidden" : ""
        }`}
        onClick={() => setIsSidebarOpen(true)}
      >
        &#9776;
      </button>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <h1 className="text-xl font-bold text-gray-700">
          View All Verified Users
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white mt-4">
            <thead>
              <tr className="w-full bg-blue-500 text-white">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">User</th>
                <th className="py-2 px-4">Disability</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="py-2 px-4">{user.id}</td>
                  <td className="py-2 px-4">{user.full_name}</td>
                  <td className="py-2 px-4">{user.type}</td>
                  <td className="py-2 px-4 flex">
                    <button
                      onClick={() => handleViewUser(user.id)} // Pass user ID when clicking "View"
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)} // Delete user when clicking "Delete"
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal for viewing user details */}
      {isModalOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-11/12 md:max-w-3xl p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 text-center">
              User Details
            </h2>

            <div className="flex justify-center mb-4 sm:mb-6">
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-40 h-40 rounded-full border-2 border-gray-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left text-gray-800 w-full">
              <div>
                <p className="font-semibold text-base sm:text-lg">Full Name:</p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {user.fullName}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">PWD ID:</p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {user.id}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  Disability:
                </p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {user.disability}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">Address:</p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {user.address}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">City:</p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {user.city}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">Birthdate:</p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {user.birthdate}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  Contact Number:
                </p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {user.contactNumber}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">Email:</p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left text-gray-800 w-full mt-6">
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  Picture with ID:
                </p>
                <img
                  src={user.pictureWithId}
                  alt="Picture with ID"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  Picture of PWD ID:
                </p>
                <img
                  src={user.pictureOfPwdId}
                  alt="Picture of PWD ID"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/* Buttons for Back */}
            <div className="mt-6 text-center space-x-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                onClick={closeModal} // Close modal
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminViewUsers;
