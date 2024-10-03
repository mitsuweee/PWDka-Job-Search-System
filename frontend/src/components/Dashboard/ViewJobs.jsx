import { useState, useEffect } from "react";
import axios from "axios";

const ViewJobs = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [jobListings, setJobListings] = useState([]);
  const [filteredJobListings, setFilteredJobListings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(3); // Number of jobs to display per page
  const [isModalOpen, setIsModalOpen] = useState(false); // State for logout modal

  // Fetch job listings
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
        const fetchedJobListings = response.data.data.map((job) => ({
          id: job.id,
          jobName: job.position_name,
          description: job.description,
          qualifications: job.qualification,
          minSalary: job.minimum_salary,
          maxSalary: job.maximum_salary,
          positionType: job.position_type,
          disabilityTypes: job.disability_types,
        }));
        setJobListings(fetchedJobListings);
        setFilteredJobListings(fetchedJobListings); // Initialize filtered jobs
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        alert(errorMessage);
      });
  }, []);

  const handleLogout = () => {
    setIsModalOpen(true); // Open the modal when logout is clicked
  };

  const confirmLogout = () => {
    // Logic for logout
    sessionStorage.removeItem("Id");
    sessionStorage.removeItem("Role");
    sessionStorage.removeItem("Token");
    window.location.href = "/login";
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close modal without logging out
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);

    const updateJobListing = JSON.stringify({
      id: updatedDetails.id,
      position_name: updatedDetails.positionName,
      description: updatedDetails.jobDescription,
      qualification: updatedDetails.qualifications,
      minimum_salary: parseFloat(updatedDetails.salary.split("-")[0]),
      maximum_salary: parseFloat(updatedDetails.salary.split("-")[1]),
      positiontype_id: updatedDetails.positionType === "full-time" ? 1 : 2,
    });

    const config = {
      method: "put",
      url: `/joblisting/update/${updatedDetails.id}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: updateJobListing,
    };

    axios(config)
      .then((response) => {
        alert(response.data.message);
        window.location.reload();
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
  };

  const handleDelete = (jobId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job listing?"
    );
    if (confirmDelete) {
      const config = {
        method: "delete",
        url: `/joblisting/delete/${jobId}`,
        headers: {
          "Content-Type": "application/json",
        },
      };

      axios(config)
        .then(() => {
          alert("Job listing deleted successfully!");
          setJobListings((prevListings) =>
            prevListings.filter((listing) => listing.id !== jobId)
          );
          setFilteredJobListings((prevListings) =>
            prevListings.filter((listing) => listing.id !== jobId)
          );
        })
        .catch((error) => {
          alert(error.response.data.message);
        });
    }
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value !== "") {
      const filteredJobs = jobListings.filter((job) =>
        job.jobName.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredJobListings(filteredJobs);
    } else {
      setFilteredJobListings(jobListings);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Get current jobs
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobListings.slice(
    indexOfFirstJob,
    indexOfLastJob
  );

  const renderUpdateJobListings = () => {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Update Job Listing</h2>
        <form
          onSubmit={handleUpdateSubmit}
          className="bg-blue-500 p-6 rounded shadow-md text-center"
        >
          <div className="mb-4 text-left">
            <label className="block mb-2 text-white">Position Name</label>
            <input
              type="text"
              name="positionName"
              value={updatedDetails.positionName}
              onChange={handleUpdateChange}
              className="p-2 w-full rounded"
              required
            />
          </div>
          <div className="mb-4 text-left">
            <label className="block mb-2 text-white">Job Description</label>
            <textarea
              name="jobDescription"
              value={updatedDetails.jobDescription}
              onChange={handleUpdateChange}
              className="p-2 w-full rounded"
              required
            />
          </div>
          <div className="mb-4 text-left">
            <label className="block mb-2 text-white">Qualifications</label>
            <textarea
              name="qualifications"
              value={updatedDetails.qualifications}
              onChange={handleUpdateChange}
              className="p-2 w-full rounded"
              required
            />
          </div>
          <div className="mb-4 text-left">
            <label className="block mb-2 text-white">Salary</label>
            <input
              type="text"
              name="salary"
              value={updatedDetails.salary}
              onChange={handleUpdateChange}
              className="p-2 w-full rounded"
              required
            />
          </div>
          <div className="mb-4 text-left">
            <label className="block mb-2 text-white">Position Type</label>
            <select
              name="positionType"
              value={updatedDetails.positionType}
              onChange={handleUpdateChange}
              className="p-2 w-full rounded"
              required
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white py-2 px-4 rounded"
          >
            Update Job
          </button>
        </form>
      </div>
    );
  };

  const renderViewAllJobListings = () => {
    const sortedJobListings = currentJobs;

    return (
      <div>
        <h2 className="text-xl font-bold mb-4 text-custom-blue">
          View All Job Listings
        </h2>
        <div className="flex justify-center mb-4">
          <input
            type="text"
            placeholder="Search by job name..."
            className="p-2 border-2 border-blue-300 rounded-lg w-full md:w-1/2"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {sortedJobListings.length > 0 ? (
            sortedJobListings.map((listing) => (
              <div
                key={listing.id}
                className="flex-1 min-w-[300px] p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <div className="flex flex-col text-left flex-grow">
                  <p className="font-semibold text-lg">Job Name:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue border-2 border-blue-300 p-2">
                    {listing.jobName}
                  </p>

                  <p className="font-semibold text-lg">Description:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue border-2 border-blue-300 p-2 break-words overflow-hidden max-h-[150px] overflow-y-auto">
                    {listing.description}
                  </p>

                  <p className="font-semibold text-lg">Qualification:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue border-2 border-blue-300 p-2">
                    {listing.qualifications}
                  </p>

                  <p className="font-semibold text-lg">Salary:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue border-2 border-blue-300 p-2">
                    {listing.minSalary} - {listing.maxSalary}
                  </p>

                  <p className="font-semibold text-lg">Position Type:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue border-2 border-blue-300 p-2">
                    {listing.positionType}
                  </p>

                  <p className="font-semibold text-lg">Disabilities:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue border-2 border-blue-300 p-2">
                    {listing.disabilityTypes}
                  </p>
                </div>

                {/* Update, Delete, View Applicants Buttons */}
                <div className="mt-4 flex space-x-4">
                  <button
                    className="py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                    onClick={() => {
                      setUpdatedDetails({
                        id: listing.id,
                        positionName: listing.jobName,
                        jobDescription: listing.description,
                        qualifications: listing.qualifications,
                        salary: `${listing.minSalary}-${listing.maxSalary}`,
                        positionType: listing.positionType,
                      });
                      setIsEditing(true);
                    }}
                  >
                    Update
                  </button>
                  <button
                    className="py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300"
                    onClick={() => handleDelete(listing.id)}
                  >
                    Delete
                  </button>
                  <a href={`/company/viewapplicants?id=${listing.id}`}>
                    <button className="bg-blue-500 text-white py-3 px-6 rounded-full shadow-lg hover:bg-blue-600 hover:shadow-2xl transition transform hover:scale-105">
                      View Applicants
                    </button>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white">No job listings found.</p>
          )}
        </div>
        <div className="flex justify-center mt-6">
          {Array.from(
            { length: Math.ceil(filteredJobListings.length / jobsPerPage) },
            (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`mx-1 px-3 py-1 rounded-lg ${
                  currentPage === index + 1
                    ? "bg-blue-900 text-white"
                    : "bg-gray-200 text-blue-900"
                }`}
              >
                {index + 1}
              </button>
            )
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
          className="bg-red-600 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out mt-6 flex items-center justify-center"
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
        <h1 className="text-3xl font-bold text-blue-900">View Jobs</h1>
        <div className="mt-0.5">
          {isEditing ? renderUpdateJobListings() : renderViewAllJobListings()}
        </div>
      </main>

      {/* Logout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Logout Confirmation
              </h2>
              <button
                onClick={closeModal}
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

            {/* Modal Body */}
            <div className="mb-6">
              <p className="text-lg text-gray-600">
                Are you sure you want to logout? You will need to log back in to
                view or manage job listings.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
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

export default ViewJobs;
