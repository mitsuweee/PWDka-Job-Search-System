import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import io from "socket.io-client";

const AdminViewJobs = () => {
  const [jobListings, setJobListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [deactivationReason, setDeactivationReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Controls delete modal visibility
  const [selectedJobId, setSelectedJobId] = useState(null); // Holds the job ID to be deleted

  const jobsPerPage = 10;
  const navigate = useNavigate();

  const checkAdminStatus = async () => {
    const adminId = localStorage.getItem("Id");

    try {
      const response = await axios.get(`/admin/view/verify/status/${adminId}`);
      if (
        response.data.successful &&
        response.data.message === "User is Deactivated"
      ) {
        toast.error("Your admin account has been deactivated. Logging out.", {
          duration: 4000, // Display the toast for 5 seconds
        });

        // Wait briefly before logging out
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 5000);
      }
    } catch (error) {
      conosole.error("Failed to check admin status.");
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
    const socket = io("https://pwdka.com.ph/", {
      transports: ["websocket"], // Use WebSocket only for improved real-time performance
    });

    socket.on("connect", () => {
      console.log("Connected to socket server with ID:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Listen for the job_deleted event
    socket.on("job_deleted", (data) => {
      // Remove the deleted job from the state
      setJobListings((prevJobListings) =>
        prevJobListings.filter((job) => job.id !== data.id)
      );

      // Display a toast notification
      toast.error(`A Job Has Been Deleted`);
      window.location.reload();
    });

    // Clean up socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const config = {
      method: "get",
      url: "/admin/view/all/joblisting/newesttooldest",
      headers: {
        "Content-Type": "application/json",
      },
    };

    setLoading(true);
    axios(config)
      .then((response) => {
        const jobDataArray = response.data.data;
        setJobListings(jobDataArray);
        setLoading(false);
        setTimeout(() => {
          toast.success("Job listings loaded successfully");
        }, 200);
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Failed to load job listings");
        console.error(error);
      });

    const interval = setInterval(() => {
      checkAdminStatus(); // Calls the function that verifies admin status
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const adminId = localStorage.getItem("Id");
    const config = {
      method: "get",
      url: `/admin/view/${adminId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response) {
        const adminData = response.data.data;
        setAdmin({
          firstName: adminData.first_name,
          lastName: adminData.last_name,
          email: adminData.email,
        });
        setNewEmail(adminData.email);
      })
      .catch(function (error) {
        // Only show the error message if there is a specific message
        const errorMessage = error.response?.data?.message;
        if (errorMessage) {
          toast.error(errorMessage); // Show the server-specific error message
        }
      });
  }, []);

  const handleViewJob = (jobId) => {
    const config = {
      method: "get",
      url: `/admin/view/joblisting/${jobId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        const jobData = response.data.data[0];
        setJob(formatJobData(jobData));
        setIsModalOpen(true);
      })
      .catch((error) => {
        toast.error("Failed to load job details");
        console.error(error);
      });
  };

  const handleDeleteJobListing = (jobId) => {
    setSelectedJobId(jobId); // Sets the ID of the job to delete
    setIsDeleteModalOpen(true); // Opens the delete modal
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false); // Closes the delete modal
    setSelectedJobId(null); // Resets selected job ID
  };

  // const confirmDelete = () => {
  //   if (selectedJobId) {
  //     // Checks if a job ID is selected
  //     const config = {
  //       method: "delete",
  //       url: `/admin/delete/joblisting/${selectedJobId}`, // API endpoint for deleting a job listing
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     };

  //     setLoading(true); // Shows loading indicator
  //     axios(config)
  //       .then(() => {
  //         toast.success("Job listing deleted successfully!"); // Shows success message
  //         setJobListings(
  //           (prevListings) =>
  //             prevListings.filter((job) => job.id !== selectedJobId) // Removes deleted job from list
  //         );
  //       })
  //       .catch(() => {
  //         toast.error("An error occurred while deleting the job listing."); // Shows error message
  //       })
  //       .finally(() => {
  //         setLoading(false); // Hides loading indicator
  //         setIsDeleteModalOpen(false); // Closes delete modal
  //         setSelectedJobId(null); // Resets selected job ID
  //       });
  //   }
  // };

  const handleDeactivateJob = (jobId) => {
    setSelectedJobId(jobId); // Set selected job ID
    setDeactivationReason(""); // Clear previous reason
    setIsDeleteModalOpen(true); // Open modal
  };

  const confirmDeactivate = async () => {
    if (selectedJobId) {
      if (!deactivationReason.trim()) {
        toast.error("Please provide a reason for deactivating the job.");
        return;
      }

      try {
        const response = await axios.put(
          `/admin/update/deactivate/joblisting/${selectedJobId}`,
          {
            reason: deactivationReason, // Include the reason
          }
        );

        if (response.data.successful) {
          toast.success("Job listing deactivated successfully!");
          setJobListings((prevListings) =>
            prevListings.map((job) =>
              job.id === selectedJobId
                ? { ...job, status: "DEACTIVATE" } // Update job status locally
                : job
            )
          );
          setIsDeleteModalOpen(false); // Close modal
        }
      } catch (error) {
        toast.error("Failed to deactivate the job listing.");
      }
    }
  };

  const formatJobData = (jobData) => ({
    id: jobData.id,
    companyName: jobData.company_name,
    jobName: jobData.position_name,
    description: jobData.description,
    jobLevel: jobData.level,
    jobStatus: jobData.status,
    requirements: jobData.requirement,
    qualification: jobData.qualification,
    minimumSalary: jobData.minimum_salary,
    maximumSalary: jobData.maximum_salary,
    positionType: jobData.position_type,
    disabilityTypes: jobData.disability_types,
    expiration: jobData.expiration
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setJob(null);
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("Id");
    localStorage.removeItem("Role");
    localStorage.removeItem("Token");
    toast.success("Logged out successfully", { position: "top-center" });
    navigate("/login");
    setIsLogoutModalOpen(false);
  };

  const closeLogoutModal = () => setIsLogoutModalOpen(false);

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;

  const filteredJobs = jobListings
    .filter((job) => {
      // Convert job.status to title case for comparison
      const jobStatusTitleCase = job.status
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase());

      // Default: Show only Active and Inactive if no statusFilter is set
      if (
        !statusFilter &&
        jobStatusTitleCase !== "Active" &&
        jobStatusTitleCase !== "Inactive"
      ) {
        return false;
      }

      // Filter by job status if statusFilter is set
      if (statusFilter && jobStatusTitleCase !== statusFilter) {
        return false;
      }
      const expirationFormatted = new Date(job.expiration).toISOString().split('T')[0]; // Search-friendly format (YYYY-MM-DD)
      const monthFormatted = new Date(job.expiration).toLocaleString('default', { month: 'long' }).toLowerCase(); // Full month name (e.g., "november")


      // Combine fields for searching (convert to lowercase for case-insensitive search)
      const combinedFields = `${job.position_name} ${job.company_name} ${job.level} ${expirationFormatted} ${monthFormatted}`.toLowerCase();

      // Check if combined fields include the search term
      return combinedFields.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (sortOrder === "A-Z") {
        return a.position_name.localeCompare(b.position_name);
      }
      if (sortOrder === "Z-A") {
        return b.position_name.localeCompare(a.position_name);
      }
      if (sortOrder === "Newest") {
        // Sort by date_created, newest first
        return new Date(b.date_created) - new Date(a.date_created);
      }
      if (sortOrder === "Oldest") {
        // Sort by date_created, oldest first
        return new Date(a.date_created) - new Date(b.date_created);
      }

      // Default: No sorting
      return 0;
    });

  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Sidebar */}
      <aside
        className={`bg-custom-blue w-full md:w-[300px] lg:w-[250px] p-4 flex flex-col items-center md:relative fixed top-0 left-0 min-h-screen h-full transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-50 md:z-auto ${
          isSidebarOpen ? "overflow-y-auto" : "" // Apply overflow-y-auto only when sidebar is open
        }`}
        style={{
          maxHeight: isSidebarOpen ? "100vh" : "none", // Set max height only when sidebar is open
        }}
      >
        {/* Logo Section */}
        <div className="w-full flex justify-center items-center mb-6 p-2 bg-white rounded-lg">
          <img
            src="/imgs/LOGO PWDKA.png" // Replace with the actual path to your logo
            alt="Logo"
            className="w-26 h-19 object-contain"
          />
        </div>

        <button
          className="text-white md:hidden self-end size-10"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Welcome,{" "}
          <span className="text-2xl md:text-3xl font-bold">
            {admin.firstName.charAt(0).toUpperCase() + admin.firstName.slice(1)}{" "}
            {admin.lastName.charAt(0).toUpperCase() + admin.lastName.slice(1)}
          </span>
          !
        </h2>

        {/* Dashboard Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Dashboard
        </h2>
        <hr className="border-white border-1 w-full mb-4" />

        <a
          href="/admin/dashboard"
          className={`${
            window.location.pathname === "/admin/dashboard"
              ? "bg-blue-900 text-gray-200" // Active style
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

        {/* Verification Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Verification
        </h2>
        <hr className="border-white border-1 w-full mb-4" />

        <a
          href="/admin/dashboard/VerifyUsers"
          className={`${
            window.location.pathname === "/admin/dashboard/VerifyUsers"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            how_to_reg
          </span>
          <span className="flex-grow text-center">Verify Applicants</span>
        </a>

        <a
          href="/admin/dashboard/VerifyComps"
          className={`${
            window.location.pathname === "/admin/dashboard/VerifyComps"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            apartment
          </span>
          <span className="flex-grow text-center">Verify Companies</span>
        </a>

        {/* View Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          View Records
        </h2>
        <hr className="border-white border-1 w-full mb-4" />

        <a
          href="/admin/dashboard/ViewUsers"
          className={`${
            window.location.pathname === "/admin/dashboard/ViewUsers"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
        >
          <span className="material-symbols-outlined text-xl mr-4">group</span>
          <span className="flex-grow text-center">View All Applicants</span>
        </a>

        <a
          href="/admin/dashboard/ViewCompany"
          className={`${
            window.location.pathname === "/admin/dashboard/ViewCompany"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            source_environment
          </span>
          <span className="flex-grow text-center">View All Companies</span>
        </a>

        <a
          href="/admin/dashboard/ViewJobs"
          className={`${
            window.location.pathname === "/admin/dashboard/ViewJobs"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
        >
          <span className="material-symbols-outlined text-xl mr-4">work</span>
          <span className="flex-grow text-center">View All Job Listings</span>
        </a>

        {/* Account Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Account
        </h2>
        <hr className="border-white border-1 w-full mb-4" />

        <a
          href="/admin/dashboard/viewadmin"
          className={`${
            window.location.pathname === "/admin/dashboard/viewadmin"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            manage_accounts
          </span>
          <span className="flex-grow text-center">Admin Management</span>
        </a>

        <a
          href="/adminprofile"
          className={`${
            window.location.pathname === "/adminprofile"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            server_person
          </span>
          <span className="flex-grow text-center">Profile</span>
        </a>

        <button
          className="bg-red-600 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out mt-6"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <button
        className={`md:hidden bg-custom-blue text-white p-4 fixed top-4 left-4 z-50 rounded-xl mt-11 transition-transform ${
          isSidebarOpen ? "hidden" : ""
        }`}
        onClick={() => setIsSidebarOpen(true)}
      >
        &#9776;
      </button>

      <main className="flex-grow p-8">
        <h1 className="text-xl font-bold text-gray-700">
          View All Job Listings
        </h1>

        {/* Search and Filter Bar */}
        <div className="flex items-center justify-center mt-6 mb-4 p-4 bg-white rounded-lg shadow-md space-x-4">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-1/2 px-4 py-2 border border-gray-300 bg-gray-100 text-black rounded-lg focus:outline-none focus:border-blue-500 shadow-inner"
            style={{ boxShadow: "inset 0px 4px 8px rgba(0, 0, 0, 0.1)" }}
          />
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 w-[130px] border border-gray-300 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 focus:outline-none focus:border-blue-500 transition duration-200"
            >
              <option value="A-Z">A-Z</option>
              <option value="Z-A">Z-A</option>
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-white">sort</span>
            </span>
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 w-[130px] border border-gray-300 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 focus:outline-none focus:border-blue-500 transition duration-200"
            >
              <option value="">Status</option>
              {/* Default "Status" will only include Active and Inactive */}
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Deactivate">Deactivate</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-white">
                filter_list
              </span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white mt-4 rounded-lg shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-600 text-white text-left text-xs md:text-sm uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Company</th>
                <th className="py-4 px-6 font-semibold">Job Title</th>
                <th className="py-4 px-6 font-semibold">Job Level</th>
                <th className="py-4 px-6 font-semibold">Status</th>{" "}
                <th className="py-4 px-6 font-semibold">Expiration</th>
                {/* New Job Status header */}
                <th className="py-4 px-6 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition duration-300"
                >
                  <td className="py-4 px-6 text-gray-800 text-sm md:text-base break-words">
                    {job.company_name
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </td>

                  <td className="py-4 px-6 text-gray-800 text-sm md:text-base break-words">
                    {job.position_name
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </td>
                  <td className="py-4 px-6 text-gray-800 text-sm md:text-base break-words">
                    {job.level
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </td>

                  {/* New Job Status Column */}
                  <td
                    className={`py-4 px-6 text-gray-800 text-sm md:text-base break-words ${
                      job.status && job.status.toLowerCase() === "active"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {job.status ? job.status : "Not specified"}
                  </td>

                  <td className="py-4 px-6 text-gray-800 text-sm md:text-base break-words">
                   {new Date(job.expiration).toLocaleDateString('en-US', {
                     
                     year: 'numeric', // full year
                       month: 'long',   // full month name (e.g., January)
                      day: 'numeric'   // numeric day
                    })}
                  </td>


                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleViewJob(job.id)}
                      className="bg-blue-500 text-white text-xs md:text-sm px-3 py-1 rounded-full shadow-sm hover:bg-blue-700 transition duration-200 font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() =>
                        job.status !== "DEACTIVATE" &&
                        handleDeleteJobListing(job.id)
                      } // Prevent click if already deactivated
                      className={`${
                        job.status === "DEACTIVATE"
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-red-500 text-white hover:bg-red-700"
                      } text-xs md:text-sm px-3 py-1 ml-2 rounded-full shadow-sm transition duration-200 font-medium`}
                      disabled={job.status === "DEACTIVATE"} // Disable button if deactivated
                    >
                      {job.status === "DEACTIVATE"
                        ? "Deactivated"
                        : "Deactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <ol className="flex justify-center gap-1 text-xs font-medium">
            <li>
              <button
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                className="inline-flex w-8 h-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900"
                disabled={currentPage === 1}
              >
                Prev
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;

              // Adjust the range to show current, previous, and next pages
              const isWithinRange =
                (currentPage <= 2 && pageNumber <= 3) ||
                (currentPage >= totalPages - 1 &&
                  pageNumber >= totalPages - 2) ||
                (pageNumber >= currentPage - 1 &&
                  pageNumber <= currentPage + 1);

              return (
                isWithinRange && (
                  <li key={pageNumber}>
                    <button
                      onClick={() => paginate(pageNumber)}
                      className={`block w-8 h-8 rounded border text-center leading-8 ${
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
                className="inline-flex w-8 h-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ol>
        </div>
      </main>

      {/* Modal for viewing job details */}
      {isModalOpen && job && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 mx-4 shadow-lg transition-transform transform scale-100 max-h-[90vh] overflow-y-auto w-full md:w-[700px]">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h3 className="text-2xl font-bold text-custom-blue flex items-center ">
                <span className="material-symbols-outlined mr-2">work</span> Job
                Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition duration-200"
              >
                <span className="material-symbols-outlined text-2xl">
                  close
                </span>
              </button>
            </div>

            {/* Company and Job Details */}
            <div className="grid gap-4 bg-gray-100 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-black font-semibold text-sm leading-relaxed  flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      business
                    </span>{" "}
                    Company:
                  </p>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                    {job.companyName
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </p>
                </div>
                <div>
                  <p className="text-black font-semibold text-sm leading-relaxed  flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      badge
                    </span>{" "}
                    Job Title:
                  </p>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                    {job.jobName
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </p>
                </div>
                <div>
                  <p className="text-black font-semibold text-sm leading-relaxed  flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      workspace_premium
                    </span>{" "}
                    Job Level:
                  </p>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                    {job.jobLevel
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-black font-semibold text-sm leading-relaxed  flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    description
                  </span>{" "}
                  Description:
                </p>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                  {job.description.charAt(0).toUpperCase() +
                    job.description.slice(1)}
                </p>
              </div>

              {/* Job Requirements and Qualifications */}
              <div>
                <p className="text-black font-semibold text-sm leading-relaxed flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    check_circle
                  </span>{" "}
                  Requirements:
                </p>
                <ul className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner list-disc pl-4">
                  {job?.requirements
                    ? job.requirements
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

              <div>
                <p className="text-black font-semibold text-sm leading-relaxed flex items-center">
                  <span className="material-symbols-outlined mr-1">school</span>{" "}
                  Qualification:
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

              {/* Salary and Position Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-black font-semibold text-sm leading-relaxed  flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      attach_money
                    </span>{" "}
                    Salary:
                  </p>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                    {job.minimumSalary && job.maximumSalary
                      ? job.minimumSalary === job.maximumSalary
                        ? `₱${job.minimumSalary.toLocaleString()}`
                        : `₱${job.minimumSalary.toLocaleString()} - ₱${job.maximumSalary.toLocaleString()}`
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-black font-semibold text-sm leading-relaxed  flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      work_outline
                    </span>{" "}
                    Position Type:
                  </p>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                    {job.positionType
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </p>
                </div>
              </div>

              {/* Disability Types */}
              <div>
                <p className="text-black font-semibold text-sm leading-relaxed  flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    accessible
                  </span>{" "}
                  Disabilities:
                </p>
                <ul className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner list-disc pl-4">
                  {job.disabilityTypes
                    .split(",") // Assuming disability types are separated by commas; adjust as needed
                    .map((disability, index) => (
                      <li key={index}>{disability.trim()}</li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg  hover:bg-gray-600 transition duration-200 font-medium"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            {/* Header Section */}
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Deactivate Job
              </h3>
              <button
                onClick={closeDeleteModal}
                className="text-gray-500 hover:text-gray-800 transition duration-200"
              >
                <span className="material-symbols-outlined text-2xl">
                  close
                </span>
              </button>
            </div>

            {/* Modal Content */}
            <p className="text-gray-600 text-sm md:text-base mb-4">
              Please confirm if you want to deactivate this job listing. Once
              deactivated, applicants will no longer see this job posting.
            </p>
            <label
              htmlFor="deactivationReason"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Reason for deactivation:
            </label>
            <textarea
              id="deactivationReason"
              placeholder="Enter the reason (required)"
              value={deactivationReason}
              onChange={(e) => setDeactivationReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 mb-6"
              rows={4}
            />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="px-5 py-2 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeactivate}
                className="px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
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
                Are you sure you want to log out?
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

export default AdminViewJobs;
