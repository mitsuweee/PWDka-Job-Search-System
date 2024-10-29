import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Typewriter from "typewriter-effect";

const LandingContent = () => {
  const navigate = useNavigate();
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const handleEmployeeClick = () => {
    navigate("/signup");
  };

  const handleHireClick = () => {
    navigate("/signup");
  };

  const playWelcomeMessage = () => {
    const message = new SpeechSynthesisUtterance(
      "Welcome to PWDKa, Empowering You to Find the Job You Deserve! - A web-based job search system for Persons with disabilities. If you already have an account, click login. Otherwise, click get started."
    );
    message.lang = "en-US";
    speechSynthesis.speak(message);
  };

  const handleToggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      playWelcomeMessage();
    } else {
      speechSynthesis.cancel();
    }
  };

  return (
    <div>
      {/* Landing Section */}
      <div
        className="w-full h-screen bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('/imgs/pft.png')",
        }}
      >
        <div className="bg-transparent pt-16 pr-4 pb-16 pl-4 flex mr-auto ml-auto flex-col items-center relative lg:flex-row lg:py-32 xl:py-48 md:px-8 max-w-screen-2xl">
          <div className="flex justify-center items-center w-full h-full overflow-hidden lg:w-1/2 lg:justify-end lg:bottom-0 lg:left-0 lg:items-center">
            <img
              src="/imgs/lndpht.png"
              className="object-contain object-top lg:w-auto lg:h-full w-full h-auto shadow-xl"
            />
          </div>

          {/* Card for content */}
          <div className="mr-auto ml-auto flex justify-end relative max-w-xl xl:pr-32 lg:max-w-screen-xl">
            <div className="mb-16 lg:pr-5 lg:max-w-lg lg:mb-0 bg-white bg-opacity-90 shadow-lg rounded-2xl p-8">
              <div className="mb-6 max-w-xl">
                <p className="inline-block pt-1 pr-3 pb-1 pl-3 mb-4 text-pink-200 bg-pink-500 rounded-2xl uppercase text-xs font-semibold tracking-wider">
                  Get Hired!
                </p>
                {/* Typing Effect */}
                <div className="text-3xl font-bold tracking-tight text-gray-900 max-w-lg sm:text-4xl sm:leading-none mb-6">
                  <Typewriter
                    options={{
                      autoStart: true,
                      loop: true,
                      delay: 50,
                      strings: [
                        "Exclusive Jobs For You",
                        'Using <span style="color: #3b82f6;">PWDKa!</span>',
                      ],
                      wrapperClassName: "typewriter-wrapper",
                      cursorClassName: "typewriter-cursor",
                    }}
                  />
                </div>
                <p className="text-gray-700 text-base md:text-lg">
                  Dedicated job listing platform designed to connect persons
                  with disabilities with inclusive employers. Our mission is to
                  empower individuals by providing access to meaningful
                  employment opportunities, tailored to their unique skills and
                  needs. Join us in fostering an inclusive workforce and
                  unlocking potential across all abilities.
                </p>
              </div>

              <div className="flex items-center mt-4">
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

      {/* How to Apply for Jobs Section */}
      <div
        className="bg-cover bg-center bg-fixed py-20"
        style={{
          backgroundImage: "url('/imgs/pft.png')",
        }}
      >
        <h2 className="text-5xl font-bold text-center text-custom-blue mb-12">
          <Typewriter
            options={{
              autoStart: true,
              loop: true,
              delay: 50,
              strings: ["How to Apply for Jobs?"],
            }}
          />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 px-8 md:px-16 lg:px-24 xl:px-32">
          {[
            {
              icon: "person_add",
              title: "Create an Account",
              description:
                "Sign up by filling in your details, upload a clear photo of your government-issued ID, and take a verification selfie holding your ID.",
            },
            {
              icon: "verified",
              title: "Get Verified",
              description:
                "After providing your details, upload your ID and verification photo, and wait for an admin to review your application for access to inclusive job listings.",
            },
            {
              icon: "pageview",
              title: "Apply Online",
              description:
                "Select a job that matches your skills & disability and submit your application online, and wait for employer feedback.",
            },
            {
              icon: "check_circle",
              title: "Get Hired",
              description:
                "Companies will review your profile. Receive responses from employers and start your new journey.",
            },
          ].map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-6 bg-opacity-70 rounded-xl shadow-md border-2 border-blue-300 hover:border-blue-700 transition-all duration-300 transform hover:-translate-y-2"
              style={{
                height: "320px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              }}
            >
              <span className="material-symbols-outlined text-6xl text-blue-700 mb-6">
                {step.icon}
              </span>
              <h3 className="font-semibold text-2xl mb-2 text-gray-800">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm md:text-base px-4">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Employee & Hire People Section */}
      <section
        className="bg-cover bg-center bg-fixed py-20"
        style={{ backgroundImage: "url('/imgs/pft.png')" }}
      >
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            {/* Small Card for Title and Description */}
            <div className="inline-block bg-white p-6 rounded-3xl shadow-md border border-gray-200 ">
              <h2 className="text-4xl font-bold text-custom-blue">
                Get Started
              </h2>
              <p className="mt-4 max-w-md text-black">
                Whether you’re looking for a job or want to hire talent, start
                your journey with PWDKa today.
              </p>
            </div>
          </header>

          {/* Grid Container for Both Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative group">
              <a
                onClick={handleEmployeeClick}
                className="block overflow-hidden rounded-lg shadow-lg transition duration-500 transform group-hover:scale-105 cursor-pointer"
              >
                <img
                  src="./imgs/employ.jpg"
                  alt="Be an Employee"
                  className="w-full h-64 object-cover transition duration-500 group-hover:filter group-hover:grayscale"
                />
                <div className="absolute inset-0 flex flex-col items-start justify-end p-6 bg-black bg-opacity-30">
                  <h3 className="text-2xl font-semibold text-white">
                    Be an Employee
                  </h3>
                  <span className="mt-2 bg-blue-600 px-4 py-2 text-sm font-medium uppercase rounded-md  tracking-wide text-white transition duration-300 transform hover:bg-blue-700 hover:scale-105">
                    Get Started
                  </span>
                </div>
              </a>
            </div>

            <div className="relative group">
              <a
                onClick={handleHireClick}
                className="block overflow-hidden rounded-lg shadow-lg transition duration-500 transform group-hover:scale-105 cursor-pointer"
              >
                <img
                  src="./imgs/hire.jpg"
                  alt="Hire People"
                  className="w-full h-64 object-cover transition duration-500 group-hover:filter group-hover:grayscale"
                />
                <div className="absolute inset-0 flex flex-col items-start justify-end p-6 bg-black bg-opacity-30">
                  <h3 className="text-2xl font-semibold text-white">
                    Hire People
                  </h3>
                  <span className="mt-2 bg-blue-600 px-4 py-2 text-sm font-medium uppercase rounded-md tracking-wide text-white transition duration-300 transform hover:bg-blue-700 hover:scale-105">
                    Start Hiring
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingContent;
