import { useState } from "react";
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
  });
  const [showDisabilityOptions, setShowDisabilityOptions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Logout modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false); // Submit confirmation modal
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [isSuccessCardVisible, setIsSuccessCardVisible] = useState(false); // Success card visibility
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

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (parseFloat(jobDetails.maxSalary) < parseFloat(jobDetails.minSalary)) {
      toast.error(
        "Maximum Salary must be equal or greater than Minimum Salary"
      );
      return;
    }

    setIsSubmitModalOpen(true); // Open the submit confirmation modal
  };

  const confirmSubmit = () => {
    setIsSubmitModalOpen(false);
    setIsLoading(true); // Show loader

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
        setIsLoading(false); // Hide loader
        setIsSuccessCardVisible(true); // Show success card
        toast.success("Job posted successfully!");
      })
      .catch((error) => {
        setIsLoading(false); // Hide loader
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      });
  };

  const toggleSalaryDetails = () => {
    setShowSalaryDetails(!showSalaryDetails);
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
    });
    setShowDisabilityOptions(false);
    setIsSuccessCardVisible(false); // Show form again
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
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
        >
          <span className="material-symbols-outlined text-xl mr-4">work</span>
          <span className="flex-grow text-center">Post Job</span>
        </a>
        <a
          href="/dashboard/ViewJobs"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
        >
          <span className="material-symbols-outlined text-xl mr-4">list</span>
          <span className="flex-grow text-center">View All Job Listings</span>
        </a>

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
                Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                name="requirements"
                value={jobDetails.requirements}
                onChange={handleChange}
                className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm h-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Requirement1/ Requirement2/ Requirement3"
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
                onChange={handleChange}
                className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm h-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Qualification1/ Qualification2/ Qualification3"
                required
              />
            </div>

            <div className="col-span-1 grid grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-gray-700 font-semibold">
                  Min-Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="minSalary"
                  value={jobDetails.minSalary}
                  onChange={handleChange}
                  className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 font-semibold">
                  Max-Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="maxSalary"
                  value={jobDetails.maxSalary}
                  onChange={handleChange}
                  className="p-3 w-full border-2 border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
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

            {showDisabilityOptions && (
              <div className="col-span-1 bg-gray-100 p-4 rounded-lg shadow-md border border-gray-300">
                <label className="block mb-2 text-gray-700 font-bold">
                  Disability Categories
                </label>
                <div className="flex flex-col space-y-2">
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
