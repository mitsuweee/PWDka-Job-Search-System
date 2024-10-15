import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast"; // Import react-hot-toast

const ApplyPage = () => {
  const [resume, setResume] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // For showing progress
  const [submitSuccess, setSubmitSuccess] = useState(false); // For showing success message
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
    setIsUploading(true); // Start showing the upload progress
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      if (file.size <= MAX_FILE_SIZE) {
        const pdfBlob = new Blob([file], { type: "application/pdf" });

        setResume(pdfBlob);
        setPdfPreviewUrl(URL.createObjectURL(file)); // Create a URL for the PDF file to preview it
        setError("");
        toast.success("PDF uploaded successfully!"); // Show success toast
      } else {
        setError("File size exceeds 16MB. Please upload a smaller file.");
        setResume(null);
        setPdfPreviewUrl(null);
        toast.error("File size exceeds 16MB. Please upload a smaller file."); // Show error toast
      }
    } else {
      setError("Please upload a PDF file.");
      setResume(null);
      setPdfPreviewUrl(null);
      toast.error("Please upload a valid PDF file."); // Show error toast for invalid format
    }
    setIsUploading(false); // Stop showing the upload progress
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (resume) {
      const reader = new FileReader();
      reader.onload = () => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const jobId = urlParams.get("id");

        if (!jobId) {
          toast.error("Job ID is missing. Unable to submit the application.");
          return;
        }

        const resume = reader.result.split(",")[1];
        const data = JSON.stringify({
          user_id: localStorage.getItem("Id"), // Assuming userId is stored in localStorage
          joblisting_id: jobId, // Use the joblisting_id from URL params
          resume: resume,
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
            toast.success("Resume submitted successfully!"); // Show success toast
            playSuccessMessage(); // Play the success message
            setSubmitSuccess(true); // Show success message
          })
          .catch((error) => {
            console.log(error.response?.data?.message);
            toast.error(error.response?.data?.message || "An error occurred"); // Show error toast
            setError(error.response?.data?.message || "An error occurred");
          });
      };
      reader.readAsDataURL(resume);
    } else {
      setError("Please upload a PDF file before submitting.");
      toast.error("Please upload a PDF file before submitting."); // Show error toast if no PDF uploaded
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-10 mt-10 p-10 bg-white rounded-xl shadow-lg space-y-8  transform transition-all hover:shadow-2xl">
      <Toaster position="top-center" reverseOrder={false} />{" "}
      {/* Add Toaster for Toast Notifications */}
      {submitSuccess ? ( // Conditionally render thank you message
        <div className="text-center">
          <h2 className="text-3xl font-bold text-custom-blue">
            Thank You for Applying!
          </h2>
          <p className="text-lg mt-4 text-gray-700">
            Your application has been successfully submitted. We’ve received
            your resume and the company will review it soon. Keep an eye on your
            email for updates regarding your application.
          </p>
          <button
            className="mt-8 py-3 px-6 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
            onClick={() => navigate("/joblist")}
          >
            Go back to home
          </button>
        </div>
      ) : (
        // Show form if not yet submitted
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Apply for the Job
            </h2>
            <button
              onClick={handleToggleVoice}
              className={`ml-4 p-3 rounded-full transition-colors duration-200 shadow-lg ${
                isVoiceEnabled
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-black"
              } hover:bg-blue-700`}
              title={
                isVoiceEnabled
                  ? "Voice is enabled"
                  : "Enable voice instructions"
              }
            >
              <span className="material-symbols-outlined text-2xl">
                {isVoiceEnabled ? "volume_up" : "volume_off"}
              </span>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-4">
                Upload Your Resume (PDF only):
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-all">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-gray-800"
                />
                <div className="flex items-center space-x-2 mt-2">
                  <span className="material-symbols-outlined text-gray-500">
                    file_upload
                  </span>
                  <span className="text-gray-600">Choose a PDF</span>
                </div>
                <small className="block text-gray-500 mt-2">
                  Max file size: 16MB
                </small>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              {isUploading && <div className="loader">Uploading...</div>}
            </div>
            {pdfPreviewUrl && (
              <div className="mb-8">
                <label className="block text-gray-700 font-semibold mb-4">
                  Preview Your Resume:
                </label>
                <iframe
                  className="w-full h-72 border border-gray-300 rounded-lg shadow-sm"
                  src={pdfPreviewUrl}
                  title="PDF Preview"
                  width="100%"
                  height="500px"
                ></iframe>
                <div className="flex justify-between mt-4">
                  <a
                    href={pdfPreviewUrl}
                    download="resume.pdf"
                    className="text-blue-500 underline"
                  >
                    Download PDF
                  </a>
                  <button
                    className="text-red-500 underline"
                    onClick={() => setResume(null)}
                  >
                    Remove PDF
                  </button>
                </div>
              </div>
            )}
            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105"
            >
              Submit Application
            </button>
            <button
              type="reset"
              className="w-full py-4 mt-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300"
              onClick={() => {
                setResume(null);
                setPdfPreviewUrl(null);
                setError("");
              }}
            >
              Reset Form
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ApplyPage;
