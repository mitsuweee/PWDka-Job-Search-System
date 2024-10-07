import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ViewJobs = () => {
  const [jobListings, setJobListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
  const [job, setJob] = useState(null); // Store the specific job to view
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Control sidebar visibility for mobile
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [filteredJobListings, setFilteredJobListings] = useState([]); // Filtered job listings
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch job listings from your API
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

  // Fetch and show job details in the modal
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
        const jobData = response.data.data[0]; // Assuming the job object is returned
        setJob(formatJobData(jobData)); // Set the job details
        setIsModalOpen(true); // Open the modal
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Helper function to format job data
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

  // Handle delete job listing
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
    setIsModalOpen(false); // Close the modal
    setJob(null); // Clear the job details
  };

  // Handle search functionality
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filteredJobs = jobListings.filter((job) =>
      job.position_name.toLowerCase().includes(searchValue)
    );
    setFilteredJobListings(filteredJobs);
  };

  // Navigate to the "View Applicants" page with jobId
  const handleViewApplicants = (jobId) => {
    navigate(`/company/viewapplicants?id=${jobId}`); // Redirect to the View Applicants page with job ID
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
          className="text-white md:hidden self-end size-10"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>

        {/* Sidebar Content */}
        <a
          href="/dashboard/postjob"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">work</span>
          <span className="flex-grow text-center">Post Job</span>
        </a>

        <a
          href="/dashboard/ViewJobs"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
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

        {/* Search Input */}
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
          <table className="min-w-full bg-white mt-4">
            <thead>
              <tr className="w-full bg-blue-500 text-white">
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
                  <td className="py-2 px-4 flex">
                    <button
                      onClick={() => handleViewJob(job.id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteJobListing(job.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded mr-2 hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleViewApplicants(job.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      View Applicants
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-11/12 md:max-w-3xl p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 text-center">
              Job Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left text-gray-800 w-full">
              <div>
                <p className="font-semibold text-base sm:text-lg">Company:</p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {job.companyName}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">Job Title:</p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {job.jobName}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  Description:
                </p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {job.description}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  Qualification:
                </p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {job.qualification}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">Salary:</p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {job.minimumSalary} - {job.maximumSalary}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  Position Type:
                </p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {job.positionType}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  Disabilities:
                </p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {job.disabilityTypes}
                </p>
              </div>
            </div>

            {/* Buttons for Back */}
            <div className="mt-6 text-center space-x-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                onClick={closeModal} // Close modal
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewJobs;
