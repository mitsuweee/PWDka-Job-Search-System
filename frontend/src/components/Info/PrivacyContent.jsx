import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const privacyPolicyContainerStyle = {
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

function PrivacyPolicy() {
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

  const playPrivacyPolicyMessage = () => {
    const messageText =
      "This is the Privacy Policy page where we protect your information. Your privacy is important to us. Here, you’ll find details on how we collect, use, and safeguard your data as you interact with our platform.";

    const message = new SpeechSynthesisUtterance(messageText);
    message.lang = "en-US";
    speechSynthesis.speak(message);
  };

  const handleToggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      playPrivacyPolicyMessage();
    } else {
      speechSynthesis.cancel();
    }
  };

  return (
    <div style={privacyPolicyContainerStyle}>
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
      <div style={privacyPolicyContainerStyle}>
        <h1 style={headerStyle}>Privacy Policy</h1>
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
          Our commitment to maintaining your privacy
        </h2>
        <p style={{ marginBottom: "15px" }}>
          Our purpose is to help people live more fulfilling and productive
          working lives and help organizations succeed. We believe it&#39;s
          important that you understand how your information is collected, used,
          protected, and how you can manage it when you engage with us. Our
          Privacy Policy explains all of this in detail below.
        </p>
        <p>
          By registering and creating an account with us, using our products and
          services, visiting our Platforms, or simply engaging with us over the
          phone, via email, in person, or by any other means, the terms
          contained in this Privacy Policy will apply to you.
        </p>
      </div>

      {/* Section 1: Who are we? */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("whoAreWe")}
      >
        1. Who are we?
        {openSections.whoAreWe && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              We are the developers of PWDka, a platform dedicated to empowering
              persons with disabilities (PWDs) by providing accessible,
              user-friendly services and resources. Our team is committed to
              leveraging technology to enhance the lives of PWDs, offering tools
              and support that cater to their unique needs. Through PWDka, we
              aim to create a more inclusive society where everyone has the
              opportunity to thrive.
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Who is responsible for your Personal Information? */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("responsible")}
      >
        2. Who is responsible for your Personal Information?
        {openSections.responsible && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              The responsibility for your personal information lies with the
              PWDka team, who acts as the Data Controller under the Data Privacy
              Act of 2012 (Republic Act No. 10173) of the Philippines. We are
              committed to protecting your privacy and ensuring that your
              personal data is handled in compliance with Philippine data
              protection laws. As the Data Controller, we determine the purposes
              for which and the means by which your personal data is processed.
              We implement appropriate technical and organizational measures to
              protect your data against unauthorized access, alteration,
              disclosure, or destruction. Our Data Protection Officer (DPO)
              oversees compliance with the Data Privacy Act and other relevant
              regulations, ensuring that your personal information is collected,
              processed, and stored securely and used solely for the purposes
              outlined in our Privacy Policy.
            </p>
          </div>
        )}
      </div>

      {/* Section 3: What Personal Information do we collect? */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("collectInfo")}
      >
        3. What Personal Information do we collect?
        {openSections.collectInfo && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              At PWDka, we collect a variety of personal information to provide
              and improve our services, ensure compliance with legal
              requirements, and enhance your user experience. The types of
              personal information we may collect include:
            </p>
            <ul style={{ listStyleType: "none", padding: 0 }}>
              <li style={{ marginBottom: "15px" }}>
                <strong>Personal Identifiers:</strong>
                <ul style={{ marginTop: "10px" }}>
                  <li>
                    <strong>Full Name:</strong> To identify you on our platform
                    and personalize your experience.
                  </li>
                  <li>
                    <strong>Email Address:</strong> For communication purposes,
                    including account verification, notifications, and updates.
                  </li>
                  <li>
                    <strong>Contact Number:</strong> To facilitate communication
                    and provide support.
                  </li>
                  <li>
                    <strong>Address:</strong> To deliver services that may
                    require location-based information.
                  </li>
                </ul>
              </li>
              <li style={{ marginBottom: "15px" }}>
                <strong>Account Information:</strong>
                <ul style={{ marginTop: "10px" }}>
                  <li>
                    <strong>Username and Password:</strong> To secure your
                    account and authenticate your access to our platform.
                  </li>
                  <li>
                    <strong>Profile Information:</strong> Including profile
                    photos or other identifiers that you choose to provide.
                  </li>
                </ul>
              </li>
              <li style={{ marginBottom: "15px" }}>
                <strong>Demographic Information:</strong>
                <ul style={{ marginTop: "10px" }}>
                  <li>
                    <strong>Date of Birth:</strong> To verify age and comply
                    with legal requirements.
                  </li>
                  <li>
                    <strong>Gender:</strong> For statistical analysis and to
                    improve our services.
                  </li>
                </ul>
              </li>
              <li style={{ marginBottom: "15px" }}>
                <strong>Disability Information:</strong>
                <ul style={{ marginTop: "10px" }}>
                  <li>
                    <strong>Details of Disability:</strong> Specific information
                    related to your disability that you choose to share with us,
                    to ensure that our platform and services are accessible and
                    tailored to your needs.
                  </li>
                </ul>
              </li>
              <li style={{ marginBottom: "15px" }}>
                <strong>Technical Information:</strong>
                <ul style={{ marginTop: "10px" }}>
                  <li>
                    <strong>Browser Type and Version:</strong> To optimize our
                    website’s performance across different devices.
                  </li>
                  <li>
                    <strong>Operating System:</strong> To ensure compatibility
                    and enhance user experience.
                  </li>
                </ul>
              </li>
              <li style={{ marginBottom: "15px" }}>
                <strong>Usage Data:</strong>
                <ul style={{ marginTop: "10px" }}>
                  <li>
                    <strong>Interaction with Our Services:</strong> Including
                    pages visited, features used, and time spent on our
                    platform, to help us understand how you use our services and
                    improve them accordingly.
                  </li>
                </ul>
              </li>
              <li style={{ marginBottom: "15px" }}>
                <strong>Communication Data:</strong>
                <ul style={{ marginTop: "10px" }}>
                  <li>
                    <strong>Messages and Correspondence:</strong> Any
                    communications you have with us, including email exchanges,
                    support tickets, and feedback provided through our platform.
                  </li>
                </ul>
              </li>
              <li style={{ marginBottom: "15px" }}>
                <strong>Sensitive Personal Information:</strong>
                <ul style={{ marginTop: "10px" }}>
                  <li>
                    We may collect sensitive personal information, such as
                    health-related data or disability information, only with
                    your explicit consent and in accordance with the Data
                    Privacy Act of 2012.
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Section 4: Do we collect Sensitive Information? */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("sensitiveInfo")}
      >
        4. Do we collect Sensitive Information?
        {openSections.sensitiveInfo && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              Yes, we may collect sensitive personal information, but only when
              it is necessary for providing our services and only with your
              explicit consent. Sensitive personal information refers to data
              that includes, but is not limited to, information about your
              health, disability status, and any other information that could be
              considered sensitive under the Data Privacy Act of 2012.
            </p>
            <p>
              We are committed to ensuring that this information is handled with
              the highest level of security and confidentiality. Sensitive
              personal information will only be used for the specific purposes
              for which it was collected and will be protected against
              unauthorized access, disclosure, or any other misuse.
            </p>
            <p>
              We take extra precautions to safeguard sensitive information,
              including applying stringent access controls, encryption, and
              ensuring that it is only accessible to authorized personnel who
              need it to provide services to you.
            </p>
          </div>
        )}
      </div>

      {/* Section 5: How do we collect Personal Information? */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("collectPersonalInfo")}
      >
        5. How do we collect Personal Information?
        {openSections.collectPersonalInfo && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              When you sign up for an account on PWDka, we collect personal
              information directly from the data you provide during the
              registration process, such as your name, email address, contact
              number, and the username and password you create. You may also
              choose to provide additional profile details like a picture or bio
              to personalize your experience. This information is used to
              identify you, secure your account, and facilitate communication
              with you.
            </p>
          </div>
        )}
      </div>

      {/* Section 6: How do we use your Personal Information? */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("useInfo")}
      >
        6. How do we use your Personal Information?
        {openSections.useInfo && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              We use your personal information to create and manage your
              account, communicate with you about our services, and ensure your
              experience on PWDka is secure and personalized. This includes
              verifying your identity, responding to your inquiries, providing
              updates, and improving our platform based on your usage. We may
              also use your information to comply with legal obligations and
              protect against fraud or misuse of our services.
            </p>
          </div>
        )}
      </div>

      {/* Section 7: What happens if we are unable to collect your Personal Information? */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("unableToCollectInfo")}
      >
        7. What happens if we are unable to collect your Personal Information?
        {openSections.unableToCollectInfo && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              If we are unable to collect your personal information, we may not
              be able to provide you with the full range of services offered by
              PWDka. This could impact our ability to create and manage your
              account, communicate with you, or provide personalized experiences
              on our platform.
            </p>
          </div>
        )}
      </div>

      {/* Section 8: Who do we share your Personal Information with? */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("shareInfo")}
      >
        8. Who do we share your Personal Information with?
        {openSections.shareInfo && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              We share your personal information only with the PWDka
              administrators and the companies with whom you interact on our
              platform.
            </p>
            <ul>
              <li>
                <strong>PWDka Administrators:</strong> Your information is
                accessible to authorized PWDka admins who manage the platform
                and ensure that our services run smoothly. This includes
                handling your account, providing support, and maintaining the
                security of your data.
              </li>
              <li>
                <strong>Companies:</strong> When you apply for a job or engage
                with a company through PWDka, your personal information, such as
                your name, contact details, and application materials, is shared
                with that specific company to facilitate the application or
                engagement process.
              </li>
            </ul>
            <p>
              We ensure that both PWDka admins and the companies receiving your
              information adhere to strict data protection standards in
              accordance with the Data Privacy Act of 2012.
            </p>
          </div>
        )}
      </div>

      {/* Section 9: When do we share your Personal Information overseas? */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("shareOverseas")}
      >
        9. When do we share your Personal Information overseas?
        {openSections.shareOverseas && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              We share your personal information overseas only when it is
              necessary to provide our services, particularly when you apply for
              job postings by companies located outside of the Philippines. If
              an overseas company posts a job on PWDka and you choose to apply,
              your personal information—such as your name, contact details, and
              application materials—will be shared with that company to
              facilitate the application process. In such cases, we ensure that
              your data is transferred securely and that the overseas company
              receiving your information adheres to strict data protection
              standards in line with the Data Privacy Act of 2012.
            </p>
          </div>
        )}
      </div>

      {/* Section 10: How do we keep your information secure? */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("secureInfo")}
      >
        10. How do we keep your information secure?
        {openSections.secureInfo && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              We implement a range of security measures, including encryption,
              access controls, and regular security assessments, to protect your
              personal information from unauthorized access, disclosure, or
              misuse. Only authorized personnel with a legitimate need to access
              your data are allowed to do so.
            </p>
          </div>
        )}
      </div>

      {/* Section 11: Responsibility for Logging Out on Public Computers */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("publicComputerResponsibility")}
      >
        13. Your Responsibility on Public and Shared Devices
        {openSections.publicComputerResponsibility && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              If you access your account on a public or shared computer, it is
              your responsibility to ensure that you log out after each session.
              Failure to log out may result in unauthorized access to your
              account and personal information.
            </p>
            <p>
              PWDka is not liable for any consequences that may arise from
              failing to log out of your account on a public or shared computer.
              We recommend exercising caution and using only trusted devices to
              access your account.
            </p>
          </div>
        )}
      </div>

      {/* Section 12: Definitions */}
      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection("definitions")}
      >
        12. Definitions
        {openSections.definitions && (
          <div style={{ ...collapsibleContentStyle, display: "block" }}>
            <p>
              For the purposes of this Privacy Policy, the following terms shall
              have the meanings ascribed to them below:
            </p>
            <ul>
              <li>
                <strong>“Personal Information”:</strong> Any information that
                identifies, relates to, describes, or could reasonably be
                linked, directly or indirectly, with a particular individual.
              </li>
              <li>
                <strong>“Sensitive Personal Information”:</strong> A subset of
                personal information that includes information about an
                individual’s health, disability status, or any other data
                considered sensitive under applicable laws.
              </li>
              <li>
                <strong>“Data Controller”:</strong> The entity that determines
                the purposes for which and the means by which personal data is
                processed.
              </li>
              <li>
                <strong>“Processing”:</strong> Any operation or set of
                operations performed on personal data, such as collection,
                recording, organization, structuring, storage, adaptation,
                alteration, retrieval, consultation, use, disclosure,
                dissemination, or destruction.
              </li>
              <li>
                <strong>“Users”, “You”:</strong> Refers to individuals who
                access or use the PWDka platform, including but not limited to
                registered account holders.
              </li>
              <li>
                <strong>“Registered User”:</strong> A user who has completed the
                registration process on the PWDka platform, providing the
                required personal information, and who has been granted access
                to additional services and features.
              </li>
              <li>
                <strong>“PWDka”:</strong> Refers to the platform developed by
                us, aimed at empowering persons with disabilities (PWDs) by
                providing accessible services and resources tailored to their
                needs.
              </li>
              <li>
                <strong>“Job Listings”:</strong> Refers to the employment
                opportunities posted by companies on the PWDka platform, which
                users can view and apply for.
              </li>
              <li>
                <strong>“Data Privacy Act of 2012”:</strong> Refers to Republic
                Act No. 10173 of the Philippines, which is a comprehensive and
                strict privacy law that aims to protect all forms of
                information, be it private, personal, or sensitive.
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default PrivacyPolicy;
