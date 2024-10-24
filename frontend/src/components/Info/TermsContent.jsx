import React, { useState, useEffect } from "react";
import axios from "axios";

const termsContainerStyle = {
  maxWidth: "900px",
  margin: "0 auto",
  padding: "30px",
  fontFamily: "sfprobold",
  color: "#333",
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

  useEffect(() => {
    const userId = localStorage.getItem("Id");

    const fetchUserDetails = () => {
      axios
        .get(`/user/view/${userId}`)
        .then((response) => {
          const userData = response.data.data;
          setUserDisabilityType(userData.type); // Assuming 'type' is the disability type in the response
        })
        .catch((error) => {
          console.error("Error fetching user data:", error.response?.data);
        });
    };

    fetchUserDetails();
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

      <div style={{ ...commitmentStyle, textAlign: "center" }}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "#007bff",
          }}
        >
          Our Commitment
        </h2>
        <p style={{ marginBottom: "15px" }}>
          These terms govern your use of the PWDka platform. By accessing and
          using our services, you agree to the terms outlined in this document.
          If you do not agree, you should not use our platform.
        </p>
        <p>
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
