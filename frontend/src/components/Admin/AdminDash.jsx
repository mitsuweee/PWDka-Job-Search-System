import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import toast, { Toaster } from "react-hot-toast";

// Register the required chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // State for logout confirmation modal
  const navigate = useNavigate();

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

    fetchDashboardCounts();
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

  // Data for the bar chart
  const barChartData = {
    labels: [
      "Verified Users",
      "Pending Users",
      "Verified Companies",
      "Pending Companies",
      "Job Listings",
      "Job Applications",
    ],
    datasets: [
      {
        label: "Counts",
        data: [
          dashboardCounts.verified_users,
          dashboardCounts.pending_users,
          dashboardCounts.verified_companies,
          dashboardCounts.pending_companies,
          dashboardCounts.total_job_listings,
          dashboardCounts.total_job_application,
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 1)", // Solid teal
          "rgba(153, 102, 255, 1)", // Solid purple
          "rgba(255, 159, 64, 1)", // Solid orange
          "rgba(54, 162, 235, 1)", // Solid blue
          "rgba(255, 206, 86, 1)", // Solid yellow
          "rgba(75, 192, 192, 1)", // Solid teal
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Dashboard Statistics",
      },
    },
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Sidebar */}
      <aside
        className={`bg-custom-blue w-full md:w-[300px] lg:w-[250px] p-4 flex flex-col items-center md:relative fixed top-0 left-0 min-h-screen h-full transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-50 md:z-auto`}
      >
        <button
          className="text-white md:hidden self-end text-2xl"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>

        <nav className="w-full flex flex-col items-center space-y-4">
          <a
            href="/admin/dashboard"
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center justify-center"
            style={{
              boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
            }}
          >
            <span className="material-symbols-outlined text-xl mr-2">home</span>
            <span>Home</span>
          </a>

          <a
            href="/admin/dashboard/VerifyUsers"
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">draw</span>
            <span>Verify Applicants</span>
          </a>

          <a
            href="/admin/dashboard/VerifyComps"
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">
              apartment
            </span>
            <span>Verify Companies</span>
          </a>

          <a
            href="/admin/dashboard/ViewUsers"
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">
              group
            </span>
            <span>View All Applicants</span>
          </a>

          <a
            href="/admin/dashboard/ViewCompany"
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">
              source_environment
            </span>
            <span>View All Companies</span>
          </a>

          <a
            href="/admin/dashboard/ViewJobs"
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">work</span>
            <span>View All Job Listings</span>
          </a>

          <a
            href="/admin/dashboard/AdminSignup"
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">draw</span>
            <span>Sign Up</span>
          </a>

          <button
            className="bg-red-600 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
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
      <main className="flex-grow p-8 bg-custom-bg">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-900">Admin Dashboard</h1>
          <div className="flex items-center">
            <button
              onClick={() => navigate("/adminprofile")}
              className="flex items-center focus:outline-none"
            >
              <span className="material-symbols-outlined text-4xl text-gray-700">
                account_circle
              </span>
            </button>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="mt-8">
          <Bar data={barChartData} options={barChartOptions} />
        </div>

        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl hover:translate-y-1 transition-all duration-200 ease-in-out">
            <h2 className="text-xl font-bold text-gray-800">
              Total Verified Applicants
            </h2>
            <p className="text-3xl text-blue-900 font-semibold">
              {dashboardCounts.verified_users}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl hover:translate-y-1 transition-all duration-200 ease-in-out">
            <h2 className="text-xl font-bold text-gray-800">
              Total Pending Applicants
            </h2>
            <p className="text-3xl text-blue-900 font-semibold">
              {dashboardCounts.pending_users}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl hover:translate-y-1 transition-all duration-200 ease-in-out">
            <h2 className="text-xl font-bold text-gray-800">
              Total Verified Companies
            </h2>
            <p className="text-3xl text-blue-900 font-semibold">
              {dashboardCounts.verified_companies}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl hover:translate-y-1 transition-all duration-200 ease-in-out">
            <h2 className="text-xl font-bold text-gray-800">
              Total Pending Companies
            </h2>
            <p className="text-3xl text-blue-900 font-semibold">
              {dashboardCounts.pending_companies}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl hover:translate-y-1 transition-all duration-200 ease-in-out">
            <h2 className="text-xl font-bold text-gray-800">
              Total Job Listings
            </h2>
            <p className="text-3xl text-blue-900 font-semibold">
              {dashboardCounts.total_job_listings}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl hover:translate-y-1 transition-all duration-200 ease-in-out">
            <h2 className="text-xl font-bold text-gray-800">
              Total Job Applications
            </h2>
            <p className="text-3xl text-blue-900 font-semibold">
              {dashboardCounts.total_job_application}
            </p>
          </div>
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
    </div>
  );
};

export default AdminDashboard;
