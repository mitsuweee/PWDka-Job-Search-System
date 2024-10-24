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
          response.data.data.map((applicant) => ({
            id: applicant.id,
            fullName: `${applicant.first_name} ${applicant.middle_initial}. ${applicant.last_name}`, // Constructing full name
            email: applicant.email,
            resume: applicant.resume,
            jobAppliedFor: applicant.position_name,
            profile: {
              fullName: `${applicant.first_name} ${applicant.middle_initial}. ${applicant.last_name}`,
              email: applicant.email,
              disability: applicant.type,
              location: applicant.Location,
              contactNumber: applicant.contact_number,
              gender: applicant.gender,
              birthdate: new Date(applicant.birth_date).toLocaleDateString(
                "en-US"
              ),
              profilePicture: `data:image/png;base64,${applicant.formal_picture}`,
            },
            reviewed: false, // Adding the reviewed status
          }))
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
      location:
        applicant.profile?.location || applicant.location || "Not specified",
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
        "/default.png", // Fallback image
    };

    setSelectedProfile(profile);
    setIsProfileModalOpen(true);
    setIsReviewedModalOpen(false); // Close the reviewed modal if open
  };

  const goBackToReviewedModal = () => {
    setIsReviewedModalOpen(true); // Open the reviewed modal
    setIsProfileModalOpen(false); // Close the profile modal
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedProfile(null);
  };

  const openReviewedModal = () => {
    const params = new URLSearchParams(window.location.search);
    const joblistingId = params.get("id");

    const config = {
      method: "get",
      url: `/jobapplication/reviewed/${joblistingId}`, // API endpoint to get reviewed applicants
      headers: {
        "Content-Type": "application/json",
      },
    };

    setIsLoading(true);
    axios(config)
      .then((response) => {
        const fetchedReviewedApplicants = response.data.data.map(
          (applicant) => ({
            id: applicant.id,
            fullName: applicant.full_name,
            email: applicant.email,
          })
        );

        setReviewedApplicants(fetchedReviewedApplicants); // Set reviewed applicants with full names
        setIsReviewedModalOpen(true); // Open the modal after data is loaded
        toast.success("Reviewed applicants loaded successfully!");
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "Failed to load reviewed applicants";
        toast.error(errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const closeReviewedModal = () => {
    setIsReviewedModalOpen(false);
  };

  const handleReviewToggle = (applicantId) => {
    const config = {
      method: "put",
      url: `/jobapplication/status/reviewed/${applicantId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        toast.success("Applicant status updated to Reviewed");

        // Move the reviewed applicant to the reviewed list
        const updatedApplicants = applicants.filter(
          (applicant) => applicant.id !== applicantId
        );
        const reviewedApplicant = applicants.find(
          (applicant) => applicant.id === applicantId
        );
        reviewedApplicant.reviewed = true;
        setReviewedApplicants([...reviewedApplicants, reviewedApplicant]);
        setApplicants(updatedApplicants);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "Failed to update status";
        toast.error(errorMessage);
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
      <aside
        className={`bg-custom-blue w-full md:w-[300px] lg:w-[250px] p-4 flex flex-col items-center md:relative fixed top-0 left-0 min-h-screen h-full transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-50 md:z-auto`}
      >
        <button
          className="text-white md:hidden self-end text-3xl"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>

        {/* Dashboard Button */}
        <a
          href="/dashc"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            dashboard
          </span>
          <span className="flex-grow text-center">Dashboard</span>
        </a>

        {/* Post Job Button */}
        <a
          href="/dashboard/postjob"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">work</span>
          <span className="flex-grow text-center">Post Job</span>
        </a>

        {/* View Jobs Button */}
        <a
          href="/dashboard/ViewJobs"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">list</span>
          <span className="flex-grow text-center">View All Job Listings</span>
        </a>

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

        {/* Button for reviewing applicants */}
        <button
          className="mb-6 py-2 px-4 bg-green-600 text-white rounded-lg"
          onClick={openReviewedModal}
        >
          Reviewed Applicants
        </button>

        {/* Applicants Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-6 text-left">Full Name</th>
                <th className="py-3 px-6 text-left">Email</th>
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
                      {applicant.fullName
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                        )
                        .join(" ")}
                    </td>

                    <td className="py-3 px-6 text-left">{applicant.email}</td>
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
                        className="py-1 px-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        onClick={() => handleReviewToggle(applicant.id)}
                      >
                        Review
                      </button>
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
        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-2xl">
              <button
                onClick={closeProfileModal}
                className="absolute top-2 right-2 text-2xl font-bold text-gray-700 hover:text-gray-900"
              >
                &times;
              </button>

              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                Applicant's Profile
              </h3>

              <div className="flex flex-col items-center mb-4">
                <img
                  src={selectedProfile?.profilePicture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-blue-600 shadow-lg mb-4"
                />
                <h4 className="text-lg font-semibold text-gray-900">
                  {selectedProfile?.fullName}
                </h4>
                <p className="text-gray-600">{selectedProfile?.email}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Disability:
                  </p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile?.disability || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Location:
                  </p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile?.location || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Contact Number:
                  </p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile?.contactNumber || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">Gender:</p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile?.gender || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Birthdate:
                  </p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile?.birthdate}
                  </p>
                </div>
              </div>

              {/* Back Button */}
              <button
                onClick={goBackToReviewedModal}
                className="mt-4 py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back to Reviewed Applicants
              </button>
            </div>
          </div>
        )}

        {/* Reviewed Applicants Modal */}
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
                Reviewed Applicants
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                  <thead>
                    <tr className="bg-gray-200 text-gray-700">
                      <th className="py-3 px-6 text-left">Full Name</th>
                      <th className="py-3 px-6 text-left">Email</th>
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
                            {applicant.fullName
                              .split(" ")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              )
                              .join(" ")}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {applicant.email}
                          </td>
                          <td className="py-3 px-6 text-center space-x-2">
                            <button
                              className="py-1 px-2 bg-green-500 text-white rounded hover:bg-green-600"
                              onClick={() => openProfileModal(applicant)}
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-4 text-center text-gray-500"
                        >
                          No reviewed applicants.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewApplicants;
