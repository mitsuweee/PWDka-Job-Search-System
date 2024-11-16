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
    <div className="p-6">
      <Toaster position="top-center" reverseOrder={false} />
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        onClick={() => navigate("/")}
      >
        Back to Job Listings
      </button>
      <h1 className="text-2xl font-semibold mb-6">Application History</h1>
      {loading ? (
        <div>Loading...</div>
      ) : applicationHistory.length > 0 ? (
        <div className="overflow-auto max-h-[70vh] border-t border-gray-200 pt-4">
          <table className="w-full bg-white text-left text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase tracking-wider">
                <th className="py-2 px-4">Position</th>
                <th className="py-2 px-4">Company</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Date Applied</th>
              </tr>
            </thead>
            <tbody>
              {applicationHistory.map((application, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-100 transition text-gray-700"
                >
                  <td
                    className="py-2 px-4 text-blue-500 hover:underline cursor-pointer"
                    onClick={() =>
                      navigate(`/job-details/${application.job_id}`)
                    } // Assuming job details page
                  >
                    {application.position_name}
                  </td>
                  <td className="py-2 px-4">{application.company_name}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        application.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : application.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {application.status}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {new Date(application.date_created).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No application history found.
        </p>
      )}
    </div>
  );
};

export default ApplicationHistory;
