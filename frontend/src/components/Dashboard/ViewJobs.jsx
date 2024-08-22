import { useState, useEffect } from "react";
import axios from "axios";

const ViewJobs = () => {
  const [jobListings, setJobListings] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [isEditing, setIsEditing] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState({
    id: "",
    positionName: "",
    jobDescription: "",
    qualifications: "",
    salary: "",
    positionType: "full-time",
  });

  // Fetch job listings on component mount
  useEffect(() => {
    const companyId = sessionStorage.getItem("Id");
    const config = {
      method: "get",
      url: `/joblisting/view/newesttooldest/company/${companyId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        console.log(response.data);
        const fetchedJobListings = response.data.data.map((job) => ({
          id: job.id,
          jobName: job.position_name,
          description: job.description,
          qualifications: job.qualification,
          minSalary: job.minimum_salary,
          maxSalary: job.maximum_salary,
          positionType: job.position_type,
          disabilityTypes: job.disability_types,
        }));
        setJobListings(fetchedJobListings);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log(error.response?.data);
        alert(errorMessage);
      });
  }, []);

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);

    const updateJobListing = JSON.stringify({
      position_name: updatedDetails.positionName,
      description: updatedDetails.jobDescription,
      qualification: updatedDetails.qualifications,
      minimum_salary: parseFloat(updatedDetails.salary.split("-")[0]),
      maximum_salary: parseFloat(updatedDetails.salary.split("-")[1]),
      positiontype_id: updatedDetails.positionType === "full-time" ? 1 : 2,
    });

    const config = {
      method: "put",
      url: `/joblisting/update/${updatedDetails.id}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: updateJobListing,
    };

    axios(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        alert(response.data.message);
        window.location.reload(); // Refresh the page to reflect changes
      })
      .catch((error) => {
        console.log(error);
        alert(error.response.data.message);
      });
  };

  const renderUpdateJobListings = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Update Job Listing</h2>
      <form
        onSubmit={handleUpdateSubmit}
        className="bg-blue-500 p-6 rounded shadow-md text-center"
      >
        <div className="mb-4 text-left">
          <label className="block mb-2 text-white">Position Name</label>
          <input
            type="text"
            name="positionName"
            value={updatedDetails.positionName}
            onChange={handleUpdateChange}
            className="p-2 w-full rounded"
            required
          />
        </div>
        <div className="mb-4 text-left">
          <label className="block mb-2 text-white">Job Description</label>
          <textarea
            name="jobDescription"
            value={updatedDetails.jobDescription}
            onChange={handleUpdateChange}
            className="p-2 w-full rounded"
            required
          />
        </div>
        <div className="mb-4 text-left">
          <label className="block mb-2 text-white">Qualifications</label>
          <textarea
            name="qualifications"
            value={updatedDetails.qualifications}
            onChange={handleUpdateChange}
            className="p-2 w-full rounded"
            required
          />
        </div>
        <div className="mb-4 text-left">
          <label className="block mb-2 text-white">Salary</label>
          <input
            type="text"
            name="salary"
            value={updatedDetails.salary}
            onChange={handleUpdateChange}
            className="p-2 w-full rounded"
            required
          />
        </div>
        <div className="mb-4 text-left">
          <label className="block mb-2 text-white">Position Type</label>
          <select
            name="positionType"
            value={updatedDetails.positionType}
            onChange={handleUpdateChange}
            className="p-2 w-full rounded"
            required
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white py-2 px-4 rounded"
        >
          Update Job
        </button>
      </form>
    </div>
  );

  const renderViewAllJobListings = () => {
    const sortedJobListings = jobListings.sort((a, b) => {
      if (sortOption === "newest") {
        return b.id - a.id;
      } else if (sortOption === "oldest") {
        return a.id - b.id;
      } else if (sortOption === "a-z") {
        return a.jobName.localeCompare(b.jobName);
      }
      return 0;
    });

    return (
      <div>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold mb-4 text-custom-blue">
            View All Job Listings
          </h2>
          <div className="relative">
            <button
              className="py-2 px-4 mb-0 rounded-lg bg-blue-600 text-white"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              Filter
            </button>
            {isFilterOpen && (
              <div
                className="absolute right-0 top-full mt-0 space-y-2 bg-white p-4 shadow-lg rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={`py-2 px-4 rounded-lg w-full ${
                    sortOption === "newest"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-blue-900"
                  }`}
                  onClick={() => setSortOption("newest")}
                >
                  Newest
                </button>
                <button
                  className={`py-2 px-4 rounded-lg w-full ${
                    sortOption === "oldest"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-blue-900"
                  }`}
                  onClick={() => setSortOption("oldest")}
                >
                  Oldest
                </button>
                <button
                  className={`py-2 px-4 rounded-lg w-full ${
                    sortOption === "a-z"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-blue-900"
                  }`}
                  onClick={() => setSortOption("a-z")}
                >
                  A-Z
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {sortedJobListings.length > 0 ? (
            sortedJobListings.map((listing) => (
              <div
                key={listing.id}
                className="flex-1 min-w-[300px] p-4 bg-blue-500 rounded shadow-xl transition-transform duration-200 ease-in-out hover:scale-105 hover:bg-blue-600"
              >
                <div className="flex flex-col text-left">
                  <p className="font-semibold text-lg text-white">
                    Position Name:
                  </p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {listing.jobName}
                  </p>

                  <p className="font-semibold text-lg text-white">
                    Job Description:
                  </p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {listing.description}
                  </p>

                  <p className="font-semibold text-lg text-white">
                    Qualifications:
                  </p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {listing.qualifications}
                  </p>

                  <p className="font-semibold text-lg text-white">
                    Salary Range:
                  </p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {`${listing.minSalary} - ${listing.maxSalary}`}
                  </p>

                  <p className="font-semibold text-lg text-white">
                    Position Type:
                  </p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {listing.positionType}
                  </p>

                  <p className="font-semibold text-lg text-white">
                    Disability Types:
                  </p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {listing.disabilityTypes}
                  </p>

                  {/* Update Button */}
                  <button
                    className="mt-4 py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                    onClick={() => {
                      setUpdatedDetails({
                        id: listing.id,
                        positionName: listing.jobName,
                        jobDescription: listing.description,
                        qualifications: listing.qualifications,
                        salary: `${listing.minSalary}-${listing.maxSalary}`,
                        positionType: listing.positionType,
                      });
                      setIsEditing(true);
                    }}
                  >
                    Update
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No job listings found.</p>
          )}
        </div>

        {/* Conditionally Render the Update Form */}
        {isEditing && renderUpdateJobListings()}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Job Listings</h1>
      {renderViewAllJobListings()}
    </div>
  );
};

export default ViewJobs;
