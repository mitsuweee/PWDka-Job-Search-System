import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ViewJobs = () => {
  const [jobListings, setJobListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [job, setJob] = useState(null);
  const [jobUpdate, setJobUpdate] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobListings, setFilteredJobListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDisabilityOptions, setShowDisabilityOptions] = useState(false);
  const [selectedDisabilityCategories, setSelectedDisabilityCategories] =
    useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const companyId = localStorage.getItem("Id");
    const config = {
      method: "get",
      url: `/joblisting/view/newesttooldest/company/${companyId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    setIsLoading(true);
    axios(config)
      .then((response) => {
        const jobDataArray = response.data.data;
        setJobListings(jobDataArray);
        setFilteredJobListings(jobDataArray);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error loading jobs.");
        setLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleViewJob = (jobId) => {
    const config = {
      method: "get",
      url: `/joblisting/view/${jobId}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    setIsLoading(true);
    axios(config)
      .then((response) => {
        const jobData = response.data.data[0];
        setJob(jobData);
        setIsModalOpen(true);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error fetching job details.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // const handleUpdateJob = (jobData) => {
  //   setJobUpdate({
  //     id: jobData.id,
  //     jobName: jobData.position_name,
  //     description: jobData.description,
  //     requirements: jobData.requirement,
  //     qualification: jobData.qualification,
  //     minimumSalary: jobData.minimum_salary,
  //     maximumSalary: jobData.maximum_salary,
  //     salaryVisibility: jobData.salary_visibility || "HIDE",
  //     level: jobData.level,
  //     status: jobData.status || "ACTIVE",
  //     positionType: jobData.positiontype_id === 1 ? "fulltime" : "parttime",
  //     disabilityCategories: jobData.disability_ids || [], // Set an empty array if undefined
  //   });

  //   // Make sure to initialize selectedDisabilityCategories as an array
  //   setSelectedDisabilityCategories(jobData.disability_types || []);

  //   setIsUpdateModalOpen(true);
  // };

  const disabilityCategories = [
    "Visual Disability",
    "Deaf or Hard of Hearing",
    "Learning Disability",
    "Mental Disability",
    "Physical Disability (Orthopedic)",
    "Psychosocial Disability",
    "Speech and Language Impairment",
    "Intellectual Disability",
    "Cancer (RA11215)",
    "Rare Disease (RA10747)",
  ];

  const handleSelectAll = () => {
    setSelectedDisabilityCategories((prevSelected) =>
      prevSelected.length === disabilityCategories.length
        ? []
        : disabilityCategories.map((category) => normalizeText(category))
    );
  };

  const normalizeText = (text) => text.toLowerCase().trim();

  const handleUpdateJob = (jobData) => {
    setJobUpdate({
      id: jobData.id,
      jobName: jobData.position_name,
      description: jobData.description,
      requirements: jobData.requirement,
      qualification: jobData.qualification,
      minimumSalary: jobData.minimum_salary,
      maximumSalary: jobData.maximum_salary,
      salaryVisibility: jobData.salary_visibility || "HIDE",
      level: jobData.level,
      status: jobData.status || "ACTIVE",
      positionType: jobData.positiontype_id === 1 ? "fulltime" : "parttime",
      disabilityCategories: jobData.disability_types
        ? jobData.disability_types.split(",").map((item) => item.trim()) // Split and trim each item
        : [],
    });

    setSelectedDisabilityCategories(
      jobData.disability_types
        ? jobData.disability_types.split(",").map((item) => normalizeText(item))
        : []
    );

    setIsUpdateModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobUpdate((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    const config = {
      method: "put",
      url: `/joblisting/update/${jobUpdate.id}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        position_name: jobUpdate.jobName,
        description: jobUpdate.description,
        qualification: jobUpdate.qualification,
        requirement: jobUpdate.requirements,
        minimum_salary: jobUpdate.minimumSalary,
        maximum_salary: jobUpdate.maximumSalary,
        salary_visibility: jobUpdate.salaryVisibility,
        level: jobUpdate.level,
        status: jobUpdate.status,
        positiontype_id:
          jobUpdate.positionType === "fulltime"
            ? 1
            : jobUpdate.positionType === "parttime"
            ? 2
            : null,
        disability_ids: selectedDisabilityCategories,
      },
    };

    setIsLoading(true);
    axios(config)
      .then(() => {
        toast.success("Job updated successfully!");
        setIsUpdateModalOpen(false);
        window.location.reload();
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error updating job.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDeleteJobListing = (id) => {
    setSelectedJobId(id);
    setIsDeleteModalOpen(true);
  };

  const handleCheckboxChange = (e) => {
    const normalizedValue = normalizeText(e.target.value);
    const { checked } = e.target;

    if (checked) {
      setSelectedDisabilityCategories((prev) => [...prev, normalizedValue]);
    } else {
      setSelectedDisabilityCategories((prev) =>
        prev.filter((category) => category !== normalizedValue)
      );
    }
  };

  const confirmDelete = () => {
    if (selectedJobId) {
      const config = {
        method: "delete",
        url: `/joblisting/delete/${selectedJobId}`,
        headers: {
          "Content-Type": "application/json",
        },
      };

      setIsLoading(true);
      axios(config)
        .then(() => {
          toast.success("Job listing deleted successfully!");
          setJobListings((prevListings) =>
            prevListings.filter((job) => job.id !== selectedJobId)
          );
          setFilteredJobListings((prevListings) =>
            prevListings.filter((job) => job.id !== selectedJobId)
          );
        })
        .catch(() => {
          toast.error("An error occurred while deleting the job listing.");
        })
        .finally(() => {
          setIsLoading(false);
        });

      setIsDeleteModalOpen(false);
      setSelectedJobId(null);
    }
  };
  const toggleDisabilityOptions = () => {
    setShowDisabilityOptions(!showDisabilityOptions);
  };

  const confirmLogout = () => {
    localStorage.removeItem("Id");
    localStorage.removeItem("Role");
    localStorage.removeItem("Token");
    window.location.href = "/login";
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setJob(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedJobId(null);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setJobUpdate({});
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filteredJobs = jobListings.filter((job) =>
      job.position_name.toLowerCase().includes(searchValue)
    );
    setFilteredJobListings(filteredJobs);
  };

  const handleViewApplicants = (jobId) => {
    navigate(`/company/viewapplicants?id=${jobId}`);
  };

  if (loading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      <Toaster position="top-center" reverseOrder={false} />{" "}
      {/* Toast notifications */}
      {/* Loader */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
        </div>
      )}
      {/* Sidebar */}
      <aside
        className={`bg-custom-blue w-full md:w-[300px] lg:w-[250px] p-4 flex flex-col items-center md:relative fixed top-0 left-0 min-h-screen h-full transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-50 md:z-auto`}
      >
        {/* Logo Section */}
        <div className="w-full flex justify-center items-center mb-6 p-2 bg-white rounded-lg">
          <img
            src="/imgs/LOGO PWDKA.png" // Replace with the actual path to your logo
            alt="Logo"
            className="w-26 h-19 object-contain"
          />
        </div>

        {/* Close Button for Mobile */}
        <button
          className="text-white md:hidden self-end text-3xl"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>

        {/* Dashboard Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Dashboard
        </h2>
        <hr className="border-gray-400 w-full mb-4" />
        <a
          href="/dashc"
          className={`${
            window.location.pathname === "/dashc"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">
            dashboard
          </span>
          <span className="flex-grow text-center">Dashboard</span>
        </a>

        {/* Job Management Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Job Management
        </h2>
        <hr className="border-gray-400 w-full mb-4" />

        <a
          href="/dashboard/postjob"
          className={`${
            window.location.pathname === "/dashboard/postjob"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">work</span>
          <span className="flex-grow text-center">Post Job</span>
        </a>

        <a
          href="/dashboard/ViewJobs"
          className={`${
            window.location.pathname === "/dashboard/ViewJobs"
              ? "bg-blue-900 text-gray-200"
              : "bg-gray-200 text-blue-900"
          } rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center`}
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)",
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">list</span>
          <span className="flex-grow text-center">View All Job Listings</span>
        </a>

        {/* Account Section */}
        <h2 className="text-white text-lg font-semibold mb-2 mt-4 w-full text-left">
          Account
        </h2>
        <hr className="border-gray-400 w-full mb-4" />

        {/* Logout Button */}
        <button
          className="bg-red-600 text-white rounded-xl py-2 px-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-red-500 transition-all duration-200 ease-in-out mt-6 flex items-center justify-center"
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
      <main className="flex-grow p-4 md:p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-white px-4 py-2 mb-6 rounded-lg shadow-lg hover:bg-blue-600 transition"
        >
          ← Back
        </button>

        <h1 className="text-xl font-bold text-gray-700 text-center md:text-left">
          View All Job Listings
        </h1>

        <div className="flex justify-center my-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search job listings..."
            className="p-2 border-2 border-blue-300 rounded-lg w-full md:w-1/2"
          />
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="table-auto w-full bg-white mt-4 rounded-xl shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-600 text-white text-left text-xs md:text-sm uppercase tracking-wider">
                <th className="py-4 px-2 md:px-4 font-semibold">Job Title</th>
                <th className="py-4 px-2 md:px-4 font-semibold">
                  Position Type
                </th>
                <th className="py-4 px-2 md:px-4 font-semibold">
                  Salary Range
                </th>
                <th className="py-4 px-2 md:px-4 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredJobListings.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition duration-300"
                >
                  <td className="py-4 px-2 md:px-4 text-gray-800 text-xs md:text-sm break-words">
                    {job.position_name
                      ? job.position_name
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")
                      : ""}
                  </td>
                  <td className="py-4 px-2 md:px-4 text-gray-800 text-xs md:text-sm">
                    {job.position_type || "N/A"}
                  </td>
                  <td className="py-4 px-2 md:px-4 text-gray-800 text-xs md:text-sm">
                    {job.minimum_salary && job.maximum_salary
                      ? `₱${job.minimum_salary} - ₱${job.maximum_salary}`
                      : "Not specified"}
                  </td>
                  <td className="py-4 px-2 md:px-4 text-center">
                    <div className="flex justify-center items-center space-x-1 md:space-x-2">
                      <button
                        onClick={() => handleViewJob(job.id)}
                        className="bg-blue-500 text-white flex items-center px-1 md:px-2 py-1 rounded-full shadow-sm hover:bg-blue-700 transition duration-200"
                      >
                        <span className="material-symbols-outlined text-sm md:text-base">
                          visibility
                        </span>
                        <span className="ml-1 hidden md:inline text-xs md:text-sm">
                          View
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteJobListing(job.id)}
                        className="bg-red-500 text-white flex items-center px-1 md:px-2 py-1 rounded-full shadow-sm hover:bg-red-700 transition duration-200"
                      >
                        <span className="material-symbols-outlined text-sm md:text-base">
                          delete
                        </span>
                        <span className="ml-1 hidden md:inline text-xs md:text-sm">
                          Delete
                        </span>
                      </button>
                      <button
                        onClick={() => handleUpdateJob(job)}
                        className="bg-yellow-500 text-white flex items-center px-1 md:px-2 py-1 rounded-full shadow-sm hover:bg-yellow-700 transition duration-200"
                      >
                        <span className="material-symbols-outlined text-sm md:text-base">
                          edit
                        </span>
                        <span className="ml-1 hidden md:inline text-xs md:text-sm">
                          Edit
                        </span>
                      </button>
                      <button
                        onClick={() => handleViewApplicants(job.id)}
                        className="bg-green-500 text-white flex items-center px-1 md:px-2 py-1 rounded-full shadow-sm hover:bg-green-700 transition duration-200"
                      >
                        <span className="material-symbols-outlined text-sm md:text-base">
                          group_add
                        </span>
                        <span className="ml-1 hidden md:inline text-xs md:text-sm">
                          Applicants
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      {/* Modal for viewing job details */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-xl mx-4 max-h-[90vh] overflow-y-auto transition-transform transform scale-100">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                <span className="material-symbols-outlined mr-2">work</span>
                Job Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition duration-200"
              >
                <span className="material-symbols-outlined text-2xl">
                  close
                </span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    business
                  </span>{" "}
                  Company Name:
                </p>
                <p className="text-gray-600 mt-2">
                  {job?.company_name
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">title</span>{" "}
                  Job Title:
                </p>
                <p className="text-gray-600 mt-2">
                  {job?.position_name
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">radar</span>{" "}
                  Job Level:
                </p>
                <p className="text-gray-600 mt-2">
                  {job?.level
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    description
                  </span>{" "}
                  Description:
                </p>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner">
                  {job?.description
                    ? job.description
                        .split(".") // Split by periods to find each sentence
                        .map(
                          (sentence) =>
                            sentence.trim().charAt(0).toUpperCase() +
                            sentence.trim().slice(1).toLowerCase()
                        )
                        .join(". ") // Join back with ". " to form a paragraph
                    : ""}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">build</span>{" "}
                  Requirements:
                </p>
                <ul className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner list-disc pl-4">
                  {job?.requirement
                    ? job.requirement
                        .split("|")
                        .map((part, index) => (
                          <li key={index}>
                            {part.trim().charAt(0).toUpperCase() +
                              part.trim().slice(1).toLowerCase()}
                          </li>
                        ))
                    : null}
                </ul>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">school</span>{" "}
                  Qualification:
                </p>
                <ul className="text-gray-600 mt-2 text-sm leading-relaxed bg-gray-100 p-4 rounded-lg shadow-inner list-disc pl-4">
                  {job?.qualification
                    ? job.qualification
                        .split("|")
                        .map((part, index) => (
                          <li key={index}>
                            {part.trim().charAt(0).toUpperCase() +
                              part.trim().slice(1).toLowerCase()}
                          </li>
                        ))
                    : null}
                </ul>
              </div>

              <div className="flex justify-between bg-gray-100 p-4 rounded-lg shadow-inner">
                <span className="text-black font-semibold flex items-center">
                  Min Salary:
                  <span className="text-gray-600 ml-2">
                    ₱ {job?.minimum_salary}
                  </span>
                </span>
                <span className="text-black font-semibold flex items-center">
                  Max Salary:
                  <span className="text-gray-600 ml-2">
                    ₱ {job?.maximum_salary}
                  </span>
                </span>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    work_outline
                  </span>{" "}
                  Position Type:
                </p>
                <p className="text-gray-600 mt-2">
                  {job?.position_type
                    ? job.position_type
                        .split("-")
                        .map(
                          (part) =>
                            part.trim().charAt(0).toUpperCase() +
                            part.trim().slice(1).toLowerCase()
                        )
                        .join(" - ")
                    : ""}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    visibility
                  </span>{" "}
                  Salary Visibility:
                </p>
                <p className="text-gray-600 mt-2">
                  {job?.salary_visibility === "SHOW" ? "Visible" : "Hidden"}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-black font-semibold flex items-center">
                  <span className="material-symbols-outlined mr-1">
                    accessibility
                  </span>{" "}
                  Disability Categories:
                </p>
                <ul className="list-disc pl-5 text-gray-600 mt-2 text-sm">
                  {job?.disability_types
                    ? job.disability_types
                        .split(",")
                        .map((disability, index) => (
                          <li key={index}>{disability.trim()}</li>
                        ))
                    : "No disability categories specified."}
                </ul>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal for editing job details */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="relative max-w-5xl w-full mx-auto mb-6 mt-6 p-6 bg-white rounded-xl shadow-lg space-y-6 transform transition-all hover:shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 transition"
              onClick={closeUpdateModal}
            >
              <span className="text-2xl font-bold">&times;</span>
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-custom-blue">
                Update Job Details
              </h2>
              <form
                onSubmit={handleSubmitUpdate}
                className="bg-white p-4 rounded-xl shadow-lg text-left grid grid-cols-2 gap-6 border border-gray-200"
              >
                <div className="col-span-2">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Position Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jobName"
                    value={jobUpdate.jobName}
                    onChange={handleChange}
                    className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={jobUpdate.description}
                    onChange={handleChange}
                    className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm h-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                {/* Level */}
                <div className="col-span-1">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Level
                  </label>
                  <input
                    type="text"
                    name="level"
                    value={jobUpdate.level}
                    onChange={handleChange}
                    className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="requirements"
                    value={jobUpdate.requirements}
                    onChange={(e) => {
                      let value = e.target.value;
                      // If the last characters are " | ", remove them
                      if (value.endsWith(" | ")) {
                        value = value.slice(0, -3);
                      }
                      handleChange({ target: { name: "requirements", value } });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        let value = jobUpdate.requirements;
                        if (!value.endsWith(" | ")) {
                          value += " | ";
                        }
                        value += "\n";
                        handleChange({
                          target: { name: "requirements", value },
                        });
                      }
                    }}
                    className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm h-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Requirement1 | Requirement2 | Requirement3 *Enter Every Requirement*"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Qualifications <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="qualification"
                    value={jobUpdate.qualification}
                    onChange={(e) => {
                      let value = e.target.value;
                      // If the last character is a slash, remove it
                      if (value.endsWith(" | ")) {
                        value = value.slice(0, -1);
                      }
                      handleChange({
                        target: { name: "qualification", value },
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        let value = jobUpdate.qualification;
                        if (!value.endsWith(" | ")) {
                          value += " | ";
                        }
                        value += "\n";
                        handleChange({
                          target: { name: "qualification", value },
                        });
                      }
                    }}
                    className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm h-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Qualification1 | Qualification2 | Qualification3 *Enter Every Qualification*"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-1 text-gray-700 font-semibold">
                      Min-Salary <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="minimumSalary"
                      value={jobUpdate.minimumSalary}
                      onChange={handleChange}
                      className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-gray-700 font-semibold">
                      Max-Salary <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="maximumSalary"
                      value={jobUpdate.maximumSalary}
                      onChange={handleChange}
                      className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-1">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Salary Visibility <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="salaryVisibility"
                    value={jobUpdate.salaryVisibility}
                    onChange={handleChange}
                    className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="SHOW">Show</option>
                    <option value="HIDE">Hide</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Joblisting Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={jobUpdate.status}
                    onChange={handleChange}
                    className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block mb-1 text-gray-700 font-semibold">
                    Position Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="positionType"
                    value={jobUpdate.positionType}
                    onChange={handleChange}
                    className="p-2 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="">Select Position Type</option>
                    <option value="fulltime">Full-time</option>
                    <option value="parttime">Part-time</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={toggleDisabilityOptions}
                    className="bg-blue-600 text-white px-3 py-2 rounded shadow-lg hover:bg-blue-700 transition"
                  >
                    {showDisabilityOptions
                      ? "Hide Disability Options"
                      : "Show Disability Options"}
                  </button>
                </div>

                {showDisabilityOptions && (
                  <div className="col-span-2 bg-gray-100 p-3 rounded-lg shadow-md border border-gray-300">
                    <label className="block mb-1 text-gray-700 font-bold">
                      Disability Categories
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="mb-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {selectedDisabilityCategories.length ===
                      disabilityCategories.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    <div className="flex flex-wrap gap-4">
                      {[
                        "Deaf or Hard of Hearing",
                        "Intellectual Disability",
                        "Learning Disability",
                        "Mental Disability",
                        "Physical Disability (Orthopedic)",
                        "Psychosocial Disability",
                        "Speech and Language Impairment",
                        "Visual Disability",
                        "Cancer (RA11215)",
                        "Rare Disease (RA10747)",
                      ].map((category) => (
                        <label key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            value={category}
                            checked={selectedDisabilityCategories.includes(
                              normalizeText(category)
                            )}
                            onChange={handleCheckboxChange}
                            className="mr-2"
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-600 transition"
                  >
                    Update Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this job listing? This will also
              delete all job applications for this listing.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={closeDeleteModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Logout Confirmation
              </h2>
              <button
                onClick={closeLogoutModal}
                className="text-gray-500 hover:text-gray-800 transition duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-lg text-gray-600">
                Are you sure you want to logout? You will need to log back in to
                view and manage jobs.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={closeLogoutModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewJobs;
