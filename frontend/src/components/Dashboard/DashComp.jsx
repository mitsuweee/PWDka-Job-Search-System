import { useState, useEffect } from "react";
import axios from "axios";

const CompanyDashboard = () => {
  const [currentSection, setCurrentSection] = useState("postJob");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [showDisabilityOptions, setShowDisabilityOptions] = useState(false);
  const [jobListings, setJobListings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // State for the Post Job section
  const [jobDetails, setJobDetails] = useState({
    companyName: "",
    positionName: "",
    jobDescription: "",
    qualifications: "",
    minSalary: "",
    maxSalary: "",
    positionType: "full-time",
    disabilityCategories: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = JSON.stringify({
      company_id: sessionStorage.getItem("Id"),
      position_name: jobDetails.positionName.toLowerCase(),
      description: jobDetails.jobDescription,
      qualification: jobDetails.qualifications,
      minimum_salary: jobDetails.minSalary,
      maximum_salary: jobDetails.maxSalary,
      positiontype_id: jobDetails.positionType,
      disability_ids: jobDetails.disabilityCategories,
    });
    console.log(data);
    const config = {
      method: "post",
      url: "http://localhost:8080/joblisting/post/job", // Ensure this matches your backend endpoint
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then((response) => {
        console.log(response.data);
        alert("Job posted successfully!");
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log(error.response?.data);
        alert(errorMessage);
      });
  };

  const renderPostJob = () => {
    return (
      <div>
        <h2 className="text-xl font-bold mb-1 text-custom-blue">Post a Job</h2>
        <form
          onSubmit={handleSubmit}
          className="bg-blue-500 p-6 rounded-xl shadow-xl text-center "
        >
          <div className="mb-4 text-left">
            <label className="block mb-2 text-white">Position Name</label>
            <input
              type="text"
              name="positionName"
              value={jobDetails.positionName}
              onChange={handleChange}
              className="p-2 w-full rounded shadow-lg"
              style={{
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              }}
              required
            />
          </div>
          <div className="mb-4 text-left">
            <label className="block mb-2 text-white">Job Description</label>
            <textarea
              name="jobDescription"
              value={jobDetails.jobDescription}
              onChange={handleChange}
              className="p-2 w-full rounded shadow-lg"
              style={{
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              }}
              required
            />
          </div>
          <div className="mb-4 text-left">
            <label className="block mb-2 text-white">Qualifications</label>
            <textarea
              name="qualifications"
              value={jobDetails.qualifications}
              onChange={handleChange}
              className="p-2 w-full rounded shadow-lg"
              style={{
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              }}
              required
            />
          </div>
          <div className="flex mb-4 space-x-4">
            <div className="text-left w-1/2">
              <label className="block mb-2 text-white">Min-Salary</label>
              <input
                type="text"
                name="minSalary"
                value={jobDetails.minSalary}
                onChange={handleChange}
                className="p-2 w-full rounded shadow-lg"
                style={{
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                }}
                required
              />
            </div>
            <div className="text-left w-1/2">
              <label className="block mb-2 text-white">Max-Salary</label>
              <input
                type="text"
                name="maxSalary"
                value={jobDetails.maxSalary}
                onChange={handleChange}
                className="p-2 w-full rounded shadow-lg"
                style={{
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                }}
                required
              />
            </div>
          </div>
          <div className="mb-4 text-left">
            <label className="block mb-2 text-white">Position Type</label>
            <select
              name="positionType"
              value={jobDetails.positionType}
              onChange={handleChange}
              className="p-2 w-full rounded shadow-lg"
              style={{
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              }}
              required
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
            </select>
          </div>

          <div className="mb-4 text-left">
            <button
              type="button"
              onClick={toggleDisabilityOptions}
              className="bg-green-500 text-white px-4 py-2 rounded shadow-lg"
            >
              {showDisabilityOptions
                ? "Hide Disability Options"
                : "Show Disability Options"}
            </button>
          </div>

          {showDisabilityOptions && (
            <div className="mb-4 text-left bg-gray-200 p-4 rounded-lg shadow-lg">
              <label className="block mb-2 text-black font-bold">
                Disability Categories
              </label>
              <div className="flex flex-col space-y-2 text-black">
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
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="cursor-pointer transition-all bg-green-500 text-white px-6 py-2 rounded-lg
            border-green-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px]
            hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
          >
            Post Job
          </button>
        </form>
      </div>
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobDetails({ ...jobDetails, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setJobDetails((prevDetails) => ({
        ...prevDetails,
        disabilityCategories: [...prevDetails.disabilityCategories, value],
      }));
    } else {
      setJobDetails((prevDetails) => ({
        ...prevDetails,
        disabilityCategories: prevDetails.disabilityCategories.filter(
          (category) => category !== value
        ),
      }));
    }
  };

  const toggleDisabilityOptions = () => {
    setShowDisabilityOptions(!showDisabilityOptions);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDetails((prevState) => ({
      ...prevState, // spread the previous state
      [name]: value, // update the specific field
    }));
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    setIsFilterOpen(false); // Close filter after selection
    // Implement sorting logic here
    console.log("Sort Option:", option);
  };

  const toggleFilterMenu = (e) => {
    e.stopPropagation(); // Prevent click from propagating and closing the filter menu
    setIsFilterOpen(!isFilterOpen);
  };

  const closeFilterMenu = () => {
    setIsFilterOpen(false);
  };
  const [updatedDetails, setUpdatedDetails] = useState({});
  // VIEW ALL JOBLISTING
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
      .then(function (response) {
        console.log(response.data);
        // Assuming the response contains a list of jobs for the company
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
        setJobListings(fetchedJobListings); // Setting the job listings state
      })
      .catch(function (error) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log(error.response?.data);
        alert(errorMessage);
      });
  }, []);
  const renderViewAllJobListings = () => {
    const sortedJobListings = jobListings.sort((a, b) => {
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

                  {/* Update Button */}
                  <button
                    className="mt-4 py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                    onClick={() => {
                      // Set the selected job details to the update form
                      setUpdatedDetails({
                        id: listing.id,
                        positionName: listing.jobName,
                        jobDescription: listing.description,
                        qualifications: listing.qualifications,
                        salary: `${listing.minSalary}-${listing.maxSalary}`,
                        positionType: listing.positionType,
                      });
                      setIsEditing(true); // Show the update form
                      {
                        isEditing && renderUpdateJobListings();
                      }
                    }}
                  >
                    Update
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No job listings found.</p>
          )}
        </div>

        {/* Conditionally Render the Update Form */}
      </div>
    );
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
      positiontype_id: updatedDetails.positionType === "full-time" ? 1 : 2, // Assuming 1 is for full-time and 2 for part-time
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
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        alert(response.data.message);
      })
      .catch(function (error) {
        console.log(error);
        alert(error.response.data.message);
      });

    window.location.reload(); // Refresh the page to reflect changes
  };

  // Include the updated renderUpdateJobListings function
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
  const renderApplicants = () => {
    const applicants = [
      {
        id: 1,
        fullName: "Bruce Wayne",
        email: "bruce@wayneenterprises.com",
        resumeLink: "https://example.com/bruce_resume.pdf",
        jobAppliedFor: "Product Manager",
      },
      {
        id: 2,
        fullName: "Clark Kent",
        email: "clark@dailyplanet.com",
        resumeLink: "https://example.com/clark_resume.pdf",
        jobAppliedFor: "Reporter",
      },
    ];

    // Sort the applicants based on the selected sort option
    const sortedApplicants = applicants.sort((a, b) => {
      if (sortOption === "newest") {
        return b.id - a.id;
      } else if (sortOption === "oldest") {
        return a.id - b.id;
      } else if (sortOption === "a-z") {
        return a.fullName.localeCompare(b.fullName);
      }
      return 0;
    });

    return (
      <div>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold mb-4 text-custom-blue">
            View Applicants
          </h2>
          <div className="relative">
            <button
              className="py-2 px-4 mb-3 rounded-lg bg-blue-600 text-white"
              onClick={toggleFilterMenu}
            >
              Filter
            </button>
            {isFilterOpen && (
              <div
                className="absolute right-0 mt-2 space-y-2 bg-white p-4 shadow-lg rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={`py-2 px-4 rounded-lg w-full ${
                    sortOption === "newest"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-blue-900"
                  }`}
                  onClick={() => handleSortChange("newest")}
                >
                  Newest
                </button>
                <button
                  className={`py-2 px-4 rounded-lg w-full ${
                    sortOption === "oldest"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-blue-900"
                  }`}
                  onClick={() => handleSortChange("oldest")}
                >
                  Oldest
                </button>
                <button
                  className={`py-2 px-4 rounded-lg w-full ${
                    sortOption === "a-z"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-blue-900"
                  }`}
                  onClick={() => handleSortChange("a-z")}
                >
                  A-Z
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {sortedApplicants.length > 0 ? (
            sortedApplicants.map((applicant) => (
              <div
                key={applicant.id}
                className="flex-1 min-w-[300px] p-4 bg-blue-500 rounded shadow-xl transition-transform duration-200 ease-in-out hover:scale-105 hover:bg-blue-600"
              >
                <div className="flex flex-col text-left">
                  <p className="font-semibold text-lg text-white ">
                    Full Name:
                  </p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {applicant.fullName}
                  </p>

                  <p className="font-semibold text-lg  text-white">Email:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {applicant.email}
                  </p>

                  <p className="font-semibold text-lg  text-white">
                    Job Applied For:
                  </p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {applicant.jobAppliedFor}
                  </p>

                  <p className="font-semibold text-lg  text-white">Resume:</p>
                  <a
                    href={applicant.resumeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl bg-custom-bg rounded-md text-custom-blue underline"
                  >
                    View Resume
                  </a>
                </div>
                <button
                  onClick={() => deleteApplicant(applicant.id)}
                  className="mt-4 py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition duration-200"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No applicants found.</p>
          )}
        </div>
      </div>
    );
  };
  const renderDeleteJobListings = () => {
    const jobListing = {
      id: 1,
      companyName: "Acme Corporation",
      jobName: "Software Engineer",
      description: "Develop and maintain software solutions",
      address: "456 Business Ave",
      city: "Metropolis", // Just for display purposes
    };

    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Delete Job Listing</h2>
        <div
          key={jobListing.id}
          className="mb-6 p-4 bg-blue-500 rounded shadow text-center"
        >
          <h3 className="text-3xl font-bold mb-4">Single Job Listing</h3>
          <p className="text-2xl mb-8">Job Details</p>
          <div className="flex flex-col items-center">
            <p>
              <strong>Company Name:</strong> {jobListing.companyName}
            </p>
            <p>
              <strong>Job Name:</strong> {jobListing.jobName}
            </p>
            <p>
              <strong>Description:</strong> {jobListing.description}
            </p>
            <p>
              <strong>Address:</strong> {jobListing.address}
            </p>
            <p>
              <strong>City:</strong> {jobListing.city}
            </p>
          </div>
          <div className="flex justify-center items-center mt-8">
            <button className="bg-red-500 text-white py-2 px-4 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div
      className="flex flex-col md:flex-row min-h-screen bg-blue-100"
      onClick={closeFilterMenu}
    >
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
        <button
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
          onClick={() => {
            setCurrentSection("postJob");
            setIsSidebarOpen(false);
          }}
        >
          Post Job
        </button>
        <button
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
          onClick={() => {
            setCurrentSection("viewAllJobListings");
            setIsSidebarOpen(false);
          }}
        >
          View All Job Listings
        </button>

        <button
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
          onClick={() => {
            setCurrentSection("applicants");
            setIsSidebarOpen(false);
          }}
        >
          View Applicants
        </button>
        <button
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
          onClick={() => {
            setCurrentSection("deleteJobListings");
            setIsSidebarOpen(false);
          }}
        >
          Delete Job Listings
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
        <h1 className="text-3xl font-bold text-blue-900">Company Dashboard</h1>
        <div className="mt-0.5">
          {currentSection === "postJob" && renderPostJob()}
          {currentSection === "viewAllJobListings" &&
            renderViewAllJobListings()}
          {isEditing && renderUpdateJobListings()}
          {currentSection === "updateJobListings" && renderUpdateJobListings()}
          {currentSection === "applicants" && renderApplicants()}
          {currentSection === "deleteJobListings" && renderDeleteJobListings()}
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
