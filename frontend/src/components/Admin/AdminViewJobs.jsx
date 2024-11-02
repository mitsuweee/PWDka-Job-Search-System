import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const AdminViewJobs = () => {
  const [jobListings, setJobListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("Newest");
  const jobsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const config = {
      method: "get",
      url: "/admin/view/all/joblisting/newesttooldest",
      headers: {
        "User-Agent": "Apidog/1.0.0 (https://apidog.com)",
        "Content-Type": "application/json",
      },
    };

    setLoading(true);
    axios(config)
      .then((response) => {
        const jobDataArray = response.data.data;
        setJobListings(jobDataArray);
        setLoading(false);
        toast.success("Job listings loaded successfully");
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Failed to load job listings");
        console.error(error);
      });
  }, []);

  const handleViewJob = (jobId) => {
    const config = {
      method: "get",
      url: `/admin/view/joblisting/${jobId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        const jobData = response.data.data[0];
        setJob(formatJobData(jobData));
        setIsModalOpen(true);
      })
      .catch((error) => {
        toast.error("Failed to load job details");
        console.error(error);
      });
  };

  const formatJobData = (jobData) => ({
    id: jobData.id,
    companyName: jobData.company_name,
    jobName: jobData.position_name,
    description: jobData.description,
    requirements: jobData.requirement,
    qualification: jobData.qualification,
    minimumSalary: jobData.minimum_salary,
    maximumSalary: jobData.maximum_salary,
    positionType: jobData.position_type,
    disabilityTypes: jobData.disability_types,
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setJob(null);
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

  const closeLogoutModal = () => setIsLogoutModalOpen(false);

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;

  const filteredJobs = jobListings
    .filter((job) =>
      job.position_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "A-Z")
        return a.position_name.localeCompare(b.position_name);
      if (sortOrder === "Z-A")
        return b.position_name.localeCompare(a.position_name);
      if (sortOrder === "Newest")
        return new Date(b.created_at) - new Date(a.created_at);
      return new Date(a.created_at) - new Date(b.created_at);
    });

  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      <Toaster position="top-center" reverseOrder={false} />

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
              ? "bg-blue-900 text-gray-200"
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
              ? "bg-blue-900 text-gray-200"
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
              ? "bg-blue-900 text-gray-200" // Active style for View All Job Listings
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
        <h1 className="text-xl font-bold text-gray-700">
          View All Job Listings
        </h1>

        {/* Search and Filter Bar */}
        <div className="flex items-center justify-center mt-6 mb-4 p-4 bg-white rounded-lg shadow-md space-x-4">
          <input
            type="text"
            placeholder="Search jobs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-1/3 px-4 py-2 border border-gray-300 bg-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 w-[130px] border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="A-Z">A-Z</option>
            <option value="Z-A">Z-A</option>
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white mt-4 rounded-lg shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-600 text-white text-left text-xs md:text-sm uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Company</th>
                <th className="py-4 px-6 font-semibold">Job Title</th>
                <th className="py-4 px-6 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition duration-300"
                >
                  <td className="py-4 px-6 text-gray-800 text-sm md:text-base break-words">
                    {job.company_name}
                  </td>
                  <td className="py-4 px-6 text-gray-800 text-sm md:text-base break-words">
                    {job.position_name}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleViewJob(job.id)}
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

        {/* Pagination */}
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

      {/* Modal for viewing job details */}
      {isModalOpen && job && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-[700px] shadow-lg hover:shadow-2xl transition-shadow duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Job Details</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={closeModal}
              >
                &times;
              </button>
            </div>

            {/* First Div: Company Details */}
            <div className="grid gap-4 bg-gray-100 p-4 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <strong>Company:</strong>
                  <p className="shadow-lg p-1">{job.companyName}</p>
                </div>
                <div>
                  <strong>Job Title:</strong>
                  <p className="shadow-lg p-1">{job.jobName}</p>
                </div>
              </div>
              <div>
                <div className="w-full">
                  <strong>Description:</strong>
                  <p className="shadow-lg p-1">
                    {job.description
                      .split(".")
                      .map(
                        (sentence) =>
                          sentence.trim().charAt(0).toUpperCase() +
                          sentence.trim().slice(1).toLowerCase() +
                          "."
                      )
                      .join(" ")}
                  </p>
                </div>
              </div>

              {/* Second Div: Job Information */}
              <div className="w-full">
                <strong>Requirements:</strong>
                <p className="shadow-lg p-1">
                  {job.requirements
                    .split(",")
                    .map(
                      (requirement) =>
                        requirement.trim().charAt(0).toUpperCase() +
                        requirement.trim().slice(1).toLowerCase()
                    )
                    .join(", ")}
                </p>
              </div>
              <div className="w-full">
                <strong>Qualification:</strong>
                <p className="shadow-lg p-1">
                  {job.qualification
                    .split(",")
                    .map(
                      (qualification) =>
                        qualification.trim().charAt(0).toUpperCase() +
                        qualification.trim().slice(1).toLowerCase()
                    )
                    .join(", ")}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <strong>Salary:</strong>
                  <p className="shadow-lg p-1">
                    ₱ {job.minimumSalary} - ₱ {job.maximumSalary}
                  </p>
                </div>
                <div>
                  <strong>Position Type:</strong>
                  <p className="shadow-lg p-1">
                    {job.positionType
                      .split("-")
                      .map(
                        (part) =>
                          part.charAt(0).toUpperCase() + part.slice(1).trim()
                      )
                      .join(" - ")}
                  </p>
                </div>
              </div>

              {/* Third Div: Additional Information */}
              <div className="w-full">
                <div>
                  <strong>Disabilities:</strong>
                  <p className="shadow-lg p-1">{job.disabilityTypes}</p>
                </div>
              </div>
            </div>
            {/* Buttons */}
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                onClick={closeModal}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
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

export default AdminViewJobs;
