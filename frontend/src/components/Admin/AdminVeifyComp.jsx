import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminVerifyComp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState([]); // Store all companies
  const [selectedCompany, setSelectedCompany] = useState(null); // Store selected company for viewing in the modal
  const [showModal, setShowModal] = useState(false); // State to show/hide modal
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      sessionStorage.removeItem("Id");
      sessionStorage.removeItem("Role");
      sessionStorage.removeItem("Token");
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
        const companyDataArray = response.data.data;
        setCompanies(companyDataArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  // Helper function to format company data
  const formatCompanyData = (companyData) => {
    return {
      id: companyData.id,
      companyName: companyData.name,
      address: companyData.address,
      city: companyData.city,
      companyDescription: companyData.description,
      contactNumber: companyData.contact_number,
      companyEmail: companyData.email,
      companyLogo: `data:image/png;base64,${companyData.profile_picture}`, // Assuming logo is in base64 format
    };
  };

  const handleApprove = (companyId) => {
    const config = {
      method: "put",
      url: `http://localhost:8080/verification/company/${companyId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response) {
        alert("Company approved successfully!");
        setCompanies((prevCompanies) =>
          prevCompanies.filter((company) => company.id !== companyId)
        );
        setSelectedCompany(null); // Clear selected company
        setShowModal(false); // Close modal
      })
      .catch(function (error) {
        console.log(error);
        alert("An error occurred while approving the company.");
      });
  };

  const handleDecline = (companyId) => {
    const config = {
      method: "delete",
      url: `http://localhost:8080/verification/company/${companyId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response) {
        alert("Company declined successfully!");
        setCompanies((prevCompanies) =>
          prevCompanies.filter((company) => company.id !== companyId)
        );
        setSelectedCompany(null); // Clear selected company
        setShowModal(false); // Close modal
      })
      .catch(function (error) {
        console.log(error);
        alert("An error occurred while declining the company.");
      });
  };

  const handleView = (company) => {
    setSelectedCompany(formatCompanyData(company)); // Set formatted company data for display
    setShowModal(true); // Open the modal
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
          <button
            onClick={handleGoBack}
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          >
            Back
          </button>
        </div>

        <div className="mt-4">
          {companies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg">
                <thead>
                  <tr className="bg-blue-500 text-white">
                    <th className="py-2 px-4 border">Company Name</th>
                    <th className="py-2 px-4 border">City</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border">{company.name}</td>
                      <td className="py-2 px-4 border">{company.city}</td>
                      <td className="py-2 px-4 border text-center">
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-blue-600"
                          onClick={() => handleView(company)}
                        >
                          View
                        </button>
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-green-600"
                          onClick={() => handleApprove(company.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                          onClick={() => handleDecline(company.id)}
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
            <p className="text-center text-gray-500">
              No companies to verify yet.
            </p>
          )}

          {/* Modal for viewing company details */}
          {selectedCompany && showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Company Details</h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowModal(false)}
                  >
                    &times;
                  </button>
                </div>
                <div className="flex justify-center mb-6">
                  <img
                    src={selectedCompany.companyLogo}
                    alt={selectedCompany.companyName}
                    className="w-32 h-32 rounded-full border-2 border-gray-300"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <strong>Company Name:</strong>
                    <p>{selectedCompany.companyName}</p>
                  </div>
                  <div>
                    <strong>City:</strong>
                    <p>{selectedCompany.city}</p>
                  </div>
                  <div>
                    <strong>Company Description:</strong>
                    <p>{selectedCompany.companyDescription}</p>
                  </div>
                  <div>
                    <strong>Address:</strong>
                    <p>{selectedCompany.address}</p>
                  </div>
                  <div>
                    <strong>Contact Number:</strong>
                    <p>{selectedCompany.contactNumber}</p>
                  </div>
                  <div>
                    <strong>Email:</strong>
                    <p>{selectedCompany.companyEmail}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    onClick={() => handleApprove(selectedCompany.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    onClick={() => handleDecline(selectedCompany.id)}
                  >
                    Decline
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
