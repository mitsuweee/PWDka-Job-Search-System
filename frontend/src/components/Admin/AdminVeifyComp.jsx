import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminVerifyComp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [company, setCompany] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
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
      url: "http://localhost:8080/verification/view/companies",
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response) {
        const companyData = response.data.data[0]; // Assuming you get an array of companies
        setCompany({
          id: companyData.id,
          companyName: companyData.name,
          address: companyData.address,
          city: companyData.city,
          companyDescription: companyData.description,
          contactNumber: companyData.contact_number,
          companyEmail: companyData.email,
          companyLogo: `data:image/png;base64,${companyData.logo}`, // Assuming logo is in base64 format
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  const handleApprove = () => {
    const config = {
      method: "put",
      url: `http://localhost:8080/verification/company/${company.id}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        alert("Company approved successfully!");
        // You can add further logic here, like navigating to the next company or updating the UI
      })
      .catch(function (error) {
        console.log(error);
        alert("An error occurred while approving the company.");
      });
  };

  const handleDecline = () => {
    const config = {
      method: "delete",
      url: `http://localhost:8080/verification/company/${company.id}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        alert("Company Declined successfully!");
        // You can add further logic here, like navigating to the next company or updating the UI
      })
      .catch(function (error) {
        console.log(error);
        alert("An error occurred while Declining the company.");
      });
  };

  if (!company) return <div>Loading...</div>;

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
          {company && (
            <div className="flex justify-center items-center h-full w-full bg-blue-500 p-4 rounded-2xl">
              <div className="w-full max-w-4xl h-full bg-white p-8 rounded-lg shadow-xl flex flex-col justify-center items-center">
                <h2 className="text-3xl font-bold mb-4 text-gray-800 text-center">
                  Verify Company
                </h2>
                <p className="text-xl mb-8 text-gray-600 text-center">
                  Company Details
                </p>
                <div className="grid grid-cols-2 gap-6 text-left text-gray-800 w-full">
                  <div>
                    <p className="font-semibold text-lg">Company Name:</p>
                    <p className="text-xl bg-gray-100 rounded-md p-2">
                      {company.companyName}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Address:</p>
                    <p className="text-xl bg-gray-100 rounded-md p-2">
                      {company.address}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">City:</p>
                    <p className="text-xl bg-gray-100 rounded-md p-2">
                      {company.city}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">
                      Company Description:
                    </p>
                    <p className="text-xl bg-gray-100 rounded-md p-2">
                      {company.companyDescription}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Contact Number:</p>
                    <p className="text-xl bg-gray-100 rounded-md p-2">
                      {company.contactNumber}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Company Email:</p>
                    <p className="text-xl bg-gray-100 rounded-md p-2">
                      {company.companyEmail}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center mt-8 space-x-4">
                  <button
                    className="transition-all bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow flex items-center"
                    onClick={handleGoBack}
                  >
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
                  <button
                    className="transition-all bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 shadow"
                    onClick={() => {
                      handleApprove();
                      alert("Company has been Approved.");
                      window.location.reload(); // This will refresh the page after HandleApprove is called
                    }}
                  >
                    Approve
                  </button>
                  <button
                    className="transition-all bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 shadow"
                    onClick={() => {
                      handleDecline();
                      alert("Company has been Declined.");
                      window.location.reload(); // This will refresh the page after HandleDecline is called
                    }}
                  >
                    Decline
                  </button>
                  <button className="transition-all bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 shadow flex items-center">
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
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminVerifyComp;
