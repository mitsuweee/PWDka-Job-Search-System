import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDeleteJobs = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      // Clear session storage and redirect to the login route
      localStorage.removeItem("Id");
      localStorage.removeItem("Role");
      localStorage.removeItem("Token");

      navigate("/login");
    }
  };

  const handleGoBack = () => {
    navigate(-1); // This navigates back to the previous page
  };

  const renderDeleteJobs = () => {
    const jobListings = [
      {
        id: 1,
        companyName: "Acme Corporation",
        jobName: "Software Engineer",
        description: "Develop and maintain software solutions",
        address: "456 Business Ave",
        city: "Metropolis",
      },
      {
        id: 2,
        companyName: "Wayne Enterprises",
        jobName: "Product Manager",
        description: "Oversee product development from start to finish",
        address: "1007 Mountain Drive",
        city: "Gotham",
      },
    ];

    return (
      <div>
        <h2 className="text-xl font-bold mb-4 text-custom-blue text-center">
          Delete Job Listings
        </h2>
        <div className="flex flex-wrap gap-4">
          {jobListings.length > 0 ? (
            jobListings.map((job) => (
              <div
                key={job.id}
                className="flex-1 min-w-[300px] p-4 bg-blue-500 rounded-xl shadow-xl"
              >
                <div className="flex flex-col text-left text-white">
                  <p className="font-semibold text-lg">Company Name:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {job.companyName}
                  </p>

                  <p className="font-semibold text-lg">Job Name:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {job.jobName}
                  </p>

                  <p className="font-semibold text-lg">Description:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {job.description}
                  </p>

                  <p className="font-semibold text-lg">Address:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {job.address}
                  </p>

                  <p className="font-semibold text-lg">City:</p>
                  <p className="text-xl bg-custom-bg rounded-md text-custom-blue">
                    {job.city}
                  </p>
                </div>
                <div className="flex justify-center items-center mt-8">
                  <button
                    className="cursor-pointer transition-all bg-red-500 text-white px-6 py-2 rounded-lg
                    border-red-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px]
                    hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white">No job listings found.</p>
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
          Verify Applicants
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
          View All Applicants
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
          href="/admin/dashboard/AdminSignup"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
        >
          <span className="material-symbols-outlined text-xl mr-4">draw</span>
          <span className="flex-grow text-center">Sign Up</span>
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
        <div className="mt-4">{/* Render content based on the section */}</div>
      </main>
    </div>
  );
};

export default AdminDeleteJobs;
