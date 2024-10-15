import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const AboutContent = () => {
  const sections = useRef([]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [userDisabilityType, setUserDisabilityType] = useState("");

  useEffect(() => {
    const userId = sessionStorage.getItem("Id");

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
    <div>
      {/* New Section with Background Image and Buttons */}
      <section className="relative bg-[url('/imgs/wheelchair.jpg')] bg-cover bg-center bg-no-repeat">
        <div className="absolute inset-0 bg-gray-900/75 sm:bg-transparent sm:from-gray-900/95 sm:to-gray-900/25 ltr:sm:bg-gradient-to-r rtl:sm:bg-gradient-to-l"></div>

        <div className="relative mx-auto max-w-screen-xl px-4 py-32 sm:px-6 lg:flex lg:h-screen lg:items-center lg:px-8">
          <div className="max-w-xl text-left">
            <h1 className="text-3xl font-extrabold shadow-lg text-white sm:text-5xl">
              Hello! We Are
              <strong className="block font-extrabold text-blue-500">
                PWDka
              </strong>
            </h1>

            <p className="mt-4 max-w-lg shadow-lg text-white sm:text-xl">
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
            </div>
          </div>
        </div>
      </section>

      {/* Section 1 */}
      <section id="section1">
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl text-custom-blue font-bold sm:text-4xl">
              Breaking Barriers, Building Futures
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="relative h-64 overflow-hidden sm:h-80 lg:h-full">
              <img
                alt=""
                src="/imgs/pwd1.jpg"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            <div className="lg:py-16">
              <article className="space-y-4 text-black">
                <p>
                  Our mission is to create inclusive opportunities for persons
                  with disabilities, recognizing their potential and the value
                  they bring. We are dedicated to fostering a supportive
                  environment where diverse talents can thrive, driving
                  innovation and success for both individuals and a company.
                </p>

                <p>
                  Our commitment goes beyond just offering opportunities; it
                  extends to reshaping mindsets and challenging stereotypes,
                  showing that diversity, particularly the inclusion of persons
                  with disabilities, is a vital driver of growth, excellence,
                  and resilience in today’s evolving world. We believe that an
                  inclusive workplace leads to a stronger, more dynamic
                  workforce, and in turn, a better future for all.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section>
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl mb-4">
            <h2 className="text-3xl font-bold sm:text-4xl text-[#007bff] text-center lg:text-left">
              Unlock Potential, Amplify Success
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="lg:order-last relative h-64 overflow-hidden sm:h-80 lg:h-full">
              <img
                alt=""
                src="/imgs/pwd3.jpg"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            <div className="lg:py-16">
              <article className="space-y-4 text-gray-600">
                <p>
                  We envision a future where businesses harness the unique
                  strengths of persons with disabilities, leading to enhanced
                  creativity and growth. Our goal is to create pathways that
                  drive mutual success and progress, fostering a culture of
                  inclusivity that enriches organizations and transforms
                  industries.
                </p>

                <p>
                  By integrating diverse talents, we help companies unlock their
                  full potential and achieve sustainable success.
                </p>
              </article>
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
          <p className="text-base text-gray-700 md:text-lg">
            Introducing the 6 Students who made this Job Listing Web/Application
            possible. In Fulfillment of our Thesis in Centro Escolar
            University-Makati
          </p>
        </div>

        <div className="grid mt-0 mr-auto mb-0 ml-auto gap-10 row-gap-8 bg-custom-bg sm:row-gap-10 lg:max-w-screen-lg sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Kyle Anakin Aguas",
              role: "Frontend Developer",
              img: "/imgs/kyle.jpg",
            },
            {
              name: "Carlos Miguel Bundac",
              role: "Lead UI UX Designer / Full stack Developer",
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
              img: "/imgs/brioso.jpg",
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
            {
              name: "Mitsui Ortega",
              role: " Project Manager / Full Stack Developer / Integration Engineer ",
              img: "/imgs/mits.jpg",
            },
          ].map((member) => (
            <div
              className="flex p-4 hover:scale-105 hover:shadow-xl transition-transform duration-300 ease-in-out rounded-xl bg-custom-bg items-center"
              key={member.name}
            >
              <img
                src={member.img}
                className="shadow object-cover mt-0 mr-4 mb-0 ml-0 rounded-full w-24 h-24"
                alt={member.name}
              />
              <div className="flex justify-center flex-col">
                <p className="text-md font-bold text-[#007bff]">
                  {member.name}
                </p>
                <p className="text-sm text-gray-800 mt-0 mr-0 mb-4 ml-0">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutContent;
