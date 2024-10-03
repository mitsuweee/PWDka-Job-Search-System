import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminVerifyUsers = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]); // Store all users
  const [currentIndex, setCurrentIndex] = useState(0); // Index of current user
  const [user, setUser] = useState(null); // Store single user for display
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

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const config = {
      method: "get",
      url: "http://localhost:8080/verification/view/users",
      headers: {
        "User-Agent": "Apidog/1.0.0 (https://apidog.com)",
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response) {
        const userDataArray = response.data.data; // Assuming you get an array of users
        setUsers(userDataArray);
        if (userDataArray.length > 0) {
          setUser(formatUserData(userDataArray[0])); // Display the first user by default
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  // Helper function to format user data
  const formatUserData = (userData) => {
    return {
      id: userData.id,
      fullName: userData.full_name,
      pwdId: userData.id,
      disability: userData.type,
      address: userData.address,
      city: userData.city,
      birthdate: new Date(userData.birth_date).toLocaleDateString("en-US"),
      contactNumber: userData.contact_number,
      email: userData.email,
      profilePicture: `data:image/png;base64,${userData.formal_picture}`,
      pictureWithId: `data:image/png;base64,${userData.picture_with_id}`,
      pictureOfPwdId: `data:image/png;base64,${userData.picture_of_pwd_id}`,
    };
  };

  const handleApprove = () => {
    const config = {
      method: "put",
      url: `http://localhost:8080/verification/user/${user.id}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        alert("User approved successfully!");
        handleNextUser();
      })
      .catch(function (error) {
        console.log(error);
        alert("An error occurred while approving the user.");
      });
  };

  const handleDecline = () => {
    const config = {
      method: "delete",
      url: `http://localhost:8080/verification/user/${user.id}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        alert("User declined successfully!");
        handleNextUser();
      })
      .catch(function (error) {
        console.log(error);
        alert("An error occurred while declining the user.");
      });
  };

  // Handle showing the next user after approval or decline
  const handleNextUser = () => {
    if (users.length > 1) {
      const updatedUsers = users.filter((_, index) => index !== currentIndex);
      setUsers(updatedUsers);
      if (updatedUsers.length > 0) {
        setUser(formatUserData(updatedUsers[0]));
        setCurrentIndex(0);
      } else {
        setUser(null); // No users left
      }
    } else {
      setUsers([]); // No more users
      setUser(null);
    }
  };

  // Handlers for navigating between users
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setUser(formatUserData(users[newIndex]));
    }
  };

  const handleNext = () => {
    if (currentIndex < users.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setUser(formatUserData(users[newIndex]));
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      {/* Sidebar */}
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
          href="/admin/dashboard"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">home</span>
          <span className="flex-grow text-center">Home</span>
        </a>

        <a
          href="/admin/dashboard/VerifyUsers"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            group_add
          </span>
          <span className="flex-grow text-center">Verify Users</span>
        </a>

        <a
          href="/admin/dashboard/VerifyComps"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            apartment
          </span>
          <span className="flex-grow text-center">Verify Company</span>
        </a>

        <a
          href="/admin/dashboard/ViewUsers"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">group</span>
          <span className="flex-grow text-center">View All Users</span>
        </a>

        <a
          href="/admin/dashboard/ViewCompany"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            source_environment
          </span>
          <span className="flex-grow text-center">View All Companies</span>
        </a>

        <a
          href="/admin/dashboard/ViewJobs"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">work</span>
          <span className="flex-grow text-center">View All Job Listings</span>
        </a>

        <button
          className="bg-red-600 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out mt-6"
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
        <div className="flex justify-between items-center">
          <button
            onClick={handleGoBack}
            className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
          >
            Back
          </button>
        </div>
        <div className="mt-4">
          {user ? (
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
                    className="w-15 h-15 rounded-full border-2 border-gray-300"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left text-gray-800 w-full">
                  <div>
                    <p className="font-semibold text-base sm:text-lg">
                      Full Name:
                    </p>
                    <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                      {user.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-base sm:text-lg">
                      PWD ID:
                    </p>
                    <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                      {user.pwdId}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-base sm:text-lg">
                      Disability:
                    </p>
                    <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                      {user.disability}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-base sm:text-lg">
                      Address:
                    </p>
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
                    <p className="font-semibold text-base sm:text-lg">
                      Birthdate:
                    </p>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left text-gray-800 w-full mt-6">
                  <div>
                    <p className="font-semibold text-base sm:text-lg">
                      Picture with ID:
                    </p>
                    <img
                      src={user.pictureWithId}
                      alt="Picture with ID"
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-base sm:text-lg">
                      Picture of PWD ID:
                    </p>
                    <img
                      src={user.pictureOfPwdId}
                      alt="Picture of PWD ID"
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center mt-4 sm:mt-8 space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    className="transition-all bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow flex items-center justify-center"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0} // Disable when at the first user
                  >
                    Previous
                  </button>
                  <button
                    className="transition-all bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 shadow"
                    onClick={handleApprove}
                  >
                    Approve
                  </button>
                  <button
                    className="transition-all bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 shadow"
                    onClick={handleDecline}
                  >
                    Decline
                  </button>
                  <button
                    className="transition-all bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 shadow flex items-center justify-center"
                    onClick={handleNext}
                    disabled={currentIndex === users.length - 1} // Disable when at the last user
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-full w-full bg-blue-500 p-4 sm:p-6 md:p-8 rounded-2xl">
              <div className="w-full max-w-4xl h-full bg-white p-8 rounded-lg shadow-xl flex justify-center items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  There's no user to verify yet.
                </h2>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminVerifyUsers;
