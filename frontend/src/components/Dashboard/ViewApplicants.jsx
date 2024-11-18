import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const ViewApplicants = () => {
  const [sortOption, setSortOption] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [jobName, setJobName] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(""); // Store rejection reason
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false); // Modal visibility
  const [rejectingApplicantId, setRejectingApplicantId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const applicantsPerPage = 7; // Customize this value as needed

  const [deleteApplicantId, setDeleteApplicantId] = useState(null);

  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const filteredApplicants = applicants.filter((applicant) =>
    selectedStatus === "All" ? true : applicant.status === selectedStatus
  );

  const checkCompanyStatus = async () => {
    try {
      const companyId = localStorage.getItem("Id");
      const response = await axios.get(
        `/company/view/verify/status/${companyId}`
      );
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
    const interval = setInterval(() => {
      checkCompanyStatus();
    }, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joblistingId = params.get("id");

    if (!joblistingId) {
      alert("Job listing ID is missing.");
      return;
    }

    const config = {
      method: "get",
      url: `/jobapplication/status/all/${joblistingId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    setIsLoading(true);
    axios(config)
      .then((response) => {
        // Set jobName directly from the backend response
        setJobName(response.data.jobName || "No Job Found");

        const fetchedApplicants = response.data.data.map((applicant) => ({
          id: applicant.id,
          fullName: `${applicant.first_name} ${
            applicant.middle_initial ? applicant.middle_initial + ". " : ""
          }${applicant.last_name}`,

          email: applicant.email,
          dateCreated: applicant.date_created
            ? new Date(applicant.date_created).toLocaleDateString()
            : null,
          status: applicant.status,
          resume: applicant.resume,
          profile: {
            fullName: `${applicant.first_name} ${
              applicant.middle_initial ? applicant.middle_initial + ". " : ""
            }${applicant.last_name}`,
            email: applicant.email,
            disability: applicant.type,
            city: applicant.city,
            contactNumber: applicant.contact_number,
            gender: applicant.gender,
            birthdate: applicant.birth_date
              ? new Date(applicant.birth_date).toLocaleDateString("en-US")
              : null,
            profilePicture: `data:image/png;base64,${applicant.formal_picture}`,
          },
        }));

        setApplicants(fetchedApplicants);
        toast.success("Applicants loaded successfully!");
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const confirmRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    try {
      const response = await axios.put(
        `/jobapplication/status/${rejectingApplicantId}`,
        {
          status: "REJECTED",
          rejectionReason,
        }
      );

      if (response.data.successful) {
        toast.success(
          response.data.message || "Applicant rejected successfully."
        );
        setIsLoading(true); // Set loading to true at the start
        setApplicants((prev) =>
          prev.map((applicant) =>
            applicant.id === rejectingApplicantId
              ? { ...applicant, status: "REJECTED" }
              : applicant
          )
        );
        closeRejectionModal();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to reject applicant.";
      toast.error(errorMessage);
      closeRejectionModal();
    } finally {
      setIsLoading(false); // Always set loading to false at the end
    }
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    setIsFilterOpen(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem("Id");
    localStorage.removeItem("Role");
    localStorage.removeItem("Token");
    window.location.href = "/login";
  };

  const openRejectionModal = (applicantId) => {
    setRejectingApplicantId(applicantId);
    setIsRejectionModalOpen(true);
  };

  const closeRejectionModal = () => {
    setRejectionReason("");
    setRejectingApplicantId(null);
    setIsRejectionModalOpen(false);
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  const handleStatusChange = (applicantId, newStatus) => {
    if (newStatus === "REJECTED") {
      openRejectionModal(applicantId); // Open modal for rejection reason
    } else {
      axios
        .put(`/jobapplication/status/${applicantId}`, { status: newStatus })
        .then((response) => {
          toast.success("Status updated successfully");
          setApplicants((prev) =>
            prev.map((applicant) =>
              applicant.id === applicantId
                ? { ...applicant, status: newStatus }
                : applicant
            )
          );
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.message || "Failed to update status";
          toast.error(errorMessage);
        });
    }
  };

  const openDeleteModal = (applicantId) => {
    setDeleteApplicantId(applicantId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteApplicantId(null);
  };

  const confirmDeleteApplicant = () => {
    axios
      .delete(`/jobapplication/delete/${deleteApplicantId}`)
      .then(() => {
        toast.success("Applicant deleted successfully!");
        setApplicants((prevApplicants) =>
          prevApplicants.filter(
            (applicant) => applicant.id !== deleteApplicantId
          )
        );
        closeDeleteModal();
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "Failed to delete applicant";
        toast.error(errorMessage);
        closeDeleteModal();
      });
  };

  const handleDeleteApplicant = (applicantId) => {
    axios
      .delete(`/jobapplication/delete/${applicantId}`)
      .then(() => {
        toast.success("Applicant deleted successfully!");
        setApplicants((prevApplicants) =>
          prevApplicants.filter((applicant) => applicant.id !== applicantId)
        );
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "Failed to delete applicant";
        toast.error(errorMessage);
      });
  };

  // Sort filtered applicants
  const sortedApplicants = filteredApplicants.sort((a, b) => {
    if (sortOption === "newest") {
      return new Date(b.dateCreated) - new Date(a.dateCreated);
    } else if (sortOption === "oldest") {
      return new Date(a.dateCreated) - new Date(b.dateCreated);
    } else if (sortOption === "a-z") {
      return a.fullName.localeCompare(b.fullName);
    } else if (sortOption === "z-a") {
      return b.fullName.localeCompare(a.fullName);
    }
    return 0;
  });

  // Paginate the sorted, filtered applicants
  const indexOfLastApplicant = currentPage * applicantsPerPage;
  const indexOfFirstApplicant = indexOfLastApplicant - applicantsPerPage;
  const currentApplicants = sortedApplicants.slice(
    indexOfFirstApplicant,
    indexOfLastApplicant
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openResumeModal = (resume) => {
    setSelectedResume(resume);
    setIsResumeModalOpen(true);
  };

  const closeResumeModal = () => {
    setIsResumeModalOpen(false);
    setSelectedResume(null);
  };

  const openProfileModal = (profile) => {
    setSelectedProfile(profile);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedProfile(null);
  };

  return (
    <div className="flex">
      <Toaster position="top-center" reverseOrder={false} />
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
        <hr className="border-white border-1 w-full mb-4" />
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
        <hr className="border-white border-1 w-full mb-4" />

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
        <hr className="border-white border-1 w-full mb-4" />

        {/* Logout Button */}
        <button
          className="bg-red-600 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out mt-6 flex items-center justify-center"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <div className="flex-1 p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          {/* Back Button */}
          <button
            className="text-blue-900 hover:text-blue-700 text-base flex items-center w-full sm:w-auto"
            onClick={handleBackClick}
          >
            ← Back
          </button>

          {/* Header Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-custom-blue text-left w-full sm:w-auto">
            Applicants for{" "}
            <span className="font-extrabold text-blue-900">{jobName}</span> (
            {applicants.length})
          </h2>

          {/* Filter and Status Selection */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Status Filter Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-2 px-4 border border-gray-300 rounded-lg shadow-md bg-custom-blue text-white"
            >
              <option value="All">All</option>
              <option value="Under Review">Under Review</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Pending">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Sorting Options Dropdown */}
            <select
              onChange={(e) => handleSortChange(e.target.value)}
              className="py-2 px-4 border border-gray-300 rounded-lg shadow-md bg-custom-blue text-white"
              defaultValue="Sort"
            >
              <option disabled value="Sort">
                Sort By
              </option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
            </select>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Table Header for Desktop */}
            <thead>
              <tr className="bg-blue-600 text-white text-left text-sm uppercase tracking-wider hidden sm:table-row">
                <th className="py-4 px-6 font-semibold">Full Name</th>
                <th className="py-4 px-6 font-semibold">Email</th>
                <th className="py-4 px-6 font-semibold">Date Applied</th>
                <th className="py-4 px-6 font-semibold text-center">Status</th>
                <th className="py-4 px-6 font-semibold text-center">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {currentApplicants.length > 0 ? (
                currentApplicants.map((applicant) => (
                  <tr
                    key={applicant.id}
                    className="bg-gray-50 p-3 rounded-lg mb-2 shadow-md transition duration-300 sm:table-row flex flex-col"
                  >
                    {/* Desktop Row - Displays in table format on larger screens */}
                    <td className="py-4 px-6 text-gray-800 hidden sm:table-cell">
                      {applicant.fullName
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                        )
                        .join(" ")}
                    </td>
                    <td className="py-4 px-6 text-gray-800 hidden sm:table-cell">
                      {applicant.email}
                    </td>
                    <td className="py-4 px-6 text-gray-800 hidden sm:table-cell">
                      {applicant.dateCreated}
                    </td>
                    <td className="py-4 px-6 text-center hidden sm:table-cell">
                      <select
                        value={applicant.status}
                        onChange={(e) =>
                          handleStatusChange(applicant.id, e.target.value)
                        }
                        className="py-1 px-2 bg-yellow-500 text-white font-semibold rounded-md shadow-sm hover:bg-yellow-600 transition duration-200"
                      >
                        <option value="Under Review">Under Review</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Pending">Pending</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-center hidden sm:flex justify-center space-x-2">
                      <button
                        className="py-1 px-3 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 transition duration-200 text-sm font-medium"
                        onClick={() => openProfileModal(applicant.profile)}
                      >
                        View Profile
                      </button>
                      <button
                        className="py-1 px-3 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 transition duration-200 text-sm font-medium"
                        onClick={() => openResumeModal(applicant.resume)}
                      >
                        View Resume
                      </button>
                      <button
                        className="py-1 px-3 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 transition duration-200 text-sm font-medium"
                        onClick={() => openDeleteModal(applicant.id)}
                      >
                        Delete
                      </button>
                    </td>

                    {/* Mobile Row - Displays as a stacked card format on smaller screens */}
                    <td className="sm:hidden flex flex-col text-black text-xs py-2 px-3">
                      <div className="mb-1">
                        <span className="font-semibold">Name: </span>
                        {applicant.fullName
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")}
                      </div>
                      <div className="mb-1">
                        <span className="font-semibold">Email: </span>
                        {applicant.email}
                      </div>
                      <div className="mb-1">
                        <span className="font-semibold">Date: </span>
                        {applicant.dateCreated}
                      </div>

                      {/* Status and Actions for Mobile */}
                      <div className="flex justify-between items-center mt-2">
                        <select
                          value={applicant.status}
                          onChange={(e) =>
                            handleStatusChange(applicant.id, e.target.value)
                          }
                          className="py-1 px-2 bg-yellow-500 text-white font-semibold rounded-md shadow-sm hover:bg-yellow-600 transition duration-200 text-xs"
                        >
                          <option value="Under Review">Under Review</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Pending">Pending</option>
                          <option value="REJECTED">Rejected</option>
                        </select>

                        <div className="flex space-x-1">
                          <button
                            className="py-1 px-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 transition duration-200 text-xs font-medium"
                            onClick={() => openProfileModal(applicant.profile)}
                          >
                            Profile
                          </button>
                          <button
                            className="py-1 px-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 transition duration-200 text-xs font-medium"
                            onClick={() => openResumeModal(applicant.resume)}
                          >
                            Resume
                          </button>
                          <button
                            className="py-1 px-2 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 transition duration-200 text-xs font-medium"
                            onClick={() => openDeleteModal(applicant.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-gray-500 text-lg"
                  >
                    No applicants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Rejection Modal */}
        {isRejectionModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4 sm:mx-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  Rejection Confirmation
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700 transition duration-200 focus:outline-none"
                  onClick={closeRejectionModal}
                >
                  <span className="material-symbols-outlined text-2xl">
                    close
                  </span>
                </button>
              </div>

              {/* Rejection Reason Textarea */}
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows="4"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              ></textarea>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                  onClick={closeRejectionModal}
                >
                  Cancel
                </button>
                <button
                  className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                  onClick={confirmRejection}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

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

            {Array.from(
              { length: Math.ceil(applicants.length / applicantsPerPage) },
              (_, index) => {
                const pageNumber = index + 1;

                // Adjust the range to always show 3 buttons based on currentPage
                const isWithinRange =
                  (currentPage <= 2 && pageNumber <= 3) || // Show 1, 2, 3 if on page 1 or 2
                  (currentPage >=
                    Math.ceil(applicants.length / applicantsPerPage) - 1 &&
                    pageNumber >=
                      Math.ceil(applicants.length / applicantsPerPage) - 2) || // Show last 3 pages if near end
                  (pageNumber >= currentPage - 1 &&
                    pageNumber <= currentPage + 1); // Show current, previous, and next pages

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
              }
            )}

            <li>
              <button
                onClick={() =>
                  currentPage <
                    Math.ceil(applicants.length / applicantsPerPage) &&
                  paginate(currentPage + 1)
                }
                className="inline-flex w-8 h-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900"
                disabled={
                  currentPage ===
                  Math.ceil(applicants.length / applicantsPerPage)
                }
              >
                Next
              </button>
            </li>
          </ol>
        </div>

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Delete Confirmation
                </h2>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-500 hover:text-gray-800 transition duration-200"
                >
                  &times;
                </button>
              </div>
              <div className="mb-6">
                <p className="text-lg text-gray-600">
                  Are you sure you want to delete this applicant? This action
                  cannot be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeDeleteModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteApplicant}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resume Modal */}
        {isResumeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg relative w-full max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-4 md:mx-8">
              {/* Close Button */}
              <button
                onClick={closeResumeModal}
                className="absolute top-3 right-3 text-lg sm:text-xl md:text-2xl font-bold text-gray-700 hover:text-gray-900"
                aria-label="Close Resume Modal"
              >
                &times;
              </button>

              {/* Modal Header */}
              <h3 className="text-center text-sm sm:text-base md:text-lg font-semibold mb-4">
                Applicant's Resume
              </h3>

              {/* PDF Embed via iframe */}
              <iframe
                src={`data:application/pdf;base64,${selectedResume}`}
                type="application/pdf"
                width="100%"
                className="w-full border rounded-lg shadow-sm"
                style={{ height: "60vh", maxHeight: "80vh" }}
                aria-label="PDF Preview"
              >
                {/* Fallback message */}
                <p className="text-center text-gray-500">
                  Unable to display PDF.{" "}
                  <a
                    href={`data:application/pdf;base64,${selectedResume}`}
                    download="resume.pdf"
                    className="text-blue-600 underline"
                  >
                    Download here
                  </a>
                  .
                </p>
              </iframe>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-2xl mx-4 transition-transform transform scale-100 max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeProfileModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-200"
              >
                <span className="material-symbols-outlined text-3xl">
                  close
                </span>
              </button>
              <h3 className="text-2xl font-bold text-black mb-6 text-center flex items-center">
                <span className="material-symbols-outlined mr-2">person</span>
                Applicant's Profile
              </h3>
              <div className="flex flex-col items-center mb-6">
                <img
                  src={selectedProfile?.profilePicture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-custom-blue shadow-lg mb-4"
                />
                <h4 className="text-lg font-semibold text-black">
                  {selectedProfile?.fullName
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </h4>
                <p className="text-gray-600">{selectedProfile?.email}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      accessibility
                    </span>
                    Disability:
                  </p>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                    {selectedProfile?.disability}
                  </p>
                </div>
                <div>
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      location_city
                    </span>
                    City:
                  </p>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                    {selectedProfile?.city
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
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      phone
                    </span>
                    Contact Number:
                  </p>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                    {selectedProfile?.contactNumber}
                  </p>
                </div>
                <div>
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">male</span>
                    Gender:
                  </p>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                    {selectedProfile?.gender
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
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">cake</span>
                    Birthdate:
                  </p>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                    {selectedProfile?.birthdate}
                  </p>
                </div>
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

              <p className="text-lg text-gray-600 mb-6">
                Are you sure you want to logout?
              </p>

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
    </div>
  );
};

export default ViewApplicants;
