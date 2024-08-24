import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      // Clear session storage and redirect to the login route
      sessionStorage.removeItem("Id");
      sessionStorage.removeItem("Role");
      navigate("/login");
    }
  };

  const handleGoBack = () => {
    navigate(-1); // This navigates back to the previous page
  };

  useEffect(() => {
    const config = {
      method: "get",
      url: "/admin/view/users", // API endpoint
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        console.log("Full response data:", response.data.data); // Logs the entire response data
        const fetchedUsers = response.data.data.map((user) => ({
          id: user.id,
          fullName: user.full_name, // Assuming 'full_name' is the correct key
          pwdId: user.id, 
          disability: user.type,
          address: user.address,
          city: user.city,
          birthdate: user.birth_date,
          contactNumber: user.contact_number, // Assuming 'contact_number' is the correct key
          email: user.email,
        }));

        console.log("Filtered and processed users:", fetchedUsers); // Logs the processed array of users
        setUsers(fetchedUsers); // Update the state with the processed users
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log("Error:", error.response?.data); // Logs the error response
        alert(errorMessage);
      });
  }, []);

  const renderViewAllUsers = () => {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4 text-custom-blue">
          View All Verified Users
        </h2>
        <div className="flex flex-wrap gap-4">
          <script>console.log (users);</script>
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="flex-1 min-w-[300px] p-4 bg-blue-500 rounded-xl shadow-xl"
              >
                <div className="flex flex-col text-left text-white">
                  <img
                    src={
                      user.profilePicture || "https://via.placeholder.com/150"
                    } // Fallback to placeholder if no image
                    alt={user.fullName}
                    className="w-24 h-24 rounded-full mb-4"
                  />
                  <p className="font-semibold text-lg">Full Name:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {user.fullName}
                  </p>

                  <p className="font-semibold text-lg">PWD ID:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {user.pwdId}
                  </p>

                  <p className="font-semibold text-lg">Disability:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {user.disability}
                  </p>

                  <p className="font-semibold text-lg">Address:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {user.address}
                  </p>

                  <p className="font-semibold text-lg">City:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {user.city}
                  </p>

                  <p className="font-semibold text-lg">Birthdate:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {user.birthdate}
                  </p>

                  <p className="font-semibold text-lg">Contact Number:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {user.contactNumber}
                  </p>

                  <p className="font-semibold text-lg">Email:</p>
                  <p className="text-xl bg-custom-bg rounded-md text-custom-blue">
                    {user.email}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white">No verified users found.</p>
          )}
        </div>
      </div>
    );
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
        <a
          href="/admin/dashboard"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          Home
        </a>
        <a
          href="/admin/dashboard/VerifyUsers"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          Verify Users
        </a>
        <a
          href="/admin/dashboard/VerifyComps"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          Verify Company
        </a>
        <a
          href="/admin/dashboard/ViewUsers"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          View All Users
        </a>
        <a
          href="/admin/dashboard/ViewCompany"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          View All Companies
        </a>
        <a
          href="/admin/dashboard/ViewJobs"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          View All Job Listings
        </a>
        <a
          href="/admin/dashboard/DeleteUser"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          Delete Users
        </a>
        <a
          href="/admin/dashboard/DeleteJob"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          Delete Job Listings
        </a>
        <a
          href="/admin/dashboard/DeleteCompany"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          Delete Company
        </a>
        <button
          className="bg-red-400 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out mt-6"
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
          <h1 className="text-3xl font-bold text-blue-900">Admin Dashboard</h1>
          <button
            onClick={handleGoBack}
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          >
            Back
          </button>
        </div>
        <div className="mt-4">{renderViewAllUsers()}</div>
      </main>
    </div>
  );
};

export default AdminViewUsers;
