import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // Import react-hot-toast

const ViewJobs = () => {
  const [jobListings, setJobListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [job, setJob] = useState(null);
  const [jobUpdate, setJobUpdate] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobListings, setFilteredJobListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // New loader state
  const [showDisabilityOptions, setShowDisabilityOptions] = useState(false); // Toggle state for disability options
  const [selectedDisabilityCategories, setSelectedDisabilityCategories] =
    useState([]); // State to handle selected disability categories

  const navigate = useNavigate();

  useEffect(() => {
    const companyId = localStorage.getItem("Id");
    const config = {
      method: "get",
      url: `/joblisting/view/newesttooldest/company/${companyId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    setIsLoading(true); // Show loader while fetching jobs
    axios(config)
      .then((response) => {
        const jobDataArray = response.data.data;
        setJobListings(jobDataArray);
        setFilteredJobListings(jobDataArray); // Set filtered job listings initially
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error loading jobs."); // Show toast for error
        setLoading(false);
      })
      .finally(() => {
        setIsLoading(false); // Hide loader
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

    setIsLoading(true); // Show loader while fetching job details
    axios(config)
      .then((response) => {
        const jobData = response.data.data[0];
        setJob(jobData);
        setIsModalOpen(true);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error fetching job details."); // Show toast for error
      })
      .finally(() => {
        setIsLoading(false); // Hide loader
      });
  };

  const handleUpdateJob = (jobData) => {
    setJobUpdate({
      id: jobData.id,
      jobName: jobData.position_name,
      description: jobData.description,
      requirements: jobData.requirement,
      qualification: jobData.qualification,
      minimumSalary: jobData.minimum_salary,
      maximumSalary: jobData.maximum_salary,
      salaryVisibility: jobData.salary_visibility || "HIDE", // Capture salary visibility
      status: jobData.status || "ACTIVE", // Capture job status
      positionType: jobData.positiontype_id === 1 ? "fulltime" : "parttime",
      disabilityCategories: jobData.disability_ids || [], // Capture disability categories
    });
    setSelectedDisabilityCategories(jobData.disability_ids || []); // Initialize the selected disabilities
    setIsUpdateModalOpen(true);
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedDisabilityCategories((prev) => [...prev, value]);
    } else {
      setSelectedDisabilityCategories((prev) =>
        prev.filter((category) => category !== value)
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobUpdate((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    const config = {
      method: "put",
      url: `/joblisting/update/${jobUpdate.id}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        position_name: jobUpdate.jobName, // Match the backend field naming convention
        description: jobUpdate.description,
        qualification: jobUpdate.qualification,
        requirement: jobUpdate.requirements, // Ensure the key matches the state
        minimum_salary: jobUpdate.minimumSalary, // Match backend naming
        maximum_salary: jobUpdate.maximumSalary, // Match backend naming
        salary_visibility: jobUpdate.salaryVisibility, // Correct field naming
        status: jobUpdate.status, // Make sure this matches your data field naming
        positiontype_id:
          jobUpdate.positionType === "fulltime"
            ? 1
            : jobUpdate.positionType === "parttime"
            ? 2
            : null,
        disability_ids: selectedDisabilityCategories, // Include selected disabilities
      },
    };

    setIsLoading(true);
    axios(config)
      .then(() => {
        toast.success("Job updated successfully!");
        setIsUpdateModalOpen(false);
        window.location.reload();
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error updating job.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDeleteJobListing = (id) => {
    setSelectedJobId(id); // Store the selected job ID
    setIsDeleteModalOpen(true); // Open the delete confirmation modal
  };

  const confirmDelete = () => {
    if (selectedJobId) {
      const config = {
        method: "delete",
        url: `/joblisting/delete/${selectedJobId}`,
        headers: {
          "Content-Type": "application/json",
        },
      };

      setIsLoading(true); // Show loader during deletion
      axios(config)
        .then(() => {
          toast.success("Job listing deleted successfully!"); // Success notification
          setJobListings((prevListings) =>
            prevListings.filter((job) => job.id !== selectedJobId)
          );
          setFilteredJobListings((prevListings) =>
            prevListings.filter((job) => job.id !== selectedJobId)
          );
        })
        .catch(() => {
          toast.error("An error occurred while deleting the job listing.");
        })
        .finally(() => {
          setIsLoading(false); // Hide loader
        });

      setIsDeleteModalOpen(false); // Close the delete confirmation modal
      setSelectedJobId(null); // Clear the selected job ID
    }
  };
  const toggleDisabilityOptions = () => {
    setShowDisabilityOptions(!showDisabilityOptions); // Toggle visibility of disability options
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setJob(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false); // Close modal
    setSelectedJobId(null); // Reset the selected job ID
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

  if (loading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      <Toaster position="top-center" reverseOrder={false} />{" "}
      {/* Toast notifications */}
      {/* Loader */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="text-white text-2xl">Loading...</div>
        </div>
      )}
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
            localStorage.removeItem("Id");
            localStorage.removeItem("Role");
            localStorage.removeItem("Token");
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
                    {job.position_name
                      ? job.position_name
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")
                      : ""}
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
          <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
              Job Details
            </h2>
            <div className="space-y-4">
              <div>
                <div className="bg-gray-200 p-3 rounded-md mb-2">
                  <p>
                    <strong>Company Name:</strong> {job?.company_name}
                  </p>
                </div>
                <div className="bg-gray-200 p-3 rounded-md">
                  <p>
                    <strong>Job Title:</strong> {job?.position_name}
                  </p>
                </div>
              </div>
              <div className="bg-gray-200 p-3 rounded-md">
                <p>
                  <strong>Description:</strong>{" "}
                  {job?.description
                    ? job.description
                        .split(".")
                        .map(
                          (sentence) =>
                            sentence.trim().charAt(0).toUpperCase() +
                            sentence.trim().slice(1).toLowerCase()
                        )
                        .join(". ")
                    : ""}
                </p>
              </div>
              <div className="bg-gray-200 p-3 rounded-md">
                <p>
                  <strong>Requirements:</strong>{" "}
                  {job?.requirement
                    ? job.requirement
                        .split(",")
                        .map(
                          (part) =>
                            part.trim().charAt(0).toUpperCase() +
                            part.trim().slice(1).toLowerCase()
                        )
                        .join(", ")
                    : ""}
                </p>
              </div>
              <div className="bg-gray-200 p-3 rounded-md">
                <p>
                  <strong>Qualification:</strong>{" "}
                  {job?.qualification
                    ? job.qualification
                        .split(",")
                        .map(
                          (part) =>
                            part.trim().charAt(0).toUpperCase() +
                            part.trim().slice(1).toLowerCase()
                        )
                        .join(", ")
                    : ""}
                </p>
              </div>

              <div className="flex justify-between bg-gray-200 p-3 rounded-md">
                <span>
                  <strong>Min Salary:</strong> ₱ {job?.minimum_salary}
                </span>
                <span>
                  <strong>Max Salary:</strong> ₱ {job?.maximum_salary}
                </span>
              </div>

              <div className="bg-gray-200 p-3 rounded-md">
                <p>
                  <strong>Position Type:</strong>{" "}
                  {job?.position_type
                    ? job.position_type
                        .split("-")
                        .map(
                          (part) =>
                            part.trim().charAt(0).toUpperCase() +
                            part.trim().slice(1).toLowerCase()
                        )
                        .join(" - ")
                    : ""}
                </p>
              </div>
              {/* Salary Visibility */}
              <div className="bg-gray-200 p-3 rounded-md">
                <p>
                  <strong>Salary Visibility:</strong>{" "}
                  {job?.salary_visibility === "SHOW" ? "Visible" : "Hidden"}
                </p>
              </div>

              {/* Disability Categories */}
              {job?.disability_types ? (
                <div className="bg-gray-200 p-3 rounded-md">
                  <p>
                    <strong>Disability Categories:</strong>
                  </p>
                  <ul className="list-disc pl-5">
                    {job.disability_types
                      .split(",")
                      .map((disability, index) => (
                        <li key={index}>{disability.trim()}</li>
                      ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-gray-200 p-3 rounded-md">
                  <p>No disability categories specified.</p>
                </div>
              )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="relative max-w-5xl w-full mx-auto mb-6 mt-6 p-6 bg-white rounded-xl shadow-lg space-y-6 transform transition-all hover:shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 transition"
              onClick={closeUpdateModal}
            >
              <span className="text-2xl font-bold">&times;</span>
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-custom-blue">
                Update Job Details
              </h2>
              <form
                onSubmit={handleSubmitUpdate}
                className="bg-white p-4 rounded-xl shadow-lg text-left grid grid-cols-2 gap-6 border border-gray-200"
              >
                <div className="col-span-2">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Position Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jobName"
                    value={jobUpdate.jobName}
                    onChange={handleChange}
                    className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={jobUpdate.description}
                    onChange={handleChange}
                    className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm h-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="requirements"
                    value={jobUpdate.requirements}
                    onChange={handleChange}
                    className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm h-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Requirement1, Requirement2, Requirement3"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Qualifications <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="qualification"
                    value={jobUpdate.qualification}
                    onChange={handleChange}
                    className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm h-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Qualification1, Qualification2, Qualification3"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-1 text-gray-700 font-semibold">
                      Min-Salary <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="minimumSalary"
                      value={jobUpdate.minimumSalary}
                      onChange={handleChange}
                      className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-gray-700 font-semibold">
                      Max-Salary <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="maximumSalary"
                      value={jobUpdate.maximumSalary}
                      onChange={handleChange}
                      className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-1">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Salary Visibility <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="salaryVisibility"
                    value={jobUpdate.salaryVisibility}
                    onChange={handleChange}
                    className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="SHOW">Show</option>
                    <option value="HIDE">Hide</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Joblisting Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status" // Ensure 'name' matches the jobUpdate field
                    value={jobUpdate.status} // Ensure this reflects the state field 'status'
                    onChange={handleChange} // Handle change correctly
                    className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Position Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="positionType"
                    value={jobUpdate.positionType}
                    onChange={handleChange}
                    className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="">Select Position Type</option>
                    <option value="fulltime">Full-time</option>
                    <option value="parttime">Part-time</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={toggleDisabilityOptions}
                    className="bg-blue-600 text-white px-3 py-2 rounded shadow-lg hover:bg-blue-700 transition"
                  >
                    {showDisabilityOptions
                      ? "Hide Disability Options"
                      : "Show Disability Options"}
                  </button>
                </div>

                {showDisabilityOptions && (
                  <div className="col-span-2 bg-gray-100 p-3 rounded-lg shadow-md border border-gray-300">
                    <label className="block mb-1 text-gray-700 font-bold">
                      Disability Categories
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {[
                        "Visual Disability",
                        "Deaf or Hard of Hearing",
                        "Learning Disability",
                        "Mental Disability",
                        "Physical Disability (Orthopedic)",
                        "Psychosocial Disability",
                        "Speech and Language Impairment",
                        "Intellectual Disability",
                        "Cancer (RA11215)",
                        "Rare Disease (RA10747)",
                      ].map((category) => (
                        <label key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            value={category}
                            checked={selectedDisabilityCategories.includes(
                              category
                            )}
                            onChange={handleCheckboxChange}
                            className="mr-2"
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-600 transition"
                  >
                    Update Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this job listing? This will also
              delete all job applications for this listing.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={closeDeleteModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewJobs;
