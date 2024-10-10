import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ViewJobs = () => {
  const [jobListings, setJobListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [job, setJob] = useState(null);
  const [jobUpdate, setJobUpdate] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobListings, setFilteredJobListings] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const companyId = sessionStorage.getItem("Id");
    const config = {
      method: "get",
      url: `/joblisting/view/newesttooldest/company/${companyId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        const jobDataArray = response.data.data;
        setJobListings(jobDataArray);
        setFilteredJobListings(jobDataArray); // Set filtered job listings initially
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleViewJob = (jobId) => {
    const config = {
      method: "get",
      url: `/joblisting/view/${jobId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        const jobData = response.data.data[0];
        setJob(jobData);
        setIsModalOpen(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleUpdateJob = (jobData) => {
    setJobUpdate({
      id: jobData.id,
      jobName: jobData.position_name,
      description: jobData.description,
      qualification: jobData.qualification,
      minimumSalary: jobData.minimum_salary,
      maximumSalary: jobData.maximum_salary,
      positionType: jobData.positiontype_id,
    });
    setIsUpdateModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobUpdate((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    const config = {
      method: "put",
      url: `http://localhost:8080/joblisting/update/${jobUpdate.id}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        position_name: jobUpdate.jobName,
        description: jobUpdate.description,
        qualification: jobUpdate.qualification,
        minimum_salary: jobUpdate.minimumSalary,
        maximum_salary: jobUpdate.maximumSalary,
        positiontype_id:
          jobUpdate.positionType === "fulltime"
            ? 1
            : jobUpdate.positionType === "parttime"
            ? 2
            : null,
      },
    };

    axios(config)
      .then(() => {
        alert("Job updated successfully!");
        setIsUpdateModalOpen(false);
        window.location.reload();
      })
      .catch((error) => {
        console.error(error);
        alert("Error updating job.");
      });
  };

  const handleDeleteJobListing = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job listing?"
    );
    if (confirmed) {
      const config = {
        method: "delete",
        url: `/joblisting/delete/${id}`,
        headers: {
          "Content-Type": "application/json",
        },
      };

      axios(config)
        .then(() => {
          alert("Job listing deleted successfully!");
          setJobListings((prevListings) =>
            prevListings.filter((job) => job.id !== id)
          );
          setFilteredJobListings((prevListings) =>
            prevListings.filter((job) => job.id !== id)
          );
        })
        .catch(() => {
          alert("An error occurred while deleting the job listing.");
        });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setJob(null);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setJobUpdate({});
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filteredJobs = jobListings.filter((job) =>
      job.position_name.toLowerCase().includes(searchValue)
    );
    setFilteredJobListings(filteredJobs);
  };

  const handleViewApplicants = (jobId) => {
    navigate(`/company/viewapplicants?id=${jobId}`);
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard"); // Navigate to the dashboard page
  };

  if (loading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      {/* Sidebar */}
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

        <a
          href="/dashboard/postjob"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
        >
          <span className="material-symbols-outlined text-xl mr-4">work</span>
          <span className="flex-grow text-center">Post Job</span>
        </a>

        <a
          href="/dashboard/ViewJobs"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
        >
          <span className="material-symbols-outlined text-xl mr-4">list</span>
          <span className="flex-grow text-center">View All Job Listings</span>
        </a>

        <button
          className="bg-red-600 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out mt-6"
          onClick={() => {
            sessionStorage.removeItem("Id");
            sessionStorage.removeItem("Role");
            sessionStorage.removeItem("Token");
            navigate("/login");
          }}
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
      <main className="flex-grow p-4 md:p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)} // Go back to the previous page
          className="bg-blue-500 text-white px-4 py-2 mb-6 rounded-lg shadow-lg hover:bg-blue-600 transition"
        >
          ← Back
        </button>

        <h1 className="text-xl font-bold text-gray-700 text-center md:text-left">
          View All Job Listings
        </h1>

        <div className="flex justify-center my-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search job listings..."
            className="p-2 border-2 border-blue-300 rounded-lg w-full md:w-1/2"
          />
        </div>

        {/* Table */}
        <div className="w-full">
          <table className="table-auto w-full bg-white mt-4 rounded-xl">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="py-2 px-2 md:px-4 text-sm md:text-base">
                  Company
                </th>
                <th className="py-2 px-2 md:px-4 text-sm md:text-base">
                  Job Title
                </th>
                <th className="py-2 px-2 md:px-4 text-sm md:text-base">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredJobListings.map((job) => (
                <tr key={job.id} className="border-b">
                  <td className="py-2 px-2 md:px-4 text-sm md:text-base break-words">
                    {job.company_name}
                  </td>
                  <td className="py-2 px-2 md:px-4 text-sm md:text-base break-words">
                    {job.position_name}
                  </td>
                  <td className="py-2 px-2 md:px-4">
                    <div className="flex space-x-1 md:space-x-2 justify-center md:justify-end">
                      <button
                        onClick={() => handleViewJob(job.id)}
                        className="bg-blue-500 text-white p-1 md:px-2 md:py-1 rounded hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <span className="material-symbols-outlined text-base md:text-xl">
                          visibility
                        </span>
                        <span className="ml-1 md:block hidden">View</span>{" "}
                        {/* Hide on mobile */}
                      </button>
                      <button
                        onClick={() => handleDeleteJobListing(job.id)}
                        className="bg-red-500 text-white p-1 md:px-2 md:py-1 rounded hover:bg-red-700 transition-colors flex items-center"
                      >
                        <span className="material-symbols-outlined text-base md:text-xl">
                          delete
                        </span>
                        <span className="ml-1 md:block hidden">Delete</span>{" "}
                        {/* Hide on mobile */}
                      </button>
                      <button
                        onClick={() => handleUpdateJob(job)}
                        className="bg-yellow-500 text-white p-1 md:px-2 md:py-1 rounded hover:bg-yellow-700 transition-colors flex items-center"
                      >
                        <span className="material-symbols-outlined text-base md:text-xl">
                          edit
                        </span>
                        <span className="ml-1 md:block hidden">Edit</span>{" "}
                        {/* Hide on mobile */}
                      </button>
                      <button
                        onClick={() => handleViewApplicants(job.id)}
                        className="bg-green-500 text-white p-1 md:px-2 md:py-1 rounded hover:bg-green-700 transition-colors flex items-center"
                      >
                        <span className="material-symbols-outlined text-base md:text-xl">
                          group_add
                        </span>
                        <span className="ml-1 md:block hidden">Applicants</span>{" "}
                        {/* Hide on mobile */}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal for viewing job details */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-xl mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
              Job Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between bg-gray-200 p-3 rounded-md">
                <p>
                  <strong>Company Name:</strong> {job?.company_name}
                </p>
                <p>
                  <strong>Job Title:</strong> {job?.position_name}
                </p>
              </div>
              <div className="bg-gray-200 p-3 rounded-md">
                <p>
                  <strong>Description:</strong> {job?.description}
                </p>
              </div>
              <div className="bg-gray-200 p-3 rounded-md">
                <p>
                  <strong>Qualification:</strong> {job?.qualification}
                </p>
              </div>
              <div className="flex justify-between bg-gray-200 p-3 rounded-md">
                <span>
                  <strong>Min Salary:</strong> ${job?.minimum_salary}
                </span>
                <span>
                  <strong>Max Salary:</strong> ${job?.maximum_salary}
                </span>
              </div>
              <div className="bg-gray-200 p-3 rounded-md">
                <p>
                  <strong>Position Type:</strong> {job?.position_type}
                </p>
              </div>
            </div>
            <div className="mt-8 flex justify-center space-x-4">
              <button
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for editing job details */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-xl mx-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
              Update Job
            </h2>
            <form onSubmit={handleSubmitUpdate} className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  name="jobName"
                  value={jobUpdate.jobName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={jobUpdate.description}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={jobUpdate.qualification}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  name="minimumSalary"
                  value={jobUpdate.minimumSalary}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  name="maximumSalary"
                  value={jobUpdate.maximumSalary}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-6 text-center">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Update Job
                </button>
                <button
                  type="button"
                  className="ml-4 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                  onClick={closeUpdateModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewJobs;
