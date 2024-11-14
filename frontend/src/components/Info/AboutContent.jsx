import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Typewriter from "typewriter-effect";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const AboutContent = () => {
  const sections = useRef([]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [userDisabilityType, setUserDisabilityType] = useState("");

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
    const companyId = localStorage.getItem("Id");

    const interval = setInterval(() => {
      checkUserStatus(userId);
      checkCompanyStatus(companyId);
    }, 5000);

    return () => clearInterval(interval);
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

  const playAboutMessage = () => {
    const message = new SpeechSynthesisUtterance(
      "This is the About Us page where you’ll discover the heart and soul of PWDKa. Join us as we turn possibilities into realities, one opportunity at a time."
    );
    message.lang = "en-US";
    speechSynthesis.speak(message);
  };

  const handleToggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      playAboutMessage();
    } else {
      speechSynthesis.cancel();
    }
  };

  return (
    <div className="bg-[url('/imgs/pft.png')] bg-cover bg-fixed bg-center min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      {/* New Section with Background Image and Buttons */}
      <section className="relative bg-[url('/imgs/wheelchair.jpg')] bg-cover bg-center bg-no-repeat">
        <div className="absolute inset-0 bg-gray-900/75 sm:bg-transparent sm:from-gray-900/95 sm:to-gray-900/25 ltr:sm:bg-gradient-to-r rtl:sm:bg-gradient-to-l"></div>

        <div className="relative mx-auto max-w-screen-xl px-4 py-32 sm:px-6 lg:flex lg:h-screen lg:items-center lg:px-8">
          <div className="max-w-xl text-left">
            <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
              <Typewriter
                options={{
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  strings: ["Hello! We Are", "Get Hired with", "Welcome to"],
                }}
              />
              <strong className="block font-extrabold text-blue-500">
                PWDka
              </strong>
            </h1>

            <p className="mt-4 max-w-lg text-white sm:text-xl">
              At PWDKa, our mission is to champion inclusivity and create
              meaningful opportunities for Persons with Disabilities (PWDs). We
              are driven by a vision of a world where every individual,
              regardless of ability, has equal access to career opportunities
              and professional growth.
            </p>

            <div className="mt-8 flex flex-wrap justify-start gap-4">
              <a
                href="#section1"
                className="block w-full rounded bg-blue-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring active:bg-blue-500 sm:w-auto"
              >
                Our Mission
              </a>

              <a
                href="#makers"
                className="block w-full rounded bg-white px-12 py-3 text-sm font-medium text-blue-600 shadow hover:text-blue-700 focus:outline-none focus:ring active:text-blue-500 sm:w-auto"
              >
                Developers
              </a>

              <button
                onClick={handleToggleVoice}
                className="block w-full rounded bg-yellow-500 px-12 py-3 text-sm font-medium text-white shadow hover:bg-yellow-600 focus:outline-none focus:ring active:bg-yellow-400 sm:w-auto"
              >
                {isVoiceEnabled ? "Disable Voice" : "Enable Voice"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1 */}
      <section id="section1" className="py-16">
        <div className="mx-auto max-w-screen-xl px-4 py-8 bg-white/90 rounded-lg shadow-lg sm:px-6 sm:py-12 lg:px-8">
          <div className="max-w-3xl mb-8">
            <h2 className="text-3xl text-custom-blue font-bold sm:text-4xl">
              Breaking Barriers, Building Futures
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="relative h-64 overflow-hidden sm:h-80 lg:h-full transition-transform duration-500 transform hover:scale-105">
              <img
                alt=""
                src="/imgs/pwd1.jpg"
                className="absolute inset-0 h-full w-full object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              />
            </div>

            <div className="lg:py-16">
              <div className="p-6 bg-white rounded-xl shadow-xl transition-transform duration-500 transform hover:scale-105 hover:bg-blue-50">
                <article className="space-y-6 text-black text-lg">
                  <p>
                    <span className="text-2xl font-bold text-blue-500">
                      Our mission
                    </span>
                    &nbsp; is to create inclusive opportunities for persons with
                    disabilities, recognizing their potential and the value they
                    bring. We are dedicated to fostering a supportive
                    environment where diverse talents can thrive, driving
                    innovation and success for both individuals and a company.
                  </p>

                  <p>
                    Our commitment goes beyond just offering opportunities; it
                    extends to reshaping mindsets and challenging stereotypes,
                    showing that diversity, particularly the inclusion of
                    persons with disabilities, is a vital driver of growth,
                    excellence, and resilience in today’s evolving world. We
                    believe that an inclusive workplace leads to a stronger,
                    more dynamic workforce, and in turn, a better future for
                    all.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className="py-16">
        <div className="mx-auto max-w-screen-xl px-4 py-8 bg-white/90 rounded-lg shadow-lg sm:px-6 sm:py-12 lg:px-8">
          <div className="max-w-3xl mb-8">
            <h2 className="text-3xl font-bold sm:text-4xl text-[#007bff] text-center lg:text-left">
              Unlock Potential, Amplify Success
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="lg:order-last relative h-64 overflow-hidden sm:h-80 lg:h-full transition-transform duration-500 transform hover:scale-105">
              <img
                alt=""
                src="/imgs/pwd3.jpg"
                className="absolute inset-0 h-full w-full object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              />
            </div>

            <div className="lg:py-16">
              <div className="p-6 bg-white rounded-xl shadow-xl transition-transform duration-500 transform hover:scale-105 hover:bg-blue-50">
                <article className="space-y-6 text-black text-lg">
                  <p>
                    <span className="text-2xl font-bold text-blue-500">
                      We envision
                    </span>
                    &nbsp; a future where businesses harness the unique
                    strengths of persons with disabilities, leading to enhanced
                    creativity and growth. Our goal is to create pathways that
                    drive mutual success and progress, fostering a culture of
                    inclusivity that enriches organizations and transforms
                    industries.
                  </p>

                  <p>
                    By integrating diverse talents, we help companies unlock
                    their full potential and achieve sustainable success.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Makers Section */}
      <div
        id="makers"
        className="w-full bg-custombg pt-16 pr-4 pb-16 pl-4 mt-0 mr-auto mb-0 ml-auto sm:max-w-xl md:max-w-full md:px-24 lg:px-8 lg:py-20"
      >
        <div className="mt-0 mr-auto mb-10 ml-auto max-w-xl md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
          <div>
            <p className="pt-px pr-3 pb-px pl-3 mt-0 mr-0 mb-4 ml-0 text-xs font-semibold text-white bg-pink-500 inline-block tracking-wider uppercase rounded-full">
              Dream Team
            </p>
          </div>
          <div className="mt-0 mr-auto mb-6 ml-auto text-3xl font-bold leading-none text-gray-900 max-w-lg font-sans tracking-tight sm:text-4xl md:mx-auto">
            <div className="inline-block relative">
              <p className="text-3xl font-bold leading-none text-gray-900 relative inline max-w-lg font-sans tracking-tight sm:text-4xl md:mx-auto">
                The Makers.
              </p>
            </div>
          </div>
          <p className="text-base text-black md:text-lg">
            Introducing the 6 Students who made this Job Listing Web/Application
            possible. In Fulfillment of our Thesis in Centro Escolar
            University-Makati
          </p>
        </div>

        <div className="grid mt-0 mr-auto mb-0 ml-auto gap-10 row-gap-8 p-4 bg-white sm:row-gap-10 rounded-2xl lg:max-w-screen-lg sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Kyle Anakin Aguas",
              role: "Full stack Developer",
              img: "/imgs/kyle.jpg",
            },
            {
              name: "Carlos Miguel Bundac",
              role: "Lead Frontend UI UX Designer / Full stack Developer",
              img: "/imgs/ako.jpg",
            },
            {
              name: "Liv Andre Centeno",
              role: "Full stack Developer / Database Engineer / Backend Developer",
              img: "/imgs/liv.jpg",
            },
            {
              name: "Joshua Brioso",
              role: "Developer",
              img: "/imgs/briosos.jpg",
            },
            {
              name: "Kevin Allen Guia",
              role: "Frontend Developer",
              img: "/imgs/kev.jpg",
            },
            {
              name: "Ace Pleno",
              role: "Frontend Developer",
              img: "/imgs/ace.jpg",
            },
            // Add a placeholder to center Mitsui's card
            <div className="hidden lg:block"></div>,
            {
              name: "Mitsui Ortega",
              role: "Project Manager / Full Stack Developer / Integration Engineer",
              img: "/imgs/mits.jpg",
            },
          ].map((member, index) => (
            <div
              className="flex p-4 hover:scale-105 hover:shadow-xl transition-transform duration-300 ease-in-out rounded-xl bg-white items-center"
              key={member.name || index}
            >
              {member.img && (
                <>
                  <img
                    src={member.img}
                    className="shadow object-cover mt-0 mr-4 mb-0 ml-0 rounded-full w-24 h-24"
                    alt={member.name}
                  />
                  <div className="flex justify-center flex-col">
                    <p className="text-md font-bold text-[#007bff]">
                      {member.name}
                    </p>
                    <p className="text-sm text-black mt-0 mr-0 mb-4 ml-0">
                      {member.role}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutContent;
