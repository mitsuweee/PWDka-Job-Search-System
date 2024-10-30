import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const ViewApplicants = () => {
  const [sortOption, setSortOption] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [reviewedApplicants, setReviewedApplicants] = useState([]); // Reviewed applicants state
  const [jobName, setJobName] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isReviewedModalOpen, setIsReviewedModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      localStorage.removeItem("Id");
      localStorage.removeItem("Role");
      localStorage.removeItem("Token");
      navigate("/login");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joblistingId = params.get("id");

    if (!joblistingId) {
      alert("Job listing ID is missing.");
      return;
    }

    const config = {
      method: "get",
      url: `/jobapplication/applications/${joblistingId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    setIsLoading(true);
    axios(config)
      .then(async (response) => {
        const fetchedJobApplicants = await Promise.all(
          response.data.data.map((applicant) => {
            const fullName = [
              applicant.first_name || "",
              applicant.middle_initial ? `${applicant.middle_initial}.` : "",
              applicant.last_name || "",
            ]
              .filter(Boolean)
              .join(" ")
              .trim(); // Ensure no leading/trailing spaces

            console.log("Constructed Full Name:", fullName); // Debug log

            return {
              id: applicant.id,
              fullName: fullName, // Use the constructed fullName
              email: applicant.email,
              resume: applicant.resume,
              jobAppliedFor: applicant.position_name,
              dateCreated: applicant.date_created
                ? new Date(applicant.date_created).toLocaleDateString()
                : null,
              profile: {
                fullName: `${applicant.first_name} ${applicant.middle_initial}. ${applicant.last_name}`,
                email: applicant.email,
                disability: applicant.type,
                city: applicant.city,
                contactNumber: applicant.contact_number,
                gender: applicant.gender,
                birthdate: new Date(applicant.birth_date).toLocaleDateString(
                  "en-US"
                ),
                profilePicture: `data:image/png;base64,${applicant.formal_picture}`,
              },
              reviewed: false,
            };
          })
        );

        if (fetchedJobApplicants.length > 0) {
          setJobName(fetchedJobApplicants[0].jobAppliedFor);
        } else {
          setJobName("No Job Found");
        }

        setApplicants(fetchedJobApplicants);
        toast.success("Applicants loaded successfully!");
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
        setLoading(false);
      });
  }, []);

  const fetchApplicantsByStatus = async (status) => {
    const joblistingId = new URLSearchParams(window.location.search).get("id");

    if (!joblistingId) {
      alert("Job listing ID is missing.");
      return;
    }

    try {
      setIsLoading(true);
      let url;

      // Construct URL based on the selected status
      if (status === "All") {
        url = `/jobapplication/all/${joblistingId}`; // Fetch all applicants
      } else {
        url = `/jobapplication/${status}/${joblistingId}`; // Fetch by specific status
      }

      const response = await axios.get(url);

      if (response.data.successful) {
        const applicantsData = await Promise.all(
          response.data.data.map((applicant) => {
            const fullName = [
              applicant.first_name || "",
              applicant.middle_initial ? `${applicant.middle_initial}.` : "",
              applicant.last_name || "",
            ]
              .filter(Boolean)
              .join(" ")
              .trim();

            return {
              id: applicant.id,
              fullName: fullName,
              email: applicant.email || "N/A",
              resume: applicant.resume || "N/A",
              jobAppliedFor: applicant.position_name || "N/A",
              dateCreated: applicant.date_created
                ? new Date(applicant.date_created).toLocaleDateString()
                : "N/A",
            };
          })
        );

        setApplicants(applicantsData);
        setJobName(applicantsData[0]?.jobAppliedFor || "No Job Found");
        toast.success("Applicants loaded successfully!");
      } else {
        setJobName("No Job Found");
        setApplicants([]);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFilterMenu = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    setIsFilterOpen(false);
  };

  const openResumeModal = (resume) => {
    setSelectedResume(resume);
    setIsResumeModalOpen(true);
  };

  const closeResumeModal = () => {
    setIsResumeModalOpen(false);
    setSelectedResume(null);
  };

  const openProfileModal = (applicant) => {
    const profile = {
      fullName: applicant.fullName || "N/A",
      email: applicant.email || "N/A",
      disability:
        applicant.profile?.disability ||
        applicant.disability ||
        "Not specified",
      city: applicant.profile?.city || applicant.city || "Not specified",
      contactNumber:
        applicant.profile?.contactNumber ||
        applicant.contactNumber ||
        "Not specified",
      gender: applicant.profile?.gender || applicant.gender || "Not specified",
      birthdate:
        applicant.profile?.birthdate || applicant.birthdate || "Not specified",
      profilePicture:
        applicant.profile?.profilePicture ||
        applicant.profilePicture ||
        "/default.png",
    };

    setSelectedProfile(profile);
    setIsProfileModalOpen(true);
    setIsReviewedModalOpen(false);
  };

  const handleDeleteApplicant = (applicantId) => {
    const config = {
      method: "delete",
      url: `/jobapplication/delete/${applicantId}`, // Update this URL based on your backend endpoint for deletion
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        toast.success("Applicant deleted successfully!");

        // Update state to remove the deleted applicant from the list
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

  const goBackToReviewedModal = () => {
    setIsReviewedModalOpen(true);
    setIsProfileModalOpen(false);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedProfile(null);
  };

  const openApplicantsStatusModal = () => {
    const params = new URLSearchParams(window.location.search);
    const joblistingId = params.get("id");

    const config = {
      method: "get",
      url: `/jobapplication/all/${joblistingId}`, // Adjust the endpoint to fetch all statuses
      headers: {
        "Content-Type": "application/json",
      },
    };

    setIsLoading(true);
    axios(config)
      .then((response) => {
        const fetchedApplicants = response.data.data.map((applicant) => ({
          profilePicture: `data:image/png;base64,${applicant.formal_picture}`,
          id: applicant.id,
          fullName: `${applicant.first_name} ${
            applicant.middle_initial ? applicant.middle_initial + ". " : ""
          }${applicant.last_name}`,
          email: applicant.email,
          contactNumber: applicant.contact_number,
          birthdate: applicant.birth_date,
          gender: applicant.gender,
          city: applicant.city,
          disability: applicant.type,
          status: applicant.status, // Include the status field to display it
        }));

        setReviewedApplicants(fetchedApplicants);
        setIsReviewedModalOpen(true);
        toast.success("Applicants loaded successfully!");
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "Failed to load applicants";
        toast.error(errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const closeReviewedModal = () => {
    setIsReviewedModalOpen(false);
  };

  const handleStatusChange = (applicantId, newStatus) => {
    axios
      .put(`/jobapplication/status/${applicantId}`, { status: newStatus })
      .then((response) => {
        toast.success("Status updated successfully");

        const updatedApplicant = response.data.data; // Get the updated data

        // Update the local state with the new status
        setApplicants((prev) =>
          prev.map((applicant) =>
            applicant.id === updatedApplicant.id
              ? { ...applicant, status: updatedApplicant.status }
              : applicant
          )
        );
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "Failed to update status";
        toast.error(errorMessage);
      });
  };

  // DAGDAG KO
  const openReviewedModal = () => {
    const params = new URLSearchParams(window.location.search);
    const joblistingId = params.get("id");

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
        const fetchedApplicants = response.data.data.map((applicant) => ({
          id: applicant.id,
          fullName: `${applicant.first_name} ${
            applicant.middle_initial ? applicant.middle_initial + ". " : ""
          }${applicant.last_name}`,
          email: applicant.email,
          status: applicant.status,
        }));

        setReviewedApplicants(fetchedApplicants);
        setIsReviewedModalOpen(true);
        toast.success("Applicants with statuses loaded successfully!");
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "Failed to load applicants";
        toast.error(errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

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
        {/* Logo Section */}
        <div className="w-full flex justify-center items-center mb-6 p-2 bg-white rounded-lg">
          <img
            src="/imgs/LOGO PWDKA.png" // Replace with the actual path to your logo
            alt="Logo"
            className="w-26 h-19 object-contain"
          />
        </div>

        {/* Close Button for Mobile */}
        <button
          className="text-white md:hidden self-end text-3xl"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>

        {/* Dashboard Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Dashboard
        </h2>
        <hr className="border-gray-400 w-full mb-4" />
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
        <hr className="border-gray-400 w-full mb-4" />

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
        <hr className="border-gray-400 w-full mb-4" />

        {/* Logout Button */}
        <button
          className="bg-red-600 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out mt-6 flex items-center justify-center"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-custom-blue">
            Applicants for{" "}
            <span className="font-extrabold text-blue-900">{jobName}</span> (
            {applicants.length})
          </h2>
        </div>

        {/* Button for viewing all applicants' statuses
        <button
          className="mb-6 py-2 px-4 bg-green-600 text-white rounded-lg"
          onClick={openReviewedModal}
        >
          Applicants Status
        </button> */}

        {/* Status Filter and Sort Section */}
        <div className="flex items-center mb-3">
          {/* Filter by Status Button */}
          <button
            className="py-2 px-4 rounded-lg bg-green-600 text-white"
            onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)} // Toggle the status filter dropdown
          >
            Filter by Status
          </button>

          {/* Status Dropdown */}
          {isStatusFilterOpen && (
            <div className="relative ml-2">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  if (e.target.value === "All") {
                    fetchApplicantsByStatus(""); // Fetch all applicants if "All" is selected
                  } else {
                    fetchApplicantsByStatus(e.target.value);
                  }
                }}
                className="py-2 px-4 rounded-lg bg-gray-200 text-blue-900"
              >
                <option value="All">All</option>
                <option value="Under Review">Under Review</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          )}

          {/* Sort Button */}
          <button
            className="py-2 px-4 rounded-lg bg-blue-600 text-white ml-2" // Add margin-left for spacing
            onClick={() => setIsFilterOpen(!isFilterOpen)} // Toggle sort options
          >
            Sort by
          </button>

          {/* Sort Options Dropdown */}
          {isFilterOpen && (
            <div className="relative ml-2" onClick={(e) => e.stopPropagation()}>
              {" "}
              {/* Flex column for sort options */}
              <div className="py-2 px-4 rounded-lg bg-gray-200">
                <button
                  className={`py-2 px-4 rounded-lg  text-blue-900 ${
                    sortOption === "newest" ? "bg-blue-600 text-white" : ""
                  }`}
                  onClick={() => handleSortChange("newest")}
                >
                  Newest
                </button>
                <button
                  className={`py-2 px-4 rounded-lg text-blue-900 ${
                    sortOption === "oldest" ? "bg-blue-600 text-white" : ""
                  }`}
                  onClick={() => handleSortChange("oldest")}
                >
                  Oldest
                </button>
                <button
                  className={`py-2 px-4 rounded-lg  text-blue-900 ${
                    sortOption === "a-z" ? "bg-blue-600 text-white" : ""
                  }`}
                  onClick={() => handleSortChange("a-z")}
                >
                  A-Z
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Applicants Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-6 text-left">Full Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Date Applied</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedApplicants.length > 0 ? (
                sortedApplicants.map((applicant) => (
                  <tr
                    key={applicant.id}
                    className="border-b border-gray-200 hover:bg-gray-100 transition duration-200"
                  >
                    <td className="py-3 px-6 text-left">
                      {
                        applicant.fullName && applicant.fullName.trim()
                          ? applicant.fullName
                              .split(" ")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              )
                              .join(" ")
                          : "N/A" // Display N/A if fullName is empty or not a valid string
                      }
                    </td>
                    <td className="py-3 px-6 text-left">{applicant.email}</td>
                    <td className="py-3 px-6 text-left">
                      {applicant.dateCreated}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3 px-6 text-center space-x-2">
                      <button
                        className="py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => openResumeModal(applicant.resume)}
                      >
                        View Resume
                      </button>
                      <button
                        className="py-1 px-2 bg-green-500 text-white rounded hover:bg-green-600"
                        onClick={() => openProfileModal(applicant.profile)}
                      >
                        View Profile
                      </button>
                      <button
                        className="py-1 px-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleDeleteApplicant(applicant.id)}
                      >
                        Delete
                      </button>
                      <select
                        value={applicant.status || "Under Review"}
                        onChange={(e) =>
                          handleStatusChange(applicant.id, e.target.value)
                        }
                        className="py-1 px-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        <option value="Under Review">Under Review</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    No applicants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Resume Modal */}
        {isResumeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg relative w-full max-w-6xl">
              <button
                onClick={closeResumeModal}
                className="absolute top-2 right-2 text-2xl font-bold text-gray-700 hover:text-gray-900"
              >
                &times;
              </button>
              <h3 className="text-lg font-semibold mb-4">Applicant's Resume</h3>
              <embed
                src={`data:application/pdf;base64,${selectedResume}`}
                type="application/pdf"
                width="100%"
                height="800px"
                className="w-full border rounded-lg shadow-sm"
                aria-label="PDF Preview"
              />
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {isProfileModalOpen && selectedProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-2xl">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-2 right-2 text-2xl font-bold text-gray-700 hover:text-gray-900"
              >
                &times;
              </button>

              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                Applicant's Profile
              </h3>

              <div className="flex flex-col items-center mb-4">
                <img
                  src={selectedProfile.profilePicture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-blue-600 shadow-lg mb-4"
                />
                <h4 className="text-lg font-semibold text-gray-900">
                  {selectedProfile.fullName}
                </h4>
                <p className="text-gray-600">{selectedProfile.email}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Disability:
                  </p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile.disability}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">City:</p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile.city}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Contact Number:
                  </p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile.contactNumber}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">Gender:</p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile.gender}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Birthdate:
                  </p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile.birthdate}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsReviewedModalOpen(true); // Navigate back to previous modal if needed
                }}
                className="mt-4 py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back to Applicants Status
              </button>
            </div>
          </div>
        )}

        {/* Applicants Status Modal */}
        {isReviewedModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-2xl">
              <button
                onClick={closeReviewedModal}
                className="absolute top-2 right-2 text-2xl font-bold text-gray-700 hover:text-gray-900"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                Applicants Status
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                  <thead>
                    <tr className="bg-gray-200 text-gray-700">
                      <th className="py-3 px-6 text-left">Full Name</th>
                      <th className="py-3 px-6 text-left">Email</th>
                      <th className="py-3 px-6 text-left">Status</th>
                      <th className="py-3 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewedApplicants.length > 0 ? (
                      reviewedApplicants.map((applicant) => (
                        <tr
                          key={applicant.id}
                          className="border-b border-gray-200 hover:bg-gray-100 transition duration-200"
                        >
                          <td className="py-3 px-6 text-left">
                            {applicant.fullName}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {applicant.email}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {applicant.status}
                          </td>
                          <td className="py-3 px-6 text-center space-x-2">
                            <button
                              className="py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                              onClick={() => openResumeModal(applicant.resume)}
                            >
                              View Resume
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-4 text-center text-gray-500"
                        >
                          No applicants found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {isResumeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg relative w-full max-w-6xl">
              <button
                onClick={closeResumeModal}
                className="absolute top-2 right-2 text-2xl font-bold text-gray-700 hover:text-gray-900"
              >
                &times;
              </button>
              <h3 className="text-lg font-semibold mb-4">Applicant's Resume</h3>
              <embed
                src={`data:application/pdf;base64,${selectedResume}`}
                type="application/pdf"
                width="100%"
                height="800px"
                className="w-full border rounded-lg shadow-sm"
                aria-label="PDF Preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewApplicants;
