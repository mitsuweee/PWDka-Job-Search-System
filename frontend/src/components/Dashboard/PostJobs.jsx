import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const PostJob = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [jobDetails, setJobDetails] = useState({
    companyName: "",
    positionName: "",
    jobDescription: "",
    requirements: "",
    qualifications: "",
    minSalary: "",
    maxSalary: "",
    positionType: "full-time",
    disabilityCategories: [],
    salaryVisibility: "HIDE", // Default to "HIDE"
    level: "",
  });
  const [showDisabilityOptions, setShowDisabilityOptions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [isSuccessCardVisible, setIsSuccessCardVisible] = useState(false);
  const [showSalaryDetails, setShowSalaryDetails] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    setIsModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("Id");
    localStorage.removeItem("Role");
    localStorage.removeItem("Token");
    window.location.href = "/login";
  };

  // Function to check company status
  const checkCompanyStatus = async (companyId) => {
    try {
      const response = await axios.get(
        `/company/view/verify/status/${companyId}`
      );
      if (
        response.data.successful &&
        response.data.message === "Company is Deactivated"
      ) {
        toast.error("Your company account has been deactivated. Logging out.", {
          duration: 5000, // Display the toast for 5 seconds
        });

        // Wait for the toast to finish before logging out
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 5000); // Wait for 5 seconds (the toast duration)
      }
    } catch (error) {
      console.error("Error checking company status:", error);
    }
  };

  // Fetch company data and check company status
  useEffect(() => {
    const companyId = localStorage.getItem("Id");
    if (companyId) {
      const fetchCompanyData = async () => {
        try {
          // Fetch company name
          const companyResponse = await axios.get(`/company/view/${companyId}`);
          if (companyResponse.data.successful) {
            setCompanyName(companyResponse.data.data.name);
          } else {
            console.error(
              "Error fetching company name:",
              companyResponse.data.message
            );
          }

          // Check company status (whether it's deactivated or not)
          checkCompanyStatus(companyId);
        } catch (error) {
          console.error("Error fetching company data:", error);
        }
      };

      fetchCompanyData();
    } else {
      console.error("Company ID is not available in session storage");
    }

    // Set an interval to check company status every 5 seconds
    const interval = setInterval(() => {
      if (companyId) {
        checkCompanyStatus(companyId);
      }
    }, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures this only runs on mount

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation for minimum salary
    if (parseFloat(jobDetails.minSalary) < 12900) {
      toast.error("Minimum Salary must be at least ₱12900.");
      return;
    }

    if (parseFloat(jobDetails.maxSalary) < parseFloat(jobDetails.minSalary)) {
      toast.error(
        "Maximum Salary must be equal or greater than Minimum Salary."
      );
      return;
    }

    setIsSubmitModalOpen(true);
  };

  const confirmSubmit = () => {
    setIsSubmitModalOpen(false);
    setIsLoading(true);

    const data = JSON.stringify({
      company_id: parseFloat(localStorage.getItem("Id")),
      position_name: jobDetails.positionName,
      description: jobDetails.jobDescription,
      requirement: jobDetails.requirements,
      qualification: jobDetails.qualifications,
      minimum_salary: parseFloat(jobDetails.minSalary),
      maximum_salary: parseFloat(jobDetails.maxSalary),
      positiontype_id: jobDetails.positionType,
      disability_ids: jobDetails.disabilityCategories,
      salary_visibility: jobDetails.salaryVisibility,
      level: jobDetails.level,
    });

    const config = {
      method: "post",
      url: "/joblisting/post/job",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(() => {
        setIsLoading(false);
        setIsSuccessCardVisible(true);
        toast.success("Job posted successfully!");
      })
      .catch((error) => {
        setIsLoading(false);
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      });
  };

  const handleSalaryVisibilityChange = (e) => {
    setJobDetails({ ...jobDetails, salaryVisibility: e.target.value });
  };

  const resetForm = () => {
    setJobDetails({
      companyName: "",
      positionName: "",
      jobDescription: "",
      requirements: "",
      qualifications: "",
      minSalary: "",
      maxSalary: "",
      positionType: "full-time",
      disabilityCategories: [],
      salaryVisibility: "HIDE", // Reset to default
      level: "",
    });
    setShowDisabilityOptions(false);
    setIsSuccessCardVisible(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobDetails({ ...jobDetails, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setJobDetails((prevDetails) => ({
        ...prevDetails,
        disabilityCategories: [...prevDetails.disabilityCategories, value],
      }));
    } else {
      setJobDetails((prevDetails) => ({
        ...prevDetails,
        disabilityCategories: prevDetails.disabilityCategories.filter(
          (category) => category !== value
        ),
      }));
    }
  };
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
    setJobDetails((prevDetails) => ({
      ...prevDetails,
      disabilityCategories:
        prevDetails.disabilityCategories.length === disabilityCategories.length
          ? []
          : disabilityCategories,
    }));
  };

  const toggleDisabilityOptions = () => {
    setShowDisabilityOptions(!showDisabilityOptions);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-100">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Loader */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="text-white text-2xl">Submitting...</div>
        </div>
      )}

      <button
        className={`md:hidden bg-custom-blue text-white p-4 fixed top-4 left-4 z-50 rounded-xl mt-11 transition-transform ${
          isSidebarOpen ? "hidden" : ""
        }`}
        onClick={() => setIsSidebarOpen(true)}
      >
        &#9776;
      </button>

      {/* Sidebar */}
      <aside
        className={`bg-custom-blue w-full md:w-[300px] lg:w-[250px] p-4 flex flex-col items-center md:relative fixed top-0 left-0 min-h-screen h-full transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-50 md:z-auto`}
      >
        <button
          className="text-white md:hidden self-end text-3xl"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Welcome, {companyName || "Company"}!
        </h2>

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

      {/* Main Content */}
      <main className="flex-grow p-8 bg-custom-bg">
        {isSuccessCardVisible ? (
          <div className="max-w-4xl mx-auto mb-10 mt-10 p-10 bg-white rounded-xl shadow-lg space-y-8 transform transition-all hover:shadow-2xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-custom-blue">
                JOB POSTED SUCCESSFULLY
              </h2>
              <p className="text-lg mt-4 text-gray-700">
                Your job post has been successfully submitted. Employers can now
                view your listing. You can post another job or manage your
                postings from your account.
              </p>
              <button
                className="mt-8 py-3 px-6 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
                onClick={resetForm}
              >
                Post Job Again
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-lg text-left max-w-4xl mx-auto grid grid-cols-1 gap-6 border border-gray-200"
          >
            <div className="col-span-1">
              <label className="block mb-2 text-gray-700 font-semibold">
                Position Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="positionName"
                value={jobDetails.positionName}
                onChange={handleChange}
                className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block mb-2 text-gray-700 font-semibold">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="jobDescription"
                value={jobDetails.jobDescription}
                onChange={handleChange}
                className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm h-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block mb-2 text-gray-700 font-semibold">
                Job Level <span className="text-red-500">*</span>
              </label>
              <select
                name="level"
                value={jobDetails.level}
                onChange={handleChange}
                className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Job Level</option>
                <option value="Entry-Level">Entry-Level</option>
                <option value="Associate">Associate</option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior-Level">Senior-Level</option>
                <option value="Lead">Lead</option>
                <option value="Managerial">Managerial</option>
                <option value="Director">Director</option>
                <option value="Executive">Executive</option>
                <option value="None">None</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block mb-2 text-gray-700 font-semibold">
                Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                name="requirements"
                value={jobDetails.requirements}
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
                    let value = jobDetails.requirements;
                    if (!value.endsWith(" | ")) {
                      value += " | ";
                    }
                    value += "\n";
                    handleChange({ target: { name: "requirements", value } });
                  }
                }}
                className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm h-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Requirement1 | Requirement2 | Requirement3 *Enter Every Requirement*"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block mb-2 text-gray-700 font-semibold">
                Qualifications <span className="text-red-500">*</span>
              </label>
              <textarea
                name="qualifications"
                value={jobDetails.qualifications}
                onChange={(e) => {
                  let value = e.target.value;
                  // If the last character is a slash, remove it
                  if (value.endsWith("|")) {
                    value = value.slice(0, -1);
                  }
                  handleChange({ target: { name: "qualifications", value } });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    let value = jobDetails.qualifications;
                    if (!value.endsWith("|")) {
                      value += "|";
                    }
                    value += "\n";
                    handleChange({ target: { name: "qualifications", value } });
                  }
                }}
                className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm h-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Qualification1 | Qualification2 | Qualification3 *Enter Every Qualification*"
                required
              />
            </div>

            <div className="col-span-1 grid grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-gray-700 font-semibold">
                  Min-Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="minSalary"
                  value={jobDetails.minSalary}
                  onChange={handleChange}
                  className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  step="1"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 font-semibold">
                  Max-Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maxSalary"
                  value={jobDetails.maxSalary}
                  onChange={handleChange}
                  className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  step="1"
                />
              </div>
            </div>

            {/* Salary Visibility Checkbox Group */}
            <div className="col-span-1">
              <label className="block mb-2 text-gray-700 font-semibold">
                Salary Visibility <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="salaryVisibility"
                    value="HIDE"
                    checked={jobDetails.salaryVisibility === "HIDE"}
                    onChange={handleSalaryVisibilityChange}
                    className="mr-2"
                  />
                  Hide
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="salaryVisibility"
                    value="SHOW"
                    checked={jobDetails.salaryVisibility === "SHOW"}
                    onChange={handleSalaryVisibilityChange}
                    className="mr-2"
                  />
                  Show
                </label>
              </div>
            </div>

            <div className="col-span-1">
              <label className="block mb-2 text-gray-700 font-semibold">
                Position Type <span className="text-red-500">*</span>
              </label>
              <select
                name="positionType"
                value={jobDetails.positionType}
                onChange={handleChange}
                className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
              </select>
            </div>

            <div className="col-span-1">
              <button
                type="button"
                onClick={toggleDisabilityOptions}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-700 transition"
              >
                {showDisabilityOptions
                  ? "Hide Disability Options"
                  : "Show Disability Options"}
              </button>
            </div>

            {/* {showDisabilityOptions && (
              <div className="col-span-1 bg-gray-100 p-4 rounded-lg shadow-md border border-gray-300">
                <label className="block mb-2 text-gray-700 font-bold">
                  Disability Categories
                </label>
                <div className="flex flex-col space-y-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="mb-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {jobDetails.disabilityCategories.length ===
                    disabilityCategories.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  {[
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
                  ].map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        value={category}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
            )} */}
            {showDisabilityOptions && (
              <div className="col-span-1 bg-white p-6 rounded-lg shadow-lg border border-gray-200 transition duration-200 ease-in-out">
                <label className="block mb-4 text-gray-800 text-lg font-semibold">
                  Disability Categories
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="mb-4 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 active:bg-blue-800 transition duration-200 ease-in-out transform hover:scale-105"
                >
                  {jobDetails.disabilityCategories.length ===
                  disabilityCategories.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
                <div className="grid grid-cols-1 gap-3">
                  {disabilityCategories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center space-x-3"
                    >
                      <div className="relative w-6 h-6">
                        <input
                          type="checkbox"
                          value={category}
                          checked={jobDetails.disabilityCategories.includes(
                            category
                          )}
                          onChange={handleCheckboxChange}
                          className="appearance-none w-6 h-6 border-2 border-gray-400 rounded-md transition duration-200 checked:bg-blue-600 checked:border-blue-600 focus:outline-none"
                        />
                        {/* Centered Checkmark Icon */}
                        {jobDetails.disabilityCategories.includes(category) && (
                          <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-gray-700 font-medium">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition"
            >
              Post Job
            </button>
          </form>
        )}
      </main>

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Confirm Job Posting
              </h2>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
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
                Are you sure you want to post this job? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Logout Confirmation
              </h2>
              <button
                onClick={closeModal}
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
                post or manage jobs.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
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

export default PostJob;
