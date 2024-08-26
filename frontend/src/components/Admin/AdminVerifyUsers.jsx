import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminVerifyUsers = () => {
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

  const user = {
    id: 1,
    profilePicture: "https://via.placeholder.com/150",
    fullName: "John Doe",
    pwdId: "PWD123456",
    disability: "Visual Impairment",
    address: "123 Main St, Apt 4B",
    city: "Metropolis",
    birthdate: "1990-01-01",
    contactNumber: "555-1234",
    email: "johndoe@example.com",
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
          <h1 className="text-3xl font-bold text-blue-900">Admin Dashboard</h1>
          <button
            onClick={handleGoBack}
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          >
            Back
          </button>
        </div>
        <div className="mt-4">
          <div className="flex justify-center items-center h-full w-full bg-blue-500 p-4 sm:p-6 md:p-8 rounded-2xl">
            <div className="w-full max-w-4xl h-full bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl flex flex-col justify-center items-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 text-center">
                Verify User
              </h2>
              <p className="text-lg sm:text-xl mb-4 sm:mb-8 text-gray-600 text-center">
                User Details
              </p>
              <div className="flex justify-center mb-4 sm:mb-6">
                <img
                  src={user.profilePicture}
                  alt={user.fullName}
                  className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 border-gray-300"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left text-gray-800 w-full">
                <div>
                  <p className="font-semibold text-base sm:text-lg">
                    Full Name:
                  </p>
                  <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                    {user.fullName}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-base sm:text-lg">PWD ID:</p>
                  <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                    {user.pwdId}
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
                  <p className="font-semibold text-base sm:text-lg">
                    Birthdate:
                  </p>
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
              <div className="flex flex-col sm:flex-row justify-center mt-4 sm:mt-8 space-y-2 sm:space-y-0 sm:space-x-4">
                <button className="transition-all bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>
                <button className="transition-all bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 shadow">
                  Approve
                </button>
                <button className="transition-all bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 shadow">
                  Decline
                </button>
                <button className="transition-all bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 shadow flex items-center justify-center">
                  Next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminVerifyUsers;
