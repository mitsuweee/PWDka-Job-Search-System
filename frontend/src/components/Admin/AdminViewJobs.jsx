import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminViewJobs = () => {
  const [jobListings, setJobListings] = useState([]);
  const [filteredJobListings, setFilteredJobListings] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(3); // Number of jobs to display per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobListings = async () => {
      const config = {
        method: "get",
        url: "http://localhost:8080/admin/view/all/joblisting/newesttooldest",
        headers: {
          "Content-Type": "application/json",
        },
      };

      axios(config)
        .then((response) => {
          const fetchedJobListings = response.data.data.map((job) => ({
            id: job.id,
            companyName: job.company_name,
            jobName: job.position_name,
            description: job.description,
            qualification: job.qualification,
            minimumSalary: job.minimum_salary,
            maximumSalary: job.maximum_salary,
            positionType: job.position_type,
            companyProfilePicture: job.company_profile_picture
              ? `data:image/png;base64,${job.company_profile_picture}`
              : null,
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
    };

    fetchJobListings();
  }, []);

  const handleDeleteJobListing = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job listing?"
    );
    if (confirmed) {
      const config = {
        method: "delete",
        url: `http://localhost:8080/admin/delete/joblisting/${id}`,
        headers: {
          "Content-Type": "application/json",
        },
      };

      axios(config)
        .then(() => {
          alert("Job listing deleted successfully!");
          // Optionally, refresh the job listings after deletion
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value !== "") {
      const filteredJobs = jobListings.filter((job) =>
        job.companyName.toLowerCase().includes(e.target.value.toLowerCase())
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

  const renderViewAllJobListings = () => {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4 text-custom-blue">
          View All Job Listings
        </h2>
        <div className="flex justify-center mb-4">
          <input
            type="text"
            placeholder="Search by company name..."
            className="p-2 border-2 border-blue-300 rounded-lg w-full md:w-1/2"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {currentJobs.length > 0 ? (
            currentJobs.map((listing) => (
              <div
                key={listing.id}
                className="flex-1 min-w-[300px] p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <div className="flex flex-col text-left flex-grow">
                  <p className="font-semibold text-lg">Company Name:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue border-2 border-blue-300 p-2">
                    {listing.companyName}
                  </p>

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
                    {listing.qualification}
                  </p>

                  <p className="font-semibold text-lg">Salary:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue border-2 border-blue-300 p-2">
                    {listing.minimumSalary} - {listing.maximumSalary}
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

                <button
                  onClick={() => handleDeleteJobListing(listing.id)}
                  className="mt-4 py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition duration-200"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p className="text-white">No job listings found.</p>
          )}
        </div>
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
    <div className="flex min-h-screen bg-blue-100">
      {/* Mobile Toggle Button */}
      <button
        className={`md:hidden bg-custom-blue text-white p-4 fixed top-4 left-4 z-50 rounded-xl mt-11 transition-transform ${
          isSidebarOpen ? "hidden" : ""
        }`}
        onClick={() => setIsSidebarOpen(true)}
      >
        &#9776;
      </button>

      {/* Sidebar */}
      <aside
        className={`bg-custom-blue w-[300px] lg:w-[250px] p-4 flex flex-col items-center fixed top-0 left-0 h-full z-50 transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <button
          className="text-white md:hidden self-end size-10"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>
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
          <span className="flex-grow text-center">Verify Users</span>
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
          <span className="flex-grow text-center">Verify Company</span>
        </a>

        <a
          href="/admin/dashboard/ViewUsers"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">group</span>
          <span className="flex-grow text-center">View All Users</span>
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

      {/* Main Content */}
      <main
        className={`p-8 bg-custom-bg flex-grow transition-transform md:ml-[300px] lg:ml-[250px]`}
      >
        <div className="flex justify-between items-center">
          <button
            onClick={handleGoBack}
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          >
            Back
          </button>
        </div>
        <div className="mt-4">{renderViewAllJobListings()}</div>
      </main>
    </div>
  );
};

export default AdminViewJobs;
