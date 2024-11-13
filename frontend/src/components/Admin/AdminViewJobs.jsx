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
        toast.error("Your account has been deactivated. Logging out.");

        // Wait briefly before logging out
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      toast.error("Failed to verify admin status.");
    }
  };

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
        toast.success("Job listings loaded successfully");
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

  const confirmDelete = () => {
    if (selectedJobId) {
      // Checks if a job ID is selected
      const config = {
        method: "delete",
        url: `/admin/delete/joblisting/${selectedJobId}`, // API endpoint for deleting a job listing
        headers: {
          "Content-Type": "application/json",
        },
      };

      setLoading(true); // Shows loading indicator
      axios(config)
        .then(() => {
          toast.success("Job listing deleted successfully!"); // Shows success message
          setJobListings(
            (prevListings) =>
              prevListings.filter((job) => job.id !== selectedJobId) // Removes deleted job from list
          );
        })
        .catch(() => {
          toast.error("An error occurred while deleting the job listing."); // Shows error message
        })
        .finally(() => {
          setLoading(false); // Hides loading indicator
          setIsDeleteModalOpen(false); // Closes delete modal
          setSelectedJobId(null); // Resets selected job ID
        });
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

      // Filter by job status if statusFilter is set
      if (statusFilter && jobStatusTitleCase !== statusFilter) {
        return false;
      }

      // Combine fields for general search
      const combinedFields =
        `${job.position_name} ${job.company_name} ${job.level}`.toLowerCase();
      return combinedFields.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (sortOrder === "A-Z")
        return a.position_name.localeCompare(b.position_name);
      if (sortOrder === "Z-A")
        return b.position_name.localeCompare(a.position_name);
      if (sortOrder === "Newest")
        return new Date(b.date_created) - new Date(a.date_created); // Updated to use date_created
      if (sortOrder === "Oldest")
        return new Date(a.date_created) - new Date(b.date_created); // Updated to use date_created
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
              <option value="">All</option>{" "}
              {/* Shows all jobs if no status filter is selected */}
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

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white mt-4 rounded-lg shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-600 text-white text-left text-xs md:text-sm uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Company</th>
                <th className="py-4 px-6 font-semibold">Job Title</th>
                <th className="py-4 px-6 font-semibold">Job Level</th>
                <th className="py-4 px-6 font-semibold">Status</th>{" "}
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
                  <td className="py-4 px-6 text-gray-800 text-sm md:text-base break-words">
                    {job.status ? job.status : "Not specified"}
                  </td>

                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleViewJob(job.id)}
                      className="bg-blue-500 text-white text-xs md:text-sm px-3 py-1 rounded-full shadow-sm hover:bg-blue-700 transition duration-200 font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteJobListing(job.id)} // Opens delete modal with job ID
                      className="bg-red-500 text-white text-xs md:text-sm px-3 py-1 ml-2 rounded-full shadow-sm hover:bg-red-700 transition duration-200 font-medium"
                    >
                      Delete
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
                    {job.positionType}
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
                onClick={confirmDelete} // Confirms deletion
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={closeDeleteModal} // Cancels deletion
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
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
