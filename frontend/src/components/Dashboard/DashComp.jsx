import { useState } from "react";
const CompanyDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      // Redirect to the login route
      window.location.href = "/login";
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
    href="/dashboard/postjob"
    className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
    style={{
      boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
    }}
  >
    Post Job
  </a>
  <a
    href="/dashboard/ViewJobs"
    className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
    style={{
      boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
    }}
  >
    View All Job Listings
  </a>
  <a
    href="/view-applicants"
    className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out"
    style={{
      boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
    }}
  >
    View Applicants
  </a>

  <button
    className="bg-red-400 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out mt-6"
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
        <h1 className="text-3xl font-bold text-blue-900">Company Dashboard</h1>
        <div className="mt-0.5">
          {/* Render content based on the section */}
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
