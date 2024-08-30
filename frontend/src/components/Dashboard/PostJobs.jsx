import { useState } from "react";
import axios from "axios";

const PostJob = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [jobDetails, setJobDetails] = useState({
    companyName: "",
    positionName: "",
    jobDescription: "",
    qualifications: "",
    minSalary: "",
    maxSalary: "",
    positionType: "full-time",
    disabilityCategories: [],
  });
  const [showDisabilityOptions, setShowDisabilityOptions] = useState(false);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      // Clear session storage and redirect to login page
      sessionStorage.removeItem("Id");
      sessionStorage.removeItem("Role");
      window.location.href = "/login";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = JSON.stringify({
      company_id: sessionStorage.getItem("Id"),
      position_name: jobDetails.positionName.toLowerCase(),
      description: jobDetails.jobDescription,
      qualification: jobDetails.qualifications,
      minimum_salary: jobDetails.minSalary,
      maximum_salary: jobDetails.maxSalary,
      positiontype_id: jobDetails.positionType,
      disability_ids: jobDetails.disabilityCategories,
    });

    const config = {
      method: "post",
      url: "http://localhost:8080/joblisting/post/job",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then((response) => {
        console.log(response.data);
        alert("Job posted successfully!");
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log(error.response?.data);
        alert(errorMessage);
      });
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
        <a
          href="/company/viewapplicants"
          className="bg-gray-200 text-blue-900 rounded-xl py-2 px-4 mb-4 w-full shadow-md hover:shadow-xl hover:translate-y-1 hover:bg-gray-300 transition-all duration-200 ease-in-out flex items-center"
          style={{
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.4)", // Blue-ish shadow
          }}
        >
          <span className="material-symbols-outlined text-xl mr-4">people</span>
          <span className="flex-grow text-center">View Applicants</span>
        </a>

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
      <main className="flex-grow p-8 bg-custom-bg">
        <h1 className="text-3xl font-bold text-blue-900">Post a Job</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-blue-500 p-6 rounded-xl shadow-xl text-center"
        >
          <div className="mb-4 text-left">
            <label className="block mb-2 text-white">Position Name</label>
            <input
              type="text"
              name="positionName"
              value={jobDetails.positionName}
              onChange={handleChange}
              className="p-2 w-full rounded shadow-lg"
              style={{
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              }}
              required
            />
          </div>
          <div className="mb-4 text-left">
            <label className="block mb-2 text-white">Job Description</label>
            <textarea
              name="jobDescription"
              value={jobDetails.jobDescription}
              onChange={handleChange}
              className="p-2 w-full rounded shadow-lg"
              style={{
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              }}
              required
            />
          </div>
          <div className="mb-4 text-left">
            <label className="block mb-2 text-white">Qualifications</label>
            <textarea
              name="qualifications"
              value={jobDetails.qualifications}
              onChange={handleChange}
              className="p-2 w-full rounded shadow-lg"
              style={{
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              }}
              required
            />
          </div>
          <div className="flex mb-4 space-x-4">
            <div className="text-left w-1/2">
              <label className="block mb-2 text-white">Min-Salary</label>
              <input
                type="text"
                name="minSalary"
                value={jobDetails.minSalary}
                onChange={handleChange}
                className="p-2 w-full rounded shadow-lg"
                style={{
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                }}
                required
              />
            </div>
            <div className="text-left w-1/2">
              <label className="block mb-2 text-white">Max-Salary</label>
              <input
                type="text"
                name="maxSalary"
                value={jobDetails.maxSalary}
                onChange={handleChange}
                className="p-2 w-full rounded shadow-lg"
                style={{
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                }}
                required
              />
            </div>
          </div>
          <div className="mb-4 text-left">
            <label className="block mb-2 text-white">Position Type</label>
            <select
              name="positionType"
              value={jobDetails.positionType}
              onChange={handleChange}
              className="p-2 w-full rounded shadow-lg"
              style={{
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              }}
              required
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
            </select>
          </div>

          <div className="mb-4 text-left">
            <button
              type="button"
              onClick={toggleDisabilityOptions}
              className="bg-green-500 text-white px-4 py-2 rounded shadow-lg"
            >
              {showDisabilityOptions
                ? "Hide Disability Options"
                : "Show Disability Options"}
            </button>
          </div>

          {showDisabilityOptions && (
            <div className="mb-4 text-left bg-gray-200 p-4 rounded-lg shadow-lg">
              <label className="block mb-2 text-black font-bold">
                Disability Categories
              </label>
              <div className="flex flex-col space-y-2 text-black">
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
            className="cursor-pointer transition-all bg-green-500 text-white px-6 py-2 rounded-lg
                        border-green-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px]
                        hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
          >
            Post Job
          </button>
        </form>
      </main>
    </div>
  );
};

export default PostJob;
