import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ViewApplicants = () => {
  const [sortOption, setSortOption] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null); // For resume modal
  const [selectedProfile, setSelectedProfile] = useState(null); // For profile modal
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false); // Resume modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // Profile modal state
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      sessionStorage.removeItem("Id");
      sessionStorage.removeItem("Role");
      sessionStorage.removeItem("Token");

      navigate("/login");
    }
  };

  // Fetch job listings
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
    axios(config)
      .then(async (response) => {
        const fetchedJobApplicants = await Promise.all(
          response.data.data.map((applicant) => ({
            id: applicant.id,
            fullName: applicant.full_name,
            email: applicant.email,
            resume: applicant.resume, // URL for PDF preview
            jobAppliedFor: applicant.position_name,
            profile: {
              fullName: applicant.full_name, // Full name is concatenated
              email: applicant.email, // Email
              disability: applicant.type, // From disability.type
              location: applicant.Location, // Concatenated address + city
              contactNumber: applicant.contact_number,
              gender: applicant.gender,
              birthdate: new Date(applicant.birth_date).toLocaleDateString(
                "en-US"
              ),
              profilePicture: `data:image/png;base64,${applicant.formal_picture}`,
            },
          }))
        );
        console.log("Job Listing ID:", joblistingId);

        setApplicants(fetchedJobApplicants);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        alert(errorMessage);
      });
  }, []);

  const toggleFilterMenu = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    setIsFilterOpen(false);
  };

  const deleteApplicant = (id) => {
    console.log(`Applicant with id ${id} deleted`);
  };

  const openResumeModal = (resume) => {
    setSelectedResume(resume);
    setIsResumeModalOpen(true);
  };

  const closeResumeModal = () => {
    setIsResumeModalOpen(false);
    setSelectedResume(null);
  };

  const openProfileModal = (profile) => {
    console.log("Opening profile modal for:", profile); // Debugging line
    setSelectedProfile(profile);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedProfile(null);
  };

  // Sort applicants based on the selected sort option
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
      <aside
        className={`bg-custom-blue w-full md:w-[300px] lg:w-[250px] p-4 flex flex-col items-center md:relative fixed top-0 left-0 min-h-screen h-full transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-50 md:z-auto`}
      >
        <button
          className="text-white md:hidden self-end size-10"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedApplicants.length > 0 ? (
            sortedApplicants.map((applicant) => (
              <div
                key={applicant.id}
                className="p-6 bg-blue-500 rounded-lg shadow-md transition-transform duration-200 ease-in-out hover:scale-105 hover:bg-blue-600"
              >
                <div className="flex flex-col text-left">
                  <p className="font-semibold text-lg text-white">Full Name:</p>
                  <p className="mb-2 text-lg text-black bg-gray-200 p-2 rounded">
                    {applicant.fullName}
                  </p>

                  <p className="font-semibold text-lg text-white">Email:</p>
                  <p className="mb-2 text-lg text-black bg-gray-200 p-2 rounded">
                    {applicant.email}
                  </p>

                  <p className="font-semibold text-lg text-white">
                    Job Applied For:
                  </p>
                  <p className="mb-2 text-lg text-black bg-gray-200 p-2 rounded">
                    {applicant.jobAppliedFor}
                  </p>

                  <div className="flex space-x-2">
                    <button
                      className="mt-4 py-2 px-4 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-700 hover:text-white transition duration-200"
                      onClick={() => openResumeModal(applicant.resume)}
                    >
                      View Resume
                    </button>
                    <button
                      className="mt-4 py-2 px-4 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-700 hover:text-white transition duration-200"
                      onClick={() => openProfileModal(applicant.profile)}
                    >
                      View Profile
                    </button>
                  </div>
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
              {/* Close Button */}
              <button
                onClick={closeProfileModal}
                className="absolute top-2 right-2 text-2xl font-bold text-gray-700 hover:text-gray-900 transition duration-200"
              >
                &times;
              </button>

              {/* Modal Title */}
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                Applicant's Profile
              </h3>

              {/* Profile Picture and Info */}
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

              {/* Profile Details with Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {/* Name */}
                <div>
                  <p className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="material-symbols-outlined text-2xl mr-2">
                      person
                    </span>
                    Name:
                  </p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile?.fullName}
                  </p>
                </div>

                {/* Disability */}
                <div>
                  <p className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="material-symbols-outlined text-2xl mr-2">
                      accessibility
                    </span>
                    Disability:
                  </p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile?.disability || "Not specified"}
                  </p>
                </div>

                {/* City */}
                <div>
                  <p className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="material-symbols-outlined text-2xl mr-2">
                      location_city
                    </span>
                    City:
                  </p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile?.location || "Not specified"}
                  </p>
                </div>

                {/* Address */}
                <div>
                  <p className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="material-symbols-outlined text-2xl mr-2">
                      home
                    </span>
                    Address:
                  </p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile?.address || "Not specified"}
                  </p>
                </div>

                {/* Contact Number */}
                <div>
                  <p className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="material-symbols-outlined text-2xl mr-2">
                      phone
                    </span>
                    Contact Number:
                  </p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile?.contactNumber || "Not specified"}
                  </p>
                </div>

                {/* Gender */}
                <div>
                  <p className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="material-symbols-outlined text-2xl mr-2">
                      person
                    </span>
                    Gender:
                  </p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile?.gender || "Not specified"}
                  </p>
                </div>

                {/* Birthdate */}
                <div>
                  <p className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="material-symbols-outlined text-2xl mr-2">
                      calendar_today
                    </span>
                    Birthdate:
                  </p>
                  <p className="text-gray-600 bg-gray-200 p-4 rounded-lg">
                    {selectedProfile?.birthdate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewApplicants;
