import React, { useState } from "react";

const ContactUs = () => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

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

  return (
    <>
      <section className="overflow-hidden bg-custom-bg sm:grid sm:grid-cols-2 sm:items-center">
        <div className="p-8 md:p-12 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-xl text-center ltr:sm:text-left rtl:sm:text-right">
            <div className="flex justify-between items-center">
              <h1 className="text-6xl font-bold text-custom-blue md:text-3xl">
                Questions? Contact Us!
              </h1>
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
            </div>
            <p className="hidden text-gray-500 md:mt-4 md:block">
              Have any questions or need more information? We're here to help.
              Reach out to us, and we'll get back to you as soon as possible.
              Your inquiries are important to us, and we're eager to assist in
              making the job market more inclusive.
            </p>

            <div className="mt-4 md:mt-8">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=pwdkateam@gmail.com"
                className="inline-block rounded bg-custom-blue px-12 py-3 text-sm font-medium text-white transition hover:bg-blue-300 focus:outline-none focus:ring focus:ring-yellow-400"
              >
                pwdkateam@gmail.com
              </a>
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
