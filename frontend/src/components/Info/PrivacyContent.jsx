import { useState } from 'react';

const privacyPolicyContainerStyle = {
  maxWidth: '900px', // Increased width for more content space
  margin: '0 auto',
  padding: '30px', // Increased padding for better spacing
  fontFamily: 'sfprobold', // Updated font for a more modern look
  color: '#333',
  lineHeight: '1.6', // Enhanced line spacing for readability
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '30px', // Increased margin for better separation
  fontSize: '52px', // Increased font size for prominence
  fontWeight: 'bold', // Bold for emphasis
  color: '#007bff', // Slightly darker shade for the header
  fontFamily: 'sfprobold'
};

const commitmentStyle = {
  backgroundColor: '#e3edf7', // Matches the background color from the header
  padding: '25px', // Padding for comfortable reading
  borderRadius: '20px', // Rounded corners for a modern look
  marginBottom: '30px', // Margin for better section separation
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
  fontSize: '18px', // Font size for readability
  textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', // Slight shadow for text emphasis (optional)
  border: '1px solid rgba(0, 0, 0, 0.1)', // Optional border similar to shadow for emphasis
  color: '#333', // Text color
  textAlign: 'center', // Centered text to match the header style
  width: '100%', // Full width, similar to header'
  
};



const collapsibleSectionStyle = {
  borderBottom: '2px solid #ddd', // Increased border thickness for clearer separation
  padding: '15px 0', // Increased padding for better clickable area
  cursor: 'pointer',
  fontSize: '20px', // Larger font for section titles
  fontWeight: 'bold', // Bold for emphasis on section titles
  color: '#0056b3', // Changed color for a more engaging look
  transition: 'color 0.3s ease', // Smooth transition for hover effect
};

const collapsibleContentStyle = {
  paddingLeft: '25px', // Increased padding for indentation
  display: 'none',
  marginTop: '15px', // Increased margin for better separation
  fontSize: '17px', // Slightly larger font for content readability
  color: '#555', // Slightly lighter color for content to distinguish from titles
  lineHeight: '1.7', // Enhanced line height for better readability
};

function PrivacyPolicy() {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (section) => {
    setOpenSections((prevOpenSections) => ({
      ...prevOpenSections,
      [section]: !prevOpenSections[section],
    }));
  };

  return (
    <div style={privacyPolicyContainerStyle}>
      <h1 style={headerStyle}>Privacy Policy</h1>

      <div style={{ ...commitmentStyle, textAlign: 'center' }}>
  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#007bff' }}>
    Our commitment to maintaining your privacy
  </h2>
  <p style={{ marginBottom: '15px' }}>
    Our purpose is to help people live more fulfilling and productive working lives and help organizations succeed. We believe it&#39;s important that you understand how your information is collected, used, protected, and how you can manage it when you engage with us. Our Privacy Policy explains all of this in detail below.
  </p>
  <p>
    By registering and creating an account with us, using our products and services, visiting our Platforms, or simply engaging with us over the phone, via email, in person, or by any other means, the terms contained in this Privacy Policy will apply to you.
  </p>
</div>


      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection('whoAreWe')}
      >
        1. Who are we?
        {openSections.whoAreWe && (
          <div style={{ ...collapsibleContentStyle, display: 'block' }}>
            <p>We are the developers of PWDka, a platform dedicated to empowering persons with disabilities (PWDs) by providing accessible, user-friendly services and resources. Our team is committed to leveraging technology to enhance the lives of PWDs, offering tools and support that cater to their unique needs. Through PWDka, we aim to create a more inclusive society where everyone has the opportunity to thrive.</p>
          </div>
        )}
      </div>

      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection('responsible')}
      >
        2. Who is responsible for your Personal Information?
        {openSections.responsible && (
          <div style={{ ...collapsibleContentStyle, display: 'block' }}>
            <p>The responsibility for your personal information lies with the PWDka team, who acts as the Data Controller under the Data Privacy Act of 2012 (Republic Act No. 10173) of the Philippines. We are committed to protecting your privacy and ensuring that your personal data is handled in compliance with Philippine data protection laws.

As the Data Controller, we determine the purposes for which and the means by which your personal data is processed. We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction. Our Data Protection Officer (DPO) oversees compliance with the Data Privacy Act and other relevant regulations, ensuring that your personal information is collected, processed, and stored securely and used solely for the purposes outlined in our Privacy Policy.</p>
          </div>
        )}
      </div>

      <div
  style={collapsibleSectionStyle}
  onClick={() => toggleSection('collectInfo')}
