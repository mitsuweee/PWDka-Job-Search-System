// import { useState } from "react";

// const jobListings = [
//   {
//     id: 1,
//     positionName: "Software Engineer",
//     description: "Develop and maintain software applications",
//     qualification: "Bachelor's degree in Computer Science",
//     salary: 70000,
//     city: "New York",
//     datePosted: "2023-08-01",
//     positionType: "Full-time",
//   },
//   {
//     id: 2,
//     positionName: "Marketing Manager",
//     description: "Manage marketing campaigns and strategies",
//     qualification: "Bachelor's degree in Marketing",
//     salary: 60000,
//     city: "San Francisco",
//     datePosted: "2023-08-05",
//     positionType: "Full-time",
//   },
//   {
//     id: 3,
//     positionName: "Data Analyst",
//     description: "Analyze and interpret complex data sets",
//     qualification: "Bachelor's degree in Statistics",
//     salary: 65000,
//     city: "New York",
//     datePosted: "2023-08-10",
//     positionType: "Full-time",
//   },
// ];

// function MainContent() {
//   const [setFilter] = useState("");
//   const [filterType, setFilterType] = useState("");

//   const handleFilterChange = (type) => {
//     setFilterType(type);
//     setFilter(type);
//   };

//   const filteredJobListings = [...jobListings].sort((a, b) => {
//     switch (filterType) {
//       case "latest-past":
//         return new Date(b.datePosted) - new Date(a.datePosted);
//       case "salary":
//         return b.salary - a.salary;
//       case "city":
//         return a.city.localeCompare(b.city);
//       default:
//         return 0;
//     }
//   });

//   const jobCardStyle = {
//     border: "1px solid #ddd",
//     margin: "10px",
//     padding: "10px",
//     borderRadius: "8px",
//   };

//   const filterButtonStyle = {
//     width: "100px",
//     height: "30px",
//     borderRadius: "5px",
//     display: "inline-flex",
//     alignItems: "center",
//     justifyContent: "center",
//     border: "1px solid rgba(0, 0, 0, 0.192)",
//     cursor: "pointer",
//     boxShadow: "0px 10px 10px rgba(0, 0, 0, 0.021)",
//     transition: "all 0.3s",
//     margin: "5px",
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>Job Listings</h1>
//       <div>
//         <div style={{ marginBottom: "20px" }}>
//           <button
//             style={filterButtonStyle}
//             onClick={() => handleFilterChange("latest-past")}
//           >
//             Latest - Past
//           </button>
//           <button
//             style={filterButtonStyle}
//             onClick={() => handleFilterChange("salary")}
//           >
//             Salary
//           </button>
//           <button
//             style={filterButtonStyle}
//             onClick={() => handleFilterChange("city")}
//           >
//             City
//           </button>
//         </div>
//         {filteredJobListings.map((job) => (
//           <div key={job.id} style={jobCardStyle}>
//             <h2>{job.positionName}</h2>
//             <p>
//               <strong>Description:</strong> {job.description}
//             </p>
//             <p>
//               <strong>Qualification:</strong> {job.qualification}
//             </p>
//             <p>
//               <strong>Salary Range:</strong> {job.salary}
//             </p>
//             <p>
//               <strong>City:</strong> {job.city}
//             </p>
//             <p>
//               <strong>Date Posted:</strong> {job.datePosted}
//             </p>
//             <p>
//               <strong>Position Type:</strong> {job.positionType}
//             </p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default MainContent;
