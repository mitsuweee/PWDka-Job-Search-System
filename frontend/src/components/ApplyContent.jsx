import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const ApplyPage = () => {
  const [resume, setResume] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [userDisabilityType, setUserDisabilityType] = useState("");
  const navigate = useNavigate();

  const MAX_FILE_SIZE = 16777215; //16MB

  // Function to check user status
  const checkUserStatus = async () => {
    try {
      const userId = localStorage.getItem("Id");
      const response = await axios.get(`/user/view/verify/status/${userId}`);
      if (
        response.data.successful &&
        response.data.message === "User is Deactivated"
      ) {
        toast.error("Your account has been deactivated. Logging out.", {
          duration: 4000,
        });

        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 5000);
      }
    } catch (error) {
      console.error("Failed to check user status.");
    }
  };

  const [tokenValid, setTokenValid] = useState(false); // New state for token validation
  const verifyToken = async () => {
    const token = localStorage.getItem("Token"); // Retrieve the token from localStorage
    const userId = localStorage.getItem("Id"); // Retrieve the userId from localStorage
    const userRole = localStorage.getItem("Role"); // Retrieve the userRole from localStorage

    if (!token) {
      toast.error("No token found in local storage");
      return;
    }

    try {
      console.log("Token:", token);

      // Send a POST request with the token, userId, and userRole in the body
      const response = await axios.post(
        "/verification/token/auth",
        {
          token: token,
          userId: userId,
          userRole: userRole,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "Refresh token retrieved successfully") {
        console.log("Changed Refresh Token");
        localStorage.setItem("Token", response.data.refresh_token);
      }

      if (response.data.successful) {
        setTokenValid(true); // Set token as valid
        console.log("Token verified successfully");
      } else {
        toast.error(response.data.message);

        // If token expired, show a toast message and attempt to retrieve a refresh token
        if (
          response.data.message === "Invalid refresh token, token has expired"
        ) {
          console.log("Token expired. Attempting to retrieve refresh token.");
          await retrieveRefreshToken(); // Retrieve a new refresh token and retry verification
        }
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data.message === "Unauthorized! Invalid token"
      ) {
        console.log(
          "Token expired or invalid. Attempting to retrieve refresh token."
        );
        await retrieveRefreshToken(); // Retrieve a new refresh token and retry verification
      } else {
        toast.error("Session expired, logging out");
        console.error("Error verifying token:", error.message);
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 5000);
      }
    }
  };

  // Function to retrieve refresh token using the same API endpoint
  const retrieveRefreshToken = async () => {
    const userId = localStorage.getItem("Id");
    const userRole = localStorage.getItem("Role");

    try {
      const response = await axios.post(
        "/verification/token/auth",
        {
          token: "", // No access token is provided in this case
          userId: userId,
          userRole: userRole,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.successful) {
        // Store the new refresh token in local storage
        localStorage.setItem("Token", response.data.refresh_token);
        console.log(
          "Refresh token retrieved and updated in local storage:",
          response.data.refresh_token
        );
        toast.success("Session refreshed successfully.");

        // Retry verification with the new token
        await verifyToken();
      } else {
        // If retrieving the refresh token fails, show a toast message and redirect to login
        toast.error("Token expired, please log in again");
        window.location.href = "/login"; // Redirect to login page
      }
    } catch (error) {
      toast.error("Token expired, please log in again");
      console.error("Error retrieving refresh token:", error.message);
      window.location.href = "/login"; // Redirect to login page if refresh fails
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("Id");

    const fetchUserDetails = () => {
      axios
        .get(`/user/view/${userId}`)
        .then((response) => {
          const userData = response.data.data;
          setUserDisabilityType(userData.type);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error.response?.data);
        });
    };

    fetchUserDetails();

    // Check user status every 5 seconds
    const interval = setInterval(() => {
      checkUserStatus();
    }, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const playIntroMessage = () => {
    if (userDisabilityType === "Deaf or Hard of Hearing") return;
    const introMessage =
      "This is the Apply page where your journey begins. Upload your resume below to take the next step toward your desired job. Please note that if you have already applied for a job with this company, you cannot apply again for the same position.";
    const message = new SpeechSynthesisUtterance(introMessage);
    message.lang = "en-US";
    speechSynthesis.speak(message);
  };

  const playSuccessMessage = () => {
    if (userDisabilityType === "Deaf or Hard of Hearing") return;
    const successMessage =
      "You have successfully applied for the job! We’ve received your application, and the company will review it soon. Keep an eye on your email for further updates.";
    const message = new SpeechSynthesisUtterance(successMessage);
    message.lang = "en-US";
    speechSynthesis.speak(message);
  };

  const handleToggleVoice = () => {
    if (userDisabilityType === "Deaf or Hard of Hearing") return;
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      playIntroMessage();
    } else {
      speechSynthesis.cancel();
    }
  };

  const handleFileChange = (e) => {
    setIsUploading(true);
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      if (file.size <= MAX_FILE_SIZE) {
        const pdfBlob = new Blob([file], { type: "application/pdf" });

        setResume(pdfBlob);
        setPdfPreviewUrl(URL.createObjectURL(file));
        setError("");
        toast.success("PDF uploaded successfully!");
      } else {
        setError("File size exceeds 16MB. Please upload a smaller file.");
        setResume(null);
        setPdfPreviewUrl(null);
        toast.error("File size exceeds 16MB. Please upload a smaller file.");
      }
    } else {
      setError("Please upload a PDF file.");
      setResume(null);
      setPdfPreviewUrl(null);
      toast.error("Please upload a valid PDF file.");
    }
    setIsUploading(false);
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
          user_id: localStorage.getItem("Id"),
          joblisting_id: jobId,
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
            toast.success("Resume submitted successfully!");
            playSuccessMessage();
            setSubmitSuccess(true);
          })
          .catch((error) => {
            console.log(error.response?.data?.message);
            toast.error(error.response?.data?.message || "An error occurred");
            setError(error.response?.data?.message || "An error occurred");
          });
      };
      reader.readAsDataURL(resume);
    } else {
      setError("Please upload a PDF file before submitting.");
      toast.error("Please upload a PDF file before submitting.");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 sm:px-0"
      style={{ backgroundImage: `url('./imgs/pft.png')` }}
    >
      <div className="w-full max-w-lg sm:max-w-4xl mx-auto my-10 p-6 sm:p-16 bg-white rounded-3xl shadow-3xl space-y-8 sm:space-y-10 transition-transform transform hover:scale-105 hover:shadow-4xl">
        <Toaster position="top-center" reverseOrder={false} />

        {submitSuccess ? (
          <div className="text-center space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-600">
              Thank You for Applying!
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Your application has been successfully submitted. We’ve received
              your resume, and the company will review it soon. Keep an eye on
              your email for updates regarding your application.
            </p>
            <button
              className="mt-6 sm:mt-10 py-2 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition duration-300"
              onClick={() => navigate("/joblist")}
            >
              Go back to home
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10 space-y-4 sm:space-y-0">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-700">
                Apply for the Job
              </h2>
              {userDisabilityType !== "Deaf or Hard of Hearing" && (
                <button
                  onClick={handleToggleVoice}
                  className={`p-2 sm:p-3 rounded-full transition-colors duration-300 shadow-lg transform hover:scale-105 sm:hover:scale-110 ${
                    isVoiceEnabled
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                  title={
                    isVoiceEnabled
                      ? "Voice is enabled"
                      : "Enable voice instructions"
                  }
                >
                  <span className="material-symbols-outlined text-xl sm:text-2xl">
                    {isVoiceEnabled ? "volume_up" : "volume_off"}
                  </span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-10">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 sm:mb-4">
                  Upload Your Resume (PDF only):
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 cursor-pointer hover:border-blue-500 transition-all">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="w-full text-gray-800"
                  />
                  <div className="flex items-center space-x-2 mt-2 sm:mt-4">
                    <span className="material-symbols-outlined text-gray-500">
                      file_upload
                    </span>
                    <span className="text-gray-600">Choose a PDF</span>
                  </div>
                  <small className="block text-gray-500 mt-2 sm:mt-3">
                    Max file size: 16MB
                  </small>
                </div>
                {error && <p className="text-red-500 mt-2 sm:mt-3">{error}</p>}
                {isUploading && <div className="loader">Uploading...</div>}
              </div>

              {pdfPreviewUrl && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-3 sm:mb-4">
                    Preview Your Resume:
                  </label>
                  <iframe
                    className="w-full h-48 sm:h-80 border border-gray-300 rounded-lg shadow-md"
                    src={pdfPreviewUrl}
                    title="PDF Preview"
                  ></iframe>
                  <div className="flex justify-between mt-4 sm:mt-6">
                    <a
                      href={pdfPreviewUrl}
                      download="resume.pdf"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Download PDF
                    </a>
                    <button
                      className="text-red-500 hover:underline font-medium"
                      onClick={() => setResume(null)}
                    >
                      Remove PDF
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
              >
                Submit Application
              </button>
              <button
                type="reset"
                className="w-full py-4 sm:py-5 mt-4 sm:mt-5 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
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
    </div>
  );
};

export default ApplyPage;
