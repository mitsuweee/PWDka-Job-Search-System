import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const AdminVerifyComp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const companiesPerPage = 10;

  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("Id");
    localStorage.removeItem("Role");
    localStorage.removeItem("Token");
    toast.success("Logged out successfully", { position: "top-center" });
    navigate("/login");
    setIsLogoutModalOpen(false);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const config = {
      method: "get",
      url: "/verification/view/companies",
      headers: {
        "User-Agent": "Apidog/1.0.0 (https://apidog.com)",
        "Content-Type": "application/json",
      },
    };

    setLoading(true);
    axios(config)
      .then(function (response) {
        const companyDataArray = response.data.data;
        setCompanies(companyDataArray);
        setLoading(false);
        toast.success("Companies loaded successfully");
      })
      .catch(function (error) {
        setLoading(false);
        toast.error("Failed to load companies");
        console.log(error);
      });
  }, []);

  const formatCompanyData = (companyData) => {
    return {
      id: companyData.id,
      companyName: companyData.name,
      address: companyData.address,
      city: companyData.city,
      companyDescription: companyData.description,
      contactNumber: companyData.contact_number,
      companyEmail: companyData.email,
      companyLogo: `data:image/png;base64,${companyData.profile_picture}`,
    };
  };

  const handleApprove = (companyId) => {
    if (actionInProgress) return;
    setActionInProgress(true);
    const config = {
      method: "put",
      url: `/verification/company/${companyId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    setLoading(true);
    axios(config)
      .then(function () {
        toast.success("Company approved successfully");
        setCompanies((prevCompanies) =>
          prevCompanies.filter((company) => company.id !== companyId)
        );
        setSelectedCompany(null);
        setShowModal(false);
        setLoading(false);
        setActionInProgress(false);
      })
      .catch(function (error) {
        setLoading(false);
        setActionInProgress(false);
        toast.error("An error occurred while approving the company");
        console.log(error);
      });
  };

  const handleDecline = (companyId) => {
    if (actionInProgress) return;
    setActionInProgress(true);
    const config = {
      method: "delete",
      url: `/verification/company/${companyId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    setLoading(true);
    axios(config)
      .then(function () {
        toast.success("Company declined successfully");
        setCompanies((prevCompanies) =>
          prevCompanies.filter((company) => company.id !== companyId)
        );
        setSelectedCompany(null);
        setShowModal(false);
        setLoading(false);
        setActionInProgress(false);
      })
      .catch(function (error) {
        setLoading(false);
        setActionInProgress(false);
        toast.error("An error occurred while declining the company");
        console.log(error);
      });
  };

  const handleView = (company) => {
    setSelectedCompany(formatCompanyData(company));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCompany(null);
  };

  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = companies.slice(
    indexOfFirstCompany,
    indexOfLastCompany
  );
  const totalPages = Math.ceil(companies.length / companiesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      <Toaster position="top-center" reverseOrder={false} />
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
        </div>
      )}

      <aside
        className={`bg-custom-blue w-full md:w-[300px] lg:w-[250px] p-4 flex flex-col items-center md:relative fixed top-0 left-0 min-h-screen h-full transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-50 md:z-auto`}
      >
        <button
          className="text-white md:hidden self-end text-2xl"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>

        <nav className="w-full flex flex-col items-center space-y-4">
          <a
            href="/admin/dashboard"
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center justify-center"
            style={{
              boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
            }}
          >
            <span className="material-symbols-outlined text-xl mr-2">home</span>
            <span>Home</span>
          </a>

          <a
            href="/admin/dashboard/VerifyUsers"
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">draw</span>
            <span>Verify Applicants</span>
          </a>

          <a
            href="/admin/dashboard/VerifyComps"
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">
              apartment
            </span>
            <span>Verify Companies</span>
          </a>

          <a
            href="/admin/dashboard/ViewUsers"
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">
              group
            </span>
            <span>View All Applicants</span>
          </a>

          <a
            href="/admin/dashboard/ViewCompany"
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">
              source_environment
            </span>
            <span>View All Companies</span>
          </a>

          <a
            href="/admin/dashboard/ViewJobs"
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">work</span>
            <span>View All Job Listings</span>
          </a>

          <a
            href="/admin/dashboard/AdminSignup"
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">draw</span>
            <span>Sign Up</span>
          </a>

          <button
            className="bg-red-600 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </aside>

      <button
        className={`md:hidden bg-custom-blue text-white p-4 fixed top-4 left-4 z-50 rounded-xl mt-11 transition-transform ${
          isSidebarOpen ? "hidden" : ""
        }`}
        onClick={() => setIsSidebarOpen(true)}
      >
        &#9776;
      </button>

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
          {currentCompanies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg">
                <thead>
                  <tr className="bg-blue-500 text-white">
                    <th className="py-2 px-4 text-left">Company Name</th>
                    <th className="py-2 px-4 text-left">City</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 text-left">
                        {company.name
                          ? company.name
                              .split(" ")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              )
                              .join(" ")
                          : ""}
                      </td>
                      <td className="py-2 px-4 text-left">
                        {company.city
                          ? company.city
                              .split(" ")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              )
                              .join(" ")
                          : ""}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <button
                          disabled={actionInProgress}
                          className={`bg-blue-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-blue-600 ${
                            actionInProgress
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => handleView(company)}
                        >
                          View
                        </button>
                        <button
                          disabled={actionInProgress}
                          className={`bg-green-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-green-600 ${
                            actionInProgress
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => handleApprove(company.id)}
                        >
                          Approve
                        </button>
                        <button
                          disabled={actionInProgress}
                          className={`bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 ${
                            actionInProgress
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
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

          {selectedCompany && showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-[600px] h-[700px] shadow-lg hover:shadow-2xl transition-shadow duration-300 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Company Details</h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={closeModal}
                  >
                    &times;
                  </button>
                </div>
                <div className="flex justify-center mb-6">
                  <img
                    src={selectedCompany.companyLogo}
                    alt={selectedCompany.companyName}
                    className="w-32 h-32 rounded-full border-2 border-gray-300 hover:shadow-lg transition-shadow duration-300 object-cover"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-100 p-4 rounded-lg">
                  <div>
                    <strong>Company Name:</strong>
                    <p className="shadow-lg p-1">
                      {selectedCompany.companyName}
                    </p>
                  </div>
                  <div>
                    <strong>City:</strong>
                    <p className="shadow-lg p-1">
                      {selectedCompany.city
                        ? selectedCompany.city
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ")
                        : ""}
                    </p>
                  </div>
                  <div>
                    <strong>Company Description:</strong>
                    <p className="shadow-lg p-1">
                      {selectedCompany.companyDescription
                        ? selectedCompany.companyDescription
                            .split(". ")
                            .map(
                              (sentence) =>
                                sentence.charAt(0).toUpperCase() +
                                sentence.slice(1).toLowerCase()
                            )
                            .join(". ")
                        : ""}
                    </p>
                  </div>
                  <div>
                    <strong>Address:</strong>
                    <p className="shadow-lg p-1">
                      {selectedCompany.address
                        ? selectedCompany.address
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ")
                        : ""}
                    </p>
                  </div>
                  <div>
                    <strong>Contact Number:</strong>
                    <p className="shadow-lg p-1">
                      {selectedCompany.contactNumber}
                    </p>
                  </div>
                  <div>
                    <strong>Email:</strong>
                    <p className="shadow-lg p-1">
                      {selectedCompany.companyEmail}
                    </p>
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

        <div className="flex justify-center mt-6">
          <ol className="flex justify-center gap-1 text-xs font-medium">
            <li>
              <button
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                className="inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900"
                disabled={currentPage === 1}
              >
                <span className="sr-only">Prev Page</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 010 1.414L9.414 10l3.293 3.293a1 1 01-1.414 1.414l-4-4a1 1 010-1.414l4-4a1 1 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index + 1}>
                <button
                  onClick={() => paginate(index + 1)}
                  className={`block size-8 rounded border text-center leading-8 ${
                    currentPage === index + 1
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-100 bg-white text-gray-900"
                  }`}
                >
                  {index + 1}
                </button>
              </li>
            ))}

            <li>
              <button
                onClick={() =>
                  currentPage < totalPages && paginate(currentPage + 1)
                }
                className="inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900"
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Next Page</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 010-1.414L10.586 10 7.293 6.707a1 1 011.414-1.414l4 4a1 1 010 1.414l-4-4a1 1 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>
          </ol>
        </div>
      </main>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Logout Confirmation
              </h2>
              <button
                onClick={closeLogoutModal}
                className="text-gray-500 hover:text-gray-800 transition duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <p className="text-lg text-gray-600">
                Are you sure you want to log out?
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={closeLogoutModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerifyComp;
