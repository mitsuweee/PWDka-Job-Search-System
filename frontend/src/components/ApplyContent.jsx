import React, { useState } from "react";
import axios from "axios";

const ApplyPage = () => {
  const [resume, setResume] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setResume(file);
      setPdfPreviewUrl(URL.createObjectURL(file)); // Create a URL for the PDF file to preview it
      setError("");
    } else {
      setError("Please upload a PDF file.");
      setResume(null);
      setPdfPreviewUrl(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (resume) {
      const reader = new FileReader();
      reader.onload = () => {
        const resumeBase64 = reader.result.split(",")[1];

        const data = JSON.stringify({
          user_id: sessionStorage.getItem("userId"), // Assuming userId is stored in sessionStorage
          joblisting_id: 62, // Use the joblisting_id from URL params
          resume: resumeBase64,
        });

        const config = {
          method: "post",
          url: "/jobapplication/upload/resume",
          headers: {
            "Content-Type": "application/json",
          },
          data: data,
        };

        axios(config)
          .then((response) => {
            console.log(JSON.stringify(response.data));
            alert("Resume submitted successfully!");
          })
          .catch((error) => {
            console.log(error);
            setError("An error occurred while submitting your resume.");
          });
      };
      reader.readAsDataURL(resume);
    } else {
      setError("Please upload a PDF file before submitting.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Apply for the Job
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Upload Your Resume (PDF only):
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800"
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        {pdfPreviewUrl && (
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Preview Your Resume:
            </label>
            <iframe
              className="w-full h-64 border rounded-lg shadow-sm"
              src={pdfPreviewUrl}
              title="PDF Preview"
              width="100%"
              height="500px"
            ></iframe>
          </div>
        )}
        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default ApplyPage;