>
  3. What Personal Information do we collect?
  {openSections.collectInfo && (
    <div style={{ ...collapsibleContentStyle, display: 'block' }}>
      <p>
        At PWDka, we collect a variety of personal information to provide and improve our services, ensure compliance with legal requirements, and enhance your user experience. The types of personal information we may collect include:
      </p>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        <li style={{ marginBottom: '15px' }}>
          <strong>Personal Identifiers:</strong>
          <ul style={{ marginTop: '10px' }}>
            <li><strong>Full Name:</strong> To identify you on our platform and personalize your experience.</li>
            <li><strong>Email Address:</strong> For communication purposes, including account verification, notifications, and updates.</li>
            <li><strong>Contact Number:</strong> To facilitate communication and provide support.</li>
            <li><strong>Address:</strong> To deliver services that may require location-based information.</li>
          </ul>
        </li>
        <li style={{ marginBottom: '15px' }}>
          <strong>Account Information:</strong>
          <ul style={{ marginTop: '10px' }}>
            <li><strong>Username and Password:</strong> To secure your account and authenticate your access to our platform.</li>
            <li><strong>Profile Information:</strong> Including profile photos or other identifiers that you choose to provide.</li>
          </ul>
        </li>
        <li style={{ marginBottom: '15px' }}>
          <strong>Demographic Information:</strong>
          <ul style={{ marginTop: '10px' }}>
            <li><strong>Date of Birth:</strong> To verify age and comply with legal requirements.</li>
            <li><strong>Gender:</strong> For statistical analysis and to improve our services.</li>
          </ul>
        </li>
        <li style={{ marginBottom: '15px' }}>
          <strong>Disability Information:</strong>
          <ul style={{ marginTop: '10px' }}>
            <li><strong>Details of Disability:</strong> Specific information related to your disability that you choose to share with us, to ensure that our platform and services are accessible and tailored to your needs.</li>
          </ul>
        </li>
        <li style={{ marginBottom: '15px' }}>
          <strong>Technical Information:</strong>
          <ul style={{ marginTop: '10px' }}>
            <li><strong>IP Address:</strong> To track usage patterns and improve security.</li>
            <li><strong>Browser Type and Version:</strong> To optimize our website’s performance across different devices.</li>
            <li><strong>Operating System:</strong> To ensure compatibility and enhance user experience.</li>
          </ul>
        </li>
        <li style={{ marginBottom: '15px' }}>
          <strong>Usage Data:</strong>
          <ul style={{ marginTop: '10px' }}>
            <li><strong>Interaction with Our Services:</strong> Including pages visited, features used, and time spent on our platform, to help us understand how you use our services and improve them accordingly.</li>
          </ul>
        </li>
        <li style={{ marginBottom: '15px' }}>
          <strong>Communication Data:</strong>
          <ul style={{ marginTop: '10px' }}>
            <li><strong>Messages and Correspondence:</strong> Any communications you have with us, including email exchanges, support tickets, and feedback provided through our platform.</li>
          </ul>
        </li>
        <li style={{ marginBottom: '15px' }}>
          <strong>Sensitive Personal Information:</strong>
          <ul style={{ marginTop: '10px' }}>
            <li>We may collect sensitive personal information, such as health-related data or disability information, only with your explicit consent and in accordance with the Data Privacy Act of 2012.</li>
          </ul>
        </li>
      </ul>
    </div>
  )}
</div>


<div
  style={collapsibleSectionStyle}
  onClick={() => toggleSection('sensitiveInfo')}
>
  4. Do we collect Sensitive Information?
  {openSections.sensitiveInfo && (
    <div style={{ ...collapsibleContentStyle, display: 'block' }}>
      <p>
        Yes, we may collect sensitive personal information, but only when it is necessary for providing our services and only with your explicit consent. Sensitive personal information refers to data that includes, but is not limited to, information about your health, disability status, and any other information that could be considered sensitive under the Data Privacy Act of 2012.
      </p>
      <p>
        We are committed to ensuring that this information is handled with the highest level of security and confidentiality. Sensitive personal information will only be used for the specific purposes for which it was collected and will be protected against unauthorized access, disclosure, or any other misuse.
      </p>
      <p>
        We take extra precautions to safeguard sensitive information, including applying stringent access controls, encryption, and ensuring that it is only accessible to authorized personnel who need it to provide services to you.
      </p>
    </div>
  )}
</div>


      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection('collectPersonalInfo')}
      >
        5. How do we collect Personal Information?
        {openSections.collectPersonalInfo && (
          <div style={{ ...collapsibleContentStyle, display: 'block' }}>
            <p>When you sign up for an account on PWDka, we collect personal information directly from the data you provide during the registration process, such as your name, email address, contact number, and the username and password you create. You may also choose to provide additional profile details like a picture or bio to personalize your experience. This information is used to identify you, secure your account, and facilitate communication with you.</p>
          </div>
        )}
      </div>

      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection('useInfo')}
      >
        6. How do we use your Personal Information?
        {openSections.useInfo && (
          <div style={{ ...collapsibleContentStyle, display: 'block' }}>
            <p>We use your personal information to create and manage your account, communicate with you about our services, and ensure your experience on PWDka is secure and personalized. This includes verifying your identity, responding to your inquiries, providing updates, and improving our platform based on your usage. We may also use your information to comply with legal obligations and protect against fraud or misuse of our services.</p>
          </div>
        )}
      </div>

      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection('unableToCollectInfo')}
      >
        7. What happens if we are unable to collect your Personal Information?
        {openSections.unableToCollectInfo && (
          <div style={{ ...collapsibleContentStyle, display: 'block' }}>
            <p>
              If we are unable to collect your personal information, we may not be able to provide you with the full range of services offered by PWDka. This could impact our ability to create and manage your account, communicate with you, or provide personalized experiences on our platform.
            </p>
          </div>
        )}
      </div>

      <div
  style={collapsibleSectionStyle}
  onClick={() => toggleSection('shareInfo')}
