import { useState, useEffect } from "react";
import axios from "axios";

const ViewJobs = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [jobListings, setJobListings] = useState([]);
  const [filteredJobListings, setFilteredJobListings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState({});
  const [sortOption, setSortOption] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(4); // Number of jobs to display per page

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
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      sessionStorage.removeItem("Id");
      sessionStorage.removeItem("Role");
      window.location.href = "/login";
    }
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
      // disability_types: updatedDetails.disabilityTypes,
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
    const sortedJobListings = currentJobs.sort((a, b) => {
      if (sortOption === "newest") {
        return b.id - a.id;
      } else if (sortOption === "oldest") {
        return a.id - b.id;
      } else if (sortOption === "a-z") {
        return a.jobName.localeCompare(b.jobName);
      }
      return 0;
    });

    return (
      <div>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold mb-4 text-custom-blue">
            View All Job Listings
          </h2>
          <div className="relative">
            <button
              className="py-2 px-4 mb-0 rounded-lg bg-blue-600 text-white"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              Filter
            </button>
            {isFilterOpen && (
              <div
                className="absolute right-0 top-full mt-0 space-y-2 bg-white p-4 shadow-lg rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={`py-2 px-4 rounded-lg w-full ${
                    sortOption === "newest"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-blue-900"
                  }`}
                  onClick={() => setSortOption("newest")}
                >
                  Newest
                </button>
                <button
                  className={`py-2 px-4 rounded-lg w-full ${
                    sortOption === "oldest"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-blue-900"
                  }`}
                  onClick={() => setSortOption("oldest")}
                >
                  Oldest
                </button>
                <button
                  className={`py-2 px-4 rounded-lg w-full ${
                    sortOption === "a-z"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-blue-900"
                  }`}
                  onClick={() => setSortOption("a-z")}
                >
                  A-Z
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center mb-4">
          <input
            type="text"
            placeholder="Search by job name..."
            className="p-2 border border-gray-300 rounded-lg w-full md:w-1/2"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          {sortedJobListings.length > 0 ? (
            sortedJobListings.map((listing) => (
              <div
                key={listing.id}
                className="flex-1 min-w-[300px] p-4 bg-blue-500 rounded shadow-xl transition-transform duration-200 ease-in-out hover:scale-105 hover:bg-blue-600"
              >
                <div className="flex flex-col text-left">
                  <p className="font-semibold text-lg text-white">
                    Position Name:
                  </p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {listing.jobName}
                  </p>

                  <p className="font-semibold text-lg text-white">
                    Job Description:
                  </p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {listing.description}
                  </p>

                  <p className="font-semibold text-lg text-white">
                    Qualifications:
                  </p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {listing.qualifications}
                  </p>

                  <p className="font-semibold text-lg text-white">
                    Salary Range:
                  </p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {`${listing.minSalary} - ${listing.maxSalary}`}
                  </p>

                  <p className="font-semibold text-lg text-white">
                    Position Type:
                  </p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {listing.positionType}
                  </p>

                  <p className="font-semibold text-lg text-white">
                    Disability Types:
                  </p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {listing.disabilityTypes}
                  </p>

                  {/* Update and Delete Buttons */}
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
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No job listings found.</p>
          )}
        </div>

        {isEditing && renderUpdateJobListings()}

        {/* Pagination */}
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
        } md:translate-x-0 z-50 md:z-auto `}
      >
        <button
          className="text-white md:hidden self-end size-10"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>
        <a
          href="/dashboard/postjob"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          Post Job
        </a>
        <a
          href="/dashboard/ViewJobs"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          View All Job Listings
        </a>

        <a
          href="/company/viewapplicants"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          View Applicants
        </a>

        <button
          className="bg-red-400 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out mt-6"
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
        <div className="mt-0.5">{renderViewAllJobListings()}</div>
      </main>
    </div>
  );
};

export default ViewJobs;
