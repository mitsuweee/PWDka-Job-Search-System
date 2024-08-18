  import React, { useEffect, useRef } from 'react';

  const AboutContent = () => {
    const sections = useRef([]);

    useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        });
      }, { threshold: 0.1 });

      sections.current.forEach(section => {
        observer.observe(section);
      });

      return () => {
        sections.current.forEach(section => {
          observer.unobserve(section);
        });
      };
    }, []);

    return (
      <div>
        <style>{`
          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .fade-in {
            opacity: 1;
            transform: translateY(0);
            animation: fadeIn 1s ease-out forwards;
          }

          .fade-in {
            opacity: 0;
            transform: translateY(20px);
          }

          .hover-effect {
            transition: transform 0.3s, box-shadow 0.3s;
          }

          .hover-effect:hover {
            transform: scale(1.05) rotate(1deg);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          }
          
          .button-hover {
            transition: background-color 0.3s, color 0.3s;
          }

          .button-hover:hover {
            background-color: transparent;
            color: #007bff;
            border-color: #007bff;
          }
        `}</style>

        <div className="mx-auto max-w-screen-2xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold  text-center font-sfprobold text-[#007bff]">About Us</h1>
          <h2 className="text-1xl lg:text-1xl xl:text-1xl font-bold  text-center font-sfprobold text-[#007bff]">Everything you need to know.</h2>
        </div>
        
        {/* Section 1 */}
        <section>
          <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:h-screen lg:grid-cols-2 gap-8">
              <div
                className="relative z-10 lg:py-16 rounded-3xl overflow-hidden shadow-lg bg-[#e3edf7] hover-effect fade-in"
                ref={(el) => (sections.current[0] = el)}
              >
                <div className="relative h-64 sm:h-80 lg:h-full rounded">
                  <img
                    alt=""
                    src="src/imgs/pwd1.jpg"
                    className="absolute inset-0 h-full w-full object-cover rounded-3xl hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <div
                className="relative flex items-center bg-gray-100 rounded-xl shadow-lg hover-effect fade-in"
                ref={(el) => (sections.current[1] = el)}
              >
                <span className="hidden lg:absolute lg:inset-y-0 lg:-start-16 lg:block lg:w-16 lg:bg-gray-100 rounded-xl"></span>
                <div className="p-8 sm:p-16 lg:p-24">
                  <h2 className="text-2xl font-bold text-[#077bff] sm:text-3xl">
                    Breaking Barriers, Building Futures
                  </h2>
                  <p className="mt-4 text-gray-600">
                    Our mission is to create inclusive opportunities for persons with disabilities, recognizing their potential and the value they bring.
                    We are dedicated to fostering a supportive environment where diverse talents can thrive, driving innovation and success for both individuals and a company.
                  </p>
                  <a
                    href="#"
                    className="mt-8 inline-block rounded-lg border border-indigo-600 bg-[#007bff] px-12 py-3 text-sm font-medium text-white shadow-lg button-hover"
                  >
                    Get in Touch
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:h-screen lg:grid-cols-2 gap-8">
              <div
                className="relative z-10 lg:py-16 rounded-3xl overflow-hidden shadow-lg bg-[#e3edf7] hover-effect fade-in"
                ref={(el) => (sections.current[2] = el)}
              >
                <div className="relative h-64 sm:h-80 lg:h-full rounded">
                  <img
                    alt=""
                    src="src/imgs/pwd3.jpg"
                    className="absolute inset-0 h-full w-full object-cover rounded-2xl hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <div
                className="relative flex items-center bg-gray-100 rounded-xl shadow-lg hover-effect fade-in"
                ref={(el) => (sections.current[3] = el)}
              >
                <span className="hidden lg:absolute lg:inset-y-0 lg:-start-16 lg:block lg:w-16 lg:bg-gray-100 rounded-xl"></span>
                <div className="p-8 sm:p-16 lg:p-24">
                  <h2 className="text-2xl font-bold sm:text-3xl text-[#007bff]">
                    Unlock Potential, Amplify Success
                  </h2>
                  <p className="mt-4 text-gray-600">
                    We envision a future where businesses harness the unique strengths of persons with disabilities, leading to enhanced creativity and growth.
                    Our goal is to create pathways that drive mutual success and progress, fostering a culture of inclusivity that enriches organizations and transforms industries.
                    By integrating diverse talents, we help companies unlock their full potential and achieve sustainable success.
                  </p>
                  <a
                    href="#"
                    className="mt-8 inline-block rounded-lg border border-indigo-600 bg-[#007bff] px-12 py-3 text-sm font-medium text-white shadow-lg button-hover"
                  >
                    Get in Touch
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-white pt-0 pr-16 pb-0 pl-16"></div>
        
        <div className="w-full bg-custombg pt-16 pr-4 pb-16 pl-4 mt-0 mr-auto mb-0 ml-auto sm:max-w-xl md:max-w-full md:px-24 lg:px-8 lg:py-20">
          <div className="mt-0 mr-auto mb-10 ml-auto max-w-xl md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
            <div>
              <p className="pt-px pr-3 pb-px pl-3 mt-0 mr-0 mb-4 ml-0 text-xs font-semibold text-white bg-pink-500 inline-block tracking-wider uppercase rounded-full">Dream Team</p>
            </div>
            <div className="mt-0 mr-auto mb-6 ml-auto text-3xl font-bold leading-none text-gray-900 max-w-lg font-sans tracking-tight sm:text-4xl md:mx-auto">
              <div className="inline-block relative">
                <p className="text-3xl font-bold leading-none text-gray-900 relative inline max-w-lg font-sans tracking-tight sm:text-4xl md:mx-auto">The Makers.</p>
              </div>
            </div>
            <p className="text-base text-gray-700 md:text-lg">
              Introducing the 6 Students who made this Job Listing Web/Application possible.
              In Fulfillment of our Thesis in Centro Escolar University-Makati
            </p>
          </div>
          
          <div className="grid mt-0 mr-auto mb-0 ml-auto gap-10 row-gap-8 sm:row-gap-10 lg:max-w-screen-lg sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Kyle Anakin Aguas', role: 'Frontend/Backend Developer', img: 'src/imgs/kyle.jpg' },
              { name: 'Carlos Miguel Bundac', role: 'Frontend/UI UX Designer', img: 'src/imgs/ako.jpg' },
              { name: 'Liv Andre Centeno', role: 'Database/Backend Developer', img: 'src/imgs/liv.jpg' },
              { name: 'Joshua Brioso', role: 'Developer', img: 'src/imgs/brioso.jpg' },
              { name: 'Kevin Allen Guia', role: 'Frontend Developer', img: 'src/imgs/kev.jpg' },
              { name: 'Ace Pleno', role: 'Frontend Developer', img: 'src/imgs/ace.jpg' },
              { name: 'Mitsui Ortega', role: 'Tagautos/Buto', img: 'src/imgs/mits.jpg' },
            ].map((member) => (
              <div className="flex hover-effect rounded-xl" key={member.name}>
                <img src={member.img} className="shadow object-cover mt-0 mr-4 mb-0 ml-0 rounded-full w-20 h-20" />
                <div className="flex justify-center flex-col">
                  <p className="text-lg font-bold text-[#007bff]">{member.name}</p>
                  <p className="text-sm text-gray-800 mt-0 mr-0 mb-4 ml-0">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  export default AboutContent;
