import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { io } from "socket.io-client";

const AdminVerifyComp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const companiesPerPage = 10;
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    // Initialize socket connection
    const socket = io("https://pwdka.com.ph/", {
      transports: ["websocket"], // Use WebSocket only for improved real-time performance
    });

    socket.on("connect", () => {
      console.log("Connected to socket server with ID:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Listen for companyVerified event
    socket.on("companyVerified", (data) => {
      setCompanies((prevCompanies) =>
        prevCompanies.filter((company) => company.id !== data.id)
      );
      toast.success(`A Company Has Been Verified`);
      window.location.reload();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Initialize socket connection
    const socket = io("https://pwdka.com.ph/", {
      transports: ["websocket"], // Use WebSocket only for improved real-time performance
    });

    socket.on("connect", () => {
      console.log("Connected to socket server with ID:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Listen for the company_declined event
    socket.on("company_declined", (data) => {
      // Remove the declined company from the state
      setCompanies((prevCompanies) =>
        prevCompanies.filter((company) => company.id !== data.id)
      );

      // Display a toast notification with the reason for declining
      toast.error(`A Company Has Been Declined`);
      window.location.reload();
    });

    // Clean up socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const navigate = useNavigate();

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

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

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

        // Wait for the toast to finish before logging out
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 5000); // Wait for 3 seconds before redirecting
      }
    } catch {
      console.error("Failed to check admin status.");
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

  useEffect(() => {
    const config = {
      method: "get",
      url: "/verification/view/companies",
      headers: {
        "Content-Type": "application/json",
      },
    };

    setLoading(true);
    axios(config)
      .then(function (response) {
        const companyDataArray = response.data.data;
        setCompanies(companyDataArray);
        setLoading(false);
        toast.success("Companies loaded successfully");
      })
      .catch(function (error) {
        setLoading(false);
        toast.error("Failed to load companies");
        console.log(error);
      });
    const interval = setInterval(() => {
      checkAdminStatus(); // Calls the function that verifies admin status
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatCompanyData = (companyData) => {
    return {
      id: companyData.id,
      companyName: companyData.name,
      address: companyData.address,
      city: companyData.city,
      companyDescription: companyData.description,
      contactNumber: companyData.contact_number,
      companyEmail: companyData.email,
      companyLogo: `data:image/png;base64,${companyData.profile_picture}`,
    };
  };

  const handleApprove = (companyId) => {
    if (actionInProgress) return;
    setActionInProgress(true);
    const config = {
      method: "put",
      url: `/verification/company/${companyId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    setLoading(true);
    axios(config)
      .then(function () {
        toast.success("Company approved successfully");
        setCompanies((prevCompanies) =>
          prevCompanies.filter((company) => company.id !== companyId)
        );
        setSelectedCompany(null);
        setShowModal(false);
        setLoading(false);
        // setActionInProgress(false);
      })
      .catch(function (error) {
        setLoading(false);
        setActionInProgress(false);
        toast.error("An error occurred while approving the company");
        console.log(error);
      });
  };

  const openDeclineModal = (companyId) => {
    setSelectedCompany(companyId);
    setShowDeclineModal(true);
    setShowModal(false);
  };

  const confirmDecline = () => {
    if (actionInProgress) return;
    setActionInProgress(true);
    const config = {
      method: "delete",
      url: `/verification/company/${selectedCompany}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: { reason: declineReason },
    };

    setLoading(true);
    axios(config)
      .then(function () {
        toast.success("Company declined successfully");
        setCompanies((prevCompanies) =>
          prevCompanies.filter((company) => company.id !== selectedCompany)
        );
        setSelectedCompany(null);
        setShowModal(false);
        setShowDeclineModal(false);
        setLoading(false);
        setActionInProgress(false);
        setDeclineReason("");
      })
      .catch(function (error) {
        setLoading(false);
        setActionInProgress(false);
        toast.error("An error occurred while declining the company");
        console.log(error);
      });
  };

  const handleView = (company) => {
    setSelectedCompany(formatCompanyData(company));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCompany(null);
  };

  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = companies.slice(
    indexOfFirstCompany,
    indexOfLastCompany
  );
  const totalPages = Math.ceil(companies.length / companiesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      <Toaster position="top-center" reverseOrder={false} />
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
        </div>
      )}

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

      <main className="flex-grow p-8 bg-custom-bg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-700">Verify Companies</h1>
        </div>

        <div className="mt-4">
          {currentCompanies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-lg overflow-hidden">
                <thead>
                  <tr className="bg-blue-600 text-white text-left text-xs md:text-sm uppercase tracking-wider">
                    <th className="py-4 px-6 font-semibold">Company Name</th>
                    <th className="py-4 px-6 font-semibold">City</th>
                    <th className="py-4 px-6 font-semibold text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentCompanies.map((company) => (
                    <tr
                      key={company.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition duration-300"
                    >
                      <td className="py-4 px-6 text-gray-800 text-sm md:text-base break-words">
                        {company.name
                          ? company.name
                              .split(" ")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              )
                              .join(" ")
                          : ""}
                      </td>
                      <td className="py-4 px-6 text-gray-800 text-sm md:text-base break-words">
                        {company.city
                          ? company.city
                              .split(" ")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              )
                              .join(" ")
                          : ""}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            disabled={actionInProgress}
                            className={`bg-blue-500 text-white py-1 px-3 rounded-full shadow-sm hover:bg-blue-700 transition duration-200 text-xs md:text-sm font-medium ${
                              actionInProgress
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() => handleView(company)}
                          >
                            View
                          </button>
                          <button
                            disabled={actionInProgress}
                            className={`bg-green-500 text-white py-1 px-3 rounded-full shadow-sm hover:bg-green-700 transition duration-200 text-xs md:text-sm font-medium ${
                              actionInProgress
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() => handleApprove(company.id)}
                          >
                            Approve
                          </button>
                          <button
                            disabled={actionInProgress}
                            className={`bg-red-500 text-white py-1 px-3 rounded-full shadow-sm hover:bg-red-700 transition duration-200 text-xs md:text-sm font-medium ${
                              actionInProgress
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() => openDeclineModal(company.id)}
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No companies to verify yet.
            </p>
          )}

          {selectedCompany && showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg transition-transform transform scale-100 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                  <h3 className="text-2xl font-bold text-custom-blue flex items-center">
                    <span className="material-symbols-outlined mr-2">
                      business
                    </span>{" "}
                    Company Details
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
                <div className="flex justify-center mb-6">
                  <img
                    src={selectedCompany.companyLogo}
                    alt={selectedCompany.companyName}
                    className="w-32 h-32 rounded-full border-4 border-custom-blue hover:shadow-lg transition-shadow duration-300 object-cover"
                  />
                </div>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-black font-semibold">Company Name:</p>
                      <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                        {selectedCompany.companyName}
                      </p>
                    </div>
                    <div>
                      <p className="text-black font-semibold">City:</p>
                      <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                        {selectedCompany.city
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
                    <p className="text-black font-semibold">
                      Company Description:
                    </p>
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                      {selectedCompany.companyDescription}
                    </p>
                  </div>
                  <div>
                    <p className="text-black font-semibold">Address:</p>
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                      {selectedCompany.address
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                        )
                        .join(" ")}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-black font-semibold">
                        Contact Number:
                      </p>
                      <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                        {selectedCompany.contactNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-black font-semibold">Email:</p>
                      <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                        {selectedCompany.companyEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                  {/* <button
                    onClick={() => handleApprove(selectedCompany.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-green-600 transition duration-200 font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openDeclineModal(selectedCompany.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-red-600 transition duration-200 font-medium"
                  >
                    Decline
                  </button> */}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <ol className="flex justify-center gap-1 text-xs font-medium">
            {/* Previous Button */}
            <li>
              <button
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                className="inline-flex w-8 h-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900"
                disabled={currentPage === 1}
              >
                Prev
              </button>
            </li>

            {/* Page Numbers */}
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

            {/* Next Button */}
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

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Decline Reason
            </h2>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter reason for decline"
              className="w-full h-32 p-2 border border-gray-300 rounded-lg resize-none"
            ></textarea>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDecline}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerifyComp;
