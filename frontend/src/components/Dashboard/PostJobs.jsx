import { useState } from "react";
import axios from "axios";

const PostJob = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = JSON.stringify({
      company_id: sessionStorage.getItem("Id"),
      position_name: jobDetails.positionName.toLowerCase(),
      description: jobDetails.jobDescription,
      qualification: jobDetails.qualifications,
      minimum_salary: jobDetails.minSalary,
      maximum_salary: jobDetails.maxSalary,
      positiontype_id: jobDetails.positionType === "full-time" ? 1 : 2,
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
    <div>
      <h2 className="text-xl font-bold mb-1 text-custom-blue">Post a Job</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-blue-500 p-6 rounded-xl shadow-xl text-center "
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
    </div>
  );
};

export default PostJob;
