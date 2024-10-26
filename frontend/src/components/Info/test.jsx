import React from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  // import { useState, useEffect } from "react";
  // import axios from "axios";
  // import { useNavigate } from "react-router-dom";
  // import toast, { Toaster } from "react-hot-toast";

  // const JobListing = () => {
  //   const [jobs, setJobs] = useState([]);
  //   const [selectedJobId, setSelectedJobId] = useState(null);
  //   const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  //   const [isMoreInfoVisible, setIsMoreInfoVisible] = useState(false);
  //   const [searchTerm, setSearchTerm] = useState("");
  //   const [locationSearchTerm, setLocationSearchTerm] = useState(""); // For location search
  //   const [jobType, setJobType] = useState(""); // For full-time or part-time filter
  //   const [currentPage, setCurrentPage] = useState(1);
  //   const [sortOption, setSortOption] = useState("newest");
  //   const [isFilterOpen, setIsFilterOpen] = useState(false);
  //   const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  //   const [userFullName, setUserFullName] = useState("");
  //   const [isModalOpen, setIsModalOpen] = useState(false);
  //   const [userDisabilityType, setUserDisabilityType] = useState(null);
  //   const [isSpeaking, setIsSpeaking] = useState(false);
  //   const [currentJobSpeech, setCurrentJobSpeech] = useState(null);
  //   const [loading, setLoading] = useState(false);

  //   const jobsPerPage = 4;
  //   const navigate = useNavigate();

  //   const toSentenceCase = (str) => {
  //     if (!str) return "";
  //     return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  //   };

  //   useEffect(() => {
  //     const userId = localStorage.getItem("Id");

  //     const fetchUserFullName = () => {
  //       setLoading(true);
  //       axios
  //         .get(`/user/view/${userId}`)
  //         .then((response) => {
  //           const userData = response.data.data;
  //           setUserFullName(userData.first_name);
  //           const userDisabilityType = userData.type;
  //           setUserDisabilityType(userDisabilityType);
  //           setLoading(false);
  //         })
  //         .catch((error) => {
  //           const errorMessage =
  //             error.response?.data?.message || "An error occurred";
  //           toast.error(errorMessage);
  //           setLoading(false);
  //         });
  //     };

  //     const fetchJobs = (city, position_name, position_type) => {
  //       setLoading(true);
  //       const searchParams = {
  //         city: city || "",
  //         position_name: position_name || "",
  //         position_type: position_type || "",
  //       };

  //       const config = {
  //         method: "get",
  //         url: `/joblisting/view/newesttooldest/${userId}`,
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         data: searchParams,
  //       };

  //       axios(config)
  //         .then((response) => {
  //           const fetchedJobs = response.data.data.map((job) => ({
  //             id: job.id,
  //             jobName: job.position_name,
  //             address: job.company_address,
  //             positionType: job.position_type,
  //             salary: `${job.minimum_salary}-${job.maximum_salary}`,
  //             salaryVisibility: job.salary_visibility,
  //             description: job.description,
  //             requirements: job.requirement,
  //             qualifications: job.qualification,
  //             companyName: job.company_name,
  //             companyEmail: job.company_email,
  //             companyContact: job.company_contact_number,
  //             companyLocation: job.company_address,
  //             companyCity: job.company_city,
  //             companyDescription: job.company_description,
  //             companyImage: `data:image/png;base64,${job.company_profile_picture}`,
  //           }));

  //           setJobs(fetchedJobs);
  //           toast.success("Jobs fetched successfully");
  //           setLoading(false);
  //         })
  //         .catch((error) => {
  //           const errorMessage =
  //             error.response?.data?.message ||
  //             "An error occurred while fetching jobs";
  //           toast.error(errorMessage);
  //           setLoading(false);
  //         });
  //     };

  //     fetchUserFullName();
  //     fetchJobs();
  //   }, []);

  //   const playJobListingMessage = (job) => {
  //     const salaryMessage =
  //       job.salaryVisibility === "SHOW"
  //         ? `Salary: ${job.salary}.`
  //         : "Salary is hidden.";

  //     const jobDetails = `
  //       Company: ${job.companyName}.
  //       Job Title: ${job.jobName}.
  //       Job Description: ${job.description}.
  //       Location: ${job.companyLocation}.
  //       City: ${job.companyCity}.
  //       ${salaryMessage}
  //       Position Type: ${job.positionType}.
  //       Requirements: ${job.requirements}.
  //       Qualifications: ${job.qualifications}.
  //       Company Contact Number: ${job.companyContact}.
  //       Company Email: ${job.companyEmail}.
  //       If you are interested, click on APPLY NOW.
  //     `;

  //     if (userDisabilityType === "Deaf or Hard of Hearing") {
  //       alert(`Job Details:\n${jobDetails}`);
  //     } else {
  //       if (isSpeaking && currentJobSpeech) {
  //         window.speechSynthesis.cancel();
  //         setIsSpeaking(false);
  //       } else {
  //         const utterance = new SpeechSynthesisUtterance(jobDetails);
  //         window.speechSynthesis.speak(utterance);
  //         setIsSpeaking(true);
  //         setCurrentJobSpeech(utterance);

  //         utterance.onend = () => {
  //           setIsSpeaking(false);
  //           setCurrentJobSpeech(null);
  //         };
  //       }
  //     }
  //   };

  //   const handleToggleVoice = (job) => {
  //     if (!isVoiceEnabled) {
  //       playJobListingMessage(job);
  //     } else {
  //       window.speechSynthesis.cancel();
  //       setIsSpeaking(false);
  //     }
  //     setIsVoiceEnabled(!isVoiceEnabled);
  //   };

  //   const handleSearch = () => {};

  //   const filteredJobs = jobs
  //     .filter((job) => {
  //       const jobNameMatch = job.jobName
  //         .toLowerCase()
  //         .includes(searchTerm.toLowerCase());
  //       const cityMatch = job.companyCity
  //         .toLowerCase()
  //         .includes(locationSearchTerm.toLowerCase());
  //       const jobTypeMatch =
  //         jobType === "" ||
  //         job.positionType.toLowerCase() === jobType.toLowerCase();

  //       // Apply all three filters: job name, city, and job type
  //       return jobNameMatch && cityMatch && jobTypeMatch;
  //     })
  //     .sort((a, b) => {
  //       if (sortOption === "newest") {
  //         return b.id - a.id;
  //       } else if (sortOption === "oldest") {
  //         return a.id - b.id;
  //       } else if (sortOption === "a-z") {
  //         return a.jobName.localeCompare(b.jobName);
  //       }
  //       return 0;
  //     });

  //   const indexOfLastJob = currentPage * jobsPerPage;
  //   const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  //   const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  //   const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  //   const paginate = (pageNumber) => setCurrentPage(pageNumber);

  //   const selectedJob = jobs.find((job) => job.id === selectedJobId);

  //   const handleLogout = () => {
  //     setIsModalOpen(true);
  //   };

  //   const confirmLogout = () => {
  //     localStorage.removeItem("Id");
  //     localStorage.removeItem("Role");
  //     localStorage.removeItem("Token");
  //     navigate("/login");
  //   };

  //   const closeModal = () => {
  //     setIsModalOpen(false);
  //   };

  //   return (
  //     <div className="flex flex-col w-full h-full">
  //       <Toaster position="top-center" reverseOrder={false} />
  //       {loading && (
  //         <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
  //           <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
  //         </div>
  //       )}

  //       {/* Search and Filters Section */}
  //       <div
  //         className="w-full bg-cover bg-center py-4 lg:h-40 flex flex-col sm:flex-row justify-center items-center px-4"
  //         style={{
  //           backgroundImage: `url('/imgs/bg search.png')`,
  //           backgroundSize: "cover",
  //           backgroundPosition: "center",
  //           backgroundRepeat: "no-repeat",
  //         }}
  //       >
  //         <div className="w-full lg:w-2/3 mb-4 sm:mb-0 flex justify-center">
  //           <div className="flex w-full">
  //             {/* Main Job Search */}
  //             <input
  //               type="text"
  //               placeholder="Search Job Name"
  //               className="w-3/5 p-3 rounded-lg focus:outline-none focus:border-2 focus:border-blue-500 transition duration-200 text-lg mx-2"
  //               value={searchTerm}
  //               onChange={(e) => setSearchTerm(e.target.value)}
  //             />

  //             {/* Location Search */}
  //             <input
  //               type="text"
  //               placeholder="Location"
  //               className="w-1/4 p-3 focus:outline-none rounded-lg focus:border-2 focus:border-blue-500 transition duration-200 text-lg mx-2"
  //               value={locationSearchTerm}
  //               onChange={(e) => setLocationSearchTerm(e.target.value)}
  //             />

  //             {/* Job Type Dropdown */}
  //             <select
  //               className="w-1/4 p-3 focus:outline-none rounded-lg focus:border-2 focus:border-blue-500 transition duration-200 text-lg mx-2"
  //               value={jobType}
  //               onChange={(e) => setJobType(e.target.value)}
  //             >
  //               <option value="" className="text-gray-400">
  //                 All
  //               </option>
  //               <option value="full-time">Full-Time</option>
  //               <option value="part-time">Part-Time</option>
  //             </select>

  //             {/* Search Button */}
  //             <button
  //               className="p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center mx-2"
  //               onClick={handleSearch}
  //             >
  //               <span className="material-symbols-outlined text-2xl">search</span>
  //             </button>
  //           </div>
  //         </div>

  //         <div className="flex justify-center items-center space-x-2 ml-4">
  //           <div className="relative">
  //             <button
  //               className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-400 transition flex items-center"
  //               onClick={() => setIsFilterOpen(!isFilterOpen)}
  //             >
  //               <span className="material-symbols-outlined text-xl mr-2">
  //                 filter_alt
  //               </span>
  //               <span>Filter</span>
  //             </button>
  //             {isFilterOpen && (
  //               <div
  //                 className="absolute right-0 top-full mt-0 bg-white p-4 shadow-lg rounded-lg z-50"
  //                 onClick={(e) => e.stopPropagation()}
  //               >
  //                 <button
  //                   className={`py-2 px-4 rounded-lg w-full ${
  //                     sortOption === "newest"
  //                       ? "bg-blue-600 text-white"
  //                       : "bg-gray-200 text-blue-900"
  //                   }`}
  //                   onClick={() => setSortOption("newest")}
  //                 >
  //                   Newest
  //                 </button>
  //                 <button
  //                   className={`py-2 px-3 rounded-lg w-full my-2 ${
  //                     sortOption === "oldest"
  //                       ? "bg-blue-600 text-white"
  //                       : "bg-gray-200 text-blue-900"
  //                   }`}
  //                   onClick={() => setSortOption("oldest")}
  //                 >
  //                   Oldest
  //                 </button>
  //                 <button
  //                   className={`py-2 px-4 rounded-lg w-full ${
  //                     sortOption === "a-z"
  //                       ? "bg-blue-600 text-white"
  //                       : "bg-gray-200 text-blue-900"
  //                   }`}
  //                   onClick={() => setSortOption("a-z")}
  //                 >
  //                   A-Z
  //                 </button>
  //               </div>
  //             )}
  //           </div>

  //           <button
  //             onClick={handleLogout}
  //             className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition flex items-center"
  //           >
  //             <span className="material-symbols-outlined text-xl mr-2">
  //               logout
  //             </span>
  //             <span>Logout</span>
  //           </button>
  //         </div>
  //       </div>

  //       {/* Job Listings and Pagination */}
  //       <div className="flex flex-col lg:flex-row w-full h-full mt-6">
  //         <div className="lg:w-1/2 p-4 overflow-auto">
  //           <h1 className="text-3xl font-bold mb-6 text-blue-600">
  //             <span className="material-symbols-outlined text-2xl mr-2">
  //               work_update
  //             </span>
  //             Jobs for You,{" "}
  //             {userFullName.charAt(0).toUpperCase() + userFullName.slice(1)}
  //           </h1>

  //           <div className="space-y-4">
  //             {currentJobs.length > 0 ? (
  //               currentJobs.map((job) => (
  //                 <div key={job.id}>
  //                   <div
  //                     className="p-4 bg-blue-500 rounded-lg shadow-3xl cursor-pointer hover:bg-blue-600 transition transform hover:scale-95 flex items-center"
  //                     onClick={() => {
  //                       setSelectedJobId(job.id);
  //                       setIsDetailsVisible(true);
  //                       setIsMoreInfoVisible(false);
  //                     }}
  //                   >
  //                     <img
  //                       src={job.companyImage}
  //                       alt="Company Logo"
  //                       className="w-24 h-24 object-cover rounded-xl mr-4 shadow-xl"
  //                     />
  //                     <div>
  //                       <h2 className="text-xl font-bold text-white">
  //                         <span className="material-symbols-outlined mr-2">
  //                           work
  //                         </span>
  //                         {job.jobName
  //                           .split(" ")
  //                           .map(
  //                             (word) =>
  //                               word.charAt(0).toUpperCase() +
  //                               word.slice(1).toLowerCase()
  //                           )
  //                           .join(" ")}
  //                       </h2>
  //                       <p className="text-white">
  //                         <span className="material-symbols-outlined mr-2">
  //                           location_on
  //                         </span>
  //                         {job.companyLocation
  //                           .split(" ")
  //                           .map(
  //                             (word) =>
  //                               word.charAt(0).toUpperCase() +
  //                               word.slice(1).toLowerCase()
  //                           )
  //                           .join(" ")}
  //                       </p>

  //                       <p className="text-white">
  //                         <span className="material-symbols-outlined mr-2">
  //                           location_on
  //                         </span>
  //                         {job.companyCity
  //                           .split(" ")
  //                           .map(
  //                             (word) =>
  //                               word.charAt(0).toUpperCase() +
  //                               word.slice(1).toLowerCase()
  //                           )
  //                           .join(" ")}
  //                       </p>

  //                       <p className="font-semibold text-white">
  //                         <span className="material-symbols-outlined mr-2">
  //                           schedule
  //                         </span>
  //                         {toSentenceCase(job.positionType)}
  //                       </p>
  //                       {job.salaryVisibility === "SHOW" ? (
  //                         <p className="font-semibold text-white">
  //                           <span className="material-symbols-outlined mr-2">
  //                             payments
  //                           </span>
  //                           {job.salary}
  //                         </p>
  //                       ) : (
  //                         <p className="font-semibold text-white">
  //                           <span className="material-symbols-outlined mr-2">
  //                             payments
  //                           </span>
  //                           Salary: Hidden
  //                         </p>
  //                       )}
  //                       <p className="text-gray-200 mt-2">
  //                         {toSentenceCase(job.description)}
  //                       </p>
  //                     </div>
  //                     {userDisabilityType !== "Deaf or Hard of Hearing" && (
  //                       <button
  //                         onClick={() => handleToggleVoice(job)}
  //                         className={`ml-4 px-4 py-2 rounded-full transition-colors duration-200 ${
  //                           isVoiceEnabled && selectedJobId === job.id
  //                             ? "bg-blue-500 text-white"
  //                             : "bg-gray-300 text-black"
  //                         } hover:bg-blue-600`}
  //                       >
  //                         <span className="material-symbols-outlined text-2xl">
  //                           {isVoiceEnabled && selectedJobId === job.id
  //                             ? "volume_up"
  //                             : "volume_off"}
  //                         </span>
  //                       </button>
  //                     )}
  //                   </div>
  //                 </div>
  //               ))
  //             ) : (
  //               <div className="flex justify-center items-center h-64">
  //                 <p className="text-gray-600">
  //                   Currently, there are no job listings available. Please rest
  //                   assured, we are actively working to provide new opportunities
  //                   tailored to your unique skills and abilities. Stay
  //                   positive—your next opportunity is just around the corner!
  //                 </p>
  //               </div>
  //             )}
  //           </div>

  //           {/* Pagination */}
  //           <div className="flex justify-center mt-6">
  //             <ol className="flex justify-center gap-1 text-xs font-medium">
  //               <li>
  //                 <button
  //                   onClick={() => currentPage > 1 && paginate(currentPage - 1)}
  //                   className="inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900"
  //                   disabled={currentPage === 1}
  //                 >
  //                   <span className="sr-only">Prev Page</span>
  //                   <svg
  //                     xmlns="http://www.w3.org/2000/svg"
  //                     className="h-3 w-3"
  //                     viewBox="0 0 20 20"
  //                     fill="currentColor"
  //                   >
  //                     <path
  //                       fillRule="evenodd"
  //                       d="M12.707 5.293a1 1 010 1.414L9.414 10l3.293 3.293a1 1 01-1.414 1.414l-4-4a1 1 010-1.414l4-4a1 1 011.414 0z"
  //                       clipRule="evenodd"
  //                     />
  //                   </svg>
  //                 </button>
  //               </li>

  //               {Array.from({ length: totalPages }, (_, index) => (
  //                 <li key={index + 1}>
  //                   <button
  //                     onClick={() => paginate(index + 1)}
  //                     className={`block size-8 rounded border text-center leading-8 ${
  //                       currentPage === index + 1
  //                         ? "border-blue-600 bg-blue-600 text-white"
  //                         : "border-gray-100 bg-white text-gray-900"
  //                     }`}
  //                   >
  //                     {index + 1}
  //                   </button>
  //                 </li>
  //               ))}

  //               <li>
  //                 <button
  //                   onClick={() =>
  //                     currentPage < totalPages && paginate(currentPage + 1)
  //                   }
  //                   className="inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900"
  //                   disabled={currentPage === totalPages}
  //                 >
  //                   <span className="sr-only">Next Page</span>
  //                   <svg
  //                     xmlns="http://www.w3.org/2000/svg"
  //                     className="h-3 w-3"
  //                     viewBox="0 0 20 20"
  //                     fill="currentColor"
  //                   >
  //                     <path
  //                       fillRule="evenodd"
  //                       d="M7.293 14.707a1 1 010-1.414L10.586 10 7.293 6.707a1 1 011.414-1.414l4 4a1 1 010 1.414l-4-4a1 1 01-1.414 0z"
  //                       clipRule="evenodd"
  //                     />
  //                   </svg>
  //                 </button>
  //               </li>
  //             </ol>
  //           </div>
  //         </div>

  //         <div className={`lg:w-1/2 p-4 hidden lg:block relative`}>
  //           {selectedJob ? (
  //             <div key={selectedJob.id}>
  //               <div className="p-6 bg-white rounded-lg shadow-2xl relative">
  //                 <button
  //                   className="absolute -top-4 -right-4 bg-transparent border-2 border-gray-600 text-gray-600 text-2xl font-bold py-1 px-3 rounded-full shadow-lg hover:bg-gray-600 hover:text-white hover:shadow-2xl transition transform hover:scale-105"
  //                   onClick={() => {
  //                     if (isVoiceEnabled) {
  //                       handleToggleVoice(null);
  //                     }
  //                     setSelectedJobId(null);
  //                   }}
  //                 >
  //                   &times;
  //                 </button>
  //                 <h2 className="text-2xl font-semibold mb-4 text-blue-600">
  //                   {selectedJob.jobName
  //                     .split(" ")
  //                     .map(
  //                       (word) =>
  //                         word.charAt(0).toUpperCase() +
  //                         word.slice(1).toLowerCase()
  //                     )
  //                     .join(" ")}
  //                 </h2>

  //                 <p className="text-lg mb-2 text-gray-700 flex items-center">
  //                   <span className="material-symbols-outlined mr-2">work</span>
  //                   {selectedJob.companyName
  //                     .split(" ")
  //                     .map(
  //                       (word) =>
  //                         word.charAt(0).toUpperCase() +
  //                         word.slice(1).toLowerCase()
  //                     )
  //                     .join(" ")}
  //                 </p>

  //                 <p className="text-lg mb-4 text-gray-500 flex items-center">
  //                   <span className="material-symbols-outlined mr-2">
  //                     location_on
  //                   </span>
  //                   {selectedJob.companyLocation
  //                     .split(" ")
  //                     .map(
  //                       (word) =>
  //                         word.charAt(0).toUpperCase() +
  //                         word.slice(1).toLowerCase()
  //                     )
  //                     .join(" ")}
  //                 </p>

  //                 <p className="text-lg mb-2 text-gray-700 flex items-center">
  //                   <span className="material-symbols-outlined mr-2">
  //                     schedule
  //                   </span>
  //                   {toSentenceCase(selectedJob.positionType)}
  //                 </p>

  //                 {selectedJob.salaryVisibility === "SHOW" ? (
  //                   <p className="text-lg mb-4 text-gray-700 flex items-center">
  //                     <span className="material-symbols-outlined mr-2">
  //                       payments
  //                     </span>
  //                     {selectedJob.salary}
  //                   </p>
  //                 ) : (
  //                   <p className="text-lg mb-4 text-gray-700 flex items-center">
  //                     <span className="material-symbols-outlined mr-2">
  //                       payments
  //                     </span>
  //                     Salary: Hidden
  //                   </p>
  //                 )}

  //                 <p className="text-lg font-medium text-gray-800 mt-6">
  //                   Qualifications
  //                 </p>
  //                 <ul className="text-gray-700 list-disc pl-4">
  //                   {selectedJob.qualifications
  //                     .split("/")
  //                     .map((qualification, index) => (
  //                       <li key={index}>
  //                         {toSentenceCase(qualification.trim())}
  //                       </li>
  //                     ))}
  //                 </ul>
  //                 <p className="text-lg font-medium text-gray-800 mt-6">
  //                   Requirements
  //                 </p>
  //                 <ul className="text-gray-700 list-disc pl-4">
  //                   {selectedJob.requirements
  //                     .split("/")
  //                     .map((requirement, index) => (
  //                       <li key={index}>{toSentenceCase(requirement.trim())}</li>
  //                     ))}
  //                 </ul>

  //                 <div className="mt-6 flex space-x-4">
  //                   <a href={`/apply?id=${selectedJob.id}`}>
  //                     <button className="bg-blue-500 text-white py-3 px-6 rounded-full shadow-lg hover:bg-blue-600 hover:shadow-2xl transition transform hover:scale-105">
  //                       Apply now
  //                     </button>
  //                   </a>
  //                   <button
  //                     className="bg-transparent border-2 border-custom-blue text-custom-blue py-3 px-6 rounded-full shadow-lg hover:bg-custom-blue hover:text-white hover:shadow-2xl transition transform hover:scale-105"
  //                     onClick={() => setIsMoreInfoVisible(!isMoreInfoVisible)}
  //                   >
  //                     Learn more
  //                   </button>
  //                 </div>
  //               </div>

  //               {isMoreInfoVisible && (
  //                 <div className="mt-6 p-6 bg-white rounded-lg shadow-2xl relative">
  //                   <img
  //                     src={selectedJob.companyImage}
  //                     alt="Company"
  //                     className="w-20 h-20 object-cover rounded-full absolute top-6 right-6"
  //                   />
  //                   <h3 className="text-xl font-semibold text-custom-blue mb-4">
  //                     Company overview
  //                   </h3>
  //                   <p className="text-black">
  //                     <span className="font-medium">Company name:</span>{" "}
  //                     {selectedJob.companyName
  //                       .split(" ")
  //                       .map(
  //                         (word) =>
  //                           word.charAt(0).toUpperCase() +
  //                           word.slice(1).toLowerCase()
  //                       )
  //                       .join(" ")}
  //                   </p>

  //                   <p className="text-black">
  //                     <span className="font-medium">Email:</span>{" "}
  //                     {toSentenceCase(selectedJob.companyEmail)}
  //                   </p>
  //                   <p className="text-black">
  //                     <span className="font-medium">Contact number:</span>{" "}
  //                     {toSentenceCase(selectedJob.companyContact)}
  //                   </p>
  //                   <p className="text-black">
  //                     <span className="font-medium">Address:</span>{" "}
  //                     {selectedJob.companyLocation
  //                       .split(" ")
  //                       .map(
  //                         (word) =>
  //                           word.charAt(0).toUpperCase() +
  //                           word.slice(1).toLowerCase()
  //                       )
  //                       .join(" ")}
  //                   </p>
  //                   <p className="text-black">
  //                     <span className="font-medium">City:</span>{" "}
  //                     {selectedJob.companyCity
  //                       .split(" ")
  //                       .map(
  //                         (word) =>
  //                           word.charAt(0).toUpperCase() +
  //                           word.slice(1).toLowerCase()
  //                       )
  //                       .join(" ")}
  //                   </p>

  //                   <p className="text-black mt-4 text-sm leading-relaxed">
  //                     {selectedJob.companyDescription.charAt(0).toUpperCase() +
  //                       selectedJob.companyDescription.slice(1).toLowerCase()}
  //                   </p>
  //                 </div>
  //               )}
  //             </div>
  //           ) : (
  //             <div className="p-6 bg-white rounded-lg shadow-lg text-center">
  //               <p className="text-xl text-gray-600">
  //                 Select a job listing to view details
  //               </p>
  //             </div>
  //           )}
  //         </div>
  //       </div>

  //       {isModalOpen && (
  //         <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
  //           <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
  //             <div className="flex justify-between items-center border-b pb-3 mb-4">
  //               <h2 className="text-2xl font-semibold text-gray-800">
  //                 Logout Confirmation
  //               </h2>
  //               <button
  //                 onClick={closeModal}
  //                 className="text-gray-500 hover:text-gray-800 transition duration-200"
  //               >
  //                 <svg
  //                   xmlns="http://www.w3.org/2000/svg"
  //                   fill="none"
  //                   viewBox="0 0 24 24"
  //                   strokeWidth={2}
  //                   stroke="currentColor"
  //                   className="w-6 h-6"
  //                 >
  //                   <path
  //                     strokeLinecap="round"
  //                     strokeLinejoin="round"
  //                     d="M6 18L18 6M6 6l12 12"
  //                   />
  //                 </svg>
  //               </button>
  //             </div>

  //             <div className="mb-6">
  //               <p className="text-lg text-gray-600">
  //                 Are you sure you want to logout? You will need to log back in to
  //                 access the job listings.
  //               </p>
  //             </div>

  //             <div className="flex justify-end space-x-4">
  //               <button
  //                 onClick={closeModal}
  //                 className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
  //               >
  //                 Cancel
  //               </button>
  //               <button
  //                 onClick={confirmLogout}
  //                 className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
  //               >
  //                 Logout
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  // export default JobListing;

  containerStyle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0",
    fontFamily: "Arial, sans-serif",
    width: "100%",
    overflowX: "hidden",
  },

  sectionStyle: {
    width: "100%",
    marginTop: "0",
    marginRight: "auto",
    marginBottom: "12px",
    marginLeft: "auto",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    boxSizing: "border-box",
    flexDirection: "row",
  },

  textContainerStyle: {
    maxWidth: "50%",
    marginTop: "-10%",
    textAlign: "left",
    wordBreak: "break-word",
  },

  imageContainerStyle: {
    position: "relative",
    width: "45%",
  },

  imageStyle: {
    width: "100%",
    borderRadius: "80% 50% 80% 50%",
  },

  heading: {
    marginTop: "20px",
    fontSize: "3.5rem",
    fontWeight: "bold",
    fontFamily: "Raleway, sans-serif",
    color: "#007FFF",
  },

  Paragraph: {
    color: "black",
    marginTop: "20%",
    width: "auto",
  },

  buttonStyle: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#5a67d8",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  textParagraphStyle: {
    textAlign: "left",
    wordBreak: "break-word",
    marginTop: "20px",
  },

  //styles for  div2 named sectionStyle2
  sectionStyle2: {
    width: "100%",
    marginTop: "10%",
    marginRight: "auto",
    marginLeft: "auto",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    boxSizing: "border-box",
    flexDirection: "row",
  },

  textContainerStyle2: {
    display: "flex",
    marginBottom: "30%",
    flexDirection: "column",
    alignItems: "flex-start",
    maxWidth: "50%",
    textAlign: "left",
    wordBreak: "break-word",
    marginTop: "15%",
  },

  textParagraphStyle: {
    textAlign: "left",
    wordBreak: "break-word",
    marginTop: "20px",
  },

  imageContainerStyle2: {
    position: "relative",
    marginTop: "-15%",
    width: "45%",
    textAlign: "left",
  },

  imageStyle2: {
    width: "100%",
    borderRadius: "80% 50% 80% 50%",
  },

  Paragraph2: {
    color: "black",
    marginRight: "auto",
    width: "auto",
  },

  buttonStyle2: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#5a67d8",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    alignSelf: "flex-start",
  },

  //styles for  div3 named sectionStyle3

  sectionStyle3: {
    width: "100%",
    marginRight: "auto",
    marginBottom: "20%",
    marginLeft: "auto",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 20px",
    boxSizing: "border-box",
    flexDirection: "column",
  },

  textContainerStyle3: {
    maxWidth: "50%",
    marginTop: "-20%",
    textAlign: "left",
  },

  heading3: {
    marginTop: "30%",
    marginLeft: "10%",
    padding: "0 10px",
    position: "relative",
    fontSize: "3.5rem",
    fontWeight: "bold",
    fontFamily: "Raleway, sans-serif",
    color: "#007FFF",
  },

  container: {
    width: "100%",
    maxWidth: "300px",
    overflow: "hidden",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "0.75rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    position: "relative",
  },

  circularPicture: {
    width: "5rem",
    height: "5rem",
    marginLeft: "5%",
    marginTop: "5%",
    borderRadius: "50%",
    objectFit: "cover",
    marginRight: "1rem",
  },

  content: {
    padding: "1.5rem",
    position: "relative",
    zIndex: "10",
  },

  title: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1f2937",
  },

  description: {
    marginTop: "0.5rem",
    color: "#4b5563",
  },

  innerContainer: {
    marginLeft: "auto",
    marginRight: "auto",
    width: "100%",
    maxWidth: "1200px",
    height: "auto",
    padding: "20px",
    backgroundColor: "transparent",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    alignItems: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
  },

  rowContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },

  // Media Queries for responsiveness
  "@media (max-width: 768px)": {
    sectionStyle: {
      flexDirection: "column",
      height: "auto",
    },
    sectionStyle2: {
      flexDirection: "column",
      height: "auto",
      padding: "0 10px",
    },
    textContainerStyle: {
      maxWidth: "90%",
      marginTop: "0",
    },
    textContainerStyle2: {
      maxWidth: "90%",
      marginBottom: "10%",
    },
    imageContainerStyle: {
      width: "90%",
      marginBottom: "20px",
    },
    imageContainerStyle2: {
      width: "90%",
      marginTop: "10%",
    },
    Paragraph2: {
      marginRight: "0",
      textAlign: "center",
    },
    heading: {
      fontSize: "2.5rem",
    },
    Paragraph: {
      fontSize: "1.5rem",
    },
  },

  sectionStyle3: {
    flexDirection: "column",
  },

  innerContainer: {
    width: "100%",
    marginLeft: "50%",
    marginRight: "auto",
    marginBottom: "50%",
  },

  container: {
    width: "90%",
  },
};

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.containerStyle}>
      {/* content number 1 of the page */}

      <div style={styles.sectionStyle}>
        <div style={styles.textContainerStyle}>
          <h4 style={styles.heading}> </h4>
          <h1 style={styles.Paragraph}>Breaking Barriers, Building Futures</h1>
          <p style={styles.textParagraphStyle}>
            Our mission is to create inclusive opportunities for persons with
            disabilities, recognizing their potential and the value they bring.
            We are dedicated to fostering a supportive environment where diverse
            talents can thrive, driving innovation and success for both
            individuals and a company.
          </p>
          <button
            style={styles.buttonStyle}
            onClick={() => navigate("/signup")}
          >
            Get Started With Us
          </button>
        </div>
        <div style={styles.imageContainerStyle}>
          <img src="./src/imgs/pwd2.jpg" alt="PWD" style={styles.imageStyle} />
        </div>
      </div>

      {/* content number 2 of the page */}
      <div style={styles.sectionStyle2}>
        <div style={styles.imageContainerStyle2}>
          <img
            src="./src/imgs/pwd3.jpg"
            alt="COMPANY"
            style={styles.imageStyle2}
          />
        </div>
        <div style={styles.textContainerStyle2}>
          <h1 style={styles.Paragraph2}>Unlock Potential, Amplify Success</h1>
          <p style={styles.textParagraphStyle}>
            We envision a future where businesses harness the unique strengths
            of persons with disabilities, leading to enhanced creativity and
            growth. Our goal is to create pathways that drive mutual success and
            progress, fostering a culture of inclusivity that enriches
            organizations and transforms industries. By integrating diverse
            talents, we help companies unlock their full potential and achieve
            sustainable success.
          </p>
          <button
            style={styles.buttonStyle}
            onClick={() => navigate("/signup")}
          >
            Get Started With Us
          </button>
        </div>
      </div>

      {/* content number 3 of the page */}

      <div style={styles.sectionStyle3}>
        <div style={styles.textContainerStyle3}>
          <h4 style={styles.heading3}>Roles</h4>

          <div style={styles.innerContainer}>
            <div style={{ ...styles.rowContainer, justifyContent: "center" }}>
              <div style={styles.container}>
                <img
                  src="./src/imgs/pwd1.jpg"
                  alt=""
                  style={styles.circularPicture}
                />
                <div style={styles.gradientOverlay}></div>
                <div style={styles.content}>
                  <p style={styles.title}>Kyle Aguas</p>
                  <p style={styles.description}>
                    description here. Lorem ipsum dolor sit amet consectetur,
                    adipisicing elit. Labore ab, quod perspiciatis reprehenderit
                    nam optio sit et aspernatur officia nemo non quibusdam
                    nulla, earum adipisci sunt. Nisi iste porro consequuntur?
                  </p>
                </div>
              </div>
            </div>

            {/*3 cards in one row */}
            <div style={styles.rowContainer}>
              <div style={styles.container}>
                <img
                  src="./src/imgs/pwd1.jpg"
                  alt=""
                  style={styles.circularPicture}
                />
                <div style={styles.gradientOverlay}></div>
                <div style={styles.content}>
                  <p style={styles.title}>Mitsui Ortega</p>
                  <p style={styles.description}>
                    description here. Lorem, ipsum dolor sit amet consectetur
                    adipisicing elit. Totam voluptatum vitae ipsa obcaecati
                    pariatur impedit ullam eligendi quae, dolorem quam, minima
                    laboriosam accusamus nisi, quidem eos accusantium excepturi
                    sapiente maiores.
                  </p>
                </div>
              </div>

              <div style={styles.container}>
                <img
                  src="./src/imgs/pwd1.jpg"
                  alt=""
                  style={styles.circularPicture}
                />
                <div style={styles.gradientOverlay}></div>
                <div style={styles.content}>
                  <p style={styles.title}>Liv Centeno</p>
                  <p style={styles.description}>
                    description here. Lorem ipsum, dolor sit amet consectetur
                    adipisicing elit. Voluptates fugit ratione sapiente quo
                    quidem sint minima deleniti neque atque, rem blanditiis
                    enim, necessitatibus quasi? Adipisci maxime aperiam iste
                    quasi saepe?
                  </p>
                </div>
              </div>

              <div style={styles.container}>
                <img
                  src="./src/imgs/pwd1.jpg"
                  alt=""
                  style={styles.circularPicture}
                />
                <div style={styles.gradientOverlay}></div>
                <div style={styles.content}>
                  <p style={styles.title}>Carlos Miguel Bundac</p>
                  <p style={styles.description}>
                    description here. Lorem ipsum dolor sit amet consectetur,
                    adipisicing elit. Iusto ducimus nisi delectus animi tempora
                    sunt. Assumenda molestias atque voluptas impedit doloribus,
                    vero recusandae labore, mollitia explicabo natus sit ipsa
                    repellat!
                  </p>
                </div>
              </div>
            </div>

            <div style={styles.rowContainer}>
              <div style={styles.container}>
                <img
                  src="./src/imgs/pwd1.jpg"
                  alt=""
                  style={styles.circularPicture}
                />
                <div style={styles.gradientOverlay}></div>
                <div style={styles.content}>
                  <p style={styles.title}>Ace Pleno</p>
                  <p style={styles.description}>
                    description here. Lorem ipsum dolor sit amet consectetur,
                    adipisicing elit. Itaque doloribus tenetur a explicabo
                    ducimus nisi quidem molestias, eaque unde recusandae
                    voluptatibus, distinctio quae, consectetur adipisci minus
                    mollitia! Ea, quo. Ab?
                  </p>
                </div>
              </div>

              <div style={styles.container}>
                <img
                  src="./src/imgs/pwd1.jpg"
                  alt=""
                  style={styles.circularPicture}
                />
                <div style={styles.gradientOverlay}></div>
                <div style={styles.content}>
                  <p style={styles.title}>Kevin Guia</p>
                  <p style={styles.description}>
                    description here. Lorem ipsum dolor sit amet consectetur
                    adipisicing elit. Adipisci distinctio autem, perferendis et
                    earum, ipsum sunt cum magnam incidunt inventore accusantium
                    vero laudantium! Neque asperiores modi dolores sapiente ad
                    impedit.
                  </p>
                </div>
              </div>

              <div style={styles.container}>
                <img
                  src="./src/imgs/pwd1.jpg"
                  alt=""
                  style={styles.circularPicture}
                />
                <div style={styles.gradientOverlay}></div>
                <div style={styles.content}>
                  <p style={styles.title}>Joshua Brioso</p>
                  <p style={styles.description}>
                    description here. Lorem ipsum dolor sit amet consectetur
                    adipisicing elit. Corporis omnis fuga vitae natus laborum
                    laudantium harum reprehenderit. Accusamus, quos aspernatur
                    quae ipsam autem incidunt, maxime consequuntur veritatis
                    dolorem dolorum aut!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
