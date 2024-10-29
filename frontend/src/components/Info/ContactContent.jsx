import { useState, useEffect } from "react";
import axios from "axios";
import Typewriter from "typewriter-effect";

const ContactUs = () => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [userDisabilityType, setUserDisabilityType] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

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
