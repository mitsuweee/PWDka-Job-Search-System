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
  const [jobLevel, setJobLevel] = useState(""); // New state for job level filter
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("Newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [userFullName, setUserFullName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userDisabilityType, setUserDisabilityType] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentJobSpeech, setCurrentJobSpeech] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applicationHistory, setApplicationHistory] = useState([]); // New state for application history
  const [isApplicationHistoryModalOpen, setIsApplicationHistoryModalOpen] =
    useState(false); // New state for modal visibility

  const jobsPerPage = 4;
  const navigate = useNavigate();

  const toSentenceCase = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const checkUserStatus = async () => {
    const userId = localStorage.getItem("Id");
    try {
      const response = await axios.get(`/user/view/verify/status/${userId}`);
      if (
        response.data.successful &&
        response.data.message === "User is Deactivated"
      ) {
        toast.error("Your account has been deactivated. Logging out.", {
          duration: 5000, // Display the toast for 5 seconds
        });

        // Wait for the toast to finish before logging out HAHAHA
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 3000); // Wait for 5 seconds (the toast duration)
      }
    } catch (error) {
      toast.error("Failed to check user status.");
    }
  };

  const handleJobClick = (positionName) => {
    // Find the job by the position name in all jobs (filteredJobs contains all jobs)
    const selectedJob = filteredJobs.find(
      (job) => job.jobName.toLowerCase() === positionName.toLowerCase()
    );

    if (selectedJob) {
      setSelectedJobId(selectedJob.id); // Set the selected job ID
      setIsDetailsVisible(true); // Show the job details
      setIsApplicationHistoryModalOpen(false);

      // Find the index of the job in the filtered list
      const jobIndex = filteredJobs.findIndex(
        (job) => job.jobName.toLowerCase() === positionName.toLowerCase()
      );

      // Calculate the page number based on the job index
      const pageNumber = Math.floor(jobIndex / jobsPerPage) + 1;

      // Update the current page to display the page containing the selected job
      if (pageNumber !== currentPage) {
        setCurrentPage(pageNumber); // Update the page to the correct page
      }
    }
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

    const fetchJobs = (city, position_name, position_type, sortOption) => {
      setLoading(true);
      const searchParams = {
        city: city || "",
        position_name: position_name || "",
        position_type: position_type || "",
        sortOption: sortOption || "Newest", // Include sortOption here
      };

      axios
        .get(`/joblisting/view/newesttooldest/${userId}`, {
          params: searchParams, // Use params for GET requests
        })
        .then((response) => {
          const fetchedJobs = response.data.data.map((job) => ({
            id: job.id,
            jobName: job.position_name,
            address: job.company_address,
            positionType: job.position_type,
            salary:
              job.minimum_salary === job.maximum_salary
                ? `${job.minimum_salary}`
                : `${job.minimum_salary}-${job.maximum_salary}`,

            salaryVisibility: job.salary_visibility,
            dateCreated: job.date_created, // Ensure dateCreated is included
            description: job.description,
            level: job.level,
            requirements: job.requirement,
            qualifications: job.qualification,
            companyName: job.company_name,
            companyEmail: job.company_email,
            companyContact: job.company_contact_number,
            companyLocation: job.company_address,
            companyCity: job.company_city,
            companyDescription: job.company_description,
            companyImage: `data:image/png;base64,${job.company_profile_picture}`,
            isApplied: job.is_applied,
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

    // Fetch user data and jobs
    fetchUserFullName();
    fetchJobs("", "", "", sortOption);

    // Check user status every 5 seconds
    const interval = setInterval(() => {
      checkUserStatus();
    }, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [sortOption, navigate]); // No need to include checkUserStatus as it is outside now

  const fetchApplicationHistory = async () => {
    const userId = localStorage.getItem("Id");
    try {
      const response = await axios.get(
        `/jobapplication/applications/user/${userId}`
      );
      if (response.data.successful) {
        setApplicationHistory(response.data.data);
        setIsApplicationHistoryModalOpen(true); // Open the modal
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to load application history");
    }
  };

  // Render loading spinner if data is still being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  const playJobListingMessage = (job) => {
    const salaryMessage =
      job.salaryVisibility === "SHOW"
        ? `Salary: ${job.salary}.`
        : "Salary is hidden.";

    const jobDetails = `
      Company: ${job.companyName}.
      Job Title: ${job.jobName}.
      Location: ${job.companyLocation}.
      City: ${job.companyCity}.
      Position Type: ${job.positionType}.
      Job Level: ${job.level}.
      ${salaryMessage}.
      Job Description: ${job.description}.
      Qualifications: ${job.qualifications}.
      Requirements: ${job.requirements}.
      Company Email: ${job.companyEmail}.
      Company Contact Number: ${job.companyContact}.
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
      const jobLevelMatch =
        jobLevel === "" || job.level.toLowerCase() === jobLevel.toLowerCase(); // New job level filter

      return jobNameMatch && cityMatch && jobTypeMatch && jobLevelMatch; // Include jobLevelMatch in the filter
    })
    .sort((a, b) => {
      if (sortOption === "Newest") {
        return new Date(b.date_created) - new Date(a.date_created); // Newest first
      } else if (sortOption === "Oldest") {
        return new Date(a.date_created) - new Date(b.date_created); // Oldest first
      } else if (sortOption === "A-Z") {
        return (a.jobName || "").localeCompare(b.jobName || ""); // Alphabetical by jobName
      } else if (sortOption === "Z-A") {
        return (b.jobName || "").localeCompare(a.jobName || ""); // Reverse alphabetical
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

      <div
        className="w-full bg-cover bg-center py-4 lg:h-40 flex flex-col items-center px-4 space-y-4 sm:space-y-0 sm:flex-row sm:justify-center"
        style={{
          backgroundImage: `url('/imgs/bg search.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-full lg:w-2/3 p-6 rounded-xl bg-white/20 shadow-lg backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-2">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search Job Name"
              className="w-full sm:w-2/5 p-3 rounded-lg focus:outline-none focus:border-2 focus:border-blue-500 hover:border-blue-400 transition duration-200 text-lg shadow-inner hover:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Location Input */}
            <input
              type="text"
              placeholder="Location"
              className="w-full sm:w-1/4 p-3 rounded-lg focus:outline-none focus:border-2 focus:border-blue-500 hover:border-blue-400 transition duration-200 text-lg shadow-inner hover:shadow-md"
              value={locationSearchTerm}
              onChange={(e) => setLocationSearchTerm(e.target.value)}
            />

            {/* Job Level Dropdown */}
            <select
              className="w-full sm:w-1/4 p-3 rounded-lg focus:outline-none focus:border-2 focus:border-blue-500 hover:border-blue-400 transition duration-200 text-lg shadow-inner hover:shadow-md"
              value={jobLevel}
              onChange={(e) => setJobLevel(e.target.value)}
            >
              <option value="" className="text-gray-400">
                All Levels
              </option>
              <option value="Entry-Level">Entry-Level</option>
              <option value="Associate">Associate</option>
              <option value="Junior">Junior</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior-Level">Senior-Level</option>
              <option value="Lead">Lead</option>
              <option value="Managerial">Managerial</option>
              <option value="Director">Director</option>
              <option value="Executive">Executive</option>
            </select>

            {/* Position Type Dropdown */}
            <select
              className="w-full sm:w-1/4 p-3 rounded-lg focus:outline-none focus:border-2 focus:border-blue-500 hover:border-blue-400 transition duration-200 text-lg shadow-inner hover:shadow-md"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
            >
              <option value="" className="text-gray-400">
                All Types
              </option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
            </select>
          </div>
        </div>

        {/* for sorting */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto flex flex-row space-x-2">
            <button
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-500 transition flex items-center justify-center space-x-1 ml-4" // Added ml-4 for left margin
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <span className="material-symbols-outlined text-lg">sort</span>
              <span className="text-sm sm:text-base">Sort</span>
            </button>

            {isFilterOpen && (
              <div
                className="absolute right-0 sm:left-0 top-full mt-1 w-full sm:w-48 bg-white p-3 shadow-lg rounded-lg z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={`w-full py-2 rounded mb-1 text-sm font-medium ${
                    sortOption === "Newest"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-blue-900"
                  }`}
                  onClick={() => setSortOption("Newest")}
                >
                  Newest
                </button>
                <button
                  className={`w-full py-2 rounded mb-1 text-sm font-medium ${
                    sortOption === "Oldest"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-blue-900"
                  }`}
                  onClick={() => setSortOption("Oldest")}
                >
                  Oldest
                </button>
                <button
                  className={`w-full py-2 rounded mb-1 text-sm font-medium ${
                    sortOption === "A-Z"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-blue-900"
                  }`}
                  onClick={() => setSortOption("A-Z")}
                >
                  A-Z
                </button>
                <button
                  className={`w-full py-2 rounded text-sm font-medium ${
                    sortOption === "Z-A"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-blue-900"
                  }`}
                  onClick={() => setSortOption("Z-A")}
                >
                  Z-A
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">
              logout
            </span>
            Logout
          </button>
        </div>
      </div>

      {/* Job Listings and Pagination */}
      <div className="flex flex-col lg:flex-row w-full h-full mt-6">
        <div className="lg:w-1/2 p-4 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-custom-blue flex items-center">
              <span className="material-symbols-outlined text-xl md:text-2xl mr-2">
                work_update
              </span>
              Jobs for You,{" "}
              {userFullName.charAt(0).toUpperCase() + userFullName.slice(1)}
            </h1>
            <button
              onClick={fetchApplicationHistory}
              className="ml-4 px-4 md:px-5 py-1 md:py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 ease-in-out text-sm md:text-base"
            >
              Application History
            </button>
          </div>

          <div className="space-y-4">
            {currentJobs.length > 0 ? (
              currentJobs.map((job) => (
                <div key={job.id}>
                  <div
                    className="p-3 md:p-4 bg-blue-500 rounded-lg shadow-lg cursor-pointer hover:bg-blue-600 transition transform hover:scale-95 flex flex-col md:flex-row items-start md:items-center relative"
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setIsDetailsVisible(true);
                      setIsMoreInfoVisible(false);
                    }}
                  >
                    {/* Image positioned on the left in desktop */}
                    <img
                      src={job.companyImage}
                      alt="Company Logo"
                      className="w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 object-cover rounded-lg shadow-md border-2 md:border-4 border-blue-700 
      absolute top-3 right-3 md:static md:order-first md:mr-4"
                    />

                    <div className="flex-1 space-y-1 md:space-y-2">
                      <h2 className="text-lg md:text-xl font-semibold text-white">
                        <span className="material-symbols-outlined text-base md:text-xl mr-1">
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
                      <p className="text-xs md:text-base text-white flex items-center">
                        <span className="material-symbols-outlined text-sm md:text-base mr-1">
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
                      <p className="text-xs md:text-base text-white flex items-center">
                        <span className="material-symbols-outlined text-sm md:text-base mr-1">
                          location_city
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
                      <p className="font-semibold text-xs md:text-base text-white flex items-center">
                        <span className="material-symbols-outlined text-sm md:text-base mr-1">
                          schedule
                        </span>
                        {toSentenceCase(job.positionType)}
                      </p>

                      <p className="font-semibold text-xs md:text-base text-white flex items-center">
                        <span className="material-symbols-outlined text-sm md:text-base mr-1">
                          workspace_premium
                        </span>
                        {job.level
                          ? job.level
                              .split("-") // Split the level by hyphen
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              ) // Capitalize each word
                              .join("-") // Join the words back together with a hyphen
                          : "Level not specified"}{" "}
                        {/* Fallback text if level is missing */}
                      </p>
                      {job.salaryVisibility === "SHOW" ? (
                        <p className="font-semibold text-xs md:text-base text-white flex items-center">
                          <span className="material-symbols-outlined text-sm md:text-base mr-1">
                            payments
                          </span>
                          {job.salary}
                        </p>
                      ) : (
                        <p className="font-semibold text-xs md:text-base text-white flex items-center">
                          <span className="material-symbols-outlined text-sm md:text-base mr-1">
                            payments
                          </span>
                          Salary: Hidden
                        </p>
                      )}
                    </div>

                    {userDisabilityType !== "Deaf or Hard of Hearing" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVoice(job);
                        }}
                        className={`absolute bottom-3 right-3 md:static md:ml-4 px-2 md:px-4 py-1 md:py-2 rounded-full transition-colors duration-200 ${
                          isVoiceEnabled && selectedJobId === job.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300 text-black"
                        } hover:bg-blue-600`}
                      >
                        <span className="material-symbols-outlined text-lg md:text-2xl">
                          {isVoiceEnabled && selectedJobId === job.id
                            ? "volume_up"
                            : "volume_off"}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Job Details Modal for Mobile (appears below the selected job listing) */}
                  {selectedJobId === job.id && isDetailsVisible && (
                    <div className="lg:hidden p-4 bg-white rounded-lg shadow-2xl mt-4 relative">
                      <button
                        className="absolute -top-3 -right-3 bg-blue-600 border-2 border-blue-600 text-white text-xl font-bold py-1 px-2 rounded-full shadow-md hover:bg-transparent hover:text-blue-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        onClick={() => {
                          if (isVoiceEnabled) handleToggleVoice(null);
                          setSelectedJobId(null);
                          setIsDetailsVisible(false);
                        }}
                      >
                        &times;
                      </button>

                      <h2 className="text-xl font-semibold mb-3 text-blue-600">
                        {job.jobName
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")}
                      </h2>
                      <p className="text-sm mb-2 text-gray-700 flex items-center">
                        <span className="material-symbols-outlined mr-1 text-base">
                          work
                        </span>
                        {job.companyName
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")}
                      </p>
                      <p className="text-sm mb-2 text-gray-700 flex items-center">
                        <span className="material-symbols-outlined mr-1 text-base">
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
                      <p className="text-sm mb-2 text-gray-700 flex items-center">
                        <span className="material-symbols-outlined mr-1 text-base">
                          schedule
                        </span>
                        {toSentenceCase(job.positionType)}
                      </p>

                      {job.salaryVisibility === "SHOW" ? (
                        <p className="text-sm mb-2 text-gray-700 flex items-center">
                          <span className="material-symbols-outlined mr-1 text-base">
                            payments
                          </span>
                          {job.salary}
                        </p>
                      ) : (
                        <p className="text-sm mb-2 text-gray-700 flex items-center">
                          <span className="material-symbols-outlined mr-1 text-base">
                            payments
                          </span>
                          Salary: Hidden
                        </p>
                      )}

                      <p className="text-sm font-medium text-gray-600 mt-4 leading-relaxed">
                        {job.description
                          .split(". ")
                          .map(
                            (sentence) =>
                              sentence.charAt(0).toUpperCase() +
                              sentence.slice(1).toLowerCase()
                          )
                          .join(". ")}
                      </p>

                      {/* Qualifications Section */}
                      <p className="text-sm font-medium text-gray-800 mt-4">
                        Qualifications
                      </p>
                      {job?.qualifications ? (
                        <ul className="text-gray-700 list-disc pl-4 text-sm">
                          {(job.qualifications.includes("\n")
                            ? job.qualifications.split("\n") // Split by newline
                            : [job.qualifications]
                          )
                            .filter(
                              (qualification) => qualification.trim() !== ""
                            ) // Filter out any empty lines
                            .map((qualification, index) => (
                              <li key={index}>
                                {qualification.trim().charAt(0).toUpperCase() +
                                  qualification.trim().slice(1).toLowerCase()}
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p className="text-gray-700 text-sm">
                          No qualifications listed
                        </p>
                      )}

                      {/* Requirements Section */}
                      <p className="text-sm font-medium text-gray-800 mt-4">
                        Requirements
                      </p>
                      {job?.requirements ? (
                        <ul className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner list-disc pl-4">
                          {job?.requirement
                            ? job.requirement
                                .split("\n") // Split by newline character
                                .filter((part) => part.trim() !== "") // Filter out any empty lines
                                .map((part, index) => (
                                  <li key={index}>
                                    {part.trim().charAt(0).toUpperCase() +
                                      part.trim().slice(1).toLowerCase()}
                                  </li>
                                ))
                            : null}
                        </ul>
                      ) : (
                        <p className="text-gray-700 text-sm">
                          No requirements listed
                        </p>
                      )}

                      <div className="mt-4 flex flex-col md:flex-row md:space-x-4 items-center space-y-3 md:space-y-0">
                        <a
                          href={`/apply?id=${job.id}`}
                          className="w-full md:w-auto"
                        >
                          <button
                            className={`w-full md:w-auto py-2 px-4 rounded-lg transition-all duration-300 ${
                              job.isApplied
                                ? "bg-gray-400 cursor-not-allowed text-gray-200"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                            }`}
                            disabled={job.isApplied}
                          >
                            {job.isApplied ? "Already Applied" : "Apply Now"}
                          </button>
                        </a>
                        <button
                          className="w-full md:w-auto bg-transparent border-2 border-blue-600 text-blue-600 py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 hover:text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                          onClick={() =>
                            setIsMoreInfoVisible(!isMoreInfoVisible)
                          }
                        >
                          Learn More
                        </button>
                      </div>

                      {/* Learn More Section for Mobile (appears below the details card) */}
                      {isMoreInfoVisible && (
                        <div className="mt-4 p-6 bg-white rounded-lg shadow-2xl">
                          <img
                            src={job.companyImage}
                            alt="Company"
                            className="w-20 h-20 object-cover rounded-full border-4 border-blue-600 shadow-lg mx-auto mb-4"
                          />
                          <h3 className="text-xl font-semibold text-blue-600 mb-4">
                            Company Overview
                          </h3>
                          <div className="text-gray-700 space-y-2 text-sm">
                            <p className="flex items-center">
                              <span className="material-symbols-outlined mr-2 text-blue-600">
                                business
                              </span>
                              <span className="font-medium">Company Name:</span>{" "}
                              {job.companyName}
                            </p>
                            <p className="flex items-center">
                              <span className="material-symbols-outlined mr-2 text-blue-600">
                                email
                              </span>
                              <span className="font-medium">Email:</span>{" "}
                              {job.companyEmail}
                            </p>
                            <p className="flex items-center">
                              <span className="material-symbols-outlined mr-2 text-blue-600">
                                phone
                              </span>
                              <span className="font-medium">
                                Contact Number:
                              </span>{" "}
                              {job.companyContact}
                            </p>
                            <p className="flex items-center">
                              <span className="material-symbols-outlined mr-2 text-blue-600">
                                location_on
                              </span>
                              <span className="font-medium">Address:</span>{" "}
                              {job.companyLocation}
                            </p>
                            <p className="flex items-center">
                              <span className="material-symbols-outlined mr-2 text-blue-600">
                                location_city
                              </span>
                              <span className="font-medium">City:</span>{" "}
                              {job.companyCity}
                            </p>
                          </div>
                          <div className="text-gray-600 mt-4 text-xs leading-relaxed bg-gray-100 p-3 rounded-lg shadow-inner">
                            {job.companyDescription.charAt(0).toUpperCase() +
                              job.companyDescription.slice(1).toLowerCase()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                  Prev
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
                  Next
                </button>
              </li>
            </ol>
          </div>
        </div>

        {/* Job Details on Desktop */}
        <div className={`lg:w-1/2 p-4 hidden lg:block relative`}>
          {selectedJobId && isDetailsVisible ? (
            <div>
              {/* Job Details and Learn More content for desktop */}
              <div className="p-6 bg-white rounded-lg shadow-2xl relative">
                <button
                  className="absolute -top-4 -right-4 bg-blue-600 border-2 border-blue-600 text-white text-2xl font-bold py-1 px-3 rounded-full shadow-md hover:bg-transparent hover:text-blue-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => {
                    if (isVoiceEnabled) handleToggleVoice(null);
                    setSelectedJobId(null);
                    setIsDetailsVisible(false);
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
                <p className="text-lg font-medium text-gray-600 mt-6">
                  {toSentenceCase(selectedJob.description)}
                </p>
                <p className="text-lg font-medium text-gray-800 mt-6">
                  Qualifications
                </p>
                <ul className="text-gray-700 list-disc pl-4">
                  {selectedJob.qualifications
                    ? selectedJob.qualifications
                        .split("\n") // Split by newline character
                        .filter((qualification) => qualification.trim() !== "") // Filter out empty lines
                        .map((qualification, index) => (
                          <li key={index}>
                            {qualification.trim().charAt(0).toUpperCase() +
                              qualification.trim().slice(1).toLowerCase()}
                          </li>
                        ))
                    : null}
                </ul>

                <p className="text-lg font-medium text-gray-800 mt-6">
                  Requirements
                </p>
                <ul className="text-gray-700 list-disc pl-4">
                  {selectedJob.requirements
                    ? selectedJob.requirements
                        .split("\n") // Split by newline character
                        .filter((requirement) => requirement.trim() !== "") // Filter out empty lines
                        .map((requirement, index) => (
                          <li key={index}>
                            {requirement.trim().charAt(0).toUpperCase() +
                              requirement.trim().slice(1).toLowerCase()}
                          </li>
                        ))
                    : null}
                </ul>

                <div className="mt-6 flex flex-col md:flex-row md:space-x-4 items-center space-y-4 md:space-y-0">
                  <a
                    href={`/apply?id=${selectedJob.id}`}
                    className="w-full md:w-auto"
                  >
                    <button
                      className={`w-full md:w-auto py-3 px-6 rounded-lg transition-all duration-300 ${
                        selectedJob.isApplied
                          ? "bg-gray-400 cursor-not-allowed text-gray-200"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                      }`}
                      disabled={selectedJob.isApplied}
                    >
                      {selectedJob.isApplied ? "Already Applied" : "Apply Now"}
                    </button>
                  </a>
                  <button
                    className="w-full md:w-auto bg-transparent border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg shadow-md hover:bg-blue-600 hover:text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    onClick={() => setIsMoreInfoVisible(!isMoreInfoVisible)}
                  >
                    Learn More
                  </button>
                </div>
                {isMoreInfoVisible && (
                  <div className="mt-6 p-8 bg-white rounded-lg shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-semibold text-custom-blue">
                        Company Overview
                      </h3>
                      <img
                        src={selectedJob.companyImage}
                        alt="Company"
                        className="w-24 h-24 object-cover rounded-full border-4 border-custom-blue shadow-lg"
                      />
                    </div>
                    <div className="text-black space-y-4">
                      <p className="flex items-center">
                        <span className="material-symbols-outlined mr-2 text-custom-blue">
                          business
                        </span>
                        <span className="font-medium">Company Name:</span>{" "}
                        {selectedJob.companyName
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")}
                      </p>

                      <p className="flex items-center">
                        <span className="material-symbols-outlined mr-2 text-custom-blue">
                          email
                        </span>
                        <span className="font-medium">Email:</span>{" "}
                        {toSentenceCase(selectedJob.companyEmail)}
                      </p>

                      <p className="flex items-center">
                        <span className="material-symbols-outlined mr-2 text-custom-blue">
                          phone
                        </span>
                        <span className="font-medium">Contact Number:</span>{" "}
                        {toSentenceCase(selectedJob.companyContact)}
                      </p>

                      <p className="flex items-center">
                        <span className="material-symbols-outlined mr-2 text-custom-blue">
                          location_on
                        </span>
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

                      <p className="flex items-center">
                        <span className="material-symbols-outlined mr-2 text-custom-blue">
                          location_city
                        </span>
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
                    </div>

                    <div className="text-black mt-6 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                      {selectedJob.companyDescription.charAt(0).toUpperCase() +
                        selectedJob.companyDescription.slice(1).toLowerCase()}
                    </div>
                  </div>
                )}
              </div>
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

      {/* Application History Modal */}
      {isApplicationHistoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-2xl relative w-full max-w-sm sm:max-w-lg lg:max-w-3xl border border-gray-200">
            <button
              onClick={() => setIsApplicationHistoryModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition duration-200 text-lg sm:text-2xl focus:outline-none"
              aria-label="Close modal"
            >
              &times;
            </button>
            <h3 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-6 text-center">
              Application History
            </h3>
            {applicationHistory.length > 0 ? (
              <div className="overflow-auto max-h-[70vh] sm:max-h-[500px] border-t border-gray-200 pt-4">
                <table className="w-full bg-white text-left text-xs sm:text-sm md:text-base">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase tracking-wider">
                      <th className="py-2 px-2 sm:px-4">Position</th>
                      <th className="py-2 px-2 sm:px-4">Company</th>
                      <th className="py-2 px-2 sm:px-4">Status</th>
                      <th className="py-2 px-2 sm:px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicationHistory.map((application, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-100 transition duration-150 text-gray-700"
                      >
                        <td
                          className="py-2 px-2 sm:px-4 text-blue-500 hover:underline whitespace-normal break-words"
                          onClick={() =>
                            handleJobClick(application.position_name)
                          }
                        >
                          {application.position_name}
                        </td>
                        <td className="py-2 px-2 sm:px-4 whitespace-normal break-words">
                          {application.company_name}
                        </td>
                        <td className="py-2 px-2 sm:px-4">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              application.status === "Approved"
                                ? "bg-green-100 text-green-700"
                                : application.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : application.status === "Under Review"
                                ? "bg-blue-100 text-blue-700"
                                : application.status === "Rejected"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {application.status}
                          </span>
                        </td>

                        <td className="py-2 px-2 sm:px-4 whitespace-nowrap">
                          {new Date(
                            application.date_created
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-6">
                No application history found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListing;
