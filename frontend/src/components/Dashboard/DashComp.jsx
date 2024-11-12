import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const CompanyDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const companyId = localStorage.getItem("Id");
  const [companyName, setCompanyName] = useState("");
  const [companyCounts, setCompanyCounts] = useState({
    job_listings: 0,
    job_applications: 0,
    full_time_job_listings: 0,
    part_time_job_listings: 0,
  });

  const navigate = useNavigate();

  const checkCompanyStatus = async () => {
    const companyId = localStorage.getItem("Id");
    try {
      const response = await axios.get(
        `/company/view/verify/status/${companyId}`
      );
      if (
        response.data.successful &&
        response.data.message === "Company is Deactivated"
      ) {
        toast.error("Your company has been deactivated. Logging out.", {
          duration: 5000, // Display the toast for 5 seconds
        });

        // Wait for the toast to finish before logging out
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 3000); // Wait for 5 seconds (the toast duration)
      }
    } catch (error) {
      toast.error("Failed to check company status.");
    }
  };

  // Fetch counts from the backend using Id from localStorage
  useEffect(() => {
    const Id = localStorage.getItem("Id");
    if (Id) {
      const fetchCompanyData = async () => {
        try {
          // Fetch company name
          const companyResponse = await axios.get(`/company/view/${Id}`);
          if (companyResponse.data.successful) {
            setCompanyName(companyResponse.data.data.name);
          } else {
            console.error(
              "Error fetching company name:",
              companyResponse.data.message
            );
          }

          // Fetch company counts
          const countsResponse = await axios.get(
            `/joblisting/view/count/${Id}`
          );
          if (countsResponse.data.successful) {
            setCompanyCounts(countsResponse.data.data);
          } else {
            console.error(
              "Error fetching company counts:",
              countsResponse.data.message
            );
          }

          // Check company status initially
          checkCompanyStatus(Id); // Call checkCompanyStatus after fetching company data

          // Set up an interval to check company status every 5 seconds
          const interval = setInterval(() => {
            checkCompanyStatus(Id); // Call checkCompanyStatus periodically
          }, 5000); // 5000 milliseconds = 5 seconds

          // Clean up the interval when the component unmounts
          return () => clearInterval(interval);
        } catch (error) {
          console.error("Error fetching company data:", error);
        }
      };

      fetchCompanyData();
    } else {
      console.error("Company ID is not available in session storage");
    }
  }, []);

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
        {/* Close Button for Mobile */}
        <button
          className="text-white md:hidden self-end text-3xl"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Welcome, {companyName || "Company"}!
        </h2>

        {/* Dashboard Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Dashboard
        </h2>
        <hr className="border-white border-1 w-full mb-4" />
        <a
          href="/dashc"
          className={`${
            window.location.pathname === "/dashc"
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

        {/* Job Management Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Job Management
        </h2>
        <hr className="border-white border-1 w-full mb-4" />

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
        <hr className="border-white border-1 w-full mb-4" />

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
