import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ViewApplicants = () => {
  const [sortOption, setSortOption] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      sessionStorage.removeItem("Id");
      sessionStorage.removeItem("Role");
      sessionStorage.removeItem("Token");

      navigate("/login");
    }
  };

  // Fetch job listings
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joblistingId = params.get("id");

    console.log("Job Listing ID:", joblistingId); // Debug log

    if (!joblistingId) {
      alert("Job listing ID is missing.");
      return;
    }

    const config = {
      method: "get",
      url: `/jobapplication/applications/${joblistingId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };
    axios(config)
      .then(async (response) => {
        console.log(response.data.data);
        const fetchedJobApplicants = await Promise.all(
          response.data.data.map(async (applicant) => {
            return {
              id: applicant.id,
              fullName: applicant.full_name,
              email: applicant.email,
              resume: applicant.resume, // URL for PDF preview
              jobAppliedFor: applicant.position_name,
            };
          })
        );

        setApplicants(fetchedJobApplicants);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log(error.response?.data);
        alert(errorMessage);
      });
  }, []);

  const toggleFilterMenu = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    setIsFilterOpen(false); // Close the filter menu after selection
  };

  const deleteApplicant = (id) => {
    // Logic to delete an applicant
    console.log(`Applicant with id ${id} deleted`);
  };

  // Sort the applicants based on the selected sort option
  const sortedApplicants = applicants.sort((a, b) => {
    if (sortOption === "newest") {
      return b.id - a.id;
    } else if (sortOption === "oldest") {
      return a.id - b.id;
    } else if (sortOption === "a-z") {
      return a.fullName.localeCompare(b.fullName);
    }
    return 0;
  });

  return (
    <div className="flex">
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
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">work</span>
          <span className="flex-grow text-center">Post Job</span>
        </a>
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
        {/* <div
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">people</span>
          <span className="flex-grow text-center">View Applicants</span>
        </div> */}

        <button
          className="bg-red-600 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out mt-6 flex items-center justify-center"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold mb-4 text-custom-blue">
            View Applicants
          </h2>
          <div className="relative">
            <button
              className="py-2 px-4 mb-3 rounded-lg bg-blue-600 text-white"
              onClick={toggleFilterMenu}
            >
              Filter
            </button>
            {isFilterOpen && (
              <div
                className="absolute right-0 mt-2 space-y-2 bg-white p-4 shadow-lg rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={`py-2 px-4 rounded-lg w-full ${
                    sortOption === "newest"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-blue-900"
                  }`}
                  onClick={() => handleSortChange("newest")}
                >
                  Newest
                </button>
                <button
                  className={`py-2 px-4 rounded-lg w-full ${
                    sortOption === "oldest"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-blue-900"
                  }`}
                  onClick={() => handleSortChange("oldest")}
                >
                  Oldest
                </button>
                <button
                  className={`py-2 px-4 rounded-lg w-full ${
                    sortOption === "a-z"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-blue-900"
                  }`}
                  onClick={() => handleSortChange("a-z")}
                >
                  A-Z
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {sortedApplicants.length > 0 ? (
            sortedApplicants.map((applicant) => (
              <div
                key={applicant.id}
                className="flex-1 min-w-[300px] p-4 bg-blue-500 rounded shadow-xl transition-transform duration-200 ease-in-out hover:scale-80 hover:bg-blue-600"
              >
                <div className="flex flex-col text-left">
                  <p className="font-semibold text-lg text-white">Full Name:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {applicant.fullName}
                  </p>

                  <p className="font-semibold text-lg text-white">Email:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {applicant.email}
                  </p>

                  <p className="font-semibold text-lg text-white">
                    Job Applied For:
                  </p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">
                    {applicant.jobAppliedFor}
                  </p>

                  <p className="font-semibold text-lg text-white">Resume:</p>
                  <embed
                    src={`data:application/pdf;base64,${applicant.resume}`}
                    type="application/pdf"
                    width="100%"
                    height="500px"
                    className="w-full h-64 border rounded-lg shadow-sm"
                    aria-label="PDF Preview"
                  />
                </div>
                <button
                  onClick={() => deleteApplicant(applicant.id)}
                  className="mt-4 py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition duration-200"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No applicants found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewApplicants;
