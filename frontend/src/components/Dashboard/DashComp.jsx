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
  const [companyCounts, setCompanyCounts] = useState({
    job_listings: 0,
    job_applications: 0,
    full_time_job_listings: 0,
    part_time_job_listings: 0,
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // State for logout confirmation modal
  const navigate = useNavigate();

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

  const handleLogout = () => {
    setIsLogoutModalOpen(true); // Open logout confirmation modal
  };

  const confirmLogout = () => {
    localStorage.removeItem("Id");
    localStorage.removeItem("Role");
    localStorage.removeItem("Token");
    navigate("/login");
    setIsLogoutModalOpen(false); // Close the modal
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false); // Close logout confirmation modal
  };

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

  const jobActivityChartOptions = {
    scales: { y: { beginAtZero: true } },
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Company Job Activity Summary" },
    },
  };

  const jobTypeChartOptions = {
    scales: { y: { beginAtZero: true } },
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Full-Time and Part-Time Job Distribution",
      },
    },
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
          className="text-white md:hidden self-end size-10"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>
        <a
          href="/dashboard/postjob"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">work</span>
          <span className="flex-grow text-center">Post Job</span>
        </a>
        <a
          href="/dashboard/ViewJobs"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
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
          <h1 className="text-3xl font-bold text-blue-900">
            Company Dashboard
          </h1>
        </div>

        {/* Flexbox container to hold both charts side by side */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 space-y-8 md:space-y-0 md:space-x-8">
          {/* Bar Chart for Job Listings and Job Applications */}
          <div className="w-full md:w-1/2 h-72 md:h-80">
            <Bar data={mainBarChartData} options={jobActivityChartOptions} />
          </div>

          {/* Bar Chart for Full-Time and Part-Time Job Listings */}
          <div className="w-full md:w-1/2 h-72 md:h-80">
            <Bar data={jobTypeBarChartData} options={jobTypeChartOptions} />
          </div>
        </div>

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
      </main>
    </div>
  );
};

export default CompanyDashboard;