>
  8. Who do we share your Personal Information with?
  {openSections.shareInfo && (
    <div style={{ ...collapsibleContentStyle, display: 'block' }}>
      <p>
        We share your personal information only with the PWDka administrators and the companies with whom you interact on our platform.
      </p>
      <ul>
        <li>
          <strong>PWDka Administrators:</strong> Your information is accessible to authorized PWDka admins who manage the platform and ensure that our services run smoothly. This includes handling your account, providing support, and maintaining the security of your data.
        </li>
        <li>
          <strong>Companies:</strong> When you apply for a job or engage with a company through PWDka, your personal information, such as your name, contact details, and application materials, is shared with that specific company to facilitate the application or engagement process.
        </li>
      </ul>
      <p>
        We ensure that both PWDka admins and the companies receiving your information adhere to strict data protection standards in accordance with the Data Privacy Act of 2012.
      </p>
    </div>
  )}
</div>


      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection('shareOverseas')}
      >
        9. When do we share your Personal Information overseas?
        {openSections.shareOverseas && (
          <div style={{ ...collapsibleContentStyle, display: 'block' }}>
            <p>
            We share your personal information overseas only when it is necessary to provide our services, particularly when you apply for job postings by companies located outside of the Philippines. If an overseas company posts a job on PWDka and you choose to apply, your personal information—such as your name, contact details, and application materials—will be shared with that company to facilitate the application process.

In such cases, we ensure that your data is transferred securely and that the overseas company receiving your information adheres to strict data protection standards in line with the Data Privacy Act of 2012.            </p>
          </div>
        )}
      </div>

      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection('secureInfo')}
      >
        10. How do we keep your information secure?
        {openSections.secureInfo && (
          <div style={{ ...collapsibleContentStyle, display: 'block' }}>
            <p>
              We implement a range of security measures, including encryption, access controls, and regular security assessments, to protect your personal information from unauthorized access, disclosure, or misuse. Only authorized personnel with a legitimate need to access your data are allowed to do so.
            </p>
          </div>
        )}
      </div>

      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection('languages')}
      >
        11. Languages
        {openSections.languages && (
          <div style={{ ...collapsibleContentStyle, display: 'block' }}>
            <p>
              This Privacy Policy is available in multiple languages for your convenience. In the event of any discrepancies or conflicts between different language versions, the English version shall prevail as the authoritative document.
            </p>
          </div>
        )}
      </div>

      <div
        style={collapsibleSectionStyle}
        onClick={() => toggleSection('definitions')}
      >
        12. Definitions
        {openSections.definitions && (
          <div style={{ ...collapsibleContentStyle, display: 'block' }}>
            <p>
              For the purposes of this Privacy Policy, the following terms shall have the meanings ascribed to them below:
            </p>
            <ul>
              <li><strong>“Personal Information”:</strong> Any information that identifies, relates to, describes, or could reasonably be linked, directly or indirectly, with a particular individual.</li>
              <li><strong>“Sensitive Personal Information”:</strong> A subset of personal information that includes information about an individual’s health, disability status, or any other data considered sensitive under applicable laws.</li>
              <li><strong>“Data Controller”:</strong> The entity that determines the purposes for which and the means by which personal data is processed.</li>
              <li><strong>“Processing”:</strong> Any operation or set of operations performed on personal data, such as collection, recording, organization, structuring, storage, adaptation, alteration, retrieval, consultation, use, disclosure, dissemination, or destruction.</li>
              <li><strong>“Users”, “You”:</strong> Refers to individuals who access or use the PWDka platform, including but not limited to registered account holders.</li>
              <li><strong>“Registered User”:</strong> A user who has completed the registration process on the PWDka platform, providing the required personal information, and who has been granted access to additional services and features.</li>
              <li><strong>“PWDka”:</strong> Refers to the platform developed by us, aimed at empowering persons with disabilities (PWDs) by providing accessible services and resources tailored to their needs.</li>
              <li><strong>“Job Listings”:</strong> Refers to the employment opportunities posted by companies on the PWDka platform, which users can view and apply for.</li>
              <li><strong>“Data Privacy Act of 2012”:</strong> Refers to Republic Act No. 10173 of the Philippines, which is a comprehensive and strict privacy law that aims to protect all forms of information, be it private, personal, or sensitive.</li>
            </ul>
          </div>    

          
          
          
        )}
      </div>
    </div>
  );
}

export default PrivacyPolicy;
