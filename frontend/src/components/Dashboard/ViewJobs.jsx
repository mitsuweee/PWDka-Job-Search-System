import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ViewJobs = () => {
  const [jobListings, setJobListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Control update modal visibility
  const [job, setJob] = useState(null); // Store the specific job to view
  const [jobUpdate, setJobUpdate] = useState({}); // State for job update
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Control sidebar visibility for mobile
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [filteredJobListings, setFilteredJobListings] = useState([]); // Filtered job listings
  const [activeActionJobId, setActiveActionJobId] = useState(null); // Track jobId for toggled action

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
        setJob(formatJobData(jobData));
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

  const formatJobData = (jobData) => {
    return {
      id: jobData.id,
      companyName: jobData.company_name,
      jobName: jobData.position_name,
      description: jobData.description,
      qualification: jobData.qualification,
      minimumSalary: jobData.minimum_salary,
      maximumSalary: jobData.maximum_salary,
      positionType: jobData.position_type,
      disabilityTypes: jobData.disability_types,
    };
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

  const toggleActions = (jobId) => {
    setActiveActionJobId((prev) => (prev === jobId ? null : jobId));
  };

  if (loading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
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
          href="/dashboard/postjob"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">work</span>
          <span className="flex-grow text-center">Post Job</span>
        </a>

        <a
          href="/dashboard/ViewJobs"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
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

        <div className="flex justify-center my-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search job listings..."
            className="p-2 border-2 border-blue-300 rounded-lg w-full md:w-1/2"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white mt-4 rounded-xl">
            <thead>
              <tr className="min-w-full bg-blue-500 text-white rounded-xl">
                <th className="py-2 px-4">Company</th>
                <th className="py-2 px-4">Job Title</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobListings.map((job) => (
                <tr key={job.id} className="border-b">
                  <td className="py-2 px-4">{job.company_name}</td>
                  <td className="py-2 px-4">{job.position_name}</td>
                  <td className="py-2 px-4">
                    <div className="flex justify-end space-x-2 mr-4">
                      <button
                        onClick={() => handleViewJob(job.id)}
                        className="flex items-center bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-2xl">
                          visibility
                        </span>
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteJobListing(job.id)}
                        className="flex items-center bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-2xl">
                          delete
                        </span>
                        Delete
                      </button>
                      <button
                        onClick={() => handleUpdateJob(job)}
                        className="flex items-center bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-2xl">
                          edit
                        </span>
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewApplicants(job.id)}
                        className="flex items-center bg-green-500 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-2xl">
                          group_add
                        </span>
                        Applicants
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
      {/* Modal for viewing job details */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white w-full max-w-3xl p-8 rounded-lg shadow-xl transform transition-transform duration-300 ease-in-out">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
              Job Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between bg-gray-200 p-3 rounded-md">
                <p>
                  <strong>Company Name:</strong> {job?.companyName}
                </p>
                <p>
                  <strong>Job Title:</strong> {job?.jobName}
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
                  <strong>Min Salary:</strong> ${job?.minimumSalary}
                </span>
                <span>
                  <strong>Max Salary:</strong> ${job?.maximumSalary}
                </span>
              </div>
              <div className="bg-gray-200 p-3 rounded-md">
                <p>
                  <strong>Position Type:</strong> {job?.positionType}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white w-full max-w-3xl p-8 rounded-lg shadow-xl transform transition-transform duration-300 ease-in-out">
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
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Position Type
                </label>
                <input
                  type="text"
                  name="positionType"
                  value={jobUpdate.positionType}
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
