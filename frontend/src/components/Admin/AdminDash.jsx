import React, { useState } from 'react';

const FilterDropdown = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (filter) => {
    onFilterChange(filter);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          Filter
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v9l3.293-3.293a1 1 0 011.414 0l.083.094a1 1 0 01-.083 1.32l-5 5-.094.083a1 1 0 01-1.32-.083l-5-5a1 1 0 01-.083-1.32l.083-.094a1 1 0 011.414 0L9 13.586V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
        >
          <div className="py-1" role="none">
            <button
              onClick={() => handleFilterChange('a-z')}
              className="block px-4 py-2 text-sm text-gray-700 w-full text-left"
            >
              A-Z
            </button>
            <button
              onClick={() => handleFilterChange('newest')}
              className="block px-4 py-2 text-sm text-gray-700 w-full text-left"
            >
              Newest
            </button>
            <button
              onClick={() => handleFilterChange('oldest')}
              className="block px-4 py-2 text-sm text-gray-700 w-full text-left"
            >
              Oldest
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <ol className="flex justify-center gap-1 text-xs font-medium">
      <li>
        <button
          onClick={handlePrevPage}
          className="inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900"
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

      {Array.from({ length: totalPages }).map((_, index) => (
        <li key={index}>
          <button
            onClick={() => onPageChange(index + 1)}
            className={`block size-8 rounded border ${
              index + 1 === currentPage
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-100 bg-white text-gray-900'
            } text-center leading-8`}
          >
            {index + 1}
          </button>
        </li>
      ))}

      <li>
        <button
          onClick={handleNextPage}
          className="inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900"
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
  );
};

const SearchBar = ({ searchQuery, onSearchChange }) => (
  <input
    type="text"
    placeholder="Search..."
    value={searchQuery}
    onChange={(e) => onSearchChange(e.target.value)}
    className="w-full p-2 mb-4 border border-gray-300 rounded shadow-sm focus:outline-none"
  />
);

