import { useState, useEffect } from "react";
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

// Register the required chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CompanyDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [companyCounts, setCompanyCounts] = useState({
    job_listings: 0,
    job_applications: 0,
    full_time_job_listings: 0,
    part_time_job_listings: 0,
  });

  const navigate = useNavigate();

  // Fetch counts from the backend using Id from localStorage
  useEffect(() => {
    const Id = localStorage.getItem("Id");
    if (Id) {
      const fetchCompanyCounts = async () => {
        try {
          const response = await axios.get(`/joblisting/view/count/${Id}`);

          if (response.data.successful) {
            setCompanyCounts(response.data.data);
          } else {
            console.error(
              "Error fetching company counts:",
              response.data.message
            );
          }
        } catch (error) {
          console.error("Error fetching company counts:", error);
        }
      };

      fetchCompanyCounts();
    } else {
      console.error("Company ID is not available in session storage");
    }
  }, []);

  // Data for the main bar chart (Job Listings and Job Applications)
  const mainBarChartData = {
    labels: ["Job Listings", "Job Applications"],
    datasets: [
      {
        label: "Counts",
        data: [companyCounts.job_listings, companyCounts.job_applications],
        backgroundColor: ["rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Data for the full-time and part-time bar chart
  const jobTypeBarChartData = {
    labels: ["Full-Time", "Part-Time"],
    datasets: [
      {
        label: "Job Listings",
        data: [
          companyCounts.full_time_job_listings,
          companyCounts.part_time_job_listings,
        ],
        backgroundColor: ["rgba(54, 162, 235, 1)", "rgba(255, 159, 64, 1)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 159, 64, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Options for the first bar chart (Job Listings and Applications)
  const jobActivityChartOptions = {
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
        text: "Company Job Activity Summary",
      },
    },
  };

  // Options for the second bar chart (Full-Time and Part-Time)
  const jobTypeChartOptions = {
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
        text: "Full-Time and Part-Time Job Distribution",
      },
    },
  };

  const confirmLogout = () => {
    localStorage.removeItem("Id");
    localStorage.removeItem("Role");
    localStorage.removeItem("Token");
    window.location.href = "/login";
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      {/* Sidebar */}
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900">
            Company Dashboard
          </h1>
        </div>

        {/* Flexbox container to hold both charts side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bar Chart for Job Listings and Job Applications */}
          <div className="bg-white rounded-lg shadow-md p-6 h-80">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Job Activities
            </h2>
            <Bar data={mainBarChartData} options={jobActivityChartOptions} />
          </div>

          {/* Bar Chart for Full-Time and Part-Time Job Listings */}
          <div className="bg-white rounded-lg shadow-md p-6 h-80">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Job Types
            </h2>
            <Bar data={jobTypeBarChartData} options={jobTypeChartOptions} />
          </div>
        </div>

        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div
            className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out relative border-t-2 border-blue-600 cursor-pointer"
            onClick={() => navigate("/dashboard/ViewJobs")}
          >
            <span className="material-symbols-outlined absolute top-3 right-3 text-2xl text-blue-600">
              work
            </span>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Job Listings
            </h2>
            <p className="text-3xl text-blue-900 font-bold mt-2">
              {companyCounts.job_listings}
            </p>
          </div>

          <div
            className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out relative border-t-2 border-blue-600 cursor-pointer"
            onClick={() => navigate("/dashboard/ViewJobs")}
          >
            <span className="material-symbols-outlined absolute top-3 right-3 text-2xl text-blue-600">
              description
            </span>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Job Applications
            </h2>
            <p className="text-3xl text-blue-900 font-bold mt-2">
              {companyCounts.job_applications}
            </p>
          </div>
        </div>

        {/* Logout Modal */}
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

              <p className="text-lg text-gray-600 mb-6">
                Are you sure you want to logout?
              </p>

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
      </main>
    </div>
  );
};

export default CompanyDashboard;
