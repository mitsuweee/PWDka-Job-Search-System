import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ApplicationHistory = () => {
  const [applicationHistory, setApplicationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [tokenValid, setTokenValid] = useState(false); // New state for token validation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const openJobModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeJobModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const checkUserStatus = async () => {
    try {
      const userId = localStorage.getItem("Id");
      const response = await axios.get(`/user/view/verify/status/${userId}`);
      if (
        response.data.successful &&
        response.data.message === "User is Deactivated"
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
      console.error("Failed to check user status.");
    }
  };

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
    const fetchApplicationHistory = async () => {
      const userId = localStorage.getItem("Id");
      try {
        setLoading(true);
        const response = await axios.get(
          `/jobapplication/applications/user/${userId}`
        );
        if (response.data.successful) {
          setApplicationHistory(response.data.data);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error("Failed to load application history");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationHistory();
    const interval = setInterval(() => {
      checkUserStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="p-6 min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url('./imgs/pft.png')`, // Replace with your image path
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <Toaster position="top-center" reverseOrder={false} />

      {/* Back Button */}
      <button
        className="mb-6 flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 hover:shadow-lg transform hover:-translate-y-1 transition duration-200 ease-in-out"
        onClick={() => navigate("/joblist")}
      >
        <span className="text-lg">←</span>
        <span>Back to Job Listings</span>
      </button>

      <div className="bg-white bg-opacity-90 p-6 rounded-xl shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center border-b-4 border-blue-500 pb-4">
          Application History
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          </div>
        ) : applicationHistory.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <table className="table-auto w-full bg-white mt-4 rounded-xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-600 text-white text-left text-xs sm:text-sm uppercase tracking-wider">
                  <th className="py-4 px-4 sm:px-6 font-semibold">Position</th>
                  <th className="py-4 px-4 sm:px-6 font-semibold">Company</th>
                  <th className="py-4 px-4 sm:px-6 font-semibold hidden sm:table-cell">
                    Status
                  </th>
                  <th className="py-4 px-4 sm:px-6 font-semibold hidden sm:table-cell">
                    Date Applied
                  </th>
                </tr>
              </thead>
              <tbody>
                {applicationHistory.map((application, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 transition duration-300 cursor-pointer hover:bg-gray-100 active:bg-gray-200"
                    onClick={() => openJobModal(application)} // Pass the application as the selected job
                  >
                    {/* Position */}
                    <td className="py-4 px-4 sm:px-6 text-gray-800 text-xs sm:text-sm break-words hover:scale-105 transform transition-all duration-200 ease-in-out">
                        {application?.position_name
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          )
                          .join(" ")}
                      {/* Mobile Additional Info */}
                      <div className="sm:hidden mt-2 text-gray-600 text-xs">
                        <div>
                          <strong>Status:</strong>{" "}
                          <span
                            className={`inline-block rounded-full px-2 py-1 ${
                              application.status === "Approved"
                                ? "bg-green-100 text-green-600"
                                : application.status === "Pending"
                                ? "bg-yellow-100 text-yellow-600"
                                : application.status === "REJECTED"
                                ? "bg-red-100 text-red-600"
                                : application.status === "Under Review"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {application.status}
                          </span>
                        </div>
                        <div>
                          <strong>Date:</strong>{" "}
                          {new Date(application.date_created).toLocaleDateString()}
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-4 px-4 sm:px-6 text-gray-800 text-xs sm:text-sm break-words hover:scale-105 transform transition-all duration-200 ease-in-out">
                      {application.company_name}
                    </td>

                    {/* Status (Desktop) */}
                    <td className="py-4 px-4 sm:px-6 text-xs sm:text-sm hidden sm:table-cell hover:scale-105 transform transition-all duration-200 ease-in-out">
                      <span
                        className={`inline-block rounded-full px-3 py-1 ${
                          application.status === "Approved"
                            ? "bg-green-100 text-green-600"
                            : application.status === "Pending"
                            ? "bg-yellow-100 text-yellow-600"
                            : application.status === "REJECTED"
                            ? "bg-red-100 text-red-600"
                            : application.status === "Under Review"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {application.status}
                      </span>
                    </td>

                    {/* Date Applied (Desktop) */}
                    <td className="py-4 px-4 sm:px-6 text-gray-800 text-xs sm:text-sm hidden sm:table-cell hover:scale-105 transform transition-all duration-200 ease-in-out">
                      {new Date(application.date_created).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>


            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center mt-20">
            <p className="text-2xl text-gray-500">
              No application history found.
            </p>
          </div>
        )}

        {isModalOpen && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-2xl font-semibold">
                  {selectedJob?.position_name
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </h2>
                <button
                  onClick={closeJobModal}
                  className="text-gray-500 hover:text-gray-800 transition duration-200"
                >
                  ✕
                </button>
              </div>
              {/* Scrollable Content */}
              <div
                className="mt-4 space-y-4 overflow-y-auto"
                style={{ maxHeight: "70vh" }} // Adjust height as needed
              >
                <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      business
                    </span>{" "}
                    Company Name:
                  </p>
                  <p className="text-gray-600 mt-2">
                    {selectedJob.company_name}
                  </p>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      radar
                    </span>{" "}
                    Job Level:
                  </p>
                  <p className="text-gray-600 mt-2">{selectedJob.level}</p>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      description
                    </span>{" "}
                    Job Description:
                  </p>
                  {selectedJob?.description
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </div>

                <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      build
                    </span>{" "}
                    Qualifications:
                  </p>
                  <ul className="text-gray-600 mt-2 text-sm leading-relaxed list-disc pl-4">
                    {selectedJob.qualification &&
                      selectedJob.qualification
                        .split("\n")
                        .map((part, index) => (
                          <li key={index}>
                            {part.trim().charAt(0).toUpperCase() +
                              part.trim().slice(1).toLowerCase()}
                          </li>
                        ))}
                  </ul>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      check_circle
                    </span>{" "}
                    Requirements:
                  </p>
                  <ul className="text-gray-600 mt-2 text-sm leading-relaxed list-disc pl-4">
                    {selectedJob.requirement &&
                      selectedJob.requirement
                        .split("\n")
                        .map((part, index) => (
                          <li key={index}>
                            {part.trim().charAt(0).toUpperCase() +
                              part.trim().slice(1).toLowerCase()}
                          </li>
                        ))}
                  </ul>
                </div>

                <div className="bg-gray-100 p-3 rounded-lg shadow-inner">
                  <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center text-left space-y-1 sm:space-y-0">
                    <div className="flex flex-row w-full sm:w-auto justify-start items-center">
                      <span className="material-symbols-outlined text-black text-base sm:text-sm mr-2">
                        payments
                      </span>
                      {selectedJob.minimum_salary ===
                      selectedJob.maximum_salary ? (
                        <div className="flex flex-col items-start">
                          <span className="text-black font-semibold text-sm sm:text-base">
                            Salary
                          </span>
                          <span className="text-gray-600 text-xs sm:text-sm">
                            ₱ {selectedJob.minimum_salary.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col items-start">
                            <span className="text-black font-semibold text-sm sm:text-base">
                              Min Salary
                            </span>
                            <span className="text-gray-600 text-xs sm:text-sm">
                              ₱ {selectedJob.minimum_salary.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-black font-semibold text-sm mx-2">
                            -
                          </span>
                          <div className="flex flex-col items-start">
                            <span className="text-black font-semibold text-sm sm:text-base">
                              Max Salary
                            </span>
                            <span className="text-gray-600 text-xs sm:text-sm">
                              ₱ {selectedJob.maximum_salary.toLocaleString()}
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
                      location_on
                    </span>{" "}
                    Address:
                  </p>
                  <p className="text-gray-600 mt-2">
                    {[selectedJob.company_address, selectedJob.company_city]
                      .map((item) =>
                        item
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")
                      )
                      .join(", ")}
                  </p>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      phone
                    </span>{" "}
                    Contact:
                  </p>
                  <p className="text-gray-600 mt-2">
                    {selectedJob.company_contact_number}
                  </p>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                  <p className="text-black font-semibold flex items-center">
                    <span className="material-symbols-outlined mr-1">
                      email
                    </span>{" "}
                    Email:
                  </p>
                  <p className="text-gray-600 mt-2">
                    {selectedJob.company_email}
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={closeJobModal}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationHistory;
