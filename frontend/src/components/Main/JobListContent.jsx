import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const JobListing = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isMoreInfoVisible, setIsMoreInfoVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationSearchTerm, setLocationSearchTerm] = useState(""); // For location search
  const [jobType, setJobType] = useState(""); // For full-time or part-time filter
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [userFullName, setUserFullName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userDisabilityType, setUserDisabilityType] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentJobSpeech, setCurrentJobSpeech] = useState(null);
  const [loading, setLoading] = useState(false);

  const jobsPerPage = 4;
  const navigate = useNavigate();

  const toSentenceCase = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  useEffect(() => {
    const userId = localStorage.getItem("Id");

    const fetchUserFullName = () => {
      setLoading(true);
      axios
        .get(`/user/view/${userId}`)
        .then((response) => {
          const userData = response.data.data;
          setUserFullName(userData.first_name);
          const userDisabilityType = userData.type;
          setUserDisabilityType(userDisabilityType);
          setLoading(false);
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.message || "An error occurred";
          toast.error(errorMessage);
          setLoading(false);
        });
    };

    const fetchJobs = (city, position_name, position_type) => {
      setLoading(true);
      const searchParams = {
        city: city || "",
        position_name: position_name || "",
        position_type: position_type || "",
      };

      const config = {
        method: "get",
        url: `/joblisting/view/newesttooldest/${userId}`,
        headers: {
          "Content-Type": "application/json",
        },
        data: searchParams,
      };

      axios(config)
        .then((response) => {
          const fetchedJobs = response.data.data.map((job) => ({
            id: job.id,
            jobName: job.position_name,
            address: job.company_address,
            positionType: job.position_type,
            salary: `${job.minimum_salary}-${job.maximum_salary}`,
            salaryVisibility: job.salary_visibility,
            description: job.description,
            requirements: job.requirement,
            qualifications: job.qualification,
            companyName: job.company_name,
            companyEmail: job.company_email,
            companyContact: job.company_contact_number,
            companyLocation: job.company_address,
            companyCity: job.company_city,
            companyDescription: job.company_description,
            companyImage: `data:image/png;base64,${job.company_profile_picture}`,
          }));

          setJobs(fetchedJobs);
          toast.success("Jobs fetched successfully");
          setLoading(false);
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.message ||
            "An error occurred while fetching jobs";
          toast.error(errorMessage);
          setLoading(false);
        });
    };

    fetchUserFullName();
    fetchJobs();
  }, []);

  const playJobListingMessage = (job) => {
    const salaryMessage =
      job.salaryVisibility === "SHOW"
        ? `Salary: ${job.salary}.`
        : "Salary is hidden.";

    const jobDetails = `
      Company: ${job.companyName}.
      Job Title: ${job.jobName}.
      Job Description: ${job.description}.
      Location: ${job.companyLocation}.
      City: ${job.companyCity}.
      ${salaryMessage}
      Position Type: ${job.positionType}.
      Requirements: ${job.requirements}.
      Qualifications: ${job.qualifications}.
      Company Contact Number: ${job.companyContact}.
      Company Email: ${job.companyEmail}.
      If you are interested, click on APPLY NOW.
    `;

    if (userDisabilityType === "Deaf or Hard of Hearing") {
      alert(`Job Details:\n${jobDetails}`);
    } else {
      if (isSpeaking && currentJobSpeech) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(jobDetails);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        setCurrentJobSpeech(utterance);

        utterance.onend = () => {
          setIsSpeaking(false);
          setCurrentJobSpeech(null);
        };
      }
    }
  };

  const handleToggleVoice = (job) => {
    if (!isVoiceEnabled) {
      playJobListingMessage(job);
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  const handleSearch = () => {};

  const filteredJobs = jobs
    .filter((job) => {
      const jobNameMatch = job.jobName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const cityMatch = job.companyCity
        .toLowerCase()
        .includes(locationSearchTerm.toLowerCase());
      const jobTypeMatch =
        jobType === "" ||
        job.positionType.toLowerCase() === jobType.toLowerCase();

      // Apply all three filters: job name, city, and job type
      return jobNameMatch && cityMatch && jobTypeMatch;
    })
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

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const selectedJob = jobs.find((job) => job.id === selectedJobId);

  const handleLogout = () => {
    setIsModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("Id");
    localStorage.removeItem("Role");
    localStorage.removeItem("Token");
    navigate("/login");
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <Toaster position="top-center" reverseOrder={false} />
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
        </div>
      )}

      {/* Search and Filters Section */}
      <div
        className="w-full bg-cover bg-center py-4 lg:h-40 flex flex-col sm:flex-row justify-center items-center px-4"
        style={{
          backgroundImage: `url('/imgs/bg search.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-full lg:w-2/3 mb-4 sm:mb-0 flex justify-center">
          <div className="flex w-full">
            {/* Main Job Search */}
            <input
              type="text"
              placeholder="Search Job Name"
              className="w-3/5 p-3 rounded-lg focus:outline-none focus:border-2 focus:border-blue-500 transition duration-200 text-lg mx-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Location Search */}
            <input
              type="text"
              placeholder="Location"
              className="w-1/4 p-3 focus:outline-none rounded-lg focus:border-2 focus:border-blue-500 transition duration-200 text-lg mx-2"
              value={locationSearchTerm}
              onChange={(e) => setLocationSearchTerm(e.target.value)}
            />

            {/* Job Type Dropdown */}
            <select
              className="w-1/4 p-3 focus:outline-none rounded-lg focus:border-2 focus:border-blue-500 transition duration-200 text-lg mx-2"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
            >
              <option value="" className="text-gray-400">
                All
              </option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
            </select>

            {/* Search Button */}
            <button
              className="p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center mx-2"
              onClick={handleSearch}
            >
              <span className="material-symbols-outlined text-2xl">search</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center space-x-2 ml-4">
          <div className="relative">
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-400 transition flex items-center"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <span className="material-symbols-outlined text-xl mr-2">
                filter_alt
              </span>
              <span>Filter</span>
            </button>
            {isFilterOpen && (
              <div
                className="absolute right-0 top-full mt-0 bg-white p-4 shadow-lg rounded-lg z-50"
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
                  className={`py-2 px-3 rounded-lg w-full my-2 ${
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
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition flex items-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">
              logout
            </span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Job Listings and Pagination */}
      <div className="flex flex-col lg:flex-row w-full h-full mt-6">
        <div className="lg:w-1/2 p-4 overflow-auto">
          <h1 className="text-3xl font-bold mb-6 text-blue-600">
            <span className="material-symbols-outlined text-2xl mr-2">
              work_update
            </span>
            Jobs for You,{" "}
            {userFullName.charAt(0).toUpperCase() + userFullName.slice(1)}
          </h1>

          <div className="space-y-4">
            {currentJobs.length > 0 ? (
              currentJobs.map((job) => (
                <div key={job.id}>
                  <div
                    className="p-4 bg-blue-500 rounded-lg shadow-3xl cursor-pointer hover:bg-blue-600 transition transform hover:scale-95 flex items-center"
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setIsDetailsVisible(true);
                      setIsMoreInfoVisible(false);
                    }}
                  >
                    <img
                      src={job.companyImage}
                      alt="Company Logo"
                      className="w-24 h-24 object-cover rounded-xl mr-4 shadow-xl"
                    />
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        <span className="material-symbols-outlined mr-2">
                          work
                        </span>
                        {job.jobName
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")}
                      </h2>
                      <p className="text-white">
                        <span className="material-symbols-outlined mr-2">
                          location_on
                        </span>
                        {job.companyLocation
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")}
                      </p>

                      <p className="text-white">
                        <span className="material-symbols-outlined mr-2">
                          location_on
                        </span>
                        {job.companyCity
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")}
                      </p>

                      <p className="font-semibold text-white">
                        <span className="material-symbols-outlined mr-2">
                          schedule
                        </span>
                        {toSentenceCase(job.positionType)}
                      </p>
                      {job.salaryVisibility === "SHOW" ? (
                        <p className="font-semibold text-white">
                          <span className="material-symbols-outlined mr-2">
                            payments
                          </span>
                          {job.salary}
                        </p>
                      ) : (
                        <p className="font-semibold text-white">
                          <span className="material-symbols-outlined mr-2">
                            payments
                          </span>
                          Salary: Hidden
                        </p>
                      )}
                      <p className="text-gray-200 mt-2">
                        {toSentenceCase(job.description)}
                      </p>
                    </div>
                    {userDisabilityType !== "Deaf or Hard of Hearing" && (
                      <button
                        onClick={() => handleToggleVoice(job)}
                        className={`ml-4 px-4 py-2 rounded-full transition-colors duration-200 ${
                          isVoiceEnabled && selectedJobId === job.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300 text-black"
                        } hover:bg-blue-600`}
                      >
                        <span className="material-symbols-outlined text-2xl">
                          {isVoiceEnabled && selectedJobId === job.id
                            ? "volume_up"
                            : "volume_off"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-600">
                  Currently, there are no job listings available. Please rest
                  assured, we are actively working to provide new opportunities
                  tailored to your unique skills and abilities. Stay
                  positive—your next opportunity is just around the corner!
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <ol className="flex justify-center gap-1 text-xs font-medium">
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
                      d="M12.707 5.293a1 1 010 1.414L9.414 10l3.293 3.293a1 1 01-1.414 1.414l-4-4a1 1 010-1.414l4-4a1 1 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>

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
                      d="M7.293 14.707a1 1 010-1.414L10.586 10 7.293 6.707a1 1 011.414-1.414l4 4a1 1 010 1.414l-4-4a1 1 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            </ol>
          </div>
        </div>

        <div className={`lg:w-1/2 p-4 hidden lg:block relative`}>
          {selectedJob ? (
            <div key={selectedJob.id}>
              <div className="p-6 bg-white rounded-lg shadow-2xl relative">
                <button
                  className="absolute -top-4 -right-4 bg-transparent border-2 border-gray-600 text-gray-600 text-2xl font-bold py-1 px-3 rounded-full shadow-lg hover:bg-gray-600 hover:text-white hover:shadow-2xl transition transform hover:scale-105"
                  onClick={() => {
                    if (isVoiceEnabled) {
                      handleToggleVoice(null);
                    }
                    setSelectedJobId(null);
                  }}
                >
                  &times;
                </button>
                <h2 className="text-2xl font-semibold mb-4 text-blue-600">
                  {selectedJob.jobName
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </h2>

                <p className="text-lg mb-2 text-gray-700 flex items-center">
                  <span className="material-symbols-outlined mr-2">work</span>
                  {selectedJob.companyName
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </p>

                <p className="text-lg mb-4 text-gray-500 flex items-center">
                  <span className="material-symbols-outlined mr-2">
                    location_on
                  </span>
                  {selectedJob.companyLocation
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </p>

                <p className="text-lg mb-2 text-gray-700 flex items-center">
                  <span className="material-symbols-outlined mr-2">
                    schedule
                  </span>
                  {toSentenceCase(selectedJob.positionType)}
                </p>

                {selectedJob.salaryVisibility === "SHOW" ? (
                  <p className="text-lg mb-4 text-gray-700 flex items-center">
                    <span className="material-symbols-outlined mr-2">
                      payments
                    </span>
                    {selectedJob.salary}
                  </p>
                ) : (
                  <p className="text-lg mb-4 text-gray-700 flex items-center">
                    <span className="material-symbols-outlined mr-2">
                      payments
                    </span>
                    Salary: Hidden
                  </p>
                )}

                <p className="text-lg font-medium text-gray-800 mt-6">
                  Qualifications
                </p>
                <ul className="text-gray-700 list-disc pl-4">
                  {selectedJob.qualifications
                    .split("/")
                    .map((qualification, index) => (
                      <li key={index}>
                        {toSentenceCase(qualification.trim())}
                      </li>
                    ))}
                </ul>
                <p className="text-lg font-medium text-gray-800 mt-6">
                  Requirements
                </p>
                <ul className="text-gray-700 list-disc pl-4">
                  {selectedJob.requirements
                    .split("/")
                    .map((requirement, index) => (
                      <li key={index}>{toSentenceCase(requirement.trim())}</li>
                    ))}
                </ul>

                <div className="mt-6 flex space-x-4">
                  <a href={`/apply?id=${selectedJob.id}`}>
                    <button className="bg-blue-500 text-white py-3 px-6 rounded-full shadow-lg hover:bg-blue-600 hover:shadow-2xl transition transform hover:scale-105">
                      Apply now
                    </button>
                  </a>
                  <button
                    className="bg-transparent border-2 border-custom-blue text-custom-blue py-3 px-6 rounded-full shadow-lg hover:bg-custom-blue hover:text-white hover:shadow-2xl transition transform hover:scale-105"
                    onClick={() => setIsMoreInfoVisible(!isMoreInfoVisible)}
                  >
                    Learn more
                  </button>
                </div>
              </div>

              {isMoreInfoVisible && (
                <div className="mt-6 p-6 bg-white rounded-lg shadow-2xl relative">
                  <img
                    src={selectedJob.companyImage}
                    alt="Company"
                    className="w-20 h-20 object-cover rounded-full absolute top-6 right-6"
                  />
                  <h3 className="text-xl font-semibold text-custom-blue mb-4">
                    Company overview
                  </h3>
                  <p className="text-black">
                    <span className="font-medium">Company name:</span>{" "}
                    {selectedJob.companyName
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </p>

                  <p className="text-black">
                    <span className="font-medium">Email:</span>{" "}
                    {toSentenceCase(selectedJob.companyEmail)}
                  </p>
                  <p className="text-black">
                    <span className="font-medium">Contact number:</span>{" "}
                    {toSentenceCase(selectedJob.companyContact)}
                  </p>
                  <p className="text-black">
                    <span className="font-medium">Address:</span>{" "}
                    {selectedJob.companyLocation
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </p>
                  <p className="text-black">
                    <span className="font-medium">City:</span>{" "}
                    {selectedJob.companyCity
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </p>

                  <p className="text-black mt-4 text-sm leading-relaxed">
                    {selectedJob.companyDescription.charAt(0).toUpperCase() +
                      selectedJob.companyDescription.slice(1).toLowerCase()}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
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

            <div className="mb-6">
              <p className="text-lg text-gray-600">
                Are you sure you want to logout? You will need to log back in to
                access the job listings.
              </p>
            </div>

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

export default JobListing;
