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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteApplicantId, setDeleteApplicantId] = useState(null);

  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const filteredApplicants = applicants.filter((applicant) =>
    selectedStatus === "All" ? true : applicant.status === selectedStatus
  );

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

  const handleSortChange = (option) => {
    setSortOption(option);
    setIsFilterOpen(false);
  };

  const handleStatusChange = (applicantId, newStatus) => {
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

  const sortedApplicants = filteredApplicants.sort((a, b) => {
    if (sortOption === "Newest") {
      return new Date(b.date_created) - new Date(a.date_created); // Sort by date_created (newest first)
    } else if (sortOption === "Oldest") {
      return new Date(a.date_created) - new Date(b.date_created); // Sort by date_created (oldest first)
    } else if (sortOption === "A-Z") {
      return a.fullName.localeCompare(b.fullName); // Sort alphabetically by fullName
    } else if (sortOption === "Z-A") {
      return b.fullName.localeCompare(a.fullName); // Sort alphabetically by fullName in reverse
    }
    return 0;
  });

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
        {/* Logo Section */}
        <div className="w-full flex justify-center items-center mb-6 p-2 bg-white rounded-lg">
          <img
            src="/imgs/LOGO PWDKA.png"
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
              <option value="Reviewed">Reviewed</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
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
              {sortedApplicants.length > 0 ? (
                sortedApplicants.map((applicant) => (
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
                        <option value="Rejected">Rejected</option>
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
                          <option value="Rejected">Rejected</option>
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
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg relative w-full max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-6xl mx-4 md:mx-0">
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
                style={{ height: "50vh", maxHeight: "75vh" }}
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
      </div>
    </div>
  );
};

export default ViewApplicants;
