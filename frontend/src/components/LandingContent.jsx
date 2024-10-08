import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingContent = () => {
  const navigate = useNavigate();
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  const handleGetStarted = () => {
    navigate("/signup");
  };

  // Function to play the welcome message
  const playWelcomeMessage = () => {
    const message = new SpeechSynthesisUtterance(
      "Welcome to pwe de ka, Empowering You to Find the Job You Deserve! - A web-based job search system for Persons with disabilities, if you already have an account click login, if not click get started."
    );
    message.lang = "en-US"; // Set the language to English (US)
    speechSynthesis.speak(message);
  };

  // Toggle voice message
  const handleToggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      playWelcomeMessage();
    } else {
      speechSynthesis.cancel(); // Stop any ongoing speech
    }
  };

  return (
    <div>
      <div className="bg-transparent pt-16 pr-4 pb-16 pl-4 flex mr-auto ml-auto flex-col items-center relative lg:flex-row lg:py-32 xl:py-48 md:px-8 max-w-screen-2xl">
        <div className="flex justify-center items-center w-full h-full overflow-hidden lg:w-1/2 lg:justify-end lg:bottom-0 lg:left-0 lg:items-center">
          <img
            src="/imgs/landing photo.png"
            className="object-contain object-top lg:w-auto lg:h-full w-full h-auto"
          />
        </div>
        <div className="mr-auto ml-auto flex justify-end relative max-w-xl xl:pr-32 lg:max-w-screen-xl">
          <div className="mb-16 lg:pr-5 lg:max-w-lg lg:mb-0">
            <div className="mb-6 max-w-xl">
              <p className="inline-block pt-1 pr-3 pb-1 pl-3 mb-4 text-pink-200 bg-pink-500 rounded-2xl uppercase text-xs font-semibold tracking-wider">
                Get Hired!
              </p>
              <div className="text-3xl font-bold tracking-tight text-gray-900 max-w-lg sm:text-4xl sm:leading-none mb-6">
                <p className="text-black text-3xl font-'bold' tracking-tight sm:text-4xl sm:leading-none">
                  Exclusive Jobs For You{" "}
                </p>
                <p className="inline-block text-black text-3xl font-bold tracking-tight mr-2 sm:text-4xl sm:leading-none">
                  Using
                </p>
                <p className="inline-block text-blue-500 text-3xl font-bold tracking-tight sm:text-4xl sm:leading-none">
                  PWDKa!
                </p>
              </div>
              <p className="text-gray-700 text-base md:text-lg">
                {" "}
                Dedicated job listing platform designed to connect persons with
                disabilities with inclusive employers. Our mission is to empower
                individuals by providing access to meaningful employment
                opportunities, tailored to their unique skills and needs. Join
                us in fostering an inclusive workforce and unlocking potential
                across all abilities.{" "}
              </p>
            </div>

            <div className="flex items-center mt-4 mr-0 mb-0 ml-0">
              <button
                onClick={handleGetStarted}
                className="transition duration-200 hover:bg-blue-900 focus:shadow-outline focus:outline-none bg-blue-700 text-white inline-flex font-semibold tracking-wide text-medium h-12 shadow-md items-center justify-center pr-6 pl-6 mr-6 rounded-lg"
              >
                <span className="material-symbols-outlined text-xl mr-4">
                  not_started
                </span>
                Get Started
              </button>
              <a
                href="/login"
                className="text-black items-center inline-flex font-semibold pt-2 pr-2 pb-2 pl-2 transition-colors duration-200 hover:text-blue-300"
              >
                <span className="material-symbols-outlined text-xl mr-4">
                  login
                </span>
                <p>Login</p>
              </a>
              <button
                onClick={handleToggleVoice}
                className={`ml-6 p-2 rounded-full transition-colors duration-200 ${
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingContent;
