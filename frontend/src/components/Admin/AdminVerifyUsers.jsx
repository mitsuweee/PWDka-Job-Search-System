import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { io } from "socket.io-client";

const AdminVerifyUsers = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [showDeclineModal, setShowDeclineModal] = useState(false); // State for decline modal
  const [declineReason, setDeclineReason] = useState(""); // Store decline reason

  const navigate = useNavigate();

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

    // Listen for real-time userVerified event
    socket.on("userVerified", (data) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== data.id));
      toast.success(`A User Has Been Verified`);
    });

    // Listen for real-time userDeclined event
    socket.on("user_declined", (data) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== data.id));
      toast.error(`A User Has Been Declined`);
    });

    // Clean up socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

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

  const openImageModal = (imageSrc) => {
    setCurrentImage(imageSrc);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setCurrentImage("");
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
      url: "/verification/view/users",
      headers: {
        "Content-Type": "application/json",
      },
    };

    setLoading(true);
    axios(config)
      .then(function (response) {
        const userDataArray = response.data.data;
        setUsers(userDataArray);
        setLoading(false);
        toast.success("Users loaded successfully");
      })
      .catch(function (error) {
        setLoading(false);
        toast.error("Failed to load users");
        console.log(error);
      });

    const interval = setInterval(() => {
      checkAdminStatus(); // Calls the function that verifies admin status
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatUserData = (userData) => {
    return {
      id: userData.id,
      fullName: `${userData.first_name} ${
        userData.middle_initial ? userData.middle_initial + ". " : ""
      }${userData.last_name}`,
      pwdId: userData.id,
      disability: userData.type,
      address: userData.address,
      city: userData.city,
      birthdate: new Date(userData.birth_date).toLocaleDateString("en-US"),
      contactNumber: userData.contact_number,
      email: userData.email,
      profilePicture: `data:image/png;base64,${userData.formal_picture}`,
      pictureWithId: `data:image/png;base64,${userData.picture_with_id}`,
      pictureOfPwdId: `data:image/png;base64,${userData.picture_of_pwd_id}`,
    };
  };

  const handleApprove = (userId) => {
    const config = {
      method: "put",
      url: `/verification/user/${userId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    setLoading(true);
    axios(config)
      .then(function () {
        toast.success("User approved successfully");
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        setSelectedUser(null);
        setShowModal(false);
        setLoading(false);
      })
      .catch(function (error) {
        setLoading(false);
        toast.error("An error occurred while approving the user");
        console.log(error);
      });
  };

  const openDeclineModal = (userId) => {
    setSelectedUser(userId);
    setShowDeclineModal(true);
    setShowModal(false);
  };

  const confirmDecline = async () => {
    setLoading(true); // Show loader when "Confirm Decline" is pressed

    const config = {
      method: "delete",
      url: `/verification/user/${selectedUser}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: { reason: declineReason }, // Include decline reason
    };

    try {
      await axios(config);
      toast.success("User declined successfully");
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== selectedUser)
      );
      setSelectedUser(null);
      setShowDeclineModal(false);
      setDeclineReason(""); // Reset decline reason
    } catch (error) {
      toast.error("An error occurred while declining the user");
      console.error(error);
    } finally {
      setLoading(false); // Hide loader after the process completes
    }
  };

  const handleView = (user) => {
    setSelectedUser(formatUserData(user));
    setShowModal(true);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

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
          <h1 className="text-xl font-bold text-gray-700">Verify Applicants</h1>

          <a
            href="https://pwd.doh.gov.ph/tbl_pwd_id_verificationlist.php"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white rounded-xl py-2 px-4 shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-blue-600 transition-all duration-200 ease-in-out"
          >
            PWD ID Verification
          </a>
        </div>

        <div className="mt-4">
          {currentUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-lg overflow-hidden">
                <thead>
                  <tr className="bg-blue-600 text-white text-left text-xs md:text-sm uppercase tracking-wider">
                    <th className="py-4 px-6 font-semibold">ID</th>
                    <th className="py-4 px-6 font-semibold">User</th>
                    <th className="py-4 px-6 font-semibold">Disability</th>
                    <th className="py-4 px-6 font-semibold text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition duration-300"
                    >
                      <td className="py-4 px-6 text-gray-800 text-sm md:text-base">
                        {user.id}
                      </td>
                      <td className="py-4 px-6 text-gray-800 text-sm md:text-base">
                        {user.first_name && user.last_name
                          ? `${
                              user.first_name.charAt(0).toUpperCase() +
                              user.first_name.slice(1).toLowerCase()
                            } ${
                              user.middle_initial
                                ? user.middle_initial.toUpperCase() + ". "
                                : ""
                            }${
                              user.last_name.charAt(0).toUpperCase() +
                              user.last_name.slice(1).toLowerCase()
                            }`
                          : ""}
                      </td>
                      <td className="py-4 px-6 text-gray-800 text-sm md:text-base">
                        {user.type}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            className="bg-blue-500 text-white py-1 px-3 rounded-full shadow-sm hover:bg-blue-700 transition duration-200 text-xs md:text-sm font-medium"
                            onClick={() => handleView(user)}
                          >
                            View
                          </button>
                          <button
                            className="bg-green-500 text-white py-1 px-3 rounded-full shadow-sm hover:bg-green-700 transition duration-200 text-xs md:text-sm font-medium"
                            onClick={() => handleApprove(user.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="bg-red-500 text-white py-1 px-3 rounded-full shadow-sm hover:bg-red-700 transition duration-200 text-xs md:text-sm font-medium"
                            onClick={() => openDeclineModal(user.id)}
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
            <p className="text-center text-gray-500">No users to verify yet.</p>
          )}
          {selectedUser && showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg transition-transform transform scale-100 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                  <h3 className="text-2xl font-bold text-custom-blue flex items-center">
                    <span className="material-symbols-outlined mr-2">
                      person
                    </span>
                    User Details
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition duration-200"
                  >
                    <span className="material-symbols-outlined text-2xl">
                      close
                    </span>
                  </button>
                </div>
                <div className="flex justify-center mb-6">
                  <img
                    src={selectedUser.profilePicture}
                    alt={selectedUser.fullName}
                    className="w-32 h-32 rounded-full border-4 border-custom-blue hover:shadow-lg transition-shadow duration-300 object-cover"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-black font-semibold flex items-center">
                      <span className="material-symbols-outlined mr-2">
                        badge
                      </span>
                      Full Name:
                    </p>
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                      {selectedUser.fullName
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
                      <span className="material-symbols-outlined mr-2">
                        credit_card
                      </span>
                      PWD ID:
                    </p>
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                      {selectedUser.pwdId}
                    </p>
                  </div>
                  <div>
                    <p className="text-black font-semibold flex items-center">
                      <span className="material-symbols-outlined mr-2">
                        accessibility
                      </span>
                      Disability:
                    </p>
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                      {selectedUser.disability}
                    </p>
                  </div>
                  <div>
                    <p className="text-black font-semibold flex items-center">
                      <span className="material-symbols-outlined mr-2">
                        location_on
                      </span>
                      Address:
                    </p>
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                      {selectedUser.address
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
                      <span className="material-symbols-outlined mr-2">
                        home
                      </span>
                      City:
                    </p>
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                      {selectedUser.city
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
                      <span className="material-symbols-outlined mr-2">
                        calendar_today
                      </span>
                      Birthdate:
                    </p>
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                      {selectedUser.birthdate}
                    </p>
                  </div>
                  <div>
                    <p className="text-black font-semibold flex items-center">
                      <span className="material-symbols-outlined mr-2">
                        phone
                      </span>
                      Contact Number:
                    </p>
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                      {selectedUser.contactNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-black font-semibold flex items-center">
                      <span className="material-symbols-outlined mr-2">
                        mail
                      </span>
                      Email:
                    </p>
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <img
                      src={selectedUser.pictureWithId}
                      alt="Picture with ID"
                      className="w-full h-40 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 object-cover cursor-pointer"
                      onClick={() => openImageModal(selectedUser.pictureWithId)}
                    />
                  </div>
                  <div>
                    <img
                      src={selectedUser.pictureOfPwdId}
                      alt="Picture of PWD ID"
                      className="w-full h-40 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 object-cover cursor-pointer"
                      onClick={() =>
                        openImageModal(selectedUser.pictureOfPwdId)
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6 space-x-3">
                  {/* <button
                    onClick={() => handleApprove(selectedUser.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-green-600 transition duration-200 font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openDeclineModal(selectedUser.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-red-600 transition duration-200 font-medium"
                  >
                    Decline
                  </button> */}
                </div>
              </div>
            </div>
          )}

          {isImageModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="relative p-4 bg-white rounded-lg shadow-xl w-[90%] max-w-2xl h-[80%] flex items-center justify-center">
                <button
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                  onClick={closeImageModal}
                >
                  ✕
                </button>
                <img
                  src={currentImage}
                  alt="Full View"
                  className="w-full h-full object-contain rounded-md"
                />
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

              // Adjust range to show current, previous, and next pages
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

export default AdminVerifyUsers;
