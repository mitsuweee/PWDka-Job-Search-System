import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ViewJobs = () => {
  const [jobListings, setJobListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [job, setJob] = useState(null);
  const [jobUpdate, setJobUpdate] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobListings, setFilteredJobListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("Newest");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDisabilityOptions, setShowDisabilityOptions] = useState(false);
  const [applicantCounts, setApplicantCounts] = useState({}); // Store applicant counts for each job
  const [companyName, setCompanyName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 7;
  const [jobDetails, setJobDetails] = useState({
    companyName: "",
    positionName: "",
    jobDescription: "",
    requirements: "",
    qualifications: "",
    minSalary: "",
    maxSalary: "",
    positionType: "full-time",
    disabilityCategories: [],
    salaryVisibility: "HIDE", // Default to "HIDE"
    level: "",
  });
  const [selectedDisabilityCategories, setSelectedDisabilityCategories] =
    useState([]);

  const navigate = useNavigate();

  const checkCompanyStatus = async () => {
    try {
      const compId = localStorage.getItem("Id");
      const response = await axios.get(`/company/view/verify/status/${compId}`);
      if (
        response.data.successful &&
        response.data.message === "Company is Deactivated"
      ) {
        toast.error("Your account has been deactivated. Logging out.", {
          duration: 4000, // Display the toast for 5 seconds
        });

        // Wait for the toast to finish before logging out
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 5000); // Wait for 5 seconds (the toast duration)
      }
    } catch (error) {
      console.error("Error checking company status.");
    }
  };

  const [tokenValid, setTokenValid] = useState(false); // New state for token validation
  const verifyToken = async () => {
    const token = localStorage.getItem("Token"); // Retrieve the token from localStorage
    const userId = localStorage.getItem("Id"); // Retrieve the userId from localStorage
    const userRole = localStorage.getItem("Role"); // Retrieve the userRole from localStorage

    if (!token) {
      toast.error("No token found in local storage");
      return;
    }

    try {
      console.log("Token:", token);

      // Send a POST request with the token, userId, and userRole in the body
      const response = await axios.post(
        "/verification/token/auth",
        {
          token: token,
          userId: userId,
          userRole: userRole,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "Refresh token retrieved successfully") {
        console.log("Changed Refresh Token");
        localStorage.setItem("Token", response.data.refresh_token);
      }

      if (response.data.successful) {
        setTokenValid(true); // Set token as valid
        console.log("Token verified successfully");
      } else {
        toast.error(response.data.message);

        // If token expired, show a toast message and attempt to retrieve a refresh token
        if (
          response.data.message === "Invalid refresh token, token has expired"
        ) {
          console.log("Token expired. Attempting to retrieve refresh token.");
          await retrieveRefreshToken(); // Retrieve a new refresh token and retry verification
        }
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data.message === "Unauthorized! Invalid token"
      ) {
        console.log(
          "Token expired or invalid. Attempting to retrieve refresh token."
        );
        await retrieveRefreshToken(); // Retrieve a new refresh token and retry verification
      } else {
        toast.error("Session expired, logging out");
        console.error("Error verifying token:", error.message);
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 5000);
      }
    }
  };

  // Function to retrieve refresh token using the same API endpoint
  const retrieveRefreshToken = async () => {
    const userId = localStorage.getItem("Id");
    const userRole = localStorage.getItem("Role");

    try {
      const response = await axios.post(
        "/verification/token/auth",
        {
          token: "", // No access token is provided in this case
          userId: userId,
          userRole: userRole,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.successful) {
        // Store the new refresh token in local storage
        localStorage.setItem("Token", response.data.refresh_token);
        console.log(
          "Refresh token retrieved and updated in local storage:",
          response.data.refresh_token
        );
        toast.success("Session refreshed successfully.");

        // Retry verification with the new token
        await verifyToken();
      } else {
        // If retrieving the refresh token fails, show a toast message and redirect to login
        toast.error("Token expired, please log in again");
        window.location.href = "/login"; // Redirect to login page
      }
    } catch (error) {
      toast.error("Token expired, please log in again");
      console.error("Error retrieving refresh token:", error.message);
      window.location.href = "/login"; // Redirect to login page if refresh fails
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("Id");
    const config = {
      method: "get",
      url: `/joblisting/view/newesttooldest/company/${companyId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    setIsLoading(true);
    axios(config)
      .then((response) => {
        const jobDataArray = response.data.data;
        setJobListings(jobDataArray);
        setFilteredJobListings(jobDataArray);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error loading jobs.");
        setLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });

    const interval = setInterval(() => {
      checkCompanyStatus();
    }, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchApplicantCount = async (jobId) => {
      try {
        const response = await axios.get(`/jobapplication/count/${jobId}`);
        const count = response.data.data.applicantCount; // Get applicant count

        // Update the applicant count for the specific job
        setApplicantCounts((prevCounts) => ({
          ...prevCounts,
          [jobId]: count, // Store the count by job id
        }));
      } catch (error) {
        console.error("Error fetching applicant count:", error);
      }
    };

    // Fetch applicant count only if job listings are available
    if (jobListings.length > 0) {
      jobListings.forEach((job) => {
        fetchApplicantCount(job.id); // Fetch the applicant count for each job
      });
    }
  }, [jobListings]); // This effect will trigger whenever jobListings changes

  useEffect(() => {
    const Id = localStorage.getItem("Id");
    if (Id) {
      const fetchCompanyData = async () => {
        try {
          // Fetch company name
          const companyResponse = await axios.get(`/company/view/${Id}`);
          if (companyResponse.data.successful) {
            setCompanyName(companyResponse.data.data.name);
          } else {
            console.error(
              "Error fetching company name:",
              companyResponse.data.message
            );
          }
        } catch (error) {
          console.error("Error fetching company data:", error);
        }
      };

      fetchCompanyData();
    } else {
      console.error("Company ID is not available in session storage");
    }
  }, []);

  useEffect(() => {
    handleSearch({ target: { value: searchTerm } });
  }, [sortOrder, statusFilter]);

  const handleViewJob = (jobId) => {
    const config = {
      method: "get",
      url: `/joblisting/view/${jobId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    setIsLoading(true);
    axios(config)
      .then((response) => {
        const jobData = response.data.data[0];
        setJob(jobData);
        setIsModalOpen(true);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error fetching job details.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const disabilityCategories = [
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
  ];

  const handleSelectAll = () => {
    setSelectedDisabilityCategories((prevSelected) =>
      prevSelected.length === disabilityCategories.length
        ? []
        : disabilityCategories.map((category) => normalizeText(category))
    );
  };

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;

  // Adjusted filtered job listings for current page
  const currentJobs = filteredJobListings.slice(
    indexOfFirstJob,
    indexOfLastJob
  );
  const totalPages = Math.ceil(filteredJobListings.length / jobsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filteredJobs = jobListings
      .filter((job) => {
        // Convert job.status to title case for comparison
        const jobStatusTitleCase = job.status
          .toLowerCase()
          .replace(/^\w/, (c) => c.toUpperCase());

        // Filter by job status if statusFilter is set
        if (statusFilter && jobStatusTitleCase !== statusFilter) {
          return false;
        }

        const expirationFormatted = new Date(job.expiration)
          .toISOString()
          .split("T")[0]; // Search-friendly format (YYYY-MM-DD)
        const monthFormatted = new Date(job.expiration)
          .toLocaleString("default", { month: "long" })
          .toLowerCase(); // Full month name (e.g., "november")

        // Combine fields for general search
        const combinedFields =
          `${job.position_name} ${job.position_type} ${job.level} ${expirationFormatted} ${monthFormatted}`.toLowerCase();
        return combinedFields.includes(searchValue.toLowerCase());
      })
      .sort((a, b) => {
        if (sortOrder === "A-Z")
          return a.position_name.localeCompare(b.position_name);
        if (sortOrder === "Z-A")
          return b.position_name.localeCompare(a.position_name);
        if (sortOrder === "Newest")
          return new Date(b.date_created) - new Date(a.date_created);
        if (sortOrder === "Oldest")
          return new Date(a.date_created) - new Date(b.date_created);
        return 0;
      });

    setFilteredJobListings(filteredJobs);
  };

  const normalizeText = (text) => text.toLowerCase().trim();

  const capitalizeWords = (str) => {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("-");
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
      salaryVisibility: jobData.salary_visibility || "HIDE",
      level: capitalizeWords(jobData.level || ""), // Normalize case here
      status: jobData.status || "ACTIVE",
      positionType: jobData.position_type || "full-time",
      disabilityCategories: jobData.disability_types
        ? jobData.disability_types.split(",").map((item) => item.trim())
        : [],
    });

    setSelectedDisabilityCategories(
      jobData.disability_types
        ? jobData.disability_types.split(",").map((item) => normalizeText(item))
        : []
    );

    setIsUpdateModalOpen(true);
    console.log(jobData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobUpdate((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();

    // Validation for minimum salary
    if (parseFloat(jobUpdate.minimumSalary) < 12900) {
      toast.error("Minimum Salary must be at least ₱12,900.");
      return;
    }

    // Validation for maximum salary being greater or equal to minimum salary
    if (
      parseFloat(jobUpdate.maximumSalary) < parseFloat(jobUpdate.minimumSalary)
    ) {
      toast.error(
        "Maximum Salary must be equal to or greater than the Minimum Salary."
      );
      return;
    }

    // Validation for maximum salary limit (up to 7 digits)
    if (jobUpdate.maximumSalary.toString().length > 7) {
      toast.error("Maximum Salary must not exceed ₱9,999,999.");
      return;
    }

    // Validation for job description length (must be <= 3,500 characters)
    if (jobUpdate.description.length > 3500) {
      toast.error("Job Description must not exceed 3,500 characters.");
      return;
    }

    // Proceed with job update if all validations pass
    const config = {
      method: "put",
      url: `/joblisting/update/${jobUpdate.id}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        position_name: jobUpdate.jobName,
        description: jobUpdate.description,
        qualification: jobUpdate.qualification,
        requirement: jobUpdate.requirements,
        minimum_salary: jobUpdate.minimumSalary,
        maximum_salary: jobUpdate.maximumSalary,
        salary_visibility: jobUpdate.salaryVisibility,
        level: jobUpdate.level,
        status: jobUpdate.status,
        positiontype_id:
          jobUpdate.positionType === "full-time"
            ? 1
            : jobUpdate.positionType === "part-time"
            ? 2
            : null,
        disability_ids: selectedDisabilityCategories,
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
        const errorMessage =
          error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : "Error updating job. Please try again.";
        toast.error(errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleUpdateExpiration = async (jobId, expiration) => {
    try {
      // Format expiration date to ISO string
      const formattedExpiration = expiration
        ? new Date(expiration).toISOString()
        : null;

      // Send the request to update expiration
      const response = await axios.put(
        `/joblisting/update/joblisting/expiration/${jobId}`,
        {
          expiration: formattedExpiration,
        }
      );

      toast.success("Expiration date updated successfully!");

      // Update jobListings state with new expiration and ACTIVE status
      setJobListings((prevListings) =>
        prevListings.map((job) =>
          job.id === jobId
            ? { ...job, expiration: formattedExpiration, status: "ACTIVE" }
            : job
        )
      );

      // Update filteredJobListings state similarly
      setFilteredJobListings((prevListings) =>
        prevListings.map((job) =>
          job.id === jobId
            ? { ...job, expiration: formattedExpiration, status: "ACTIVE" }
            : job
        )
      );
    } catch (error) {
      console.error("Error updating expiration:", error);

      // Provide specific feedback based on backend response
      const errorMessage =
        error.response?.data?.message || "Failed to update expiration date.";
      toast.error(errorMessage);
    }
  };

  const handleCheckboxChange = (e) => {
    const normalizedValue = normalizeText(e.target.value);
    const { checked } = e.target;

    if (checked) {
      setSelectedDisabilityCategories((prev) => [...prev, normalizedValue]);
    } else {
      setSelectedDisabilityCategories((prev) =>
        prev.filter((category) => category !== normalizedValue)
      );
    }
  };

  const handleDeactivateJobListing = (id) => {
    setSelectedJobId(id);
    setIsDeleteModalOpen(true); // Open confirmation modal
  };

  const confirmDeactivate = () => {
    if (selectedJobId) {
      const config = {
        method: "put", // Use PUT method for deactivating
        url: `/joblisting/update/deactivate/${selectedJobId}`, // Deactivate endpoint
        headers: {
          "Content-Type": "application/json",
        },
      };

      setIsLoading(true);
      axios(config)
        .then(() => {
          toast.success("Job listing deactivated successfully!");
          setJobListings((prevListings) =>
            prevListings.map((job) =>
              job.id === selectedJobId ? { ...job, status: "INACTIVE" } : job
            )
          );
          setFilteredJobListings((prevListings) =>
            prevListings.map((job) =>
              job.id === selectedJobId ? { ...job, status: "INACTIVE" } : job
            )
          );
          // Reload the page to ensure updated data is reflected
          window.location.reload();
        })
        .catch(() => {
          toast.error("An error occurred while deactivating the job listing.");
        })
        .finally(() => {
          setIsLoading(false);
        });

      setIsDeleteModalOpen(false); // Close modal
      setSelectedJobId(null);
    }
  };

  const toggleDisabilityOptions = () => {
    setShowDisabilityOptions(!showDisabilityOptions);
  };

  const confirmLogout = () => {
    localStorage.removeItem("Id");
    localStorage.removeItem("Role");
    localStorage.removeItem("Token");
    window.location.href = "/login";
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setJob(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedJobId(null);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setJobUpdate({});
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
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
        </div>
      )}
      {/* Sidebar */}
      <aside
        className={`bg-custom-blue w-full md:w-[300px] lg:w-[250px] p-4 flex flex-col items-center md:relative fixed top-0 left-0 min-h-screen h-full transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-50 md:z-auto`}
      >
        {/* Close Button for Mobile */}
        <button
          className="text-white md:hidden self-end text-3xl"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Welcome, {companyName || "Company"}!
        </h2>

        {/* Dashboard Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Dashboard
        </h2>
        <hr className="border-1 border-white w-full mb-4" />
        <a
          href="/dashc"
          className={`${
            window.location.pathname === "/dashc"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            dashboard
          </span>
          <span className="flex-grow text-center">Dashboard</span>
        </a>

        {/* Job Management Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Job Management
        </h2>
        <hr className="border-1 border-white w-full mb-4" />

        <a
          href="/dashboard/postjob"
          className={`${
            window.location.pathname === "/dashboard/postjob"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">work</span>
          <span className="flex-grow text-center">Post Job</span>
        </a>

        <a
          href="/dashboard/ViewJobs"
          className={`${
            window.location.pathname === "/dashboard/ViewJobs"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">list</span>
          <span className="flex-grow text-center">View All Job Listings</span>
        </a>

        {/* Account Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Account
        </h2>
        <hr className="border-1 border-white w-full mb-4" />

        {/* Logout Button */}
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
      <main className="flex-grow p-4 md:p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-white px-4 py-2 mb-6 rounded-lg shadow-lg hover:bg-blue-600 transition"
        >
          ← Back
        </button>

        <h1 className="text-xl font-bold text-gray-700 text-center md:text-left">
          View All Job Listings
        </h1>

        <div className="flex flex-col md:flex-row items-center md:justify-between mt-4 mb-4 p-4 bg-white rounded-lg shadow-lg space-y-3 md:space-y-0 md:space-x-4">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full md:flex-grow px-4 py-2 border border-gray-300 bg-gray-100 text-black rounded-lg focus:outline-none focus:border-blue-500 shadow-inner"
            style={{ boxShadow: "inset 0px 4px 8px rgba(0, 0, 0, 0.1)" }}
          />

          <div className="flex space-x-2 md:space-x-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-[130px]">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 focus:outline-none focus:border-blue-500 transition duration-200 text-sm md:text-base"
              >
                <option value="A-Z">A-Z</option>
                <option value="Z-A">Z-A</option>
                <option value="Newest">
                  {window.innerWidth < 768 ? "New" : "Newest"}
                </option>
                <option value="Oldest">
                  {window.innerWidth < 768 ? "Old" : "Oldest"}
                </option>
              </select>
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-white">
                  sort
                </span>
              </span>
            </div>

            <div className="relative flex-grow md:w-[130px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 focus:outline-none focus:border-blue-500 transition duration-200 text-sm md:text-base"
              >
                <option value="">
                  {window.innerWidth < 768 ? "All" : "Status"}
                </option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-white">
                  filter_list
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="table-auto w-full bg-white mt-4 rounded-xl shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-600 text-white text-left text-xs sm:text-sm uppercase tracking-wider">
                <th className="py-4 px-4 sm:px-6 font-semibold">Job Title</th>
                <th className="py-4 px-4 sm:px-6 font-semibold">
                  Position Type
                </th>
                <th className="py-4 px-4 sm:px-6 font-semibold hidden sm:table-cell">
                  Job Level
                </th>
                <th className="py-4 px-4 sm:px-6 font-semibold hidden sm:table-cell">
                  Salary Range
                </th>
                <th className="py-4 px-4 sm:px-6 font-semibold hidden sm:table-cell">
                  Status
                </th>
                <th className="py-4 px-4 sm:px-6 font-semibold hidden sm:table-cell">
                  Expiration
                </th>{" "}
                <th className="py-4 px-4 sm:px-6 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentJobs.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-8 px-4 text-center text-gray-500 text-sm"
                  >
                    No job listings available.
                  </td>
                </tr>
              ) : (
                currentJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition duration-300"
                  >
                    <td className="py-4 px-4 sm:px-6 text-gray-800 text-xs sm:text-sm break-words">
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

                      {/* Additional Info for Mobile */}
                      <div className="sm:hidden mt-1 text-gray-600 text-xs">
                        <div>{job.level ? job.level : "N/A"}</div>
                        <div>
                          {job.minimum_salary && job.maximum_salary
                            ? job.minimum_salary === job.maximum_salary
                              ? `₱${job.minimum_salary.toLocaleString()}`
                              : `₱${job.minimum_salary.toLocaleString()} - ₱${job.maximum_salary.toLocaleString()}`
                            : "Not specified"}
                        </div>
                        <div
                          className={`text-xs ${
                            job.status && job.status.toLowerCase() === "active"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {job.status ? job.status : "Not specified"}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-gray-800 text-xs sm:text-sm break-words">
                      {job.position_type
                        ? job.position_type
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ")
                        : "N/A"}
                    </td>

                    {/* Job Level and Salary for Tablet/Desktop */}
                    <td className="py-4 px-4 sm:px-6 text-gray-800 text-xs sm:text-sm break-words hidden sm:table-cell">
                      {job.level
                        ? job.level
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ")
                        : "N/A"}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-gray-800 text-xs sm:text-sm break-words hidden sm:table-cell">
                      {job.minimum_salary && job.maximum_salary
                        ? job.minimum_salary === job.maximum_salary
                          ? `₱${job.minimum_salary.toLocaleString()}`
                          : `₱${job.minimum_salary.toLocaleString()} - ₱${job.maximum_salary.toLocaleString()}`
                        : "Not specified"}
                    </td>

                    {/* Job Status with Color Coding */}
                    <td
                      className={`py-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold break-words hidden sm:table-cell ${
                        job.status && job.status.toLowerCase() === "active"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {job.status ? job.status : "Not specified"}
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-gray-800 text-xs sm:text-sm break-words hidden sm:table-cell">
                      <input
                        type="datetime-local"
                        value={
                          job.expiration
                            ? new Date(
                                new Date(job.expiration).getTime() -
                                  new Date().getTimezoneOffset() * 60000
                              )
                                .toISOString()
                                .slice(0, 16) // Adjust for local time zone
                            : "" // Handle empty expiration
                        }
                        onChange={(e) => {
                          const expirationDate = new Date(e.target.value);
                          const currentDate = new Date();
                          const oneHourLater = new Date(
                            currentDate.getTime() + 60 * 60 * 1000
                          );

                          if (expirationDate >= oneHourLater) {
                            handleUpdateExpiration(job.id, e.target.value);
                          } else {
                            toast.error(
                              "Expiration must be at least 1 hour from the current time."
                            );
                          }
                        }}
                        className="p-2 border rounded w-full text-gray-800"
                      />
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => handleViewJob(job.id)}
                          className="bg-blue-500 text-white flex items-center justify-center px-2 py-1 rounded-full shadow-sm hover:bg-blue-700 transition duration-200"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">
                            visibility
                          </span>
                          <span className="ml-1 hidden sm:inline text-xs sm:text-sm">
                            View
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeactivateJobListing(job.id)}
                          className="bg-red-500 text-white flex items-center justify-center px-2 py-1 rounded-full shadow-sm hover:bg-red-700 transition duration-200"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">
                            delete
                          </span>
                          <span className="ml-1 hidden sm:inline text-xs sm:text-sm">
                            Delete
                          </span>
                        </button>

                        <button
                          onClick={() => handleUpdateJob(job)}
                          className="bg-yellow-500 text-white flex items-center justify-center px-2 py-1 rounded-full shadow-sm hover:bg-yellow-700 transition duration-200"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">
                            edit
                          </span>
                          <span className="ml-1 hidden sm:inline text-xs sm:text-sm">
                            Edit
                          </span>
                        </button>
                        <button
                          onClick={() => handleViewApplicants(job.id)}
                          className="bg-green-500 text-white flex items-center justify-center px-2 py-1 rounded-full shadow-sm hover:bg-green-700 transition duration-200 relative"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">
                            group_add
                          </span>
                          <span className="ml-1 hidden sm:inline text-xs sm:text-sm">
                            Applicants
                          </span>
                          {applicantCounts[job.id] > 0 && (
                            <span className="absolute top-[-7px] right-[-5px] inline-flex items-center justify-center w-[1.1rem] h-[1.1rem] text-xs font-semibold text-white bg-red-600 rounded-full border-2 border-white shadow-lg">
                              {applicantCounts[job.id]}
                            </span>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;

              // Adjust the range to always show 3 buttons based on currentPage
              const isWithinRange =
                (currentPage <= 2 && pageNumber <= 3) || // Show 1, 2, 3 if on page 1 or 2
                (currentPage >= totalPages - 1 &&
                  pageNumber >= totalPages - 2) || // Show last 3 pages if near end
                (pageNumber >= currentPage - 1 &&
                  pageNumber <= currentPage + 1); // Show current, previous, and next pages

              return (
                isWithinRange && (
                  <li key={pageNumber}>
                    <button
                      onClick={() => paginate(pageNumber)}
                      className={`block size-8 rounded border text-center leading-8 ${
                        currentPage === pageNumber
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-100 bg-white text-gray-900"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  </li>
                )
              );
            })}

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
      </main>
      {/* Modal for viewing job details */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-xl mx-4 max-h-[90vh] overflow-y-auto transition-transform transform scale-100">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                <span className="material-symbols-outlined mr-2">work</span>
                Job Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition duration-200"
              >
                <span className="material-symbols-outlined text-2xl">
                  close
                </span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    business
                  </span>{" "}
                  Company Name:
                </p>
                <p className="text-gray-600 mt-2">
                  {job?.company_name
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">title</span>{" "}
                  Job Title:
                </p>
                <p className="text-gray-600 mt-2">
                  {job?.position_name
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">radar</span>{" "}
                  Job Level:
                </p>
                <p className="text-gray-600 mt-2">
                  {job?.level
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    description
                  </span>{" "}
                  Description:
                </p>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                  {job?.description
                    ? job.description
                        .split(".") // Split by periods to find each sentence
                        .map(
                          (sentence) =>
                            sentence.trim().charAt(0).toUpperCase() +
                            sentence.trim().slice(1).toLowerCase()
                        )
                        .join(". ") // Join back with ". " to form a paragraph
                    : ""}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">build</span>{" "}
                  Requirements:
                </p>
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
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">build</span>{" "}
                  Qualifications:
                </p>
                <ul className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner list-disc pl-4">
                  {job?.qualification
                    ? job.qualification
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
              </div>

              <div className="bg-gray-100 p-3 rounded-lg shadow-inner">
                <div className="flex flex-col sm:flex-row justify-start items-start sm:items-start sm:justify-start text-left space-y-1 sm:space-y-0">
                  <div className="flex flex-row w-full sm:w-auto justify-start items-center">
                    {/* Payments Icon */}
                    <span className="material-symbols-outlined text-black text-base sm:text-sm mr-2">
                      payments
                    </span>

                    {job.minimum_salary === job.maximum_salary ? (
                      <div className="flex flex-col items-start">
                        <span className="text-black font-semibold text-sm sm:text-base">
                          Salary
                        </span>
                        <span className="text-gray-600 text-xs sm:text-sm">
                          ₱ {job.minimum_salary.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-start">
                          <span className="text-black font-semibold text-sm sm:text-base">
                            Min Salary
                          </span>
                          <span className="text-gray-600 text-xs sm:text-sm">
                            ₱ {job.minimum_salary.toLocaleString()}
                          </span>
                        </div>

                        {/* Dash separator */}
                        <span className="text-black font-semibold text-sm mx-2">
                          -
                        </span>

                        <div className="flex flex-col items-start">
                          <span className="text-black font-semibold text-sm sm:text-base">
                            Max Salary
                          </span>
                          <span className="text-gray-600 text-xs sm:text-sm">
                            ₱ {job.maximum_salary.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    work_outline
                  </span>{" "}
                  Position Type:
                </p>
                <p className="text-gray-600 mt-2">
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

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    visibility
                  </span>{" "}
                  Salary Visibility:
                </p>
                <p className="text-gray-600 mt-2">
                  {job?.salary_visibility === "SHOW" ? "Visible" : "Hidden"}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    accessibility
                  </span>{" "}
                  Disability Categories:
                </p>
                <ul className="list-disc pl-5 text-gray-600 mt-2 text-sm">
                  {job?.disability_types
                    ? job.disability_types
                        .split(",")
                        .map((disability, index) => (
                          <li key={index}>{disability.trim()}</li>
                        ))
                    : "No disability categories specified."}
                </ul>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
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
          <div className="relative max-w-5xl w-full mx-auto mb-6 mt-6 p-4 md:p-6 sm:px-4 bg-white rounded-xl shadow-lg space-y-6 transform transition-all hover:shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 transition"
              onClick={closeUpdateModal}
            >
              <span className="text-2xl font-bold">&times;</span>
            </button>

            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-custom-blue">
                Update Job Details
              </h2>
              <form
                onSubmit={handleSubmitUpdate}
                className="bg-white p-4 rounded-xl shadow-lg text-left grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 border border-gray-200"
              >
                <div className="col-span-1 sm:col-span-2">
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

                <div className="col-span-1 sm:col-span-2">
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

                {/* Level */}
                <div className="col-span-1">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="level"
                    value={jobUpdate.level}
                    onChange={handleChange}
                    className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm"
                  >
                    <option value="Entry-Level">Entry-Level</option>
                    <option value="Junior">Junior</option>
                    <option value="Associate">Associate</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior-Level">Senior-Level</option>
                    <option value="Lead">Lead</option>
                    <option value="Managerial">Managerial</option>
                    <option value="Director">Director</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="requirements"
                    value={jobUpdate.requirements}
                    onChange={(e) => {
                      let value = e.target.value;
                      handleChange({ target: { name: "requirements", value } });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        let value = jobUpdate.requirements.trimEnd(); // Remove trailing whitespace or newlines
                        const lines = value.split("\n");

                        // Check if the last line has content or if only one line is empty
                        if (
                          !(
                            lines.length >= 2 &&
                            lines[lines.length - 1] === "" &&
                            lines[lines.length - 2] === ""
                          )
                        ) {
                          handleChange({
                            target: {
                              name: "requirements",
                              value: value + "\n",
                            },
                          });
                        }
                      }
                    }}
                    className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm h-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter each requirement and press Enter"
                    required
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Qualifications <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="qualification"
                    value={jobUpdate.qualification}
                    onChange={(e) => {
                      let value = e.target.value;
                      handleChange({
                        target: { name: "qualification", value },
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        let value = jobUpdate.qualification.trimEnd(); // Remove trailing whitespace or newlines
                        const lines = value.split("\n");

                        // Check if the last line has content or if only one line is empty
                        if (
                          !(
                            lines.length >= 2 &&
                            lines[lines.length - 1] === "" &&
                            lines[lines.length - 2] === ""
                          )
                        ) {
                          handleChange({
                            target: {
                              name: "qualification",
                              value: value + "\n",
                            },
                          });
                        }
                      }
                    }}
                    className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm h-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter each qualification and press Enter"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
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

                <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div>
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

                  <div>
                    <label className="block mb-1 text-gray-700 font-semibold">
                      Joblisting Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={jobUpdate.status}
                      onChange={handleChange}
                      className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-2">
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
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <button
                    type="button"
                    onClick={toggleDisabilityOptions}
                    className="bg-blue-600 text-white px-3 py-2 rounded shadow-lg hover:bg-blue-700 transition w-full sm:w-auto"
                  >
                    {showDisabilityOptions
                      ? "Hide Disability Options"
                      : "Show Disability Options"}
                  </button>
                </div>

                {showDisabilityOptions && (
                  <div className="col-span-1 sm:col-span-2 bg-white p-4 md:p-6 rounded-lg shadow-lg border border-gray-200 transition duration-200 ease-in-out">
                    <label className="block mb-4 text-gray-800 text-lg font-semibold">
                      Disability Categories
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="w-full sm:w-auto mb-4 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 active:bg-blue-800 transition duration-200 ease-in-out transform hover:scale-105"
                    >
                      {selectedDisabilityCategories.length ===
                      disabilityCategories.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3">
                      {[
                        "Deaf or Hard of Hearing",
                        "Intellectual Disability",
                        "Learning Disability",
                        "Mental Disability",
                        "Physical Disability (Orthopedic)",
                        "Psychosocial Disability",
                        "Speech and Language Impairment",
                        "Visual Disability",
                        "Cancer (RA11215)",
                        "Rare Disease (RA10747)",
                      ].map((category) => (
                        <label
                          key={category}
                          className="flex items-center space-x-2 sm:space-x-3"
                        >
                          <div className="relative w-5 h-5 sm:w-6 sm:h-6">
                            <input
                              type="checkbox"
                              value={category}
                              checked={selectedDisabilityCategories.includes(
                                normalizeText(category)
                              )}
                              onChange={handleCheckboxChange}
                              className="appearance-none w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-400 rounded-md transition duration-200 checked:bg-blue-600 checked:border-blue-600 focus:outline-none"
                            />
                            {selectedDisabilityCategories.includes(
                              normalizeText(category)
                            ) && (
                              <span className="absolute inset-0 flex items-center justify-center text-white text-base sm:text-lg font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="text-gray-700 font-medium text-sm sm:text-base">
                            {category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="col-span-1 sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-600 transition w-full sm:w-auto"
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
              Confirm Deactivation
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to deactivate this job listing? Applicants
              will no longer see it.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDeactivate}
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
      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Logout Confirmation
              </h2>
              <button
                onClick={closeLogoutModal}
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
                view and manage jobs.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={closeLogoutModal}
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
