import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const termsContainerStyle = {
  maxWidth: "900px",
  margin: "0 auto",
  padding: "30px",
  fontFamily: "sfprobold",
  color: "#fffff",
  lineHeight: "1.6",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "30px",
  fontSize: "45px",
  fontWeight: "bold",
  color: "#007bff",
  fontFamily: "sfprobold",
};

const commitmentStyle = {
  backgroundColor: "#e3edf7",
  padding: "25px",
  borderRadius: "20px",
  marginBottom: "30px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  fontSize: "18px",
  textShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  color: "#333",
  textAlign: "center",
  width: "100%",
};

const collapsibleSectionStyle = {
  borderBottom: "2px solid #ddd",
  padding: "15px 0",
  cursor: "pointer",
  fontSize: "20px",
  fontWeight: "bold",
  color: "#0056b3",
  transition: "color 0.3s ease",
};

const collapsibleContentStyle = {
  paddingLeft: "25px",
  display: "none",
  marginTop: "15px",
  fontSize: "17px",
  color: "#555",
  lineHeight: "1.7",
};

function TermsAndConditions() {
  const [openSections, setOpenSections] = useState({});
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [userDisabilityType, setUserDisabilityType] = useState("None");

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
      console.error("No token found in local storage");
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

  const toggleSection = (section) => {
    setOpenSections((prevOpenSections) => ({
      ...prevOpenSections,
      [section]: !prevOpenSections[section],
    }));
  };

  const playTermsMessage = () => {
    const messageText =
      "These are the Terms and Conditions of PWDka. Please review the details on how you can use our platform and the guidelines that apply to you.";

    const message = new SpeechSynthesisUtterance(messageText);
    message.lang = "en-US";
    speechSynthesis.speak(message);
  };

  const handleToggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      playTermsMessage();
    } else {
      speechSynthesis.cancel();
    }
  };

  return (
    <div style={termsContainerStyle}>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex justify-between items-center">
        {userDisabilityType !== "Deaf or Hard of Hearing" && (
          <button
            onClick={handleToggleVoice}
            className={`p-2 rounded-full transition-colors duration-200 ${
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
      <div style={termsContainerStyle}>
        <h1 style={headerStyle}>Terms and Conditions</h1>
      </div>

      <div
        style={{
          ...commitmentStyle,
          backgroundColor: "#ffffff",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "#007bff", // Blue color for the heading
          }}
        >
          Our Commitment
        </h2>
        <p style={{ marginBottom: "15px", color: "#000000" }}>
          {" "}
          {/* Black color for the description */}
          These terms govern your use of the PWDka platform. By accessing and
          using our services, you agree to the terms outlined in this document.
          If you do not agree, you should not use our platform.
        </p>
        <p style={{ color: "#000000" }}>
          {" "}
          {/* Black color for the second paragraph */}
          PWDka reserves the right to amend or update these terms at any time,
          and it is your responsibility to review them regularly.
        </p>
      </div>

      {/* Section 1: User Obligations */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("userObligations")}
      >
        1. User Obligations
        {openSections.userObligations && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              As a user of PWDka, you agree to use the platform in a responsible
              and lawful manner. You must not engage in any activity that is
              harmful, harassing, or violates the rights of other users.
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Intellectual Property */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("intellectualProperty")}
      >
        2. Intellectual Property
        {openSections.intellectualProperty && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              All content on the PWDka platform, including logos, text, and
              graphics, is the intellectual property of PWDka. Unauthorized use
              of any material on the platform is strictly prohibited.
            </p>
          </div>
        )}
      </div>

      {/* Section 3: User Accounts */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("userAccounts")}
      >
        3. User Accounts
        {openSections.userAccounts && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              When creating a user account, you agree to provide accurate
              information and maintain the confidentiality of your login
              credentials. PWDka is not responsible for any unauthorized use of
              your account.
            </p>
          </div>
        )}
      </div>

      {/* Section 4: Termination of Use */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("termination")}
      >
        4. Termination of Use
        {openSections.termination && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              PWDka reserves the right to suspend or terminate your account if
              you violate any terms. Misuse of the platform or any form of
              unlawful activity will lead to account suspension.
            </p>
          </div>
        )}
      </div>

      {/* Section 5: Liability */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("liability")}
      >
        5. Liability
        {openSections.liability && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              PWDka shall not be liable for any damages arising from your use of
              the platform, including any loss of data, income, or other
              liabilities related to your engagement with third-party companies
              through the platform.
            </p>
            <p>
              Additionally, if you access your account on a public or shared
              device, it is your responsibility to log out after each session.
              PWDka is not liable for any unauthorized access to your account
              resulting from a failure to log out on such devices.
            </p>
          </div>
        )}
      </div>

      {/* Section 6: Governing Law */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("governingLaw")}
      >
        6. Governing Law
        {openSections.governingLaw && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              These terms are governed by and construed in accordance with the
              laws of the Philippines. Any disputes arising from your use of
              PWDka will be subject to the exclusive jurisdiction of the courts
              of the Philippines.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TermsAndConditions;
