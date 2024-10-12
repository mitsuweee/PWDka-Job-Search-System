import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminVerifyUsers = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]); // Store all users
  const [selectedUser, setSelectedUser] = useState(null); // Store selected user for viewing in the modal
  const [showModal, setShowModal] = useState(false); // State to show/hide modal
  const [showDeclineModal, setShowDeclineModal] = useState(false); // State for decline modal
  const [declineReason, setDeclineReason] = useState(""); // Store decline reason
  const navigate = useNavigate();

  // Function to handle logout
  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      sessionStorage.removeItem("Id");
      sessionStorage.removeItem("Role");
      sessionStorage.removeItem("Token");

      navigate("/login");
    }
  };

  useEffect(() => {
    const config = {
      method: "get",
      url: "http://localhost:8080/verification/view/users",
      headers: {
        "User-Agent": "Apidog/1.0.0 (https://apidog.com)",
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response) {
        const userDataArray = response.data.data; // Assuming you get an array of users
        setUsers(userDataArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  // Helper function to format user data
  const formatUserData = (userData) => {
    return {
      id: userData.id,
      fullName: userData.full_name,
      pwdId: userData.id,
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

  // Handle approving a user
  const handleApprove = (userId) => {
    const config = {
      method: "put",
      url: `http://localhost:8080/verification/user/${userId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function () {
        alert("User approved successfully!");
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        setSelectedUser(null); // Clear selected user
        setShowModal(false); // Close modal
      })
      .catch(function (error) {
        console.log(error);
        alert("An error occurred while approving the user.");
      });
  };

  // Handle declining a user with a reason
  const handleDecline = (userId) => {
    if (!declineReason.trim()) {
      alert("Please provide a reason for declining the user.");
      return;
    }

    const config = {
      method: "delete",
      url: `http://localhost:8080/verification/user/${userId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        reason: declineReason, // Include reason in the request body
      },
    };

    axios(config)
      .then(function () {
        alert("User declined successfully!");
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        setSelectedUser(null); // Clear selected user
        setShowDeclineModal(false); // Close decline modal
        setDeclineReason(""); // Clear the reason input
      })
      .catch(function (error) {
        console.log(error);
        alert("An error occurred while declining the user.");
      });
  };

  // Handle viewing a user
  const handleView = (user) => {
    setSelectedUser(formatUserData(user)); // Set formatted user data for display
    setShowModal(true); // Open the modal
  };

  // Open decline modal and reset the decline reason
  const openDeclineModal = (user) => {
    setSelectedUser(user);
    setDeclineReason("");
    setShowDeclineModal(true);
  };

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
          onClick={handleLogout}
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
      <main className="flex-grow p-8 bg-custom-bg">
        <div className="flex justify-between items-center">
          {/* <button
            onClick={handleGoBack}
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          >
            Back
          </button> */}
        </div>

        <div className="mt-4">
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg">
                <thead>
                  <tr className="bg-blue-500 text-white">
                    <th className="py-2 px-4 border">ID</th>
                    <th className="py-2 px-4 border">User</th>
                    <th className="py-2 px-4 border">Disability</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border">{user.id}</td>
                      <td className="py-2 px-4 border">{user.full_name}</td>
                      <td className="py-2 px-4 border">{user.type}</td>
                      <td className="py-2 px-4 border text-center">
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-blue-600"
                          onClick={() => handleView(user)}
                        >
                          View
                        </button>
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-green-600"
                          onClick={() => handleApprove(user.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                          onClick={() => openDeclineModal(user)}
                        >
                          Decline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500">No users to verify yet.</p>
          )}

          {/* Modal for viewing user details */}
          {selectedUser && showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">User Details</h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowModal(false)}
                  >
                    &times;
                  </button>
                </div>
                <div className="flex justify-center mb-6">
                  <img
                    src={selectedUser.profilePicture}
                    alt={selectedUser.fullName}
                    className="w-32 h-32 rounded-full border-2 border-gray-300"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <strong>Full Name:</strong>
                    <p>{selectedUser.fullName}</p>
                  </div>
                  <div>
                    <strong>PWD ID:</strong>
                    <p>{selectedUser.pwdId}</p>
                  </div>
                  <div>
                    <strong>Disability:</strong>
                    <p>{selectedUser.disability}</p>
                  </div>
                  <div>
                    <strong>Address:</strong>
                    <p>{selectedUser.address}</p>
                  </div>
                  <div>
                    <strong>City:</strong>
                    <p>{selectedUser.city}</p>
                  </div>
                  <div>
                    <strong>Birthdate:</strong>
                    <p>{selectedUser.birthdate}</p>
                  </div>
                  <div>
                    <strong>Contact Number:</strong>
                    <p>{selectedUser.contactNumber}</p>
                  </div>
                  <div>
                    <strong>Email:</strong>
                    <p>{selectedUser.email}</p>
                  </div>
                  <div>
                    <img
                      src={selectedUser.pictureWithId}
                      alt="Picture with ID"
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                  <div>
                    <img
                      src={selectedUser.pictureOfPwdId}
                      alt="Picture of PWD ID"
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    onClick={() => handleApprove(selectedUser.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    onClick={() => openDeclineModal(selectedUser)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal for declining user with reason */}
          {selectedUser && showDeclineModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Decline User</h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowDeclineModal(false)}
                  >
                    &times;
                  </button>
                </div>
                <p>Please provide a reason for declining the user:</p>
                <textarea
                  className="w-full p-2 mt-2 border rounded-lg focus:ring focus:ring-blue-300"
                  rows={4}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    onClick={() => handleDecline(selectedUser.id)}
                  >
                    Decline
                  </button>
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    onClick={() => setShowDeclineModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminVerifyUsers;
