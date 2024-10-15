import React, { useState, useEffect } from "react";
import axios from "axios";

const ContactUs = () => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [userDisabilityType, setUserDisabilityType] = useState("");
  const [email, setEmail] = useState(""); // State for user's email
  const [subject, setSubject] = useState(""); // State for subject
  const [body, setBody] = useState(""); // State for message body
  const [formError, setFormError] = useState(""); // State for form validation errors
  const [formSuccess, setFormSuccess] = useState(""); // State for form success message

  useEffect(() => {
    const userId = sessionStorage.getItem("Id");

    const fetchUserDetails = () => {
      axios
        .get(`/user/view/${userId}`)
        .then((response) => {
          const userData = response.data.data;
          setUserDisabilityType(userData.type);
          setEmail(userData.email); // Assuming 'email' is part of the user's data
          // Optionally set a default subject or let the user enter their own
          setSubject(""); // Allow user to enter their subject
        })
        .catch((error) => {
          console.error("Error fetching user data:", error.response?.data);
        });
    };

    fetchUserDetails();
  }, []);

  // Function to play the Contact Us message
  const playContactMessage = () => {
    const message = new SpeechSynthesisUtterance(
      "This is the Contact Us page where we’re ready to connect. Reach out through the channels below. Click the email for any queries, and let’s build a more inclusive job market together."
    );
    message.lang = "en-US"; // Set the language to English (US)
    speechSynthesis.speak(message);
  };

  // Toggle voice message
  const handleToggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      playContactMessage();
    } else {
      speechSynthesis.cancel(); // Stop any ongoing speech
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation for body
    if (!body) {
      setFormError("Message body is required.");
      return;
    }

    // Send email data to the backend
    axios
      .post("/admin/email", { email, subject, body }) // Sending email, subject, and body to the backend
      .then((response) => {
        setFormSuccess("Your message has been sent successfully!");
        setFormError(""); // Clear any previous error
        setBody(""); // Clear the form
        setSubject(""); // Clear subject after submission
      })
      .catch((error) => {
        setFormError("Failed to send your message. Please try again.");
        setFormSuccess(""); // Clear any success message
      });
  };

  return (
    <>
      <section className="overflow-hidden bg-custom-bg sm:grid sm:grid-cols-2 sm:items-center">
        <div className="p-8 md:p-12 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-xl text-center ltr:sm:text-left rtl:sm:text-right">
            <div className="flex justify-between items-center">
              <h1 className="text-6xl font-bold text-custom-blue md:text-3xl">
                Questions? Contact Us!
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
            <p className="hidden text-gray-500 md:mt-4 md:block">
              Have any questions or need more information? We're here to help.
              Reach out to us, and we'll get back to you as soon as possible.
              Your inquiries are important to us, and we're eager to assist in
              making the job market more inclusive.
            </p>

            {/* Email form */}
            <div className="mt-4 md:mt-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Your Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 mt-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)} // Allow input in subject
                    className="w-full px-3 py-2 mt-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your subject" // Updated placeholder
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Body
                  </label>
                  <textarea
                    name="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full px-3 py-2 mt-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your message"
                    rows="4"
                    required
                  ></textarea>
                </div>

                {/* Show form error or success message */}
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
          src="\imgs\pwd2.jpg"
          className="h-full w-full object-cover sm:h-[calc(100%_-_2rem)] sm:self-end sm:rounded-ss-[30px] md:h-[calc(100%_-_4rem)] md:rounded-ss-[60px]"
        />
      </section>
    </>
  );
};

export default ContactUs;
