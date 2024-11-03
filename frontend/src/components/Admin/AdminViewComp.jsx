import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const AdminViewComp = () => {
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("A-Z");
  const companiesPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const config = {
      method: "get",
      url: "/admin/view/companies",
      headers: {
        "Content-Type": "application/json",
      },
    };

    setLoading(true);
    axios(config)
      .then((response) => {
        const companyDataArray = response.data.data;
        setCompanies(companyDataArray);
        setLoading(false);
        toast.success("Companies loaded successfully");
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Failed to load companies");
        console.error(error);
      });
  }, []);

  const handleViewCompany = (companyId) => {
    const config = {
      method: "get",
      url: `/company/view/${companyId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    setLoading(true);
    axios(config)
      .then((response) => {
        const companyData = response.data.data;
        setCompany(formatCompanyData(companyData));
        setIsModalOpen(true);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Failed to load company details");
        console.error(error);
      });
  };

  const formatCompanyData = (companyData) => ({
    id: companyData.id,
    companyName: companyData.name,
    address: companyData.address,
    city: companyData.city,
    description: companyData.description,
    contactNumber: companyData.contact_number,
    companyEmail: companyData.email,
    companyProfile: `data:image/png;base64,${companyData.profile_picture}`,
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setCompany(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

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

  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;

  const filteredCompanies = companies
    .filter((company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "A-Z") return a.name.localeCompare(b.name);
      if (sortOrder === "Z-A") return b.name.localeCompare(a.name);
      if (sortOrder === "Newest")
        return new Date(b.created_at) - new Date(a.created_at);
      return new Date(a.created_at) - new Date(b.created_at);
    });

  const currentCompanies = filteredCompanies.slice(
    indexOfFirstCompany,
    indexOfLastCompany
  );
  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      <Toaster position="top-center" reverseOrder={false} />
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`bg-custom-blue w-full md:w-[300px] lg:w-[250px] p-4 flex flex-col items-center md:relative fixed top-0 left-0 min-h-screen h-full transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-50 md:z-auto `}
      >
        {/* Logo Section */}
        <div className="w-full flex justify-center items-center mb-6 p-2 bg-white rounded-lg">
          <img
            src="/imgs/LOGO PWDKA.png" // Replace with the actual path to your logo
            alt="Logo"
            className="w-26 h-19 object-contain"
          />
        </div>

        <button
          className="text-white md:hidden self-end size-10"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>

        {/* Dashboard Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Dashboard
        </h2>
        <hr className="border-gray-400 w-full mb-4" />

        <a
          href="/admin/dashboard"
          className={`${
            window.location.pathname === "/admin/dashboard"
              ? "bg-gray-200 text-blue-900"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            dashboard
          </span>
          <span className="flex-grow text-center">Dashboard</span>
        </a>

        {/* Verification Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Verification
        </h2>
        <hr className="border-gray-400 w-full mb-4" />

        <a
          href="/admin/dashboard/VerifyUsers"
          className={`${
            window.location.pathname === "/admin/dashboard/VerifyUsers"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            how_to_reg
          </span>
          <span className="flex-grow text-center">Verify Applicants</span>
        </a>

        <a
          href="/admin/dashboard/VerifyComps"
          className={`${
            window.location.pathname === "/admin/dashboard/VerifyComps"
              ? "bg-blue-900 text-gray-200" // Active style for Verify Companies
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            apartment
          </span>
          <span className="flex-grow text-center">Verify Companies</span>
        </a>

        {/* View Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          View Records
        </h2>
        <hr className="border-gray-400 w-full mb-4" />

        <a
          href="/admin/dashboard/ViewUsers"
          className={`${
            window.location.pathname === "/admin/dashboard/ViewUsers"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
        >
          <span className="material-symbols-outlined text-xl mr-4">group</span>
          <span className="flex-grow text-center">View All Applicants</span>
        </a>

        <a
          href="/admin/dashboard/ViewCompany"
          className={`${
            window.location.pathname === "/admin/dashboard/ViewCompany"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            source_environment
          </span>
          <span className="flex-grow text-center">View All Companies</span>
        </a>

        <a
          href="/admin/dashboard/ViewJobs"
          className={`${
            window.location.pathname === "/admin/dashboard/ViewJobs"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
        >
          <span className="material-symbols-outlined text-xl mr-4">work</span>
          <span className="flex-grow text-center">View All Job Listings</span>
        </a>

        {/* Account Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Account
        </h2>
        <hr className="border-gray-400 w-full mb-4" />

        <a
          href="/admin/dashboard/viewadmin"
          className={`${
            window.location.pathname === "/admin/dashboard/viewadmin"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            manage_accounts
          </span>
          <span className="flex-grow text-center">Admin Management</span>
        </a>

        <button
          className="bg-red-600 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out mt-6"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <button
        className={`md:hidden bg-custom-blue text-white p-4 fixed top-4 left-4 z-50 rounded-xl mt-11 transition-transform ${
          isSidebarOpen ? "hidden" : ""
        }`}
        onClick={() => setIsSidebarOpen(true)}
      >
        &#9776;
      </button>

      <main className="flex-grow p-8">
        <h1 className="text-xl font-bold text-gray-700">View All Companies</h1>

        {/* Search and Filter Bar */}
        <div className="flex items-center justify-center mt-6 mb-4 p-4 bg-white rounded-lg shadow-md space-x-4">
          <input
            type="text"
            placeholder="Search companies"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-1/2 px-4 py-2 border border-gray-300 bg-gray-100 text-black rounded-lg focus:outline-none focus:border-blue-500 shadow-inner"
            style={{ boxShadow: "inset 0px 4px 8px rgba(0, 0, 0, 0.1)" }}
          />
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 w-[130px] border border-gray-300 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 focus:outline-none focus:border-blue-500 transition duration-200"
            >
              <option value="A-Z">A-Z</option>
              <option value="Z-A">Z-A</option>
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-white">sort</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white mt-4 rounded-lg shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-600 text-white text-left text-xs md:text-sm uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Company Name</th>
                <th className="py-4 px-6 font-semibold">City</th>
                <th className="py-4 px-6 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCompanies.map((company) => (
                <tr
                  key={company.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition duration-300"
                >
                  <td className="py-4 px-6 text-gray-800 text-sm md:text-base break-words">
                    {company.name}
                  </td>
                  <td className="py-4 px-6 text-gray-800 text-sm md:text-base break-words">
                    {company.city
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleViewCompany(company.id)}
                      className="bg-blue-500 text-white text-xs md:text-sm px-3 py-1 rounded-full shadow-sm hover:bg-blue-700 transition duration-200 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-6">
          <ol className="flex justify-center gap-1 text-xs font-medium">
            <li>
              <button
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                className="inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900"
                disabled={currentPage === 1}
              >
                Prev
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
                Next
              </button>
            </li>
          </ol>
        </div>
      </main>

      {isModalOpen && company && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg transition-transform transform scale-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-2xl font-bold text-custom-blue  flex items-center">
                <span className="material-symbols-outlined mr-2">business</span>
                Company Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition duration-200"
              >
                <span className="material-symbols-outlined text-2xl">
                  close
                </span>
              </button>
            </div>
            <div className="flex justify-center mb-6">
              <img
                src={company.companyProfile}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-custom-blue hover:shadow-lg transition-shadow duration-300 object-cover"
              />
            </div>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      badge
                    </span>
                    Company Name:
                  </p>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                    {company.companyName}
                  </p>
                </div>
                <div>
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      location_city
                    </span>
                    City:
                  </p>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                    {company.city}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">home</span>
                  Address:
                </p>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                  {company.address}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    description
                  </span>
                  Description:
                </p>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                  {company.description}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      phone
                    </span>
                    Contact Number:
                  </p>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                    {company.contactNumber}
                  </p>
                </div>
                <div>
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      email
                    </span>
                    Email:
                  </p>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                    {company.companyEmail}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600 transition duration-200 font-medium"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Delete Confirmation
              </h2>
              <button
                onClick={closeDeleteModal}
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
                Are you sure you want to delete this company? This action cannot
                be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

export default AdminViewComp;
