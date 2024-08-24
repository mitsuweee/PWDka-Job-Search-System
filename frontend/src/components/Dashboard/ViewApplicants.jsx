import React, { useState } from "react";

const ViewApplicants = () => {
  const [sortOption, setSortOption] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const applicants = [
    {
      id: 1,
      fullName: "Bruce Wayne",
      email: "bruce@wayneenterprises.com",
      resumeLink: "https://example.com/bruce_resume.pdf",
      jobAppliedFor: "Product Manager",
    },
    {
      id: 2,
      fullName: "Clark Kent",
      email: "clark@dailyplanet.com",
      resumeLink: "https://example.com/clark_resume.pdf",
      jobAppliedFor: "Reporter",
    },
  ];

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
    <div>
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
              className="flex-1 min-w-[300px] p-4 bg-blue-500 rounded shadow-xl transition-transform duration-200 ease-in-out hover:scale-105 hover:bg-blue-600"
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
                <a
                  href={applicant.resumeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl bg-custom-bg rounded-md text-custom-blue underline"
                >
                  View Resume
                </a>
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
  );
};

export default ViewApplicants;
