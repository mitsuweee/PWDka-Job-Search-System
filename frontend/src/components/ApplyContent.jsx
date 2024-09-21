import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ApplyPage = () => {
  const [resume, setResume] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const navigate = useNavigate();

  const MAX_FILE_SIZE = 16777215; // 16,777,215 bytes (16MB)

  const playIntroMessage = () => {
    const introMessage =
      "This is the Apply page where your journey begins. Upload your resume below to take the next step toward your desired job. Please note that if you have already applied for a job with this company, you cannot apply again for the same position.";
    const message = new SpeechSynthesisUtterance(introMessage);
    message.lang = "en-US";
    speechSynthesis.speak(message);
  };

  const playSuccessMessage = () => {
    const successMessage =
      "You have successfully applied for the job! We’ve received your application, and the company will review it soon. Keep an eye on your email for further updates.";
    const message = new SpeechSynthesisUtterance(successMessage);
    message.lang = "en-US";
    speechSynthesis.speak(message);
  };

  const handleToggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      playIntroMessage();
    } else {
      speechSynthesis.cancel(); // Stop any ongoing speech
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      if (file.size <= MAX_FILE_SIZE) {
        const pdfBlob = new Blob([file], { type: "application/pdf" });

        setResume(pdfBlob);
        setPdfPreviewUrl(URL.createObjectURL(file)); // Create a URL for the PDF file to preview it
        setError("");
      } else {
        setError("File size exceeds 16MB. Please upload a smaller file.");
        setResume(null);
        setPdfPreviewUrl(null);
      }
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
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const jobId = urlParams.get("id");

        const resume = reader.result.split(",")[1];
        const data = JSON.stringify({
          user_id: sessionStorage.getItem("Id"), // Assuming userId is stored in sessionStorage
          joblisting_id: jobId, // Use the joblisting_id from URL params
          resume: resume,
        });

        console.log(data);

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
            playSuccessMessage(); // Play the success message
            window.location.reload();
          })
          .catch((error) => {
            console.log(error.response.data.message);
            setError(error.response.data.message);
          });
      };
      reader.readAsDataURL(resume);
    } else {
      setError("Please upload a PDF file before submitting.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Apply for the Job</h2>
        <button
          onClick={handleToggleVoice}
          className={`ml-4 px-4 py-2 rounded-full transition-colors duration-200 ${
            isVoiceEnabled ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
          } hover:bg-blue-600`}
        >
          <span className="material-symbols-outlined text-2xl">
            {isVoiceEnabled ? "volume_up" : "volume_off"}
          </span>
        </button>
      </div>
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
