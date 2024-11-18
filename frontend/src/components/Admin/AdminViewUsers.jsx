import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { io } from "socket.io-client"; // Import Socket.io client

const AdminViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("Newest");
  const usersPerPage = 10;
  const navigate = useNavigate();
  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const checkAdminStatus = async () => {
    try {
      const adminId = localStorage.getItem("Id");
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

    // Set up an interval to check company status every 5 seconds
    const interval = setInterval(() => {
      checkAdminStatus();
    }, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initialize Socket.io connection
    const socket = io("https://pwdka.com.ph/", {
      transports: ["websocket"], // Use WebSocket only for improved real-time performance
    });
    socket.on("connect", () => {
      console.log("Connected to socket server with ID:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Listen for the userDeactivated event
    socket.on("userDeactivated", (data) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== data.id));
      toast.success(`A User Has Been Deactivated`);
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
      url: "/admin/view/users",
      headers: {
        "Content-Type": "application/json",
      },
    };

    setLoading(true);
    axios(config)
      .then((response) => {
        const userDataArray = response.data.data;
        setUsers(userDataArray);
        setLoading(false);
        toast.success("Users loaded successfully");
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Failed to load users");
        console.error(error);
      });
  }, []);

  const handleViewUser = (userId) => {
    const config = {
      method: "get",
      url: `/user/view/${userId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    setLoading(true);
    axios(config)
      .then((response) => {
        const userData = response.data.data;
        setUser(formatUserData(userData));
        setIsModalOpen(true);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Failed to load user details");
        console.error(error);
      });
  };

  const handleDeactivateUser = (userId) => {
    axios
      .put(`/admin/update/deactivate/user/${userId}`)
      .then(() => {
        toast.success("User deactivated successfully!");
        window.location.reload(); // Reloads the page immediately after showing the toast
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "Failed to deactivate user";
        toast.error(errorMessage);
      });
  };

  const formatUserData = (userData) => ({
    id: userData.id,
    firstName: userData.first_name,
    middleInitial: userData.middle_initial || "", // default to empty if not present
    lastName: userData.last_name,
    disability: userData.type,
    address: userData.address,
    city: userData.city,
    birthdate: new Date(userData.birth_date).toLocaleDateString("en-US"),
    contactNumber: userData.contact_number,
    email: userData.email,
    profilePicture: `data:image/png;base64,${userData.formal_picture}`,
    pictureWithId: `data:image/png;base64,${userData.picture_with_id}`,
    pictureOfPwdId: `data:image/png;base64,${userData.picture_of_pwd_id}`,
  });

  const handleLogout = () => setIsLogoutModalOpen(true);

  const confirmLogout = () => {
    localStorage.removeItem("Id");
    localStorage.removeItem("Role");
    localStorage.removeItem("Token");
    toast.success("Logged out successfully", { position: "top-center" });
    navigate("/login");
    setIsLogoutModalOpen(false);
  };

  const closeLogoutModal = () => setIsLogoutModalOpen(false);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const [statusFilter, setStatusFilter] = useState("Verified"); // Default to showing active users
  const filteredUsers = users
    .filter((user) => {
      // Apply the status filter
      if (statusFilter === "Verified" && user.status !== "VERIFIED")
        return false;
      if (statusFilter === "Deactivate" && user.status !== "DEACTIVATE")
        return false;

      // Combine fields for general search
      const combinedFields =
        `${user.first_name} ${user.last_name} ${user.type}`.toLowerCase();
      return combinedFields.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (sortOrder === "A-Z") return a.first_name.localeCompare(b.first_name);
      if (sortOrder === "Z-A") return b.first_name.localeCompare(a.first_name);
      if (sortOrder === "Newest")
        return new Date(b.date_created) - new Date(a.date_created);
      if (sortOrder === "Oldest")
        return new Date(a.date_created) - new Date(b.date_created);
      return 0;
    });

  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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

      <main className="flex-grow p-8">
        <h1 className="text-xl font-bold text-gray-700">
          View All Verified Users
        </h1>
        {/* Search and Filter Bar */}
        <div className="flex items-center justify-center mt-6 mb-4 p-4 bg-white rounded-lg shadow-md space-x-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-1/2 px-4 py-2 border border-gray-300 bg-gray-100 text-black rounded-lg focus:outline-none focus:border-blue-500 shadow-inner"
            style={{ boxShadow: "inset 0px 4px 8px rgba(0, 0, 0, 0.1)" }}
          />

          {/* Sort Dropdown */}
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

          {/* Deactivated Users Button */}
          <button
            onClick={() =>
              setStatusFilter(
                statusFilter === "Deactivate" ? "Verified" : "Deactivate"
              )
            }
            className={`px-4 py-2 rounded-lg font-semibold transition duration-200 shadow ${
              statusFilter === "Deactivate"
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {statusFilter === "Deactivate"
              ? "View Verified Users"
              : "View Deactivated Users"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white mt-4 rounded-lg shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-600 text-white text-left text-xs md:text-sm uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">ID</th>
                <th className="py-4 px-6 font-semibold">User</th>
                <th className="py-4 px-6 font-semibold">Disability</th>
                <th className="py-4 px-6 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition duration-300"
                >
                  <td className="py-3 px-6 text-gray-800 text-xs md:text-sm">
                    {user.id}
                  </td>
                  <td className="py-3 px-6 text-gray-800 text-xs md:text-sm break-words">
                    {user.first_name && user.last_name
                      ? `${
                          user.first_name.charAt(0).toUpperCase() +
                          user.first_name.slice(1)
                        } ${
                          user.middle_initial
                            ? user.middle_initial.charAt(0).toUpperCase() + ". "
                            : ""
                        }${
                          user.last_name.charAt(0).toUpperCase() +
                          user.last_name.slice(1)
                        }`
                      : ""}
                  </td>
                  <td className="py-3 px-6 text-gray-800 text-xs md:text-sm">
                    {user.type}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex justify-center space-x-1 md:space-x-2">
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="bg-blue-500 text-white text-xs md:text-sm px-2 md:px-3 py-1 rounded-full shadow-sm hover:bg-blue-700 transition duration-200 font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() =>
                          user.status !== "DEACTIVATE" &&
                          handleDeactivateUser(user.id)
                        } // Prevent click if deactivated
                        className={`${
                          user.status === "DEACTIVATE"
                            ? "bg-gray-400 text-white cursor-not-allowed" // Disabled style
                            : "bg-red-500 text-white hover:bg-red-600" // Active style
                        } text-xs md:text-sm px-3 py-1 rounded-full shadow-sm transition duration-200 font-medium`}
                        disabled={user.status === "DEACTIVATE"} // Disable button if deactivated
                      >
                        {user.status === "DEACTIVATE"
                          ? "Deactivated"
                          : "Deactivate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            {Array.from(
              { length: Math.ceil(filteredUsers.length / usersPerPage) },
              (_, index) => {
                const pageNumber = index + 1;

                // Adjust the range to show current, previous, and next pages
                const isWithinRange =
                  (currentPage <= 2 && pageNumber <= 3) ||
                  (currentPage >=
                    Math.ceil(filteredUsers.length / usersPerPage) - 1 &&
                    pageNumber >=
                      Math.ceil(filteredUsers.length / usersPerPage) - 2) ||
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
              }
            )}

            {/* Next Button */}
            <li>
              <button
                onClick={() =>
                  currentPage <
                    Math.ceil(filteredUsers.length / usersPerPage) &&
                  paginate(currentPage + 1)
                }
                className="inline-flex w-8 h-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900"
                disabled={
                  currentPage === Math.ceil(filteredUsers.length / usersPerPage)
                }
              >
                Next
              </button>
            </li>
          </ol>
        </div>
      </main>

      {isModalOpen && user && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg transition-transform transform scale-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-2xl font-bold text-custom-blue flex items-center">
                <span className="material-symbols-outlined mr-2">person</span>{" "}
                User Details
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition duration-200"
              >
                <span className="material-symbols-outlined text-2xl">
                  close
                </span>
              </button>
            </div>
            <div className="flex justify-center mb-6">
              <img
                src={user.profilePicture}
                alt={user.fullName}
                className="w-32 h-32 rounded-full border-4 border-custom-blue hover:shadow-lg transition-shadow duration-300 object-cover"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">badge</span>{" "}
                  Full Name:
                </p>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                  {user.firstName && user.lastName
                    ? `${
                        user.firstName.charAt(0).toUpperCase() +
                        user.firstName.slice(1)
                      } ${
                        user.middleInitial
                          ? user.middleInitial.charAt(0).toUpperCase() + ". "
                          : ""
                      }${
                        user.lastName.charAt(0).toUpperCase() +
                        user.lastName.slice(1)
                      }`
                    : ""}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    credit_card
                  </span>{" "}
                  PWD ID:
                </p>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                  {user.id}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    accessible
                  </span>{" "}
                  Disability:
                </p>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                  {user.disability}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">home</span>{" "}
                  Address:
                </p>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                  {user.address
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
                    location_city
                  </span>{" "}
                  City:
                </p>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                  {user.city
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
                  <span className="material-symbols-outlined mr-1">cake</span>{" "}
                  Birthdate:
                </p>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                  {user.birthdate}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">phone</span>{" "}
                  Contact Number:
                </p>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                  {user.contactNumber}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">email</span>{" "}
                  Email:
                </p>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default AdminViewUsers;
