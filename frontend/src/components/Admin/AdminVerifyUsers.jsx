import React from "react";

const AdminVerifyUsers = () => {
  const user = {
    id: 1,
    profilePicture: "https://via.placeholder.com/150",
    fullName: "John Doe",
    pwdId: "PWD123456",
    disability: "Visual Impairment",
    address: "123 Main St, Apt 4B",
    city: "Metropolis",
    birthdate: "1990-01-01",
    contactNumber: "555-1234",
    email: "johndoe@example.com",
  };

  return (
    <div className="flex justify-center items-center h-full w-full bg-blue-500 p-4 sm:p-6 md:p-8 rounded-2xl">
      <div className="w-full max-w-4xl h-full bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl flex flex-col justify-center items-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 text-center">
          Verify User
        </h2>
        <p className="text-lg sm:text-xl mb-4 sm:mb-8 text-gray-600 text-center">
          User Details
        </p>
        <div className="flex justify-center mb-4 sm:mb-6">
          <img
            src={user.profilePicture}
            alt={user.fullName}
            className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 border-gray-300"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left text-gray-800 w-full">
          <div>
            <p className="font-semibold text-base sm:text-lg">Full Name:</p>
            <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
              {user.fullName}
            </p>
          </div>
          <div>
            <p className="font-semibold text-base sm:text-lg">PWD ID:</p>
            <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
              {user.pwdId}
            </p>
          </div>
          <div>
            <p className="font-semibold text-base sm:text-lg">Disability:</p>
            <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
              {user.disability}
            </p>
          </div>
          <div>
            <p className="font-semibold text-base sm:text-lg">Address:</p>
            <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
              {user.address}
            </p>
          </div>
          <div>
            <p className="font-semibold text-base sm:text-lg">City:</p>
            <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
              {user.city}
            </p>
          </div>
          <div>
            <p className="font-semibold text-base sm:text-lg">Birthdate:</p>
            <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
              {user.birthdate}
            </p>
          </div>
          <div>
            <p className="font-semibold text-base sm:text-lg">
              Contact Number:
            </p>
            <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
              {user.contactNumber}
            </p>
          </div>
          <div>
            <p className="font-semibold text-base sm:text-lg">Email:</p>
            <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center mt-4 sm:mt-8 space-y-2 sm:space-y-0 sm:space-x-4">
          <button className="transition-all bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
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
            Previous
          </button>
          <button className="transition-all bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 shadow">
            Approve
          </button>
          <button className="transition-all bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 shadow">
            Decline
          </button>
          <button className="transition-all bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 shadow flex items-center justify-center">
            Next
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
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

export default AdminVerifyUsers;
