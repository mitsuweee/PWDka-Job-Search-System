import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const AdminViewJobs = () => {
  const [jobListings, setJobListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // Logout confirmation modal state
  const navigate = useNavigate();

  useEffect(() => {
    const config = {
      method: "get",
      url: "http://localhost:8080/admin/view/all/joblisting/newesttooldest",
      headers: {
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
      url: `http://localhost:8080/admin/view/joblisting/${jobId}`,
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

  const formatJobData = (jobData) => {
    return {
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
    };
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setJob(null);
  };

  // Open logout confirmation modal
  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  // Confirm logout
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
        >
          <span className="material-symbols-outlined text-xl mr-4">home</span>
          <span className="flex-grow text-center">Home</span>
        </a>

        <a
          href="/admin/dashboard/VerifyUsers"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
        >
          <span className="material-symbols-outlined text-xl mr-4">
            group_add
          </span>
          <span className="flex-grow text-center">Verify Applicants</span>
        </a>

        <a
          href="/admin/dashboard/VerifyComps"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
        >
          <span className="material-symbols-outlined text-xl mr-4">
            apartment
          </span>
          <span className="flex-grow text-center">Verify Companies</span>
        </a>

        <a
          href="/admin/dashboard/ViewUsers"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
        >
          <span className="material-symbols-outlined text-xl mr-4">group</span>
          <span className="flex-grow text-center">View All Applicants</span>
        </a>

        <a
          href="/admin/dashboard/ViewCompany"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
        >
          <span className="material-symbols-outlined text-xl mr-4">
            source_environment
          </span>
          <span className="flex-grow text-center">View All Companies</span>
        </a>

        <a
          href="/admin/dashboard/ViewJobs"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
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
      <main className="flex-grow p-8">
        <h1 className="text-xl font-bold text-gray-700">
          View All Job Listings
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white mt-4 rounded-lg shadow-lg">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="py-2 px-4">Company</th>
                <th className="py-2 px-4">Job Title</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobListings.map((job) => (
                <tr
                  key={job.id}
                  className="border-b hover:bg-gray-100 transition-all"
                >
                  <td className="py-2 px-4">{job.company_name}</td>
                  <td className="py-2 px-4">{job.position_name}</td>
                  <td className="py-2 px-4 flex">
                    <button
                      onClick={() => handleViewJob(job.id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-700 shadow-md"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal for viewing job details */}
      {isModalOpen && job && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-[600px] shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Job Details</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={closeModal}
              >
                &times;
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-100 p-4 rounded-lg">
              <div>
                <strong>Company:</strong>
                <p className="shadow-lg p-1">{job.companyName}</p>
              </div>
              <div>
                <strong>Job Title:</strong>
                <p className="shadow-lg p-1">{job.jobName}</p>
              </div>
              <div>
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
              <div>
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
              <div>
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
              <div>
                <strong>Disabilities:</strong>
                <p className="shadow-lg p-1">{job.disabilityTypes}</p>
              </div>
            </div>
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
