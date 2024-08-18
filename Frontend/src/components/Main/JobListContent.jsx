import { useState } from 'react';

const JobListing = () => {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isMoreInfoVisible, setIsMoreInfoVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const jobsPerPage = 4; // Number of jobs to display per page

  const company = {
    companyName: 'Sun Life',
    companyEmail: 'info@sunlife.com',
    companyContact: '+1 555-6789',
    companyLocation: '2/F Sun Life Centre, 5th Avenue corner Rizal Drive, Taguig City, National Capital Reg, 1634',
    companyDescription: 'Sun Life in the Philippines offers a diverse range of insurance, wealth, and asset management solutions to help every Filipino in their journey towards a brighter life. As the country’s first and longest-standing life insurer, we provide...',
    companyImage: 'src/imgs/sunlife.png', // Add your image path here
  };

  const jobs = [
    {
      id: 1,
      jobName: 'Full-stack Engineer Team Lead',
      city: 'Manila',
      positionType: 'Full-time',
      salary: '$60,000 - $80,000',
      description: 'Work with a team to lead full-stack development in .NET/Angular...',
      qualifications: '3+ years of experience, Knowledge in .NET and Angular...',
    },
    {
      id: 2,
      jobName: 'Product Manager',
      city: 'Gotham',
      positionType: 'Full-time',
      salary: '$90,000 - $110,000',
      description: 'Manage product lifecycle from conception to launch...',
      qualifications: '5+ years of experience, Proven leadership skills...',
    },
    {
      id: 3,
      jobName: 'Mechanical Engineer',
      city: 'Star City',
      positionType: 'Part-time',
      salary: '$50,000 - $70,000',
      description: 'Design and develop mechanical systems and components...',
      qualifications: '4+ years of experience in mechanical design...',
    },
    {
      id: 4,
      jobName: 'Full-stack Engineer Team Lead',
      city: 'Manila',
      positionType: 'Full-time',
      salary: '$60,000 - $80,000',
      description: 'Work with a team to lead full-stack development in .NET/Angular...',
      qualifications: '3+ years of experience, Knowledge in .NET and Angular...',
    },
    {
      id: 5,
      jobName: 'Product Manager',
      city: 'Gotham',
      positionType: 'Full-time',
      salary: '$90,000 - $110,000',
      description: 'Manage product lifecycle from conception to launch...',
      qualifications: '5+ years of experience, Proven leadership skills...',
    },
    {
      id: 6,
      jobName: 'Mechanical Engineer',
      city: 'Star City',
      positionType: 'Part-time',
      salary: '$50,000 - $70,000',
      description: 'Design and develop mechanical systems and components...',
      qualifications: '4+ years of experience in mechanical design...',
    },
    {
      id: 7,
      jobName: 'Mechanical Engineer',
      city: 'Star City',
      positionType: 'Part-time',
      salary: '$50,000 - $70,000',
      description: 'Design and develop mechanical systems and components...',
      qualifications: '4+ years of experience in mechanical design...',
    },
    {
      id: 8,
      jobName: 'Mechanical Engineer',
      city: 'Star City',
      positionType: 'Part-time',
      salary: '$50,000 - $70,000',
      description: 'Design and develop mechanical systems and components...',
      qualifications: '4+ years of experience in mechanical design...',
    },
    {
      id: 9,
      jobName: 'Mechanical Engineer',
      city: 'Star City',
      positionType: 'Part-time',
      salary: '$50,000 - $70,000',
      description: 'Design and develop mechanical systems and components...',
      qualifications: '4+ years of experience in mechanical design...',
    },
    // Additional job entries can be added here
  ];

  const filteredJobs = jobs.filter(job =>
    job.jobName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const selectedJob = jobs.find(job => job.id === selectedJobId);

  return (
    <div className="flex flex-col lg:flex-row w-full h-full">
      {/* Left Part - Job Listings */}
      <div className="lg:w-1/2 p-4 overflow-auto">
        <input
          type="text"
          placeholder="Search Job Name"
          className="w-3/4 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200 mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <h1 className="text-3xl font-bold mb-6 text-blue-600 text-'sfprobold">Jobs for You</h1>
        <div className="space-y-4">
          {currentJobs.length > 0 ? (
            currentJobs.map((job) => (
              <div key={job.id}>
                <div
                  className="p-4 bg-blue-500 rounded-lg shadow-lg cursor-pointer hover:bg-blue-600 transition transform hover:scale-105"
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setIsDetailsVisible(true); // Show job details below the clicked div on mobile
                    setIsMoreInfoVisible(false); // Reset more info visibility
                  }}
                >
                  <h2 className="text-xl font-bold text-white">
                    <span className="material-symbols-outlined mr-2">work</span>
                    {job.jobName}
                  </h2>
                  <p className="text-white">
                    <span className="material-symbols-outlined mr-2">location_on</span>
                    {job.city}
                  </p>
                  <p className="font-semibold text-white">
                    <span className="material-symbols-outlined mr-2">schedule</span>
                    {job.positionType}
                  </p>
                  <p className="font-semibold text-white">
                    <span className="material-symbols-outlined mr-2">payments</span>
                    {job.salary}
                  </p>
                  <p className="text-gray-200 mt-2">{job.description}</p>
                </div>
                {/* Mobile-Only Popup */}
                {isDetailsVisible && selectedJobId === job.id && (
                  <div className="lg:hidden mt-4 p-4 bg-white rounded-lg shadow-lg relative">
                    {/* X Button */}
                    <button
                      onClick={() => setIsDetailsVisible(false)}
                      className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                    >
                      &times;
                    </button>
                    <h2 className="text-2xl font-bold mb-2 text-blue-600">
                      {job.jobName}
                    </h2>
                    <p className="text-lg mb-2 text-gray-700">{company.companyName}</p>
                    <p className="text-md mb-2 text-gray-500">{job.city}</p>
                    <p className="font-bold text-md text-blue-600">{job.positionType}</p>
                    <p className="font-bold text-md mb-2 text-blue-600">{job.salary}</p>
                    <p className="text-md text-gray-700 mb-2">{job.description}</p>
                    <p className="mt-2 text-md font-semibold text-gray-800">Qualifications:</p>
                    <p className="text-md text-gray-700">{job.qualifications}</p>
                    <div className="mt-4 flex space-x-4">
                      <button className="bg-blue-500 text-white py-2 px-4 rounded-full shadow-lg hover:bg-blue-600 transition transform hover:scale-105">
                        Apply Now
                      </button>
                      <button
                        className="bg-gray-500 text-white py-2 px-4 rounded-full shadow-lg hover:bg-gray-600 transition transform hover:scale-105"
                        onClick={() => setIsMoreInfoVisible(true)}
                      >
                        Learn More
                      </button>
                    </div>
                    {/* Additional Info Popup on Mobile */}
                    {isMoreInfoVisible && (
                      <div className="mt-4 p-4 bg-blue-600 rounded-lg shadow-lg relative">
                        <img
                          src={company.companyImage}
                          alt="Company"
                          className="w-16 h-16 object-cover rounded-full absolute top-2 right-2"
                        />
                        <h3 className="text-lg font-bold text-white">Company Overview</h3>
                        <p className="text-white"><strong>Company Name:</strong> {company.companyName}</p>
                        <p className="text-white"><strong>Email:</strong> {company.companyEmail}</p>
                        <p className="text-white"><strong>Contact Number:</strong> {company.companyContact}</p>
                        <p className="text-white"><strong>Primary Location:</strong> {company.companyLocation}</p>
                        <div className="text-md text-white">
                          {company.companyDescription}
                        </div>
                        <button
                          className="mt-2 text-white hover:underline"
                          onClick={() => setIsMoreInfoVisible(false)}
                        >
                          X
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600">No jobs found.</p>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-6">
          <ol className="flex justify-center gap-1 text-xs font-medium">
            {/* Previous Page Button */}
            <li>
              <button
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                className="inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900"
                disabled={currentPage === 1}
              >
                <span className="sr-only">Prev Page</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index + 1}>
                <button
                  onClick={() => paginate(index + 1)}
                  className={`block size-8 rounded border text-center leading-8 ${
                    currentPage === index + 1
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-100 bg-white text-gray-900'
                  }`}
                >
                  {index + 1}
                </button>
              </li>
            ))}

            {/* Next Page Button */}
            <li>
              <button
                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                className="inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900"
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Next Page</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>
          </ol>
        </div>
      </div>

      {/* Right Part - Job Details for Desktop */}
      <div className={`lg:w-1/2 p-4 hidden lg:block`}>
        {selectedJob ? (
          <div>
            <div className="p-6 bg-white rounded-lg shadow-2xl">
              <h2 className="text-3xl font-bold mb-4 text-blue-600">{selectedJob.jobName}</h2>
              <p className="text-lg mb-2 text-gray-700 flex items-center">
                <span className="material-symbols-outlined mr-2">work</span>
                {company.companyName}
              </p>

              <p className="text-lg mb-4 text-gray-500">
                <span className="material-symbols-outlined mr-2">location_on</span>
                {selectedJob.city}
              </p>
              <p className="font-bold text-lg text-blue-600">
                <span className="material-symbols-outlined mr-2">schedule</span>
                {selectedJob.positionType}
              </p>
              <p className="font-bold text-lg mb-4 text-blue-600">
                <span className="material-symbols-outlined mr-2">payments</span>
                {selectedJob.salary}
              </p>
              <p className="text-lg text-gray-700 mb-4">{selectedJob.description}</p>
              <p className="mt-4 text-lg font-semibold text-gray-800">Qualifications:</p>
              <p className="text-lg text-gray-700">{selectedJob.qualifications}</p>
              <div className="mt-6 flex space-x-4">
                <a href="/apply">
                  <button className="bg-blue-500 text-white py-3 px-6 rounded-full shadow-lg hover:bg-blue-600 hover:shadow-2xl transition transform hover:scale-105">
                    Apply Now
                  </button>
                </a>
                <button
                  className="bg-gray-500 text-white py-3 px-6 rounded-full shadow-lg hover:bg-gray-600 hover:shadow-2xl transition transform hover:scale-105"
                  onClick={() => setIsMoreInfoVisible(!isMoreInfoVisible)}
                >
                  Learn More
                </button>
              </div>
            </div>
            {/* Additional Info Section on Desktop */}
            {isMoreInfoVisible && (
              <div className="mt-4 p-6 bg-blue-600 rounded-lg shadow-2xl relative">
                <img
                  src={company.companyImage}
                  alt="Company"
                  className="w-20 h-20 object-cover rounded-full absolute top-6 right-6"
                />
                <h3 className="text-2xl font-bold text-white">Company Overview</h3>
                <p className="text-white"><strong>Company Name:</strong> {company.companyName}</p>
                <p className="text-white"><strong>Email:</strong> {company.companyEmail}</p>
                <p className="text-white"><strong>Contact Number:</strong> {company.companyContact}</p>
                <p className="text-white"><strong>Primary Location:</strong> {company.companyLocation}</p>
                <p className="text-lg text-white break-words">
                  {company.companyDescription}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-white rounded-lg shadow-lg text-center">
            <p className="text-xl text-gray-600">Select a job listing to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListing;
