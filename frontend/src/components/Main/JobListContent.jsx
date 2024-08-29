import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const JobListing = () => {
  const [jobs, setJobs] = useState([]); // State to hold the jobs data
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isMoreInfoVisible, setIsMoreInfoVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const jobsPerPage = 4; // Number of jobs to display per page
  const navigate = useNavigate();

  useEffect(() => {
    const userId = sessionStorage.getItem("Id");
    const config = {
      method: "get",
      url: `/joblisting/view/newesttooldest/${userId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        console.log(response.data);

        // Combine job and company details into one object per job
        const fetchedJobs = response.data.data.map((job) => ({
          id: job.id,
          jobName: job.position_name,
          address: job.company_address,
          positionType: job.position_type,
          salary: `${job.minimum_salary}-${job.maximum_salary}`,
          description: job.description,
          qualifications: job.qualification,
          companyName: job.company_name,
          companyEmail: job.company_email,
          companyContact: job.company_contact_number,
          companyLocation: job.company_address,
          companyDescription: job.company_description,
          companyImage: `data:image/png;base64,${job.company_profile_picture}`, // Placeholder for company logo
        }));

        setJobs(fetchedJobs); // Setting the jobs state
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log(error.response?.data);
        alert(errorMessage);
      });
  }, []);

  const filteredJobs = jobs
    .filter((job) =>
      job.jobName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "newest") {
        return b.id - a.id;
      } else if (sortOption === "oldest") {
        return a.id - b.id;
      } else if (sortOption === "a-z") {
        return a.jobName.localeCompare(b.jobName);
      }
      return 0;
    });

  // Pagination Logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const selectedJob = jobs.find((job) => job.id === selectedJobId);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      sessionStorage.removeItem("Id");
      sessionStorage.removeItem("Role");
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full">
      {/* Left Part - Job Listings */}
      <div className="lg:w-1/2 p-4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search Job Name"
            className="w-3/4 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="relative">
            <button
              className="ml-4 px-8 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              Filter
            </button>
            {isFilterOpen && (
              <div
                className="absolute right-0 top-full mt-0 bg-white p-4 shadow-lg rounded-lg z-50"
                style={{ marginTop: "0" }}
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
                  className={`py-2 px-3 rounded-lg w-full ${
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
          <button
            onClick={handleLogout}
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-blue-600 text-'sfprobold">
          Jobs for You
        </h1>
        <div className="space-y-4">
          {currentJobs.length > 0 ? (
            currentJobs.map((job) => (
              <div key={job.id}>
                <div
                  className="p-4 bg-blue-500 rounded-lg shadow-3xl cursor-pointer hover:bg-blue-600 transition transform hover:scale-95 flex items-center"
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setIsDetailsVisible(true); // Show job details below the clicked div on mobile
                    setIsMoreInfoVisible(false); // Reset more info visibility
                  }}
                >
                  {/* Company Logo */}
                  <img
                    src={job.companyImage}
                    alt="Company Logo"
                    className="w-24 h-24 object-cover rounded-xl mr-4 shadow-xl"
                  />
                  {/* Job Details */}
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      <span className="material-symbols-outlined mr-2">
                        work
                      </span>
                      {job.jobName}
                    </h2>
                    <p className="text-white">
                      <span className="material-symbols-outlined mr-2">
                        location_on
                      </span>
                      {job.companyLocation}
                    </p>
                    <p className="font-semibold text-white">
                      <span className="material-symbols-outlined mr-2">
                        schedule
                      </span>
                      {job.positionType}
                    </p>
                    <p className="font-semibold text-white">
                      <span className="material-symbols-outlined mr-2">
                        payments
                      </span>
                      {job.salary}
                    </p>
                    <p className="text-gray-200 mt-2">{job.description}</p>
                  </div>
                </div>
                {/* Mobile-Only Popup */}
                {isDetailsVisible && selectedJobId === job.id && (
                  <div className="lg:hidden mt-4 p-4 bg-white rounded-lg shadow-lg relative">
                    {/* X Button */}
                    <button
                      onClick={() => setIsDetailsVisible(false)}
                      className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                    >
                      &times;
                    </button>
                    <h2 className="text-2xl font-bold mb-2 text-blue-600">
                      {job.jobName}
                    </h2>
                    <p className="text-lg mb-2 text-gray-700">
                      {job.companyName}
                    </p>
                    <p className="text-md mb-2 text-gray-500">
                      {job.companyLocation}
                    </p>
                    <p className="font-bold text-md text-blue-600">
                      {job.positionType}
                    </p>
                    <p className="font-bold text-md mb-2 text-blue-600">
                      {job.salary}
                    </p>
                    <p className="text-md text-gray-700 mb-2">
                      {job.description}
                    </p>
                    <p className="mt-2 text-md font-semibold text-gray-800">
                      Qualifications:
                    </p>
                    <p className="text-md text-gray-700">
                      {job.qualifications}
                    </p>
                    <div className="mt-4 flex space-x-4">
                      <button className="bg-blue-500 text-white py-2 px-4 rounded-full shadow-lg hover:bg-blue-600 transition transform hover:scale-105">
                        Apply Now
                      </button>
                      <button
                        className="bg-gray-500 text-white py-2 px-4 rounded-full shadow-lg hover:bg-gray-600 transition transform hover:scale-105"
                        onClick={() => setIsMoreInfoVisible(true)}
                      >
                        Learn More
                      </button>
                    </div>
                    {/* Additional Info Popup on Mobile */}
                    {isMoreInfoVisible && (
                      <div className="mt-4 p-4 bg-blue-600 rounded-lg shadow-lg relative">
                        <img
                          src={job.companyImage}
                          alt="Company"
                          className="w-22 h-22 object-cover rounded-2xl absolute top-2 right-2"
                        />
                        <h3 className="text-lg font-bold text-white">
                          Company Overview
                        </h3>
                        <p className="text-white">
                          <strong>Company Name:</strong> {job.companyName}
                        </p>
                        <p className="text-white">
                          <strong>Email:</strong> {job.companyEmail}
                        </p>
                        <p className="text-white">
                          <strong>Contact Number:</strong> {job.companyContact}
                        </p>
                        <p className="text-white">
                          <strong>Primary Location:</strong>{" "}
                          {job.companyLocation}
                        </p>
                        <div className="text-md text-white">
                          {job.companyDescription}
                        </div>
                        <button
                          className="mt-2 text-white hover:underline"
                          onClick={() => setIsMoreInfoVisible(false)}
                        >
                          X
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600">No jobs found.</p>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-6">
          <ol className="flex justify-center gap-1 text-xs font-medium">
            {/* Previous Page Button */}
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
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>

            {/* Page Numbers */}
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

            {/* Next Page Button */}
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
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>
          </ol>
        </div>
      </div>

      {/* Right Part - Job Details for Desktop */}
      <div className={`lg:w-1/2 p-4 hidden lg:block`}>
        {selectedJob ? (
          <div key={selectedJob.id}>
            <div className="p-6 bg-white rounded-lg shadow-2xl">
              <h2 className="text-3xl font-bold mb-4 text-blue-600">
                {selectedJob.jobName}
              </h2>
              <p className="text-lg mb-2 text-gray-700 flex items-center">
                <span className="material-symbols-outlined mr-2">work</span>
                {selectedJob.companyName}
              </p>

              <p className="text-lg mb-4 text-gray-500">
                <span className="material-symbols-outlined mr-2">
                  location_on
                </span>
                {selectedJob.companyLocation}
              </p>
              <p className="font-bold text-lg text-blue-600">
                <span className="material-symbols-outlined mr-2">schedule</span>
                {selectedJob.positionType}
              </p>
              <p className="font-bold text-lg mb-4 text-blue-600">
                <span className="material-symbols-outlined mr-2">payments</span>
                {selectedJob.salary}
              </p>
              <p className="text-lg text-gray-700 mb-4">
                {selectedJob.description}
              </p>
              <p className="mt-4 text-lg font-semibold text-gray-800">
                Qualifications:
              </p>
              <p className="text-lg text-gray-700">
                {selectedJob.qualifications}
              </p>
              <div className="mt-6 flex space-x-4">
                <a href={"/apply?id=" + selectedJob.id}>
                  <button className="bg-blue-500 text-white py-3 px-6 rounded-full shadow-lg hover:bg-blue-600 hover:shadow-2xl transition transform hover:scale-105">
                    Apply Now
                  </button>
                </a>
                <button
                  className="bg-gray-500 text-white py-3 px-6 rounded-full shadow-lg hover:bg-gray-600 hover:shadow-2xl transition transform hover:scale-105"
                  onClick={() => setIsMoreInfoVisible(!isMoreInfoVisible)}
                >
                  Learn More
                </button>
              </div>
            </div>
            {/* Additional Info Section on Desktop */}
            {isMoreInfoVisible && (
              <div className="mt-4 p-6 bg-blue-600 rounded-lg shadow-2xl relative">
                <img
                  src={selectedJob.companyImage}
                  alt="Company"
                  className="w-20 h-20 object-cover rounded-full absolute top-6 right-6"
                />
                <h3 className="text-2xl font-bold text-white">
                  Company Overview
                </h3>
                <p className="text-white">
                  <strong>Company Name:</strong> {selectedJob.companyName}
                </p>
                <p className="text-white">
                  <strong>Email:</strong> {selectedJob.companyEmail}
                </p>
                <p className="text-white">
                  <strong>Contact Number:</strong> {selectedJob.companyContact}
                </p>
                <p className="text-white">
                  <strong>Primary Location:</strong>{" "}
                  {selectedJob.companyLocation}
                </p>
                <p className="text-lg text-white break-words">
                  {selectedJob.companyDescription}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-white rounded-lg shadow-lg text-center">
            <p className="text-xl text-gray-600">
              Select a job listing to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListing;