const AdminDashboard = () => {
  const [currentSection, setCurrentSection] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Set the number of items per page to 6
  const [selectedJob, setSelectedJob] = useState(null);

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const sortData = (data) => {
    switch (filter) {
      case 'a-z':
        return data.sort((a, b) => a.fullName.localeCompare(b.fullName));
      case 'newest':
        return data.sort((a, b) => new Date(b.birthdate) - new Date(a.birthdate));
      case 'oldest':
        return data.sort((a, b) => new Date(a.birthdate) - new Date(b.birthdate));
      default:
        return data;
    }
  };

  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const renderHome = () => {
    return (
      <div className="p-6 bg-blue-500 rounded-xl shadow-xl text-center">
        <h2 className="text-3xl font-bold mb-4 text-white">Hello Admin</h2>
        <p className="text-xl text-white">
          You have access to various administrative functionalities such as verifying users and companies, viewing all users and companies, managing job listings, and more.
        </p>
      </div>
    );
  };

  const renderVerifyUsers = () => {
    const user = {
      id: 1,
      profilePicture: 'https://via.placeholder.com/150',
      fullName: 'John Doe',
      pwdId: 'PWD123456',
      disability: 'Visual Impairment',
      address: '123 Main St, Apt 4B',
      city: 'Metropolis',
      birthdate: '1990-01-01',
      contactNumber: '555-1234',
      email: 'johndoe@example.com',
    };

    return (
      <div>
        <h2 className="text-xl font-bold mb-4 text-custom-blue text-center">Verify User</h2>
        <div key={user.id} className="mb-6 p-4 bg-blue-500 rounded-xl shadow-xl text-center">
          <h3 className="text-3xl font-bold mb-4 text-white">Single User</h3>
          <p className="text-2xl mb-8 text-white">User Details</p>
          <div className="flex justify-center">
            <img
              src={user.profilePicture}
              alt={user.fullName}
              className="w-24 h-24 rounded-full mb-4"
            />
          </div>
          <div className="flex flex-col md:flex-row justify-between text-left text-white space-y-4 md:space-y-0">
            <div className="flex-1 md:mr-4">
              <p className="font-semibold text-lg">Full Name:</p>
              <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.fullName}</p>

              <p className="font-semibold text-lg">PWD ID:</p>
              <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.pwdId}</p>

              <p className="font-semibold text-lg">Disability:</p>
              <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.disability}</p>

              <p className="font-semibold text-lg">Address:</p>
              <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.address}</p>
            </div>
            <div className="flex-1 md:ml-4">
              <p className="font-semibold text-lg">City:</p>
              <p className="text-xl bg-custom-bg rounded-md text-custom-blue">{user.city}</p>
              <p className="font-semibold text-lg">Birthdate:</p>
              <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.birthdate}</p>

              <p className="font-semibold text-lg">Contact Number:</p>
              <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.contactNumber}</p>

              <p className="font-semibold text-lg">Email:</p>
              <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.email}</p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-9 bg-white p-6 rounded-lg shadow-lg">
            <button className="cursor-pointer transition-all bg-blue-600 text-white px-6 py-2 rounded-lg
              border-blue-700 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px]
              hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex space-x-4">
              <button className="cursor-pointer transition-all bg-green-500 text-white px-6 py-2 rounded-lg
                border-green-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px]
                hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
              <button className="cursor-pointer transition-all bg-red-500 text-white px-6 py-2 rounded-lg
                border-red-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px]
                hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <button className="cursor-pointer transition-all bg-blue-600 text-white px-6 py-2 rounded-lg
              border-blue-700 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px]
              hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderVerifyCompany = () => {
    const company = {
      id: 1,
      companyName: 'Acme Corporation',
      address: '456 Business Ave',
      city: 'Metropolis',
      companyDescription: 'Leading provider of innovative solutions',
      contactNumber: '555-5678',
      companyEmail: 'contact@acmecorp.com',
    };

    return (
      <div>
        <h2 className="text-xl font-bold mb-4 text-custom-blue">Verify Company</h2>
        <div key={company.id} className="mb-6 p-4 bg-blue-500 rounded-xl shadow-xl">
          <h3 className="text-3xl font-bold mb-4 text-white">Single Company</h3>
          <p className="text-2xl mb-8 text-white">Company Details</p>
          <div className="flex flex-col text-left text-white">
            <p className="font-semibold text-lg">Company Name:</p>
            <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{company.companyName}</p>

            <p className="font-semibold text-lg">Address:</p>
            <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{company.address}</p>

            <p className="font-semibold text-lg">City:</p>
            <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{company.city}</p>

            <p className="font-semibold text-lg">Company Description:</p>
            <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{company.companyDescription}</p>

            <p className="font-semibold text-lg">Contact Number:</p>
            <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{company.contactNumber}</p>

            <p className="font-semibold text-lg">Company Email:</p>
            <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{company.companyEmail}</p>
          </div>
          <div className="flex justify-between items-center mt-9 bg-white p-6 rounded-lg shadow-lg">
            <button className="cursor-pointer transition-all bg-blue-600 text-white px-6 py-2 rounded-lg
              border-blue-700 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px]
              hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex space-x-4">
              <button className="cursor-pointer transition-all bg-green-500 text-white px-6 py-2 rounded-lg
                border-green-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px]
                hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
              <button className="cursor-pointer transition-all bg-red-500 text-white px-6 py-2 rounded-lg
                border-red-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px]
                hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <button className="cursor-pointer transition-all bg-blue-600 text-white px-6 py-2 rounded-lg
              border-blue-700 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px]
              hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderViewAllUsers = () => {
    const users = [
      {
        id: 1,
        profilePicture: 'https://via.placeholder.com/150',
        fullName: 'John Doe',
        pwdId: 'PWD123456',
        disability: 'Visual Impairment',
        address: '123 Main St, Apt 4B',
        city: 'Metropolis',
        birthdate: '1990-01-01',
        contactNumber: '555-1234',
        email: 'johndoe@example.com',
        isVerified: true,
      },
      {
        id: 2,
        profilePicture: 'https://via.placeholder.com/150',
        fullName: 'Jane Smith',
        pwdId: 'PWD654321',
        disability: 'Hearing Impairment',
        address: '456 Elm St, Apt 2A',
        city: 'Gotham',
        birthdate: '1985-05-12',
        contactNumber: '555-5678',
        email: 'janesmith@example.com',
        isVerified: true,
      },
      {
        id: 3,
        profilePicture: 'https://via.placeholder.com/150',
        fullName: 'Alice Johnson',
        pwdId: 'PWD789012',
        disability: 'Mobility Impairment',
        address: '789 Oak St, Apt 6C',
        city: 'Star City',
        birthdate: '1992-07-20',
        contactNumber: '555-9101',
        email: 'alicejohnson@example.com',
        isVerified: false,
      },
    ];

    const filteredUsers = users.filter((user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sortedUsers = sortData(filteredUsers);
    const paginatedUsers = paginateData(sortedUsers);

    return (
      <div>
        <h2 className="text-xl font-bold mb-4 text-custom-blue">View All Users</h2>
        <SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        <div className="flex flex-wrap gap-4">
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <div key={user.id} className="flex-1 min-w-[300px] p-4 bg-blue-500 rounded-xl shadow-xl">
                <div className="flex flex-col text-left text-white">
                  <img
                    src={user.profilePicture}
                    alt={user.fullName}
                    className="w-24 h-24 rounded-full mb-4"
                  />
                  <p className="font-semibold text-lg">Full Name:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.fullName}</p>

                  <p className="font-semibold text-lg">PWD ID:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.pwdId}</p>

                  <p className="font-semibold text-lg">Disability:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.disability}</p>

                  <p className="font-semibold text-lg">Address:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.address}</p>

                  <p className="font-semibold text-lg">City:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.city}</p>

                  <p className="font-semibold text-lg">Birthdate:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.birthdate}</p>

                  <p className="font-semibold text-lg">Contact Number:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.contactNumber}</p>

                  <p className="font-semibold text-lg">Email:</p>
                  <p className="text-xl bg-custom-bg rounded-md text-custom-blue">{user.email}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white">No users found.</p>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(sortedUsers.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  };

  const renderViewAllCompany = () => {
    const companies = [
      {
        id: 1,
        companyName: 'Acme Corporation',
        address: '456 Business Ave',
        city: 'Metropolis',
        companyDescription: 'Leading provider of innovative solutions',
        contactNumber: '555-5678',
        companyEmail: 'contact@acmecorp.com',
        isVerified: true,
      },
      {
        id: 2,
        companyName: 'Wayne Enterprises',
        address: '1007 Mountain Drive',
        city: 'Gotham',
        companyDescription: 'Global leader in technology and philanthropy',
        contactNumber: '555-3456',
        companyEmail: 'info@wayneenterprises.com',
        isVerified: true,
      },
      {
        id: 3,
        companyName: 'Queen Industries',
        address: 'Starling City',
        city: 'Star City',
        companyDescription: 'Innovative technologies and manufacturing',
        contactNumber: '555-7890',
        companyEmail: 'contact@queenindustries.com',
        isVerified: false,
      },
    ];

    const filteredCompanies = companies.filter((company) =>
      company.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sortedCompanies = sortData(filteredCompanies);
    const paginatedCompanies = paginateData(sortedCompanies);

    return (
      <div>
        <h2 className="text-xl font-bold mb-4 text-custom-blue">View All Verified Companies</h2>
        <SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        <div className="flex flex-wrap gap-4">
          {paginatedCompanies.length > 0 ? (
            paginatedCompanies.map((company) => (
              <div key={company.id} className="flex-1 min-w-[300px] p-4 bg-blue-500 rounded-xl shadow-xl">
                <div className="flex flex-col text-left text-white">
                  <p className="font-semibold text-lg">Company Name:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{company.companyName}</p>

                  <p className="font-semibold text-lg">Address:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{company.address}</p>

                  <p className="font-semibold text-lg">City:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{company.city}</p>

                  <p className="font-semibold text-lg">Description:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{company.companyDescription}</p>

                  <p className="font-semibold text-lg">Contact Number:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{company.contactNumber}</p>

                  <p className="font-semibold text-lg">Email:</p>
                  <p className="text-xl bg-custom-bg rounded-md text-custom-blue">{company.companyEmail}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white">No companies found.</p>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(sortedCompanies.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  };

  const renderViewAllJobListings = () => {
    const jobListings = [
      {
        id: 1,
        companyName: 'Acme Corporation',
        jobName: 'Software Engineer',
        description: 'Develop and maintain software solutions',
        address: '456 Business Ave',
        city: 'Metropolis',
      },
      {
        id: 2,
        companyName: 'Wayne Enterprises',
        jobName: 'Product Manager',
        description: 'Oversee product development from start to finish',
        address: '1007 Mountain Drive',
        city: 'Gotham',
      },
      {
        id: 3,
        companyName: 'Queen Industries',
        jobName: 'Mechanical Engineer',
        description: 'Design and develop mechanical systems',
        address: 'Starling City',
        city: 'Star City',
      },
    ];

    const filteredJobListings = jobListings.filter((job) =>
      job.jobName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sortedJobListings = sortData(filteredJobListings);
    const paginatedJobListings = paginateData(sortedJobListings);

    return (
      <div>
        <h2 className="text-xl font-bold mb-4 text-custom-blue">View All Job Listings</h2>
        <SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        <div className="flex flex-wrap gap-4">
          {paginatedJobListings.length > 0 ? (
            paginatedJobListings.map((listing) => (
              <div key={listing.id} className="flex-1 min-w-[300px] p-4 bg-blue-500 rounded-xl shadow-xl">
                <div className="flex flex-col text-left text-white">
                  <p className="font-semibold text-lg">Company Name:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{listing.companyName}</p>

                  <p className="font-semibold text-lg">Job Name:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{listing.jobName}</p>

                  <p className="font-semibold text-lg">Description:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{listing.description}</p>

                  <p className="font-semibold text-lg">Address:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{listing.address}</p>

                  <p className="font-semibold text-lg">City:</p>
                  <p className="text-xl bg-custom-bg rounded-md text-custom-blue">{listing.city}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white">No job listings found.</p>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(sortedJobListings.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  };

  const renderUpdateJobListings = () => {
    const jobListings = [
      {
        id: 1,
        companyName: 'Acme Corporation',
        jobName: 'Software Engineer',
        description: 'Develop and maintain software solutions',
        address: '456 Business Ave',
        city: 'Metropolis',
      },
      {
        id: 2,
        companyName: 'Wayne Enterprises',
        jobName: 'Product Manager',
        description: 'Oversee product development from start to finish',
        address: '1007 Mountain Drive',
        city: 'Gotham',
      },
      {
        id: 3,
        companyName: 'Queen Industries',
        jobName: 'Mechanical Engineer',
        description: 'Design and develop mechanical systems',
        address: 'Starling City',
        city: 'Star City',
      },
    ];

    const handleEditClick = (job) => {
      setSelectedJob(job);
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setSelectedJob((prevJob) => ({
        ...prevJob,
        [name]: value,
      }));
    };

    const handleUpdateJob = () => {
      // Implement the logic to update the job listing in the database or state
      console.log('Updated job listing:', selectedJob);
      setSelectedJob(null); // Reset the form after updating
    };

    if (!jobListings || jobListings.length === 0) {
      return (
        <div className="p-6 bg-blue-500 rounded-xl shadow-xl text-center">
          <p className="text-xl text-white">No job listings available to update.</p>
        </div>
      );
    }

    return (
      <div>
        <h2 className="text-xl font-bold mb-4 text-custom-blue">Update Job Listings</h2>
        {selectedJob ? (
          <div className="p-4 bg-blue-500 rounded-xl shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-white">Update Job Listing</h3>
            <div className="flex flex-col text-left text-white">
              <label className="font-semibold text-lg">Company Name:</label>
              <input
                type="text"
                name="companyName"
                value={selectedJob.companyName}
                onChange={handleInputChange}
                className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue p-2"
              />

              <label className="font-semibold text-lg">Job Name:</label>
              <input
                type="text"
                name="jobName"
                value={selectedJob.jobName}
                onChange={handleInputChange}
                className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue p-2"
              />

              <label className="font-semibold text-lg">Description:</label>
              <textarea
                name="description"
                value={selectedJob.description}
                onChange={handleInputChange}
                className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue p-2"
              />

              <label className="font-semibold text-lg">Address:</label>
              <input
                type="text"
                name="address"
                value={selectedJob.address}
                onChange={handleInputChange}
                className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue p-2"
              />

              <label className="font-semibold text-lg">City:</label>
              <input
                type="text"
                name="city"
                value={selectedJob.city}
                onChange={handleInputChange}
                className="text-xl bg-custom-bg rounded-md text-custom-blue p-2"
              />
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={handleUpdateJob}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
              >
                Save
              </button>
              <button
                onClick={() => setSelectedJob(null)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {jobListings.map((listing) => (
              <div key={listing.id} className="flex-1 min-w-[300px] p-4 bg-blue-500 rounded-xl shadow-xl">
                <div className="flex flex-col text-left text-white">
                  <p className="font-semibold text-lg">Company Name:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{listing.companyName}</p>

                  <p className="font-semibold text-lg">Job Name:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{listing.jobName}</p>

                  <p className="font-semibold text-lg">Description:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{listing.description}</p>

                  <p className="font-semibold text-lg">Address:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{listing.address}</p>

                  <p className="font-semibold text-lg">City:</p>
                  <p className="text-xl bg-custom-bg rounded-md text-custom-blue">{listing.city}</p>
                </div>
                <button
                  onClick={() => handleEditClick(listing)}
                  className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDeleteUsers = () => {
    const users = [
      {
        id: 1,
        profilePicture: 'https://via.placeholder.com/150',
        fullName: 'John Doe',
        pwdId: 'PWD123456',
        disability: 'Visual Impairment',
        address: '123 Main St, Apt 4B',
        city: 'Metropolis',
        birthdate: '1990-01-01',
        contactNumber: '555-1234',
        email: 'johndoe@example.com',
        password: 'password123',
      },
      // Add more users as needed
    ];



    const filteredUsers = users.filter((user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedUsers = filteredUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    return (
      <div>
        <h2 className="text-xl font-bold mb-4 text-custom-blue text-center">Delete User</h2>
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex flex-wrap gap-4">
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <div key={user.id} className="flex-1 min-w-[300px] p-4 bg-blue-500 rounded-xl shadow-xl">
                <div className="flex flex-col text-left text-white">
                  <img
                    src={user.profilePicture}
                    alt={user.fullName}
                    className="w-24 h-24 rounded-full mb-4"
                  />
                  <p className="font-semibold text-lg">Full Name:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.fullName}</p>

                  <p className="font-semibold text-lg">PWD ID:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.pwdId}</p>

                  <p className="font-semibold text-lg">Disability:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.disability}</p>

                  <p className="font-semibold text-lg">Address:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.address}</p>

                  <p className="font-semibold text-lg">City:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.city}</p>

                  <p className="font-semibold text-lg">Birthdate:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.birthdate}</p>

                  <p className="font-semibold text-lg">Contact Number:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{user.contactNumber}</p>

                  <p className="font-semibold text-lg">Email:</p>
                  <p className="text-xl bg-custom-bg rounded-md text-custom-blue">{user.email}</p>

                  <p className="font-semibold text-lg">Password:</p>
                  <p className="text-xl bg-custom-bg rounded-md text-custom-blue">{user.password}</p>
                </div>
                <div className="flex justify-center items-center mt-8">
                  <button className="cursor-pointer transition-all bg-red-500 text-white px-6 py-2 rounded-lg
                    border-red-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px]
                    hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white">No users found.</p>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredUsers.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  };

  const renderDeleteJobListings = () => {
    const jobListings = [
      {
        id: 1,
        companyName: 'Acme Corporation',
        jobName: 'Software Engineer',
        description: 'Develop and maintain software solutions',
        address: '456 Business Ave',
        city: 'Metropolis',
      },
      // Add more job listings as need
    ];


    const filteredJobListings = jobListings.filter((job) =>
      job.jobName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedJobListings = filteredJobListings.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    return (
      <div>
        <h2 className="text-xl font-bold mb-4 text-custom-blue">Delete Job Listing</h2>
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex flex-wrap gap-4">
          {paginatedJobListings.length > 0 ? (
            paginatedJobListings.map((jobListing) => (
              <div key={jobListing.id} className="flex-1 min-w-[300px] p-4 bg-blue-500 rounded-xl shadow-xl">
                <div className="flex flex-col text-left text-white">
                  <p className="font-semibold text-lg">Company Name:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{jobListing.companyName}</p>

                  <p className="font-semibold text-lg">Job Name:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{jobListing.jobName}</p>

                  <p className="font-semibold text-lg">Description:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{jobListing.description}</p>

                  <p className="font-semibold text-lg">Address:</p>
                  <p className="mb-2 text-xl bg-custom-bg rounded-md text-custom-blue">{jobListing.address}</p>

                  <p className="font-semibold text-lg">City:</p>
                  <p className="text-xl bg-custom-bg rounded-md text-custom-blue">{jobListing.city}</p>
                </div>
                <div className="flex justify-center items-center mt-8">
                  <button className="cursor-pointer transition-all bg-red-500 text-white px-6 py-2 rounded-lg
                    border-red-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px]
                    hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white">No job listings found.</p>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredJobListings.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      {/* Sidebar */}
      <aside
        className={`bg-custom-blue w-full md:w-[300px] lg:w-[250px] p-4 flex flex-col items-center md:relative fixed top-0 left-0 min-h-screen h-full transition-transform transform${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 z-50 md:z-auto rounded-xl md:ml-4 md:mt-6 lg:ml-8 lg:mt-8`}
      >
        <button
          className="text-white md:hidden self-end size-10"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>
        <button
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
          onClick={() => {
            setCurrentSection('home');
            setIsSidebarOpen(false);
          }}
        >
          Home
        </button>
        <button
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
          onClick={() => {
            setCurrentSection('verifyUsers');
            setIsSidebarOpen(false);
          }}
        >
          Verify Users
        </button>
        <button
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
          onClick={() => {
            setCurrentSection('verifyCompany');
            setIsSidebarOpen(false);
          }}
        >
          Verify Company
        </button>
        <button
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
          onClick={() => {
            setCurrentSection('viewAllUsers');
            setIsSidebarOpen(false);
          }}
        >
          View All Users
        </button>
        <button
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
          onClick={() => {
            setCurrentSection('viewAllCompany');
            setIsSidebarOpen(false);
          }}
        >
          View All Companies
        </button>
        <button
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
          onClick={() => {
            setCurrentSection('viewAllJobListings');
            setIsSidebarOpen(false);
          }}
        >
          View All Job Listings
        </button>
        <button
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
          onClick={() => {
            setCurrentSection('updateJobListings');
            setIsSidebarOpen(false);
          }}
        >
          Update Job Listings
        </button>
        <button
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
          onClick={() => {
            setCurrentSection('deleteUsers');
            setIsSidebarOpen(false);
          }}
        >
          Delete Users
        </button>
        <button
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
          onClick={() => {
            setCurrentSection('deleteJobListings');
            setIsSidebarOpen(false);
          }}
        >
          Delete Job Listings
        </button>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        className={`md:hidden bg-custom-blue text-white p-4 fixed top-4 left-4 z-50 rounded-xl transition-transform ${
          isSidebarOpen ? 'hidden' : ''
        }`}
        onClick={() => setIsSidebarOpen(true)}
      >
        &#9776;
      </button>

      {/* Main Content */}
      <main className="flex-grow p-8 bg-custom-bg ml-6 mt-8">
        <h1 className="text-3xl font-bold text-blue-900">Admin Dashboard</h1>
        <div className="mt-4">
          {currentSection === 'home' && renderHome()}
          {currentSection === 'verifyUsers' && renderVerifyUsers()}
          {currentSection === 'verifyCompany' && renderVerifyCompany()}
          {currentSection === 'viewAllUsers' && renderViewAllUsers()}
          {currentSection === 'viewAllCompany' && renderViewAllCompany()}
          {currentSection === 'viewAllJobListings' && renderViewAllJobListings()}
          {currentSection === 'updateJobListings' && renderUpdateJobListings()}
          {currentSection === 'deleteUsers' && renderDeleteUsers()}
          {currentSection === 'deleteJobListings' && renderDeleteJobListings()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
