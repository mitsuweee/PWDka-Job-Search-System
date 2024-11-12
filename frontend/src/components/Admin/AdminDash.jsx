import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardCounts, setDashboardCounts] = useState({
    verified_users: 0,
    pending_users: 0,
    verified_companies: 0,
    pending_companies: 0,
    total_job_listings: 0,
    total_job_application: 0,
  });
  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // State for logout confirmation modal
  const navigate = useNavigate();

  const checkAdminStatus = async () => {
    const adminId = localStorage.getItem("Id");
    try {
      const response = await axios.get(`/admin/view/verify/status/${adminId}`);
      if (
        response.data.successful &&
        response.data.message === "User is Deactivated"
      ) {
        toast.error("Your admin account has been deactivated. Logging out.", {
          duration: 5000, // Display the toast for 5 seconds
        });

        // Wait for the toast to finish before logging out
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 3000); // Wait for 3 seconds before redirecting
      }
    } catch {
      toast.error("Failed to check admin status.");
    }
  };

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

  // Fetch all counts from the backend when the component mounts
  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        const response = await axios.get("/admin/view/count");
        if (response.data.successful) {
          setDashboardCounts(response.data.data); // Set the counts from API
        } else {
          console.error(
            "Error fetching dashboard counts:",
            response.data.message
          );
        }
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      }
    };
    const interval = setInterval(() => {
      checkAdminStatus(); // Calls the function that verifies admin status
    }, 5000);

    fetchDashboardCounts();

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    setIsLogoutModalOpen(true); // Open logout confirmation modal
  };

  const confirmLogout = () => {
    localStorage.removeItem("Id");
    localStorage.removeItem("Role");
    localStorage.removeItem("Token");
    toast.success("Logged out successfully", { position: "top-center" });
    navigate("/login");
    setIsLogoutModalOpen(false); // Close the modal
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false); // Close logout confirmation modal
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Sidebar */}
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
        <hr className="border-gray-400 w-full mb-4" />

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
        <hr className="border-gray-400 w-full mb-4" />

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
        <hr className="border-gray-400 w-full mb-4" />

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
        <hr className="border-gray-400 w-full mb-4" />

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

      {/* Mobile Toggle Button */}
      <button
        className={`md:hidden bg-custom-blue text-white p-4 fixed top-4 left-4 z-50 rounded-xl mt-11 transition-transform ${
          isSidebarOpen ? "hidden" : ""
        }`}
        onClick={() => setIsSidebarOpen(true)}
      >
        &#9776;
      </button>

      {/* Main Content */}
      <main className="flex-grow p-8 w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 tracking-wide">
            Admin Dashboard
          </h1>
          <div className="flex items-center">
            <button
              onClick={() => navigate("/adminprofile")}
              className="flex items-center focus:outline-none hover:opacity-80 transition-opacity duration-200"
            >
              <span className="material-symbols-outlined text-4xl text-gray-700 hover:text-blue-900">
                account_circle
              </span>
            </button>
          </div>
        </div>

        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
          {[
            {
              title: "Total Verified Applicants",
              count: dashboardCounts.verified_users,
              icon: "verified",
              route: "/admin/dashboard/ViewUsers",
            },
            {
              title: "Total Pending Applicants",
              count: dashboardCounts.pending_users,
              icon: "hourglass_empty",
              route: "/admin/dashboard/VerifyUsers",
            },
            {
              title: "Total Verified Companies",
              count: dashboardCounts.verified_companies,
              icon: "business",
              route: "/admin/dashboard/ViewCompany",
            },
            {
              title: "Total Pending Companies",
              count: dashboardCounts.pending_companies,
              icon: "pending_actions",
              route: "/admin/dashboard/VerifyComps",
            },
            {
              title: "Total Job Listings",
              count: dashboardCounts.total_job_listings,
              icon: "work_outline",
              route: "/admin/dashboard/ViewJobs",
            },
            {
              title: "Total Job Applications",
              count: dashboardCounts.total_job_application,
              icon: "description",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300 ease-in-out relative border-t-2 border-blue-600 cursor-pointer"
              onClick={() => navigate(stat.route)} // Direct navigation on click
            >
              <span className="material-symbols-outlined absolute top-3 right-3 text-3xl text-blue-600">
                {stat.icon}
              </span>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                {stat.title}
              </h2>
              <p className="text-3xl text-blue-900 font-bold">{stat.count}</p>
            </div>
          ))}
        </div>
      </main>

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
    </>
  );
};

export default AdminDashboard;
