import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminViewJobs = () => {
  const [jobListings, setJobListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
  const [job, setJob] = useState(null); // Store the specific job to view
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all job listings
    const config = {
      method: "get",
      url: "http://localhost:8080/admin/view/all/joblisting/newesttooldest", // Fetch job listings from your API
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        console.log("Job Listings Response:", response);
        const jobDataArray = response.data.data;
        setJobListings(jobDataArray);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  // Fetch and show job details in the modal
  const handleViewJob = (jobId) => {
    const config = {
      method: "get",
      url: `http://localhost:8080/admin/view/joblisting/${jobId}`, // Fetch specific job by ID
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        console.log("Job Details Response:", response);
        const jobData = response.data.data[0]; // Assuming the job object is returned
        setJob(formatJobData(jobData)); // Set the job details
        setIsModalOpen(true); // Open the modal
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Helper function to format job data
  const formatJobData = (jobData) => {
    return {
      id: jobData.id,
      companyName: jobData.company_name,
      jobName: jobData.position_name,
      description: jobData.description,
      qualification: jobData.qualification,
      minimumSalary: jobData.minimum_salary,
      maximumSalary: jobData.maximum_salary,
      positionType: jobData.position_type,
      disabilityTypes: jobData.disability_types,
    };
  };

  // Handle delete job listing
  const handleDeleteJobListing = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job listing?"
    );
    if (confirmed) {
      const config = {
        method: "delete",
        url: `http://localhost:8080/admin/delete/joblisting/${id}`,
        headers: {
          "Content-Type": "application/json",
        },
      };

      axios(config)
        .then(() => {
          alert("Job listing deleted successfully!");
          setJobListings((prevListings) =>
            prevListings.filter((job) => job.id !== id)
          );
        })
        .catch(() => {
          alert("An error occurred while deleting the job listing.");
        });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setJob(null); // Clear the job details
  };

  if (loading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-blue-100">
      <main className="flex-grow p-8">
        <h1 className="text-xl font-bold text-gray-700">
          View All Job Listings
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white mt-4">
            <thead>
              <tr className="w-full bg-blue-500 text-white">
                <th className="py-2 px-4">Company</th>
                <th className="py-2 px-4">Job Title</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobListings.map((job) => (
                <tr key={job.id} className="border-b">
                  <td className="py-2 px-4">{job.company_name}</td>
                  <td className="py-2 px-4">{job.position_name}</td>
                  <td className="py-2 px-4 flex">
                    <button
                      onClick={() => handleViewJob(job.id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteJobListing(job.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal for viewing job details */}
      {isModalOpen && job && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-11/12 md:max-w-3xl p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 text-center">
              Job Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left text-gray-800 w-full">
              <div>
                <p className="font-semibold text-base sm:text-lg">Company:</p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {job.companyName}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">Job Title:</p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {job.jobName}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  Description:
                </p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {job.description}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  Qualification:
                </p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {job.qualification}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">Salary:</p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {job.minimumSalary} - {job.maximumSalary}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  Position Type:
                </p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {job.positionType}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  Disabilities:
                </p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {job.disabilityTypes}
                </p>
              </div>
            </div>

            {/* Buttons for Back */}
            <div className="mt-6 text-center space-x-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                onClick={closeModal} // Close modal
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminViewJobs;
