import { useState, useEffect } from "react";
import axios from "axios";
import Typewriter from "typewriter-effect";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const ContactUs = () => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [userDisabilityType, setUserDisabilityType] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const navigate = useNavigate(); // Initialize navigate

  const checkCompanyStatus = async () => {
    try {
      const companyId = localStorage.getItem("Id");
      const response = await axios.get(
        `/company/view/verify/status/${companyId}`
      );
      if (
        response.data.successful &&
        response.data.message === "Company is Deactivated"
      ) {
        toast.error("Your account has been deactivated. Logging out.", {
          duration: 4000, // Show the toast for 4 seconds
        });

        // Delay the navigation to allow the toast to be visible
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 5000); // Wait for 4 seconds before redirecting
      }
    } catch {
      console.error("Failed to check company status.");
    }
  };

  const checkUserStatus = async () => {
    try {
      const userId = localStorage.getItem("Id");
      const response = await axios.get(`/user/view/verify/status/${userId}`);
      if (
        response.data.successful &&
        response.data.message === "User is Deactivated"
      ) {
        toast.error("Your account has been deactivated. Logging out.", {
          duration: 4000, // Show the toast for 4 seconds
        });

        // Delay the navigation to allow the toast to be visible
        setTimeout(() => {
          localStorage.removeItem("Id");
          localStorage.removeItem("Role");
          localStorage.removeItem("Token");
          navigate("/login");
        }, 5000); // Wait for 4 seconds before redirecting
      }
    } catch {
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
          setEmail(userData.email);
          setSubject("");
        })
        .catch((error) => {
          console.error("Error fetching user data:", error.response?.data);
        });
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("Id");
    const companyId = localStorage.getItem("Id");

    const interval = setInterval(() => {
      checkUserStatus(userId);
      checkCompanyStatus(companyId);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const playContactMessage = () => {
    const message = new SpeechSynthesisUtterance(
      "This is the Contact Us page where we’re ready to connect. Reach out through the channels below. Click the email for any queries, and let’s build a more inclusive job market together."
    );
    message.lang = "en-US";
    speechSynthesis.speak(message);
  };

  const handleToggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      playContactMessage();
    } else {
      speechSynthesis.cancel();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!body) {
      setFormError("Message body is required.");
      return;
    }

    axios
      .post("/admin/email", { email, subject, body })
      .then((response) => {
        setFormSuccess("Your message has been sent successfully!");
        setFormError("");
        setBody("");
        setSubject("");
      })
      .catch((error) => {
        setFormError("Failed to send your message. Please try again.");
        setFormSuccess("");
      });
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <section
        className="overflow-hidden bg-custom-bg sm:grid sm:grid-cols-2 sm:items-center"
        style={{
          backgroundImage: "url('./imgs/pft.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="p-8 md:p-12 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-xl text-center ltr:sm:text-left rtl:sm:text-right">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-custom-blue">
                <Typewriter
                  options={{
                    autoStart: true,
                    loop: true,
                    delay: 50,
                    strings: ["Questions? Contact Us!"],
                  }}
                />
              </h1>

              {userDisabilityType !== "Deaf or Hard of Hearing" && (
                <button
                  onClick={handleToggleVoice}
                  className={`ml-4 p-2 rounded-full transition-colors duration-200 ${
                    isVoiceEnabled
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-black"
                  } hover:bg-blue-600`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {isVoiceEnabled ? "volume_up" : "volume_off"}
                  </span>
                </button>
              )}
            </div>
            <p className="hidden text-black md:mt-4 md:block">
              Have any questions or need more information? We're here to help.
              Reach out to us, and we'll get back to you as soon as possible.
              Your inquiries are important to us, and we're eager to assist in
              making the job market more inclusive.
            </p>

            {/* Email form with card styling */}
            <div className="mt-4 md:mt-8 bg-white rounded-xl shadow-lg p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-left text-sm font-medium text-gray-700">
                    Your Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 mt-1 text-sm border bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-left text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 mt-1 text-sm border bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your subject"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-left text-sm font-medium text-gray-700">
                    Body
                  </label>
                  <textarea
                    name="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full px-3 py-2 mt-1 text-sm border bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your message"
                    rows="4"
                    required
                  ></textarea>
                </div>

                {formError && <p className="text-red-500">{formError}</p>}
                {formSuccess && <p className="text-green-500">{formSuccess}</p>}

                <button
                  type="submit"
                  className="inline-block rounded bg-custom-blue px-12 py-3 text-sm font-medium text-white transition hover:bg-blue-300 focus:outline-none focus:ring focus:ring-yellow-400"
                >
                  Send Email
                </button>
              </form>
            </div>
          </div>
        </div>

        <img
          alt=""
          src="/imgs/pwd2.jpg"
          className="h-full w-full object-cover sm:h-[calc(100%_-_2rem)] sm:self-end sm:rounded-ss-[30px] md:h-[calc(100%_-_4rem)] md:rounded-ss-[60px]"
        />
      </section>
    </>
  );
};

export default ContactUs;
