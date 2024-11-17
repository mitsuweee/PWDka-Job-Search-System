import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ApplicationHistory = () => {
  const [applicationHistory, setApplicationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
                    className="border-b border-gray-200 hover:bg-gray-50 transition duration-300"
                  >
                    {/* Position */}
                    <td className="py-4 px-4 sm:px-6 text-gray-800 text-xs sm:text-sm break-words">
                      <span
                        className="text-blue-600 hover:underline cursor-pointer"
                        onClick={() =>
                          navigate(`/job-details/${application.job_id}`)
                        }
                      >
                        {application.position_name}
                      </span>
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
                                : application.status === "Rejected"
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
                          {new Date(
                            application.date_created
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-4 px-4 sm:px-6 text-gray-800 text-xs sm:text-sm break-words">
                      {application.company_name}
                    </td>

                    {/* Status (Desktop) */}
                    <td className="py-4 px-4 sm:px-6 text-xs sm:text-sm hidden sm:table-cell">
                      <span
                        className={`inline-block rounded-full px-3 py-1 ${
                          application.status === "Approved"
                            ? "bg-green-100 text-green-600"
                            : application.status === "Pending"
                            ? "bg-yellow-100 text-yellow-600"
                            : application.status === "Rejected"
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
                    <td className="py-4 px-4 sm:px-6 text-gray-800 text-xs sm:text-sm hidden sm:table-cell">
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
      </div>
    </div>
  );
};

export default ApplicationHistory;
